class Handler {
    constructor(lineClient, ytsClient) {
        this.lineClient = lineClient;
        this.ytsClient = ytsClient;
    }

    handleRequest(events) {
        console.log(events);
    }
}

module.exports = Handler;