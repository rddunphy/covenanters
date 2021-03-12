var deleteButton = function(cell, formatterParams) {
    return "<input type=\"button\" value=\"Delete\">";
};

var editButton = function(cell, formatterParams) {
	return "<input type=\"button\" value=\"Edit\">";
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
			{formatter: deleteButton, align:"center", cellClick: function(e, cell){
				deleteEntry(cell.getRow());
			}}, //width: 40, 
			{formatter: editButton, align:"center", cellClick: function(e, cell){
				editEntry(cell.getRow());
			}}, //width: 40, 
			{title: "Name", field: "name"},
			{title: "Last update", field: "timestamp", formatter: "datetime", formatterParams: {
				inputFormat: "X",
				outputFormat: "DD/MM/YY HH:mm:ss",
				invalidPlaceholder: "NaN",
			}},
			{title: "Location type", field: "type"},
			{title: "Latitude", field: "lat"},
			{title: "Longitude", field: "lng"},
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
