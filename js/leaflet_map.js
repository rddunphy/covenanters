const db = firebase.firestore();
var map;

function addAllMarkers(data) {
    var markers = L.markerClusterGroup();
    for (var i = 0; i < data.length; i++) {
        markers.addLayer(createMarker(data[i]));
    }
	map.addLayer(markers);
}

function createMarker(params) {
	var icon = L.icon({
		iconUrl: "icons/pin_" + params.type + ".png",
		shadowUrl: "icons/shadow.png",
		iconSize:     [36, 49], // size of the icon
		shadowSize:   [55, 49], // size of the shadow
		iconAnchor:   [18.5, 49], // point of the icon which will correspond to marker's location
		shadowAnchor: [18.5, 49],  // the same for the shadow
		popupAnchor:  [0, -49] // point from which the popup should open relative to the iconAnchor
	});
    var marker = L.marker([params.lat, params.lng], {icon: icon});
	var content = "<div class=info-window-wrapper><h3>" + params.name + "</h3><div>" + params.content
		+ "</div></div>";
	marker.bindPopup(content);
	return marker;
}

window.onload = function() {
	map = L.map('map').setView([56.0, -4.0], 8);
	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}', {foo: 'bar', attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
	var markerData = [];
	db.collection("map_entries").get().then((querySnapshot) => {
		querySnapshot.forEach((doc) => {
			markerData.push(doc.data());
		});
		addAllMarkers(markerData);
	});
}

