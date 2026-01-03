import json
import time
import requests
from urllib.parse import quote

# Lista de restaurantes
restaurantes_texto = """A Coruña – Árbore da Veira
Adeje – Donaire
Adeje – Haydée by Víctor Suárez – NOVEDAD
Adeje – Il Bocconcino by Royal Hideaway
Adeje – Nub
Adeje – San-Hô
Aínsa – Callizo
Alacant – Baeza & Rufete
Albacete – Ababol
Alcalá del Valle – Mesón Sabor Andaluz
Alcanar – Citrus del Tancat
Alcoseebre – Atalaya
Amorebieta-Etxano – Boroa
Amorebieta-Etxano – La Revelía – NOVEDAD
Ampuero – Solana
Anciles – Ansils
Anglès – L'Aliança d'Anglès
Arbúcies – Les Magnòlies
Arriondas – El Corral del Indianu
Ávila – Barro
Axpe – Etxebarri
Axpe – Txispa
Baeza – Vandelvira
Barcelona – Alkimia
Barcelona – Angle
Barcelona – Atempo
Barcelona – Caelis
Barcelona – COME by Paco Méndez
Barcelona – Dos Palillos
Barcelona – Fishølogy
Barcelona – Hisop
Barcelona – Hofmann
Barcelona – Kamikaze – NOVEDAD
Barcelona – Koy Shunka
Barcelona – MAE Barcelona
Barcelona – Moments
Barcelona – Prodigi
Barcelona – Quirat
Barcelona – SCAPAR – NOVEDAD
Barcelona – Slow & Low
Barcelona – Suto
Barcelona – Teatro kitchen & bar
Barcelona – Via Veneto
Barizo – As Garzas
Benavente – El Ermitaño
Benicarló – Raúl Resino
Benissa – Casa Bernardi
Bilbao – Islares – NOVEDAD
Bilbao – Mina
Bilbao – Nerua Guggenheim Bilbao
Bilbao – Ola Martín Berasategui
Bilbao – Zarate
Burgos – Cobo Evolución
Burgos – Ricardo Temiño
Cádiz – Código de Barra
Cádiz – Mare – NOVEDAD
Calldetenes – Can Jubany
Calp – Audrey's
Calp – Beat
Calp – Orobianco
Cambados – Yayo Daporta
Cambrils – Can Bosch
Cambrils – Rincón de Diego
Canfranc-Estación – Canfranc Express
Carasa – Pico Velasco – NOVEDAD
Carcaixent – Origen
Cartagena – Magoga
Casas-Ibáñez – Oba-
Castelló d'Empúries – Emporium
Castroverde de Campos – Lera
Córdoba – Choco
Córdoba – ReComiendo – NOVEDAD
Cornudella de Montsant – Quatre Molins
Cuenca – Casas Colgadas Restaurante
Dénia – Peix & Brases
Dima – Garena
Donostia - San Sebastián – iBAi by Paulo Airaudo
Donostia - San Sebastián – Itzuli – NOVEDAD
Donostia - San Sebastián – Kokotxa
Eivissa – La Gaia
Eivissa – Omakase by Walt
El Ejido – La Costa
El Masnou – Tresmacarrons
Elche – La Finca
Es Capdellà – Sa Clastra
Fisterra – Terra
Fuengirola – Sollo
Galdakao – Andra Mari
Getaria – Elkano
Gijón – Auga
Gijón – Marcos
Gimenells – Malena
Girona – Divinum
Girona – Massana
Granada – Faralá – NOVEDAD
Gombrèn – La Fonda Xesc
Haro – Nublo
Hondarribia – Alameda
Hoznayo – La Bicicleta
Huesca – Lillas Pastia
Huesca – Tatau
Illescas – El Bohío
Jaén – Bagá
Jaén – Dama Juana
Jaén – Malak
Jaén – Radis
Jerez de la Frontera – Mantúa
La Nucia – El Xato
La Vall de Bianya – Ca l'Enric
Larrabetzu – Eneko
Las Palmas de Gran Canaria – Muxgo
Las Palmas de Gran Canaria – Poemas by Hermanos Padrón
Las Palmas de Gran Canaria – Tabaiba
León – Cocinandos
León – Pablo
Llagostera – Els Tinars
Llanes – El Retiro
Llucmajor – Andreu Genestra
Logroño – Ajonegro
Logroño – Ikaro
Logroño – Kiro Sushi
Los Rosales – Ochando – NOVEDAD
Madrid – A'Barra
Madrid – CEBO
Madrid – Chispa Bistró
Madrid – Clos Madrid
Madrid – Corral de la Morería Gastronómico
Madrid – Desde 1911
Madrid – El Invernadero
Madrid – EMi – NOVEDAD
Madrid – Èter – NOVEDAD
Madrid – Gaytán
Madrid – Gofio
Madrid – La Tasquería
Madrid – OSA
Madrid – Pabú
Madrid – Quimbaya
Madrid – RavioXO
Madrid – Ricardo Sanz Wellington
Madrid – Saddle
Madrid – Santerra
Madrid – Sen Omakase
Madrid – Toki
Madrid – Ugo Chan
Madrid – VelascoAbellà
Madrid – Yugo The Bunker
Málaga – Blossom
Málaga – José Carlos García
Málaga – Kaleja
Málaga – Palodú – NOVEDAD
Marbella – BACK
Marbella – Messina
Marbella – Nintai
Matapozuelos – La Botica de Matapozuelos
Miranda de Ebro – Alejandro Serrano
Miranda de Ebro – Erre de Roca
Mogán – Los Guayres
Mungia – Bakea – NOVEDAD
Murcia – Almo de Juan Guillamón
Murcia – Frases
Muro – Fusion19
Navaleno – La Lobita
Olost – Sala
Ondara – Casa Pepa
Oropesa del Mar – Llavor – NOVEDAD
Ortiguera – Ferpel Gastronómico
Ourense – Ceibe
Ourense – Nova
Ourense – Miguel González – NOVEDAD
Oviedo – NM
Padrón – O'Pazo
Palma – DINS Santi Taura
Palma – Marc Fosh
Palma – Zaranda
Palmanova – Es Fum
Pamplona – Europa
Pamplona – Kabo
Pamplona – Rodero
Patalavaca – La Aquarela
Peñafiel – Ambivium
Peralada – Castell Peralada
Playa de las Américas – Taste 1973
Playa Blanca – Kamezí
Ponferrada – Mu•na
Pontevedra – Eirado
Portbou – Voramar
Port d'Alcúdia – Maca de Castro
Pozuelo de Alarcón – Ancestral – NOVEDAD
Prendes – Casa Gerardo
Puerto de la Cruz (Islas Canarias) – El Taller Seve Díaz – NOVEDAD
Quintanilla de Onésimo – Taller Arzuaga
Ribadesella – Ayalga
Sagàs – Els Casals
Sagunt – Arrels
Salamanca – En la Parra
Salamanca – Víctor Gutiérrez
Salinas – Real Balneario
Salou – Deliranto
San Antonio de Benagéber – Simposio – NOVEDAD
San Feliz – Monte
San Lorenzo de El Escorial – Montia
San Salvador de Poio – Solla
Sant Fruitós de Bages – L'Ó
Sant Josep de sa Talaia – Unic
Sant Julià de Ramis – Esperit Roca
Sant Martí Sarroca – Casa Nova
Santa Coloma de Gramenet – Lluerna
Santa Cruz de Campezo – ARREA!
Santander – Casona del Judío
Santander – El Serbal
Santiago de Compostela – A Tafona
Santiago de Compostela – Casa Marcelo
Santiago de Compostela – Simpar
Sardas – La Era de los Nogales
Sardón de Duero – Refectorio
Sevilla – Abantal
Sevilla – Cañabota
Sigüenza – El Doncel
Sigüenza – El Molino de Alcuneza
Sober – Vértigo – NOVEDAD
Sóller – Béns d'Avall
Sort – Fogony
Talavera de la Reina – Raíces-Carlos Maldonado
Tella – Casa Rubén – NOVEDAD
Tolosa – Ama
Tomelloso – Epílogo
Torre de Juan Abad – Coto de Quevedo Evolución
Torrenueva – Retama
Tox – Regueiro – NOVEDAD
Tramacastilla – Hospedería El Batán
Ulldecona – L'Antic Molí
Ulldecona – Les Moles
Valdemorillo – La Casa de Manolo Franco
Valdemoro – Chirón
València – Fierro
València – Fraula
València – Kaido Sushi Bar
València – La Salita
València – Lienzo
València – Riff
Vall d'Alba – Cal Paradís
Valladolid – Alquimia – Laboratorio
Valladolid – Trigo
Villanova – Casa Arcas
Vigo – Maruja Limón
Vigo – Silabario
Vinaròs – Rubén Miralles – NOVEDAD
Xàbia – Tula
Xerta – Villa Retiro
Yecla – Barahonda – NOVEDAD
Zaragoza – Gente Rara
Zaragoza – La Prensa
Zarza de Granadilla – Versátil"""

