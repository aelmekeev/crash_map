// TODO:
// - Double check that everything is working end-to-end
// - Documentation
// - Alpha-testing
//   - testing in other browsers
// - Adblock
// - Beta-testing
//   - call GIBDD
// - Release

// indeces for input data array
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

var map, heatmap, markerCluster, infowindow;

// map and its' objects initialization
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 8,
    disableDoubleClickZoom: true,
    center: {
      // Yoshkar-Ola
      lat: 56.632057,
      lng: 47.882995
    },
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });

  infowindow = new google.maps.InfoWindow();

  google.maps.event.addListener(map, 'zoom_changed', function() {
    infowindow.close();
  });

  heatmap = new google.maps.visualization.HeatmapLayer({
    map: map
  });

  markerCluster = new MarkerClusterer(map, [], {
    zoomOnClick: true
  });
}

// options for layers with different types of data
var layerOptions = [{
  maxIntensity: 20,
  condition: allPoints,
  latitude: LATITUDE,
  longitude: LONGITUDE
}, {
  maxIntensity: 10,
  condition: republicInputData,
  latitude: LATITUDE,
  longitude: LONGITUDE
}, {
  maxIntensity: 20,
  condition: republicGeoData,
  latitude: LATITUDE_GEOCODE,
  longitude: LONGITUDE_GEOCODE
}, {
  maxIntensity: 3,
  condition: republicValidData,
  latitude: LATITUDE,
  longitude: LONGITUDE
}, {
  maxIntensity: 6,
  condition: yoInputData,
  latitude: LATITUDE,
  longitude: LONGITUDE
}, {
  maxIntensity: 20,
  condition: yoGeoData,
  latitude: LATITUDE_GEOCODE,
  longitude: LONGITUDE_GEOCODE
}, {
  maxIntensity: 3,
  condition: yoValidData,
  latitude: LATITUDE,
  longitude: LONGITUDE
}];

// data type conditions

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

function resetType() {
  $('select#typesFilter :selected').removeAttr('selected');
  updateMap();
}

function updateMap() {
  var layerOption = layerOptions[$('select#dataSelector').val()];

  if ($('input[name=layer]:checked').val() == 'heatmap') {
    markerCluster.clearMarkers();
    updateHeatmap(layerOption);
  } else {
    heatmap.setData([]);
    drawMarkers(layerOption);
  }
}

function updateHeatmap(heatmapOption) {
  if (heatmapOption != null) {
    heatmap.setOptions({
      data: generateDataArray(heatmapOption.condition, heatmapOption.latitude, heatmapOption.longitude, true),
      maxIntensity: heatmapOption.maxIntensity
    });
  } else {
    heatmap.setData([]);
  }
}

function generateDataArray(datasetCondition, latitudeIndex, longitudeIndex, isHeatmap) {
  var typeFilterValue = $('select#typesFilter :selected').text();
  var dateFilterValue = getDateFilterValue();
  var timeFilterValue = getTimeFilterValue();
  var injuryFilterValue = $('select#injuryFilter').val();

  var dataArray = [];
  for (var index = 0; index < data.length; ++index) {
    if (datasetCondition(data[index]) && filter(data[index], typeFilterValue, dateFilterValue, timeFilterValue, injuryFilterValue)) {
      if (isHeatmap) {
        dataArray.push(new google.maps.LatLng(data[index][latitudeIndex], data[index][longitudeIndex]));
      } else {
        dataArray.push(createMarker(data[index], latitudeIndex, longitudeIndex));
      }
    }
  }
  return dataArray;
}

function getDateFilterValue() {
  var dateFilterValue = {};

  dateFilterValue.startDate = $('#startDate').datepicker('getDate');
  dateFilterValue.endDate = $('#endDate').datepicker('getDate');
  dateFilterValue.invert = $('#invertDateRange').prop('checked');

  return dateFilterValue;
}

function getTimeFilterValue() {
  var timeFilterValue = [];

  timeFilterValue.startTime = $('#startTime').timepicker('getTime');
  timeFilterValue.endTime = $('#endTime').timepicker('getTime');
  timeFilterValue.invert = $('#invertTimeRange').prop('checked');

  return timeFilterValue;
}

// markers clustering

function drawMarkers(layerOption) {
  if (layerOption != null) {
    var markers = generateDataArray(layerOption.condition, layerOption.latitude, layerOption.longitude, false);
    markerCluster.clearMarkers();
    markerCluster.addMarkers(markers);
  } else {
    markerCluster.clearMarkers();
  }
}

function createMarker(data, latitudeIndex, longitudeIndex) {
  var marker = new google.maps.Marker({
    position: {
      lat: data[latitudeIndex],
      lng: data[longitudeIndex]
    },
    map: map
  });

  google.maps.event.addListener(marker, 'click', function(e) {
    infowindow.setContent(createInfoWindowContent(data));
    infowindow.open(map, this);
  });

  return marker;
}

