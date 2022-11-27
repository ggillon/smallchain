const Wallet = require('./index');
const Blockchain = require('../blockchain');
const Transaction = require('./transaction');
const { verifySignature } = require('../util');
const { STARTING_BALANCE } = require('../config');

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

        describe('and a chain is passed', () =>{
            it('calls Wallet.calculate Balance', ()=>{
                
                const calculateBalanceMock = jest.fn();

                const originalFunc = Wallet.calculateBalance;
                Wallet.calculateBalance = calculateBalanceMock;

                wallet.createTransaction({
                    recipient: 'foo',
                    amount: 10,
                    chain: new Blockchain().chain
                })
                expect(calculateBalanceMock).toHaveBeenCalled();
                Wallet.calculateBalance = originalFunc;
            })
        })
    })

    describe('calculateBalance()', ()=>{
        let blockchain;

        beforeEach(()=>{
            blockchain = new Blockchain();
        })

        describe('and there are no outputs for the wallet', ()=>{
            it('returns the starting balance', ()=>{
                expect(
                    Wallet.calculateBalance({
                        chain: blockchain.chain,
                        address: wallet.publicKey
                    })
                ).toEqual(STARTING_BALANCE);
                
            })
        })

        describe('and there are outputs for the wallet', ()=>{
            let transactionOne, transactionTwo;
            beforeEach(()=>{
                transactionOne = new Wallet().createTransaction({
                    recipient: wallet.publicKey,
                    amount:50
                });
                transactionTwo = new Wallet().createTransaction({
                    recipient: wallet.publicKey,
                    amount: 60
                });
                blockchain.addBlock( { data: [transactionOne, transactionTwo] } )
            });

            it('adds the sum of all outputs to the wallet balance', ()=>{
                expect(
                    Wallet.calculateBalance({
                        chain: blockchain.chain,
                        address: wallet.publicKey
                    })
                ).toEqual(STARTING_BALANCE +
                     transactionOne.outputMap[wallet.publicKey] +
                    transactionTwo.outputMap[wallet.publicKey]);
            })

            describe('and the wallet has made a transaction', ()=>{
                let recentTransaction;

                beforeEach(()=>{
                    recentTransaction = wallet.createTransaction({
                        recipient: 'foo',
                        amount: 30
                    });
                    blockchain.addBlock({data : [recentTransaction]});
                })

                it('returns the output amount of the recent transaction', ()=>{
                    expect(Wallet.calculateBalance({
                        chain: blockchain.chain,
                        address:wallet.publicKey
                        })).toEqual(recentTransaction.outputMap[wallet.publicKey])
                })

                describe('and there are outputs next to and after the recent transaction', ()=>{
                    let sameBlockTransaction, nextBlockTransaction;
                    beforeEach(()=>{
                        recentTransaction = wallet.createTransaction({
                            recipient: 'later-foo',
                            amount: 60
                        });
                        sameBlockTransaction = Transaction.rewardTransaction({minerWallet: wallet});
                        blockchain.addBlock({data : [recentTransaction, sameBlockTransaction]});

                        nextBlockTransaction = new Wallet().createTransaction({
                            recipient: wallet.publicKey,
                            amount: 75
                        });
                        blockchain.addBlock({data : [nextBlockTransaction]});
                    })

                    it('includes the output amount in the returned balance', ()=>{
                        expect(Wallet.calculateBalance({
                            chain: blockchain.chain,
                            address: wallet.publicKey})).toEqual(
                                recentTransaction.outputMap[wallet.publicKey] +
                                sameBlockTransaction.outputMap[wallet.publicKey] +
                                nextBlockTransaction.outputMap[wallet.publicKey]
                            )
                    })
                    
                })
            })

        });

    });

});