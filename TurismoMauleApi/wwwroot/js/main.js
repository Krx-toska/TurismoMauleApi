// ============================== Login, Registro y UI de usuario
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const loginBtn = document.getElementById("loginBtn");
const userDropdownContainer = document.getElementById("userDropdownContainer");

// ============================== Actualizar UI según sessionStorage
function updateUserUI() {
    const nombre = sessionStorage.getItem("nombre");
    const role = sessionStorage.getItem("role");

    if (nombre && role) {
        loginBtn?.classList.add("d-none");
        if (userDropdownContainer) {
            userDropdownContainer.innerHTML = `
                <div class="dropdown">
                    <button class="btn btn-outline-primary dropdown-toggle" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                        ${nombre} (${role})
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                        <li><a class="dropdown-item" href="#" id="logoutBtn">Cerrar Sesión</a></li>
                    </ul>
                </div>
            `;
            document.getElementById("logoutBtn")?.addEventListener("click", () => {
                sessionStorage.clear();
                updateUserUI();
            });
        }
    } else {
        loginBtn?.classList.remove("d-none");
        if (userDropdownContainer) userDropdownContainer.innerHTML = "";
    }
}

// ============================== Login
loginForm?.addEventListener("submit", async e => {
    e.preventDefault();
    const email = loginForm.querySelector("input[type='email']").value;
    const password = loginForm.querySelector("input[type='password']").value;

    try {
        const res = await fetch("/api/Auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Email: email, Password: password })
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Credenciales incorrectas");
        }

        const data = await res.json();
        sessionStorage.setItem("nombre", data.nombre);
        sessionStorage.setItem("role", data.role);
        sessionStorage.setItem("userId", data.userId);
        sessionStorage.setItem("jwtToken", data.token); // Guardar token para GPT

        updateUserUI();

        const modalEl = document.getElementById('authModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();
        loginForm.reset();
    } catch (err) {
        alert(err.message);
    }
});

// ============================== Registro
registerForm?.addEventListener("submit", async e => {
    e.preventDefault();
    const nombre = registerForm.querySelector("input[type='text']").value;
    const email = registerForm.querySelector("input[type='email']").value;
    const password = registerForm.querySelector("input[type='password']").value;
    const role = registerForm.querySelector("#roleSelect").value || "Turista";

    try {
        const res = await fetch("/api/Auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Nombre: nombre, Email: email, Password: password, Role: role })
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Error al registrar usuario");
        }

        const data = await res.json();
        sessionStorage.setItem("nombre", data.nombre);
        sessionStorage.setItem("role", data.role);
        sessionStorage.setItem("userId", data.userId);
        sessionStorage.setItem("jwtToken", data.token);

        updateUserUI();

        const modalEl = document.getElementById('authModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();
        registerForm.reset();
    } catch (err) {
        alert(err.message);
    }
});

// ============================== Inicializar UI
window.addEventListener('DOMContentLoaded', updateUserUI);

// ============================== Mapas, Comunas y Categorías
let dataComunas = [];
let currentComuna = null;
let currentCategory = null;

const mapEl = document.getElementById('map');
if (mapEl) {
    const map = L.map('map').setView([-35.423, -71.655], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const cardsContainer = document.getElementById('cardsContainer');
    const categoriasValidas = ["Comida", "Cafés", "Cultura", "Naturaleza", "Hospedaje"];

    function getFallbackImage(category) {
        return categoriasValidas.includes(category) ? `images/${category}.png` : `images/Comida.png`;
    }

    fetch('js/maule_comunas.json')
        .then(res => res.json())
        .then(data => {
            dataComunas = data.plazas;
            dataComunas.forEach(c => {
                const marker = L.marker([c.lat, c.lng]).addTo(map);
                marker.on('click', () => {
                    map.setView([c.lat, c.lng], 14);
                    currentComuna = c.nombre_comuna;
                    document.getElementById('ciudadInput').value = c.nombre_comuna;
                    cargarAtractivosGPT();
                });
            });
        })
        .catch(err => console.error(err));

    function buscarComuna() {
        const busqueda = document.getElementById('ciudadInput').value
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const comuna = dataComunas.find(c =>
            c.nombre_comuna.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === busqueda
        );
        if (comuna) {
            map.setView([comuna.lat, comuna.lng], 14);
            currentComuna = comuna.nombre_comuna;
            cargarAtractivosGPT();
        } else alert("La comuna no pertenece a la Región del Maule");
    }

    document.getElementById('buscarBtn').addEventListener('click', buscarComuna);
    document.getElementById('ciudadInput').addEventListener('keydown', e => { if (e.key === 'Enter') buscarComuna(); });

    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentCategory = btn.dataset.category;
            cargarAtractivosGPT();
        });
    });

    async function cargarAtractivosGPT() {
        if (!cardsContainer) return;
        cardsContainer.innerHTML = `<p class="text-center">Cargando atractivos...</p>`;
        try {
            const token = sessionStorage.getItem("jwtToken") || "";
            const response = await fetch("/api/GPT/atractivos", {
                method: "POST",
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ Ciudad: currentComuna || "" })
            });
            const data = await response.json();
            console.log(data);
            let atractivosGPT = [];
            try { atractivosGPT = JSON.parse(data); } catch { }

            if (!atractivosGPT.length) {
                cardsContainer.innerHTML = `<p class="text-center text-warning">No se pudieron generar atractivos.</p>`;
                return;
            }

            cardsContainer.innerHTML = "";
            atractivosGPT.forEach(a => {
                const categoria = categoriasValidas.includes(a.categoria) ? a.categoria : "Comida";
                const imgSrc = getFallbackImage(categoria);
                const card = document.createElement('div');
                card.className = "col-md-4 mb-4";
                card.innerHTML = `
                    <div class="card h-100">
                        <img src="${imgSrc}" class="card-img-top" alt="${a.nombre}">
                        <div class="card-body">
                            <h5 class="card-title">${a.nombre}</h5>
                            <p class="card-text">${a.descripcion}</p>
                        </div>
                    </div>
                `;
                cardsContainer.appendChild(card);
            });
        } catch (err) {
            console.error(err);
            cardsContainer.innerHTML = `<p class="text-danger text-center">Error cargando atractivos.</p>`;
        }
    }

    cargarAtractivosGPT();
}
