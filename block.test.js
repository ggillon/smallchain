const Block = require('./block');

describe('Block', () => {
    const timestamp = '01-01-2023';
    const lastHash = "foo-hash";
    const hash = "goo-hash";
    const data = {"name": "Gatien", "age": 40};
    const block = new Block({timestamp, lastHash, hash, data});

    beforeEach(()=>{

    });

    it('Creates the block properly', () => {
        expect(block.timestamp).toEqual(timestamp);
        expect(block.lastHash).toEqual(lastHash);
        expect(block.hash).toEqual(hash);
        expect(block.data).toEqual(data);
    });

});