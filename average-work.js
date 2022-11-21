const Blockchain = require('./blockchain');

const blockchain = new Blockchain();

blockchain.addBlock({data: 'inital-data'});

let prevTimestamp, nextTimestamp, nextBlock, timeDiff, average;

const times = [];

for( let i = 0 ; i<10000 ; i++) {
    prevTimestamp = blockchain.lastBlock().timestamp;
    blockchain.addBlock({data: `block ${i}`});
    nextTimestamp = blockchain.lastBlock().timestamp;
    timeDiff = nextTimestamp - prevTimestamp;
    times.push(timeDiff);
    average = times.reduce((total,num) => (total+num)) / times.length;
    console.log('Time to mine bloc:', average);
}