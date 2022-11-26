const redis = require ('redis');

const CHANNELS = {
    TEST: 'TEST',
    BLOCKCHAIN: 'BLOCKCHAIN',
    TRANSACTION: 'TRANSACTION',
};

class PubSub {
    constructor({blockchain, transactionPool}) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.publisher = redis.createClient();
        this.subscriber = redis.createClient();
        this.publisher.connect();
        this.subscriber.connect();
        this.subscriber.subscribe(Object.values(CHANNELS), (message, channel) => this.handleMessage({channel, message}));
    }


    async publish({channel, data}) {
        console.log(`Publishing - Channel: ${channel}`);
        await this.subscriber.unsubscribe(channel);
        await this.publisher.publish(channel, JSON.stringify(data));
        await this.subscriber.subscribe(channel, (message, channel) => this.handleMessage({channel, message}));
    }

    broadcastChain() {
        this.publish({channel: CHANNELS.BLOCKCHAIN, data: this.blockchain.chain});
    }

    broadcastTransaction(transaction) {
        this.publish({channel: CHANNELS.TRANSACTION, data: transaction});
    }

    handleMessage({channel, message}) {
        
        console.log(`Message received. Channel : ${channel}`);
        if(channel == CHANNELS.TEST) {
            console.log(`Test message - Message: ${message}.`);
        }
        
        if(channel == CHANNELS.BLOCKCHAIN) {
            const chain = JSON.parse(message);
            this.blockchain.replaceChain(chain);
        } 

        if(channel == CHANNELS.TRANSACTION) {
            const transaction = JSON.parse(message);
        this.transactionPool.setTransaction(transaction);
        }
    }
}

module.exports = PubSub, CHANNELS;




/*

constructor

        //this.subscriber.on("message", (channel, message) => this.handleMessage(channel, message));
        //his.subscriber.subscribe([CHANNELS.TEST, CHANNELS.BLOCKCHAIN, CHANNELS.TRANSACTION], (message)=>this.handleMessage(message));
        //this.subscriber.subscribe(CHANNELS.BLOCKCHAIN, (message)=>this.handleBlockchainMessage(message));
        //this.subscriber.subscribe(CHANNELS.TRANSACTION, (message)=>this.handleTransactionMessage(message));


Publish
        this.subscriber.unsubscribe(channel, () => {
            this.publisher.publish(channel,JSON.stringify(data), () => {
                this.subscriber.subscribe(channel, (message)=>this.handleTestMessage(message));
            });
        });



*/