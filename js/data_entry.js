function getEntryData() {
	var data = {
		name: document.getElementById("name").value,
		type: document.getElementById("type").value,
		lat: document.getElementById("lat").value,
		lng: document.getElementById("lng").value,
		content: document.getElementById("content").value
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
}

const id = new URLSearchParams(window.location.search).get("id");
const db = firebase.firestore();

window.onload = function() {
	if (id) {
		document.getElementById("submit").disabled = true;
		document.getElementById("title").innerHTML = "Covenanters map - edit entry";
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
}
