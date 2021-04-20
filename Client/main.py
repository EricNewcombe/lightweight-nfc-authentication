import nfc
import nfc.clf
import ndef
from nfc.clf import RemoteTarget

import requests
import json
from random import randint

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

    while True:
        if cid != None:
            print("\nCurrent client id: " + str(cid))
        printMainMenu()
        selection = int(input("Enter a number: "))

        if not isinstance(selection, int):
            print("Not a int!")
        else: # Save to continue!
            if selection == 1: # New User
                r = serverCall('/initialize-nfc/client', None).json()
                cid = int(r["cid"])
                crand = int(r["crand"])

                print("New user ID: " + str(cid))
                print("New user rand: " + str(crand))

            elif selection == 2: #Auth user and Tag
                print("Click enter to begin reading ag")
                result = str(input(""))
                fields = readTag() #json
                print(str(fields))
                print("Call to server")

                # hash of binary_tid + binary_trand (appended)
                tReq = custHash(int(str(binToLen(int(fields["tid"]), 8)) + str(binToLen(int(fields["trand"]), 6)), 2))
                # hash of binary_cid + binary_crand (appended)
                dReq = custHash(int(str(bin(int(cid))) + str(binToLen(bin(int(crand)), 6)), 2))
                p = randint(4,9) #[4,8]
                json = {"tReq": tReq, "dReq": dReq, "p":  p}
                r = serverCall('/auth/client', json)


                #rtn: { tRes: Int, dRes: Int, alpha: Int }
                partialTagId = int('0b' + str(binToLen(bin(int(fields["tid"])), 8))[-p:], 2)
                newtrand = partialTagId ^ int(r["tReq"])
                partialClientId = int('0b' + str(binToLen(bin(int(cid)), 8))[-p:], 2)
                newdrand = partialClientId ^ int(r["dRes"])


                crand = newdrand

                writeTag(fields["tid"], newtrand)


            elif selection == 3: #add new tag
                print("Click enter to write to tag")
                result = str(input(""))
                r = serverCall('/initialize-nfc/tag', None).json()
                tid = int(r["tid"])
                trand = int(r["trand"])

                print("Wrote to tag")
                writeTag(tid, trand)

                print("New tag ID: " + str(tid))
                print("New tag rand: " + str(trand))

            elif selection == 4:
                r = serverCall('/view-entries', None).json()
                print("Tags\n----------------------------------")
                for i in r["tags"]:
                    print(i)

                print("\nClients\n----------------------------------")
                for i in r["clients"]:
                    print(i)

            elif selection == 5:
                clf.close()
                exit()
            else:
                print("Invalid input")


def printMainMenu():
    print("----------------------------------")
    print("1. Create New User")
    print("2. Authenticate Tag & User")
    print("3. Add a new tag")
    print("4. View All Entries (Client & Tag)")
    print("5. Exit program")

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


def readTag():
    global clf
    target = clf.sense(RemoteTarget('106A'), RemoteTarget('106B'), RemoteTarget('212F'))
    tag = nfc.tag.activate(clf, target)
    records = tag.ndef.records[0].text
    return json.loads(records)


def writeTag(tid, trand):
    global clf
    target = clf.sense(RemoteTarget('106A'), RemoteTarget('106B'), RemoteTarget('212F'))
    tag = nfc.tag.activate(clf, target)

    record = [ndef.TextRecord("{\"tid\":" + str(tid) + ", \"trand\":" + str(trand) + "}", "en")]

    tag.ndef.records = record


main()