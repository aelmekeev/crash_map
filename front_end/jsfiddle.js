var DATE = 0;
var TIME = 1;
var TYPE = 2;
var LOCATION = 3;
var STREET = 4;
var HOUSE_NUMBER = 5;
var ROAD = 6;
var KILOMETER = 7;
var METER = 8;
var LONGITUDE = 9;
var LATITUDE = 10;
var DEATH = 11;
var DEATH_CHILDREN = 12;
var INJURY = 13;
var INJURY_CHILDREN = 14;
var LONGITUDE_GEOCODE = 15;
var LATITUDE_GEOCODE = 16;
var VALID = 17;
var VALID_STRICT = 18;

var YOSHKAR_OLA = 'Йошкар-Ола';

var map, heatmap;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: {
      lat: 56.632057,
      lng: 47.882995
    },
    mapTypeId: google.maps.MapTypeId.MAP
  });

  heatmap = new google.maps.visualization.HeatmapLayer({
    map: map,
    maxIntensity: 5
  });
}

var heatmapOptions = [{
  mapZoom: 2,
  maxIntensity: 20,
  condition: allPoints,
  latitude: LATITUDE,
  longitude: LONGITUDE
}, {
  mapZoom: 8,
  maxIntensity: 10,
  condition: republicInputData,
  latitude: LATITUDE,
  longitude: LONGITUDE
}, {
  mapZoom: 8,
  maxIntensity: 20,
  condition: republicGeoData,
  latitude: LATITUDE_GEOCODE,
  longitude: LONGITUDE_GEOCODE
}, {
  mapZoom: 8,
  maxIntensity: 3,
  condition: republicValidData,
  latitude: LATITUDE,
  longitude: LONGITUDE
}, {
  mapZoom: 13,
  maxIntensity: 6,
  condition: yoInputData,
  latitude: LATITUDE,
  longitude: LONGITUDE
}, {
  mapZoom: 13,
  maxIntensity: 20,
  condition: yoGeoData,
  latitude: LATITUDE_GEOCODE,
  longitude: LONGITUDE_GEOCODE
}, {
  mapZoom: 13,
  maxIntensity: 3,
  condition: yoValidData,
  latitude: LATITUDE,
  longitude: LONGITUDE
}];

function updateMap() {
  var elem = document.getElementById("dataSelector");
  var index = elem.options[elem.selectedIndex].value;

  var heatmapOption = heatmapOptions[index];

  if (heatmapOption != null) {
    heatmap.setOptions({
      data: generateMVCArray(heatmapOption.condition, heatmapOption.latitude, heatmapOption.longitude),
      maxIntensity: heatmapOption.maxIntensity
    });

    map.setZoom(heatmapOption.mapZoom);
  } else {
    heatmap.setData([]);
  }
}

function generateMVCArray(condition, latitudeIndex, longitudeIndex) {
  var mvcArray = [];
  for (var index = 0; index < data.length; ++index) {
    if (condition(data[index])) {
      mvcArray.push(new google.maps.LatLng(data[index][latitudeIndex], data[index][longitudeIndex]));
    }
  }
  return mvcArray;
}

function allPoints(data) {
  return true;
}

function republicInputData(data) {
  return data[VALID] == 1;
}

function republicGeoData(data) {
  return data[LATITUDE_GEOCODE] != 0;
}

function republicValidData(data) {
  return data[VALID_STRICT] == 1;
}

function yoInputData(data) {
  return data[LOCATION] == YOSHKAR_OLA && republicInputData(data);
}

function yoGeoData(data) {
  return data[LOCATION] == YOSHKAR_OLA && republicGeoData(data);
}

function yoValidData(data) {
  return data[LOCATION] == YOSHKAR_OLA && republicValidData(data);
}
