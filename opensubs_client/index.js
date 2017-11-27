const os = require('opensubtitles-api');
const config = require('../config');
const osClient = new os({
    useragent: config.OS_USER_AGENT,
    ssl: true,
});
class OpenSubsClient {
    getSubsLink(params) {
        console.log("Searching subs");
        const searchParams = Object.assign(params, {extensions: 'vtt'});
        console.log(searchParams);
        return osClient.search(searchParams)
        .then(subtitles => {
            if (subtitles.en) {
                console.log(subtitles.en);
                return subtitles.en.url
            }
            return "";
        });
    }
}

module.exports = OpenSubsClient;