const os = require('opensubtitles-api');
const osClient = new os({
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