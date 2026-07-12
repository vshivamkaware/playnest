# OTT Streaming Platform

## What This Is
A modern OTT video streaming Android application built with Expo (React Native) and Firebase. It delivers a premium viewing experience similar to Netflix or Disney+ Hotstar, without the massive infrastructure overhead. Videos are hosted on Google Drive, and metadata/users are managed via Firebase (free tier). The platform includes a unified app for both users and administrators, enforcing strict one account = one device security, encrypted offline downloads, and dynamic content management.

## Core Value
To provide an affordable, highly scalable, and secure platform for delivering premium video content (courses, movies, private lectures) with zero to minimal server costs, maintaining a high-end user experience and effective content protection against casual piracy.

## Context
- Netflix UI + Firebase Backend + Google Drive Storage + Offline Secure Downloads.
- Admin manages everything from the same app via hidden login.
- "One account = one device" is the primary security feature.
- Downloaded files are encrypted (AES-256) and saved in app sandbox, not directly playable outside the app.

## Target Audience
- Users accessing premium educational content, tutorials, corporate training, or licensed movies.
- Administrators who need to manage content directly from a mobile device without setting up complex web CMS or dedicated video hosting platforms.

## Requirements

### Validated
(None yet — ship to validate)

### Active
- [ ] Expo React Native Mobile App (Android focus, Expo Router, NativeWind)
- [ ] Firebase Backend (Auth, Firestore, Storage for images, Cloud Functions, App Check, FCM)
- [ ] Google Drive Video Streaming Integration
- [ ] Unified App with Hidden Admin Dashboard
- [ ] Strict "One Account = One Device" binding & request approval flow
- [ ] Secure Offline Downloads (AES-256 encryption in Expo FileSystem)
- [ ] Premium Netflix-style UI (Hero carousel, horizontal lists, glassmorphism, skeletons)
- [ ] Advanced Video Player (Seek, subtitles, speed, quality, gestures, auto-resume)
- [ ] Watch History & Continue Watching tracking
- [ ] User Subscription Management (Free, Premium, Monthly, Yearly)
- [ ] Role-based Firestore Security Rules

### Out of Scope
- [ ] Dedicated Web CMS (Admin is in-app)
- [ ] Dedicated Backend Server (Serverless Firebase only)
- [ ] Hollywood-grade DRM (e.g., Widevine) - using basic AES encryption to raise the bar against casual copying
- [ ] Video Transcoding/Encoding - relying on Google Drive streaming

## Key Decisions
| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Google Drive for Video Storage | Keeps infrastructure costs near zero while providing decent streaming bandwidth | — Pending |
| In-app Admin Dashboard | Simplifies development and allows admins to manage platform on-the-go | — Pending |
| App-Sandbox AES Encryption | Balances development effort with security, preventing casual access to downloaded video files | — Pending |
| One Device Per Account | Limits account sharing which is critical for paid/premium content businesses | — Pending |

---
*Last updated: 2026-07-12 after initialization*
