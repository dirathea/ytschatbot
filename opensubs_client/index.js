const os = require('opensubtitles-api');
const config = require('../config');
const osClient = new os({
    useragent: config.OS_USER_AGENT,
    ssl: true,
});
class OpenSubsClient {
    getSubsLink(params) {
        console.log("Searching subs");
        const searchParams = Object.assign(params);
        console.log(searchParams);
        return osClient.search(searchParams)
        .then(subtitles => {
            console.log(subtitles);
            if (subtitles.en) {
                return subtitles.en.url
            }
            return "";
        });
    }
}

module.exports = OpenSubsClient;