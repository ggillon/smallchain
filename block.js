
class Block {

    constructor({timestamp, lastHash, hash, data}) {
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
    }

    toString() {
        return `View -  Block
            timestamp: ${this.timestamp}
            lastHash : ${this.lastHash}
            hash     : ${this.hash}
            data     : ${this.data}
        `;
    }


    static genesisBlock() {
        return this
    }

}

module.exports = Block;