const uuid = require('uuid/v1');
const { verifySignature } = require('../util');

class Transaction {

    constructor( { senderWallet, recipient, amount } ) {
        this.id = uuid();
        this.outputMap = this.createOutputMap( { senderWallet, recipient, amount } );
        this.input = this.createInput( { senderWallet, outputMap: this.outputMap } );
    }

    createInput( { senderWallet, outputMap } ) {
        const input = {};
        input.timestamp = Date.now();
        input.address = senderWallet.publicKey;
        input.amount = senderWallet.balance;
        input.signature = senderWallet.sign(outputMap);

        return input;
    }

    createOutputMap( { senderWallet, recipient, amount } ) {
        const outputMap = {};
        outputMap[recipient] = amount;
        outputMap[senderWallet.publicKey] = senderWallet.balance - amount;
        return outputMap;
    }

    static validTransaction(transaction) {
        const { input: { address, amount, signature } , outputMap } = transaction;

        const outputTotal = Object.values(outputMap)
            .reduce((total, outputAmount) => total + outputAmount);

        if (amount !== outputTotal) {
            console.error('outputMap sum invalid');
            return false;
        }
        
        if(!verifySignature({ publicKey: address, data: outputMap, signature })) {
            console.error('signature invalid');
            return false;
        } 
        return true;
    }

}

module.exports = Transaction;