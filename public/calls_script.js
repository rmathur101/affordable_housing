$(document).ready(function() {

	var IPDATA;

	function logData(desc, extraData){
	    $.ajax({
	        type: 'POST',
	        url: "/log_data_beta",
	        data: {"data": {
	            "IPDATA": IPDATA,
	            "DESC": desc
	        }},
	        success: function(data) {
	        },
	        error: function() {
	        }
	    });
	}

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

	// ref.once("value", function(data) {
	// 	// console.log(data.val());
	// 	var results = data.val();
	// 	for (r in results) {
	// 		var result = results[r];
	// 		$("tbody").append(
	// 			`<tr>
	// 				<td>${r}</td>
	// 				<td>${result.calls}</td>
	// 				<td>${result.hasIR}</td>
	// 				<td>${result.numIR}</td>
	// 			</tr>
	// 			`
	// 		);
	// 	}
	// 	$(".table > tbody > tr > td").css("border", "1px solid black");
	// });

	var runNow = false;
	setTimeout(function() {
		// ref.child("test4").set({x: 1, y: 2});
		runNow = true;
	}, 10000);

	ref.on("child_changed", function(data) {
		var result = data.val();
		var key = data.key;

		var td = $("td:contains('"+key+"')");
		var tr = td.closest("tr");
		$(tr).html(
			`
			<td>${key}</td>
			<td>${result.calls}</td>
			<td>${result.hasIR}</td>
			<td>${result.numIR}</td>
			`
		);

		$(tr).animate({backgroundColor: '#5cb85c'}, '100');
		$(tr).animate({color: 'white'}, '100');
		// $(tr).css("background-color", "green");
		$(".table > tbody > tr > td").css("border", "1px solid black");
		console.log("this should be child changed");
		console.log(result);
		console.log("this is key i hope...");
		console.log(data.key);

	}, function(error) {console.log(error)});

	// var childAddedRun = false;
	ref.on("child_added", function(data) {
		console.log("child added run first time");
		// childAddedRun = true;
		var result = data.val();
		var key = data.key;
		$("tbody").append(
			`<tr>
				<td>${key}</td>
				<td>${result.calls}</td>
				<td>${result.hasIR}</td>
				<td>${result.numIR}</td>
			</tr>
			`
		);
		$(".table > tbody > tr > td").css("border", "1px solid black");
		if (runNow) {
			var tr = $("tr").last();
			$(tr).animate({backgroundColor: '#5cb85c'}, '100');
			$(tr).animate({color: 'white'}, '100');
		}
	});

    $.ajax({
        type: "GET",
        url:"http://ip-api.com/json",
        // crossDomain: true,
        // dataType: "jsonp",
        success: function(data) {
            // console.log("something");
            IPDATA = data;
            console.log(data);
            logData("PAGE VISIT TEST CALLS");
        }, error: function() {}
    });

	$("#test-call").click(function() {

        logData("TEST CALL");

		var one = $("#first").val();
		var second = $("#second").val();
		var third = $("#third").val();

		if (one && second && third) {
			var number = "+1" + one + second + third;

			$("#test-call").toggle(false);
			$("#loader").toggle(true);

			$.ajax({
				type: "POST",
				url: "/test_calls_make_call",
				data: {
					"number": number
				},
				success: function(data) {
					console.log("success from test_call");
					console.log(data);
					setTimeout(function() {
						$("#loader").toggle(false);
						$("#test-call").toggle(true);
					}, 5000)
				},
				error: function(data) {
					// $("#test-call").toggle(true);
					setTimeout(function() {
						$("#loader").toggle(false);
						$("#test-call").toggle(true);
					}, 5000)
				}
			});
		}
	});

});

