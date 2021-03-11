var map;

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
}

function addMarker(params) {
	var icon = L.icon({
		iconUrl: "icons/pin_" + params.type + ".png",
		shadowUrl: "icons/shadow.png",
		iconSize:     [36, 49], // size of the icon
		shadowSize:   [55, 49], // size of the shadow
		iconAnchor:   [18, 49], // point of the icon which will correspond to marker's location
		shadowAnchor: [18, 49],  // the same for the shadow
		popupAnchor:  [0, -49] // point from which the popup should open relative to the iconAnchor
	});
    var marker = L.marker([params.lat, params.lng], {icon: icon}).addTo(map);
    if (params.content !== null && typeof params.content !== "undefined" && params.content !== "") {
        var imgDiv = "";
        if (params.img !== null && typeof params.img !== "undefined") {
            imgDiv = "<div><img class=info-window-img src='img/" + params.img + "' /></div>";
        }
        var content = "<div class=info-window-wrapper><h3>" + params.name + "</h3><div>" + params.content
                + "</div>" + imgDiv + "</div>";
        marker.bindPopup(content);
    }
	return marker;
}

window.onload = function() {
	map = L.map('map').setView([56.0, -4.0], 8);
	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}', {foo: 'bar', attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
    loadJSON('map_data.json', addAllMarkers);
}

