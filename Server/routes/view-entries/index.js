const dbHelper = require('../helpers/dbHelper');
const express = require('express');

let router = express.Router();

router.get('/', (req, res) => {

    console.log("Gathering data");

    const tagsSQLQuery = `SELECT * FROM tags`;
    const clientsSQLQuery = `SELECT * FROM clients`;
    dbHelper.all(tagsSQLQuery, function(err, tags){
        if (err) {
            console.error(err);
            return res.status(500).send("Could not retrieve tags.");
        }
        dbHelper.all(clientsSQLQuery, function(err, clients){
            if (err) {
                console.error(err);
                return res.status(500).send("Could not retrieve clients.");
            }
            return res.status(200).json({tags, clients});
        });
    });

    
});

module.exports = router;