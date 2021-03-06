const config = require('../config');
const admin = require("firebase-admin");

admin.initializeApp({
    credential: admin.credential.cert({
      projectId: config.FIREBASE_PROJECT_ID,
      clientEmail: config.FIREBASE_CLIENT_EMAIL,
      privateKey: config.FIREBASE_PRIVATE_KEY,
    }),
    storageBucket: config.FIREBASE_STORAGE_BUCKET,
    databaseURL: config.FIREBASE_DATABASE_URL
  });

const firestore = admin.firestore();

class FirebaseClient {
    addWatchSession(userId, movieData) {
        const watchReference = firestore.collection('session');
        const now = new Date();
        return watchReference.add({
            userId,
            torrentUrl: movieData.movie,
            image: movieData.image,
            title: `${movieData.title} (${movieData.qty})`,
            custom: movieData.custom || false,
            date: now.getTime()
        }).then(result => {
            return {
                id: result.id,
                url: `${config.BASE_URL}/watch/${result.id}`
            };
        });
    }

    addUser(profile) {
        firestore.doc(`users/${profile.userId}`)
            .set(profile)
            .then(result => {
                console.log(`User ${profile.displayName} saved`);
            });
    }

    subscribeToSerial(userId, serialId) {
        const serialSubscriptionPath = `subscribe/${serialId}`;
        firestore.doc(serialSubscriptionPath)
            .get()
            .then(snapshot => {
                if (!snapshot.exists) {
                    return firestore.doc(serialSubscriptionPath)
                        .set({[userId]: true})
                } else {
                    return firestore.doc(serialSubscriptionPath)
                        .update({[userId]: true})
                }
            })
            .then(result => {
                console.log(`User ${userId} register as ${serialId} subscriber`);
            });
    }

    getFirestore() {
        return firestore;
    }
}

module.exports = FirebaseClient;