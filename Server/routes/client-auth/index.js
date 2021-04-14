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
    rd_i = 39;
    tagID = 27;
    deviceID = 1;

    console.log(`rs_i: ${rs_i}, rd_i: ${rd_i}, tag id: ${tagID}, device id: ${deviceID} `);

    const rs_iBinary = binaryHelper.setBinaryStringLength(binaryHelper.intToBinaryString(rs_i), 6); // RS_i
    const rd_iBinary = binaryHelper.setBinaryStringLength(binaryHelper.intToBinaryString(rd_i), 6); // RD_i
    const tagIDBinary = binaryHelper.setBinaryStringLength( binaryHelper.intToBinaryString(tagID), 8 );
    const deviceIDBinary = binaryHelper.setBinaryStringLength( binaryHelper.intToBinaryString(deviceID), 8 );

    const unhashed_tReqBinary = binaryHelper.appendBinaryStrings(tagIDBinary,rs_iBinary);
    const unhashed_dReqBinary = binaryHelper.appendBinaryStrings(deviceIDBinary,rd_iBinary);

    const unhashed_tReqInt = binaryHelper.binaryStringToInt(unhashed_tReqBinary);
    const unhashed_dReqInt = binaryHelper.binaryStringToInt(unhashed_dReqBinary);

    const hashed_tReq = hashHelper.hashInteger(unhashed_tReqInt);
    const hashed_dReq = hashHelper.hashInteger(unhashed_dReqInt);

    res.status(200).json( { rs_iBinary,rd_iBinary,tagIDBinary,deviceIDBinary,unhashed_tReqBinary,unhashed_dReqBinary,unhashed_tReqInt,unhashed_dReqInt,hashed_tReq,hashed_dReq } );
});

/* 
Expects a JSON object with the following format:
{
    tReq: Int, Hashed value of Tag ID and its RS_i (Random i'th value). tagID is 8 bits long, random number is 6 bits long
    dReq: Int, Hashed value of Device ID and its RS_d (Random i'th value). tagID is 8 bits long, random number is 6 bits long
    p:    Int, Used to calculate the partial tag id which is L/2 < p < L where L is the length of the tagID bits (8)
}
*/

router.post('/', jsonParser, (req, res) => {

    const {tReq, dReq, p} = req.body;
    console.log(`tReq: ${tReq}, dReq: ${dReq}, p: ${p}`);

    const tReqUnhashedInt = hashHelper.readHash(tReq);
    const dReqUnhashedInt = hashHelper.readHash(dReq);
    console.log(`Unhashed tReq: ${tReqUnhashedInt}, Unhashed dReq: ${dReqUnhashedInt}`);


    let tReqBinaryString = binaryHelper.intToBinaryString(tReqUnhashedInt);
    let dReqBinaryString = binaryHelper.intToBinaryString(dReqUnhashedInt);
    
    // Make sure the alpha binary string is 14 so that all data is preserved
    tReqBinaryString = binaryHelper.setBinaryStringLength(tReqBinaryString, 14);
    dReqBinaryString = binaryHelper.setBinaryStringLength(dReqBinaryString, 14);
    console.log(`tReq Binary String: ${tReqBinaryString}, dReq Binary String: ${dReqBinaryString}`);


    const tagIdBinaryString = tReqBinaryString.substring(0,8);
    const deviceIdBinaryString = dReqBinaryString.substring(0,8);
    console.log(`Tag Id binary: ${tagIdBinaryString}, Device ID binary: ${deviceIdBinaryString}`);

    const rs_iBinaryString = tReqBinaryString.substring(8); // RS_i
    const rd_iBinaryString = dReqBinaryString.substring(8); // RD_i
    console.log(`rs_i binary: ${rs_iBinaryString}, rd_i binary: ${rd_iBinaryString}`);

    const tagIDInt = binaryHelper.binaryStringToInt(tagIdBinaryString);
    const deviceIDInt = binaryHelper.binaryStringToInt(deviceIdBinaryString);
    console.log(`Tag ID int: ${tagIDInt}, Device ID int: ${deviceIDInt}`);

    const rs_iInt = binaryHelper.binaryStringToInt(rs_iBinaryString);
    const rd_iInt = binaryHelper.binaryStringToInt(rd_iBinaryString);
    console.log(`rs_i int: ${rs_iInt}`);
    console.log(`rd_i int: ${rd_iInt}`);

    // let db = new sqlite3.Database('../../nfc_auth.db', function(err){

        // if (err) {
        //     return res.status(500).json( { "errorMessage": "Could not connect to database." } );
        // }

        // Search Database for the hash (tReq) of tag_id, R'S_i
        // db.get('SELECT * FROM tags WHERE tid = ? AND trand = ?', [tagID, rs_i], function(err, row){
            // If no match, illegitimate and return an error
            // if (err) {
            //     // TODO probably come up with a less descript message to return to the client
            //     return res.status(404).json( { "errorMessage": "Tag does not exist." } );
            // }

            // let tag = new Tag(row[0], row[1]);

            // Generate new random numbers for tag and device, (R'S_i+1, R'D_i+1)
            const rs_i1Int = Math.floor(Math.random() * 64);
            const rd_i1Int = Math.floor(Math.random() * 64);
            console.log(`rs_i+1: ${rs_i1Int}, rd_i+1: ${rd_i1Int}`);

            // Generate rs_i and rs_i+1 binary string for alpha calculation
            const rs_i1BinaryString = binaryHelper.intToBinaryString(rs_i1Int);

            // Calculate the partial ids (pid_t, pid_d) by taking p least significant bits
            const pid_tBinaryString = binaryHelper.getNLeastSignificantBinaryBits(tagIdBinaryString, p);
            const pid_dBinaryString = binaryHelper.getNLeastSignificantBinaryBits(deviceIdBinaryString, p);
            console.log(`pid_tBinaryString: ${pid_tBinaryString}, pid_dBinaryString: ${pid_dBinaryString}`);

            const pid_t = binaryHelper.binaryStringToInt(pid_tBinaryString);
            const pid_d = binaryHelper.binaryStringToInt(pid_dBinaryString);
            console.log(`pid_t: ${pid_t}, pid_d: ${pid_d}`);

            const tRes = binaryHelper.intXOR(pid_t, rs_i1Int);
            const dRes = binaryHelper.intXOR(pid_d, rd_i1Int);

            // calculate alpha 
            const alphaBinaryString = binaryHelper.appendBinaryStrings(rs_i1BinaryString, pid_tBinaryString, rs_iBinaryString)
            const alphaInt = binaryHelper.binaryStringToInt(alphaBinaryString);
            const alpha = hashHelper.hashInteger(alphaInt);

            res.status(200).json( { tRes, dRes, alpha } );
           

            // // Update shared secret (ID'_tag, R'S_i+1)
            // // Respond with T_Res and Beta to device
            // db.exec('UPDATE tags SET trand = ? WHERE tid = ?', [rs_i1Int, tag.tid], function(err){
            //     if (err) {
            //         console.log('Could not update tag');
            //     }

            //     res.status(200).json( { beta, tRes } );
            // });
        // });
    // });
});

module.exports = router;