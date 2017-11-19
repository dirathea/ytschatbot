class Handler {
    constructor(lineClient, ytsClient) {
        this.lineClient = lineClient;
        this.ytsClient = ytsClient;
    }

    handleRequest(payload) {
        payload.events.forEach(event => {
            this.handleEvent(event);
        });
    }

    handleEvent(event) {
        const type = event.type;
        switch (type) {
            case 'message':
                this.handleMessageEvent(event);
                break;
        
            default:
                console.log(`Unknown type ${type}`);
                break;
        }
    }

    handleMessageEvent(event) {
        const type = event.message.type;
        switch (type) {
            case 'text':
                this.handleTextMessage(event.replyToken, event.source, event.message.text);
                break;
        
            default:
                console.log(`unhandled message type ${type}`);
                break;
        }
    }

    handleTextMessage(replyToken, source, text) {
        const token = text.split(' ');
        const keyword = token[0].toLowerCase();
        const term = token.slice(1, token.length).join(' ');
        switch (keyword) {
            case 'search':
                this.ytsClient.searchMovie(term)
                    .then(result => {
                        console.log(result);
                    })
                    .catch(err => {
                        console.log(err);
                    });
                break;
            default:
                console.log(`unknown keyword ${keyword}`);
                break;
        }
    }
}

module.exports = Handler;