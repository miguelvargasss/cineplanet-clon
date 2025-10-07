"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.auth = void 0;
const app_1 = require("firebase/app");
const auth_1 = require("firebase/auth");
const firestore_1 = require("firebase/firestore");
// Configuración de Firebase usando variables de entorno
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyBnlF70cqIZgilnKfX3bE-spCRGzqg9eSE",
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "cineplanet-21e8c.firebaseapp.com",
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "cineplanet-21e8c",
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "cineplanet-21e8c.firebasestorage.app",
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "967927294358",
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:967927294358:web:c928e7e88d3bc44de955b7"
};
// Inicializar Firebase
const app = (0, app_1.initializeApp)(firebaseConfig);
// Inicializar Auth
exports.auth = (0, auth_1.getAuth)(app);
// Inicializar Firestore
exports.db = (0, firestore_1.getFirestore)(app);
exports.default = app;
