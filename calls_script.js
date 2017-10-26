$(document).ready(function() {

	// Initialize Firebase
	var config = {
		apiKey: "AIzaSyBwsn2sANIn-bow0TfgUEPKfTI9nv1rkmw",
		authDomain: "affordable-housing-22a06.firebaseapp.com",
		databaseURL: "https://affordable-housing-22a06.firebaseio.com",
		projectId: "affordable-housing-22a06",
		storageBucket: "",
		messagingSenderId: "240280648373"
	};

	firebase.initializeApp(config);

	var ref = firebase.database().ref("data");

	ref.once("value", function(data) {
		console.log("the fuck is going on...");
		console.log(data);
		console.log(data.val());
	});

});