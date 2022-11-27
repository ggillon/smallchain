const { REWARD_INPUT, MINING_REWARD } = require('../config');
const Transaction = require('../wallet/transaction');
const Block = require('./block');
const Wallet = require('../wallet');

class Blockchain{
    constructor() {
        this.chain = [Block.genesis()];
    }

    addBlock({data}) {
        const lastBlock = this.lastBlock();
        const newBlock = Block.mineBlock({lastBlock, data});
        this.chain.push(newBlock);
    }

    lastBlock() {
        return this.chain[this.chain.length - 1];
    }

    static isValidChain(chain) {
        if(JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) { return false; }
        for(let i=1; i<chain.length; i++) {
            if (Math.abs(chain[i].difficulty - chain[i-1].difficulty)>1) { return false; }
            if(chain[i].hash !== Block.hashBlock(chain[i])) { return false; }
            if(chain[i].lastHash !== chain[i-1].hash) { return false; }
        }
        return true;
    }

    replaceChain(chain, validateTransactions, onSuccess) {
        if(this.chain.length > chain.length) {
             console.error("Incoming chain to be longer"); 
             return; 
        }

        if(!Blockchain.isValidChain(chain)) {
            console.error("Incoming chain corrupted");
            return; 
        }

        if(validateTransactions && !this.validTransactionData( { chain })) {
            console.error("Incoming chain has invalid transaction");
            return; 
        }

        if(onSuccess) onSuccess();

        console.log('Info - chain is being changed');
        this.chain = chain;
    }

    validTransactionData({ chain }) {
        for(let i=1; i<chain.length; i++) {
            const block = chain[i];
            const transactionSet = new Set();
            let rewardTransactionCount = 0;
            for(let transaction of block.data) {
                if(transaction.input.address === REWARD_INPUT.address) {
                    rewardTransactionCount += 1;

                    if(rewardTransactionCount>1) {
                        console.error('Miner rewards exceeded');
                        return false;
                    }

                    if(Object.values(transaction.outputMap)[0] !== MINING_REWARD) {
                        console.error('Mining reward is incorrect');
                        return false;
                    }
                } else {
                    if(!Transaction.validTransaction(transaction)) {
                        console.error('Invalid transaction');
                        return false;
                    }
                    
                    const trueBalance = Wallet.calculateBalance({
                        chain: this.chain,
                        address: transaction.input.address
                      });
            
                    if (transaction.input.amount !== trueBalance) {
                        console.error('Invalid input amount');
                        return false;
                    }

                    if (transactionSet.has(transaction)) {
                        console.error('An identical transaction appears more than once in the block');
                        return false;
                      } else {
                        transactionSet.add(transaction);
                    }
                }
                                

            }
        }


        return true;
    }

}

module.exports = Blockchain;
