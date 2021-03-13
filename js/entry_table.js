var deleteButton = function(cell, formatterParams) {
    return "<i class=\"fas fa-trash-alt\"></i>";
};

var editButton = function(cell, formatterParams) {
    return "<i class=\"fas fa-edit\"></i>";
};

var mapButton = function(cell, formatterParams) {
	return "<i class=\"fas fa-map-marked-alt\"></i>";
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

function goToMap(row) {
	window.location = "index.html?lat=" + row.getData().lat + "&lng=" + row.getData().lng;
}

function generateTable(data) {
	var table = new Tabulator("#entry_table", {
		data: tabledata,
		columns: [
			{formatter: deleteButton, hozAlign:"center", download: false, width: 40, headerSort: false, cellClick: function(e, cell){
				deleteEntry(cell.getRow());
			}},
			{formatter: editButton, hozAlign:"center", download: false, width: 40, headerSort: false, cellClick: function(e, cell){
				editEntry(cell.getRow());
			}},
			{formatter: mapButton, hozAlign:"center", download: false, width: 40, headerSort: false, cellClick: function(e, cell){
				goToMap(cell.getRow());
			}},
			{title: "Name", field: "name"},
			{title: "Last update", field: "timestamp", download: false, formatter: "datetime", formatterParams: {
				inputFormat: "X",
				outputFormat: "DD/MM/YY HH:mm:ss",
				invalidPlaceholder: "NaN"
			}},
			{title: "Type", field: "type", formatter: locationType},
			{title: "Latitude", field: "lat", sorter: "number", formatter: "money", formatterParams: {
				precision: 5, symbol: "&deg;", symbolAfter: true, thousand: ""
			}},
			{title: "Longitude", field: "lng", sorter: "number", formatter: "money", formatterParams: {
				precision: 5, symbol: "&deg;", symbolAfter: true, thousand: ""
			}},
			{title: "Description", field: "content"}
		],
		layout: "fitDataStretch",
		pagination: "local",
		paginationSize: "25",
		paginationSizeSelector: [10, 25, 50, 100],
		history: true,
		tooltips: true
	});
	return table;
}

function downloadData() {
	table.download("csv", "covenanters_data.csv");
}

const db = firebase.firestore();
const tabledata = [];
var table;

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
		table = generateTable(tabledata);
	});
}
