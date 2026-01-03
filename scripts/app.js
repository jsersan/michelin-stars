// ==================== SISTEMA DE INTERNACIONALIZACIÓN ====================
const i18n = {
    es: {
        legendTitle: "Categorías",
        province: "Provincia",
        municipality: "Municipio",
        email: "Correo Electrónico",
        moreInfo: "Más información",
        website: "Sitio Web",
        city: "Ciudad",
        filterByRegion: "Filtrar por Comunidad",
        allRegions: "Todas las Comunidades",
        categories: {
            hoteles: "Hoteles de Lujo",
            hoteles5: "5 Estrellas",
            restaurantes: "Restaurantes",
            restaurantes1: "1 Estrella Michelin",
            restaurantes2: "2 Estrellas Michelin",
            restaurantes3: "3 Estrellas Michelin"
        }
    },
    eu: {
        legendTitle: "Kategoriak",
        province: "Probintzia",
        municipality: "Udalerria",
        email: "Posta Elektronikoa",
        moreInfo: "Informazio gehiago",
        website: "Webgunea",
        city: "Hiria",
        filterByRegion: "Erkidegoaren arabera iragazi",
        allRegions: "Erkidego Guztiak",
        categories: {
            hoteles: "Luxuzko Hotelak",
            hoteles5: "5 izarreko hotela",
            restaurantes: "Jatetxeak",
            restaurantes1: "1 Michelin Izar",
            restaurantes2: "2 Michelin Izar",
            restaurantes3: "3 Michelin Izar"
        }
    },
    en: {
        legendTitle: "Categories",
        province: "Province",
        municipality: "Municipality",
        email: "Email",
        moreInfo: "More information",
        website: "Website",
        city: "City",
        filterByRegion: "Filter by Community",
        allRegions: "All Communities",
        categories: {
            hoteles: "Luxury Hotels",
            hoteles5: "5 Stars",
            restaurantes: "Restaurants",
            restaurantes1: "1 Michelin Star",
            restaurantes2: "2 Michelin Stars",
            restaurantes3: "3 Michelin Stars"
        }
    }
};

// ==================== COMUNIDADES AUTÓNOMAS ====================
const COMUNIDADES = [
    "Andalucía",
    "Aragón",
    "Asturias",
    "Islas Baleares",
    "Canarias",
    "Cantabria",
    "Castilla y León",
    "Castilla-La Mancha",
    "Cataluña",
    "Comunidad Valenciana",
    "Extremadura",
    "Galicia",
    "Madrid",
    "Región de Murcia",
    "Navarra",
    "País Vasco",
    "La Rioja"
];

const KOMUNITATE_AUTONOMOK = [
    "Andaluzia",
    "Aragoi",
    "Asturias",
    "Balearien Uharteak",
    "Kanariak",
    "Kantabria",
    "Gaztela eta Leon",
    "Gaztela-La Manxa",
    "Katalunia",
    "Komunitate Valenciana",
    "Extremadura",
    "Galizia",
    "Madrilgo Erkidegoa",
    "Murtzia Erregioa",
    "Nafarroa",
    "Euskadi",
    "Errioxa"
];

const AUTONOMOUS_COMMUNITIES = [
    "Andalusia",
    "Aragon",
    "Asturias",
    "Balearic Islands",
    "Canary Islands",
    "Cantabria",
    "Castile and León",
    "Castilla-La Mancha",
    "Catalonia",
    "Valencian Community",
    "Extremadura",
    "Galicia",
    "Madrid",
    "Region of Murcia",
    "Navarre",
    "Basque Country",
    "La Rioja"
];

// Mapeo entre nombres en diferentes idiomas (todos apuntan al nombre en español)
const COMUNIDADES_MAP = {};
COMUNIDADES.forEach((es, i) => {
    COMUNIDADES_MAP[es] = es;
    COMUNIDADES_MAP[KOMUNITATE_AUTONOMOK[i]] = es;
    COMUNIDADES_MAP[AUTONOMOUS_COMMUNITIES[i]] = es;
});

// Función para obtener el array de comunidades según el idioma
function getComunidadesPorIdioma(lang) {
    switch (lang) {
        case 'eu':
            return KOMUNITATE_AUTONOMOK;
        case 'en':
            return AUTONOMOUS_COMMUNITIES;
        default:
            return COMUNIDADES;
    }
}