def parsear_restaurantes(texto):
    """Parsea el texto y devuelve lista de restaurantes"""
    restaurantes = []
    for linea in texto.strip().split('\n'):
        if ' – ' in linea:
            partes = linea.split(' – ')
            ciudad = partes[0].strip()
            nombre_completo = ' – '.join(partes[1:])
            es_novedad = 'NOVEDAD' in nombre_completo
            nombre = nombre_completo.replace(' – NOVEDAD', '').strip()
            
            restaurantes.append({
                'ciudad': ciudad,
                'nombre': nombre,
                'estrellas': 1,
                'novedad': 'Nueva' if es_novedad else 'Mantiene',
                'latitud': None,
                'longitud': None
            })
    return restaurantes

def geocodificar_nominatim(ciudad, nombre):
    """Geocodifica usando Nominatim (OpenStreetMap)"""
    query = f"{nombre} restaurante {ciudad} España"
    url = f"https://nominatim.openstreetmap.org/search?q={quote(query)}&format=json&limit=1"
    headers = {'User-Agent': 'Michelin-Geocoder/1.0'}
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.ok:
            data = response.json()
            if data:
                return float(data[0]['lat']), float(data[0]['lon'])
    except Exception as e:
        print(f"Error Nominatim: {e}")
    return None, None

