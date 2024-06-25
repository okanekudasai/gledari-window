import './index.css'

import { createApp } from 'vue';
import App from './App.vue';

import { initializeApp } from 'firebase/app';
import axios from 'axios'


const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STOARGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};
const firebase_app = initializeApp(firebaseConfig);

const app = createApp(App)

app.config.globalProperties.$axios = axios;

app.mount('#app');
