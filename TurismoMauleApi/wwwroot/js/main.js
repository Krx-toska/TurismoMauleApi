let dataComunas = [];
let currentComuna = null;
let currentCategory = null;

const map = L.map('map').setView([-35.423, -71.655], 8);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const cardsContainer = document.getElementById('cardsContainer');

// Categorías válidas
const categoriasValidas = ["Comida", "Cafés", "Cultura", "Naturaleza", "Hospedaje"];

// Fallback de imágenes locales según categoría
function getFallbackImage(category) {
    return categoriasValidas.includes(category) ? `images/${category}.png` : `images/Comida.png`;
}

// Cargar plazas desde JSON
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

// Buscar comuna
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
    } else {
        alert("La comuna no pertenece a la Región del Maule");
    }
}

// Event listeners
document.getElementById('buscarBtn').addEventListener('click', buscarComuna);
document.getElementById('ciudadInput').addEventListener('keydown', e => { if (e.key === 'Enter') buscarComuna(); });

// Filtrado por categoría
document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentCategory = btn.dataset.category;
        cargarAtractivosGPT();
    });
});

// Función principal GPT
async function cargarAtractivosGPT() {
    cardsContainer.innerHTML = `<p class="text-center">Cargando atractivos...</p>`;

    let prompt = `Genera 5 atractivos turísticos de la Región del Maule en Chile.`;
    if (currentComuna) prompt += ` Filtra solo los de la comuna de ${currentComuna}.`;
    prompt += ` Clasifica cada panorama solo dentro de estas categorías: ${categoriasValidas.join(", ")}.`;
    if (currentCategory) prompt += ` Filtra solo los de la categoría ${currentCategory}.`;
    prompt += ` Devuelve un JSON array con objetos: {nombre, descripcion, categoria}.`;

    try {
        const response = await fetch("https://api.openai.com/v1/responses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer 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`
            },
            body: JSON.stringify({
                model: "gpt-4.1-mini",
                input: prompt
            })
        });

        const data = await response.json();
        let textOutput = data.output?.[0]?.content?.[0]?.text || "";

        let atractivosGPT = [];
        try {
            atractivosGPT = JSON.parse(textOutput);
        } catch {
            const matches = textOutput.match(/\{[^}]+\}/g);
            if (matches) {
                atractivosGPT = matches.map(m => {
                    try { return JSON.parse(m); } catch { return null; }
                }).filter(Boolean);
            }
        }

        if (!atractivosGPT.length) {
            cardsContainer.innerHTML = `<p class="text-center text-warning">No se pudieron generar atractivos.</p>`;
            return;
        }

        // Crear tarjetas con imágenes locales
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

// Inicializar con atractivos generales
cargarAtractivosGPT();
