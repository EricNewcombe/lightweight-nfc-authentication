const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

let db = new sqlite3.Database('nfc_auth.db', function(err){
    if (err) {
        console.error(err.message);
    }

    console.log('Connected to the database.');
    let tables = fs.readFileSync(path.join('.', 'tables.sql'));
    let triggers = fs.readFileSync([ath.join('.', 'triggers.sql')]);
    db.run(tables, function(err){
        if (err) {
            console.error(err.message);
        }

        console.log('Created tables.');

        db.run(triggers, function(err){
            if (err) {
                console.error(err.message);
            }

            console.log('Created triggers');
        });
    });
});

db.close(function(err){
    if (err) {
        console.log(err.message);
    }

    console.log('Closed database connection.');
});