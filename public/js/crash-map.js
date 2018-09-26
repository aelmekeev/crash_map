// indices for input data array
const DATE = 0;
const TIME = 1;
const TYPE = 2;
const LOCATION = 3;
const STREET = 4;
const HOUSE_NUMBER = 5;
const ROAD = 6;
const KILOMETER = 7;
const METER = 8;
const LONGITUDE = 9;
const LATITUDE = 10;
const DEATH = 11;
const DEATH_CHILDREN = 12;
const INJURY = 13;
const INJURY_CHILDREN = 14;
const LONGITUDE_GEOCODE = 15;
const LATITUDE_GEOCODE = 16;
const VALID = 17;
const VALID_STRICT = 18;

const YOSHKAR_OLA = 'Йошкар-Ола';
const DATA_YEAR = 2015;

let map, heatmap, markerCluster;
// widgets
let startDate, endDate, startTime, endTime, invertDateRange, invertTimeRange, injuryFilter;

ymaps.ready(init);

// map and its' objects initialization
function init() {
    map = new ymaps.Map('map', {
        // Yoshkar-Ola
        center: [56.632057, 47.882995],
        zoom: 8,
        controls: ['typeSelector', 'zoomControl', 'rulerControl']
    });

    markerCluster = new ymaps.Clusterer({
        preset: 'islands#blueClusterIcons',
        clusterHideIconOnBalloonOpen: false,
        geoObjectHideIconOnBalloonOpen: false
    });

    ymaps.modules.require(['Heatmap'], function (Heatmap) {
        heatmap = new Heatmap();
        heatmap.setMap(map);
    });
}

// options for layers with different types of data
const LAYER_OPTIONS = [{
    intensityOfMidpoint: 0.15,
    condition: allPoints,
    latitude: LATITUDE,
    longitude: LONGITUDE
}, {
    intensityOfMidpoint: 0.1,
    condition: republicInputData,
    latitude: LATITUDE,
    longitude: LONGITUDE
}, {
    intensityOfMidpoint: 0.06,
    condition: republicGeoData,
    latitude: LATITUDE_GEOCODE,
    longitude: LONGITUDE_GEOCODE
}, {
    intensityOfMidpoint: 0.1,
    condition: republicValidData,
    latitude: LATITUDE,
    longitude: LONGITUDE
}, {
    intensityOfMidpoint: 0.15,
    condition: yoInputData,
    latitude: LATITUDE,
    longitude: LONGITUDE
}, {
    intensityOfMidpoint: 0.06,
    condition: yoGeoData,
    latitude: LATITUDE_GEOCODE,
    longitude: LONGITUDE_GEOCODE
}, {
    intensityOfMidpoint: 0.25,
    condition: yoValidData,
    latitude: LATITUDE,
    longitude: LONGITUDE
}];

// data type conditions

function allPoints(data) {
    return true;
}

function republicInputData(data) {
    return data[VALID] === 1;
}

function republicGeoData(data) {
    return data[LATITUDE_GEOCODE] !== 0;
}

function republicValidData(data) {
    return data[VALID_STRICT] === 1;
}

function yoInputData(data) {
    return data[LOCATION] === YOSHKAR_OLA && republicInputData(data);
}

function yoGeoData(data) {
    return data[LOCATION] === YOSHKAR_OLA && republicGeoData(data);
}

function yoValidData(data) {
    return data[LOCATION] === YOSHKAR_OLA && republicValidData(data);
}

function resetType() {
    $('select#typesFilter :selected').removeAttr('selected');
    updateMap();
}

function updateMap() {
    const layerOption = LAYER_OPTIONS[$('select#dataSelector').val()];

    if ($('input[name=layer]:checked').val() === 'heatmap') {
        markerCluster.removeAll();
        updateHeatmap(layerOption);
    } else {
        heatmap.setData([]);
        drawMarkers(layerOption);
    }
}

