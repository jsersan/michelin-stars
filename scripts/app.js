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
        categories: {
            hoteles: "Hoteles Premium",
            hoteles4: "Hoteles 4 Estrellas",
            hoteles5: "Hoteles 5 Estrellas",
            restaurantes: "Restaurantes Michelin",
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
        categories: {
            hoteles: "Hotel Premiumak",
            hoteles4: "4 Izarreko Hotelak",
            hoteles5: "5 Izarreko Hotelak",
            restaurantes: "Michelin Jatetxeak",
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
        categories: {
            hoteles: "Premium Hotels",
            hoteles4: "4 Star Hotels",
            hoteles5: "5 Star Hotels",
            restaurantes: "Michelin Restaurants",
            restaurantes2: "2 Michelin Stars",
            restaurantes3: "3 Michelin Stars"
        }
    }
};

// ==================== VARIABLES GLOBALES ====================
let currentLang = 'es';
let mapa;
let markers = [];
let dataRestaurantes;
let dataHoteles;
let infoWindowActivo = null;
let markerActivo = null;
let datosMarkerActivo = null;

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
    actualizarURL();
    
    if (infoWindowActivo && markerActivo && datosMarkerActivo) {
        infoWindowActivo.close();
        const nuevoInfoWindow = crearInfoWindow(
            datosMarkerActivo.nombre,
            datosMarkerActivo.ciudad,
            datosMarkerActivo.provincia,
            datosMarkerActivo.tipo,
            datosMarkerActivo.estrellas,
            datosMarkerActivo.novedad,
            datosMarkerActivo.web
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
    document.querySelectorAll('[data-category]').forEach(el => {
        const categoria = el.getAttribute('data-category');
        const texto = el.querySelector('.category-text');
        if (texto) {
            texto.textContent = t(`categories.${categoria}`);
        }
    });
}

// ==================== FUNCIONES DE DATOS ====================
async function cargarDataRestaurantes() {
    try {
        const response = await fetch('michelin_espana_291_completo.json');
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
        const response = await fetch('hoteles_espana_premium.json');
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
    
    const html = `
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
                <a href="#" data-subcategory="hoteles4">
                    <span class="star-icon">★★★★</span>
                    <span class="category-text">${t('categories.hoteles4')}</span>
                </a>
            </div>
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
}

async function cargarCategoria(categoria) {
    console.log('Cargando categoría:', categoria);
    
    if (categoria.startsWith('restaurantes')) {
        if (!dataRestaurantes) {
            dataRestaurantes = await cargarDataRestaurantes();
        }
        const estrellas = categoria === 'restaurantes3' ? 3 : 2;
        colocarPinesRestaurantes(dataRestaurantes, estrellas);
    } else if (categoria.startsWith('hoteles')) {
        if (!dataHoteles) {
            dataHoteles = await cargarDataHoteles();
        }
        const estrellas = categoria === 'hoteles5' ? 5 : 4;
        colocarPinesHoteles(dataHoteles, estrellas);
    }
}

// CLUSTERING PARA RESTAURANTES
function colocarPinesRestaurantes(data, estrellasMinimas) {
    if (markers) markers.forEach(marker => marker.setMap(null));
    if (infoWindowActivo) infoWindowActivo.close();
    infoWindowActivo = null; markerActivo = null; datosMarkerActivo = null;
    
    let bounds = new google.maps.LatLngBounds();
    let contadorMarcadores = 0;
    const iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';
    
    // CLUSTERING SIMPLE: offset para ciudades densas
    const cityOffsets = {
      'Barcelona': [[0,0], [20,20], [-20,20], [0,-20], [20,-20], [-20,0]],
      'Madrid': [[0,0], [15,15], [-15,15], [0,-15], [15,-20], [-15,-10]],
      'San Sebastián': [[0,0], [20,0], [-20,0]]
    };
    
    let cityIndex = {};
    
    data.forEach((element, index) => {
      if (parseInt(element.estrellas) === estrellasMinimas) {
        const lat = parseFloat(element.latitud);
        const lng = parseFloat(element.longitud);
        const ciudad = element.ciudad;
        
        // OFFSET para evitar superposiciones
        let offset = [0, 0];
        if (cityOffsets[ciudad]) {
          if (!cityIndex[ciudad]) cityIndex[ciudad] = 0;
          const offsets = cityOffsets[ciudad];
          offset = offsets[cityIndex[ciudad] % offsets.length];
          cityIndex[ciudad]++;
        }
        
        const position = { lat: lat + offset[0]/100000, lng: lng + offset[1]/100000 };
        
        const marker = new google.maps.Marker({
            position: position,
            map: mapa,
            icon: {                           // ← CAMBIO AQUÍ
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
            element.nombre, element.ciudad, null, 
            'restaurante', element.estrellas, element.novedad, null
          );
          infoWindow.open(mapa, marker);
          infoWindowActivo = infoWindow;
          markerActivo = marker;
          datosMarkerActivo = element;
        });
        
        markers.push(marker);
      }
    });
    
    console.log(`${contadorMarcadores} restaurantes de ${estrellasMinimas}* Michelin añadidos al mapa (con offset clustering)`);
    
    if (contadorMarcadores > 0) {
      mapa.fitBounds(bounds);
      if (contadorMarcadores === 1) {
        google.maps.event.addListenerOnce(mapa, 'bounds_changed', () => {
          if (mapa.getZoom() > 12) mapa.setZoom(12);
        });
      }
    } else {
      alert(`No se encontraron restaurantes con ${estrellasMinimas} estrellas Michelin`);
    }
  }
  
  
  // CLUSTERING PARA HOTELES  
  function colocarPinesHoteles(data, estrellasMinimas) {
    
    if (markers) markers.forEach(marker => marker.setMap(null));
    if (infoWindowActivo) infoWindowActivo.close();
    infoWindowActivo = null; markerActivo = null; datosMarkerActivo = null;
    
    let bounds = new google.maps.LatLngBounds();
    let contadorMarcadores = 0;
    const iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';
    
    // Mismo sistema de offset para hoteles
    const cityOffsets = {
      'Madrid': [[0,0], [20,20], [-20,20], [0,-20]],
      'Barcelona': [[0,0], [20,0], [-20,0], [0,-20]]
    };
    let cityIndex = {};
    
    data.forEach(element => {
        const estrellas = parseInt(element.estrellas) || 0;
        if (estrellas === estrellasMinimas) {  // ← CAMBIO AQUÍ
        const lat = parseFloat(element.latitud);
        const lng = parseFloat(element.longitud);
        const ciudad = element.ciudad;
        
        let offset = [0, 0];
        if (cityOffsets[ciudad]) {
          if (!cityIndex[ciudad]) cityIndex[ciudad] = 0;
          const offsets = cityOffsets[ciudad];
          offset = offsets[cityIndex[ciudad] % offsets.length];
          cityIndex[ciudad]++;
        }
        
        const position = { lat: lat + offset[0]/100000, lng: lng + offset[1]/100000 };
        
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
            element.nombre, element.ciudad, element.provincia,
            'hotel', element.estrellas, null, element.web
          );
          infoWindow.open(mapa, marker);
          infoWindowActivo = infoWindow;
          markerActivo = marker;
          datosMarkerActivo = element;
        });
        
        markers.push(marker);
      }
    });
    
    console.log(`${contadorMarcadores} hoteles de ${estrellasMinimas}* añadidos al mapa (con offset clustering)`);
    
    if (contadorMarcadores > 0) {
      mapa.fitBounds(bounds);
      if (contadorMarcadores === 1) {
        google.maps.event.addListenerOnce(mapa, 'bounds_changed', () => {
          if (mapa.getZoom() > 12) mapa.setZoom(12);
        });
      }
    } else {
      alert(`No se encontraron hoteles de ${estrellasMinimas} estrellas`);
    }
  }
  
function crearInfoWindow(nombre, ciudad, provincia, tipo, estrellas, novedad, paginaWeb) {
    let markerInfo = `<div style="margin: 0; padding: 0 0 15px 0;"><h2 style="margin-top: 0; padding-top: 0;">${nombre}</h2>`;
    
    if (tipo === 'restaurante') {
        markerInfo += '<div style="color: #d4af37; font-size: 18px;">⭐ ';
        for (let i = 0; i < estrellas; i++) {
            markerInfo += '★';
        }
        markerInfo += ' Michelin</div>';
        if (novedad) {
            markerInfo += `<p style="margin: 5px 0; color: #e74c3c; font-weight: bold;">${novedad}</p>`;
        }
    } else if (tipo === 'hotel') {
        markerInfo += '<div style="color: #3498db; font-size: 16px;">';
        for (let i = 0; i < estrellas; i++) {
            markerInfo += '★';
        }
        markerInfo += '</div>';
    }
    
    markerInfo += `<p style="margin: 5px 0;"><b>${t('city')}</b>: ${ciudad}`;
    if (provincia) {
        markerInfo += ` (${provincia})`;
    }
    markerInfo += '</p>';
    
    if (paginaWeb) {
        let webUrl = paginaWeb;
        if (webUrl && !webUrl.startsWith('http')) {
            webUrl = "https://" + webUrl;
        }
        markerInfo += `<p style="margin: 10px 0 0 0;"><b>${t('moreInfo')}</b>: <a href='${webUrl}' target='_blank'>${t('website')}</a></p>`;
    }
    
    markerInfo += '</div>';

    const infoWindow = new google.maps.InfoWindow({
        content: markerInfo
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