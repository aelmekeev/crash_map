# encoding: utf-8

import consts
import csv
import math
import time
import datetime
from datetime import date
import json
import urllib.parse
import urllib.request

GEOCODING_URL_BASE = 'https://geocode-maps.yandex.ru/1.x/?format=json&geocode='


def is_distance_valid(row):
  if row[consts.LATITUDE_GEOCODE] == '' or row[consts.LATITUDE] == '':
    return False
    
  lat = float(row[consts.LATITUDE])
  lng = float(row[consts.LONGITUDE])
  geo_lat = float(row[consts.LATITUDE_GEOCODE])
  geo_lng = float(row[consts.LONGITUDE_GEOCODE])
  distance = math.sqrt(math.pow(geo_lat - lat, 2) + math.pow(geo_lng - lng, 2))
  
  return distance < consts.MAX_RADIUS

  
def reverse_geocoding(row):
  url = GEOCODING_URL_BASE + row[consts.LONGITUDE] + ',' + row[consts.LATITUDE]
  
  with urllib.request.urlopen(url) as response:
    json_response = json.loads(response.read().decode('utf-8'))['response']['GeoObjectCollection']['featureMember']
    
    for object in json_response:
      try:
        if row[consts.LOCATION] != consts.YOSHKAR_OLA and object['GeoObject']['metaDataProperty']['GeocoderMetaData']['AddressDetails']['Country']['AdministrativeArea']['AdministrativeAreaName'] == consts.MARI_EL:
          return True
      except KeyError:
        pass

  print(url)
        
  return False

  
# identify full list of dates for 2015 for accidents dates validation
dates_set = set()
actual_dates_set = set()
start_date = date.min.replace(2015)
for x in range(0, 365):
  date = start_date + datetime.timedelta(days = x)
  dates_set.add(date.strftime('%d.%m.%Y'))

with open('data/geocoding_output_yandex.csv', encoding='utf-8', mode='r') as input, open('data/coordinates_validated.csv', encoding='utf-8', newline="\n", mode='w') as output:
  # open csv files
  input = csv.reader(input, delimiter=',')
  output = csv.writer(output, delimiter=',')
  
  death_mari_el = 0
  death_yoshkar_ola = 0
  injury_mari_el = 0
  injury_yoshkar_ola = 0
  
  incorrect_coordinates = 0
  incorrect_coordinates_yo = 0
  
  invalid_time_counter = 0
  
  accidents = 0
  accidents_yo = 0
  
  for row in input:
    accidents += 1

    actual_dates_set.add(row[consts.DATE])
    
    try:
      time.strptime(row[consts.TIME], '%H:%M')
    except ValueError:
      invalid_time_counter += 1

      
    # count overall deaths and injuries
    if row[consts.DEATH] != '0':
      death_mari_el += int(row[consts.DEATH])
    if row[consts.INJURY] != '0':
      injury_mari_el += int(row[consts.INJURY])

    if row[consts.LOCATION] == consts.YOSHKAR_OLA:
      accidents_yo += 1
    
      # count deaths and injuries for capital only
      if row[consts.DEATH] != '0':
        death_yoshkar_ola += int(row[consts.DEATH])
      if row[consts.INJURY] != '0':
        injury_yoshkar_ola += int(row[consts.INJURY])

      
    # parse latitude and longitude
    try:
      latitude = float(row[consts.LATITUDE])
      longitude = float(row[consts.LONGITUDE])
    except ValueError:
      latitude = longitude = 0
    
    # verify coordinates
    if row[consts.LOCATION] == consts.YOSHKAR_OLA and (longitude > consts.YOSHKAR_OLA_EAST or longitude < consts.YOSHKAR_OLA_WEST or latitude > consts.YOSHKAR_OLA_NORTH or latitude < consts.YOSHKAR_OLA_SOUTH):
      incorrect_coordinates_yo += 1
      incorrect_coordinates += 1
      row.append(0)
    elif longitude > consts.MARI_EL_EAST or longitude < consts.MARI_EL_WEST or latitude > consts.MARI_EL_NORTH or latitude < consts.MARI_EL_SOUTH:
      incorrect_coordinates += 1
      row.append(0)
    else:
      if row[consts.LOCATION] != consts.YOSHKAR_OLA:
        if reverse_geocoding(row):
          row.append(1)
        else:
          incorrect_coordinates += 1
          row.append(0)
      else:
        row.append(1)        
    
    if is_distance_valid(row):
      row.append(1)
    else:
      row.append(0)
      
    output.writerow(row);

      
  # summary
  print('Погибло в ДТП по республике в целом:', death_mari_el)
  print('Ранено в ДТП по республике в целом:', injury_mari_el)
  print('Погибло в ДТП по г. Йошкар-Ола:', death_yoshkar_ola)
  print('Ранено в ДТП по г. Йошкар-Ола:', injury_yoshkar_ola, '\n')
  
  print('Некорректных координат:', incorrect_coordinates)
  print('Некорректных координат для г. Йошкар-Ола:', incorrect_coordinates_yo, '\n')
  
  print('Количество данных с невалидными датами:', len(dates_set.symmetric_difference(actual_dates_set)))
  print('Количество данных с невалидным временем:', invalid_time_counter, '\n')
  
  print('Всего ДТП:', accidents)
  print('Всего ДТП по г. Йошкар-Ола:', accidents_yo)