// ==================== VARIABLES GLOBALES ====================
let currentLang = 'es';
let mapa;
let markers = [];
let dataRestaurantes;
let dataHoteles;
let infoWindowActivo = null;
let markerActivo = null;
let datosMarkerActivo = null;
let comunidadSeleccionada = null;
let categoriaActual = null;
let estrellasActuales = null;

// ==================== LÍMITES DE ESPAÑA ====================
const LIMITES_ESPANA = {
    latMin: 35.0,
    latMax: 44.0,
    lngMin: -10.0,
    lngMax: 5.0
};

// ==================== FUNCIONES DE TRADUCCIÓN ====================
function t(key) {
    const keys = key.split('.');
    let value = i18n[currentLang];
    for (let k of keys) {
        value = value ? value[k] : undefined;
    }
    return value || key;
}

function cambiarIdioma(lang) {
    console.log('Cambiando idioma a:', lang);
    currentLang = lang;

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    document.getElementById('legend-title').textContent = t('legendTitle');
    actualizarLeyenda();
    actualizarComboCA();
    actualizarURL();

    if (infoWindowActivo && markerActivo && datosMarkerActivo) {
        infoWindowActivo.close();
        const nuevoInfoWindow = crearInfoWindow(
            datosMarkerActivo.nombre,
            datosMarkerActivo.ciudad,
            datosMarkerActivo.provincia,
            datosMarkerActivo.tipo,
            datosMarkerActivo.estrellas,
            datosMarkerActivo.web,
            datosMarkerActivo.direccion,
            datosMarkerActivo.cp,
            datosMarkerActivo.telefono
        );
        nuevoInfoWindow.open(mapa, markerActivo);
        infoWindowActivo = nuevoInfoWindow;
    }
}

function actualizarURL() {
    const url = new URL(window.location);
    url.searchParams.set('lang', currentLang);
    window.history.replaceState({}, '', url);
}

function actualizarLeyenda() {
    // Actualizar categorías principales
    document.querySelectorAll('[data-category]').forEach(el => {
        const categoria = el.getAttribute('data-category');
        const texto = el.querySelector('.category-text');
        if (texto) {
            texto.textContent = t(`categories.${categoria}`);
        }
    });

    // Actualizar subcategorías (estrellas)
    document.querySelectorAll('[data-subcategory]').forEach(el => {
        const subcategoria = el.getAttribute('data-subcategory');
        const texto = el.querySelector('.category-text');
        if (texto) {
            texto.textContent = t(`categories.${subcategoria}`);
        }
    });
}

function actualizarComboCA() {
    const label = document.querySelector('label[for="ca-select"]');
    if (label) {
        label.textContent = t('filterByRegion') + ':';
    }

    const select = document.getElementById('ca-select');
    if (select) {
        // Guardar la comunidad seleccionada actual (en español)
        const valorActual = comunidadSeleccionada;

        // Limpiar el select
        select.innerHTML = '';

        // Añadir la opción "Todas las comunidades"
        const optionTodas = document.createElement('option');
        optionTodas.value = '';
        optionTodas.textContent = t('allRegions');
        select.appendChild(optionTodas);

        // Obtener array de comunidades según idioma
        const comunidadesTraducidas = getComunidadesPorIdioma(currentLang);

        // Añadir las opciones de comunidades
        comunidadesTraducidas.forEach((nombreTraducido, index) => {
            const option = document.createElement('option');
            // El value siempre es el nombre en español para mantener consistencia
            option.value = COMUNIDADES[index];
            // El texto mostrado es según el idioma
            option.textContent = nombreTraducido;

            // Mantener la selección si había una
            if (valorActual && COMUNIDADES[index] === valorActual) {
                option.selected = true;
            }

            select.appendChild(option);
        });
    }
}

// ==================== FUNCIONES DE DATOS ====================
async function cargarDataRestaurantes() {
    try {
        const response = await fetch('michelin_espana.json');
        if (!response.ok) {
            throw new Error('No se pudo cargar el archivo de restaurantes');
        }
        const data = await response.json();
        console.log('Restaurantes cargados:', data.restaurantes.length);
        return data.restaurantes;
    } catch (error) {
        console.error('Error al cargar restaurantes:', error);
        return [];
    }
}

