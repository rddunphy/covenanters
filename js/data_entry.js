function getEntryData() {
	var data = {
		name: document.getElementById("name").value,
		type: document.getElementById("type").value,
		lat: parseFloat(document.getElementById("lat").value),
		lng: parseFloat(document.getElementById("lng").value),
		content: document.getElementById("content").value,
		updated: firebase.firestore.FieldValue.serverTimestamp()
	};
	return data;
}

function submitEntry() {
	document.getElementById("submit").disabled = true;
	document.getElementById("feedback").hidden = false;
	document.getElementById("feedback").innerHTML = "Submitting new entry...";
	data = getEntryData();
	if (id) {
		db.collection("map_entries").doc(id).set(data)
		.then(() => {
			console.log("Document with ID ", id, " updated");
			document.getElementById("feedback").innerHTML = "Entry updated in database.<br>Returning to overview...";
			returnToOverviewAfter(1000);
		})
		.catch((error) => {
			console.error("Error adding document to Firestore: ", error);
			document.getElementById("feedback").innerHTML = "Error while uploading entry to database:<br>" + error;
			document.getElementById("submit").disabled = false;
		});
	} else {
		db.collection("map_entries").add(data)
		.then((docRef) => {
			console.log("Document written with ID ", docRef.id);
			document.getElementById("feedback").innerHTML = "New entry uploaded to database.<br>Returning to overview...";
			returnToOverviewAfter(1000);
		})
		.catch((error) => {
			console.error("Error adding document to Firestore: ", error);
			document.getElementById("feedback").innerHTML = "Error while uploading entry to database:<br>" + error;
			document.getElementById("submit").disabled = false;
		});
	}
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function returnToOverviewAfter(ms) {
	await sleep(ms);
	returnToOverview();
}

function returnToOverview() {
	window.location = "data_overview.html";
}

function populateData(data) {
	document.getElementById("name").value = data.name;
	document.getElementById("lat").value = data.lat;
	document.getElementById("lng").value = data.lng;
	document.getElementById("type").value = data.type;
	document.getElementById("content").value = data.content;
	updateMarker();
}

function bindDataListeners() {
	document.getElementById("name").addEventListener("change", updateMarker);
	document.getElementById("lat").addEventListener("change", updateMarker);
	document.getElementById("lng").addEventListener("change", updateMarker);
	document.getElementById("type").addEventListener("change", updateMarker);
	document.getElementById("content").addEventListener("change", updateMarker);
}

function handleMapClick(e) {
	var coord = e.latlng;
	var lat = coord.lat;
	var lng = coord.lng;
	document.getElementById("lat").value = lat;
	document.getElementById("lng").value = lng;
	if (marker) {
		map.removeLayer(marker);
	}
	marker = L.marker([lat, lng]).addTo(map);
}

function updateMarker() {
	var data = getEntryData();
	if (data.lat && data.lng) {
		if (marker) {
			map.removeLayer(marker);
		}
		var icon = L.icon({
			iconUrl: "icons/pin_" + data.type + ".png",
			shadowUrl: "icons/shadow.png",
			iconSize:     [36, 49], // size of the icon
			shadowSize:   [55, 49], // size of the shadow
			iconAnchor:   [18.5, 49], // point of the icon which will correspond to marker's location
			shadowAnchor: [18.5, 49],  // the same for the shadow
			popupAnchor:  [0, -49] // point from which the popup should open relative to the iconAnchor
		});
		marker = L.marker([data.lat, data.lng], {icon: icon}).addTo(map);
		var content = "<div class=\"info-window-wrapper\"><h3>" + data.name + "</h3><div>" + data.content
			+ "</div></div>";
		marker.bindPopup(content);
		marker.openPopup();
	}
}

const id = new URLSearchParams(window.location.search).get("id");
const db = firebase.firestore();
var map;
var marker;

window.onload = function() {
	map = L.map('map').setView([56.0, -4.0], 8);
	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}', {foo: 'bar', attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
	map.on("click", handleMapClick);
	if (id) {
		document.getElementById("submit").disabled = true;
		document.getElementById("title").innerHTML = "Edit entry";
		var entry = db.collection("map_entries").doc(id).get()
		.then((doc) => {
			if (doc.exists) {
				populateData(doc.data());
				document.getElementById("submit").disabled = false;
			} else {
				document.getElementById("feedback").hidden = false;
				document.getElementById("feedback").innerHTML = "No entry with id " + id + ".";
			}
		})
		.catch((error) => {
			console.error("Error loading document from Firestore: ", error);
			document.getElementById("feedback").hidden = false;
			document.getElementById("feedback").innerHTML = "Error while fetching entry from database:<br>" + error;
		});
	}
	bindDataListeners();
}
