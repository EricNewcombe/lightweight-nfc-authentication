const hashHelper = require('../helpers/hashHelper');

let express = require('express');
let router = express.Router();

router.get('/', (req, res) => {
    res.send("Client auth");
});

module.exports = router;