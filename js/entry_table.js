function generateTable(data) {
	var table = new Tabulator("#entry_table", {
		data: tabledata,
		columns: [
			{title: "Name", field: "name"},
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

var firebaseConfig = {
	apiKey: "AIzaSyCI1aiMpQQaYKrzO4O6JEAYRRkbfkDXW6M",
	authDomain: "covenanters-map.firebaseapp.com",
	projectId: "covenanters-map",
	storageBucket: "covenanters-map.appspot.com",
	messagingSenderId: "105187403918",
	appId: "1:105187403918:web:4564468ce038ff072301df",
	measurementId: "G-MJ0RKJF47X"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

var db = firebase.firestore();
var tabledata = [];
db.collection("map_entries").get().then((querySnapshot) => {
	querySnapshot.forEach((doc) => {
		entry = doc.data();
		entry.id = doc.id;
		tabledata.push(entry);
	});
	generateTable(tabledata);
});
