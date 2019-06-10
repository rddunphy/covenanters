
const UK_BOUNDS = {
    north: 61.0,
    south: 49.9,
    west: -10.5,
    east: 1.8
};
const SCOTLAND_COORDS = {
    lat:56.5,
    lng:-4.2
};

var map;

function loadJSON(callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'map_data.json', true);
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(JSON.parse(xobj.responseText));
          }
    };
    xobj.send(null);
}

function addAllMarkers(data) {
    var markers = [];
    for (var i = 0; i < data.length; i++) {
        markers.push(addMarker(data[i]));
    }
    var markerCluster = new MarkerClusterer(map, markers,
            {imagePath: 'markerclusterer/img/m'});

}

function addMarker(params) {
    switch(params.type) {
        case 'grave':
            var fillColor = '#858789';
            var icon = 'cemetery';
            break;
        case 'museum':
            var fillColor = '#96e281';
            var icon = 'museum';
            break;
        case 'church':
            var fillColor = '#f45c42';
            var icon = 'church';
            break;
        default:
            var fillColor = '#00CCBB';
            var icon = 'point-of-interest';
    }
    var marker = new mapIcons.Marker({
        position: {lat: params.lat, lng: params.lng},
        map: map,
        icon: {
            path: mapIcons.shapes.MAP_PIN,
            fillColor: fillColor,
            fillOpacity: 1,
            strokeColor: '',
            strokeWeight: 0
        },
        map_icon_label: '<span class="map-icon map-icon-' + icon + '"></span>',
        title:params.name
    });
    if (params.content !== null && params.content !== undefined) {
        var imgDiv = "";
        if (params.img !== null && params.img !== undefined) {
            imgDiv = "<div><img class=info-window-img src='img/" + params.img + "' /></div>";
        }
        var infoWindow = new google.maps.InfoWindow({
            content: "<h3>" + params.name + "</h3><div>" + params.content + "</div>" + imgDiv
        });
        marker.addListener('click', function() {
            infoWindow.open(map, marker);
        });
    }
    return marker;
}

function initMap() {
    var options = {
        zoom:7,
        restriction: {
            latLngBounds: UK_BOUNDS,
            strictBounds: false,
        },
        center: SCOTLAND_COORDS
    };
    map = new google.maps.Map(document.getElementById('map'), options);
    loadJSON(addAllMarkers)
}
