const { STARTING_BALANCE } = require('../config');
const { ec, cryptoHash } = require('../util');
const Transaction = require('./transaction');

class Wallet {
    constructor() {
        this.balance = STARTING_BALANCE;
        this.keyPair = ec.genKeyPair();
        this.publicKey = this.keyPair.getPublic().encode('hex');
    }

    sign(data) {
        const signature = this.keyPair.sign(cryptoHash(data));
        return signature;
    }

    createTransaction({ recipient, amount }) {
        if(amount> this.balance) {
            throw new Error('Amount exceeds balance');
        }
        const transaction = new Transaction( { senderWallet: this, recipient, amount });
        return transaction;
    }
}

module.exports = Wallet;