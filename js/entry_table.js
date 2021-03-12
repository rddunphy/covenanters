var deleteButton = function(cell, formatterParams) {
    return "<i class=\"fas fa-trash-alt\"></i>";
};

var editButton = function(cell, formatterParams) {
    return "<i class=\"fas fa-edit\"></i>";
};

const typeColours = {
	church: "#ffd42a",
	museum: "#5fd35f",
	grave: "#c8b7b7",
	monument: "#f58dd3",
	battle: "#c83737",
	castle: "#ff7f2a"
};

const typeStrings = {
	church: "Church",
	museum: "Museum",
	castle: "Castle",
	battle: "Battlefield",
	monument: "Monument",
	grave: "Gravesite"
};

var locationType = function(cell, formatterParams) {
	var val = cell.getValue();
	cell.getElement().style.backgroundColor = typeColours[val];
	return typeStrings[val];
};

function deleteEntry(row) {
	var entry = row.getData();
	var del = confirm("Are you sure you want to permanently delete the entry for \"" + entry.name + "\"?");
	if (del) {
		document.getElementById("feedback").hidden = false;
		document.getElementById("feedback").innerHTML = "Deleting entry \"" + entry.name + "\"...";
		db.collection("map_entries").doc(entry.id).delete().then(() => {
			row.delete();
			document.getElementById("feedback").innerHTML = "Entry \"" + entry.name + "\" successfully deleted.";
		}).catch((error) => {
			console.error("Error removing Firestore document: ", error);
			document.getElementById("feedback").innerHTML = "Error deleting entry \"" + entry.name + "\": " + error;
		});
	}
}

function editEntry(row) {
	window.location = "data_entry.html?id=" + row.getData().id;
}

function generateTable(data) {
	var table = new Tabulator("#entry_table", {
		data: tabledata,
		columns: [
			{formatter: deleteButton, hozAlign:"center", cellClick: function(e, cell){
				deleteEntry(cell.getRow());
			}}, //width: 40, 
			{formatter: editButton, hozAlign:"center", cellClick: function(e, cell){
				editEntry(cell.getRow());
			}}, //width: 40, 
			{title: "Name", field: "name"},
			{title: "Last update", field: "timestamp", formatter: "datetime", formatterParams: {
				inputFormat: "X",
				outputFormat: "DD/MM/YY HH:mm:ss",
				invalidPlaceholder: "NaN",
			}},
			{title: "Type", field: "type", formatter: locationType},
			{title: "Latitude", field: "lat", sorter:"number"},
			{title: "Longitude", field: "lng", sorter:"number"},
			{title: "Description", field: "content"}
		],
		layout: "fitDataStretch",
		pagination: "local",
		paginationSize: "25",
		paginationSizeSelector: [10, 25, 50, 100],
		history: true,
		tooltips: true
	});
}

const db = firebase.firestore();
const tabledata = [];

window.onload = function() {
	db.collection("map_entries").get().then((querySnapshot) => {
		querySnapshot.forEach((doc) => {
			entry = doc.data();
			entry.id = doc.id;
			if (doc.data().updated) {
				entry.timestamp = doc.data().updated.seconds;
			}
			tabledata.push(entry);
		});
		generateTable(tabledata);
	});
}
