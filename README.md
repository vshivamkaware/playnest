# 🎬 PlayNest

> A modern, premium OTT video streaming platform built with Expo (React Native) and Firebase — delivering a Netflix-like experience with zero infrastructure costs.

<p align="center">
  <img src="./playnest/assets/images/icon.png" alt="PlayNest Logo" width="120" height="120" style="border-radius: 24px;" />
</p>

---

## ✨ Overview

PlayNest is a **full-featured Android video streaming application** that uses **Google Drive** as the video source and **Firebase** as the backend. Administrators upload videos to Google Drive, paste the link into the app's admin dashboard, and users enjoy a premium streaming experience — all from a single mobile application.

### Why PlayNest?

| Feature | Traditional OTT | PlayNest |
|---------|----------------|----------|
| Video Hosting | AWS/GCP CDN ($$$) | Google Drive (Free) |
| Backend | Custom servers | Firebase Free Tier |
| Admin Panel | Separate web app | Built into the same app |
| Cost | $100s/month | ~$0/month |

---

## 🎯 Key Features

### For Users
- 🎥 **Stream videos** directly from Google Drive with no buffering
- 📱 **Premium Netflix-style UI** with hero carousel, horizontal lists, and dark theme
- 📥 **Secure offline downloads** with AES-256 encryption in app sandbox
- 🔐 **One account = one device** policy to prevent account sharing
- 💳 **Per-video purchases** via UPI payment with admin approval
- 🎬 **Full-screen video player** with landscape mode, seek controls

### For Admins
- 📊 **In-app admin dashboard** — manage everything from your phone
- 🎞️ **Video management** — add, edit, delete, hide/show, set free or premium
- 👥 **User management** — view users, ban/unban, approve device changes
- 💰 **Payment management** — review and approve/reject payment requests
- ⚙️ **Settings** — configure UPI ID for payments
- 🔒 **Hidden admin access** — admin tab only visible to authorized users

