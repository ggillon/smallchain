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

    describe('createTransaction()', () => {

        beforeEach(()=>{
            errorMock = jest.fn();
            global.console.error = errorMock;
        });

        it('throws an error if amount exceeds balance', () => {
            expect(() => wallet.createTransaction({ amount: 999999, recipient: 'foo-recipient' }))
              .toThrow('Amount exceeds balance');
          });

        it('creates a valid input', () => {
            const amount = 500;
            const recipient= "recipient-address";
            const transaction = wallet.createTransaction( { recipient, amount } );
            expect(transaction.input.amount).toEqual(wallet.balance);
            expect(transaction.input.address).toEqual(wallet.publicKey);
        })

        it('creates a expected output', () => {
            const amount = 500;
            const recipient= "recipient-address";
            const transaction = wallet.createTransaction( { recipient, amount } );
            expect(transaction.outputMap[wallet.publicKey]).toEqual(wallet.balance -  amount);
            expect(transaction.outputMap[recipient]).toEqual(amount);
        })
    })

})