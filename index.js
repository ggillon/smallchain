const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const Blockchain = require('./blockchain');
const PubSub = require('./app/pubsub');
const TransactionPool = require('./wallet/transaction-pool');
const Wallet = require('./wallet');

//let HTTP_PORT = process.env.HTTP_PORT || 3000;

const DEFAULT_PORT = 3000;
let PEER_PORT;
if(process.env.GENERATE_PEER_PORT == 'true') {
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random()*1000);
}
const PORT = PEER_PORT || DEFAULT_PORT;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

const app = express();
app.use(bodyParser.json());

const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubSub = new PubSub({blockchain, transactionPool});

app.get('/api/blocks', (req, res) => {
    res.json(blockchain.chain);
});

app.post('/api/mine', (req, res) => {
    const { data } = req.body;
    blockchain.addBlock({ data });
    //console.log(`New block added: ${blockchain.lastBlock()}`);

    //p2pserver.syncChain();
    setTimeout(() => pubSub.broadcastChain(), 1000);
    
    res.redirect('/api/blocks');
})

app.post('/api/transact', (req, res) => {
    const { amount, recipient } = req.body;
    let transaction = transactionPool.existingTransaction({inputAddress: wallet.publicKey});
    try {
        if(transaction) {
            transaction.update({senderWallet: wallet, recipient, amount});
        } else {
            transaction = wallet.createTransaction({recipient, amount});
        }
    } catch(error) {
        return res.status(400).json({ type: 'error', message: error.message });
    }  

    
    transactionPool.setTransaction(transaction);
    pubSub.broadcastTransaction(transaction);
    res.json( { type: 'success', transaction });
})

app.get('/api/transact-pool-map', (req, res) => {
    res.json(transactionPool.transactionMap);
})

const syncRoot = () => {
    request( { url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (error, response, body) => {
        if(!error && response.statusCode === 200) {
            const rootChain = JSON.parse(body);
            console.log('Got root chain');
            blockchain.replaceChain(rootChain);
        }
    });

    request( { url: `${ROOT_NODE_ADDRESS}/api/transact-pool-map` }, (error, response, body) => {
        if(!error && response.statusCode === 200) {
            const rootPoolMap = JSON.parse(body);
            console.log('Got root transactionPool');
            transactionPool.setMap(rootPoolMap);
        }
    });
}

app.listen(PORT , ()=>{
    console.log(`listening at localhost:${PORT}`);
    if(PORT != DEFAULT_PORT) syncRoot();
});