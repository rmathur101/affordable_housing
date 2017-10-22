//NOTE: THERE IS SOME ISSUE WITH THE RENDERING OF THE THE ICONDS, in the uper right it says the same thing on each; or maybe just there are many by the same owner / developer
// consider something like:
// AFFORDABLE HOUSING
//          AUSTIN
// you should check that the yearly income is fairly granular

var autocomplete;
var geocoder;
var myLatLong = [];
var myMarker;
var circle;
var atLeastOneSearch = false;
var IPDATA;

function logData(desc, extraData){
    $.ajax({
        type: 'POST',
        url: "/log_data_beta",
        data: {"data": {
            "IPDATA": IPDATA,
            "anyHouseType": $("[data-home-type='any']").prop("checked"),
            "singleFamily": $("[data-home-type='single-family']").prop("checked"),
            "multiFamily": $("[data-home-type='multi-family']").prop("checked"),
            "duplex": $("[data-home-type='duplex']").prop("checked"),
            "own": $("[data-ownership='own']").prop("checked"),
            "rent": $("[data-ownership='rent']").prop("checked"),
            "householdIncome": $("#income-slider").val(),
            "address": $("#autocomplete").val(),
            "radius": $("#search-radius").val(),
            "displayRed": $("#display-matches").prop("checked"),
            "extraData": extraData,
            "DESC": desc
        }},
        success: function(data) {
        },
        error: function() {
        }
    });
}

function initAutocomplete() {
    // Create the autocomplete object, restricting the search to geographical
    // location types.

    // console.log(document.getElementById("autocomplete"));
    // autocomplete = new google.maps.places.Autocomplete((document.getElementById('autocomplete')),
    // {types: ['geocode']});

    // new
    var input = document.getElementById("autocomplete");
    var defaultBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(30.160230, -98.052292),
        new google.maps.LatLng(30.160230, -98.052292)
    );
    var autocomplete = new google.maps.places.SearchBox(
        input, {bounds: defaultBounds});

// (30.160230, -98.052292)
// (30.160230, -98.052292)

    geocoder = new google.maps.Geocoder;
    autocomplete.addListener("places_changed", function() {
        myLatLong = [];
        // var place = autocomplete.getPlace();
        var places = autocomplete.getPlaces();
        var place = places[0];

        if (place.place_id) {
            geocoder.geocode({"placeId": place.place_id}, function(results, status) {
                myLatLong = getLatLongFromResults(results);
            });
        }
    })
}

function getLatLongFromResults(results) {
    if (results && results[0] && results[0].geometry && results[0].geometry.location) {
        var lat = results[0].geometry.location.lat();
        var long = results[0].geometry.location.lng();
        if (lat && long) {
            return [lat, long];
        } else {
            return [];
        }
    }
}

// function geolocate() {
//     if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition(function(position) {
//             var geolocation = {
//                 lat: position.coords.latitude,
//                 lng: position.coords.longitude
//             };
//             var circle = new google.maps.Circle({
//                 center: geolocation,
//                 radius: position.coords.accuracy
//             });
//             autocomplete.setBounds(circle.getBounds());
//         });
//     }
// }
//
$(document).ready(function() {


    // css stuff
    $(".slider-handle").css("background-image", "none");
    $(".slider-handle").css("background-color", "#5cb85c");
    $(".slider-handle").css("border", "2px solid white");
    $(".slider-handle").hover(function() {
        $(this).css("cursor", "pointer");
    });

    $(".tooltip-inner").css("background-color", "#5cb85c");
    $(".tooltip-inner").css("border-radius", "0px");
    $(".tooltip-inner").css("font-size", "15px");
    $(".tooltip-inner").css("border", "1px solid white");
    $(".tooltip-arrow").css("border-bottom-color", "white");

    $(".my-close-button").click(function() {
        $(".filter-options").animate({left: '-500px'}, {queue: true, duration: 750});
        $(".filter-options-banner").animate({left: '0px'}, {queue: true, duration: 750});
    });

    $(".filter-options-banner").click(function() {
        $(".filter-options-banner").animate({left: '-500px'}, {queue: true, duration: 750});
        $(".filter-options").animate({left: '0px'}, {queue: true, duration: 750});
    });

    $(".filter-options-banner").hover(function(e) {
        $(this).css("background-color", e.type == "mouseenter" ? "#5cb85c" : "#337ab7");
    });

    $(".clear-autocomplete").click(function() {
        $("#autocomplete").val("");
    });

    if (false) {
        var list = [2, 3, 4, 5, 6, 7];
        $("#chatbot").toggle(true);
        $(".filter-options").toggle(false);
        $(".chatbot-next").click(function() {
            $(".padding-20").toggle(false);
            var num = list.shift();
            if (num == 7) {
                $("#chatbot").toggle(false);
                $(".filter-options").toggle(true);
            } else {
                $("[data-chatbot='"+num+"']").toggle(true);
            }
        });
    }



    showResearch(false);
    readyToSearch(true);

    $('#income-slider').slider(getSliderOptions());

    var map = initMap();
    var titleLayer = initTitleLayer();
    L.control.zoom({
        position: "bottomright"
    }).addTo(map);

    titleLayer.addTo(map);

    var data = JSON.parse(jsonAHIObject);

    var markers = null;
    var currentData = null;

     markers = renderMarkers(data, map);

    $("#search").click(doSearch(data, map, markers));

    $.ajax({
        type: "GET",
        url:"http://ip-api.com/json",
        // crossDomain: true,
        // dataType: "jsonp",
        success: function(data) {
            // console.log("something");
            IPDATA = data;
            console.log(data);
            logData("PAGE VISIT");
        }, error: function() {}
    });
});