function updateHeatmap(heatmapOption) {
    if (heatmapOption != null) {
        heatmap.options.set('intensityOfMidpoint', heatmapOption.intensityOfMidpoint);
        heatmap.setData(generateDataArray(heatmapOption.condition, heatmapOption.latitude, heatmapOption.longitude, true));
    } else {
        heatmap.setData([]);
    }
}

function generateDataArray(datasetCondition, latitudeIndex, longitudeIndex, isHeatmap) {
    const typeFilterValue = $('select#typesFilter :selected').text();
    const dateFilterValue = getDateFilterValue();
    const timeFilterValue = getTimeFilterValue();
    const injuryFilterValue = injuryFilter.val();

    let dataArray = [];
    for (let index = 0; index < data.length; ++index) {
        if (datasetCondition(data[index]) && filter(data[index], typeFilterValue, dateFilterValue, timeFilterValue, injuryFilterValue)) {
            if (isHeatmap) {
                dataArray.push([data[index][latitudeIndex], data[index][longitudeIndex]]);
            } else {
                dataArray.push(createMarker(data[index], latitudeIndex, longitudeIndex));
            }
        }
    }
    return dataArray;
}

function getDateFilterValue() {
    let dateFilterValue = {};

    dateFilterValue.startDate = startDate.datepicker('getDate');
    dateFilterValue.endDate = endDate.datepicker('getDate');
    dateFilterValue.invert = invertDateRange.prop('checked');

    return dateFilterValue;
}

function getTimeFilterValue() {
    let timeFilterValue = [];

    timeFilterValue.startTime = startTime.timepicker('getTime');
    timeFilterValue.endTime = endTime.timepicker('getTime');
    timeFilterValue.invert = invertTimeRange.prop('checked');
    if (timeFilterValue.startTime) {
        timeFilterValue.startTime.setFullYear(DATA_YEAR, 0, 1);
    }
    if (timeFilterValue.endTime) {
        timeFilterValue.endTime.setFullYear(DATA_YEAR, 0, 1);
    }

    return timeFilterValue;
}

// markers clustering

function drawMarkers(layerOption) {
    if (layerOption != null) {
        const markers = generateDataArray(layerOption.condition, layerOption.latitude, layerOption.longitude, false);
        markerCluster.removeAll();
        markerCluster.add(markers);
        map.geoObjects.add(markerCluster);
    } else {
        markerCluster.removeAll();
    }
}

function createMarker(data, latitudeIndex, longitudeIndex) {
    return new ymaps.GeoObject({
        geometry: {
            type: "Point",
            coordinates: [data[latitudeIndex], data[longitudeIndex]]
        },
        properties: {
            clusterCaption: data[DATE] + ' ' + data[TIME],
            balloonContentHeader: 'ДТП ' + data[DATE] + ' ' + data[TIME],
            balloonContentBody: createInfoWindowContent(data)
        }
    });
}

function createInfoWindowContent(data) {
    let content = '<div class="info"><b>Тип</b>: ' + data[TYPE] + '<br />';

    let place = data[LOCATION] + ', ';
    if (data[STREET] !== '') {
        place += data[STREET] + ', д. ' + data[HOUSE_NUMBER];
    } else {
        place += data[ROAD] + ' ' + data[KILOMETER] + '-й км. ' + data[METER] + '-й м.';
    }

    content += '<b>Место</b>: ' + place + '<br />';
    content += '<b>Координаты</b>: ' + data[LATITUDE] + ', ' + data[LONGITUDE] + '<br />';

    if (data[DEATH] !== 0) {
        content += '<b>Погибло</b>: ' + data[DEATH];
        if (data[DEATH_CHILDREN] !== 0) {
            content += ' (среди них детей: ' + data[DEATH_CHILDREN] + ')';
        }
        content += '<br />';
    }

    if (data[INJURY] !== 0) {
        content += '<b>Пострадало</b>: ' + data[INJURY];
        if (data[INJURY_CHILDREN] !== 0) {
            content += ' (среди них детей: ' + data[INJURY_CHILDREN] + ')';
        }
        content += '<br />';
    }

    return content + '</div>';
}

// filtering

