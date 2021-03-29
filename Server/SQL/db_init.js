const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

let db = new sqlite3.Database('../nfc_auth.db', function(err){
    if (err) {
        console.error(err.message);
    }

    console.log('Connected to the database.');
    let tables = fs.readFileSync(path.join('.', 'tables.sql'), {encoding: 'utf8', flag: 'r'});
    let triggers = fs.readFileSync(path.join('.', 'triggers.sql'), {encoding: 'utf8', flag: 'r'});
    db.exec(tables, function(err){
        if (err) {
            console.error(err.message);
        }

        console.log('Created tables.');

        db.exec(triggers, function(err){
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