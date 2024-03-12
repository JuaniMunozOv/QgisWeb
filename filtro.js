$(document).ready(function () {
    var map = L.map('map', {
        center: [21.27172, -100.66736],
        zoom: 4,
        scrollWheelZoom: false,
        tap: false
    });

    L.tileLayer('https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}').addTo(map);

    // Esta variable almacenará todos los marcadores para futuras operaciones de filtrado
    var allMarkers = [];

    // Carga y procesa los datos del archivo CSV
    $.get('QGISDATOS.csv', function (csvString) {
        var data = Papa.parse(csvString, { header: true, dynamicTyping: true, delimiter: ";" }).data;
        var propertyValues = new Set();

        data.forEach(function (row) {
            var marker = L.marker([row.LATITUD, row.LONGITUD]).bindPopup(createPopupContent(row)).addTo(map);
            allMarkers.push(marker);

            // Añade el valor de la propiedad PROPIEDAD al conjunto para asegurar valores únicos
            propertyValues.add(row.PROPIEDAD);
        });

        // Crea los elementos de filtro en el menú desplegable para la columna PROPIEDAD
        createDropdown('PROPIEDAD', propertyValues);
    });

    // Función para crear el contenido del popup del marcador
    function createPopupContent(row) {
        var popupContent = '';
        Object.keys(row).forEach(function (key) {
            if (!['LATITUD', 'LONGITUD', "UBICACIÓN"].includes(key)) {
                popupContent += `${key}: ${row[key]}<br>`;
            }
        });
        return popupContent;
    }

    // Función para crear un menú desplegable basado en los valores únicos de una columna
    function createDropdown(columnName, valuesSet) {
        var dropdown = document.getElementById('dropdown-' + columnName);
        dropdown.innerHTML = ''; // Limpia el contenido anterior
        valuesSet.forEach(function (value) {
            var option = document.createElement('a');
            option.href = '#';
            option.textContent = value;
            option.onclick = function (event) {
                event.preventDefault();
                filterMarkers(value); // Ajusta esta función según tus necesidades
            };
            dropdown.appendChild(option);
        });

    }

    // Función para filtrar marcadores basada en el valor seleccionado
    function filterMarkers(value) {
        // Remueve todos los marcadores del mapa
        allMarkers.forEach(marker => map.removeLayer(marker));

        // Filtra los marcadores que coinciden con el valor seleccionado
        const filteredMarkers = allMarkers.filter(marker => marker.getPopup().getContent().includes(`PROPIEDAD: ${value}`));

        // Añade al mapa solo los marcadores filtrados
        filteredMarkers.forEach(marker => marker.addTo(map));
    }
});
