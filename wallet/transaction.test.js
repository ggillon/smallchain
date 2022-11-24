const Transaction = require('./transaction');
const Wallet = require('./index');
const { verifySignature } = require('../util');

describe('Transaction', () => {
    let senderWallet;
    let transaction;

    beforeEach(()=>{
        senderWallet = new Wallet();
        recipient = 'recipient-public-key';
        amount = 50;

        transaction = new Transaction({senderWallet, recipient, amount});
    })

    it('has ID, timestamp, Input and Output Map', () => {
        expect(transaction).toHaveProperty('id');
        expect(transaction).toHaveProperty('input');
        expect(transaction).toHaveProperty('outputMap');
    })

    it('sets in the input: a timestamp, amount equal to the balance of sender & address to public key of sender', () => {
        expect(transaction.input).toHaveProperty('timestamp');
        expect(transaction.input.amount).toEqual(senderWallet.balance);
        expect(transaction.input.address).toEqual(senderWallet.publicKey);
    })

    it('signs the input', () =>{
        expect(verifySignature({
            publicKey: senderWallet.publicKey,
            data: transaction.outputMap,
            signature: transaction.input.signature
        })).toBe(true);
    })

    it('outputs the amount to the recipient', () => {
        expect(transaction.outputMap[recipient]).toEqual(amount);
    })

    it('outputs the remaining balance of the sender', () => {
        expect(transaction.outputMap[senderWallet.publicKey]).toEqual(senderWallet.balance - amount);
    })

    describe('validTransaction()', ()=>{
        let errorMock;

        beforeEach(()=>{
            errorMock = jest.fn();
            global.console.error = errorMock;
        })


        describe('when transaction is valid', () => {
            it('validates a correct transaction', ()=>{
                expect(Transaction.validTransaction(transaction)).toBe(true);
            })
        })
        describe('when the transaction is invalide', () => {
            it('invalidates a corrupted outputMap transaction', ()=>{
                transaction.outputMap[senderWallet.publicKey] = 500;
                transaction.outputMap[recipient] = 500;
                expect(Transaction.validTransaction(transaction)).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            })
            it('invalidates a corrupted signature transaction', ()=>{
                transaction.input.signature = senderWallet.sign("corrupted-data");
                expect(Transaction.validTransaction(transaction)).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            })
        })
    })


})
    