async function cargarDataHoteles() {
    try {
        const response = await fetch('hoteles_espana.json');
        if (!response.ok) {
            throw new Error('No se pudo cargar el archivo de hoteles');
        }
        const data = await response.json();
        console.log('Hoteles cargados:', data.hoteles.length);
        return data.hoteles;
    } catch (error) {
        console.error('Error al cargar hoteles:', error);
        return [];
    }
}

function getGET() {
    const urlParams = new URLSearchParams(window.location.search);
    const params = {};
    for (let [key, value] of urlParams) {
        params[key] = decodeURIComponent(value);
    }
    return Object.keys(params).length > 0 ? params : null;
}

function extraerComunidad(ciudad) {
    if (!ciudad) return null;

    const mapaComunidades = {
        'Madrid': 'Madrid',
        'Barcelona': 'Cataluña',
        'Girona': 'Cataluña',
        'Tarragona': 'Cataluña',
        'Lleida': 'Cataluña',
        'València': 'Comunidad Valenciana',
        'Valencia': 'Comunidad Valenciana',
        'Alicante': 'Comunidad Valenciana',
        'Castellón': 'Comunidad Valenciana',
        'Dénia': 'Comunidad Valenciana',
        'Xàbia': 'Comunidad Valenciana',
        'Cocentaina': 'Comunidad Valenciana',
        'Sevilla': 'Andalucía',
        'Málaga': 'Andalucía',
        'Marbella': 'Andalucía',
        'Granada': 'Andalucía',
        'Córdoba': 'Andalucía',
        'Cádiz': 'Andalucía',
        'Ronda': 'Andalucía',
        'Chiclana': 'Andalucía',
        'Jerez': 'Andalucía',
        'Fuengirola': 'Andalucía',
        'Estepona': 'Andalucía',
        'San Sebastián': 'País Vasco',
        'Donostia': 'País Vasco',
        'Bilbao': 'País Vasco',
        'Vitoria': 'País Vasco',
        'Lasarte': 'País Vasco',
        'Larrabetzu': 'País Vasco',
        'Errenteria': 'País Vasco',
        'Laguardia': 'País Vasco',
        'Samaniego': 'País Vasco',
        'Elciego': 'País Vasco',
        'Asturias': 'Asturias',
        'Oviedo': 'Asturias',
        'Gijón': 'Asturias',
        'Arriondas': 'Asturias',
        'Soto de Luiña': 'Asturias',
        'Santander': 'Cantabria',
        'Puente Viesgo': 'Cantabria',
        'Santiago': 'Galicia',
        'Nigrán': 'Galicia',
        'Vigo': 'Galicia',
        'A Coruña': 'Galicia',
        'O Grove': 'Galicia',
        'Raxó': 'Galicia',
        'Santa Comba': 'Galicia',
        'Pamplona': 'Navarra',
        'Urdaitz': 'Navarra',
        'Zaragoza': 'Aragón',
        'Toledo': 'Castilla-La Mancha',
        'Almansa': 'Castilla-La Mancha',
        'Tenerife': 'Canarias',
        'Gran Canaria': 'Canarias',
        'Lanzarote': 'Canarias',
        'Adeje': 'Canarias',
        'Las Palmas': 'Canarias',
        'Maspalomas': 'Canarias',
        'Meloneras': 'Canarias',
        'Playa Blanca': 'Canarias',
        'Puerto de la Cruz': 'Canarias',
        'Porto Petro': 'Islas Baleares',
        'Calvià': 'Islas Baleares',
        'Alcudia': 'Islas Baleares',
        'Denia': 'Islas Baleares',
        'San Antonio': 'Islas Baleares',
        'Santa Eulalia': 'Islas Baleares',
        'Es Capdellà': 'Islas Baleares',
        'Ferreries': 'Islas Baleares',
        'Es Migjorn Gran': 'Islas Baleares',
        'Guía de Isora': 'Canarias',
        'Mallorca': 'Islas Baleares',
        'Menorca': 'Islas Baleares',
        'Ibiza': 'Islas Baleares',
        'Playa de Palma': 'Islas Baleares',
        'Playa de Muro': 'Islas Baleares',
        'Canyamel': 'Islas Baleares',
        'Daroca de Rioja': 'La Rioja',
        'Briones': 'La Rioja',
        'San Millán de la Cogolla': 'La Rioja',
        'Santo Domingo de la Calzada': 'La Rioja',
        'Ezcaray': 'La Rioja',
        'Olot': 'Cataluña',
        'Corçà': 'Cataluña',
        'Llançà': 'Cataluña',
        'La Canonja': 'Cataluña',
        'Caldes de Malavella': 'Cataluña',
        'Torrent': 'Cataluña',
        'La Bisbal': 'Cataluña',
        'La Selva': 'Cataluña',
        'Bellvís': 'Cataluña',
        'El Palmar': 'Murcia',
        'Cartagena': 'Murcia',
        'Huesca': 'Aragón',
        'León': 'Castilla y León',
        'Segovia': 'Castilla-La Mancha',
        'Cuenca': 'Castilla-La Mancha',
        'Solares': 'Cantabria',
        'Cáceres': 'Extremadura',
        'Osma': 'Castilla y León',
        'Salamanca': 'Castilla y León',
        'Menesterio': 'Extremadura',
        'Arantza': 'Navarra',
        'Tudela': 'Navarra',
        'Ávila': 'Castilla y León',
        'Retamar': 'Andalucía',
        'Los Tojos': 'Cantabria',
        'Burgos': 'Castilla y León',
        'Valladolid': 'Castilla y León',
        'Alsasua': 'Navarra',
        'Azpeitia': 'Gipuzkoa',
        'Comillas': 'Andalucía',
        'Llerena': 'Extremadura',
        'Zafra': 'Extremadura',
        'Pastrana': 'Castilla-La Mancha',
        'Uceda': 'Castilla-La Mancha',
        'Cogolludo': 'Castilla-La Mancha',
        'Soria': 'Castilla y León',
        'Monroyo': 'Aragón',
        'Las Presillas': 'Cantabria',
        'Cillorigo de Liébana': 'Cantabria',
        'Bidania-Goiatz': 'País Vasco',
        'La Manga del Mar Menor': 'Murcia',
        'Port de Sant Miquel': 'Islas Baleares'
    };

    for (let clave in mapaComunidades) {
        if (ciudad.includes(clave)) {
            return mapaComunidades[clave];
        }
    }

    return null;
}

