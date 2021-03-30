const hashHelper = require('../helpers/hashHelper');
const binaryHelper = require('../helpers/binaryHelper');
const Tag = require('../../models/Tag');
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3');

let router = express.Router();
let jsonParser = bodyParser.json({extended:false});

router.get('/', (req, res) => {

    // let sampleDB = [1,2,3,4,5,200]; // TODO remove this when hooked up to database
    // let tagId = 1;

    // // Generate unique ID of device until a unique value not stored in database is found
    // while ( sampleDB.indexOf(tagId) !== -1 ) {
    //     console.log(`ID ${tagId} already exists, trying again`)
    //     tagId = Math.floor(Math.random() * 256); // For right now trying to make up to 256 unique tags
    // }

    // // Generate random value for device
    // let randomValue = Math.floor(Math.random() * 64); // Don't have to make this value that large

    // // Store in db

    // res.status(200).json( { tagId, randomValue } );
    
    /* ==================
    *   Using Database  *
    ===================*/

    // Create a tag object using the data sent from the client
    let tag = new Tag(req.body.tid, req.body.trand);

    // Connect to the db
    let db = sqlite3.Database('../../nfc_auth.db', function(err){
        // Report if an error has occurred
        if (err) {
            res.status(500).send("Could not connect to the database.");
            return;
        }

        // Using the provided tag ID, see if it already exists
        db.get("SELECT tid, trand FROM tags WHERE tid = ?", [tag.tid], function(err, row){
            // The tag does not exist
            if (err) {
                console.log("Creating new tag");
                tag.trand = Math.floor(Math.random() * 64); // Don't have to make this value that large
                
                // Create the new tag entity
                db.exec("INSERT INTO tags (trand) VALUES (?)", [trand], function(err){
                    if (err) {
                        res.status(500).send("Could not create new tag.");
                        return;
                    }
                    // Set the tag object ID to the one assigned by the db
                    tag.tid = this.lastID;
                    // Return the object to the client
                    res.status(200).json(tag);
                    return;
                });
            }

            res.status(200).send("Tag already exists"); // Might not want to notify client that they found a tag by its ID
        });
    });
});

module.exports = router;