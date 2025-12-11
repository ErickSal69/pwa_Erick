// ====== CONFIGURACIÓN FIREBASE ======
// IMPORTANTE: Reemplaza estos valores con tus credenciales de Firebase

// Importar Firebase usando CDN (versión compat)
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

// Esperar a que Firebase esté disponible
function inicializarFirebase() {
    if (typeof firebase === 'undefined') {
        console.error('Firebase no está cargado');
        setTimeout(inicializarFirebase, 100);
        return;
    }
    
    // Inicializar DOM primero
    if (!inicializarDOM()) {
        console.error('No se pudo inicializar el DOM');
        setTimeout(inicializarFirebase, 100);
        return;
    }
    
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        window.database = firebase.database();
        window.commentsRef = window.database.ref('comments');
        console.log('Firebase inicializado correctamente');
        loadComments();
        
        // Solicitar permisos de notificación
        solicitarPermisosNotificacion();
    } catch (error) {
        console.error('Error al inicializar Firebase:', error);
    }
}

// Llamar cuando el documento esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarFirebase);
} else {
    inicializarFirebase();
}

// Solicitar permisos de notificación
function solicitarPermisosNotificacion() {
    if ('Notification' in window && Notification.permission === 'default') {
        console.log('Solicitando permisos de notificación...');
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Permisos de notificación otorgados');
                showNotification('✅ Notificaciones habilitadas', 'success');
            }
        });
    }
}

// Variables globales
let currentEditId = null;
let btnAddComment, modalComment, closeModal, formComment, commentsList, btnCancel, commentName, commentText, modalTitle;

// Función para inicializar elementos del DOM
function inicializarDOM() {
    btnAddComment = document.getElementById('btn-add-comment');
    modalComment = document.getElementById('modal-comment');
    closeModal = document.querySelector('.close');
    formComment = document.getElementById('form-comment');
    commentsList = document.getElementById('comments-list');
    btnCancel = document.getElementById('btn-cancel');
    commentName = document.getElementById('comment-name');
    commentText = document.getElementById('comment-text');
    modalTitle = document.getElementById('modal-title');
    
    // Verificar que todos los elementos existan
    if (!btnAddComment || !modalComment || !formComment) {
        console.error('No se encontraron los elementos del DOM');
        return false;
    }
    
    // Agregar event listeners
    btnAddComment.addEventListener('click', openModal);
    closeModal.addEventListener('click', closeModalComment);
    btnCancel.addEventListener('click', closeModalComment);
    formComment.addEventListener('submit', saveComment);

    // Cerrar modal al hacer clic fuera de él
    window.addEventListener('click', (event) => {
        if (event.target === modalComment) {
            closeModalComment();
        }
    });
    
    console.log('DOM inicializado correctamente');
    return true;
}

// ====== FUNCIONES DE NOTIFICACIONES ======

// Función para reproducir sonido (opcional)
function reproducirSonidoNotificacion(tipo = 'notificacion') {
    // Usar Web Audio API para crear un sonido simple
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Diferentes tonos según el tipo de notificación
        switch(tipo) {
            case 'nuevo':
                oscillator.frequency.value = 800; // Nota más alta
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.5);
                break;
            case 'editado':
                oscillator.frequency.value = 600; // Nota media
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
                break;
            case 'eliminado':
                oscillator.frequency.value = 400; // Nota baja
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.4);
                break;
        }
    } catch (error) {
        console.log('Sonido no disponible:', error);
    }
}

// Función para mostrar notificación del navegador
function mostrarNotificacionNavegador(titulo, opciones = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
        const notificacion = new Notification(titulo, {
            icon: 'img/favicon-96x96.png',
            badge: 'img/favicon-96x96.png',
            tag: 'comentario-notificacion',
            requireInteraction: false,
            ...opciones
        });
        
        // Click en notificación desplaza a comentarios
        notificacion.onclick = () => {
            window.focus();
            const commentsSection = document.getElementById('comments');
            if (commentsSection) {
                commentsSection.scrollIntoView({ behavior: 'smooth' });
            }
            notificacion.close();
        };
        
        return notificacion;
    }
}

// Función para enviar notificación broadcast a todos los usuarios (simulado)
function enviarNotificacionComentario(tipo, comentario) {
    // tipo: 'nuevo', 'editado', 'eliminado'
    const timestamp = new Date().toLocaleString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    let titulo = '';
    let opciones = {};
    
    switch(tipo) {
        case 'nuevo':
            titulo = `📝 Nuevo comentario de ${comentario.name}`;
            opciones.body = comentario.text.substring(0, 100) + (comentario.text.length > 100 ? '...' : '');
            opciones.tag = 'nuevo-comentario-' + timestamp;
            reproducirSonidoNotificacion('nuevo');
            break;
        case 'editado':
            titulo = `✏️ ${comentario.name} editó su comentario`;
            opciones.body = comentario.text.substring(0, 100) + (comentario.text.length > 100 ? '...' : '');
            opciones.tag = 'editado-comentario-' + timestamp;
            reproducirSonidoNotificacion('editado');
            break;
        case 'eliminado':
            titulo = `🗑️ ${comentario.name} eliminó su comentario`;
            opciones.body = 'Su comentario ha sido eliminado';
            opciones.tag = 'eliminado-comentario-' + timestamp;
            reproducirSonidoNotificacion('eliminado');
            break;
    }
    
    mostrarNotificacionNavegador(titulo, opciones);
    console.log(`[Notificación] ${tipo.toUpperCase()}: ${titulo}`);
}

