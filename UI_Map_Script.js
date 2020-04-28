// JavaScript creating the mapping UI for system 2 of the Wilderness Weather Station Project
var stationMap;
var startingCoordinates;
var maxZoom;
var currentDiv = 'stationMap';
var activeLink = 'linkThree';

// Setting map variables
startingCoordinates = [0, 0];
maxZoom = 2.5; // CHANGED

// Initializing leaflet map to the stationMap div
stationMap = L.map('stationMap').setView(startingCoordinates, maxZoom);

// Adding tile layer from mapbox
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18, // CHANGED
    minZoom: 3, // ADDED
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

//Test create marker on map.
//var marker = L.marker([25.0000, 71.0000]).addTo(stationMap);
//marker.bindPopup("<b>Hello world!</b><br>I am a popup.");

//test circle on map
// var circle = L.circle([25.0000, 71.0000], {
//     color: 'red',
//     fillColor: '#f03',
//     fillOpacity: 0.5,
//     radius: 500
// }).addTo(stationMap);
// circle.bindPopup("I am a circle.");

// Funtion to switch between different interfaces (center divs)
function switchDiv(newDiv, linkID) {
    document.getElementById(currentDiv).style.width = "0";
    document.getElementById(newDiv).style.width = "100%";
    document.getElementById(activeLink).style.color = "grey";
    document.getElementById(linkID).style.color = "white";
    currentDiv = newDiv;
    activeLink = linkID;
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

// Need to figure out a way to get the latest date in order to access the most recent collection
var latestDate = "04-27-20"; // Temporary set date
// Then need to figure out a way to get all the dates, 

// Start Data Event Listeners
var db = firebase.firestore();
var docRef = db.collection(latestDate).doc("Geometry");
const dataDisplay = document.getElementById('dataObject');

//add popups on features

function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
        layer.bindPopup
    }
}

// Create points and add properties to them 
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
        if(Confirmed >= 20000){
            adjustSize = 10*(Confirmed/100000);
        } else {
            adjustSize = 3;
        }
        var Critical = geoJSONFeature1.properties.Critical;
        var adjustWeight = 50*(Critical/100000);
        var Deaths = geoJSONFeature1.properties.Deaths;
        var adjustBlue;
        var adjustGreen;
        var adjustRed;
        if (Deaths > 0) {
            adjustBlue = 145-(4*(Confirmed/Deaths));
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
    console.log("hi")
    geoJSONPoints.addTo(stationMap)
    
}






// Get elements from database, feed through rendering function for archive
db.collection(latestDate)
                .get()
                .then((snapshot) => {
                    snapshot.docs.forEach(doc => {
                        console.log(doc.data());
                        //renderStation(doc);
                        createPoints(doc);
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

// Create HTML elements for rendering in the Archive
// function renderStation(doc) {
//     // Creating formatting elements
//     let li = document.createElement('li');
//         li.setAttribute('data-id', doc.id);
//         li.setAttribute('class', "archive");


//     let br = document.createElement('br');

//     // Creating basic info elements
//     let name = document.createElement('span');
//         name.setAttribute('class', "station-name");
//     let coordinates = document.createElement('span');
//         coordinates.setAttribute('class', "secondaryInfo");
//     let battery = document.createElement('span');
//         battery.setAttribute('class', "secondaryInfo");
//     let biome = document.createElement('span');
//         biome.setAttribute('class', "secondaryInfo");
//     let humHeader = document.createElement('span');
//         humHeader.setAttribute('class', "dataHeaders");
//     let tempHeader = document.createElement('span');
//         tempHeader.setAttribute('class', "dataHeaders");
//     let windHeader = document.createElement('span');
//         windHeader.setAttribute('class', "dataHeaders");

//     // Creating data List elements
//     let humList = document.createElement('ol');
//         humList.setAttribute('class', "dataList");
//     let tempList = document.createElement('ol');
//         tempList.setAttribute('class', "dataList");
//         tempList.setAttribute('style', "float: right; position: relative; top: -262px; left: -650px;");
//     let windList = document.createElement('ol');
//         windList.setAttribute('class', "dataList");
//         windList.setAttribute('style', "float: right; position: relative; top: -280px; left: 550px;");
    
//     // Setting basic info content
//     Country.textContent = doc.id;
//     coordinates.textContent = "Coordinates: [" + doc.data().Geometry.Coordinates + "]";
//     battery.textContent = "Battery Level: " + doc.data().Geometry.Properties.battery + "%";
//     biome.textContent = "Biome type: " + doc.data().Geometry.Properties.biome;

//     // Helper function to make appending elements to list easier
//     function addEntry(entry){
//         li.appendChild(entry);
//         li.innerHTML = li.innerHTML + '</br>'
//     }

//     // Adding basic info
//     addEntry(name);
//     addEntry(coordinates);
//     addEntry(battery);
//     addEntry(biome);

//     // Setting data list entries for humList
//     humHeader.textContent = "Humidity Levels: ";
//     humList.appendChild(humHeader);
//     humList.innerHTML = humList.innerHTML + '</br>'
//     for (var x of doc.data().Geometry.Properties.humidity){
//         let humElm = document.createElement('li');
//         //humElm.setAttribute('class', "dataList");
//         humElm.textContent = x;
//         humList.appendChild(humElm);
//     }
//     // Adding humidity data list
//     addEntry(humList);

//     // Setting data list entries for tempList
//     tempHeader.textContent = "Temperatures: ";
//     tempList.appendChild(tempHeader);
//     tempList.innerHTML = tempList.innerHTML + '</br>'
//     for (var x of doc.data().Geometry.Properties.temp){
//         let tempElm = document.createElement('li');
//         //tempElm.setAttribute('class', "dataList");
//         tempElm.textContent = x + " °F";
//         tempList.appendChild(tempElm);
//     }
//     // Adding temp data list
//     addEntry(tempList);

//     // Setting data list entries for windList
//     windHeader.textContent = "Wind Speeds: ";
//     windList.appendChild(windHeader);
//     windList.innerHTML = windList.innerHTML + '</br>'
//     for (var x of doc.data().Geometry.Properties.wind){
//         let windElm = document.createElement('li');
//         //windElm.setAttribute('class', "dataList");
//         windElm.textContent = x + "mph";
//         windList.appendChild(windElm);
//     }
//     // Adding wind data list
//     addEntry(windList);

//     dataDisplay.appendChild(li);

// }
