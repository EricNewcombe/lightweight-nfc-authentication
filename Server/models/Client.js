const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let ClientSchema = Schema({
    secret: {type: String, required: true}
});

module.exports = mongoose.model("Client", ClientSchema);