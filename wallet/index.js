const { STARTING_BALANCE } = require('../config');
const { ec, cryptoHash } = require('../util');

class Wallet {
    constructor() {
        this.balance = STARTING_BALANCE;
        this.keyPair = ec.genKeyPair();
        this.publicKey = this.keyPair.getPublic().encode('hex');
    }

    sign(data) {
        
        //console.log('data', cryptoHash(data));
        const signature = this.keyPair.sign(cryptoHash(data));
        //console.log('sign', cryptoHash(signature));
        return signature;
    }
}

module.exports = Wallet;