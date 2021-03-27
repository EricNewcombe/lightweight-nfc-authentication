const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/nfc_auth', {useNewUrlParser: true});
let db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    mongoose.connection.db.dropDatabase(function(err, results){
        if (err) 
        {
            console.log('Error dropping database:');
            console.log(err);
            return;
        }
        console.log('Dropped database. Starting re-creation.');

        // Maybe add something to add the first client device below

        console.log("Database re-created.");
    });
});