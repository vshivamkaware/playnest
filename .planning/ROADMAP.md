# Execution Roadmap

## Phase 1: Project Scaffolding & Firebase Initialization
**Goal**: Initialize the Expo app with standard tooling and connect it to a configured Firebase project.
- [ ] Initialize Expo project with Expo Router, TypeScript, NativeWind.
- [ ] Setup folder structure (`app`, `components`, `features`, `services`, etc.).
- [ ] Initialize Firebase project (Auth, Firestore, Storage) and connect to the app.
- [ ] Set up state management (Zustand) and basic navigation.

## Phase 2: Authentication & Device Binding Policy
**Goal**: Implement robust authentication and enforce the one-device-per-account policy.
- [ ] Implement UI for Auth (Login/Signup).
- [ ] Integrate Firebase Email/Password & Google Login.
- [ ] Generate and store unique Device ID on login.
- [ ] Device binding logic (Block multi-device, trigger device change request).
- [ ] Hidden admin access check upon login.

## Phase 3: Core UI Framework & Navigation
**Goal**: Build the Netflix-style foundational layout.
- [ ] Implement Splash Screen & Animated Transitions.
- [ ] Build Main Tabs (Home, Search, Downloads, Profile).
- [ ] Build Hero Carousel and Horizontal Content Rows for the Home Screen.
- [ ] Create reusable UI components (Cards, Skeleton Loaders, Shimmer effects).

## Phase 4: Admin Dashboard & Content Management
**Goal**: Build the in-app admin tools to manage the platform.
- [ ] Admin Dashboard UI (Analytics overview).
- [ ] User Management Screen (List, Ban, Approve Device Change).
- [ ] Video Management Screen (Add, Edit, Delete).
- [ ] Category Management.
- [ ] Secure Firestore rules to restrict these write operations to admins only.

## Phase 5: Google Drive Integration & Video Data
**Goal**: Enable video streaming directly from Google Drive links.
- [ ] Build the Google Drive link parser to extract raw streaming URLs.
- [ ] Setup Firestore collections and schema for `videos` and `categories`.
- [ ] Hook up the Home screen to fetch real-time data from Firestore.
- [ ] Implement Video Details page (Poster, description, related).

## Phase 6: Video Player & Watch Tracking
**Goal**: Deliver a premium, feature-rich video streaming experience.
- [ ] Integrate Expo AV / Expo Video.
- [ ] Build custom UI for Video Player (seek, full-screen, gestures, subtitles, speed).
- [ ] Implement Watch History and Continue Watching tracking (updating Firestore).
- [ ] Add "Favorites" functionality.

## Phase 7: Secure Offline Downloads
**Goal**: Allow users to download videos for offline playback with AES encryption.
- [ ] Build download manager using Expo FileSystem.
- [ ] Implement AES-256 encryption using Expo Crypto / SecureStore for keys.
- [ ] Save encrypted files in the app's sandboxed directory.
- [ ] Implement on-the-fly decryption or chunked decryption for playback.
- [ ] Build the Downloads tab (Downloading, Paused, Completed).

## Phase 8: Polish, Security & Final Features
**Goal**: Lock down the app, add finishing touches, and prepare for release.
- [ ] Configure Firebase App Check.
- [ ] Setup Push Notifications (FCM).
- [ ] Subscriptions logic (Premium vs Free content restriction).
- [ ] Final UI Polish (Animations, error handling, empty states).
- [ ] Audit Firestore Security Rules.
