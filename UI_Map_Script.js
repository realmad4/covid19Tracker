// JavaScript creating the mapping UI for system 2 of the Wilderness Weather Station Project
var stationMap;
var startingCoordinates;
var maxZoom;
var currentDiv = 'stationMap';
var activeLink = 'linkThree';
var dateSelector = document.getElementById("selector");

// Setting map variables
startingCoordinates = [0, 0];
maxZoom = 2.5;

// Initializing leaflet map to the stationMap div
stationMap = L.map('stationMap').setView(startingCoordinates, maxZoom);

// Adding tile layer from mapbox
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    minZoom: 3,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    maxBoundsViscosity: 1.0, // ADDED
    accessToken: 'pk.eyJ1IjoiZmlnaXRzdG9ybSIsImEiOiJjazcxMWs5b2wwMmFqM2x0aGptN3Zjdm5pIn0.VvYrg2bguYUMItXWH8OwLA'
}).addTo(stationMap);

// From stack overflow... ADDED
var southWest = L.latLng(-89.98155760646617, -180),
northEast = L.latLng(89.99346179538875, 180);
var bounds = L.latLngBounds(southWest, northEast);

stationMap.setMaxBounds(bounds);
stationMap.on('drag', function() {
    stationMap.panInsideBounds(bounds, { animate: false });
});

// Funtion to switch between different interfaces (center divs)
function switchDiv(newDiv, linkID) {
    document.getElementById(currentDiv).style.width = "0";
    document.getElementById(newDiv).style.width = "100%";
    document.getElementById(activeLink).style.color = "grey";
    document.getElementById(linkID).style.color = "white";
    currentDiv = newDiv;
    activeLink = linkID;
}

// Function for expanding data in archive, to use later...
function expandData() {
    var tables = document.getElementsByClassName("dataList");
    tables.style.height = "100%";
}

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyACXnN4ptdBSoYbxGUzgmW1On1lkAdYC9E",
    authDomain: "covid-19-archive-cosc3810.firebaseapp.com",
    databaseURL: "https://covid-19-archive-cosc3810.firebaseio.com",
    projectId: "covid-19-archive-cosc3810",
    storageBucket: "covid-19-archive-cosc3810.appspot.com",
    messagingSenderId: "406636731221",
    appId: "1:406636731221:web:1cde59ea51371eedd6addc",
    measurementId: "G-MRBRCXJHKH"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

// Start Data Event Listeners
var db = firebase.firestore();
var datesRef = db.collection("Dates").doc("Array");
var docRef = db.collection("Countries").doc("Geometry");
const dataDisplay = document.getElementById('dataObject');
var dates;
var mostRecent;

//add popups on features

function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
        layer.bindPopup
    }
}

// Create points and add properties to them 
var pointsLayer;
function createPoints(doc) {
    console.log("create points");
    var Country = doc.data().Geometry.Properties.Country;
    var Confirmed = doc.data().Geometry.Properties.Confirmed;
    var Recovered = doc.data().Geometry.Properties.Recovered;
    var Critical = doc.data().Geometry.Properties.Critical;
    var Deaths = doc.data().Geometry.Properties.Deaths;
    var Coordinates = doc.data().Geometry.Properties.Coordinates;



    var geoJSONFeature1 = { 
        "type": "Feature",
        "properties": {
            "Country":doc.id,
            "Confirmed": doc.data().Geometry.Properties.Confirmed,
            "Recovered": doc.data().Geometry.Properties.Recovered,
            "Critical": doc.data().Geometry.Properties.Critical,
            "Deaths": doc.data().Geometry.Properties.Deaths,
            "Coordinates": doc.data().Geometry.Properties.Coordinates
        },
        "geometry": {
            "type": "Point",
            "coordinates":doc.data().Geometry.Coordinates,
            }
        }

        var Confirmed = geoJSONFeature1.properties.Confirmed;
        var adjustSize;
        if(Confirmed >= 25000){
            adjustSize = 12*(Confirmed/100000);
        } else {
            adjustSize = 5;
        }
        var Critical = geoJSONFeature1.properties.Critical;
        var adjustWeight = 50*(Critical/100000);
        var Deaths = geoJSONFeature1.properties.Deaths;
        var adjustBlue;
        var adjustGreen;
        var adjustRed;
        if (Deaths > 0) {
            adjustBlue = 145-(((1000*Deaths)/Confirmed));
            adjustRed = 255;
            adjustGreen = adjustBlue;
        } else {
            adjustGreen = 255;
            adjustRed = 0;
            adjustBlue = 0;
        }
        var geojsonMarkerOptions = {
			radius: adjustSize,
         	fillColor: "rgb(" + adjustRed + ", " + adjustGreen + ", " + adjustBlue + ")",
        	color: "rgb(255, 0, 0)",
        	weight: adjustWeight,
         	opacity: 1,
         	fillOpacity: 0.7
		};

        
        var geoJSONPoints = L.geoJSON(geoJSONFeature1, {
            pointToLayer: function(geoJSONFeature1, latlng){
                var Coordinates = geoJSONFeature1.properties.Coordinates;
                var flippedCoords = [Coordinates[1], Coordinates[0]];
				// Check on inputs
				console.log("Feature: " + geoJSONFeature1 + " LatLng: " + flippedCoords);
				return L.circleMarker(flippedCoords, geojsonMarkerOptions);
			},
            onEachFeature: function(geoJSONFeature1, layer) {
                console.log("set vars");
                layer.myTag = "pointsLayer";
                var Country = geoJSONFeature1.properties.Country;
                var Confirmed = geoJSONFeature1.properties.Confirmed;
                var Critical = geoJSONFeature1.properties.Critical;
                var Recovered = geoJSONFeature1.properties.Recovered;
                var Deaths = geoJSONFeature1.properties.Deaths;
                var Coordinates = geoJSONFeature1.properties.Coordinates;
                console.log(Coordinates);
                // Keep this:
                layer.on('click', function(e) {
                    layer.bindPopup("Country: " + Country + "</br>"
                                    + "Confirmed cases: "+ Confirmed +"</br>"
                                    + "Critical cases: " + Critical + "</br>"
                                    + "Recovered cases: " + Recovered + "</br>"
                                    + "Deaths: " + Deaths + "</br>"
                                    + "Coordinates: [" + Coordinates + "]");
        });
    }
});
    console.log("hi");
    pointsLayer = geoJSONPoints.addTo(stationMap);  
}


