// EJEMPLO DE CONFIGURACIÓN FIREBASE CON DATOS FICTICIOS
// Usar como referencia para entender cómo debería verse tu configuración

const firebaseConfigEjemplo = {
    // Puedes obtener tu API Key en: Firebase Console > Configuración del Proyecto > Aplicaciones
    apiKey: "AIzaSyDTXxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    
    // El Auth Domain se obtiene en Firebase Console > Configuración del Proyecto
    authDomain: "mi-pwa-comentarios.firebaseapp.com",
    
    // El Database URL es la URL de tu Realtime Database
    databaseURL: "https://mi-pwa-comentarios.firebaseio.com",
    
    // El Project ID es el ID único de tu proyecto
    projectId: "mi-pwa-comentarios",
    
    // El Storage Bucket es para almacenamiento de archivos
    storageBucket: "mi-pwa-comentarios.appspot.com",
    
    // El Messaging Sender ID es para notificaciones
    messagingSenderId: "123456789012",
    
    // El App ID es el identificador único de tu aplicación web
    appId: "1:123456789012:web:abcdef1234567890abcd"
};

/**
 * INSTRUCCIONES PARA OBTENER TUS CREDENCIALES:
 * 
 * 1. Ve a https://console.firebase.google.com/
 * 2. Selecciona tu proyecto
 * 3. Haz clic en el ícono de engranaje (Configuración del Proyecto)
 * 4. Ve a la pestaña "Aplicaciones"
 * 5. Selecciona tu aplicación web
 * 6. Copia el objeto firebaseConfig completo
 * 7. Reemplaza el contenido en comments.js
 */

// EJEMPLO DE CÓMO DEBERÍA QUEDAR EN TU ARCHIVO comments.js:
/*
const firebaseConfig = {
    apiKey: "AIzaSyDTXxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    authDomain: "tu-proyecto.firebaseapp.com",
    databaseURL: "https://tu-proyecto.firebaseio.com",
    projectId: "tu-proyecto",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890abcd"
};
*/
