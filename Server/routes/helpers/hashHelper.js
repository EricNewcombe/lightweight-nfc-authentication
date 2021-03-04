const numHashes = 16;

module.exports = {
    hashInteger, readHash
}

// Stupidly simple hash function, this should probably be replaced
function hashInteger(n) {
    // check to see if n is an integer
    if ( isNaN(n) || n % 1 !== 0 ) { return null; }
    return (n * 369) - 1;
}

function readHash(n) {
    console.log(n);
    // check to see if n is an integer
    if ( isNaN(n) || n % 1 !== 0 ) { return null; }
    return (n + 1) / 369 ;
}
