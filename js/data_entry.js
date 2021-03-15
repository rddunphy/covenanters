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

function validateInput(data) {
	if (!data.name || data.name == "") {
		return false;
	}
	if (isNaN(data.lat)) {
		return false;
	}
	if (isNaN(data.lng)) {
		return false;
	}
	return true;
}

function submitEntry() {
	data = getEntryData();
	if (!validateInput(data)) {
		return;
	}
	document.getElementById("submit").disabled = true;
	document.getElementById("submit").innerHTML = "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span>";
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
			title = "<span class=\"placeholder\">[Name]</span>";
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

var crossRefEntries = [];
var crossRefDialog = {
	title: "Insert cross-reference",
	body: {
		type: "panel", // The root body type - a Panel or TabPanel
		items: [ // A list of panel components
			{
				type: "selectbox",
				name: "entry",
				label: "Choose a location: ",
				items: crossRefEntries
			}
		]
	},
	buttons: [ // A list of footer buttons
	{
      type: "cancel",
      name: "closeButton",
      text: "Cancel"
    },
    {
      type: "submit",
      name: "submitButton",
      text: "Save",
      primary: true
    }
	],
	onSubmit: function(dialogApi) {
		var data = dialogApi.getData();
		var id = data.entry;
		var name = crossRefEntries.find((obj) => {return obj.value == id}).text;
		tinymce.activeEditor.execCommand('mceInsertContent', false, 
			"<a href=\"#?id=" + id + "\"><i class=\"fas fa-map-marker-alt\">&nbsp;</i>" + name + "</a>");

		dialogApi.close();
	}
};

const db = firebase.firestore();
var id = new URLSearchParams(window.location.search).get("id");
var map;
var marker;
var saveState;

window.onload = function() {
	initSigninStatus(true, true);
	document.getElementById("submit").disabled = true;
	tinymce.init({
		selector: "#content",
		resize: false,
		plugins: "link lists image",
		toolbar: "undo redo | styleselect | bold italic underline strikethrough superscript subscript | bullist numlist | link image crossref",
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
		},
		setup: function(editor) {
			editor.ui.registry.addIcon("marker", "<svg height=\"24\" width=\"24\"><path d=\"M 11.152141,22.556128 C 4.9088688,13.505235 3.750002,12.576337 3.750002,9.2499978 3.750002,4.6936357 7.4436378,0.99999994 12,0.99999994 c 4.556362,0 8.249998,3.69363576 8.249998,8.24999786 0,3.3263392 -1.158867,4.2552372 -7.402139,13.3061302 -0.409707,0.591851 -1.286054,0.591808 -1.695718,0 z M 12,12.687497 c 1.898487,0 3.437499,-1.539012 3.437499,-3.4374992 0,-1.8984878 -1.539012,-3.4374992 -3.437499,-3.4374992 -1.898488,0 -3.4374993,1.5390114 -3.4374993,3.4374992 0,1.8984872 1.5390113,3.4374992 3.4374993,3.4374992 z\" /></svg>");
			editor.ui.registry.addButton("crossref", {
				icon: "marker",
				tooltip: "Insert cross-reference",
				onAction: function (_) {
					editor.windowManager.open(crossRefDialog);
				}
			});
		}
	});
	map = L.map('map').setView([56.49, -4.2], 6);
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
	window.addEventListener("beforeunload", (e) => {
		if (!hasUnsavedChanges()) {
			return undefined;
		}
		var msg = "If you leave before saving, any changes will be lost. Leave page anyway?";
		(e || window.event).returnValue = msg; //Gecko + IE
		return msg; //Gecko + Webkit, Safari, Chrome etc.
	});
	document.getElementById("form").addEventListener("submit", (e) => {
		e.preventDefault();
		submitEntry();
		return false;
	});
	db.collection("map_entries").get().then((querySnapshot) => {
		querySnapshot.forEach((doc) => {
			entry = doc.data();
			crossRefEntries.push({value: doc.id, text: entry.name});
		});
	});
}
