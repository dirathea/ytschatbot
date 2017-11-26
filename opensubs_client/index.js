const os = require('opensubtitles-api');
const config = require('../config');
const osClient = new os({
    useragent: config.OS_USER_AGENT,
    ssl: true,
});
class OpenSubsClient {
    getSubsLink(params) {
        return osClient.search(params)
        .then(subtitles => {
            if (subtitles.en) {
                return subtitles.en.url
            }
            return "";
        });
    }
}

module.exports = OpenSubsClient;