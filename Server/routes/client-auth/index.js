const hashHelper = require('../helpers/hashHelper');
const binaryHelper = require('../helpers/binaryHelper');
const dbHelper = require('../helpers/dbHelper');
const Tag = require('../../models/Tag');
const express = require('express');
const bodyParser = require('body-parser');

let router = express.Router();
let jsonParser = bodyParser.json({extended:false});

const logTag = "Client-Auth";

router.get('/', (req, res) => {
    res.send("Client-Auth");
});

router.post('/get-test-data', jsonParser, (req, res) => {

    const { rs_i, rd_i, tagID, deviceID } = req.body;

    // Check to make sure all variables required were sent
    if ( rs_i === null || rs_i === undefined ) { return res.status(400).json( { "error": true, "errorMessage": "Missing rs_i in data object sent" } ); }
    if ( rd_i === null || rd_i === undefined ) { return res.status(400).json( { "error": true, "errorMessage": "Missing rd_i in data object sent" } ); }
    if ( tagID === null || tagID === undefined ) { return res.status(400).json( { "error": true, "errorMessage": "Missing tagID in data object sent" } ); }
    if ( deviceID === null || deviceID === undefined ) { return res.status(400).json( { "error": true, "errorMessage": "Missing deviceID in data object sent" } ); }
    
    // Check to make sure all variables are correct type
    if ( !Number.isInteger(rs_i) ) { return res.status(400).json( { "error": true, "errorMessage": "Invalid input, expected int for rs_i" } ); }
    if ( !Number.isInteger(rd_i) ) { return res.status(400).json( { "error": true, "errorMessage": "Invalid input, expected int for rd_i" } ); }
    if ( !Number.isInteger(tagID) ) { return res.status(400).json( { "error": true, "errorMessage": "Invalid input, expected int for tagID" } ); }
    if ( !Number.isInteger(deviceID) ) { return res.status(400).json( { "error": true, "errorMessage": "Invalid input, expected int for deviceID" } ); }

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
    console.log(`[${logTag}]: tReq: ${tReq}, dReq: ${dReq}, p: ${p}`);

    // Check to make sure all variables required were sent
    if ( tReq === null || tReq === undefined ) { return res.status(400).json( { "error": true, "errorMessage": "Missing tReq in data object sent" } ); }
    if ( dReq === null || dReq === undefined ) { return res.status(400).json( { "error": true, "errorMessage": "Missing dReq in data object sent" } ); }
    if ( p === null || tagID === undefined ) { return res.status(400).json( { "error": true, "errorMessage": "Missing p in data object sent" } ); }
    
    // Check to make sure all variables are correct type
    if ( !Number.isInteger(tReq) ) { return res.status(400).json( { "error": true, "errorMessage": "Invalid input, expected int for tReq" } ); }
    if ( !Number.isInteger(dReq) ) { return res.status(400).json( { "error": true, "errorMessage": "Invalid input, expected int for dReq" } ); }
    if ( !Number.isInteger(p) ) { return res.status(400).json( { "error": true, "errorMessage": "Invalid input, expected int for p" } ); }


    const tReqUnhashedInt = hashHelper.readHash(tReq);
    const dReqUnhashedInt = hashHelper.readHash(dReq);
    console.log(`[${logTag}]: Unhashed tReq: ${tReqUnhashedInt}, Unhashed dReq: ${dReqUnhashedInt}`);

    let tReqBinaryString = binaryHelper.intToBinaryString(tReqUnhashedInt);
    let dReqBinaryString = binaryHelper.intToBinaryString(dReqUnhashedInt);
    
    // Make sure the alpha binary string is 14 so that all data is preserved
    tReqBinaryString = binaryHelper.setBinaryStringLength(tReqBinaryString, 14);
    dReqBinaryString = binaryHelper.setBinaryStringLength(dReqBinaryString, 14);
    console.log(`[${logTag}]: tReq Binary String: ${tReqBinaryString}, dReq Binary String: ${dReqBinaryString}`);


    const tagIdBinaryString = tReqBinaryString.substring(0,8);
    const deviceIdBinaryString = dReqBinaryString.substring(0,8);
    console.log(`[${logTag}]: Tag Id binary: ${tagIdBinaryString}, Device ID binary: ${deviceIdBinaryString}`);

    const rs_iBinaryString = tReqBinaryString.substring(8); // RS_i
    const rd_iBinaryString = dReqBinaryString.substring(8); // RD_i
    console.log(`[${logTag}]: rs_i binary: ${rs_iBinaryString}, rd_i binary: ${rd_iBinaryString}`);

    const tagIDInt = binaryHelper.binaryStringToInt(tagIdBinaryString);
    const deviceIDInt = binaryHelper.binaryStringToInt(deviceIdBinaryString);
    console.log(`[${logTag}]: Tag ID int: ${tagIDInt}, Device ID int: ${deviceIDInt}`);

    const rs_iInt = binaryHelper.binaryStringToInt(rs_iBinaryString);
    const rd_iInt = binaryHelper.binaryStringToInt(rd_iBinaryString);
    console.log(`[${logTag}]: rs_i int: ${rs_iInt}, rd_i int: ${rd_iInt}`);

    // Search Database for the hash (tReq) of tag_id, R'S_i
    const sqlQuery = `SELECT * FROM clients WHERE cid = ${deviceIDInt} AND crand = ${rd_iInt}`;
    dbHelper.getRow(sqlQuery, function(err, row) {

        console.log(`[${logTag}]: err: ${err}, row ${JSON.stringify(row)}`);

        // If no match, illegitimate and return an error
        if (err || !row) {
            // TODO probably come up with a less descript message to return to the client
            return res.status(400).json( { "error": true, "errorMessage": "Client does not exist." } );
        }

        let tag = new Tag(row[0], row[1]);

        // Generate new random numbers for tag and device, (R'S_i+1, R'D_i+1)
        const rs_i1Int = Math.floor(Math.random() * 64);
        const rd_i1Int = Math.floor(Math.random() * 64);
        console.log(`[${logTag}]: rs_i+1: ${rs_i1Int}, rd_i+1: ${rd_i1Int}`);

        // Generate rs_i and rs_i+1 binary string for alpha calculation
        const rs_i1BinaryString = binaryHelper.intToBinaryString(rs_i1Int);

        // Calculate the partial ids (pid_t, pid_d) by taking p least significant bits
        const pid_tBinaryString = binaryHelper.getNLeastSignificantBinaryBits(tagIdBinaryString, p);
        const pid_dBinaryString = binaryHelper.getNLeastSignificantBinaryBits(deviceIdBinaryString, p);
        console.log(`[${logTag}]: pid_tBinaryString: ${pid_tBinaryString}, pid_dBinaryString: ${pid_dBinaryString}`);

        const pid_t = binaryHelper.binaryStringToInt(pid_tBinaryString);
        const pid_d = binaryHelper.binaryStringToInt(pid_dBinaryString);
        console.log(`[${logTag}]: pid_t: ${pid_t}, pid_d: ${pid_d}`);

        // Generate the response integers
        const tRes = binaryHelper.intXOR(pid_t, rs_i1Int);
        const dRes = binaryHelper.intXOR(pid_d, rd_i1Int);

        // Calculate alpha 
        const alphaBinaryString = binaryHelper.appendBinaryStrings(rs_i1BinaryString, pid_tBinaryString, rs_iBinaryString)
        const alphaInt = binaryHelper.binaryStringToInt(alphaBinaryString);
        const alpha = hashHelper.hashInteger(alphaInt);

        // Update shared secret (ID'_tag, R'S_i+1)
        // Respond with T_Res and Beta to device
        const tagUpdateQuery = `UPDATE tags SET trand = ${rs_i1Int} WHERE tid = ${tagIDInt}`
        const clientUpdateQuery = `UPDATE tags SET crand = ${rs_i1Int} WHERE cid = ${deviceIDInt}`
        db.exec(tagUpdateQuery, function(tagErr){

            if (tagErr) {
                console.log('Could not update tag');
                return res.status(500).json({ "error": true, "errorMessage": "Error updating tag in database", tagErr })
            }

            dbHelper.exec(clientUpdateQuery, function(clientErr) {

                if (clientErr) {
                    console.log('Could not update client');
                    return res.status(500).json({ "error": true, "errorMessage": "Error updating client in database", clientErr })
                }

                res.status(200).json( { tRes, dRes, alpha } );
            })

        });

    });

});

module.exports = router;