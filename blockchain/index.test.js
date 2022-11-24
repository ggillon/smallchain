const Blockchain = require('.');
const Block = require('./block');
const { cryptoHash } = require('../util');


describe('Blockchain', () => {
    let blockchain = new Blockchain();

    it('contains a chain array', () => {
        expect(blockchain.chain instanceof Array).toBe(true);
    })

    it('starts with the genesis block', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    })

    it('adds a new block to the chain', () => {
        const data = 'new-foo';
        blockchain.addBlock({data});
        expect(blockchain.chain[blockchain.chain.length-1].data).toEqual(data);
    })

    describe('isValidChain()', () => {

        beforeEach(()=>{
            blockchain = new Blockchain();
            for(let i=1; i<4; i++) {
                blockchain.addBlock({data: `data ${i}`});
            }
        })
        
        it('validates a valid chain', () => {
            //console.log(blockchain);
            expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
        })
    
        it('invalidates a corrupt chain due to genesis block', () => {
            blockchain.chain[0].timestamp = 'corrupted-timestamp';
            expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        })

        it('invalidates a corrupt chain due to hash chain', () => {
            blockchain.chain[1].hash = 'corrupted-hash';
            expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        })

        it('invalidates a corrupt chain due to hash chain', () => {
            blockchain.chain[1].data = 'corrupted-data';
            expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        })

        it('invalides a chain with a difficulty jump', ()=> {
            const lastBlock = blockchain.lastBlock();
            const lastHash = lastBlock.hash;
            const timestamp = Date.now();
            const nonce = 0;
            const data = 'Fake transaction';
            const difficulty = lastBlock.difficulty - 3;

            const hash = cryptoHash(timestamp, lastHash, difficulty, nonce, data);

            const badBlock = new Block({timestamp, lastHash, hash, nonce, difficulty, data});

            blockchain.chain.push(badBlock);

            expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            
        })

    })

    describe('replaceChain()', () => {

        let errorMock, logMock;
        blockchain = new Blockchain();
        for(let i=1; i<4; i++) {
            blockchain.addBlock({data: `data ${i}`});
        }

        beforeEach(()=>{
            errorMock = jest.fn();
            logMock = jest.fn();

            global.console.error = errorMock;
            global.console.log = logMock;
        })


        it('does not replace with a shorter chain', () => {
            const newBlockChain = new Blockchain();
            newBlockChain.addBlock({data: '1'});
            blockchain.replaceChain(newBlockChain.chain);
            expect(blockchain.chain).not.toEqual(newBlockChain.chain);
        })

        it('does not replace with a unvalid chain', () => {
            const newBlockChain = new Blockchain();
            for(let i=1; i<5; i++) {
                newBlockChain.addBlock({data: `data ${i}`});
            }
            newBlockChain.chain[1].data = "corrupted-data";
            blockchain.replaceChain(newBlockChain.chain);
            expect(blockchain.chain).not.toEqual(newBlockChain.chain);
        })

        it('does replace with a valid longer chain', () => {
            const newBlockChain = new Blockchain();
            for(let i=1; i<5; i++) {
                newBlockChain.addBlock({data: `data ${i}`});
            }
            blockchain.replaceChain(newBlockChain.chain);
            expect(blockchain.chain).toEqual(newBlockChain.chain);
        })



    })

    

})