const initLat = new URLSearchParams(window.location.search).get("lat");
const initLng = new URLSearchParams(window.location.search).get("lng");
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
		iconUrl: "icons/pin_" + params.type + ".svg",
		shadowUrl: "icons/shadow.svg",
		iconSize:     [36, 49], // size of the icon
		shadowSize:   [55, 49], // size of the shadow
		iconAnchor:   [18.5, 49], // point of the icon which will correspond to marker's location
		shadowAnchor: [18.5, 49],  // the same for the shadow
		popupAnchor:  [0, -49] // point from which the popup should open relative to the iconAnchor
	});
    var marker = L.marker([params.lat, params.lng], {icon: icon});
	var content = "<div class=\"info-window-wrapper\"><h1>" + params.name + "</h1><div>" + params.content
		+ "</div></div>";
	marker.bindPopup(content);
	return marker;
}

window.onload = function() {
	initSigninStatus(false, false);
	var lat = 57.1;
	var lng = -4.8;
	var zoom = 7;
	if (initLat && initLng) {
		lat = initLat;
		lng = initLng;
		zoom = 15;
	}
	map = L.map('map').setView([lat, lng], zoom);
	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}', {foo: 'bar', attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
	var markerData = [];
	db.collection("map_entries").get().then((querySnapshot) => {
		querySnapshot.forEach((doc) => {
			markerData.push(doc.data());
		});
		addAllMarkers(markerData);
	});
}

