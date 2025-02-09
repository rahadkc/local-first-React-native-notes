# Local-Test-Own

## Overview
This is a **React Native** offline-first task management app using **TinyBase**, **Firebase Realtime Database**, and **Expo SQLite**. It supports real-time sync across devices and ensures offline data is stored and automatically updated when online.

## Features
- **Offline-First**: Uses Expo SQLite for local storage.
- **Real-Time Sync**: Firebase Realtime Database keeps data in sync.
- **TinyBase Integration**: Efficient local state management.
- **Cross-Platform**: Runs on Android, iOS, and Web via Expo.

## Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/your-username/local-test-own.git
   cd local-test-own
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm start
   ```

## Available Scripts
- `npm start` – Run the app.
- `npm run android` – Start on Android.
- `npm run ios` – Start on iOS.
- `npm run web` – Start on Web.
- `npm test` – Run Jest tests.

## Technologies Used
- **React Native**
- **Expo**
- **TinyBase**
- **Firebase Realtime Database**
- **Expo SQLite**

## License
MIT License

---

> **Note:** Update Firebase config in your project before running the app and include `.env` values.

