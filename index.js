const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const Blockchain = require('./blockchain');
const PubSub = require('./app/pubsub');

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
const pubSub = new PubSub({blockchain});

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

const syncChains = () => {
    request( { url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (error, response, body) => {
        if(!error && response.statusCode === 200) {
            const rootChain = JSON.parse(body);
            console.log('Got root chain');
            blockchain.replaceChain(rootChain);
        }
    });
}


app.listen(PORT , ()=>{
    console.log(`listening at localhost:${PORT}`);
    syncChains();
});