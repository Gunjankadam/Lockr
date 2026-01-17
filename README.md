# Lockr 
Premium Secure Vault & Password Manager

Lockr is a military-grade, cross-platform security application designed to provide a "Secrets in your Pocket" experience. Built with a focus on high-fidelity UI/UX and uncompromising security, Lockr protects your digital life using a multi-layered authentication architecture.

---

##  Vision & Design Philosophy

Lockr isn't just a utility; it's a premium experience. 
- **Aesthetics First**: Utilizing Glassmorphism, fluid Framer Motion animations, and a curated "Zinc & Electric Blue" dark mode theme.
- **Privacy by Design**: No data is stored in plain text. Every interaction is gated by both server-side identity verification and local hardware-backed biometrics.
- **Native Performance**: Optimized for mobile responsiveness using Capacitor and native system hooks.

---

##  Technical Architecture

### 1. The Security Stack (Frontend to Backend)
- **Identity Layer**: JWT-based authentication via Email OTP.
- **Vault Layer**: Hardware-backed (TEE/SE) Biometric authentication.
- **Encryption Layer**: AES-256-CBC encryption for all sensitive fields (passwords, notes, custom fields) using a unique server-side master key and per-user salt logic.
- **Data Persistence**: Atomic MongoDB updates to prevent session corruption and state desync.

### 2. Core Modules
- **`useLockr` Hook**: The heart of the application, managing global state, entry decryption, and reactive settings sync.
- **`useBiometric` Hook**: An abstraction layer over `@capacitor/core` and `capacitor-native-biometric` for Fingerprint/FaceID enrollment and verification.
- **`apiClient` Utility**: Internal fetch wrapper that handles automatic Bearer token injection and 401 Unauthorized interceptors for automatic session protection.

---

##  Features in Detail

### Mobile Excellence
- **Hardware Biometrics**: Integrated Fingerprint/FaceID for instant vault unlocking.
- **Native Dialogs**: Using `@capacitor/dialog` for system-level enrollment prompts.
- **Safe Area Support**: Full compatibility with dynamic island and bottom gesture bars.

### Vault Management
- **Custom Categories**: Group your secrets into Banking, Social, Personal, etc., with dynamic icon sets.
- **Advanced Forms**: Store more than just passwords; add custom encrypted fields for security questions, PIN codes, or backup keys.
- **Security Health**: Real-time analysis of your password entropy and reuse across your vault.

### Automation & Control
- **Intelligent Auto-Lock**: configurable timers (5m, 10m, 30m) that trigger vault locking on app background or inactivity.
- **Session Persistence**: Smart local-cache logic that remembers your onboarding status even after device restarts, preventing annoying redundant setups.

---

## Development & Deployment

### Environment Configuration
The project uses a split-environment configuration:

**Mobile/Frontend (`/.env`):**
```env
VITE_API_URL=https://your-api.com/api
```

**Backend (`/backend/.env`):**
```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=super_secret_string
ENCRYPTION_KEY=64_char_hex_encryption_key
PORT=5003
```

### Installation Workflow

#### Step 1: Secure the Backend
```bash
cd backend
npm install
node server.js
```
*Note: Ensure your MongoDB instance is running and reachable.*

#### Step 2: Initialize Web Client
```bash
cd ..
npm install
npm run dev
```

#### Step 3: Mobile Synchronization (Android/iOS)
```bash
# Build the web assets
npm run build

# Sync with native platforms
npx cap sync

# Launch on Android Emulator
npx cap run android
```

---

## Authentication and Encryption Implemented

- [x] Email OTP Authentication
- [x] Biometric Unlock Integration
- [x] AES-256 Data Encryption
- [x] Security Health Dashboard
- [x] Two-way(client, server) encryption (zero knowledge)

---
## Download the application from here
 ![Image 3](https://github.com/Gunjankadam/SocialAnalyser/blob/main/image1.png)
  Scan to download 
---
## Screenshots

![Image 3](https://github.com/Gunjankadam/SocialAnalyser/blob/main/image1.png)
![Image 3](https://github.com/Gunjankadam/SocialAnalyser/blob/main/image1.png)
---

## Best Practices
- **JWT Lifespan**: Tokens are set to 7 days with automatic renewal on activity.
- **Encryption Key**: For production, the `ENCRYPTION_KEY` should be rotated and stored in a secure Secret Manager (AWS Secrets Manager / Vercel Secrets).
- **TLS**: Always serves the API over HTTPS to prevent MITM attacks on the OTP and JWT packets.

---

## 📄 License
Licensed under the **MIT License**.
