const hashHelper = require('../helpers/hashHelper');
const binaryHelper = require('../helpers/binaryHelper');
const Tag = require('../../models/Tag');
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3');

let router = express.Router();
let jsonParser = bodyParser.json({extended:false});

router.get('/', (req, res) => {

    // Temporarily here to give stuff to test functionality
    rs_i = 9;
    r_t = 18;
    tagID = 27;

    const rs_i1 = Math.floor(Math.random() * 64);
    console.log(`rs_i: ${rs_i}, r_t: ${r_t}, rs_i1: ${rs_i1}, `)

    const rs_i1Binary = binaryHelper.setBinaryStringLength(binaryHelper.intToBinaryString(rs_i1), 6) // R'S_i+1
    const r_tBinary = binaryHelper.setBinaryStringLength(binaryHelper.intToBinaryString(r_t), 6) // R'_t
    const rs_iBinaryString = binaryHelper.setBinaryStringLength(binaryHelper.intToBinaryString(rs_i), 6); // RS_i
    const betaBinary = rs_i1Binary + r_tBinary + rs_iBinaryString;
    const betaNumber = binaryHelper.binaryStringToInt(betaBinary)
    const betaHash = hashHelper.hashInteger( betaNumber );

    const tagIDBinary = binaryHelper.setBinaryStringLength( binaryHelper.intToBinaryString(tagID), 8 );

    const alphaBinary = tagIDBinary + rs_iBinaryString
    const alphaNumber = binaryHelper.binaryStringToInt(alphaBinary);
    const alphaHash = hashHelper.hashInteger( alphaNumber );

    const tRes = binaryHelper.intXOR(rs_i1, r_t);

    res.status(200).json( { tagID, tagIDBinary, rs_i, rs_iBinaryString,  alphaBinary, alphaNumber, alphaHash, rs_i1, rs_i1Binary, r_t, r_tBinary,   betaBinary, betaNumber, betaHash, tRes } );
});

/* 
Expects a JSON object with the following format:
{
    tReq: Int, Hashed value of Tag ID and its RS_i (Random i'th value). tagID is 8 bits long, random number is 6 bits long
    alpha: Int
}
*/
router.post('/', jsonParser, (req, res) => {

    const {tReq, alpha} = req.body;
    console.log(`tReq: ${tReq}, alpha: ${alpha}`)

    // Extract the tagId and tagRandomValue from the tReq
    const alphaUnhashed = hashHelper.readHash(alpha);
    console.log(`Unhashed alpha: ${alphaUnhashed}`);

    let alphaUnhashedBinaryString = binaryHelper.intToBinaryString(alphaUnhashed);
    
    // Make sure the alpha binary string is 14 so that all data is preserved
    alphaUnhashedBinaryString = binaryHelper.setBinaryStringLength(alphaUnhashedBinaryString, 14);
    console.log(`Alpha Binary String: ${alphaUnhashedBinaryString}`);

    const tagIdBinaryString = alphaUnhashedBinaryString.substring(0,8);
    const rs_iBinaryString = alphaUnhashedBinaryString.substring(8); // RS_i
    console.log(`Tag binary String: ${tagIdBinaryString}, rs_i binary: ${rs_iBinaryString}`);

    const tagIDInt = binaryHelper.binaryStringToInt(tagIdBinaryString);
    const rs_iInt = binaryHelper.binaryStringToInt(rs_iBinaryString);
    console.log(`Tag int: ${tagIDInt}, rs_i int: ${rs_iInt}`);

    let db = new sqlite3.Database('../../nfc_auth.db', function(err){

        if (err) {
            return res.status(500).json( { "errorMessage": "Could not connect to database." } );
        }

        // Search Database for the hash (tReq) of tag_id, R'S_i
        db.get('SELECT * FROM tags WHERE tid = ? AND trand = ?', [tagIDInt, rs_iInt], function(err, row){
            // If no match, illegitimate and return an error
            if (err) {
                // TODO probably come up with a less descript message to return to the client
                return res.status(404).json( { "errorMessage": "Tag does not exist." } );
            }

            let tag = new Tag(row[0], row[1]);

            // Extract R'_t by computing alpha XOR R'S_i
            let r_tInt = binaryHelper.intXOR(tReq, rs_iInt); // R'_t
            console.log(`r_t: ${r_tInt}`);

            // Generate new random number, R'S_i+1 for the tag
            let rs_i1Int = Math.floor(Math.random() * 64);
            console.log(`rs_i+1: ${rs_i1Int}`);

            // Compute Beta and T'_Res where Beta = H(R'S_i+1 || R'_t || R'S_i) and T_Res = R'S_i+1 XOR R'_t

            let rs_i1BinaryString = binaryHelper.intToBinaryString(rs_i1Int) // R'S_i+1
            let r_tBinaryString = binaryHelper.intToBinaryString(r_tInt) // R'_t
            console.log(`rs_i1 binary: ${rs_i1BinaryString}, r_t binary: ${r_tBinaryString}`);

            rs_i1BinaryString = binaryHelper.setBinaryStringLength(rs_i1BinaryString, 6) 
            r_tBinaryString = binaryHelper.setBinaryStringLength(r_tBinaryString, 6) 
            console.log(`rs_i1 binary after resize: ${rs_i1BinaryString}, r_t binary after resize: ${r_tBinaryString}`);

            let betaBinaryString = rs_i1BinaryString + r_tBinaryString + rs_iBinaryString;
            console.log(`beta binary: ${betaBinaryString}`);

            let betaInt = binaryHelper.binaryStringToInt(betaBinaryString);
            console.log(`Beta int: ${betaInt}`)

            let beta = hashHelper.hashInteger( betaInt );
            console.log(`Beta hash: ${beta}`);

            let tRes = binaryHelper.intXOR(rs_i1Int, r_tInt);
            console.log(`tRes: ${tRes}`);

            // Update shared secret (ID'_tag, R'S_i+1)
            // Respond with T_Res and Beta to device
            db.exec('UPDATE tags SET trand = ? WHERE tid = ?', [rs_i1Int, tag.tid], function(err){
                if (err) {
                    console.log('Could not update tag');
                }

                res.status(200).json( { beta, tRes } );
            });
        });
    });
})

module.exports = router;