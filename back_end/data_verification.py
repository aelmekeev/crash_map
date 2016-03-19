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


confused_coordinates = 0

def is_distance_valid(row):
  if row[consts.LATITUDE_GEOCODE] == '' or row[consts.LATITUDE] == '':
    return False
    
  lat = math.radians(float(row[consts.LATITUDE]))
  lat_geo = math.radians(float(row[consts.LATITUDE_GEOCODE]))
  long = math.radians(float(row[consts.LONGITUDE]))
  long_geo = math.radians(float(row[consts.LONGITUDE_GEOCODE]))

  distance = consts.EARTH_MEAN_RADIUS * math.acos(math.sin(lat) * math.sin(lat_geo) + math.cos(lat) * math.cos(lat_geo) * math.cos(long - long_geo))
  
  return distance < consts.MAX_DISTANCE

  
def reverse_geocoding(row):
  url = GEOCODING_URL_BASE + row[consts.LONGITUDE] + ',' + row[consts.LATITUDE]
  
  with urllib.request.urlopen(url) as response:
    try:
      json_response = json.loads(response.read().decode('utf-8'))['response']['GeoObjectCollection']['featureMember']
    except KeyError:
      return reverse_geocoding(row)
    
    for object in json_response:
      try:
        if row[consts.LOCATION] != consts.YOSHKAR_OLA and object['GeoObject']['metaDataProperty']['GeocoderMetaData']['AddressDetails']['Country']['AdministrativeArea']['AdministrativeAreaName'] == consts.MARI_EL:
          return True
      except KeyError:
        pass
      
  return False

 
def check_confused_coordinates(row):
  try:
    latitude = float(row[consts.LATITUDE])
    longitude = float(row[consts.LONGITUDE])
    if latitude < consts.MARI_EL_EAST and latitude > consts.MARI_EL_WEST and longitude < consts.MARI_EL_NORTH and longitude > consts.MARI_EL_SOUTH:
      row[consts.LATITUDE] = str(longitude)
      row[consts.LONGITUDE] = str(latitude)
      global confused_coordinates
      confused_coordinates += 1
  except:
    pass
  

# identify full list of dates for 2015 for accidents dates validation
dates_set = set()
actual_dates_set = set()
start_date = date.min.replace(2015)
for x in range(0, 365):
  date = start_date + datetime.timedelta(days = x)
  dates_set.add(date.strftime('%d.%m.%Y'))

with open('../data/input_geocoded.csv', encoding='utf-8', mode='r') as input, open('../data/input_verified.csv', encoding='utf-8', newline="\n", mode='w') as output:
  # open csv files
  input = csv.reader(input, delimiter=',')
  output = csv.writer(output, delimiter=',')
    
  invalid_time_counter = 0
  
  for row in input:
    actual_dates_set.add(row[consts.DATE])
    
    try:
      time.strptime(row[consts.TIME], '%H:%M')
    except ValueError:
      invalid_time_counter += 1

    # fix rows with confused latitude and longitude
    check_confused_coordinates(row)
      
    # parse latitude and longitude
    try:
      latitude = float(row[consts.LATITUDE])
      longitude = float(row[consts.LONGITUDE])
    except ValueError:
      latitude = longitude = 0

    # verify coordinates
    if row[consts.LOCATION] == consts.YOSHKAR_OLA and (longitude > consts.YOSHKAR_OLA_EAST or longitude < consts.YOSHKAR_OLA_WEST or latitude > consts.YOSHKAR_OLA_NORTH or latitude < consts.YOSHKAR_OLA_SOUTH):
      row.append(0)
    elif longitude > consts.MARI_EL_EAST or longitude < consts.MARI_EL_WEST or latitude > consts.MARI_EL_NORTH or latitude < consts.MARI_EL_SOUTH:
      row.append(0)
    else:
      if row[consts.LOCATION] != consts.YOSHKAR_OLA:
        if reverse_geocoding(row):
          row.append(1)
        else:
          row.append(0)
      else:
        row.append(1)        
    
    if row[-1] == 1 and is_distance_valid(row):
      row.append(1)
    else:
      row.append(0)
      
    output.writerow(row);

print('Количество данных с перепутанными местами координатами:', confused_coordinates, '\n')    
print('Количество пропущенных дней, в исходных данных:', len(dates_set.symmetric_difference(actual_dates_set)))
print('Количество данных с невалидным временем:', invalid_time_counter, '\n')