function convertMilesToMeters(miles) {
    return miles * 1609.34;
}

function calculateDistanceBetween(latLongA, latLongB) {
    var geometry = google.maps.geometry.spherical;
    var a = new google.maps.LatLng(
        {
            lat: latLongA[0],
            lng: latLongA[1]
        }
    );
    var b = new google.maps.LatLng({lat: latLongB[0], lng: latLongB[1]});
    var d = geometry.computeDistanceBetween(a, b);
    return d;
}

function getAddressRadius() {
    return $("#search-radius").val();
}

function doSearch(data, map, markers) {
    return function() {
        removeMarkers(map, markers);
        var searchOpts = getSearchOptions();
        markers = renderMarkers(data, map, null, searchOpts);

        if (myMarker) {
            map.removeLayer(myMarker);
        }
        if (circle) {
            map.removeLayer(circle);
        }
        if (!isAutoCompleteEmpty() &&  myLatLong.length > 0) {
                myMarker = L.marker(myLatLong, {icon: assignMarker("green")});
                // marker.markerID = ?;
                // markers.on("click", markerOnClick)
                markers.addLayer(myMarker);
                map.addLayer(markers);

                // Add a circle...
                var circleLocation = new L.LatLng(myLatLong[0], myLatLong[1]),

                circleOptions = {
                     color: 'red',
                     fillColor: '#5cb85c',
                     fillOpacity: 0.5,
                     stroke: false
                };
                var r = convertMilesToMeters(getAddressRadius());
                circle = new L.Circle(circleLocation, r, circleOptions);
                map.addLayer(circle);
        }
        logData("SEARCH CLICKED");

        if (!atLeastOneSearch) {
            atLeastOneSearch = true;
            $(".filter-options").animate({left: '-500px'}, {queue: true, duration: 750});
            $(".filter-options-banner").animate({left: '0px'}, {queue: true, duration: 750});
        }
    }
};

function isDisplayMissesChecked() {
    return $("#display-matches").prop("checked");
}

function getSearchOptions() {
    var householdIncome = $("#income-slider").val();
    // var familySize = $("#family-size").val();
    var familySize = 0; // NOT USING FOR NOW
    return {
        familySize: familySize,
        householdIncome: householdIncome
    }
}

function getSliderOptions() {
    return {
            	formatter: function(value) {
                    function numberWithCommas(x) {
                        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    }
            		return  '$' + numberWithCommas(value);
            	}
            }
}

function initMap() {
    mymap = L.map('mapid', {zoomControl: false}).setView([30.290768, -97.674724], 12.5);
    return mymap;
}

// show search green
// show research
function showSearch(val) {
    $("#search").toggle(val);
}

function showResearch(val) {
    $("#research").toggle(val);
}

function readyToSearch(val) {
    if (val) {
        $("#search").addClass("btn-success");
    } else {
        $("#search").removeClass("btn-success");
    }
}

function removeMarkers(map, group) {
    map.removeLayer(group);
}

