// ============================== Login, Registro y UI de usuario
const loginForm = document.getElementById("loginForm")
const registerForm = document.getElementById("registerForm")
const loginBtn = document.getElementById("loginBtn")
const logoutBtn = document.getElementById("logoutBtn")
const userNameDisplay = document.getElementById("userNameDisplay")

function updateUserUI() {
    const token = localStorage.getItem("token")
    const userName = localStorage.getItem("userName")

    if (token) {
        loginBtn?.classList.add("d-none")
        logoutBtn?.classList.remove("d-none")
        if (userNameDisplay) {
            userNameDisplay.textContent = `Hola, ${userName}`
            userNameDisplay.classList.remove("d-none")
        }
    } else {
        loginBtn?.classList.remove("d-none")
        logoutBtn?.classList.add("d-none")
        userNameDisplay?.classList.add("d-none")
    }
}

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
        // Loguear automáticamente
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

logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userId")
    localStorage.removeItem("userName")
    updateUserUI()
})

updateUserUI()

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

        let prompt = `Genera 5 atractivos turísticos de la Región del Maule en Chile.`
        if (currentComuna) prompt += ` Filtra solo los de la comuna de ${currentComuna}.`
        prompt += ` Clasifica cada panorama solo dentro de estas categorías: ${categoriasValidas.join(", ")}.`
        if (currentCategory) prompt += ` Filtra solo los de la categoría ${currentCategory}.`
        prompt += ` Devuelve un JSON array con objetos: {nombre, descripcion, categoria}.`

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

// ============================== Itinerario
const actividades = {
    desayuno: ["Café Central", "Panadería Andina", "Desayuno Gourmet"],
    opcional: ["Parque Nacional", "Museo", "Tour cultural"],
    almuerzo: ["Restaurante Andino", "Comida típica local", "Bistró Cordillera"],
    onceCena: ["Café de la plaza", "Bar local", "Restaurante nocturno"],
    opcionalNocturno: ["Bar con música en vivo", "Cine local", "Paseo nocturno"],
    alojamiento: ["Hotel Cordillera", "Hostal Andino", "Cabañas Rurales"]
}

let usuarioLogeado = !!localStorage.getItem("token")

function crearDropdown(categoria, seleccionado) {
    const select = document.createElement("select")
    select.className = "form-select mt-2"
    actividades[categoria].forEach(act => {
        const option = document.createElement("option")
        option.value = act
        option.text = act
        if (act === seleccionado) option.selected = true
        select.appendChild(option)
    })
    return select
}

document.getElementById("generarItinerarioBtn")?.addEventListener("click", () => {
    const container = document.getElementById("itinerarioContainer")
    if (!container) return
    container.innerHTML = ""
    document.getElementById("itinerarioActions").style.display = "block"

    const bloques = [
        { hora: "08:00", nombre: "Desayuno", categoria: "desayuno" },
        { hora: "10:00", nombre: "Actividad opcional", categoria: "opcional" },
        { hora: "13:00", nombre: "Almuerzo", categoria: "almuerzo" },
        { hora: "15:00", nombre: "Actividad opcional", categoria: "opcional" },
        { hora: "17:00", nombre: "Actividad opcional", categoria: "opcional" },
        { hora: "19:00", nombre: "Once/Cena", categoria: "onceCena" },
        { hora: "21:00", nombre: "Actividad nocturna", categoria: "opcionalNocturno" },
        { hora: "23:00", nombre: "Alojamiento", categoria: "alojamiento" }
    ]

    bloques.forEach(bloque => {
        const card = document.createElement("div")
        card.className = "card p-3 itinerary-block"
        card.innerHTML = `<h5>${bloque.hora} - ${bloque.nombre}</h5><div class="actividadSeleccionada">${actividades[bloque.categoria][0]}</div>`
        card.querySelector(".actividadSeleccionada").addEventListener("click", function () {
            this.replaceWith(crearDropdown(bloque.categoria, this.innerText))
        })
        container.appendChild(card)
    })
})

document.getElementById("exportarBtn")?.addEventListener("click", () => {
    html2canvas(document.getElementById("itinerarioContainer")).then(canvas => {
        const link = document.createElement("a")
        link.download = "itinerario.png"
        link.href = canvas.toDataURL()
        link.click()
    })
})

document.getElementById("guardarBtn")?.addEventListener("click", () => {
    if (!localStorage.getItem("token")) {
        new bootstrap.Modal(document.getElementById('authModal')).show()
        return
    }
    alert("Itinerario guardado! (simulado)")
})
