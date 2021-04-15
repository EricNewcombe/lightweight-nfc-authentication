const express = require('express');
const dbHelper = require('../helpers/dbHelper');
const Client = require('../../models/Client');

let router = express.Router();

router.get('/', (req, res) => {
    
    console.log("Creating new client");
    const  crand = Math.floor(Math.random() * 64); // Don't have to make this value that large
    let client = new Client(-1, crand);
    
    // Create the new client entity
    const insertQuery = `INSERT INTO clients (crand) VALUES (${crand})`
    dbHelper.insertReturnId(insertQuery, function(err, lastID){
        
        if (err) {
            res.status(500).send("Could not create new client.");
            return;
        }
        // Set the client object ID to the one assigned by the db
        client.cid = lastID;
        // Return the object to the client
        res.status(200).json(client);
        return;

    });

});

module.exports = router;