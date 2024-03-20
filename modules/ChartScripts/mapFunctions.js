
var map = L.map('map').setView([51.505, -0.09], 13);

// if (mapLayer == "standard") {

//     mapLayerUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'

// } else if (mapLayer == "dark") {

//     mapLayerUrl = 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png'

// } else if (mapLayer == "light") {

//     mapLayerUrl = 'https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png'

// }

//Potentially add GEOJSON in future

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

function populateMap(latitudeSelection, longitudeSelection, plotType, data, mapElement, popupContentField){

    /*  
    
        plot types

        single markers

        poly-path

        poly-gon

        popup

    */

    // console.log(plotType)

    var preparedCoords = prepareMapData(latitudeSelection, longitudeSelection, data)

    switch(plotType){

        case 'single-marker':
            addMarkerToMap(preparedCoords, mapElement)
            break;

        case 'poly-line':
            addPolyLineToMap(preparedCoords, mapElement)
            break;

        case 'polygon':
            addPolygonToMap(preparedCoords, mapElement)
            break;

        case 'circle':
            addCircleToMap(preparedCoords, mapElement, 10, 'red', 0.4)
            break;

        case 'popup':
            addPopupToMap(preparedCoords, mapElement, data, popupContentField)
            break;
    }

    return mapElement

}

function addMarkerToMap(preparedCoords, mapElement){

    for(var i = 0; i < preparedCoords.length; i++){

        L.marker(preparedCoords[i], { clickable: true }).addTo(mapElement);

    }

}

function addPolyLineToMap(preparedCoords, mapElement){

    L.polyline(preparedCoords, { color: 'red' }).addTo(mapElement)

}

function addPolygonToMap(preparedCoords, mapElement){

    L.polygon(preparedCoords).addTo(mapElement)

}

function addCircleToMap(preparedCoords, mapElement, radius, color, fillOpacity){

    for(var i = 0; i < preparedCoords.length; i++){

        L.circle(preparedCoords[i], { radius: radius, color: color, fillOpacity: fillOpacity }).addTo(mapElement);

    }

}

function addPopupToMap(preparedCoords, mapElement, data, popupContentField){

    for(var i = 0; i < preparedCoords.length; i++){

        var marker = L.marker(preparedCoords[i], { clickable: true }).addTo(mapElement);

        var popup = marker.bindPopup(data.record[i][popupContentField], {autoClose:false})
        
        popup.openPopup()

    }

}

function prepareMapData(latitudeSelection, longitudeSelection, data){

    var latitude;
    var longitude;

    var coordinates = []

    for(var i = 0; i < data.record.length; i++){

        latitude = data.record[i][latitudeSelection]
        longitude = data.record[i][longitudeSelection]

        var coordinateRecord = [latitude, longitude]

        coordinates.push(coordinateRecord);

    }
    
    return coordinates
}

function saveChart(){

    //Code used to save mapchart

    if($('#chartName').val() == ""){

        alert('You need to give your chart a name!');
        return 0

    }

    var config = {

        chartName:$('#chartName').val(),
        chartType:'map',
        dataSource: '',
        dataBase: $('#databaseSelection').val(),
        plotType: $('#plot-type').val(),
        xAxis: '',
        yAxis: '',
        datasetQueries: datasetQueries,
        mapLayer: '',
        latitude: $('#latitude-selection').val(),
        longitude: $('#longitude-selection').val(),
        photoUrlField: '',
        popupDisplayField: ''
       
    }

    config = JSON.stringify(config)

    $.post({

        type:'POST', 
        url: '/chart/create',
        data: {
            config: config
        },
        success: function() {
            window.location = "/chart/viewAll/"
        }
    })

}
