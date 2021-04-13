module.exports = {
    intToBinaryString, intXOR, binaryStringToInt, appendBinaryStrings, setBinaryStringLength, getNLeastSignificantBinaryBits
}

// Checks to see if a binary string (b) is valid
function isValidBinary(b) {
    const binaryRegex = /^[01]+$/
    if ( !b instanceof String ) { return false; }
    if ( !binaryRegex.test(b) ) { return false; }
    return true;
}

// Returns a binary string representation of an integer n
function intToBinaryString(n) { 
    // check to see if n is an integer
    if ( isNaN(n) || n % 1 !== 0 ) { throw new Error("Invalid int"); }
    return (n >>> 0).toString(2); 
}

// Returns the result of an XOR operation between two integers, n1 and n2
function intXOR(n1, n2) {
    // Check to make sure that n1 and n2 are integers. Probably overkill but ah well
    if ( isNaN(n1) || isNaN(n2) || n1 % 1 !== 0 || n2 % 1 !== 0 ) { throw new Error("Invalid int"); }
    return n1 ^ n2;
}

// Converts a binary string (b) to an integer
function binaryStringToInt(b) {
    if ( !isValidBinary(b) ) { throw new Error("Invalid binary string"); }
    return parseInt(b,2);
}

// Sets the binary string (b) to the length supplied to lengthToSet
function setBinaryStringLength(b, lengthToSet) {
    if ( !isValidBinary(b) ) { throw new Error("Invalid binary string"); }
    if ( b.length > lengthToSet ) { throw new Error("Binary string length is already longer than the desired length"); }

    let lengthDifference = lengthToSet - b.length;
    if ( lengthDifference === 0 ) { return b; }

    for ( let i = 0; i < lengthDifference; i++ ) { b = '0' + b; }
    return b;
}

// Appends two binary strings together
function appendBinaryStrings( ...binaryStrings ) {
    let returnBinaryString = "";

    for ( let i = 0; i < binaryStrings.length; i++ ) {
        if ( !isValidBinary(binaryStrings[i]) ) { throw new Error(`Invalid binary string: ${binaryStrings[i]}`); }
        returnBinaryString += binaryStrings[i];
    }
    
    return returnBinaryString;
}

function getNLeastSignificantBinaryBits( b, n ) {
    if ( !isValidBinary(b) ) { throw new Error("Invalid binary string") }
    if ( n < 0 ) { throw new Error("n must be greater than 0"); }
    if ( n > b.length ) { b = setBinaryStringLength(b, n); } 

    return b.slice(b.length - n);
}

