const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const crypto = require('crypto');

const cryptoHash = (...inputs) => {
    const input = inputs.map( (input) => JSON.stringify(input) ).sort().join(' ');
    const hash = crypto.createHash('sha256');
    hash.update(input);
    return hash.digest('hex');
}

const verifySignature = ({publicKey, data, signature}) => {
    const keyFromPublic = ec.keyFromPublic(publicKey, 'hex');
    return keyFromPublic.verify(cryptoHash(data), signature);
};

module.exports = { ec, verifySignature, cryptoHash };