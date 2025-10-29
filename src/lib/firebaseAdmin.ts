import admin from 'firebase-admin';

if (!admin.apps.length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : undefined;

  try {
    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      });
    } else {
      admin.initializeApp();
    }
  } catch (err) {
    console.error('Firebase admin initialization error:', err);
  }
}

export default admin;
