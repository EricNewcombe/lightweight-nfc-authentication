import nfc
import nfc.clf
import ndef
from nfc.clf import RemoteTarget

import requests
import json
from random import randint
import atexit


clf = None


def main():
    global clf
    cid = None
    crand = None

    print("Welcome to lightweight-nfc-authentication Client")
    print("Connecting to NFC Device...")
    try:
        clf = nfc.ContactlessFrontend()
        clf.open('tty:AMA0')
    except:
        print("Something went wrong! ")
        exit()

    # print once
    print("Welcome to the client device! \n General usage: ")
    print("Most common way would be to select 1 then 2 then 3. This will create a user, create a tag then authenticate the tag and user together. ")
    print("There's two BAD functions that can be used to test the validity of the functions. ")
    print("You can also read the tag's data as well as see all database entries. ")
    print("")

    while True:
        if cid is not None:
            print("\nCurrent client id: " + str(cid) + " Client Random: " + str(crand))

        printMainMenu()
        selection = int(input("Enter a number: "))

        if not isinstance(selection, int):
            print("Not a int!")

        else:
            if selection == 1:  # New User
                r = serverCall('/initialize-nfc/client', None).json()
                cid = int(r["cid"])
                crand = int(r["crand"])

                print("New user ID: " + str(cid))
                print("New user rand: " + str(crand))

            elif selection == 2:  # add new tag
                print("Click enter to write to tag")
                result = str(input(""))
                r = serverCall('/initialize-nfc/tag', None).json()
                tid = int(r["tid"])
                trand = int(r["trand"])

                print("Wrote to tag")
                writeTag(tid, trand)

                print("New tag ID: " + str(tid))
                print("New tag rand: " + str(trand))

            elif selection == 3:  # Auth user and Tag
                r = ""
                try:
                    print("Click enter to begin reading...")
                    result = str(input(""))
                    fields = readTag()
                    # print(str(fields))  # DEBUG: Print tag results

                    # hash of binary_tid + binary_trand (appended)
                    tReq = custHash(int(str(binToLen(int(fields["tid"]), 8)) + str(binToLen(int(fields["trand"]), 6)), 2))
                    # hash of binary_cid + binary_crand (appended)
                    dReq = custHash(int(str(binToLen(int(cid), 8)) + str(binToLen(int(crand), 6)), 2))
                    p = randint(4,8) #[4,8]
                    json = {"tReq": tReq, "dReq": dReq, "p":  p}
                    r = serverCallPOST('/auth/client', json).json()  # call to the server

                    print(str(r))  # rtn: { tRes: Int, dRes: Int, alpha: Int }

                    partialTagId = int('0b' + str(binToLen(int(fields["tid"]), 8))[-p:], 2)
                    newtrand = partialTagId ^ int(r["tRes"])
                    partialClientId = int('0b' + str(binToLen(int(cid), 8))[-p:], 2)
                    newdrand = partialClientId ^ int(r["dRes"])

                    # Update the returned random numbers
                    crand = newdrand
                    writeTag(fields["tid"], newtrand)
                except KeyError:
                    print(str(r))

            elif selection == 4:  # Auth tag only
                r = ""
                try:
                    print("Click enter to read tag")
                    result = str(input(""))
                    fields = readTag()
                    #  print(str(fields))  # DEBUG: Print tag results

                    # hash of binary_tid + binary_trand (appended)
                    tReq = custHash(int(str(binToLen(int(fields["tid"]), 8)) + str(binToLen(int(fields["trand"]), 6)), 2))

                    r_t = randint(0, 63) # [0, 63]
                    # trand XOR r_t (random number)
                    alpha = int(fields["trand"]) ^ r_t

                    json = {"tReq": tReq, "alpha": alpha}
                    r = serverCallPOST('/auth/tag', json).json()
                    print(str(r))  # rtn { beta: Int, tRes: Int }

                    newtrand = int(r["tRes"]) ^ r_t
                    writeTag(fields["tid"], newtrand) #update the tag
                except KeyError:
                    print(str(r))

            elif selection == 5:  # display all DB entries
                r = serverCall('/view-entries', None).json()
                print("Tags\n----------------------------------")
                for i in r["tags"]:
                    print(i)

                print("\nClients\n----------------------------------")
                for i in r["clients"]:
                    print(i)

            elif selection == 6:  # Read tag's data
                print("Click enter to read tag")
                result = str(input(""))
                print(str(readTag()))

            elif selection == 7:  # set the tag's trand value to 63
                print("BAD: CORRUPT THE TAG")
                print("What is the tag id to corrupt?")
                result = int(input("tid: "))
                if result > 0:
                    writeTag(result, 63)
                else:
                    print("Bad tag id, did not write. ")

            elif selection == 8:  # set the crand to 255.
                print("BAD: CORRUPTED THE USER's crand!")
                crand = 255

            elif selection == 9:  # exit
                close()
                exit()
            else:
                print("Invalid input")


def printMainMenu():
    print("----------------------------------")
    print("1. Create New User")
    print("2. Add a new tag")
    print("3. Authenticate Tag & User")
    print("4. Authenticate Tag Only")
    print("5. View All Entries (Client & Tag)")
    print("6. Read Tag Data Only")
    print("7. BAD: Corrupt Tag")
    print("8. BAD: Corrupt User")
    print("9. Exit program")

def custHash(n):
    return (n * 369) - 1


def custUnHash(n):
    return (n + 1) / 369


def binToLen(b, length):
    b = str(bin(b)).replace("0b","")
    final = ""
    for i in range(length-len(b)):
        final = final + "0"
    final = final + b
    return final


def serverCall(page, body):
    return requests.request("GET", 'http://pass.kyleknobloch.ca:3008' + str(page), json=body)


def serverCallPOST(page, body):
    return requests.request("POST", 'http://pass.kyleknobloch.ca:3008' + str(page), json=body)


def readTag():
    global clf
    try:
        target = clf.sense(RemoteTarget('106A'), RemoteTarget('106B'), RemoteTarget('212F'))
        tag = nfc.tag.activate(clf, target)
        records = tag.ndef.records[0].text
        return json.loads(records)
    except AttributeError:
        print("Unable to read tag. ")
        close()
        exit()


def writeTag(tid, trand):
    global clf
    try:
        target = clf.sense(RemoteTarget('106A'), RemoteTarget('106B'), RemoteTarget('212F'))
        tag = nfc.tag.activate(clf, target)

        record = [ndef.TextRecord("{\"tid\":" + str(tid) + ", \"trand\":" + str(trand) + "}", "en")]

        tag.ndef.records = record
    except AttributeError:
        print("Unable to write tag. ")
        close()
        exit()

def close():
    global clf
    clf.close()


# Register the exit function to close the connection to the NFC device to not cause issues down the line.
atexit.register(close)
main()