function initTitleLayer() {
    return L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1Ijoicm1hdGh1cjEwMSIsImEiOiJjajg3a3I0cjIwb2lqMndtdGVtaWx1ZjZrIn0.iEel0XmzyrU4fz78lEQ3GQ'
    });
}

function isAutoCompleteEmpty() {
    if ($("#autocomplete").val().length > 0) {
        return false;
    } else {
        return true;
    }
}

function filterByRadius(obj) {
    if (isAutoCompleteEmpty() || myLatLong.length == 0) {
        return true;
    }

    var loc = obj.Location;
    var x = loc.match(/\d*\.\d*/g);
    var objLat = parseFloat(x[0]);
    var objLong = -parseFloat(x[1]);

    var d = calculateDistanceBetween(myLatLong, [objLat, objLong]);

    var radiusD = convertMilesToMeters(getAddressRadius());

    if (d <= radiusD) {
        return true;
    } else {
        return false;
    }
}

function filterHomeType(obj) {
    var list = [];
    $(".home-type-group").each(function() {
        if ($(this).prop("checked")) {
            list.push($(this).data("homeType"));
        }
    });

    if (_.contains(list, "any")) {
        return true;
    }

    if (_.contains(list, "single-family")) {
        if ($.trim(obj["Unit Type"]) == "Single Family") {
            return true;
        }
    }

    if (_.contains(list, "multi-family")) {
        if ($.trim(obj["Unit Type"]) == "Multifamily") {
            return true;
        }
    }

    if (_.contains(list, "duplex")) {
        if ($.trim(obj["Unit Type"]) == "Duplex") {
            return true;
        }
    }

    return false;
}

function filterHomeOwnership(obj) {
    var list = [];
    $(".ownership").each(function() {
        if ($(this).prop("checked")) {
            list.push($(this).data("ownership"));
        }
    });

    // if (_.contains(list, "any")) {
    //     return true;
    // }

    if (_.contains(list, "own")) {
        if ($.trim(obj["Housing Type"]) == "Ownership") {
            return true;
        }
    }

    if (_.contains(list, "rent")) {
        if ($.trim(obj["Housing Type"]) == "Rental") {
            return true;
        }
    }

    return false;
}

function filterFunction(data, func, options) {
    var newData = [];
    for (d in data) {
        var dd = data[d];
        if (dd.Location && dd.Location.length > 0) {
            // some redundancy here, right now either way it returns we add it to newData, but we change the flag accordingly
            if (func(dd, options)) {
                if (filterIncomeThreshold(dd, options) && filterByRadius(dd) && filterHomeType(dd) && filterHomeOwnership(dd)) {
                    dd.showAsAvailable = true;
                    newData.push(dd);
                } else {
                    dd.showAsAvailable = false;
                    if (isDisplayMissesChecked()) {
                        newData.push(dd);
                    }
                }
            }
        }
    }
    return newData;
}

function renderMarkers(data, mymap, filter, options) {
    // toggleLoadOn();

    var markers = new L.FeatureGroup();

    if (filter) {
        var newData = filterFunction(data, filter);
    } else {
        var newData = data;
    }

    newData = filterFunction(newData, function(obj, options) {
        var date1 = new Date();
        var date2 = new Date("12/31/2099");

        // return false for the obj if there is no expirate date on the data
        if (_.isUndefined(obj["Affordability Expiration Date"]) && _.isNull(obj["Affordability Expiration Date"])) {
            return false;
        }

        function isBetween(date1, date2, thedate) {
            return ((thedate >= date1) && (thedate <= date2));
        }

        // two filters, one verifying that the expiration is between the dates, one that the filter matches the income threshold
        if (isBetween(date1, date2, new Date(obj["Affordability Expiration Date"])))  {
            return true;
        } else {
            return false;
        }
    }, options);

    currentData = newData;

    for (var d in newData) {
        var dd = newData[d];

        // console.log(dd);
        if (dd.Location && dd.Location.length > 0) {
            var loc = dd.Location;
            var x = loc.match(/\d*\.\d*/g);

            if (dd.showAsAvailable == true) {
                var marker = L.marker([parseFloat(x[0]), -parseFloat(x[1])], {icon: assignMarker("blue")});
            } else {
                var marker = L.marker([parseFloat(x[0]), -parseFloat(x[1])], {icon: assignMarker("red")});
            }

            marker.markerID = d;
            marker.on("click", markerOnClick)

            markers.addLayer(marker);

            // numTotal = numTotal + 1;
        }
    }
    mymap.addLayer(markers);

    // toggleLoadOff();
    return markers;
}


