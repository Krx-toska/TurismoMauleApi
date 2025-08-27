let dataComunas = [];

const map = L.map('map').setView([-35.423, -71.655], 8);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Cargar plazas desde JSON
fetch('js/maule_comunas.json')
    .then(res => res.json())
    .then(data => {
        dataComunas = data.plazas;

        dataComunas.forEach(c => {
            const marker = L.marker([c.lat, c.lng]).addTo(map);
            marker.on('click', () => {
                map.setView([c.lat, c.lng], 14);
                document.getElementById('ciudadInput').value = c.nombre_comuna;
            });
        });
    })
    .catch(err => console.error(err));

// Función de búsqueda insensible a mayúsculas y tildes
function buscarComuna() {
    const busqueda = document.getElementById('ciudadInput').value
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const comuna = dataComunas.find(c =>
        c.nombre_comuna.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .includes(busqueda)  // coincidencia parcial
    );

    if (comuna) {
        map.setView([comuna.lat, comuna.lng], 14);
    } else {
        alert("La comuna no pertenece a la Región del Maule");
    }
}

// Evento Enter
document.getElementById('ciudadInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        buscarComuna();
    }
});

// Evento Botón Buscar
document.getElementById('buscarBtn').addEventListener('click', buscarComuna);

