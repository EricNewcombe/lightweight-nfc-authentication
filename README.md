# lightweight-nfc-authentication
Final Project for COMP4203. We are implementing a nfc tag and device authentication protocol based on this paper: https://ieeexplore-ieee-org.proxy.library.carleton.ca/document/7153937 

### Authors
Christian Belair, Kyle Knobloch, Eric Newcombe

## Requierments
* Python & PIP
* NodeJS & NPM
* A NFC card reader & writer
  * We use this: [PN532 NFC/RFID controller breakout board - v1.6](https://www.buyapi.ca/product/pn532-nfcrfid-controller-breakout-board-v1-6-2/) on a RaspberryPi in UART mode. 

## Installing & Running the Server
Open the Server folder, install the needed packages and then run the app. 

```bash
cd ./Server

npm install

nodejs app.js
```

## Installing & Running the Client
Open the Client folder, install the needed python packaged then run the python client. 
```bash
cd ./Client

pip install nfcpy

python main.py
```

Note: nfcpy requieres libusb, more info can be found on the [nfcpy documentation](https://nfcpy.readthedocs.io/en/latest/topics/get-started.html).

