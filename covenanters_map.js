
const UK_BOUNDS = {
    north: 61.0,
    south: 49.9,
    west: -10.5,
    east: 1.8
};

const SCOTLAND_COORDS = {
    lat: 56.5,
    lng: -4.2
};

const MAP_STYLE = [
    {
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#ebe3cd"
            }
        ]
    },
    {
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#523735"
            }
        ]
    },
    {
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#f5f1e6"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#c9b2a6"
            }
        ]
    },
    {
        "featureType": "administrative.land_parcel",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#dcd2be"
            }
        ]
    },
    {
        "featureType": "administrative.land_parcel",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#ae9e90"
            }
        ]
    },
    {
        "featureType": "landscape.natural",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#dfd2ae"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#dfd2ae"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#93817c"
            }
        ]
    },
    {
        "featureType": "poi.business",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#a5b076"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "labels.text",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#447530"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#f5f1e6"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#fdfcf8"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#f8c967"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#e9bc62"
            }
        ]
    },
    {
        "featureType": "road.highway.controlled_access",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#e98d58"
            }
        ]
    },
    {
        "featureType": "road.highway.controlled_access",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#db8555"
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#806b63"
            }
        ]
    },
    {
        "featureType": "transit.line",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#dfd2ae"
            }
        ]
    },
    {
        "featureType": "transit.line",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#8f7d77"
            }
        ]
    },
    {
        "featureType": "transit.line",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#ebe3cd"
            }
        ]
    },
    {
        "featureType": "transit.station",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#dfd2ae"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#b9d3c2"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#92998d"
            }
        ]
    }
];

var map;

function setUpInfoWindowToggle() {
    google.maps.InfoWindow.prototype._open = google.maps.InfoWindow.prototype.open;
    google.maps.InfoWindow.prototype._close = google.maps.InfoWindow.prototype.close;
    google.maps.InfoWindow.prototype._openedState = false;

    google.maps.InfoWindow.prototype.open = function(map, anchor) {
        this._openedState = true;
        this._open(map, anchor);
    };

    google.maps.InfoWindow.prototype.close = function() {
        this._openedState = false;
        this._close();
    };

    google.maps.InfoWindow.prototype.getOpenedState = function() {
        return this._openedState;
    };

    google.maps.InfoWindow.prototype.setOpenedState = function(val) {
        this._openedState = val;
    };

    google.maps.InfoWindow.prototype.toggle = function(map, anchor) {
        if (this.getOpenedState()) {
            this.close();
        } else {
            this.open(map, anchor);
        }
    };
}

function loadJSON(path, callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', path, true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
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
    var clusterer = new MarkerClusterer(map, markers,
        {imagePath: "markerclusterer/img/m", averageCenter: true});
}

function addMarker(params) {
    var marker = new google.maps.Marker({
        position: {lat: params.lat, lng: params.lng},
        map: map,
        icon: "icons/pin_" + params.type + ".png",
        title: params.name
    });
    if (params.content !== null && typeof params.content !== "undefined" && params.content !== "") {
        var imgDiv = "";
        if (params.img !== null && typeof params.img !== "undefined") {
            imgDiv = "<div><img class=info-window-img src='img/" + params.img + "' /></div>";
        }
        var infoWindow = new google.maps.InfoWindow({
            content: "<div class=info-window-wrapper><h3>" + params.name + "</h3><div>" + params.content
                + "</div>" + imgDiv + "</div>"
        });
        google.maps.event.addListener(infoWindow, "closeclick", function (e) {
            infoWindow.setOpenedState(false);
        });
        marker.addListener('click', function() {
            infoWindow.toggle(map, marker);
        });
    }
    return marker;
}

function initMap() {
    var options = {
        zoom: 7,
        restriction: {
            latLngBounds: UK_BOUNDS,
            strictBounds: false,
        },
        center: SCOTLAND_COORDS,
        styles: MAP_STYLE
    };
    map = new google.maps.Map(document.getElementById('map'), options);
    setUpInfoWindowToggle();
    loadJSON('map_data.json', addAllMarkers);
}
