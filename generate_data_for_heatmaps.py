# encoding: utf-8

import consts
import csv
import os


def generate_data(csv_input, output, function_name, location, condition, is_geocoded):
  if is_geocoded:
    latitude_index = consts.LATITUDE_GEOCODE
    longitude_index = consts.LONGITUDE_GEOCODE
  else:
    latitude_index = consts.LATITUDE
    longitude_index = consts.LONGITUDE

  output.write('function ' + function_name + '(){return [')
  first = True
  for row in csv_input:
    if location == None or row[consts.LOCATION] == location:
      is_valid = False
      
      if condition == consts.VALID or condition == consts.VALID_STRICT:
        is_valid = row[condition] == '1'
      elif condition == consts.LATITUDE_GEOCODE:
        is_valid = row[condition] != '0'
  
      if is_valid:
        if first:
          first = False
        else:
          output.write(',')
        output.write('[' + row[latitude_index] + ',' + row[longitude_index] + ']')
  output.write(']};')
  input.seek(0)

  
with open('data/coordinates_validated.csv', encoding='utf-8', mode='r') as input, open('data/heatmaps_data.txt', encoding='utf-8', mode='w') as output:
  # open csv files
  csv_input = csv.reader(input, delimiter=',')
  
  # all Yoshkar-Ola points
  generate_data(csv_input, output, 'getAllYoPoints', consts.YOSHKAR_OLA, consts.VALID, False)
  
  # all Yoshkar-Ola geocoded points
  generate_data(csv_input, output, 'getAllYoGeocodedPoints', consts.YOSHKAR_OLA, consts.LATITUDE_GEOCODE, True)
  
  # all Yoshkar-Ola points with valid coordinates
  generate_data(csv_input, output, 'getAllYoGeocodedValidPoints', consts.YOSHKAR_OLA, consts.VALID_STRICT, False)
  
  # all region points
  generate_data(csv_input, output, 'getAllPoints', None, consts.VALID, False)
  
  # all region geocoded points
  generate_data(csv_input, output, 'getAllGeocodedPoints', None, consts.LATITUDE_GEOCODE, True)
  
  # all region points with valid coordinates
  generate_data(csv_input, output, 'getAllGeocodedValidPoints', None, consts.VALID_STRICT, False)