def geocodificar_con_ciudad(ciudad):
    """Geocodifica solo por ciudad como fallback"""
    query = f"{ciudad}, España"
    url = f"https://nominatim.openstreetmap.org/search?q={quote(query)}&format=json&limit=1"
    headers = {'User-Agent': 'Michelin-Geocoder/1.0'}
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.ok:
            data = response.json()
            if data:
                return float(data[0]['lat']), float(data[0]['lon'])
    except Exception as e:
        print(f"Error geocodificación ciudad: {e}")
    return None, None

def main():
    print("=== Geocodificador de Restaurantes Michelin 1 Estrella ===\n")
    
    restaurantes = parsear_restaurantes(restaurantes_texto)
    print(f"Total de restaurantes: {len(restaurantes)}\n")
    
    exitosos = 0
    fallidos = []
    
    for i, rest in enumerate(restaurantes, 1):
        print(f"[{i}/{len(restaurantes)}] {rest['nombre']} - {rest['ciudad']}")
        
        # Intentar geocodificar con nombre completo
        lat, lon = geocodificar_nominatim(rest['ciudad'], rest['nombre'])
        
        # Si falla, intentar solo con ciudad
        if not lat:
            print(f"  → Intentando solo con ciudad...")
            lat, lon = geocodificar_con_ciudad(rest['ciudad'])
        
        if lat and lon:
            rest['latitud'] = round(lat, 6)
            rest['longitud'] = round(lon, 6)
            print(f"  ✓ Coordenadas: {lat:.6f}, {lon:.6f}")
            exitosos += 1
        else:
            print(f"  ✗ No se encontraron coordenadas")
            fallidos.append(rest)
        
        # Esperar 1 segundo entre peticiones (política de uso de Nominatim)
        time.sleep(1)
    
    # Crear el JSON
    resultado = {
        "guia": "España 2025",
        "total_restaurantes_con_estrella": len(restaurantes),
        "restaurantes": restaurantes
    }
    
    # Guardar resultado
    with open('michelin_1_estrella.json', 'w', encoding='utf-8') as f:
        json.dump(resultado, f, ensure_ascii=False, indent=2)
    
    print(f"\n=== RESUMEN ===")
    print(f"✓ Geocodificados: {exitosos}/{len(restaurantes)}")
    print(f"✗ Fallidos: {len(fallidos)}")
    
    if fallidos:
        print(f"\nRestaurantes sin coordenadas:")
        for r in fallidos:
            print(f"  - {r['nombre']} ({r['ciudad']})")
    
    print(f"\n✓ Archivo guardado: michelin_1_estrella.json")

if __name__ == "__main__":
    main()