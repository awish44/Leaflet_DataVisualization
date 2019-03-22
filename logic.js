// var myMap = L.map("mymap", {
//   center: [40.339252, -95.717697],
//   zoom: 4
// });

// Adding tile layer
// L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
//   attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
//   maxZoom: 18,
//   id: "mapbox.streets",
//   accessToken: API_KEY
// }).addTo(myMap);

// Link to GeoJSON
var quakesLink = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
console.log(quakesLink);
var boundariesLink = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Grab GeoJSON data and visualize the markers
// d3.json(quakeslink, function(response) {

//   console.log(response.features[0].geometry.coordinates);


//   for (var i = 0; i < response.features.length; i++) {
//     var coords = response.features[i].geometry.coordinates;
//     console.log(coords);

//     if (coords) {
//       L.marker([coords[1], coords[0]]).addTo(myMap);
//     }
//   }

// });

// Create marker size
function markerSize(magnitude) {
  return magnitude * 5;
};

var earthquakes = new L.LayerGroup();

d3.json(quakesLink, function (geoJson) {
  L.geoJSON(geoJson.features, {
    pointToLayer: function (geoJsonPoint, latlng) {
      return L.circleMarker(latlng, { radius: markerSize(geoJsonPoint.properties.mag) });
    },
    
    style: function (geoJsonFeature) {
      return {
        fillColor: Color(geoJsonFeature.properties.mag),
        fillOpacity: 0.8,
        weight: 0.1,
        color: 'black'
      }
    },

    onEachFeature: function (feature, layer) {
      layer.bindPopup(
        "<h4 style='text-align:center;'>" + new Date(feature.properties.time) +
        "</h4> <hr> <h5 style='text-align:center;'>" + feature.properties.title + "</h5>");
    }

  }).addTo(earthquakes);
  createMap(earthquakes);
});

var boundariesLines = new L.LayerGroup();

d3.json(boundariesLink, function (geoJson) {
    L.geoJSON(geoJson.features, {
        style: function (geoJsonFeature) {
            return {
                weight: 2,
                color: 'magenta'
            }
        },
    }).addTo(boundariesLines);
})

// Magnitude scale
function Color(magnitude) {
  if (magnitude > 5) {
      return 'orangered'
  } else if (magnitude > 4) {
      return 'coral'
  } else if (magnitude > 3) {
      return 'orange'
  } else if (magnitude > 2) {
      return 'yellow'
  } else if (magnitude > 1) {
      return 'GREENYELLOW'
  } else {
      return 'springgreen'
  }
};

function createMap() {

  var greyScale = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox.high-contrast',
      accessToken: API_KEY
  });

  var streetMap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox.streets',
      accessToken: API_KEY
  });


  var satellite = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox.satellite',
      accessToken: API_KEY
  });

  var baseLayers = {
    "Greyscale": greyScale,
    "Outdoors": streetMap,
    "Satellite": satellite
};

var overlays = {
    "Earthquakes": earthquakes,
    "Fault Lines": boundariesLines,
};

var mymap = L.map('mymap', {
    center: [40.339252, -95.717697],
    zoom: 4,

    layers: [streetMap, earthquakes, boundariesLines]
});

L.control.layers(baseLayers, overlays).addTo(mymap);

var legend = L.control({ position: 'bottomright' });

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        magnitude = [0, 1, 2, 3, 4, 5],
        labels = [];

    div.innerHTML += "<h4 style='margin:4px'></h4>"

    for (var i = 0; i < magnitude.length; i++) {
        div.innerHTML +=
            '<i style="background:' + Color(magnitude[i] + 1) + '"></i> ' +
            magnitude[i] + (magnitude[i + 1] ? '&ndash;' + magnitude[i + 1] + '<br>' : '+');
    }

    return div;
};
legend.addTo(mymap);
}

