const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');

const HTTP_PORT = process.env.HTTP_PORT || 3000;


const app = express();

app.use(bodyParser.json());

const blockchain = new Blockchain();

app.get('/api/blocks', (req, res) => {
    res.json(blockchain.chain);
});

app.post('/api/mine', (req, res) => {
    const { data } = req.body;
    blockchain.addBlock({ data });
    console.log(`New block added: ${blockchain.lastBlock()}`);

    //p2pserver.syncChain();
    
    res.redirect('/api/blocks');
})

app.listen(HTTP_PORT , ()=>{
    console.log(`listening at localhost:${HTTP_PORT}`)
});