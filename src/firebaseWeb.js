import { initializeApp } from "firebase/app";

import { getAnalytics } from "firebase/analytics";

// Archivo plantilla para configuración web de Firebase
// Rellena los valores con los que te proporciona Firebase (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId)
// He prellenado databaseURL con la URL que compartiste.

const firebaseConfig = {
  apiKey: "AIzaSyCBs2IRHpSWXzgCypSdj-l37Tx0lSryI2w",

  authDomain: "appsaludybienestar-b7b70.firebaseapp.com",

  databaseURL: "https://appsaludybienestar-b7b70-default-rtdb.firebaseio.com",

  projectId: "appsaludybienestar-b7b70",

  storageBucket: "appsaludybienestar-b7b70.firebasestorage.app",

  messagingSenderId: "674168458233",

  appId: "1:674168458233:web:cac29391dbb4d9ec9ccb28",

  measurementId: "G-R6YH0Y7GN3"

};

// Initialize Firebase

const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);

export default firebaseConfig;
