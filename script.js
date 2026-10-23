/* ==========================================================================
   PROYECTO HEPHORIX - SCRIPT GLOBAL CORREGIDO Y UNIFICADO
   ========================================================================== */

// Base de datos de usuarios autorizados
const HEPHORIX_USERS = [
    { email: 'admin@hephorix.com', password: '123', nombre: 'Administrador HEPHORIX' },
    { email: 'cliente@hephorix.com', password: '123', nombre: 'Cliente Preferencial' },
    { email: 'diseno@hephorix.com', password: '123', nombre: 'Equipo Creativo' }
];

let currentCaptchaResult = null;

// Función para generar un nuevo desafío captcha
function generateCaptcha() {
    const captchaQuestion = document.getElementById('captchaQuestion');
    if (!captchaQuestion) return;

    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    
    currentCaptchaResult = num1 + num2;
    captchaQuestion.textContent = `¿Cuánto es ${num1} + ${num2}?`;
}

// Función auxiliar para mostrar modal de error personalizado
function showErrorModal(message) {
    const modalErrorMessage = document.getElementById('modalErrorMessage');
    const loginErrorModal = document.getElementById('loginErrorModal');
    if (modalErrorMessage) modalErrorMessage.textContent = message;
    if (loginErrorModal) loginErrorModal.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {

    /* ----------------------------------------------------------------------
       1. MENÚ MÓVIL UNIVERSAL Y NAVEGACIÓN SEGÚN SESIÓN ACTIVA
       ---------------------------------------------------------------------- */
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const menuIcon = document.getElementById('menuIcon') || (menuToggle ? menuToggle.querySelector('i') : null);

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('active');

            if (menuIcon) {
                if (navMenu.classList.contains('active')) {
                    menuIcon.classList.remove('fa-bars');
                    menuIcon.classList.add('fa-xmark');
                } else {
                    menuIcon.classList.remove('fa-xmark');
                    menuIcon.classList.add('fa-bars');
                }
            }
        });

        // Cerrar menú al hacer clic en cualquier enlace interno
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                if (menuIcon) {
                    menuIcon.classList.remove('fa-xmark');
                    menuIcon.classList.add('fa-bars');
                }
            });
        });

        // Cerrar menú al hacer clic fuera de él en dispositivos móviles
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                if (menuIcon) {
                    menuIcon.classList.remove('fa-xmark');
                    menuIcon.classList.add('fa-bars');
                }
            }
        });
    }

    // Verificar si hay sesión activa para actualizar los botones del menú
    const activeUserJSON = sessionStorage.getItem('hephorix_active_user');
    const loginBtns = document.querySelectorAll('.login-btn');

    if (activeUserJSON && loginBtns.length > 0) {
        const activeUser = JSON.parse(activeUserJSON);
        const primerNombre = activeUser.nombre ? activeUser.nombre.split(' ')[0] : 'MI CUENTA';

        loginBtns.forEach(btn => {
            btn.href = 'usuarios.html';
            btn.innerHTML = `<i class="fa-solid fa-user-check"></i> ${primerNombre}`;
        });
    }

    /* ----------------------------------------------------------------------
       2. CONTROL EXCLUSIVO DE LA PÁGINA USUARIOS.HTML
       ---------------------------------------------------------------------- */
    if (window.location.pathname.includes('usuarios.html')) {
        if (!activeUserJSON) {
            window.location.href = 'login.html';
            return;
        }

        const activeUser = JSON.parse(activeUserJSON);
        const displayUserEmail = document.getElementById('displayUserEmail');
        const welcomeUserName = document.getElementById('welcomeUserName');

        if (displayUserEmail) displayUserEmail.textContent = activeUser.email;
        if (welcomeUserName) welcomeUserName.textContent = activeUser.nombre || activeUser.email.split('@')[0];
    }

    /* ----------------------------------------------------------------------
       3. FORMULARIO DE LOGIN Y CAPTCHA (LOGIN.HTML)
       ---------------------------------------------------------------------- */
    const standaloneLoginForm = document.getElementById('standaloneLoginForm');
    
    if (standaloneLoginForm) {
        generateCaptcha();

        const refreshCaptchaBtn = document.getElementById('refreshCaptchaBtn');
        if (refreshCaptchaBtn) {
            refreshCaptchaBtn.addEventListener('click', () => {
                generateCaptcha();
                const captchaInput = document.getElementById('captchaAnswer');
                if (captchaInput) captchaInput.value = '';
            });
        }

        standaloneLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const emailInput = document.getElementById('loginEmail').value.trim();
            const passwordInput = document.getElementById('loginPassword').value.trim();
            const captchaInput = parseInt(document.getElementById('captchaAnswer').value.trim(), 10);

            // Validar Captcha
            if (isNaN(captchaInput) || captchaInput !== currentCaptchaResult) {
                showErrorModal('La respuesta al desafío matemático es incorrecta. Inténtalo nuevamente.');
                return;
            }

            // Validar Credenciales
            const matchedUser = HEPHORIX_USERS.find(user => 
                user.email.toLowerCase() === emailInput.toLowerCase() && user.password === passwordInput
            );

            if (matchedUser) {
                sessionStorage.setItem('hephorix_active_user', JSON.stringify({
                    email: matchedUser.email,
                    nombre: matchedUser.nombre
                }));
                
                window.location.href = 'usuarios.html';
            } else {
                showErrorModal('El correo electrónico o la contraseña ingresados no coinciden con nuestros registros.');
            }
        });
    }

    // Botón Intentar Nuevamente del Modal
    const btnModalRetry = document.getElementById('btnModalRetry');
    if (btnModalRetry) {
        btnModalRetry.addEventListener('click', () => {
            const loginErrorModal = document.getElementById('loginErrorModal');
            if (loginErrorModal) loginErrorModal.classList.remove('active');
            if (standaloneLoginForm) standaloneLoginForm.reset();
            generateCaptcha();
        });
    }

    // Botón Cerrar Sesión
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem('hephorix_active_user');
            window.location.href = 'login.html';
        });
    }

    /* ----------------------------------------------------------------------
       4. ACORDEÓN PREGUNTAS FRECUENTES
       ---------------------------------------------------------------------- */
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            document.querySelectorAll('.faq-item').forEach(item => {
                if (item !== faqItem) item.classList.remove('active');
            });
            faqItem.classList.toggle('active');
        });
    });
});
