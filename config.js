module.exports = {
    LINE_CHANNEL_ACCESS_TOKEN : process.env.LINE_CHANNEL_ACCESS_TOKEN || 'invalidAccessToken',
    LINE_CHANNEL_SECRET: process.env.LINE_CHANNEL_SECRET || 'invalidSecret',
    YTS_BASE_URL: process.env.YTS_BASE_URL || 'https://yts.ag/api/v2/',
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
    FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL
}