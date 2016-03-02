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
  var heatmapOption = heatmapOptions[$('select#dataSelector').val()];

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

function generateMVCArray(datasetCondition, latitudeIndex, longitudeIndex) {
  var typeFilterValue = $('select#typesFilter :selected').text();
  var dateFilterValue = getDateFilterValue();
  var timeFilterValue = getTimeFilterValue();

  var mvcArray = [];
  for (var index = 0; index < data.length; ++index) {
    if (datasetCondition(data[index]) && filter(data[index], typeFilterValue, dateFilterValue, timeFilterValue)) {
      mvcArray.push(new google.maps.LatLng(data[index][latitudeIndex], data[index][longitudeIndex]));
    }
  }
  return mvcArray;
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

function filter(data, typeFilterValue, dateFilterValue, timeFilterValue) {
  var dateFilter = filterDate(data, dateFilterValue);
  var timeFilter = filterTime(data, timeFilterValue);
  var typeFilter = typeFilterValue == '' || typeFilterValue.indexOf(data[TYPE]) != -1;

  return dateFilter && timeFilter && typeFilter;
}

function filterDate(data, dateFilterValue) {
  var date = parseDate(data[DATE]);

  var dateFilter = dateFilterValue.invert && dateFilterValue.startDate == null && dateFilterValue.endDate == null;
  dateFilter = dateFilter || !dateFilterValue.invert && (dateFilterValue.startDate == null || dateFilterValue.startDate < date) && (dateFilterValue.endDate == null || dateFilterValue.endDate > date);
  dateFilter = dateFilter || dateFilterValue.invert && (dateFilterValue.startDate != null && dateFilterValue.startDate > date || dateFilterValue.endDate != null && dateFilterValue.endDate < date);

  return dateFilter;
}

function filterTime(data, timeFilterValue) {
  var time = parseTime(data[TIME]);

  var timeFilter = timeFilterValue.invert && timeFilterValue.startTime == null && timeFilterValue.endTime == null;
  timeFilter = timeFilter || !timeFilterValue.invert && (timeFilterValue.startTime == null || timeFilterValue.startTime < time) && (timeFilterValue.endTime == null || timeFilterValue.endTime > time);
  timeFilter = timeFilter || timeFilterValue.invert && (timeFilterValue.startTime != null && timeFilterValue.startTime > time || timeFilterValue.endTime != null && timeFilterValue.endTime < time);

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
  updateMap();
}

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