function filter(data, typeFilterValue, dateFilterValue, timeFilterValue, injuryFilterValue) {
    const dateFilter = filterDate(data, dateFilterValue);
    const timeFilter = filterTime(data, timeFilterValue);
    const typeFilter = typeFilterValue === '' || typeFilterValue.indexOf(data[TYPE]) !== -1;
    const injuryFilter = filterInjury(data, injuryFilterValue);

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
    const date = parseDate(data[DATE]);

    return dateFilterValue.startDate == null && dateFilterValue.endDate == null ||
            !dateFilterValue.invert && (dateFilterValue.startDate == null || dateFilterValue.startDate < date) &&
                (dateFilterValue.endDate == null || dateFilterValue.endDate > date) ||
            dateFilterValue.invert && (dateFilterValue.startDate != null && dateFilterValue.startDate > date ||
                dateFilterValue.endDate != null && dateFilterValue.endDate < date);
}

function filterTime(data, timeFilterValue) {
    const time = parseTime(data[TIME]);

    return timeFilterValue.startTime == null && timeFilterValue.endTime == null ||
            !timeFilterValue.invert && (timeFilterValue.startTime == null || timeFilterValue.startTime < time) &&
                (timeFilterValue.endTime == null || timeFilterValue.endTime > time) ||
            timeFilterValue.invert && (timeFilterValue.startTime != null && timeFilterValue.startTime > time ||
                timeFilterValue.endTime != null && timeFilterValue.endTime < time);
}

function parseDate(dateString) {
    const parts = dateString.split('.');
    return new Date(+parts[2], +parts[1] - 1, +parts[0]);
}

function parseTime(timeString) {
    const parts = timeString.split(':');
    return new Date(DATA_YEAR, 0, 1, +parts[0], +parts[1]);
}

function resetDate() {
    startDate.val('');
    startDate.datepicker('option', {
        minDate: new Date(DATA_YEAR, 0, 1),
        maxDate: new Date(DATA_YEAR, 11, 31)
    });
    endDate.val('');
    endDate.datepicker('option', {
        minDate: new Date(DATA_YEAR, 0, 1),
        maxDate: new Date(DATA_YEAR, 11, 31)
    });
    invertDateRange.removeAttr('checked');
    updateMap();
}

function resetTime() {
    startTime.val('');
    startTime.timepicker('option', {
        minTime: "0:00",
        maxTime: "24:00"
    });
    endTime.val('');
    endTime.timepicker('option', {
        minTime: "0:00",
        maxTime: "24:00"
    });
    invertTimeRange.removeAttr('checked');
    updateMap();
}

// filters widgets initialization
$(function () {
    startDate = $('#startDate');
    endDate = $('#endDate');
    startTime = $('#startTime');
    endTime = $('#endTime');
    invertDateRange = $('#invertDateRange');
    invertTimeRange = $('#invertTimeRange');
    injuryFilter = $('select#injuryFilter');

    startDate.datepicker({
        minDate: new Date(DATA_YEAR, 0, 1),
        maxDate: new Date(DATA_YEAR, 11, 31),
        dateFormat: 'd/m/y',
        onClose: function (selectedDate) {
            endDate.datepicker('option', 'minDate', selectedDate);
        }
    });

    endDate.datepicker({
        minDate: new Date(DATA_YEAR, 0, 1),
        maxDate: new Date(DATA_YEAR, 11, 31),
        dateFormat: 'd/m/y',
        onClose: function (selectedDate) {
            startDate.datepicker('option', 'maxDate', selectedDate);
        }
    });

    startTime.timepicker({
        timeFormat: 'H:i',
        show2400: true,
        minTime: "0:00",
        maxTime: "24:00"
    });
    startTime.on('changeTime', function () {
        endTime.timepicker('option', 'minTime', $(this).val());
    });

    endTime.timepicker({
        timeFormat: 'H:i',
        show2400: true,
        minTime: "0:00",
        maxTime: "24:00"
    });
    endTime.on('changeTime', function () {
        startTime.timepicker('option', 'maxTime', $(this).val());
    });
});