const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let TagSchema = Schema({
    secret: {type: String, required: true}
});

module.exports = mongoose.model("Tag", TagSchema);