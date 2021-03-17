const initLat = new URLSearchParams(window.location.search).get("lat");
const initLng = new URLSearchParams(window.location.search).get("lng");
const initMarker = new URLSearchParams(window.location.search).get("markerId");
const db = firebase.firestore();
const markerIds = [];
var map;

function addAllMarkers(data) {
    var markers = {
		"church": [],
		"castle": [],
		"battle": [],
		"monument": [],
		"museum": [],
		"grave": []
	};
    for (var i = 0; i < data.length; i++) {
        var m = createMarker(data[i]);
		markerIds.push({id: data[i].id, marker: m});
		var t = data[i].type;
        markers[t].push(m);
    }
	var churches = L.layerGroup(markers["church"]);
	var battles = L.layerGroup(markers["battle"]);
	var castles = L.layerGroup(markers["castle"]);
	var monuments = L.layerGroup(markers["monument"]);
	var museums = L.layerGroup(markers["museum"]);
	var graves = L.layerGroup(markers["grave"]);
	map.addLayer(churches);
	map.addLayer(battles);
	map.addLayer(castles);
	map.addLayer(monuments);
	map.addLayer(museums);
	map.addLayer(graves);
	L.control.layers([],{
		"Churches": churches,
		"Battlefields": battles,
		"Castles": castles,
		"Monuments": monuments,
		"Museums": museums,
		"Gravesites": graves
	}).addTo(map);
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

function goToMarker(id) {
	var m = markerIds.find((obj) => {return obj.id == id}).marker;
	var coords = m.getLatLng();
	m.openPopup();
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
			var entry = doc.data();
			entry.id = doc.id;
			markerData.push(entry);
		});
		addAllMarkers(markerData);
		if (initMarker) {
			goToMarker(initMarker);
		}
	});
}

