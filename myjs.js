$(document).ready(function() {

    window.loginPass = null;

    var IPDATA = null;

    function logData(data_to_log) {
        $.ajax({
            type: 'POST',
            url: "/log_data",
            data: {"data": {
                "action": data_to_log,
                "district": $("#select-district").val(),
                "datepicker1": $("#datepicker1").val(),
                "datepicker2": $("#datepicker2").val(),
                "income": $("#household-yearly-income").val(),
                "IPDATA": IPDATA,
                "loginPass": window.loginPass
            }},
            success: function(data) {
            },
            error: function() {
            }
        });
    }

    $.ajax({
        type: "GET",
        url:"https://freegeoip.net/json/?callback",
        success: function(data) {
            IPDATA = data;
            logData("IP DATA ONLY");
    }, error: function() {}
    });

    // axios.get("https://freegeoip.net/json/?callback")
    //     .then(function(data) {
    //         IPDATA = data;
    //         logData("IP DATA");
    //     })
    //     .catch(function(error) {
    //     });



    $('[data-toggle="tooltip"]').tooltip({
        // tooltipClass: "below"
    });

    $("#submit-login").click(function() {
        window.loginPass =$("#pass-input").val();
		$.ajax({
			type: 'POST',
			url: "/login",
			data: {"pass": $("#pass-input").val()},
            success: function(data) {
                // console.log("login success");
                $("#main-app").toggle(true);
                $("#login").toggle(false);
                // $("body").html(data.content)
                initMain();
            },
            error: function() {
                // console.log("login error");
            }
        });
    })

    // TODO: for testing, remove when finished
    // $("#pass-input").val("HOUSING");
    // $("#submit-login").click();

     //set up some minimal options for the feedback_me plugin
    var fm_options = {
        show_email: true,
        show_name: false,
        // email_required: true,
        position: "right-top",

        // name_placeholder: "Name please",
        email_placeholder: "Email goes here (optional)",
        message_placeholder: "Go ahead, type your feedback here...",

        name_required: false,
        message_required: true,

        message_label: "Questions, comments, suggestions?",
        // name_label: "Name",
        // email_label: "Email",

        show_asterisk_for_required: true,

        feedback_url: "send_feedback",

        // custom_params: {
        //     csrf: "my_secret_token",
        //     user_id: "john_doe",
        //     feedback_type: "clean_complex"
        // },
        delayed_options: {
            delay_success_milliseconds: 3500,
            send_success : "Sent successfully :)"
        }
    };

    //init feedback_me plugin
    fm.init(fm_options);

    $(".feedback_trigger").css("color", "white");
    $(".feedback_trigger").css("background", "green");
    $(".feedback_trigger").css("height", "105px");
    $(".feedback_content").css("border", "2px solid black");
    $(".feedback_submit").css("background", "green");

    toggleLoadOff();

   // Load the Visualization API and the corechart package.
   google.charts.load('current', {'packages':['corechart', "table"]});

   var markers = null;
   var currentData = [];
   mymap = null;
   var data = null;

   function initMain() {
       $("#datepicker1").datepicker(
           {
               defaultDate: $.datepicker.formatDate("MM dd, yy", new Date())
           }
       );
       $("#datepicker1").val($.datepicker.formatDate("m/dd/yy", new Date()));
       var datepicker2Default = $.datepicker.formatDate("m/dd/yy", new Date("2100-01-01"));
       $("#datepicker2").datepicker(
           {
               defaultDate: datepicker2Default
           }
       );
       $("#datepicker2").val(datepicker2Default);

       mymap = L.map('mapid').setView([30.310768, -97.674724], 11);
       L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
           attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
           maxZoom: 18,
           id: 'mapbox.streets',
           accessToken: 'pk.eyJ1Ijoicm1hdGh1cjEwMSIsImEiOiJjajg3a3I0cjIwb2lqMndtdGVtaWx1ZjZrIn0.iEel0XmzyrU4fz78lEQ3GQ'
       }).addTo(mymap);

       // house icon
       L.AwesomeMarkers.Icon.prototype.options.prefix = 'ion';

       data = JSON.parse(jsonAHIObject);

       markers = renderMarkers(data, mymap)

       $("#search-matching-properties").click(function() {
           redoRender();
           logData("Search Matching Properties");
       });
   }

    function redoRender() {
        // console.log("district");
        var district = $("#select-district").val();
        // console.log(this.value);
        removeMarkers(markers, mymap);

        function getFilter(value) {
            return function(item) {
                if (item["Council District"] == parseInt(value)) {
                    return true;
                } else {
                    return false;
                }
            }
        }

        if (district == "ALL") {
            markers = renderMarkers(data, mymap)
        } else {
            markers = renderMarkers(data, mymap, getFilter(district));
        }
    }

    function filterFunction(data, func) {
        var newData = [];
        for (d in data) {
        var dd = data[d];
        if (dd.Location && dd.Location.length > 0) {
            if (func(dd)) {
                newData.push(dd);
            }
        }
        }

        return newData;
    }

    function markerOnClick() {
        this.unbindPopup();

        var id = this.markerID;
        var marker = currentData[id];
        var div = "";

        var color = "green";

        if (marker["Project Name"]) {
            div += '<div><b style="color: '+color+';">Project Name: </b>' + marker["Project Name"] + '</div>'
        }
        if (marker["Address"] && marker["Zip Code"]) {
            div += '<div><b style="color: '+color+';">Address: </b>' + marker["Address"] + 'Austin, TX' + marker["Zip Code"] + '</div>'
        }
        if (marker["Owner"]) {
            div += '<div><b style="color: '+color+';">Owner: </b>'+marker["Owner"]+'</div>'
        }
        if (marker["Developer"]) {
            div += '<div><b style="color: '+color+';">Developer: </b>'+ marker["Developer"]+'</div>'
        }
        if (marker["Status"]) {
            div += '<div><b style="color: '+color+';">Status: </b>'+marker["Status"]+'</div>'
        }
        if (marker["Housing Type"]) {
            div += '<div><b style="color: '+color+';">Housing Type: </b>'+marker["Housing Type"]+'</div>'
        }
        if (marker["Unit Type"]) {
            div += '<div><b style="color: '+color+';">Unit Type: </b>'+marker["Unit Type"]+'</div>'
        }
        if (marker["Distance to Bus Stop"]) {
            div += '<div><b style="color: '+color+';">Distance to Bus Stop:</b> '+marker["Distance to Bus Stop"]+'</div>'
        }
        if (marker["Affordability Expiration Date"]) {
            div += '<div><b style="color: '+color+';">Affordability Expiration Date: </b>'+marker["Affordability Expiration Date"]+'</div>'
        }
        if (marker["City Funded Amount"]) {
            div += '<div><b style="color: '+color+';">City Funded Amount: </b>' +marker["City Funded Amount"]+'</div>'
        }

        this.bindPopup(div);
        this.openPopup();
        // $("#marker-info").html(div);
    }

    function sumData(newData, field, processFunc) {
        var num = 0;
        for (n in newData) {
            var dd = newData[n]
                if (!_.isUndefined(dd[field]) && !_.isNull(dd[field])) {
                    var value = dd[field];
                    if (!_.isUndefined(processFunc)) {
                        value = processFunc(value);
                    }
                    num = num + value;
                }
        }
        return num;
    }

    function opportunityScoreAgg(newData) {
        var holder = {}
        for (var n in newData) {
            var x = newData[n];
            if (!_.isUndefined(x["Kirwan Opportunity Index"]) && !_.isNull(x["Kirwan Opportunity Index"]) && x["Kirwan Opportunity Index"].length > 0) {
                if (!_.isUndefined(x["Total Affordable Units"]) && x["Total Affordable Units"] >= 0 && !_.isUndefined(x["Market Rate Units"] && x["Market Rate Units"])) {
                    var index = x["Kirwan Opportunity Index"];

                    if (!(index in holder)) {
                        holder[index] = {
                            "market" : 0,
                            "affordable": 0
                        };
                    }
                    if (index in holder) {
                        holder[index]["market"] = x["Market Rate Units"];
                        holder[index]["affordable"] = x["Total Affordable Units"];
                    }
                }
            }

        }
        return holder;
    }

    function programAgg(newData, func) {
        var holder = {};
        for (var n in newData) {
            var x = newData[n];
            if (!_.isUndefined(x["Program"] && !_.isNull(x["Program"]))) {
                if (!_.isUndefined(x["Total Affordable Units"]) && x["Total Affordable Units"] >= 0) {
                    var program = x["Program"];

                    if (!(program in holder)) {
                        holder[program] = {
                            "affordable": 0,
                            "cityFundedAmount": 0
                        }
                    }

                    if (program in holder) {
                        holder[program]["affordable"] = holder[program]["affordable"] + x["Total Affordable Units"];

                        holder[program]["cityFundedAmount"] = holder[program]["cityFundedAmount"] + func(x["City Funded Amount"]);
                    }
                }

            }
        }
        return holder;
    }

    function developerAgg(allData, func) {
        var holder = {};
        for (var a in allData) {
            var obj = allData[a];
            if (!isUndefinedOrNull(obj["Developer"] && !isUndefinedOrNull(obj["Total Affordable Units"]))) {
                var dev = obj["Developer"];

                if (!(dev in holder)) {
                    holder[dev] = {
                        "affordable": 0,
                        "cityFundedAmount": 0,
                        "RHDA": 0,
                        "AD": 0,
                        "Incentive": 0,
                        "devName": dev,
                        "veryLow": 0,
                        "low": 0,
                        "moderate": 0,
                        "high": 0,
                        "veryHigh": 0,
                        "total": 0
                    }
                }

                if (dev in holder) {
                    holder[dev]["affordable"] = holder[dev]["affordable"] + obj["Total Affordable Units"];

                    if (!isUndefinedOrNull(obj["City Funded Amount"])) {
                        holder[dev]["cityFundedAmount"] = holder[dev]["cityFundedAmount"] + func(obj["City Funded Amount"]);
                    }
                    if (obj["Program"] == "RHDA") {
                        holder[dev]["RHDA"] = holder[dev]["RHDA"] + obj["Total Affordable Units"];
                    }
                    if (obj["Program"] == "A&D") {
                        holder[dev]["AD"] = holder[dev]["AD"] + obj["Total Affordable Units"];
                    }
                    if (obj["Program"] == "Devloper Incentive") {
                        holder[dev]["Incentive"] = holder[dev]["Incentive"] + obj["Total Affordable Units"];
                    }
                    if (obj["Kirwan Opportunity Index"] == "Very Low") {
                        holder[dev]["veryLow"] = holder[dev]["veryLow"] + obj["Total Affordable Units"];
                    }
                    if (obj["Kirwan Opportunity Index"] == "Low") {
                        holder[dev]["low"] = holder[dev]["low"] + obj["Total Affordable Units"];
                    }
                    if (obj["Kirwan Opportunity Index"] == "Moderate") {
                        holder[dev]["moderate"] = holder[dev]["moderate"] + obj["Total Affordable Units"];
                    }
                    if (obj["Kirwan Opportunity Index"] == "High") {
                        holder[dev]["high"] = holder[dev]["high"] + obj["Total Affordable Units"];
                    }
                    if (obj["Kirwan Opportunity Index"] == "Very High") {
                        holder[dev]["veryHigh"] = holder[dev]["veryHigh"] + obj["Total Affordable Units"];
                    }
                    holder[dev]["total"] = holder[dev]["total"] + obj["Total Units"];
                }
            }
        }

        var list = [];
        for (var h in holder) {
            list.push(holder[h])
        }
        var sorted = _.sortBy(list, "affordable");
        return sorted.reverse();
    }

    function toggleLoadOn() {
        $("#data-content").toggle(false);
        $("#loader").toggle(true);
    }

    function toggleLoadOff() {
        setTimeout(function() {
            $("#data-content").toggle(true);
            $("#loader").toggle(false);
        }, 1000);
    }

    function renderMarkers(data, mymap, filter) {
        // console.log("data");
        // console.log(data);

        var convertCityFundedAmountFloat = function(value) {
            var newValue = parseFloat(value.replace("$", ""));
            return newValue;
        }

        var devAggData = developerAgg(data, convertCityFundedAmountFloat);
        // console.log(devAggData);

        // google.charts.setOnLoadCallback(function() {
        //     var data = new google.visualization.DataTable();
        //     data.addColumn("string", "Developer Name");
        //     data.addColumn("number", "City Funded Amount");
        //     for (var d in devAggData) {
        //         var obj = devAggData[d];
        //         // data.addRows([
        //         //     obj.dev,
        //         //     obj.cityFundedAmount
        //         // ])
        //         data.addRow([
        //             "1",
        //             0
        //         ])
        //     }
        //     var table = new google.visualization.Table(document.getElementById("developer_table"));
        //     table.draw(data, {
        //         showRowNumber: true,
        //         width: "300px",
        //         height: "500px"
        //     });
        // });

        // setTimeout(function(){
        //     var data = new google.visualization.DataTable();
        //     data.addColumn("string", "Developer Name");
        //     data.addColumn("number", "City Funded Amount");
        //     for (var d in devAggData) {
        //         var obj = devAggData[d];
        //         // data.addRows([
        //         //     obj.dev,
        //         //     obj.cityFundedAmount
        //         // ])
        //         data.addRow([
        //             "1",
        //             0
        //         ])
        //     }
        //     var table = new google.visualization.Table(document.getElementById("developer_table"));
        //     table.draw(data, {
        //         showRowNumber: true,
        //         width: "300px",
        //         height: "500px"
        //     });
        // }, 5000)

        toggleLoadOn();

        var markers = new L.FeatureGroup();

        if (filter) {
            var newData = filterFunction(data, filter);
        } else {
            var newData = data;
        }

        newData = filterFunction(newData, function(obj) {
            var date1 = new Date($("#datepicker1").val());
            var date2 = new Date($("#datepicker2").val());

            function isBetween(date1, date2, thedate) {
                return ((thedate >= date1) && (thedate <= date2));
            }

            function filterIncomeThreshold(obj) {
                var MFI = 83000;
                var hyi = $("#household-yearly-income").val();
                if (hyi) {
                    var per = parseFloat((hyi / MFI * 100));
                    // console.log(per);
                    // so if it is 40 percent, then i only want to show properties that are less than that, unless it is less than 30, then i want to just show that, but yea if it is like 50, it doesn't make sen to see prpoerties aboue that price, so if the property only has properties at that price then we want to filter those out, so first take that percentage, and check if it is less than any of them, if it is less than 80 and 60, then we want to eliminate 80 and 60 as things that we use to count the number of properties, if it is like 34, then we want to elimnates 40, 50, 60, 80 as ones, etc.
                    var discount = [];

                    if (per < 80) {
                        discount.push(80);
                    }
                    if (per < 60) {
                        discount.push(60);
                    }
                    if (per < 50) {
                        discount.push(50);
                    }
                    if (per < 40) {
                        discount.push(40);
                    }

                    var anyUnits = 0;
                    if (!_.contains(discount, 80)) {
                        anyUnits += obj["Units <= 80% MFI"]
                    }
                    if (!_.contains(discount, 60)) {
                        anyUnits += obj["Units <= 80% MFI"]
                    }
                    if (!_.contains(discount, 60)) {
                        anyUnits += obj["Units <= 60% MFI"]
                    }
                    if (!_.contains(discount, 50)) {
                        anyUnits += obj["Units <= 50% MFI"]
                    }
                    if (!_.contains(discount, 40)) {
                        anyUnits += obj["Units <= 40% MFI"]
                    }
                    if (true) {
                        anyUnits += obj["Units <= 30% MFI"]
                    }

                    if (anyUnits > 0) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return true;
                }
            }

            if (_.isUndefined(obj["Affordability Expiration Date"]) && _.isNull(obj["Affordability Expiration Date"])) {
                return false;
            }

            if (isBetween(date1, date2, new Date(obj["Affordability Expiration Date"])) && filterIncomeThreshold(obj))  {
                return true;
            } else {
                return false;
            }
        });

        currentData = newData;

        var numTotal = 0;
        var numAffordableUnits = sumData(newData, "Total Affordable Units");
        var numMarketRateUnits = sumData(newData, "Market Rate Units");
        var numUnitsLess30 = sumData(newData, "Units <= 30% MFI");
        var numUnitsLess40 = sumData(newData, "Units <= 40% MFI");
        var numUnitsLess50 = sumData(newData, "Units <= 50% MFI");
        var numUnitsLess60 = sumData(newData, "Units <= 60% MFI");
        var numUnitsLess80 = sumData(newData, "Units <= 80% MFI");


        var cityFundedAmount = sumData(newData, "City Funded Amount", convertCityFundedAmountFloat);
        // console.log("city funded amount");
        // console.log(cityFundedAmount);
        $("#city-funded-amount-total").text(cityFundedAmount);

        var oppScoreData = opportunityScoreAgg(newData);
        // console.log(oppScoreData);

        var programAggData = programAgg(newData, convertCityFundedAmountFloat);
        // console.log(programAggData);

        for (var d in newData) {
            var dd = newData[d];

            // console.log(dd);
            if (dd.Location && dd.Location.length > 0) {
                var loc = dd.Location;
                var x = loc.match(/\d*\.\d*/g);

                var marker = L.marker([parseFloat(x[0]), -parseFloat(x[1])], {icon: assignMarker()});

                marker.markerID = d;
                marker.on("click", markerOnClick)

                markers.addLayer(marker);

                numTotal = numTotal + 1;
                // if (!_.isUndefined(dd["Total Affordable Units"]) && dd["Total Affordable Units"] > 0) {
                //     numAffordableUnits = numAffordableUnits + dd["Total Affordable Units"];
                // }
                // if (!_.isUndefined(dd["Market Rate Units"]) && dd["Market Rate Units"] >= 0) {
                //     numMarketRateUnits = numMarketRateUnits + dd["Market Rate Units"];
                // }
                // if (!_.isUndefined(dd["Units <= 30% MFI"]) && dd["Units <= 30% MFI"] >= 0) {
                //     numUnitsLess30 = numUnitsLess30 + dd["Units <= 30% MFI"];
                // }
                // if (!_.isUndefined(dd["Units <= 40% MFI"]) && dd["Units <= 40% MFI"] >= 0) {
                //     numUnitsLess40 = numUnitsLess40 + dd["Units <= 40% MFI"];
                // }
                // if (!_.isUndefined(dd["Units <= 50% MFI"]) && dd["Units <= 50% MFI"] >= 0) {
                //     numUnitsLess50 = numUnitsLess50 + dd["Units <= 50% MFI"];
                // }
                // if (!_.isUndefined(dd["Units <= 60% MFI"]) && dd["Units <= 60% MFI"] >= 0) {
                //     numUnitsLess60 = numUnitsLess60 + dd["Units <= 60% MFI"];
                // }
                // if (!_.isUndefined(dd["Units <= 80% MFI"]) && dd["Units <= 80% MFI"] >= 0) {
                //     numUnitsLess80 = numUnitsLess80 + dd["Units <= 80% MFI"];
                // }
            }
        }
        mymap.addLayer(markers);
        $("#AFI-Total").text(numTotal);
        $("#AFI-Affordable").text(numAffordableUnits);
        $("#AFI-Market-Rate-Units").text(numMarketRateUnits);

        var chartWidth = 550;


        google.charts.setOnLoadCallback(function() {
            var data = new google.visualization.DataTable();
            data.addColumn("string", "Level");
            data.addColumn("number", "Units");
            data.addRows([
                ["<= 30% MFI", numUnitsLess30],
                ["<= 40% MFI", numUnitsLess40],
                ["<= 50% MFI", numUnitsLess50],
                ["<= 60% MFI", numUnitsLess60],
            ]);

            // Set chart options
            var options = {'title':'Affordable Housing By Income Level',
            'width':chartWidth,

            'height':300};

            // Instantiate and draw our chart, passing in some options.
            var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
            chart.draw(data, options);
        });

        google.charts.setOnLoadCallback(function() {
            var data = new google.visualization.DataTable();
            data.addColumn("string", "Level");
            data.addColumn("number", "Units");
            data.addRows([
                ["Very Low", (!isUndefinedOrNull(oppScoreData["Very Low"]) ? oppScoreData["Very Low"].affordable : 0)],
                ["Low", (!isUndefinedOrNull(oppScoreData["Low"]) ? oppScoreData["Low"].affordable : 0)],
                ["Moderate", (!isUndefinedOrNull(oppScoreData["Moderate"]) ? oppScoreData["Moderate"].affordable : 0)],
                ["High", (!isUndefinedOrNull(oppScoreData["High"]) ? oppScoreData["High"].affordable : 0)],
                ["Very High", (!isUndefinedOrNull(oppScoreData["Very High"]) ? oppScoreData["Very High"].affordable : 0)]
                // ["Moderate", oppScoreData["Moderate"].affordable],
                // ["High", oppScoreData["High"].affordable],
                // ["Very High", oppScoreData["Very High"].affordable],
            ]);

            // Set chart options
            var options = {
                'title':'Affordable Housing By Kirwan Opportunity Index',
                'width':chartWidth,
                'height':300,
                colors: ["orange"],
                legend: "right"
            };

            // Instantiate and draw our chart, passing in some options.
            var chart = new google.visualization.ColumnChart(document.getElementById('chart-kirwan'));
            chart.draw(data, options);
        });


        google.charts.setOnLoadCallback(function() {
            var data = new google.visualization.DataTable();
            data.addColumn("string", "Level");
            data.addColumn("number", "Units");
            data.addRows([
                ["RHDA", (!isUndefinedOrNull(programAggData["RHDA"]) ? programAggData["RHDA"].affordable : 0)],
                ["A&D", (!isUndefinedOrNull(programAggData["A&D"]) ? programAggData["A&D"].affordable : 0)],
                ["Developer Incentive", (!isUndefinedOrNull(programAggData["Developer Incentive"]) ? programAggData["Developer Incentive"].affordable : 0)],
                // ["A&D", programAggData["A&D"].affordable],
                // ["Developer Incentive", programAggData["Developer Incentive"].affordable]
            ]);

                // ["Very Low", (!isUndefinedOrNull(oppScoreData["Very Low"]) ? oppScoreData["Very Low"].affordable : 0)],
            // Set chart options
            var options = {
                'title':'Affordable Housing By Program Type',
                'width':chartWidth,
                'height':300,
                colors: ["red"]
            };

            // Instantiate and draw our chart, passing in some options.
            var chart = new google.visualization.ColumnChart(document.getElementById('chart-program'));
            chart.draw(data, options);
        });

        google.charts.setOnLoadCallback(function() {
            var data = new google.visualization.DataTable();
            data.addColumn("string", "Developer Name");
            data.addColumn("number", "City Funded Amount ($)");
            data.addColumn("number", "Affordable Units");
            data.addColumn("number", "Total Units");
            data.addColumn("number", "City Cost Per Unit");
            // data.addColumn("number", "A&D Units");
            // data.addColumn("number", "Developer Incentive Units");
            var matrix = [];
            for (d in devAggData) {
                var obj = devAggData[d];
                var per = 0;
                if (obj.cityFundedAmount > 0 && obj.total > 0) {
                    // console.log(obj.cityFundedAmount);
                    // console.log(obj.affordable);
                    per = parseFloat((obj.cityFundedAmount / obj.total).toFixed(2));
                    // console.log(per);
                }
                matrix.push([obj.devName, obj.cityFundedAmount, obj.affordable, obj.total, per])
            }
            data.addRows(matrix);
            var table = new google.visualization.Table(document.getElementById("developer_table"));
            table.draw(data, {
                showRowNumber: true,
                width: "100%",
                height: "500px"
            });

            var x = $(".google-visualization-table-table > tbody > tr");
            $.each(x, function() {
                var trs = $(this).children("td");
                var cell = trs[trs.length - 1];
                var value = parseFloat($(cell).text());
                if (value > 0) {
                    $(cell).css("background-color", "#5cb85c");
                }
            });
            $("#developer_table").off();
            $("#developer_table").click(function() {
                var x = $(".google-visualization-table-table > tbody > tr");
                $.each(x, function() {
                    var trs = $(this).children("td");
                    var cell = trs[trs.length - 1];
                    var value = parseFloat($(cell).text());
                    if (value > 0) {
                        $(cell).css("background-color", "#5cb85c");
                    }
                });
            })
            // for (y in x) {
            //     var $z = $(x[y]);
            //     var trs = $z.children("td");
            //     var cell = trs[trs.length - 1];
            //     var value = parseFloat($(cell).text());
            //     if (value > 0) {
            //         $(cell).css("background-color", "#5cb85c");
            //     }
            // }
        });

        // function renderIndexScoreHtml(indexName, unitObj) {
        //     return `<div># of <b></b>: ${unitObj.market}</div>`
        // }

        // for (var o in oppScoreData) {
        //     if (o == "Very Low") {
        //         $("#very-low").html(
        //             `<div><b></b></div>`
        //         )
        //     }
        // }

        toggleLoadOff();
        return markers;
    }

    function removeMarkers(group, mymap) {
        mymap.removeLayer(group);
    }

    function assignMarker(district) {
        // if ()
        // if ((district) == 1) {
        //     return awesomeIcon("blue")
        // } else if (district == 2) {
        //     return awesomeIcon("orange")
        // } else if (district == 3) {
        //     return awesomeIcon("green")
        // } else if (district == 4) {
        //     return awesomeIcon("yellow")
        // } else if (district == 5) {
        //     return awesomeIcon("purple")
        // } else if (district == 6) {
        //     return awesomeIcon("pink")
        // } else if (district == 7) {
        //     return awesomeIcon("red")
        // } else if (district == 8) {
        //     return awesomeIcon("teal")
        // } else if (district == 9) {
        //     return awesomeIcon("purple")
        // } else if (district == 10) {
        //     return awesomeIcon("cadetblue")
        // }
        return awesomeIcon()
    }

    function awesomeIcon(color) {
        return L.AwesomeMarkers.icon({ markerColor: "blue"})
    }
})

function isUndefinedOrNull(value) {
    return (_.isUndefined(value) || _.isNull(value));
}
