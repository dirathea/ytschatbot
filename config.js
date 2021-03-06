module.exports = {
    LINE_CHANNEL_ACCESS_TOKEN : process.env.LINE_CHANNEL_ACCESS_TOKEN || 'invalidAccessToken',
    LINE_CHANNEL_SECRET: process.env.LINE_CHANNEL_SECRET || 'invalidSecret',
    YTS_BASE_URL: process.env.YTS_BASE_URL || 'https://yts.ag/api/v2/',
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: JSON.parse(process.env.FIREBASE_PRIVATE_KEY),
    FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL,
    FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
    BASE_URL: process.env.BASE_URL,
    OS_USER_AGENT: process.env.OS_USER_AGENT || 'TemporaryUserAgent',
    SERIES_BASE_URL: process.env.SERIES_BASE_URL || 'https://oneom.tk/',
    FEEDER_MODE: process.env.FEEDER_MODE,
    FEEDER: process.env.FEEDER,
    COIN_BASE_URL: process.env.COIN_BASE_URL || '',
    COIN_SECRET: process.env.COIN_SECRET || 'invalidCoinSecret',
    COIN_HASH_NUMBER: process.env.COIN_HASH_NUMBER || 64
}