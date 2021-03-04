const hashHelper = require('../helpers/hashHelper');
const binaryHelper = require('../helpers/binaryHelper');
const express = require('express');
const bodyParser = require('body-parser');

let router = express.Router();
let jsonParser = bodyParser.json({extended:false});

router.get('/', (req, res) => {

    // Temporarily here to give stuff to test functionality
    rs_i = 9;
    r_t = 18;
    tagID = 27;

    let rs_i1 = Math.floor(Math.random() * 64);

    console.log(`rs_i: ${rs_i}, r_t: ${r_t}, rs_i1: ${rs_i1}, `)

    let rs_i1Binary = binaryHelper.setBinaryStringLength(binaryHelper.intToBinaryString(rs_i1), 6) // R'S_i+1
    let r_tBinary = binaryHelper.setBinaryStringLength(binaryHelper.intToBinaryString(r_t), 6) // R'_t
    let rs_iBinary = binaryHelper.setBinaryStringLength(binaryHelper.intToBinaryString(rs_i), 6); // RS_i
    let betaBinary = rs_i1Binary + r_tBinary + rs_iBinary;
    let betaNumber = binaryHelper.binaryStringToInt(betaBinary)
    let betaHash = hashHelper.hashInteger( betaNumber );

    let tagIDBinary = binaryHelper.setBinaryStringLength( binaryHelper.intToBinaryString(tagID), 8 );

    let alphaBinary = tagIDBinary + rs_iBinary
    let alphaNumber = binaryHelper.binaryStringToInt(alphaBinary);
    let alphaHash = hashHelper.hashInteger( alphaNumber );

    let tRes = binaryHelper.intXOR(rs_i1, r_t);

    res.status(200).json( { tagID, tagIDBinary, rs_i, rs_iBinary,  alphaBinary, alphaNumber, alphaHash, rs_i1, rs_i1Binary, r_t, r_tBinary,   betaBinary, betaNumber, betaHash, tRes } );
});

/* 
Expects a JSON object with the following format:
{
    tReq: Int, Hashed value of Tag ID and its RS_i (Random i'th value). tagID is 8 bits long, random number is 6 bits long
    alpha: Int
}
*/
router.post('/', jsonParser, (req, res) => {

    let {tReq, alpha} = req.body;

    console.log(tReq, alpha)

    // Extract the tagId and tagRandomValue from the tReq
    let alphaUnhashed = hashHelper.readHash(alpha);
    console.log(`Unhashed alpha: ${alphaUnhashed}`);

    let unhashedBinaryString = binaryHelper.intToBinaryString(alphaUnhashed);
    
    // Make sure the alpha binary string is 14 so that all data is preserved
    unhashedBinaryString = binaryHelper.setBinaryStringLength(unhashedBinaryString, 14);
    console.log(`Binary String: ${unhashedBinaryString}`);

    let tagIdBinaryString = unhashedBinaryString.substring(0,8);
    let rs_iBinary = unhashedBinaryString.substring(8); // RS_i
    console.log(`Tag binary String: ${tagIdBinaryString}`);
    console.log(`rs_i binary: ${rs_iBinary}`);

    let tagID = binaryHelper.binaryStringToInt(tagIdBinaryString);
    let rs_i = binaryHelper.binaryStringToInt(rs_iBinary);
    console.log(`Tag int: ${tagID}`);
    console.log(`rs_i int: ${rs_i}`);

    // Search Database for the hash (tReq) of tag_id, R'S_i
    // TODO hook up to database
    let result = true;

    // If no match, illegitimate and return an error
    // TODO probably come up with a less descript message to return to the client
    if ( !result ) { return res.status(400).json( { "errorMessage": "Match not found in database" } ); }

    // Extract R'_t by computing alpha XOR R'S_i
    let r_t = binaryHelper.intXOR(tReq, rs_i); // R'_t
    console.log(`r_t: ${r_t}`);

    // Generate new random number, R'S_i+1 for the tag
    let rs_i1 = Math.floor(Math.random() * 64);
    console.log(`rs_i+1: ${rs_i1}`);

    // Compute Beta and T'_Res where Beta = H(R'S_i+1 || R'_t || R'S_i) and T_Res = R'S_i+1 XOR R'_t

    let rs_i1Binary = binaryHelper.intToBinaryString(rs_i1) // R'S_i+1
    let r_tBinary = binaryHelper.intToBinaryString(r_t) // R'_t
    console.log(`rs_i1 binary: ${rs_i1Binary}`);
    console.log(`r_t binary: ${r_tBinary}`);

    rs_i1Binary = binaryHelper.setBinaryStringLength(rs_i1Binary, 6) 
    r_tBinary = binaryHelper.setBinaryStringLength(r_tBinary, 6) 
    console.log(`rs_i1 binary after resize: ${rs_i1Binary}`);
    console.log(`r_t binary after resize: ${r_tBinary}`);

    let betaBinary = rs_i1Binary + r_tBinary + rs_iBinary;
    console.log(`beta binary: ${betaBinary}`);

    let betaInt = binaryHelper.binaryStringToInt(betaBinary);
    console.log(`Beta int: ${betaInt}`)

    let beta = hashHelper.hashInteger( betaInt );
    console.log(`Beta hash: ${beta}`);

    let tRes = binaryHelper.intXOR(rs_i1, r_t);
    console.log(`tRes: ${tRes}`);

    // Update shared secret (ID'_tag, R'S_i+1)
    // Respond with T_Res and Beta to device

    res.status(200).json( { beta, tRes } );
})

module.exports = router;