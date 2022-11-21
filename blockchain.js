const Block = require('./block');

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
        for(let i=1; i<(chain.length-1); i++) {
            if(chain[i].hash !== Block.hashBlock(chain[i])) { return false; }
            if(chain[i].lastHash !== chain[i-1].hash) { return false; }
        }
        return true;
    }

    replaceChain(chain) {
        if(this.chain.length > chain.length) { console.error("Incoming chain to be longer"); return; }
        if(!Blockchain.isValidChain(chain)) { console.error("Incoming chain corrupted"); return; }
        console.log('Info - chain is being changed');
        this.chain = chain;
    }

}

module.exports = Blockchain;
