module.exports = {
    intToBinaryString, intXOR, binaryStringToInt, appendBinaryStrings
}

function intToBinaryString(n) { 
    // check to see if n is an integer
    if ( isNaN(n) || n % 1 !== 0 ) { return null; }
    return (n >>> 0).toString(2); 
}

function intXOR(n1, n2) {
    // Check to make sure that n1 and n2 are integers. Probably overkill but ah well
    if ( isNaN(n1) || isNaN(n2) || n1 % 1 !== 0 || n2 % 1 !== 0 ) { return null; }
    return n1 ^ n2;
}

function binaryStringToInt(b) {
    const binaryRegex = /^[01]+$/
    if ( !b instanceof String ) { return null; }
    if ( !binaryRegex.test(b) ) { return null; }
    return parseInt(b,2);
}

function appendBinaryStrings( b1, b2 ) {
    const binaryRegex = /^[01]+$/
    if ( !b1 instanceof String || !b2 instanceof String ) { return null; }
    if ( !binaryRegex.test(b1) || !binaryRegex.test(b2) ) { return null; }
    return b1 + b2;
}

