const hashHelper = require('../helpers/hashHelper');
const binaryHelper = require('../helpers/binaryHelper');
const dbHelper = require('../helpers/dbHelper');
const Tag = require('../../models/Tag');
const express = require('express');
const bodyParser = require('body-parser');

let router = express.Router();
let jsonParser = bodyParser.json({extended:false});

const logTag = "Tag-Auth";

router.get('/', (req, res) => {
    return res.send("Tag-Auth");
});

router.post('/get-test-data', jsonParser, (req, res) => {

    const {rs_i, r_t, tagID} = req.body;

    // Check to make sure all variables required were sent
    if ( rs_i === null || rs_i === undefined ) { return res.status(400).json( { "error": true, "errorMessage": "Missing rs_i in data object sent" } ); }
    if ( r_t === null || r_t === undefined ) { return res.status(400).json( { "error": true, "errorMessage": "Missing r_t in data object sent" } ); }
    if ( tagID === null || tagID === undefined ) { return res.status(400).json( { "error": true, "errorMessage": "Missing tagID in data object sent" } ); }
    
    // Check to make sure all variables are correct type
    if ( !Number.isInteger(rs_i) ) { return res.status(400).json( { "error": true, "errorMessage": "Invalid input, expected int for rs_i" } ); }
    if ( !Number.isInteger(r_t) ) { return res.status(400).json( { "error": true, "errorMessage": "Invalid input, expected int for r_t" } ); }
    if ( !Number.isInteger(tagID) ) { return res.status(400).json( { "error": true, "errorMessage": "Invalid input, expected int for tagID" } ); }

    const r_tBinaryString = binaryHelper.setBinaryStringLength(binaryHelper.intToBinaryString(r_t), 6) // R'_t
    const rs_iBinaryString = binaryHelper.setBinaryStringLength(binaryHelper.intToBinaryString(rs_i), 6); // RS_i
    const tagIDBinaryString = binaryHelper.setBinaryStringLength( binaryHelper.intToBinaryString(tagID), 8 );

    const tReqBinaryString = binaryHelper.appendBinaryStrings(tagIDBinaryString,rs_iBinaryString);

    const alphaInt = binaryHelper.intXOR(rs_i,r_t);
    const alphaBinaryString = binaryHelper.intToBinaryString(alphaInt);

    const tReqInt = binaryHelper.binaryStringToInt(tReqBinaryString);
    
    const tReqHash = hashHelper.hashInteger(tReqInt);
    const alpha = binaryHelper.binaryStringToInt(alphaBinaryString);
    
    
    res.status(200).json( { r_tBinaryString, rs_iBinaryString, tagIDBinaryString, tReqBinaryString, alphaBinaryString, tReqInt, tReqHash, alpha } );
})

