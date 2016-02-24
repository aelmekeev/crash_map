# encoding: utf-8

import consts
import csv
import json
import urllib.parse
import urllib.request

API_KEY = 'AIzaSyDgrd4VG32rgsrz1MG1cTufU9ZzYVrqHWo'
GEOCODING_URL_BASE = 'https://maps.googleapis.com/maps/api/geocode/json?key=' + API_KEY + '&address='

new_input = []

with open('data/geocoding_input.csv', encoding='utf-8', mode='r') as input, open('data/geocoding_output.csv', encoding='utf-8', newline="\n", mode='a') as geocoding_output:
  # open csv files
  input = csv.reader(input, delimiter=',')
  output = csv.writer(geocoding_output, delimiter=',')

  proceed_with_geocoding = True
  
  for row in input:
    if proceed_with_geocoding:
      if row[consts.STREET] != '':
        url = GEOCODING_URL_BASE + urllib.parse.quote(' '.join([row[consts.LOCATION], row[consts.STREET], row[consts.HOUSE_NUMBER]]))
        
        with urllib.request.urlopen(url) as response:
          json_response = json.loads(response.read().decode('utf-8'))
          status = json_response['status']
          
          if status == 'OK' and len(json_response['results']) == 1:
            location = json_response['results'][0]['geometry']['location']
            row.extend([location['lng'], location['lat']])
          elif status == 'ZERO_RESULTS' or len(json_response['results']) > 1:
            row.extend([0, 0])
          else:
            print('Last request was completed with a status:', status)
            new_input.append(row)
            proceed_with_geocoding = False
            continue
      else:
        row.extend([0, 0])
      
      output.writerow(row)
    else:
      new_input.append(row)
      
      
with open('data/geocoding_input.csv', encoding='utf-8', newline="\n", mode='w') as input:
  input_writer = csv.writer(input, delimiter=',')
  input_writer.writerows(new_input)