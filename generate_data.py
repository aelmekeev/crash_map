# encoding: utf-8

import consts
import csv
import json

  
with open('data/coordinates_validated.csv', encoding='utf-8', mode='r') as input, open('data/data.js', encoding='utf-8', mode='w') as output:
  # open csv files
  csv_input = csv.reader(input, delimiter=',')
  
  json_output = []
  
  for row in csv_input:
    row_typed = []
    row_typed.append(row[consts.DATE])
    row_typed.append(row[consts.TIME])
    row_typed.append(row[consts.TYPE])
    row_typed.append(row[consts.LOCATION].replace('Республика Марий Эл, ', ''))
    row_typed.append(row[consts.STREET])
    row_typed.append(row[consts.HOUSE_NUMBER])
    row_typed.append(row[consts.ROAD])
    try:
      row_typed.append(int(row[consts.KILOMETER]))
    except:
      row_typed.append(0)
    try:
      row_typed.append(int(row[consts.METER]))
    except:
      row_typed.append(0)
    try:
      row_typed.append(float(row[consts.LONGITUDE]))
    except:
      row_typed.append(0)
    try:
      row_typed.append(float(row[consts.LATITUDE]))
    except:
      row_typed.append(0)
    row_typed.append(int(row[consts.DEATH]))
    row_typed.append(int(row[consts.DEATH_CHILDREN]))
    row_typed.append(int(row[consts.INJURY]))
    row_typed.append(int(row[consts.INJURY_CHILDREN]))
    row_typed.append(float(row[consts.LONGITUDE_GEOCODE]))
    row_typed.append(float(row[consts.LATITUDE_GEOCODE]))
    row_typed.append(int(row[consts.VALID]))
    row_typed.append(int(row[consts.VALID_STRICT]))
    json_output.append(row_typed)
    
  output.write('data=')
  output.write(json.dumps(json_output, ensure_ascii=False))
  output.write(';')