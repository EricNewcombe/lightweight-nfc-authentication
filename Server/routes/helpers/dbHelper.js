const path = require('path');
const { get } = require('../client-auth');
const sqlite3 = require('sqlite3').verbose(); 

const dbPath = path.join(__dirname, '..', '..', 'nfc_auth.db');


let db = new sqlite3.Database(dbPath, function(err){
    if ( err ) { console.error("Error establishing connection to database"); }
});


function exec( sqlQuery, callback ) {
    db.exec( sqlQuery, function(err) {
        if ( err ) { return callback(err); }
        return callback(false);
    });
}

function run( sqlQuery, callback ) {
    db.run(sqlQuery, function(err) {
        if ( err ) { return callback(err); }
        return callback(false);
    });
}

function all( sqlQuery, callback ) {
    db.all( sqlQuery, function(err, rows) {
        if ( err ) { return callback(err, null); }
        return callback(false, rows);
    });
}

function getRow( sqlQuery, callback ) {
    db.get( sqlQuery, function(err, row) {
        if ( err ) { return callback(err, null); }
        return callback(err, row);
    })
}

function insertReturnId( sqlQuery, callback ) {
    db.run(sqlQuery, function(err) {
        if ( err ) { return callback(err); }
        return callback(false, this.lastID);
    });
}

module.exports = {run, all, exec, getRow, insertReturnId}