function createInfoWindowContent(data) {
  var content = '<div class="info"><b>Дата и время</b>: ' + data[DATE] + ' ' + data[TIME] + '<br />';
  content += '<b>Тип</b>: ' + data[TYPE] + '<br />';

  var place = data[LOCATION] + ', ';
  if (data[STREET] != '') {
    place += data[STREET] + ', д. ' + data[HOUSE_NUMBER];
  } else {
    place += data[ROAD] + ' ' + data[KILOMETER] + '-й км. ' + data[METER] + '-й м.';
  }

  content += '<b>Место</b>: ' + place + '<br />';

  if (data[DEATH] != 0) {
    content += '<b>Погибло</b>: ' + data[DEATH];
    if (data[DEATH_CHILDREN] != 0) {
      content += ' (среди них детей: ' + data[DEATH_CHILDREN] + ')';
    }
    content += '<br />';
  }

  if (data[INJURY] != 0) {
    content += '<b>Пострадало</b>: ' + data[INJURY];
    if (data[INJURY_CHILDREN] != 0) {
      content += ' (среди них детей: ' + data[INJURY_CHILDREN] + ')';
    }
    content += '<br />';
  }

  return content + '</div>';
}

// filtering

function filter(data, typeFilterValue, dateFilterValue, timeFilterValue, injuryFilterValue) {
  var dateFilter = filterDate(data, dateFilterValue);
  var timeFilter = filterTime(data, timeFilterValue);
  var typeFilter = typeFilterValue == '' || typeFilterValue.indexOf(data[TYPE]) != -1;
  var injuryFilter = filterInjury(data, injuryFilterValue);

  return dateFilter && timeFilter && typeFilter && injuryFilter;
}

function filterInjury(data, injuryFilterValue) {
  switch (+injuryFilterValue) {
    case -1:
      return true;
    case 0:
      return data[INJURY] > 0;
    case 1:
      return data[INJURY_CHILDREN] > 0;
    case 2:
      return data[DEATH] > 0;
    case 3:
      return data[DEATH_CHILDREN] > 0;
  }
}

function filterDate(data, dateFilterValue) {
  var date = parseDate(data[DATE]);

  var dateFilter = dateFilterValue.startDate == null && dateFilterValue.endDate == null || !dateFilterValue.invert && (dateFilterValue.startDate == null || dateFilterValue.startDate < date) && (dateFilterValue.endDate == null || dateFilterValue.endDate > date) || dateFilterValue.invert && (dateFilterValue.startDate != null && dateFilterValue.startDate > date || dateFilterValue.endDate != null && dateFilterValue.endDate < date);

  return dateFilter;
}

function filterTime(data, timeFilterValue) {
  var time = parseTime(data[TIME]);

  var timeFilter = timeFilterValue.startTime == null && timeFilterValue.endTime == null || !timeFilterValue.invert && (timeFilterValue.startTime == null || timeFilterValue.startTime < time) && (timeFilterValue.endTime == null || timeFilterValue.endTime > time) || timeFilterValue.invert && (timeFilterValue.startTime != null && timeFilterValue.startTime > time || timeFilterValue.endTime != null && timeFilterValue.endTime < time);

  return timeFilter
}

function parseDate(dateString) {
  var parts = dateString.split('.');
  return new Date(+parts[2], +parts[1] - 1, +parts[0]);
}

function parseTime(timeString) {
  var parts = timeString.split(':');
  return new Date(1970, 1 - 1, 1, +parts[0], +parts[1]);
}

function resetDate() {
  $('#startDate').val('');
  $('#startDate').datepicker('option', {
    minDate: new Date(2015, 1 - 1, 1),
    maxDate: new Date(2015, 12 - 1, 31)
  });
  $('#endDate').val('');
  $('#endDate').datepicker('option', {
    minDate: new Date(2015, 1 - 1, 1),
    maxDate: new Date(2015, 12 - 1, 31)
  });
  $('#invertDateRange').removeAttr('checked');
  updateMap();
}

function resetTime() {
  $('#startTime').val('');
  $('#startTime').timepicker('option', {
    minTime: "0:00",
    maxTime: "24:00"
  });
  $('#endTime').val('');
  $('#endTime').timepicker('option', {
    minTime: "0:00",
    maxTime: "24:00"
  });
  $('#invertTimeRange').removeAttr('checked');
  updateMap();
}

// filters widgets initialization
$(function() {
  $('#startDate').datepicker({
    minDate: new Date(2015, 1 - 1, 1),
    maxDate: new Date(2015, 12 - 1, 31),
    dateFormat: 'd/m/y',
    onClose: function(selectedDate) {
      $('#endDate').datepicker('option', 'minDate', selectedDate);
    }
  });

  $('#endDate').datepicker({
    minDate: new Date(2015, 1 - 1, 1),
    maxDate: new Date(2015, 12 - 1, 31),
    dateFormat: 'd/m/y',
    onClose: function(selectedDate) {
      $('#startDate').datepicker('option', 'maxDate', selectedDate);
    }
  });

  $('#startTime').timepicker({
    timeFormat: 'H:i',
    show2400: true,
    minTime: "0:00",
    maxTime: "24:00"
  });
  $('#startTime').on('changeTime', function() {
    $('#endTime').timepicker('option', 'minTime', $(this).val());
  });

  $('#endTime').timepicker({
    timeFormat: 'H:i',
    show2400: true,
    minTime: "0:00",
    maxTime: "24:00"
  });
  $('#endTime').on('changeTime', function() {
    $('#startTime').timepicker('option', 'maxTime', $(this).val());
  });
});