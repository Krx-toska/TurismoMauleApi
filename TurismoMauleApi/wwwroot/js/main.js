// ============================== Login, Registro y UI de usuario
const loginForm = document.getElementById("loginForm")
const registerForm = document.getElementById("registerForm")
const loginBtn = document.getElementById("loginBtn")
const userNameDisplay = document.getElementById("userNameDisplay")

function updateUserUI() {
    const token = localStorage.getItem("token")
    const userName = localStorage.getItem("userName")

    if (token) {
        loginBtn?.classList.add("d-none")
        if (userNameDisplay) {
            userNameDisplay.innerHTML = `Hola, ${userName} <button class="btn btn-sm btn-outline-danger ms-2" id="logoutBtn">Cerrar sesión</button>`
            userNameDisplay.classList.remove("d-none")
            document.getElementById("logoutBtn").addEventListener("click", logout)
        }
    } else {
        loginBtn?.classList.remove("d-none")
        userNameDisplay?.classList.add("d-none")
        userNameDisplay.innerHTML = ""
    }
}

// ============================== Login
loginForm?.addEventListener("submit", async e => {
    e.preventDefault()
    const email = loginForm.querySelector("input[type='email']").value
    const password = loginForm.querySelector("input[type='password']").value

    try {
        const res = await fetch("/api/Auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Email: email, PasswordHash: password })
        })
        if (!res.ok) throw new Error("Credenciales incorrectas")
        const data = await res.json()
        localStorage.setItem("token", data.token)
        localStorage.setItem("userId", data.userId)
        localStorage.setItem("userName", data.nombre)
        updateUserUI()
        new bootstrap.Modal(document.getElementById('authModal')).hide()
        loginForm.reset()
        alert("¡Login exitoso!")
    } catch (err) {
        alert(err.message)
    }
})

// ============================== Registro
registerForm?.addEventListener("submit", async e => {
    e.preventDefault()
    const nombre = registerForm.querySelector("input[type='text']").value
    const email = registerForm.querySelector("input[type='email']").value
    const password = registerForm.querySelector("input[type='password']").value

    try {
        const res = await fetch("/api/Auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Nombre: nombre, Email: email, PasswordHash: password })
        })
        if (!res.ok) throw new Error("Error al registrar usuario")
        const data = await res.json()
        localStorage.setItem("token", data.token)
        localStorage.setItem("userId", data.userId)
        localStorage.setItem("userName", data.nombre)
        updateUserUI()
        new bootstrap.Modal(document.getElementById('authModal')).hide()
        registerForm.reset()
        alert("¡Registro exitoso!")
    } catch (err) {
        alert(err.message)
    }
})

// ============================== Logout
function logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("userId")
    localStorage.removeItem("userName")
    updateUserUI()
}

// ============================== Mapas, Comunas y Categorías
let dataComunas = []
let currentComuna = null
let currentCategory = null

const mapEl = document.getElementById('map')
if (mapEl) {
    const map = L.map('map').setView([-35.423, -71.655], 8)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map)

    const cardsContainer = document.getElementById('cardsContainer')
    const categoriasValidas = ["Comida", "Cafés", "Cultura", "Naturaleza", "Hospedaje"]

    function getFallbackImage(category) {
        return categoriasValidas.includes(category) ? `images/${category}.png` : `images/Comida.png`
    }

    fetch('js/maule_comunas.json')
        .then(res => res.json())
        .then(data => {
            dataComunas = data.plazas
            dataComunas.forEach(c => {
                const marker = L.marker([c.lat, c.lng]).addTo(map)
                marker.on('click', () => {
                    map.setView([c.lat, c.lng], 14)
                    currentComuna = c.nombre_comuna
                    document.getElementById('ciudadInput').value = c.nombre_comuna
                    cargarAtractivosGPT()
                })
            })
        })
        .catch(err => console.error(err))

    function buscarComuna() {
        const busqueda = document.getElementById('ciudadInput').value
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        const comuna = dataComunas.find(c =>
            c.nombre_comuna.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === busqueda
        )
        if (comuna) {
            map.setView([comuna.lat, comuna.lng], 14)
            currentComuna = comuna.nombre_comuna
            cargarAtractivosGPT()
        } else alert("La comuna no pertenece a la Región del Maule")
    }

    document.getElementById('buscarBtn').addEventListener('click', buscarComuna)
    document.getElementById('ciudadInput').addEventListener('keydown', e => { if (e.key === 'Enter') buscarComuna() })

    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentCategory = btn.dataset.category
            cargarAtractivosGPT()
        })
    })

    async function cargarAtractivosGPT() {
        if (!cardsContainer) return
        cardsContainer.innerHTML = `<p class="text-center">Cargando atractivos...</p>`

        try {
            const response = await fetch("/api/GPT/atractivos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ Ciudad: currentComuna || "" })
            })

            const data = await response.json()
            let atractivosGPT = []
            try { atractivosGPT = JSON.parse(data) } catch { }

            if (!atractivosGPT.length) {
                cardsContainer.innerHTML = `<p class="text-center text-warning">No se pudieron generar atractivos.</p>`
                return
            }

            cardsContainer.innerHTML = ""
            atractivosGPT.forEach(a => {
                const categoria = categoriasValidas.includes(a.categoria) ? a.categoria : "Comida"
                const imgSrc = getFallbackImage(categoria)
                const card = document.createElement('div')
                card.className = "col-md-4 mb-4"
                card.innerHTML = `
                    <div class="card h-100">
                        <img src="${imgSrc}" class="card-img-top" alt="${a.nombre}">
                        <div class="card-body">
                            <h5 class="card-title">${a.nombre}</h5>
                            <p class="card-text">${a.descripcion}</p>
                        </div>
                    </div>
                `
                cardsContainer.appendChild(card)
            })
        } catch (err) {
            console.error(err)
            cardsContainer.innerHTML = `<p class="text-danger text-center">Error cargando atractivos.</p>`
        }
    }

    cargarAtractivosGPT()
}

// ============================== Inicializar UI
updateUserUI()