// ==================== FUNCIONES DEL MAPA ====================
function initMap() {
    const centroEspana = {
        lat: 40.4168,
        lng: -3.7038
    };

    mapa = new google.maps.Map(document.getElementById("mapa"), {
        center: centroEspana,
        zoom: 6
    });
}

function toggleSubmenu(submenuId) {
    const submenu = document.getElementById(submenuId);
    const arrow = document.querySelector(`[data-submenu="${submenuId}"] .arrow`);

    if (submenu.style.maxHeight && submenu.style.maxHeight !== '0px') {
        submenu.style.maxHeight = '0px';
        arrow.classList.remove('open');
    } else {
        submenu.style.maxHeight = submenu.scrollHeight + 'px';
        arrow.classList.add('open');
    }
}

function colocarLeyenda() {
    const legend = document.getElementById("legend");

    const iconBase = "https://maps.google.com/mapfiles/kml/shapes/";

    let html = `
        <div class="legend-category">
            <a href="#" data-category="restaurantes" data-submenu="submenu-restaurantes">
                <img src="${iconBase}dining_maps.png" style="width:20px;height:20px;">
                <span class="category-text">${t('categories.restaurantes')}</span>
                <span class="arrow">▼</span>
            </a>
            <div id="submenu-restaurantes" class="submenu">
                <a href="#" data-subcategory="restaurantes3">
                    <span class="star-icon">⭐⭐⭐</span>
                    <span class="category-text">${t('categories.restaurantes3')}</span>
                </a>
                <a href="#" data-subcategory="restaurantes2">
                    <span class="star-icon">⭐⭐</span>
                    <span class="category-text">${t('categories.restaurantes2')}</span>
                </a>
                <a href="#" data-subcategory="restaurantes1">
                    <span class="star-icon">⭐</span>
                    <span class="category-text">${t('categories.restaurantes1')}</span>
                </a>
            </div>
        </div>
        
        <div class="legend-category">
            <a href="#" data-category="hoteles" data-submenu="submenu-hoteles">
                <img src="${iconBase}lodging_maps.png" style="width:20px;height:20px;">
                <span class="category-text">${t('categories.hoteles')}</span>
                <span class="arrow">▼</span>
            </a>
            <div id="submenu-hoteles" class="submenu">
                <a href="#" data-subcategory="hoteles5">
                    <span class="star-icon">★★★★★</span>
                    <span class="category-text">${t('categories.hoteles5')}</span>
                </a>
            </div>
        </div>
        
        <div class="ca-filter">
            <label for="ca-select">${t('filterByRegion')}:</label>
            <select id="ca-select">
                <option value="">${t('allRegions')}</option>
                ${getComunidadesPorIdioma(currentLang).map((nombreTraducido, index) => 
                    `<option value="${COMUNIDADES[index]}">${nombreTraducido}</option>`
                ).join('')}
            </select>
        </div>
    `;

    legend.innerHTML += html;

    document.querySelectorAll('[data-submenu]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const submenuId = link.getAttribute('data-submenu');
            toggleSubmenu(submenuId);
        });
    });

    document.querySelectorAll('[data-subcategory]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const subcategoria = link.getAttribute('data-subcategory');
            cargarCategoria(subcategoria);
        });
    });

    document.getElementById('ca-select').addEventListener('change', (e) => {
        comunidadSeleccionada = e.target.value || null;
        console.log('Comunidad seleccionada:', comunidadSeleccionada);
        if (categoriaActual) {
            cargarCategoria(categoriaActual);
        }
    });
}

