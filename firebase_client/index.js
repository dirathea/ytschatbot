const config = require('../config');
const admin = require("firebase-admin");

admin.initializeApp({
    credential: admin.credential.cert({
      projectId: config.FIREBASE_PROJECT_ID,
      clientEmail: config.FIREBASE_CLIENT_EMAIL,
      privateKey: config.FIREBASE_PRIVATE_KEY
    }),
    databaseURL: config.FIREBASE_DATABASE_URL
  });

const firestore = admin.firestore();

class FirebaseClient {
    addWatchSession(userId, torrentUrl) {
        const watchReference = firestore.collection('session');
        return watchReference.add({
            userId,
            torrentUrl
        }).then(result => {
            return `${config.BASE_URL}/watch/${result.id}`;
        });
    }
}

module.exports = FirebaseClient;