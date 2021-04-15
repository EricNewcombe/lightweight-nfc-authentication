const dbHelper = require('../helpers/dbHelper');
const express = require('express');

let router = express.Router();

router.get('/', (req, res) => {

    console.log("Gathering data");

    const sqlQuery = `SELECT * FROM tags`
    dbHelper.all(sqlQuery, function(err, rows){
        if (err) {
            console.error(err);
            return res.status(500).send("Could not create new tag.");
        }
        return res.status(200).json(rows);
    });

    
});

module.exports = router;