async function cargarCategoria(categoria) {
    console.log('Cargando categoría:', categoria);
    categoriaActual = categoria;

    if (categoria.startsWith('restaurantes')) {
        if (!dataRestaurantes) {
            dataRestaurantes = await cargarDataRestaurantes();
        }
        let estrellas;
        if (categoria === 'restaurantes3') {
            estrellas = 3;
        } else if (categoria === 'restaurantes2') {
            estrellas = 2;
        } else if (categoria === 'restaurantes1') {
            estrellas = 1;
        }
        estrellasActuales = estrellas;
        colocarPinesRestaurantes(dataRestaurantes, estrellas);
    } else if (categoria.startsWith('hoteles')) {
        if (!dataHoteles) {
            dataHoteles = await cargarDataHoteles();
        }
        const estrellas = categoria === 'hoteles5' ? 5 : 4;
        estrellasActuales = estrellas;
        colocarPinesHoteles(dataHoteles, estrellas);
    }
}

// CLUSTERING PARA RESTAURANTES
function colocarPinesRestaurantes(data, estrellasMinimas) {
    if (markers) markers.forEach(marker => marker.setMap(null));
    markers = [];
    if (infoWindowActivo) infoWindowActivo.close();
    infoWindowActivo = null;
    markerActivo = null;
    datosMarkerActivo = null;

    let bounds = new google.maps.LatLngBounds();
    let contadorMarcadores = 0;
    let contadorTotal = 0;
    const iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';

    const cityOffsets = {
        'Barcelona': [
            [0, 0],
            [20, 20],
            [-20, 20],
            [0, -20],
            [20, -20],
            [-20, 0]
        ],
        'Madrid': [
            [0, 0],
            [15, 15],
            [-15, 15],
            [0, -15],
            [15, -20],
            [-15, -10]
        ],
        'San Sebastián': [
            [0, 0],
            [20, 0],
            [-20, 0]
        ]
    };

    let cityIndex = {};

    data.forEach((element) => {
        if (parseInt(element.estrellas) === estrellasMinimas) {
            contadorTotal++;

            const lat = parseFloat(element.latitud);
            const lng = parseFloat(element.longitud);
            const ciudad = element.ciudad;
            const comunidad = extraerComunidad(ciudad);

            // Filtrar por comunidad si está seleccionada
            if (comunidadSeleccionada && comunidad !== comunidadSeleccionada) {
                return;
            }

            let offset = [0, 0];
            if (cityOffsets[ciudad]) {
                if (!cityIndex[ciudad]) cityIndex[ciudad] = 0;
                const offsets = cityOffsets[ciudad];
                offset = offsets[cityIndex[ciudad] % offsets.length];
                cityIndex[ciudad]++;
            }

            const position = {
                lat: lat + offset[0] / 100000,
                lng: lng + offset[1] / 100000
            };

            const marker = new google.maps.Marker({
                position: position,
                map: mapa,
                icon: {
                    url: iconBase + 'dining.png',
                    scaledSize: new google.maps.Size(24, 24),
                    anchor: new google.maps.Point(12, 24)
                },
                title: element.nombre
            });

            bounds.extend(position);
            contadorMarcadores++;

            marker.addListener('click', () => {
                if (infoWindowActivo) infoWindowActivo.close();
                const infoWindow = crearInfoWindow(
                    element.nombre,
                    element.ciudad,
                    element.provincia,
                    'restaurante',
                    element.estrellas,
                    element.web,
                    element.direccion,
                    element.cp,
                    element.telefono
                );
                infoWindow.open(mapa, marker);
                infoWindowActivo = infoWindow;
                markerActivo = marker;
                datosMarkerActivo = {
                    nombre: element.nombre,
                    ciudad: element.ciudad,
                    provincia: element.provincia,
                    tipo: 'restaurante',
                    estrellas: element.estrellas,
                    web: element.web,
                    direccion: element.direccion,
                    cp: element.cp,
                    telefono: element.telefono
                };
            });

            markers.push(marker);
        }
    });

    console.log(`Restaurantes de ${estrellasMinimas}☆: Total=${contadorTotal}, Mostrados=${contadorMarcadores}`);

    if (contadorMarcadores > 0) {
        mapa.fitBounds(bounds);
        if (contadorMarcadores === 1) {
            google.maps.event.addListenerOnce(mapa, 'bounds_changed', () => {
                if (mapa.getZoom() > 12) mapa.setZoom(12);
            });
        }
    } else {
        const mensaje = comunidadSeleccionada ?
            `No se encontraron restaurantes con ${estrellasMinimas} estrellas Michelin en ${comunidadSeleccionada}` :
            `No se encontraron restaurantes con ${estrellasMinimas} estrellas Michelin`;
        alert(mensaje);
    }
}

