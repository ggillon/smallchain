const Blockchain = require('./blockchain');
const PubSub = require('./app/pubsub');
const TransactionPool = require('./wallet/transaction-pool');
const Wallet = require('./wallet');

const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubSub = new PubSub({blockchain, transactionPool});

setTimeout(() => test(), 1000);

function test() {
    console.log('testing...');
    pubSub.publish({channel: 'TEST', data: "hello"});
}
