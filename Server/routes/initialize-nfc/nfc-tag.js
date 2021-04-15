const hashHelper = require('../helpers/hashHelper');
const binaryHelper = require('../helpers/binaryHelper');
const dbHelper = require('../helpers/dbHelper');
const Tag = require('../../models/Tag');
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let router = express.Router();

router.get('/', (req, res) => {

    /* ==================
    *   Using Database  *
    ===================*/

    // Create a tag object using the data sent from the client

    console.log("Creating new tag");
    let trand = Math.floor(Math.random() * 64);
    let tag = new Tag(-1,trand);

    // Insert a new tag with new tRand value as the tag id will autoincrement
    const insertQuery = `INSERT INTO tags (trand) VALUES (${trand})`
    dbHelper.insertReturnId(insertQuery, function(err, lastID){
        if (err) {
            console.error(err);
            return res.status(500).send("Could not create new tag.");
        }

        // Set the tag object ID to the one assigned by the db
        tag.tid = lastID;

        // Return the object to the client
        return res.status(200).json(tag);
    });

    
});

module.exports = router;