/* 
Expects a JSON object with the following format:
{
    tReq: Int, Hashed value of Tag ID and its RS_i (Random i'th value). tagID is 8 bits long, random number is 6 bits long
    alpha: Int
}
*/
router.post('/', jsonParser, (req, res) => {
    
    const {tReq, alpha} = req.body;
    console.log(`[${logTag}] tReqHashed: ${tReq}, alpha: ${alpha}`);

    // Check to make sure the variables were sent in the json data object
    if ( tReq === null || tReq === undefined ) { return res.status(400).json( { "error": true, "errorMessage": "Missing tReq in data object sent" } ); }
    if ( alpha === null || alpha === undefined ) { return res.status(400).json( { "error": true, "errorMessage": "Missing alpha in data object sent" } ); }

    // Check to make sure that the variables are of the correct type
    if ( !Number.isInteger(tReq) ) { return res.status(400).json( { "error": true, "errorMessage": "Invalid input, expected int for tReq" } ); }
    if ( !Number.isInteger(alpha) ) { return res.status(400).json( { "error": true, "errorMessage": "Invalid input, expected int for alpha" } ); }

    // Extract the tagId and tagRandomValue from the tReq
    const tReqUnhashed = hashHelper.readHash(tReq);
    console.log(`[${logTag}] Unhashed tReq: ${tReqUnhashed}`);

    let tReqBinaryString = binaryHelper.intToBinaryString(tReqUnhashed);
    
    // Make sure the alpha binary string is 14 so that all data is preserved
    tReqBinaryString = binaryHelper.setBinaryStringLength(tReqBinaryString, 14);
    console.log(`[${logTag}] Alpha Binary String: ${tReqBinaryString}`);

    const tagIdBinaryString = tReqBinaryString.substring(0,8);
    const rs_iBinaryString = tReqBinaryString.substring(8); // RS_i
    console.log(`[${logTag}] Tag binary String: ${tagIdBinaryString}, rs_i binary: ${rs_iBinaryString}`);

    const tagIDInt = binaryHelper.binaryStringToInt(tagIdBinaryString);
    const rs_iInt = binaryHelper.binaryStringToInt(rs_iBinaryString);
    console.log(`[${logTag}] Tag int: ${tagIDInt}, rs_i int: ${rs_iInt}`);


    // Search Database for the hash (tReq) of tag_id, R'S_i
    const sqlGetQuery = `SELECT * FROM tags WHERE tid = ${tagIDInt} AND trand = ${rs_iInt}`
    dbHelper.getRow( sqlGetQuery, function(err, row){

        // If no match, illegitimate and return an error
        if (err || !row) {
            // TODO probably come up with a less descript message to return to the client
            return res.status(404).json( { "errorMessage": "Tag does not exist." } );
        }

        let tag = new Tag(row[0], row[1]);

        // Extract R'_t by computing alpha XOR R'S_i
        let r_tInt = binaryHelper.intXOR(alpha, rs_iInt); // R'_t
        console.log(`[${logTag}] r_t: ${r_tInt}`);

        // Generate new random number, R'S_i+1 for the tag
        let rs_i1Int = Math.floor(Math.random() * 64);
        console.log(`[${logTag}] rs_i+1: ${rs_i1Int}`);

        // Compute Beta and T'_Res where Beta = H(R'S_i+1 || R'_t || R'S_i) and T_Res = R'S_i+1 XOR R'_t

        let rs_i1BinaryString = binaryHelper.intToBinaryString(rs_i1Int) // R'S_i+1
        let r_tBinaryString = binaryHelper.intToBinaryString(r_tInt) // R'_t
        console.log(`[${logTag}] rs_i1 binary: ${rs_i1BinaryString}, r_t binary: ${r_tBinaryString}`);

        rs_i1BinaryString = binaryHelper.setBinaryStringLength(rs_i1BinaryString, 6) 
        r_tBinaryString = binaryHelper.setBinaryStringLength(r_tBinaryString, 6) 
        console.log(`[${logTag}] rs_i1 binary after resize: ${rs_i1BinaryString}, r_t binary after resize: ${r_tBinaryString}`);

        let betaBinaryString = rs_i1BinaryString + r_tBinaryString + rs_iBinaryString;
        console.log(`[${logTag}] beta binary: ${betaBinaryString}`);

        let betaInt = binaryHelper.binaryStringToInt(betaBinaryString);
        console.log(`[${logTag}] Beta int: ${betaInt}`)

        let beta = hashHelper.hashInteger( betaInt );
        console.log(`[${logTag}] Beta hash: ${beta}`);

        let tRes = binaryHelper.intXOR(rs_i1Int, r_tInt);
        console.log(`[${logTag}] tRes: ${tRes}`);

        // Update shared secret (ID'_tag, R'S_i+1)
        // Respond with T_Res and Beta to device
        const updateQuery = `UPDATE tags SET trand = ${rs_i1Int} WHERE tid = ${tagIDInt}`
        dbHelper.exec(updateQuery, function(err){
            if (err) {
                console.log('Could not update tag');
                return res.status(500).json({ "error": true, "errorMessage": "Error updating tag in database", err})
            }

            res.status(200).json( { beta, tRes } );
        });
    });

})

module.exports = router;