// gets the date array, which is stored as date then the last element of date is displayed on the map
function createDateRef(doc){
    console.log("get latest date from list");
    dates = doc.data().Date;
    console.log(dates);
    mostRecent = dates[dates.length - 1];

    // Get most recent elements from database, feed through rendering function for map
    db.collection(mostRecent)
    .get()
    .then((snapshot) => {
        snapshot.docs.forEach(doc => {
            console.log(doc.data());
            createPoints(doc);
            createArchive(doc);
        });
    }).catch(function(error) {
    console.log("Error getting documents: ", error);
    });

    // Testing references...
    docRef.get().then(function(doc) {
    if (doc.exists) {
        var docData = doc.data();
        console.log("Document data:", docData);
    } else {
    // doc.data() will be undefined in this case
        console.log("No such document!");
    }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });

}
    


// Get elements from database, feed through rendering function for archive
db.collection("Dates")
                .get()
                .then((snapshot) => {
                    snapshot.docs.forEach(doc => {
                        console.log(doc.data());
                        createDateRef(doc);
                        createDropdown(doc);
                    });
}).catch(function(error) {
    console.log("Error getting documents: ", error);
});

// Function for removing points, used later to refresh points when a different dropdown is selected
var removeMarkers = function() {
    stationMap.eachLayer( function(layer) {

      if ( layer.myTag &&  layer.myTag === "pointsLayer") {
        stationMap.removeLayer(layer)
          }

        });
}

function createDropdown(doc) {
    dates = doc.data().Date;
    console.log(dates);
    mostRecent = dates[dates.length - 1];
    var dateIterator;
    for (dateIterator = dates.length-1; dateIterator >= 0; dateIterator--){
            currDate = dates[dateIterator];
            dateSelector.innerHTML = dateSelector.innerHTML + '<option value="' + currDate + '">' + currDate + '</option>';
    }
}

function changePoints(){
    console.log("date clicked: " + this.value);
    console.log(pointsLayer);
    removeMarkers();
    archiveTable.innerHTML = archiveHeader;
    db.collection(this.value)
    .get()
    .then((snapshot) => {
        snapshot.docs.forEach(doc => {
            //console.log(doc.data());
            createPoints(doc);
            createArchive(doc);
        });
    }).catch(function(error) {
    console.log("Error getting documents: ", error);
    });
}

dateSelector.addEventListener("change", changePoints, false);

// Creating the archive table...
var archiveTable = document.getElementById("archiveTable");
var archiveHeader = archiveTable.innerHTML;
function createArchive(doc){
    var Country = doc.data().Geometry.Properties.Country;
    var Confirmed = doc.data().Geometry.Properties.Confirmed;
    var Recovered = doc.data().Geometry.Properties.Recovered;
    var Critical = doc.data().Geometry.Properties.Critical;
    var Deaths = doc.data().Geometry.Properties.Deaths;
    var Coordinates = doc.data().Geometry.Properties.Coordinates;

    archiveTable.innerHTML = archiveTable.innerHTML + "<tr>"
                                                    + "<th>" + Country + "</th>"
                                                    + "<td class='confirmed'>" + Confirmed + "</td>"
                                                    + "<td class='critical'>" + Critical + "</td>"
                                                    + "<td class='recovered'>" + Recovered + "</td>"
                                                    + "<td class='deaths'>" + Deaths + "</td>"
                                                    + "<td class='deathsper'>" + Deaths/Confirmed + "</td>"
                                                    + "</tr>";

}
// Testing references...
datesRef.get().then(function(doc) {
    if (doc.exists) {
        var dateData = date.data();
        console.log("Document data:", docData);
    } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
    }
}).catch(function(error) {
    console.log("Error getting document:", error);
});





