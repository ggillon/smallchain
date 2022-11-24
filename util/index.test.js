const { cryptoHash, verifySignature } = require('../util');

describe('cryptoHash()', ()=>{

    it('generates a SHA-256 hashed output', ()=> {
        expect(cryptoHash('foo')).toEqual('b2213295d564916f89a6a42455567c87c3f480fcd7a1c15e220f17d7169a790b');
    });

    it('produces always same hash with same input in any order', () =>{
        expect(cryptoHash('one','two','three')).toEqual(cryptoHash('three', 'two', 'one'));
    });

    it('produces different has when object is modified', () => {
        const foo = {};
        const original = cryptoHash(foo);
        foo['a'] = 'a';
        const modified = cryptoHash(foo);
        expect(modified).not.toEqual(original);
    })

});

/*
describe('verifySignature', () => {
    it('validates a correct sgnau')
})*/