### Security
- 🛡️ **Device binding** — each account locked to one physical device
- 🔑 **Firebase Auth** with email/password authentication
- 📋 **Firestore Security Rules** — role-based access control
- 🗝️ **Encrypted downloads** — videos stored as `.playnest` files, not playable outside the app
- 🧹 **Auto-cleanup** — decrypted playback files deleted after viewing

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Expo](https://expo.dev/) (React Native) with TypeScript |
| **Navigation** | [Expo Router](https://docs.expo.dev/router/) (file-based routing) |
| **State** | [Zustand](https://github.com/pmndrs/zustand) |
| **Auth** | [Firebase Authentication](https://firebase.google.com/docs/auth) |
| **Database** | [Cloud Firestore](https://firebase.google.com/docs/firestore) |
| **Storage** | Google Drive (videos), Firebase Storage (thumbnails) |
| **Video Player** | [expo-video](https://docs.expo.dev/versions/latest/sdk/video/) |
| **Encryption** | [crypto-js](https://github.com/brix/crypto-js) (AES-256-CBC) |
| **Icons** | [lucide-react-native](https://lucide.dev/) |
| **Styling** | React Native StyleSheet + [NativeWind](https://www.nativewind.dev/) |
| **Animations** | [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) |
| **Build** | [EAS Build](https://docs.expo.dev/build/introduction/) |

---

## 📁 Project Structure

```
playnest/
├── app/                          # Expo Router — file-based screens
│   ├── _layout.tsx               # Root layout with AuthProvider
│   ├── +html.tsx                 # Web HTML template
│   ├── +not-found.tsx            # 404 screen
│   ├── (auth)/                   # Auth flow (unauthenticated users)
│   │   ├── _layout.tsx           # Auth stack layout
│   │   ├── login.tsx             # Login screen
│   │   ├── register.tsx          # Registration screen
│   │   └── device-verification.tsx # Device binding verification
│   ├── (tabs)/                   # Main tabbed interface
│   │   ├── _layout.tsx           # Tab navigation layout
│   │   ├── index.tsx             # Home — featured + categorized videos
│   │   ├── downloads.tsx         # Offline downloaded videos
│   │   ├── profile.tsx           # User profile & settings
│   │   └── admin.tsx             # Admin dashboard (hidden for non-admins)
│   ├── video/
│   │   └── [id].tsx              # Video detail & payment screen
│   └── player/
│       └── [id].tsx              # Full-screen video player
│
├── components/                   # Reusable UI components
│   ├── admin/                    # Admin-specific components
│   │   ├── VideoManager.tsx      # CRUD for videos
│   │   ├── PaymentRequests.tsx   # Approve/reject payments
│   │   ├── DeviceRequests.tsx    # Approve device changes
│   │   ├── UserManagement.tsx    # Ban/unban users
│   │   └── SettingsManager.tsx   # App settings (UPI ID)
│   └── ui/                       # Shared UI components
│       ├── HeroCarousel.tsx      # Featured video carousel
│       ├── HorizontalVideoList.tsx # Horizontal scrolling row
│       └── Skeleton.tsx          # Loading skeleton/shimmer
│
├── features/                     # Feature modules
│   └── auth/
│       └── AuthProvider.tsx      # Firebase auth state + device binding
│
├── hooks/                        # Custom React hooks
│   └── useProtectedRoute.ts     # Route guard based on auth state
│
├── services/                     # Business logic & API layer
│   ├── firebase/
│   │   ├── config.ts            # Firebase initialization
│   │   ├── userService.ts       # User CRUD operations
│   │   └── videoService.ts      # Video CRUD operations
│   ├── downloads/
│   │   └── DownloadManager.ts   # Encrypted download management
│   ├── encryption/
│   │   └── AESService.ts        # AES-256-CBC encrypt/decrypt
│   └── downloadService.ts       # Legacy download helper
│
├── store/                        # Global state management
│   └── useAuthStore.ts          # Zustand auth store
│
├── types/                        # TypeScript type definitions
│   └── index.ts                 # User, Video, Category interfaces
│
├── utils/                        # Utility functions
│   └── device.ts                # Device ID generation
│
├── assets/                       # Static assets
│   ├── fonts/
│   │   └── SpaceMono-Regular.ttf
│   └── images/
│       ├── icon.png             # App icon
│       ├── splash-icon.png      # Splash screen icon
│       └── favicon.png          # Web favicon
│
├── app.json                      # Expo configuration
├── eas.json                      # EAS Build profiles
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript configuration
├── babel.config.js               # Babel configuration
├── metro.config.js               # Metro bundler configuration
├── tailwind.config.js            # NativeWind/Tailwind configuration
├── firebase.json                 # Firebase project configuration
├── firestore.rules               # Firestore security rules
├── firestore.indexes.json        # Firestore composite indexes
├── .firebaserc                   # Firebase project alias
└── .env                          # Environment variables (not committed)
```

---

## 🗄️ Database Structure (Firestore)

### Collections Overview

```
firestore/
├── users/                   # User accounts & device binding
├── videos/                  # Video metadata & Drive links
├── paymentRequests/         # UPI payment verification queue
└── settings/                # App-wide configuration
```

### `users/{userId}`

Stores user profile, device binding, and access control.

| Field | Type | Description |
|-------|------|-------------|
| `email` | `string` | User's email address |
| `deviceId` | `string` | Bound device identifier (e.g., `Pixel_7_abc123`) |
| `deviceStatus` | `string` | `APPROVED` \| `BLOCKED` — device verification status |
| `isAdmin` | `boolean` | Whether the user has admin privileges |
| `role` | `string` | Optional role field (`admin` \| `user`) |
| `isBanned` | `boolean` | Whether the user is banned from the platform |
| `unlockedVideos` | `string[]` | Array of video IDs the user has purchased |
| `createdAt` | `Timestamp` | Account creation timestamp |

**Example document:**
```json
{
  "email": "user@example.com",
  "deviceId": "Pixel_7_abc123def456",
  "deviceStatus": "APPROVED",
  "isAdmin": false,
  "isBanned": false,
  "unlockedVideos": ["video1", "video2"],
  "createdAt": "2026-07-12T10:00:00Z"
}
```

---

### `videos/{videoId}`

Stores video metadata and Google Drive link.

| Field | Type | Description |
|-------|------|-------------|
| `title` | `string` | Video title displayed to users |
| `description` | `string` | Video description/synopsis |
| `driveLink` | `string` | Google Drive sharing link |
| `thumbnailUrl` | `string` | Thumbnail image URL |
| `category` | `string` | Category name (e.g., `Movies`, `Courses`) |
| `isPremium` | `boolean` | `true` = requires payment, `false` = free |
| `price` | `number` | Price in INR (0 if free) |
| `isHidden` | `boolean` | `true` = hidden from users, visible only to admins |
| `createdAt` | `Timestamp` | Video creation timestamp |

**Example document:**
```json
{
  "title": "React Native Masterclass",
  "description": "Complete guide to building mobile apps",
  "driveLink": "https://drive.google.com/file/d/1ABC.../view",
  "thumbnailUrl": "https://example.com/thumb.jpg",
  "category": "Courses",
  "isPremium": true,
  "price": 99,
  "isHidden": false,
  "createdAt": "2026-07-12T10:00:00Z"
}
```

---

### `paymentRequests/{requestId}`

Tracks UPI payment verification requests from users.

| Field | Type | Description |
|-------|------|-------------|
| `userId` | `string` | UID of the user who made the payment |
| `userEmail` | `string` | Email of the user |
| `videoId` | `string` | Video ID being purchased |
| `videoTitle` | `string` | Title of the video |
| `amount` | `number` | Payment amount in INR |
| `utrNumber` | `string` | UPI Transaction Reference number |
| `status` | `string` | `pending` \| `approved` \| `rejected` |
| `createdAt` | `Timestamp` | Request submission timestamp |

**Example document:**
```json
{
  "userId": "uid_abc123",
  "userEmail": "user@example.com",
  "videoId": "video_xyz",
  "videoTitle": "React Native Masterclass",
  "amount": 99,
  "utrNumber": "UTR123456789",
  "status": "pending",
  "createdAt": "2026-07-12T12:00:00Z"
}
```

---

### `settings/{docId}`

App-wide configuration managed by admins.

| Document | Field | Type | Description |
|----------|-------|------|-------------|
| `payment` | `adminUpiId` | `string` | UPI ID displayed to users for payment |

**Example document (`settings/payment`):**
```json
{
  "adminUpiId": "admin@upi"
}
```

---

## 🔐 Security Architecture

### Device Binding Flow

```
User registers → Device ID generated → Stored in Firestore
                                              ↓
User logs in from SAME device → deviceId matches → ✅ Access granted
                                              ↓
User logs in from NEW device → deviceId mismatch → ❌ Blocked
                                              ↓
                                    Device change request sent to admin
                                              ↓
                              Admin approves → Device updated → ✅ Access granted
```

### Firestore Security Rules Summary

| Collection | Read | Write |
|------------|------|-------|
| `users` | Own document or admin | Own document (no privilege escalation) or admin |
| `videos` | All authenticated (non-hidden) or admin (all) | Admin only |
| `paymentRequests` | Own requests or admin | Create: own requests, Update/Delete: admin only |
| `settings` | All authenticated | Admin only |

### Encryption

- **Algorithm**: AES-256-CBC via `crypto-js`
- **Storage**: Downloaded files saved as `.playnest` extension in app sandbox
- **Playback**: Files temporarily decrypted to `.mp4` in cache, auto-deleted after viewing

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [EAS CLI](https://docs.expo.dev/build/setup/) (for building APKs)
- [Firebase Project](https://console.firebase.google.com/) with Firestore and Auth enabled
- Android device or emulator

### 1. Clone the Repository

```bash
git clone https://github.com/vshivamkaware/playnest.git
cd playnest/playnest
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `playnest/` directory:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

> ⚠️ **Never commit `.env` to version control.** It is already in `.gitignore`.

### 4. Set Up Firebase

#### a. Enable Authentication
1. Go to **Firebase Console** → **Authentication** → **Sign-in method**
2. Enable **Email/Password** provider

#### b. Create Firestore Database
1. Go to **Firebase Console** → **Firestore Database** → **Create database**
2. Start in **production mode**
3. Deploy security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

#### c. Deploy Indexes
```bash
firebase deploy --only firestore:indexes
```

### 5. Set Up Admin Account

1. Register a new account in the app with the email `admin@sv.in`
2. The `AuthProvider` automatically bootstraps this email as admin
3. To change the admin email, update it in:
   - `firestore.rules` → `isAdmin()` function
   - `features/auth/AuthProvider.tsx` → `isFallbackAdmin` check

### 6. Run the App

```bash
# Start the development server
npx expo start

# Run on Android device/emulator
npx expo run:android
```

### 7. Build APK for Distribution

```bash
# Login to EAS
npx eas-cli login

# Build APK (preview profile)
npx eas-cli build -p android --profile preview

# Build APK (production profile)
npx eas-cli build -p android --profile production
```

---

## 📱 Adding Videos (Admin Workflow)

1. **Upload video to Google Drive**
2. **Set sharing** to "Anyone with the link can view"
3. **Copy the sharing link** (e.g., `https://drive.google.com/file/d/1ABC.../view`)
4. **Open PlayNest** → **Admin** tab → **Videos** → **Add Video**
5. **Paste the Drive link**, fill in title, description, category, price
6. **Save** — the video is immediately available to users

---

## 💳 Payment Flow

```
User taps Premium video → Sees price + admin UPI ID
        ↓
User pays via any UPI app → Enters UTR number in PlayNest
        ↓
Payment request created (status: pending)
        ↓
Admin reviews in Admin → Payment Requests tab
        ↓
Admin approves → Video added to user's unlockedVideos array
        ↓
User can now stream and download the video
```

---

## 🛠️ Utility Scripts

| Script | Description |
|--------|-------------|
| `upload_video.mjs` | Programmatically add a video to Firestore |
| `verify_admin.mjs` | Verify and set admin privileges for a user |
| `verify_user.mjs` | Debug user document and device binding status |

---

## 📋 Firebase Configuration Files

| File | Purpose |
|------|---------|
| `firebase.json` | Firebase CLI project configuration |
| `.firebaserc` | Maps project aliases to Firebase project IDs |
| `firestore.rules` | Security rules for Firestore collections |
| `firestore.indexes.json` | Composite index definitions for queries |

---

## 🗺️ Roadmap

- [x] **Phase 1**: Project scaffolding & Firebase initialization
- [x] **Phase 2**: Authentication & device binding
- [x] **Phase 3**: Core Netflix-style UI
- [x] **Phase 4**: Admin dashboard & content management
- [x] **Phase 5**: Google Drive integration & video streaming
- [x] **Phase 6**: Video player with full-screen mode
- [x] **Phase 7**: Secure offline downloads with encryption
- [x] **Phase 8**: Payment flow, polish & final features
- [ ] **Phase 9**: Push notifications (FCM)
- [ ] **Phase 10**: Search with history & suggestions
- [ ] **Phase 11**: Watch history & continue watching
- [ ] **Phase 12**: Subtitle support
- [ ] **Phase 13**: Firebase App Check
- [ ] **Phase 14**: Root/emulator detection

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](./playnest/LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Expo](https://expo.dev/) for the amazing React Native development platform
- [Firebase](https://firebase.google.com/) for the serverless backend
- [Lucide](https://lucide.dev/) for beautiful icons
- [Zustand](https://github.com/pmndrs/zustand) for simple state management

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/vshivamkaware">Shivam Kaware</a>
</p>
