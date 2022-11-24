const Transaction = require('./wallet/transaction');
const Wallet = require('./wallet/index');
const { verifySignature, cryptoHash } = require('./util');

senderWallet = new Wallet();
recipient = 'recipient-public-key';
amount = 50;

transaction = new Transaction({senderWallet, recipient, amount});

//console.log(cryptoHash('foo'));
//console.log(cryptoHash('goo'));

console.log(cryptoHash(senderWallet.sign("foo")));
console.log(cryptoHash(senderWallet.sign("foo")));
console.log(cryptoHash(JSON.stringify(senderWallet.sign("foo"))));
console.log(cryptoHash(JSON.stringify(senderWallet.sign("goo"))));