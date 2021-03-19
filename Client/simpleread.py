# https://nfcpy.readthedocs.io/en/latest/topics/get-started.html

import nfc
import nfc.clf 
clf = nfc.ContactlessFrontend()
clf.open('tty:AMA0')
target = clf.sense(RemoteTarget('106A'), RemoteTarget('106B'), RemoteTarget('212F'))
print(target)
tag = nfc.tag.activate(clf, target)
print(tag)
print(tag.ndef.records)
