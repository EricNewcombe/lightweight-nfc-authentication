const hashHelper = require('../helpers/hashHelper');
const binaryHelper = require('../helpers/binaryHelper');
const express = require('express');
const bodyParser = require('body-parser');

let router = express.Router();
let jsonParser = bodyParser.json({extended:false});

router.get('/', (req, res) => {

    let sampleDB = [1,2,3,4,5,200]; // TODO remove this when hooked up to database
    let deviceId = 1;

    // Generate unique ID of device until a unique value not stored in database is found
    while ( sampleDB.indexOf(deviceId) !== -1 ) {
        console.log(`ID ${deviceId} already exists, trying again`)
        deviceId = Math.floor(Math.random() * 256); // For right now trying to make up to 256 unique clients
    }

    // Generate random value for device
    let randomValue = Math.floor(Math.random() * 64); // Don't have to make this value that large

    // Store in db

    res.status(200).json( { deviceId, randomValue } );
    
});

module.exports = router;