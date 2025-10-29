# Firebase Setup Guide

## 🔥 Setup Firebase Project

### 1. Buat Firebase Project
1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Klik "Add project" atau "Tambah project"
3. Masukkan nama project: `hiring-management`
4. (Opsional) Enable Google Analytics
5. Klik "Create project"

### 2. Setup Authentication
1. Di Firebase Console, pilih project Anda
2. Klik "Authentication" di sidebar kiri
3. Klik tab "Sign-in method"
4. Enable provider yang diinginkan:
   - **Email/Password**: Klik dan enable
   - **Google**: Klik, enable, dan setup OAuth consent screen
   - **Email Link**: Sudah termasuk dalam Email/Password

### 3. Setup Firestore Database
1. Klik "Firestore Database" di sidebar
2. Klik "Create database"
3. Pilih "Start in test mode" (untuk development)
4. Pilih lokasi server (pilih yang terdekat, contoh: asia-southeast1)

### 4. Setup Web App
1. Di project overview, klik icon web (</>) 
2. Masukkan app nickname: `hiring-management-web`
3. (Opsional) Setup Firebase Hosting
4. Klik "Register app"
5. **COPY CONFIG OBJECT** - ini yang akan dimasukkan ke `.env.local`

### 5. Configure Environment Variables
Buka file `.env.local` dan ganti dengan nilai dari Firebase Config:

\`\`\`bash
# Firebase Configuration - Ganti dengan nilai dari Firebase Console
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=hiring-management-xxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=hiring-management-xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=hiring-management-xxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:xxxxx
\`\`\`

### 6. Setup Google OAuth (untuk Google Sign-in)
1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Pilih project yang sama dengan Firebase
3. Buka "APIs & Services" > "Credentials"
4. Klik "Create Credentials" > "OAuth 2.0 Client IDs"
5. Pilih "Web application"
6. Tambahkan authorized domains:
   - `http://localhost:3000` (untuk development)
   - Domain production Anda
7. Copy Client ID dan paste ke Firebase Console > Authentication > Sign-in method > Google

## 🚀 Testing

### 1. Install Dependencies & Run
\`\`\`bash
npm install
npm run dev
\`\`\`

### 2. Test Features
- ✅ Email/Password Registration
- ✅ Email/Password Login
- ✅ Google Sign-in
- ✅ Password Reset
- ✅ Email Link Sign-in
- ✅ Logout

### 3. Check Firebase Console
- Lihat users yang registrasi di Authentication > Users
- Lihat user profiles di Firestore > users collection

## 🔧 Troubleshooting

### Error: "Firebase project not found"
- Pastikan PROJECT_ID di `.env.local` sesuai dengan Firebase Console

### Error: "API key not valid"
- Pastikan API_KEY di `.env.local` correct
- Check restrictions di Google Cloud Console

### Error: "Google Sign-in popup closed"
- Pastikan authorized domains sudah setup
- Check browser popup blocker

### Error: "Email link sign-in failed"
- Pastikan authorized domains include localhost:3000
- Check spam folder untuk email
- Pastikan URL di email mengarah ke `/login/verify`

### Error: "404 Not Found pada /login/verify"
- Halaman `/login/verify` sudah dibuat untuk handling email link authentication
- Pastikan server development berjalan di localhost:3000

## 📁 File Structure

\`\`\`
src/
├── lib/
│   ├── firebase.ts          # Firebase config
│   └── authService.ts       # Authentication service
├── hooks/
│   └── useAuth.ts          # Auth state hook
├── contexts/
│   └── AuthContext.tsx     # Auth context provider
└── pages/
    ├── Login/
    │   └── LoginPage.tsx   # Login page
    └── Register/
        └── RegisterPage.tsx # Register page
\`\`\`

## 🔐 Security Rules (Firestore)

Untuk production, update Firestore rules di Firebase Console:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Add more rules for other collections
  }
}
\`\`\`

## 🎯 Next Steps

1. **Buat halaman dashboard** untuk redirect setelah login
2. **Implement protected routes** untuk halaman yang memerlukan authentication
3. **Add user profile management** 
4. **Setup email templates** di Firebase Console untuk password reset & email verification
5. **Add logging & analytics** untuk monitoring authentication

## 📞 Support

Jika ada masalah, check:
1. Browser console untuk error messages
2. Firebase Console > Authentication > Users
3. Network tab untuk failed requests
4. Firebase Console > Project Settings > General untuk config