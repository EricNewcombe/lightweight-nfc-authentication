const hashHelper = require('../helpers/hashHelper');
const binaryHelper = require('../helpers/binaryHelper');
const express = require('express');
const bodyParser = require('body-parser');

let router = express.Router();
let jsonParser = bodyParser.json({extended:false});

router.get('/', (req, res) => {

    // let sampleDB = [1,2,3,4,5,200]; // TODO remove this when hooked up to database
    // let deviceId = 1;

    // // Generate unique ID of device until a unique value not stored in database is found
    // while ( sampleDB.indexOf(deviceId) !== -1 ) {
    //     console.log(`ID ${deviceId} already exists, trying again`)
    //     deviceId = Math.floor(Math.random() * 256); // For right now trying to make up to 256 unique clients
    // }

    // // Generate random value for device
    // let randomValue = Math.floor(Math.random() * 64); // Don't have to make this value that large

    // // Store in db

    // res.status(200).json( { deviceId, randomValue } );
    
    /* ==================
    *   Using Database  *
    ===================*/

    // Create a client object using the data sent from the client
    let client = new Client(req.body.cid, req.body.crand);

    // Connect to the db
    let db = sqlite3.Database('../../nfc_auth.db', function(err){
        // Report if an error has occurred
        if (err) {
            res.status(500).send("Could not connect to the database.");
            return;
        }

        // Using the provided client ID, see if it already exists
        db.get("SELECT cid, crand FROM clients WHERE cid = ?", [client.cid], function(err, row){
            // The client does not exist
            if (err) {
                console.log("Creating new client");
                client.crand = Math.floor(Math.random() * 64); // Don't have to make this value that large
                
                // Create the new client entity
                db.exec("INSERT INTO clients (crand) VALUES (?)", [crand], function(err){
                    if (err) {
                        res.status(500).send("Could not create new client.");
                        return;
                    }
                    // Set the client object ID to the one assigned by the db
                    client.cid = this.lastID;
                    // Return the object to the client
                    res.status(200).json(client);
                    return;
                });
            }

            res.status(200).send("client already exists"); // Might not want to notify client that they found a client by its ID
        });
    });
});

module.exports = router;