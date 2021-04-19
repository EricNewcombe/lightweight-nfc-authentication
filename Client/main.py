import nfc
import nfc.clf
import requests

def main():

    cid = None
    crand = None




    print("Welcome to lightweight-nfc-authentication Client")
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

            elif selection == 2:
                print("Click enter to begin reading tag")
                result = str(input(""))
                fields = readTag()
                print(str(fields))
                print("Call to server")
                print("server result")
                print("call to write tag new tRAND")
            elif selection == 3:
                print("Click enter to write to tag")
                result = str(input(""))
                r = serverCall('/initialize-nfc/tag', None).json()
                tid = int(r["tid"])
                trand = int(r["trand"])


                print("Wrote to tag")

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
            else:
                print("Invalid input")





def printMainMenu():
    print("----------------------------------")
    print("1. Create New User")
    print("2. Authenticate Tag & User")
    print("3. Add a new tag")
    print("4. View All Entries (Client & Tag)")

def serverCall(page, body):
    return requests.request("GET", 'http://pass.kyleknobloch.ca:3008' + str(page), json=body)

def readTag():

    clf = nfc.ContactlessFrontend()
    clf.open('tty:AMA0')
    target = clf.sense(RemoteTarget('106A'), RemoteTarget('106B'), RemoteTarget('212F'))
    #print(target)
    tag = nfc.tag.activate(clf, target)
    #print(tag)
    records = tag.ndef.records
    clf.close()
    return records

def wrtieTag():
    print("Write to me!")



main()