# https://nfcpy.readthedocs.io/en/latest/topics/get-started.html

import nfc
import nfc.clf
import ndef
from nfc.clf import RemoteTarget
clf = nfc.ContactlessFrontend()
clf.open('tty:AMA0')
target = clf.sense(RemoteTarget('106A'), RemoteTarget('106B'), RemoteTarget('212F'))
print(target)
tag = nfc.tag.activate(clf, target)

record = []
record.append(ndef.TextRecord(repr({"tid": 10, "trand": 50}), "en"))


tag.ndef.records = record
clf.close()

