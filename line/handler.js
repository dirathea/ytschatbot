class Handler {
    constructor(lineClient, ytsClient) {
        this.lineClient = lineClient;
        this.ytsClient = ytsClient;
    }

    handleRequest(payload) {
        console.log(payload);
        payload.events.forEach(event => {
            this.handleEvent(event);
        });
    }

    handleEvent(event) {
        const type = event.type;
        switch (type) {
            case 'message':
                this.lineClient.replyMessage(event.replyToken, {
                    type: 'text',
                    text: `Hello.. I'm YTS Bot, will help you search for movies from YIFY collections...`
                });
                break;
        
            default:
                console.log(`Unknown type ${type}`);
                break;
        }
    }
}

module.exports = Handler;