function filterIncomeThreshold(obj, options) {
    //TODO: you'll want to rewrite not to get unit data per segment, but rather filter based on whether the property has ANY units that meet the income criteria
    var MFI = 83000;
    // var hyi = $("#household-yearly-income").val();
    // TODO: default value for now
    var hyi = 1000000;


    // 30, 40, 50, 60, 80,

    // var incomeLimits = {
    //     1: {
    //         30: 17100,
    //         40: 22800 ,
    //         50: 28500,
    //         60: ,
    //         80:
    //     }
    // }
    //
    if (options) {
        var hyi = options.householdIncome;
        var familySize = options.familySize;
    }
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

// 30, 40, 50, 60, 80,

        var anyUnits = 0;
        if (!_.contains(discount, 80)) {
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

function assignMarker(color) {
    return L.AwesomeMarkers.icon({ markerColor: color})
    // return awesomeIcon()
}

// function awesomeIcon(color) {
//     return L.AwesomeMarkers.icon({ markerColor: "blue"})
// }

function markerOnClick() {
    this.unbindPopup();

    var id = this.markerID;
    var marker = currentData[id];
    var div = "";

    var color = "white";

    div += '<img style="width: 100px; display: block; margin: auto;" src="house.png"></img>';

    div += '<br/> <div class="listing-details" style="width: 240px;">Project Name: ' + marker["Project Name"] + '<br />Address: ' + marker["Address"] +'<br />Type: ' + marker["Housing Type"] +'<br />Unit: ' + marker["Unit Type"] +'<br />Bus Stop:' + marker["Distance to Bus Stop"] +'</div>';

    div += '<br/><button class="btn search-btn btn-success" style="border: 2px solid black; display: block; margin: auto; width: 240px;">CONTACT</button>'

    // if (marker["Project Name"]) {
    //     div += '<div><b style="color: '+color+';">Project Name: </b>' + marker["Project Name"] + '</div>'
    // }
    // if (marker["Address"] && marker["Zip Code"]) {
    //     div += '<div><b style="color: '+color+';">Address: </b>' + marker["Address"] + 'Austin, TX' + marker["Zip Code"] + '</div>'
    // }
    // if (marker["Owner"]) {
    //     div += '<div><b style="color: '+color+';">Owner: </b>'+marker["Owner"]+'</div>'
    // }
    // if (marker["Developer"]) {
    //     div += '<div><b style="color: '+color+';">Developer: </b>'+ marker["Developer"]+'</div>'
    // }
    // if (marker["Status"]) {
    //     div += '<div><b style="color: '+color+';">Status: </b>'+marker["Status"]+'</div>'
    // }
    // if (marker["Housing Type"]) {
    //     div += '<div><b style="color: '+color+';">Housing Type: </b>'+marker["Housing Type"]+'</div>'
    // }
    // if (marker["Unit Type"]) {
    //     div += '<div><b style="color: '+color+';">Unit Type: </b>'+marker["Unit Type"]+'</div>'
    // }
    // if (marker["Distance to Bus Stop"]) {
    //     div += '<div><b style="color: '+color+';">Distance to Bus Stop:</b> '+marker["Distance to Bus Stop"]+'</div>'
    // }
    // if (marker["Affordability Expiration Date"]) {
    //     div += '<div><b style="color: '+color+';">Affordability Expiration Date: </b>'+marker["Affordability Expiration Date"]+'</div>'
    // }
    // if (marker["City Funded Amount"]) {
    //     div += '<div><b style="color: '+color+';">City Funded Amount: </b>' +marker["City Funded Amount"]+'</div>'
    // }


    this.bindPopup(div);
    this.openPopup();
    $(".leaflet-popup-content-wrapper").addClass("listing");
    $(".leaflet-popup-close-button").css('color', "black");
    // $(".leaflet-popup-content-wrapper").css('width', "305px");
    $(".leaflet-popup-close-button").hover(function(e) {
        $(this).css("color", e.type == "mouseenter" ? "red" : "black");
    });

    logData("MARKER CLICKED", marker);
    // $("#marker-info").html(div);
}
