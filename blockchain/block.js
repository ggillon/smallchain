const {GENESIS_DATA, MINE_RATE} = require('../config');
const cryptoHash = require('../util/crypto-hash');
const hexToBinary = require('hex-to-binary');

class Block {

    constructor({timestamp, lastHash, hash, data, nonce, difficulty}) {
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty; 
    }

    /*toString() {
        return `View -  Block
            timestamp: ${this.timestamp}
            lastHash : ${this.lastHash}
            hash     : ${this.hash}
            data     : ${this.data}
        `;
    }*/

    static genesis() {
        return new Block(GENESIS_DATA);
    }

    static mineBlock({lastBlock, data}) {
        let hash, timestamp;
        const lastHash = lastBlock.hash;
        let { difficulty } = lastBlock;
        let nonce = 0;
        do{
            nonce++;
            timestamp = Date.now();
            difficulty = Block.adjustDifficulty({lastBlock, timestamp});
            hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
        } while (hexToBinary(hash).substring(0, difficulty) !== '0'.repeat(difficulty))
        
        
        return new Block( {
            timestamp,
            lastHash,
            hash,
            data,
            nonce,
            difficulty,
        });
    }

    static adjustDifficulty({lastBlock, timestamp}) {
        let { difficulty } = lastBlock;
        difficulty = (lastBlock.timestamp + MINE_RATE) > timestamp ? difficulty + 1 : difficulty - 1;
        return Math.max(difficulty,1);
    }

    static hashBlock(block) {
        return cryptoHash(block.timestamp, block.lastHash, block.data, block.nonce, block.difficulty);
    }

}

module.exports = Block;