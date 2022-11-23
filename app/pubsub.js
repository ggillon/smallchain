const redis = require ('redis');

const CHANNELS = {
    TEST: 'TEST',
    BLOCKCHAIN: 'BLOCKCHAIN'
};

class PubSub {
    constructor({blockchain}) {
        this.blockchain = blockchain;

        this.publisher = redis.createClient();
        this.subscriber = redis.createClient();
        this.publisher.connect();
        this.subscriber.connect();
        this.subscriber.subscribe(CHANNELS.TEST, (message)=>this.handleTestMessage(message));
        this.subscriber.subscribe(CHANNELS.BLOCKCHAIN, (message)=>this.handleBlockchainMessage(message));
    }


    publish(data) {

        this.subscriber.unsubscribe(CHANNELS.BLOCKCHAIN, () => {
            this.publisher.publish(CHANNELS.BLOCKCHAIN,JSON.stringify(data), () => {
                this.subscriber.subscribe(CHANNELS.BLOCKCHAIN, (message)=>this.handleBlockchainMessage(message));
            });
        });
    }

    broadcastChain() {
        this.publish(this.blockchain.chain);
    }

    handleTestMessage(message) {
        console.log(`Test message received. Message: ${message}.`);
    }

    handleBlockchainMessage(message) {
        const chain = JSON.parse(message);
        this.blockchain.replaceChain(chain);
    }

}

module.exports = PubSub, CHANNELS;


