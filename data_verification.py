import csv
import time
import datetime
from datetime import date

YOSHKAR_OLA = 'Республика Марий Эл, Йошкар-Ола'

# data indeces
DATE = 0
TIME = 1
TYPE = 2
LOCATION = 3
STREET = 4
HOUSE_NUMBER = 5
ROAD = 6
KILOMETER = 7
METER = 8
LONGITUDE = 9
LATITUDE = 10
DEATH = 11
DEATH_CHILDREN = 12
INJURY = 13
INJURY_CHILDREN = 14

MARI_EL_WEST = 45.619745
MARI_EL_EAST = 50.200041
MARI_EL_SOUTH = 55.830512
MARI_EL_NORTH = 57.343631

YOSHKAR_OLA_WEST = 47.823484
YOSHKAR_OLA_EAST = 47.972560
YOSHKAR_OLA_SOUTH = 56.603073
YOSHKAR_OLA_NORTH = 56.669722

# identify full list of dates for 2015 for accidents dates validation
dates_set = set()
actual_dates_set = set()
start_date = date.min.replace(2015)
for x in range(0, 365):
	date = start_date + datetime.timedelta(days = x)
	dates_set.add(date.strftime('%d.%m.%Y'))

with open('data/all.csv', encoding='utf-8', mode='r') as tsvin, open('incorrect_coordinates.csv', 'w') as incorrect_coordinates_out, open('incorrect_coordinates_yo.csv', 'w') as incorrect_coordinates_yo_out:
	tsvin = csv.reader(tsvin, delimiter=',')
	
	death_mari_el = 0
	death_yoshkar_ola = 0
	injury_mari_el = 0
	injury_yoshkar_ola = 0
	
	incorrect_coordinates = []
	incorrect_coordinates_yo = []
	
	invalid_time_counter = 0
	
	accidents = 0
	accidents_yo = 0
	
	for row in tsvin:
		accidents += 1

		actual_dates_set.add(row[DATE])
		
		try:
			time.strptime(row[TIME], '%H:%M')
		except ValueError:
			invalid_time_counter += 1
	
		# count overall deaths and injuries
		if row[DEATH] != '0':
			death_mari_el += int(row[DEATH])
		if row[INJURY] != '0':
			injury_mari_el += int(row[INJURY])

		# parse latitude and longitude
		try:
			latitude = float(row[LATITUDE])
			longitude = float(row[LONGITUDE])
		except ValueError:
			latitude = longitude = 0
		
		# verify coordinates
		if longitude > MARI_EL_EAST or longitude < MARI_EL_WEST or latitude > MARI_EL_NORTH or latitude < MARI_EL_SOUTH:
			incorrect_coordinates.append(row)
			
		if row[LOCATION] == YOSHKAR_OLA:
			accidents_yo += 1
		
			# count deaths and injuries for capital only
			if row[DEATH] != '0':
				death_yoshkar_ola += int(row[DEATH])
			if row[INJURY] != '0':
				injury_yoshkar_ola += int(row[INJURY])
			
			# verify coordinates for capital only
			if longitude > YOSHKAR_OLA_EAST or longitude < YOSHKAR_OLA_WEST or latitude > YOSHKAR_OLA_NORTH or latitude < YOSHKAR_OLA_SOUTH:
				incorrect_coordinates_yo.append(row)

	# summary
	print('Погибло в ДТП по республике в целом:', death_mari_el)
	print('Ранено в ДТП по республике в целом:', injury_mari_el)
	print('Погибло в ДТП по г. Йошкар-Ола:', death_yoshkar_ola)
	print('Ранено в ДТП по г. Йошкар-Ола:', injury_yoshkar_ola, '\n')
	
	print('Некорректных координат:', len(incorrect_coordinates))
	print('Некорректных координат для г. Йошкар-Ола:', len(incorrect_coordinates_yo), '\n')
	
	for row in incorrect_coordinates:
		incorrect_coordinates_out.write('%s\n' % ','.join(row))
		
	for row in incorrect_coordinates_yo:
		incorrect_coordinates_yo_out.write('%s\n' % ','.join(row))
	
	print('Количество данных с невалидными датами:', len(dates_set.symmetric_difference(actual_dates_set)))
	print('Количество данных с невалидным временем:', invalid_time_counter)
	print('Всего ДТП:', accidents)
	print('Всего ДТП по г. Йошкар-Ола:', accidents_yo)
