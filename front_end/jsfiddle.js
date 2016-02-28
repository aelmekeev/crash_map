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

var heatmaps = [{
  mapZoom: 13,
  maxIntensity: 6,
  pointsGetter: getAllYoPoints
}, {
  mapZoom: 13,
  maxIntensity: 20,
  pointsGetter: getAllYoGeocodedPoints
}, {
  mapZoom: 13,
  maxIntensity: 3,
  pointsGetter: getAllYoGeocodedValidPoints
}, {
  mapZoom: 8,
  maxIntensity: 10,
  pointsGetter: getAllPoints
}, {
  mapZoom: 8,
  maxIntensity: 20,
  pointsGetter: getAllGeocodedPoints
}, {
  mapZoom: 8,
  maxIntensity: 3,
  pointsGetter: getAllGeocodedValidPoints
}];

function updateMap() {
  var elem = document.getElementById("dataSelector");
  var index = elem.options[elem.selectedIndex].value;

  if (heatmaps[index] != null) {
    heatmap.setOptions({
      data: generateMVCArray(heatmaps[index].pointsGetter()),
      maxIntensity: heatmaps[index].maxIntensity
    });

    map.setZoom(heatmaps[index].mapZoom);
  } else {
    heatmap.setData([]);
  }
}

function generateMVCArray(coordinates) {
  var mvcArray = [];
  for (var index = 0; index < coordinates.length; ++index) {
    mvcArray.push(new google.maps.LatLng(coordinates[index][0], coordinates[index][1]));
  }
  return mvcArray;
}