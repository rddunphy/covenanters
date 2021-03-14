function getEntryData() {
	var data = {
		name: document.getElementById("name").value,
		type: document.getElementById("type").value,
		lat: parseFloat(document.getElementById("lat").value),
		lng: parseFloat(document.getElementById("lng").value),
		content: tinymce.get("content").getContent()
	};
	return data;
}

function submitSuccess(newId) {
	console.log("Document with ID ", newId, " updated");
	document.getElementById("submit").innerHTML = "Save";
	id = newId;
	saveState = getEntryData();
	checkUnsavedChanges();
}

function submitError(error) {
	console.error("Error adding document to Firestore: ", error);
	document.getElementById("submit").innerHTML = "Save";
	document.getElementById("feedback").hidden = false;
	document.getElementById("feedback").innerHTML = "Error while uploading entry to database:<br>" + error;
	document.getElementById("submit").disabled = false;
}

function submitEntry() {
	document.getElementById("submit").disabled = true;
	document.getElementById("submit").innerHTML = "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span>";
	data = getEntryData();
	if (id) {
		// Update entry
		data.updated = firebase.firestore.FieldValue.serverTimestamp();
		data.updatedBy = userName;
		db.collection("map_entries").doc(id).update(data)
			.then(() => {
				submitSuccess(id);
			})
			.catch((error) => {
				submitError(error);
			});
	} else {
		// Create new entry
		data.updated = firebase.firestore.FieldValue.serverTimestamp();
		data.created = firebase.firestore.FieldValue.serverTimestamp();
		data.updatedBy = userName;
		data.createdBy = userName;
		db.collection("map_entries").add(data)
			.then((docRef) => {
				submitSuccess(docRef.id);
			})
			.catch((error) => {
				submitError(error);
			});
	}
}

function populateData(data) {
	document.getElementById("name").value = data.name;
	document.getElementById("lat").value = data.lat;
	document.getElementById("lng").value = data.lng;
	document.getElementById("type").value = data.type;
	tinymce.get("content").setContent(data.content);
	updateMarker();
}

function handleMapClick(e) {
	var coord = e.latlng;
	var lat = coord.lat;
	var lng = coord.lng;
	document.getElementById("lat").value = lat;
	document.getElementById("lng").value = lng;
	updateMarker();
}

function updateMarker() {
	if (marker) {
		map.removeLayer(marker);
	}
	var data = getEntryData();
	if (data.lat && data.lng) {
		var icon = L.icon({
			iconUrl: "icons/pin_" + data.type + ".svg",
			shadowUrl: "icons/shadow.svg",
			iconSize:     [36, 49],
			shadowSize:   [55, 49],
			iconAnchor:   [18.5, 49],
			shadowAnchor: [18.5, 49],
			popupAnchor:  [0, -49]
		});
		marker = L.marker([data.lat, data.lng], {icon: icon}).addTo(map);
		markerPopupUpdate(data.name, data.content);
	} else {
		checkUnsavedChanges();
	}
}

function markerPopupUpdate(title, body) {
	if (marker) {
		if (!title) {
			title = "<span style=\"color:grey\">[Name]</span>";
		}
		var content = "<div class=\"info-window-wrapper\"><h1>" + title + "</h1><div>" + body
			+ "</div></div>";
		marker.bindPopup(content);
		marker.openPopup();
	}
	checkUnsavedChanges();
}

function hasUnsavedChanges() {
	if (!saveState) {
		return false;
	}
	var data = getEntryData();
	if (Object.is(data.lat, saveState.lat) && Object.is(data.lng, saveState.lng) && 
		Object.is(data.name, saveState.name) && Object.is(data.type, saveState.type) &&
		Object.is(data.content, saveState.content)) {
		return false;
	}
	return true;
}

function checkUnsavedChanges() {
	if (hasUnsavedChanges()) {
		document.getElementById("submit").disabled = false;
	} else {
		document.getElementById("submit").disabled = true;
	}
}

const db = firebase.firestore();
var id = new URLSearchParams(window.location.search).get("id");
var map;
var marker;
var saveState;

window.onload = function() {
	window.addEventListener("beforeunload", function (e) {
		if (!hasUnsavedChanges()) {
			return undefined;
		}
		var msg = "If you leave before saving, any changes will be lost. Leave page anyway?";
		(e || window.event).returnValue = msg; //Gecko + IE
		return msg; //Gecko + Webkit, Safari, Chrome etc.
	});
	initSigninStatus(true, true);
	document.getElementById("submit").disabled = true;
	tinymce.init({
		selector: "#content",
		resize: false,
		plugins: "link lists image",
		toolbar: "undo redo | styleselect | bold italic underline strikethrough superscript subscript | bullist numlist | link image ",
		image_dimensions: false,
		content_css: "css/tinymce_style.css",
		style_formats: [
			{title: "Heading", format: "h2"},
			{title: "Subheading", format: "h3"},
			{title: "Paragraph", format: "p"},
			{title: "Blockquote", format: "blockquote"}
		],
		menubar: "",
		init_instance_callback: function(editor) {
			editor.on("NodeChange", function(e) {
				markerPopupUpdate(document.getElementById("name").value, tinymce.get("content").getContent());
			});
		}
	});
	map = L.map('map').setView([57.1, -4.8], 6);
	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}', {foo: 'bar', attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
	map.on("click", handleMapClick);
	if (id) {
		document.getElementById("title").innerHTML = "Edit entry";
		var entry = db.collection("map_entries").doc(id).get()
		.then((doc) => {
			if (doc.exists) {
				populateData(doc.data());
				saveState = getEntryData();
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
	} else {
		saveState = getEntryData();
	}
	document.getElementById("name").addEventListener("input", (e) => {
		markerPopupUpdate(document.getElementById("name").value, tinymce.get("content").getContent());
	});
	document.getElementById("lat").addEventListener("change", updateMarker);
	document.getElementById("lng").addEventListener("change", updateMarker);
	document.getElementById("type").addEventListener("change", updateMarker);
}
