// Service worker registration
if ('serviceWorker' in navigator) {
    console.log('Service Workers disponibles');
    navigator.serviceWorker.register('sw.js')
        .then(res => console.log('Service Worker sw.js registrado', res))
        .catch(err => console.log('Error registrando sw.js:', err));
} else {
    console.log('Service Workers NO disponibles');
}

// ============================================================
// CONFIGURACIÓN DE NOTIFICACIONES PUSH CON FIREBASE
// ============================================================

// Esperar a que Firebase esté cargado antes de continuar
function inicializarFirebaseMessaging() {
    if (typeof firebase === 'undefined') {
        console.log('Firebase aún no está disponible, reintentando...');
        setTimeout(inicializarFirebaseMessaging, 500);
        return;
    }

    const firebaseConfig = {
        apiKey: "AIzaSyDnxvo-5hC-6zL0qf2hFuhYSF4KkP5RmN4",
        authDomain: "gymfull-9f61b.firebaseapp.com",
        databaseURL: "https://gymfull-9f61b-default-rtdb.firebaseio.com",
        projectId: "gymfull-9f61b",
        storageBucket: "gymfull-9f61b.firebasestorage.app",
        messagingSenderId: "387939028982",
        appId: "1:387939028982:web:67c09d09d5c7ffe557c1d7",
        measurementId: "G-Y3YPVTMQZ0"
    };

    // Evitar inicializar dos veces
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    try {
        const messaging = firebase.messaging();
        console.log('Firebase Messaging inicializado');

        // Registrar el service worker de Firebase
        navigator.serviceWorker.register('firebase-messaging-sw.js')
            .then((registration) => {
                console.log('Firebase Messaging Service Worker registrado', registration);
                
                // Solicitar token FCM
                solicitarTokenFCM(messaging, registration);
            })
            .catch(err => {
                console.error('Error registrando Firebase Messaging SW:', err);
            });

        // Manejar mensajes en FOREGROUND
        messaging.onMessage((payload) => {
            console.log('[main.js] Mensaje en primer plano:', payload);
            
            if (payload.notification) {
                const { title, body, image } = payload.notification;
                
                const notificationOptions = {
                    body: body || 'Nueva notificación',
                    icon: image || 'img/favicon-96x96.png',
                    badge: 'img/favicon-96x96.png',
                    tag: 'firebase-foreground-notification',
                    requireInteraction: false
                };

                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification(title || 'Nueva notificación', notificationOptions);
                }
            }
        });

    } catch (error) {
        console.error('Error inicializando Firebase Messaging:', error);
    }
}

// Solicitar token FCM
function solicitarTokenFCM(messaging, registration) {
    // Solicitar permiso de notificación
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                obtenerToken(messaging, registration);
            }
        });
    } else if ('Notification' in window && Notification.permission === 'granted') {
        obtenerToken(messaging, registration);
    }
}

// Obtener token del navegador
function obtenerToken(messaging, registration) {
    try {
        const vapidKey = 'BJKd8iXZ1D2W_JQrEI3W9VX2K8LmV3T5Q6R7S8T9U0V1W2X3Y4Z5A6B7C8D9E0F1';
        
        messaging.getToken({
            vapidKey: vapidKey,
            serviceWorkerRegistration: registration
        })
        .then((token) => {
            if (token) {
                console.log('✅ Token FCM obtenido:', token);
                localStorage.setItem('fcm_token', token);
                guardarTokenEnFirebase(token);
                console.log('Token guardado en localStorage y Firebase');
            } else {
                console.log('No se pudo obtener el token FCM');
            }
        })
        .catch((err) => {
            console.error('Error al obtener token FCM:', err);
        });
    } catch (error) {
        console.error('Error en obtenerToken:', error);
    }
}

// Generar ID único para el dispositivo
function generarIdUnico() {
    const existente = localStorage.getItem('device_id');
    if (existente) return existente;
    
    const idUnico = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('device_id', idUnico);
    return idUnico;
}

// Guardar token en Firebase
function guardarTokenEnFirebase(token) {
    if (typeof firebase === 'undefined') {
        console.log('Firebase no disponible para guardar token');
        return;
    }
    
    try {
        const db = firebase.database();
        const deviceId = generarIdUnico();
        const userRef = db.ref('tokens/' + deviceId);
        
        userRef.set({
            token: token,
            fechaRegistro: new Date().toISOString(),
            navegador: navigator.userAgent.substring(0, 100)
        }).then(() => {
            console.log('✅ Token guardado en Firebase');
        }).catch(error => {
            console.error('Error guardando token en Firebase:', error);
        });
    } catch (error) {
        console.error('Error en guardarTokenEnFirebase:', error);
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarFirebaseMessaging);
} else {
    inicializarFirebaseMessaging();
}

// Menu smooth scroll
$(document).ready(function() {
    $("#menu a").click(function(e) {
        e.preventDefault();
        var target = $(this).attr('href');
        $('html, body').animate({
            scrollTop: $(target).offset().top
        }, 800);
        return false;
    });
});

// ==============================
// PWA Install detection handlers
// ==============================
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
    // Evitar que el navegador muestre el prompt automáticamente
    e.preventDefault();
    deferredPrompt = e;
    console.log('[main.js] beforeinstallprompt capturado');
    // Puedes guardar aquí para mostrar un botón personalizado de instalación
});

window.addEventListener('appinstalled', async (evt) => {
    console.log('[main.js] PWA instalada:', evt);
    try {
        // Asegurar que Firebase está inicializado
        if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length) {
            const db = firebase.database();
            const deviceId = localStorage.getItem('device_id') || generarIdUnico();
            const token = localStorage.getItem('fcm_token') || null;
            const installRef = db.ref('installs/' + deviceId);
            await installRef.set({
                installedAt: new Date().toISOString(),
                userAgent: navigator.userAgent.substring(0, 200),
                token: token
            });
            console.log('[main.js] Registro de instalación guardado en /installs/' + deviceId);

            // Mostrar notificación local de agradecimiento
            if ('Notification' in window && Notification.permission === 'granted') {
                try {
                    new Notification('Gracias por instalar la app', {
                        body: 'Gracias por descargar nuestra aplicación progresiva.',
                        icon: 'img/favicon-96x96.png'
                    });
                } catch (nerr) {
                    console.log('No se pudo mostrar notificación de instalación:', nerr);
                }
            }
        } else {
            console.log('[main.js] Firebase no está listo para guardar instalación. Se intentará más tarde.');
        }
    } catch (error) {
        console.error('[main.js] Error guardando registro de instalación:', error);
    }
});


// Añade esto en tu archivo main.js o crea un nuevo archivo menu.js
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menu-toggle');
    const menu = document.querySelector('#menu ul');
    
    // Toggle menu hamburguesa
    if (menuToggle) {
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('active');
            menu.classList.toggle('active');
        });
    }
    
    // Cerrar menú al hacer clic en un enlace
    const menuLinks = document.querySelectorAll('#menu ul li a');
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            menuToggle.classList.remove('active');
            menu.classList.remove('active');
        });
    });
    
    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (!menu.contains(e.target) && !menuToggle.contains(e.target)) {
            menuToggle.classList.remove('active');
            menu.classList.remove('active');
        }
    });
    
    // Header scroll effect
    const header = document.getElementById('main-header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
});