// ====== FUNCIONES ======

// Abrir modal para agregar comentario
function openModal(editId = null) {
    // Si recibe un evento (click), ignorarlo
    if (editId && editId.preventDefault) {
        editId = null;
    }
    
    currentEditId = editId;

    if (editId) {
        // Cargar datos del comentario a editar
        window.commentsRef.child(editId).once('value', (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                commentName.value = data.name;
                commentText.value = data.text;
                modalTitle.textContent = 'Editar Comentario';
            }
        });
    } else {
        // Limpiar formulario para nuevo comentario
        formComment.reset();
        commentName.value = '';
        commentText.value = '';
        modalTitle.textContent = 'Agregar Comentario';
    }

    modalComment.style.display = 'block';
}

// Cerrar modal
function closeModalComment() {
    modalComment.style.display = 'none';
    currentEditId = null;
    formComment.reset();
}

// Guardar o actualizar comentario
function saveComment(e) {
    e.preventDefault();

    const name = commentName.value.trim();
    const text = commentText.value.trim();

    if (!name || !text) {
        alert('Por favor completa todos los campos');
        return;
    }

    const timestamp = new Date().toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    const commentData = {
        name: name,
        text: text,
        date: timestamp
    };

    if (currentEditId) {
        // Actualizar comentario existente
        window.commentsRef.child(currentEditId).update(commentData)
            .then(() => {
                console.log('Comentario actualizado exitosamente');
                closeModalComment();
                showNotification('Comentario actualizado correctamente', 'success');
                
                // Enviar notificación de actualización
                enviarNotificacionComentario('editado', commentData);
            })
            .catch((error) => {
                console.error('Error al actualizar comentario:', error);
                alert('Error al actualizar el comentario');
            });
    } else {
        // Agregar nuevo comentario
        window.commentsRef.push(commentData)
            .then(() => {
                console.log('Comentario agregado exitosamente');
                closeModalComment();
                showNotification('Comentario agregado correctamente', 'success');
                
                // Enviar notificación de nuevo comentario
                enviarNotificacionComentario('nuevo', commentData);
            })
            .catch((error) => {
                console.error('Error al agregar comentario:', error);
                alert('Error al guardar el comentario');
            });
    }
}

// Cargar y mostrar todos los comentarios
function loadComments() {
    if (!window.commentsRef) {
        console.log('commentsRef aún no está disponible');
        return;
    }
    
    window.commentsRef.off('value'); // Remover listener anterior

    window.commentsRef.on('value', (snapshot) => {
        commentsList.innerHTML = '';

        if (!snapshot.exists()) {
            commentsList.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">No hay comentarios aún. ¡Sé el primero!</p>';
            return;
        }

        const comments = [];
        snapshot.forEach((childSnapshot) => {
            comments.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });

        // Ordenar comentarios por fecha (más recientes primero)
        comments.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Mostrar comentarios
        comments.forEach((comment) => {
            const commentElement = createCommentElement(comment);
            commentsList.appendChild(commentElement);
        });
    });
}

// Crear elemento HTML para un comentario
function createCommentElement(comment) {
    const div = document.createElement('div');
    div.className = 'comment-item';
    div.innerHTML = `
        <div class="comment-header">
            <span class="comment-name">${escapeHtml(comment.name)}</span>
            <span class="comment-date">${comment.date}</span>
        </div>
        <p class="comment-text">${escapeHtml(comment.text)}</p>
        <div class="comment-actions">
            <button class="btn-edit" onclick="openModal('${comment.id}')">Editar</button>
            <button class="btn-delete" onclick="deleteComment('${comment.id}')">Eliminar</button>
        </div>
    `;
    return div;
}

// Eliminar comentario
function deleteComment(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este comentario?')) {
        // Obtener datos del comentario antes de eliminarlo (para la notificación)
        window.commentsRef.child(id).once('value', (snapshot) => {
            const commentData = snapshot.val();
            
            window.commentsRef.child(id).remove()
                .then(() => {
                    console.log('Comentario eliminado exitosamente');
                    showNotification('Comentario eliminado', 'success');
                    
                    // Enviar notificación de eliminación
                    enviarNotificacionComentario('eliminado', commentData);
                })
                .catch((error) => {
                    console.error('Error al eliminar comentario:', error);
                    alert('Error al eliminar el comentario');
                });
        });
    }
}

// Función auxiliar para escapar caracteres especiales (prevenir XSS)
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ====== INICIALIZAR ======
// Cargar comentarios cuando la página se carga
// show toast helper
function showNotification(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast ' + (type === 'error' ? 'error' : 'success');
    toast.textContent = message;
    container.appendChild(toast);

    // Remove after 3s
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// no-op DOMContentLoaded listener here, Firebase init will call loadComments
