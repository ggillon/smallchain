const uuid = require('uuid/v1');
const { verifySignature } = require('../util');
const { REWARD_INPUT, MINING_REWARD } = require('../config');


class Transaction {

    constructor( { senderWallet, recipient, amount, outputMap, input } ) {
        this.id = uuid();
        this.outputMap = outputMap || this.createOutputMap( { senderWallet, recipient, amount } );
        this.input = input || this.createInput( { senderWallet, outputMap: this.outputMap } );
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

    update( { senderWallet, recipient, amount } ) {
        
        if(amount > this.outputMap[senderWallet.publicKey] ) {       
            throw new Error(`Amount: ${amount} exceeds remaining balance (${this.outputMap[senderWallet.publicKey] } )`);
        }
        this.outputMap[senderWallet.publicKey] -= amount;

        if(this.outputMap[recipient]) {
            this.outputMap[recipient] += amount; 
        } else {
            this.outputMap[recipient] = amount;
        }
        this.input = this.createInput( { senderWallet, outputMap: this.outputMap} )

        return this;
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

    static rewardTransaction( { minerWallet } ) {
        return new Transaction( { 
            input: REWARD_INPUT,
            recipient: minerWallet.publicKey,
            outputMap: {[minerWallet.publicKey]: MINING_REWARD }
        });
    }
}

module.exports = Transaction;