// CLUSTERING PARA HOTELES  
function colocarPinesHoteles(data, estrellasMinimas) {
    if (markers) markers.forEach(marker => marker.setMap(null));
    markers = [];
    if (infoWindowActivo) infoWindowActivo.close();
    infoWindowActivo = null;
    markerActivo = null;
    datosMarkerActivo = null;

    let bounds = new google.maps.LatLngBounds();
    let contadorMarcadores = 0;
    let contadorTotal = 0;
    let contadorSinCoordenadas = 0;
    let contadorFiltradosComunidad = 0;
    let contadorDuplicados = 0;
    const iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';

    const cityOffsets = {
        'Madrid': [
            [0, 0],
            [20, 20],
            [-20, 20],
            [0, -20]
        ],
        'Barcelona': [
            [0, 0],
            [20, 0],
            [-20, 0],
            [0, -20]
        ]
    };
    let cityIndex = {};

    // Set para detectar duplicados
    const hotelesUnicos = new Set();

    data.forEach(element => {
        const estrellas = parseInt(element.estrellas) || 0;
        if (estrellas === estrellasMinimas) {
            contadorTotal++;

            // Verificar coordenadas válidas
            const lat = parseFloat(element.latitud);
            const lng = parseFloat(element.longitud);

            if (isNaN(lat) || isNaN(lng)) {
                contadorSinCoordenadas++;
                console.warn(`Hotel sin coordenadas válidas: ${element.nombre}`);
                return;
            }

            // Detectar duplicados por nombre
            const nombreKey = element.nombre.toLowerCase().trim();
            if (hotelesUnicos.has(nombreKey)) {
                contadorDuplicados++;
                console.warn(`Hotel duplicado omitido: ${element.nombre}`);
                return;
            }
            hotelesUnicos.add(nombreKey);

            const ciudad = element.ciudad;
            const provincia = element.provincia;
            const comunidad = extraerComunidad(ciudad) || extraerComunidad(provincia);

            // Filtrar por comunidad si está seleccionada
            if (comunidadSeleccionada && comunidad !== comunidadSeleccionada) {
                contadorFiltradosComunidad++;
                return;
            }

            // Si no se reconoce la comunidad, avisar
            if (!comunidad) {
                console.warn(`No se reconoce comunidad para: ${ciudad} / ${provincia} - Hotel: ${element.nombre}`);
            }

            let offset = [0, 0];
            if (cityOffsets[ciudad]) {
                if (!cityIndex[ciudad]) cityIndex[ciudad] = 0;
                const offsets = cityOffsets[ciudad];
                offset = offsets[cityIndex[ciudad] % offsets.length];
                cityIndex[ciudad]++;
            }

            const position = {
                lat: lat + offset[0] / 100000,
                lng: lng + offset[1] / 100000
            };

            const marker = new google.maps.Marker({
                position: position,
                map: mapa,
                icon: {
                    url: iconBase + 'lodging.png',
                    scaledSize: new google.maps.Size(24, 24),
                    anchor: new google.maps.Point(12, 24)
                },
                title: element.nombre
            });

            bounds.extend(position);
            contadorMarcadores++;

            marker.addListener('click', () => {
                if (infoWindowActivo) infoWindowActivo.close();
                const infoWindow = crearInfoWindow(
                    element.nombre,
                    element.ciudad,
                    element.provincia,
                    'hotel',
                    element.estrellas,
                    element.web,
                    element.direccion,
                    element.cp,
                    element.telefono
                );
                infoWindow.open(mapa, marker);
                infoWindowActivo = infoWindow;
                markerActivo = marker;
                datosMarkerActivo = {
                    nombre: element.nombre,
                    ciudad: element.ciudad,
                    provincia: element.provincia,
                    tipo: 'hotel',
                    estrellas: element.estrellas,
                    web: element.web,
                    direccion: element.direccion,
                    cp: element.cp,
                    telefono: element.telefono
                };
            });

            markers.push(marker);
        }
    });

    // Resumen detallado
    console.log(`
╔═══════════════════════════════════════╗
RESUMEN HOTELES ${estrellasMinimas}★
╚═══════════════════════════════════════╝
Total en JSON:              ${contadorTotal}
Sin coordenadas válidas:    ${contadorSinCoordenadas}
Duplicados omitidos:        ${contadorDuplicados}
Filtrados por comunidad:    ${contadorFiltradosComunidad}
────────────────────────────────────────
MOSTRADOS EN MAPA:          ${contadorMarcadores}
╚═══════════════════════════════════════╝
Comunidad seleccionada: ${comunidadSeleccionada || 'Ninguna (mostrando todas)'}
    `);

    if (contadorMarcadores > 0) {
        mapa.fitBounds(bounds);
        if (contadorMarcadores === 1) {
            google.maps.event.addListenerOnce(mapa, 'bounds_changed', () => {
                if (mapa.getZoom() > 12) mapa.setZoom(12);
            });
        }
    } else {
        const mensaje = comunidadSeleccionada ?
            `No se encontraron hoteles de ${estrellasMinimas} estrellas en ${comunidadSeleccionada}` :
            `No se encontraron hoteles de ${estrellasMinimas} estrellas`;
        alert(mensaje);
    }
}

