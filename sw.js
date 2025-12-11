// Asignar nombre y versión de la caché
const CACHE_NAME = 'v1_cache_ERickSalvadorLugoPWA';

// Ficheros a cachear en la aplicación
var urlsToCache = [
    './',
    './index.html',
    './css/styles.css',
    './img/favicon.png',
    './img/book-open.png',
    './img/joystick-alt.png',
    './img/pencil-circle.png',
    './img/4.png',
    './img/5.png',
    './img/6.png',
    './img/Facebook.png',
    './img/Instagram1.png',
    './img/Youtube.png',
    './img/Pinterest1.png',
    './img/favicon-1024.png',
    './img/favicon-512.png',
    './img/favicon-384.png',
    './img/favicon-256.png',
    './img/favicon-128.png',
    './img/favicon-96.png',
    './img/favicon-64.png',
    './img/favicon-32.png',
    './img/favicon-16.png'
];

// ===================================================================
// 1. EVENTO INSTALL (Instalación y guardado inicial en caché)
// ===================================================================
self.addEventListener('install', e => {
    console.log('[Service Worker] Instalando...');
    e.waitUntil(
        // Abre o crea una caché con el nombre definido
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Almacenando recursos estáticos');
                // Agrega todos los archivos de 'urlsToCache' a la caché
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                // El método self.skipWaiting() activa el nuevo SW inmediatamente
                return self.skipWaiting();
            })
            .catch(err => {
                console.error('[Service Worker] Falló el registro de la caché:', err);
            })
    );
});

//Evento activate
// Que la app funcione sin conexión
self.addEventListener('activate', e => {
    const cacheWhitelist = [CACHE_NAME];

    e.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {

                        if (cacheWhitelist.indexOf(cacheName) === -1) {
                            // Borrar elementos que no se necesitan
                            return caches.delete(cacheName);
                        }

                    })
                );
            })
            .then(() => {
                //Activar cache
                self.clients.claim();
            })
    );
});

//Evento fetch
self.addEventListener('fetch', e => {

    e.respondWith(
        caches.match(e.request)
            .then(res => {
                if (res) {
                    return res;
                }
                return fetch(e.request);
            })
    );
});

// ===================================================================
// 2. EVENTO ACTIVATE (Activación y limpieza de cachés antiguas)
// ===================================================================
self.addEventListener('activate', e => {
    console.log('[Service Worker] Activado y listo.');
    const cacheWhitelist = [CACHE_NAME];

    e.waitUntil(
        // Itera sobre todas las claves de caché
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Si el nombre de caché NO está en la lista blanca (whitelist), lo elimina
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log(`[Service Worker] Borrando caché antigua: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // Asegura que el Service Worker tome el control de las páginas inmediatamente
    return self.clients.claim();
});

// ===================================================================
// 3. EVENTO FETCH (Manejo de peticiones de red: Estrategia Cache First)
// ===================================================================
self.addEventListener('fetch', e => {
    // Si la solicitud es un recurso que queremos cachear
    if (e.request.url.startsWith(self.location.origin)) {
        e.respondWith(
            // Busca la solicitud en la caché
            caches.match(e.request)
                .then(response => {
                    // 1. Si encuentra la respuesta en caché, la devuelve inmediatamente (Cache First)
                    if (response) {
                        return response;
                    }
                    // 2. Si NO la encuentra, hace la petición a la red
                    return fetch(e.request);
                })
                .catch(err => {
                    console.error('[Service Worker] Error al manejar fetch:', err);
                    // Aquí podrías devolver una página de "Sin Conexión" personalizada
                })
        );
    }
});