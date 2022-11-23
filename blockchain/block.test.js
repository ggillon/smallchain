const Block = require('./block');
const cryptoHash = require('../util/crypto-hash');
const { GENESIS_DATA, MINE_RATE } = require('../config');
const hexToBinary = require('hex-to-binary');

describe('Block', () => {
    const timestamp = Date.now();
    const lastHash = "foo-hash";
    const hash = "goo-hash";
    const data = {"name": "Gatien", "age": 40};
    const nonce = 1;
    const difficulty = 3;
    const block = new Block({timestamp, lastHash, hash, data, nonce, difficulty});

    it('Creates the block properly', () => {
        expect(block.timestamp).toEqual(timestamp);
        expect(block.lastHash).toEqual(lastHash);
        expect(block.hash).toEqual(hash);
        expect(block.data).toEqual(data);
        expect(block.nonce).toEqual(nonce);
        expect(block.difficulty).toEqual(difficulty);
    });

    describe('genesis()', ()=>{
        const genesisBlock = Block.genesis();

        it('returns a Block instance', () => {
            expect(genesisBlock instanceof Block).toBe(true);
        })

        it('returns the genesis data', () => {
            expect(genesisBlock).toEqual(GENESIS_DATA);
        })
    });

    describe('mineBlock()', ()=>{
        const lastBlock = Block.genesis();
        const data = {string: 'mined data', test: true} ;
        const minedBlock = Block.mineBlock({lastBlock, data});

        it('returns a block instance', ()=>{
            expect(minedBlock instanceof Block).toBe(true);
        });

        it('sets a timestamp', () => {
            expect(minedBlock.timestamp).not.toEqual(undefined);
        });

        it('sets the lastHash properly', () =>{
            expect(minedBlock.lastHash).toBe(lastBlock.hash);
        });

        it('sets the data properly', () =>{
            expect(minedBlock.data).toBe(data);
        });

        it('sets the hash properly', () => {
            expect(minedBlock.hash).toEqual(cryptoHash(
                minedBlock.timestamp,
                minedBlock.lastHash,
                minedBlock.nonce,
                minedBlock.difficulty,
                data,
            ));
        });

        it('sets a hash with the difficulty criteria', ()=>{
            expect(hexToBinary(minedBlock.hash).substring(0, minedBlock.difficulty)).toEqual('0'.repeat(minedBlock.difficulty));
        })

        it('adjusts the difficulty', ()=>{
            const possibleResults = [lastBlock.difficulty+1, lastBlock.difficulty-1];
            expect(possibleResults.includes(minedBlock.difficulty)).toBe(true);
        })


    });

    describe('adjustDifficulty()', () => {

        it('raises the difficulty for a quickly mined bliock', () => {
            expect(Block.adjustDifficulty({lastBlock: block, timestamp: (block.timestamp + MINE_RATE - 100)})).toEqual(block.difficulty+1);
        })

        it('lowers the difficulty for a quickly mined bliock', () => {
            expect(Block.adjustDifficulty({lastBlock: block, timestamp: (block.timestamp + MINE_RATE + 100)})).toEqual(block.difficulty-1);
        })

        it('never lowers the difficulty to zero', () => {
            block.difficulty = 0;
            expect(Block.adjustDifficulty({lastBlock: block, timestamp: (block.timestamp + MINE_RATE + 100)})).toEqual(1);
        })
        
    });

});