const numHashes = 16;

module.exports = {
    hashInteger
}

// Taken from https://stackoverflow.com/questions/4273466/reversible-hash-function
function hashInteger(n) {
    // check to see if n is an integer
    if ( isNaN(n) || n % 1 !== 0 ) { return null; }
    return ((0x0000FFFF & n)<<16) + ((0xFFFF0000 & n)>>16);
}
