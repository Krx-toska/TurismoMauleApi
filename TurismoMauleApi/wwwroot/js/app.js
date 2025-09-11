// Variables globales
let usuarioLogeado = null;
const navbarContainer = document.querySelector(".navbar .d-flex");
const API_URL = "https://localhost:7180/api";

// Guardar usuario en localStorage y actualizar navbar
function setUsuarioLogeado(user) {
    usuarioLogeado = user;
    localStorage.setItem("usuario", JSON.stringify(user));
    actualizarNavbar();
}

// Cerrar sesión
function logout() {
    usuarioLogeado = null;
    localStorage.removeItem("usuario");
    actualizarNavbar();
}

// Actualizar navbar dinámicamente
function actualizarNavbar() {
    if (!navbarContainer) return;
    navbarContainer.innerHTML = "";

    if (usuarioLogeado) {
        const nombreSpan = document.createElement("span");
        nombreSpan.className = "me-3 fw-bold";
        nombreSpan.textContent = usuarioLogeado.nombre;

        const logoutBtn = document.createElement("button");
        logoutBtn.className = "btn btn-outline-danger";
        logoutBtn.textContent = "Cerrar Sesión";
        logoutBtn.addEventListener("click", logout);

        navbarContainer.appendChild(nombreSpan);
        navbarContainer.appendChild(logoutBtn);
    } else {
        const loginBtn = document.createElement("button");
        loginBtn.className = "btn btn-outline-primary me-2";
        loginBtn.setAttribute("data-bs-toggle", "modal");
        loginBtn.setAttribute("data-bs-target", "#authModal");
        loginBtn.textContent = "Iniciar Sesión";

        const itinerarioBtn = document.createElement("a");
        itinerarioBtn.href = "itinerario.html";
        itinerarioBtn.className = "btn btn-warning";
        itinerarioBtn.textContent = "Crear Itinerario";

        navbarContainer.appendChild(loginBtn);
        navbarContainer.appendChild(itinerarioBtn);
    }
}

// Login
async function login(email, password) {
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Email: email, PasswordHash: password })
        });
        if (!res.ok) throw new Error("Usuario o contraseña incorrectos");
        const data = await res.json();
        setUsuarioLogeado({ id: data.userId, nombre: data.nombre, token: data.token });
        bootstrap.Modal.getInstance(document.getElementById('authModal')).hide();
    } catch (err) {
        alert(err.message);
    }
}

// Registro
async function register(nombre, email, password, rol) {
    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Nombre: nombre, Email: email, PasswordHash: password, Rol: rol })
        });
        if (!res.ok) throw new Error("Error al registrar usuario");
        await login(email, password); // iniciar sesión automáticamente
    } catch (err) {
        alert(err.message);
    }
}

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
    // Cargar usuario de localStorage
    const savedUser = localStorage.getItem("usuario");
    if (savedUser) usuarioLogeado = JSON.parse(savedUser);
    actualizarNavbar();

    // Formularios
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    if (loginForm) {
        loginForm.addEventListener("submit", e => {
            e.preventDefault();
            const email = loginForm.querySelector('input[type="email"]').value;
            const password = loginForm.querySelector('input[type="password"]').value;
            login(email, password);
        });
    }

    if (registerForm) {
        registerForm.addEventListener("submit", e => {
            e.preventDefault();
            const nombre = registerForm.querySelector('input[type="text"]').value;
            const email = registerForm.querySelector('input[type="email"]').value;
            const password = registerForm.querySelector('input[type="password"]').value;
            const rol = document.querySelector('input[name="rol"]:checked')?.value || "Turista";
            register(nombre, email, password, rol);
        });
    }
});
