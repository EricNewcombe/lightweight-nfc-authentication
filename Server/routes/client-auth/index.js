const hashHelper = require('../helpers/hashHelper');

let express = require('express');
let router = express.Router();

router.get('/', (req, res) => {
    res.send("Client auth");
});

/* 
Expects a JSON object with the following format:
{
    tReq: Int, Hashed value of Tag ID and its RS_i (Random i'th value). tagID is 8 bits long, random number is 6 bits long
    alpha: Int
}
*/

router.post('/', jsonParser, (req, res) => {

    let {tReq, dReq} = req.body;
    console.log(`tReq: ${tReq}`);
    console.log(`dReq: ${dReq}`);

    let tReqUnhashed = hashHelper.readHash(tReq);
    let dReqUnhashed = hashHelper.readHash(dReq);
    console.log(`Unhashed tReq: ${tReqUnhashed}`);
    console.log(`Unhashed dReq: ${dReqUnhashed}`);


    let tReqBinaryString = binaryHelper.intToBinaryString(tReqUnhashed);
    let dReqBinaryString = binaryHelper.intToBinaryString(dReqUnhashed);
    
    // Make sure the alpha binary string is 14 so that all data is preserved
    tReqBinaryString = binaryHelper.setBinaryStringLength(tReqBinaryString, 14);
    dReqBinaryString = binaryHelper.setBinaryStringLength(dReqBinaryString, 14);
    console.log(`tReq Binary String: ${tReqBinaryString}`);
    console.log(`dReq Binary String: ${dReqBinarytReqBinaryString}`);


    let tagIdBinaryString = tReqBinaryString.substring(0,8);
    let deviceIdBinaryString = dReqBinaryString.substring(0,8);
    console.log(`Tag Id binary: ${tagIdBinaryString}`);
    console.log(`Device ID binary: ${deviceIdBinaryString}`);

    let rs_iBinary = tReqBinaryString.substring(8); // RS_i
    let rd_iBinary = dReqBinaryString.substring(8); // RD_i
    console.log(`rs_i binary: ${rs_iBinary}`);
    console.log(`rd_i binary: ${rd_iBinary}`);

    let tagID = binaryHelper.binaryStringToInt(tagIdBinaryString);
    let deviceID = binaryHelper.binaryStringToInt(deviceIdBinaryString);
    console.log(`Tag ID int: ${tagID}`);
    console.log(`Device ID int: ${deviceID}`);

    let rs_i = binaryHelper.binaryStringToInt(rs_iBinary);
    let rd_i = binaryHelper.binaryStringToInt(rd_iBinary);
    console.log(`rs_i int: ${rs_i}`);
    console.log(`rd_i int: ${rd_i}`);

    let db = new sqlite3.Database('../../nfc_auth.db', function(err){

        if (err) {
            return res.status(500).json( { "errorMessage": "Could not connect to database." } );
        }

        // Search Database for the hash (tReq) of tag_id, R'S_i
        // db.get('SELECT * FROM tags WHERE tid = ? AND trand = ?', [tagID, rs_i], function(err, row){
            // If no match, illegitimate and return an error
            // if (err) {
            //     // TODO probably come up with a less descript message to return to the client
            //     return res.status(404).json( { "errorMessage": "Tag does not exist." } );
            // }

            // let tag = new Tag(row[0], row[1]);

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
            db.exec('UPDATE tags SET trand = ? WHERE tid = ?', [rs_i1, tag.tid], function(err){
                if (err) {
                    console.log('Could not update tag');
                }

                res.status(200).json( { beta, tRes } );
            });
        // });
    });
})

module.exports = router;