function crearInfoWindow(nombre, ciudad, provincia, tipo, estrellas, web, direccion, cp, telefono) {
    let colorPrincipal, colorSecundario, emoji, tipoTexto;

    if (tipo === 'restaurante') {
        if (estrellas === 3) {
            colorPrincipal = '#D4AF37';
            colorSecundario = '#FFF8DC';
            emoji = '👨‍🍳';
        } else if (estrellas === 2) {
            colorPrincipal = '#C0C0C0';
            colorSecundario = '#F5F5F5';
            emoji = '🍽️';
        } else {
            colorPrincipal = '#CD7F32';
            colorSecundario = '#FFF5EE';
            emoji = '🍷';
        }
        tipoTexto = 'Restaurante Michelin';
    } else {
        colorPrincipal = '#1E3A8A';
        colorSecundario = '#DBEAFE';
        emoji = '🏨';
        tipoTexto = 'Hotel de Lujo';
    }

    let html = `

        <div style="
            background: linear-gradient(135deg, ${colorPrincipal} 0%, ${colorSecundario} 100%);
            padding: 25px 15px 15px 15px;
            width: 100%;
            box-sizing: border-box;
            position: relative;
        ">
            <button onclick="if(window.currentInfoWindow) window.currentInfoWindow.close();" style="
                position: absolute;
                top: 10px;
                right: 10px;
                background: rgba(0,0,0,0.2);
                border: none;
                border-radius: 50%;
                width: 24px;
                height: 24px;
                cursor: pointer;
                color: white;
                font-weight: bold;
                z-index: 10;
            ">×</button>
            
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 4px;">
                <span style="color: ${tipo === 'restaurante' && estrellas === 3 ? '#1a1a1a' : tipo === 'restaurante' ? '#333' : '#fff'}; font-size: 10px; font-weight: 700; text-transform: uppercase;">${tipoTexto}</span>
                <span style="font-size: 18px;">${emoji}</span>
            </div>
            <h2 style="margin: 0; color: ${tipo === 'restaurante' && estrellas === 3 ? '#1a1a1a' : tipo === 'restaurante' ? '#333' : '#fff'}; font-size: 17px; font-weight: 700; text-align: center;">${nombre}</h2>
        </div>
            
        <div style="width: 100%; box-sizing: border-box; margin: 0; padding: 0;">
            <div style="
                display: flex;
                align-items: center;
                width: 100%;
                box-sizing: border-box;
                padding: 10px 15px;
                background: ${colorSecundario};
                margin: 0;
            ">`;

    if (tipo === 'restaurante') {
        html += `<span style="color: ${colorPrincipal}; font-size: 14px; font-weight: bold;">`;
        for (let i = 0; i < estrellas; i++) html += '⭐';
        html += ` Michelin</span>`;
    } else {
        html += `<span style="color: ${colorPrincipal}; font-size: 14px; font-weight: bold;">`;
        for (let i = 0; i < estrellas; i++) html += '⭐';
        html += `</span>`;
    }

    html += `</div>
            
    <div style="display: flex; flex-direction: column; gap: 8px; margin: 30px 15px 15px 15px; font-size: 13px; color: #444;">
    <div style="display: flex; gap: 8px; padding-left: 5px;"><span>📍</span><span>${direccion || ''} ${ciudad}</span></div>
    ${cp || provincia ? `<div style="display: flex; gap: 8px; padding-left: 5px;"><span>📮</span><span>${cp || ''} - ${provincia || ''}</span></div>` : ''}
    ${telefono ? `<div style="display: flex; gap: 8px; padding-left: 5px;"><span>📞</span><a href="tel:${telefono}" style="color: ${colorPrincipal}; text-decoration: none;">${telefono}</a></div>` : ''}
</div>`;

    if (web) {
        let webUrl = web.startsWith('http') ? web : "https://" + web;
        html += `
            <a href="${webUrl}" target="_blank" style="
                display: block;
                width: 100%;
                text-align: center;
                padding: 12px 0;
                background: ${colorPrincipal};
                color: white;
                text-decoration: none;
                font-weight: 600;
                box-sizing: border-box;
                margin-top: 15px;
            ">🌐 ${t('website')}</a>`;
    }

    html += `</div></div>`;

    const infoWindow = new google.maps.InfoWindow({
        content: html,
        maxWidth: 320
    });

    google.maps.event.addListener(infoWindow, 'domready', function () {
        window.currentInfoWindow = infoWindow;
    });

    return infoWindow;
}
// ==================== INICIALIZACIÓN ====================
window.onload = function () {
    const valores = getGET();

    if (valores && valores['lang']) {
        currentLang = valores['lang'];
    }

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            cambiarIdioma(btn.dataset.lang);
        });
        btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });

    initMap();
    colocarLeyenda();

    console.log('Aplicación inicializada. Selecciona una categoría en la leyenda.');
}