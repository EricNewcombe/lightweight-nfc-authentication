const hashHelper = require('../helpers/hashHelper');
const binaryHelper = require('../helpers/binaryHelper');
const express = require('express');
const bodyParser = require('body-parser');

let router = express.Router();
let jsonParser = bodyParser.json({extended:false});

router.get('/', (req, res) => {
    res.send("Tag auth");
});

/* 
Expects a JSON object with the following format:
{
    tReq: Int,
    alpha: Int
}
*/
router.post('/', jsonParser, (req, res) => {
    let tReq, alpha = req.body;

    // TODO extract this from tReq
    let tagID, tagRandomValue;

    // Search Database for the hash (tReq) of tag_id, R'S_i
    // TODO hook up to database
    let result = true;

    // If no match, illegitimate and return an error
    // TODO probably come up with a less descript message to return to the client
    if ( !result ) { return res.status(400).json( { "errorMessage": "Match not found in database" } ); }

    // Extract R'_t by computing alpha XOR R'S_i
    let tagGeneratedRandom = binaryHelper.intXOR(alpha, tagRandomValue);

    // Generate new random number, R'S_i+1 for the tag
    // Compute Beta and T'_Res where Beta = H(R'S_i+1 || R'_t || R'S_i) and T_Res = R'S_i+1 XOR R'_t
    // Update shared secret (ID'_tag, R'S_i+1)
    // Respond with T_Res and Beta to device
})

module.exports = router;