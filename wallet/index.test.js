const Wallet = require('./index');
const { verifySignature } = require('../util');

describe('Wallet', () => {
    let wallet;

    beforeEach(()=>{
        wallet = new Wallet();
    });

    it('generate a valide Wallet', () => {
        expect(wallet).toHaveProperty('balance');
        expect(wallet).toHaveProperty('publicKey');
        expect(wallet).not.toHaveProperty('privateKey'); 
    })

    describe('signing data', ()=> {
        wallet = new Wallet();
        const data = 'foo';
        it('verifies a signature', () => {
            expect(verifySignature({
                publicKey: wallet.publicKey,
                data,
                signature: wallet.sign(data),
            })).toBe(true);
        })

        it('invalidates corrupted/fake signature', () => {
            expect(verifySignature({
                publicKey: wallet.publicKey,
                data: "corrupted-data",
                signature: wallet.sign(data),
            })).toBe(false);
        })
    })

})