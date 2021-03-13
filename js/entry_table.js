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

function deleteSelected() {
	var rows = table.getSelectedRows();
	if (rows.length > 0) {
		var msg = "Are you sure you want to permanently delete " + rows.length + " entries?";
		if (rows.length == 1) {
			var name = rows[0].getData().name;
			msg = "Are you sure you want to permanently delete the entry for \"" + name + "\"?";
		}
		if (confirm(msg)) {
			document.getElementById("feedback").hidden = false;
			if (rows.length == 1) {
				document.getElementById("feedback").innerHTML = "Deleting entry...";
			} else {
				document.getElementById("feedback").innerHTML = "Deleting entries...";
			}
			rows.forEach((row) => {
				db.collection("map_entries").doc(row.getData().id).delete().then(() => {
					row.delete();
				}).catch((error) => {
					console.error("Error removing Firestore document: ", error);
				});
			});
			document.getElementById("feedback").hidden = true;
		}
	}
}

function editEntry(row) {
	window.location = "data_entry.html?id=" + row.getData().id;
}

function goToMap(row) {
	window.location = "index.html?lat=" + row.getData().lat + "&lng=" + row.getData().lng;
}

function handleSelectionChange(data, rows) {
	if (rows.length > 0) {
		document.getElementById("delete_button").disabled = false;
	} else {
		document.getElementById("delete_button").disabled = true;
	}
}

function generateTable(data) {
	var table = new Tabulator("#entry_table", {
		data: tabledata,
		columns: [
			{formatter: editButton, hozAlign:"center", download: false, width: 40, headerSort: false, tooltip: "Edit entry", cellClick: function(e, cell){
				editEntry(cell.getRow());
			}},
			{formatter: mapButton, hozAlign:"center", download: false, width: 40, headerSort: false, tooltip: "Show on map", cellClick: function(e, cell){
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
		selectable: true,
		rowSelectionChanged: handleSelectionChange,
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
