$(document).ready(function() {
    // ~ globals
    var markers = null;
    var currentData = [];

    var mymap = L.map('mapid').setView([30.310768, -97.674724], 11);
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1Ijoicm1hdGh1cjEwMSIsImEiOiJjajg3a3I0cjIwb2lqMndtdGVtaWx1ZjZrIn0.iEel0XmzyrU4fz78lEQ3GQ'
    }).addTo(mymap);

    // house icon
    L.AwesomeMarkers.Icon.prototype.options.prefix = 'ion';

    var data = JSON.parse(jsonAHIObject);

    // console.log(data);
    markers = renderMarkers(data, mymap)

    $("#select-district").on("change", function() {
        console.log(this.value);
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

        if (this.value == "ALL") {
            markers = renderMarkers(data, mymap)
        } else {
            markers = renderMarkers(data, mymap, getFilter(this.value));
        }

    });

    function filterFunction(data, func) {
    // var removeList = [];
    var newData = [];
    for (d in data) {
    var dd = data[d];
    if (dd.Location && dd.Location.length > 0) {
        if (func(dd)) {
            newData.push(dd);
        }
    }
    }

    // for (r in removeList) {
    //     var index = removeList[r];
    //     removeFromArray(index, data);
    // }

    return newData;
    }

    function markerOnClick() {
        var id = this.markerID;
        var marker = currentData[id];
        var div = "";

        if (marker["Project Name"]) {
            div += '<div><b>Project Name: </b>' + marker["Project Name"] + '</div>'
        }
        if (marker["Address"] && marker["Zip Code"]) {
            div += '<div><b>Address: </b>' + marker["Address"] + 'Austin, TX' + marker["Zip Code"] + '</div>'
        }
        if (marker["Owner"]) {
            div += '<div><b>Owner: </b>'+marker["Owner"]+'</div>'
        }
        if (marker["Developer"]) {
            div += '<div><b>Developer: </b>'+ marker["Developer"]+'</div>'
        }
        if (marker["Status"]) {
            div += '<div><b>Status: </b>'+marker["Status"]+'</div>'
        }
        if (marker["Housing Type"]) {
            div += '<div><b>Housing Type: </b>'+marker["Housing Type"]+'</div>'
        }
        if (marker["Unit Type"]) {
            div += '<div><b>Unit Type: </b>'+marker["Unit Type"]+'</div>'
        }
        if (marker["Distance to Bus Stop"]) {
            div += '<div><b>Distance to Bus Stop:</b> '+marker["Distance to Bus Stop Date"]+'</div>'
        }
        if (marker["Affordability Expiration Date"]) {
            div += '<div><b>Affordability Expiration Date: </b>'+marker["Affordability Expiration Date"]+'</div>'
        }
        if (marker["City Funded Amount"]) {
            div += '<div><b>City Funded Amount: </b>' +marker["City Funded Amount"]+'</div>'
        }
        $("#marker-info").html(div);
    }

    function renderMarkers(data, mymap, filter) {
    var markers = new L.FeatureGroup();

    if (filter) {
    var newData = filterFunction(data, filter);
    } else {
    var newData = data;
    }

    currentData = newData;

    var numTotal = 0;
    for (var d in newData) {
    var dd = newData[d];
    // console.log(dd);
    if (dd.Location && dd.Location.length > 0) {
        var loc = dd.Location;
        var x = loc.match(/\d*\.\d*/g);

        // L.marker([parseFloat(x[0]), -parseFloat(x[1])], {icon: assignMarker()}).addTo(mymap)
        var marker = L.marker([parseFloat(x[0]), -parseFloat(x[1])], {icon: assignMarker()});

        marker.markerID = d;
        marker.on("click", markerOnClick)

        markers.addLayer(marker);

        numTotal = numTotal + 1;

        // console.log(loc);
        // console.log(x);
    }
    }
    mymap.addLayer(markers);
    $("#AFI-Total").text(numTotal);
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
