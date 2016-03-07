# encoding: utf-8

import consts
import csv
from datetime import datetime

YO = 1

accidents = [0, 0]
accidents_with_address = [0, 0]
accidents_with_address_geocoded = [0, 0]

accidents_death = [0, 0]
accidents_injury = [0, 0]
accidents_death_multiple = [0, 0]
accidents_injury_multiple = [0, 0]
death = [0, 0]
injury = [0, 0]

accidents_death_children = [0, 0]
accidents_injury_children = [0, 0]
accidents_death_multiple_children = [0, 0]
accidents_injury_multiple_children = [0, 0]
death_children = [0, 0]
injury_children = [0, 0]

incorrect_coordinates = [0, 0]
incorrect_coordinates_strict = [0, 0]

day_of_week = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']
day_of_week_stat = [[0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]]

month = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
month_days = [31, 28, 31, 30, 31, 30, 31, 30, 30, 31, 30, 31]
month_stat = [0] * 12

type_map = {}
adm_map = {}

easy_fall = 0


def get_day_of_week(date):
  return datetime.strptime(date, '%d.%m.%Y').weekday()


def analize_row(row, index):
  accidents[index] += 1
  
  day_of_week_stat[index][get_day_of_week(row[consts.DATE])] += 1
  
  if row[consts.TYPE] not in type_map:
    type_map[row[consts.TYPE]] = [0, 0]
  type_map[row[consts.TYPE]][index] += 1
  
  if row[consts.STREET] != '':
    accidents_with_address[index] += 1
    if row[consts.LATITUDE_GEOCODE] != '0':
      accidents_with_address_geocoded[index] += 1

  count_injuries(row, index)
     
  if row[consts.VALID] != '1':
    incorrect_coordinates[index] += 1
  if row[consts.STREET] != '' and row[consts.VALID_STRICT] != '1':
    incorrect_coordinates_strict[index] += 1

    
def count_injuries(row, index):
  if row[consts.DEATH] != '0':
    deaths = int(row[consts.DEATH])
    accidents_death[index] += 1
    death[index] += deaths
    if deaths > 1:
      accidents_death_multiple[index] += 1
      
  if row[consts.DEATH_CHILDREN] != '0':
    accidents_death_children[index] += 1
    death_children[index] += int(row[consts.DEATH_CHILDREN])

  if row[consts.INJURY] != '0':
    injuries = int(row[consts.INJURY])
    accidents_injury[index] += 1
    injury[index] += injuries
    if injuries > 1:
      accidents_injury_multiple[index] += 1

  if row[consts.INJURY_CHILDREN] != '0':
    injuries = int(row[consts.INJURY_CHILDREN])
    accidents_injury_children[index] += 1
    injury_children[index] += injuries
    if injuries > 1:
      accidents_injury_multiple_children[index] += 1
 
    

def print_location_statistics(index):
  overall_percentage = ''
  if index != 0:
    overall_percentage = get_percentege(accidents[index], accidents[0])
  print('Всего ДТП:', accidents[index], overall_percentage, '\n')

  print('\nСтатистика по пострадавшим\n')
  
  print('ДТП с пострадавшими:', accidents_injury[index], get_percentege(accidents_injury[index], accidents[index]))
  print('ДТП с более чем одним пострадавшим:', accidents_injury_multiple[index], get_percentege(accidents_injury_multiple[index], accidents_injury[index]))
  print('Пострадало в ДТП:', injury[index], '\n')
  
  print('ДТП с погибшими:', accidents_death[index], get_percentege(accidents_death[index], accidents[index]))
  print('ДТП с более чем одним погибшим:', accidents_death_multiple[index], get_percentege(accidents_death_multiple[index], accidents_death[index]))
  print('Погибло в ДТП:', death[index], '\n')

  print('ДТП с пострадавшими детьми:', accidents_injury_children[index], get_percentege(accidents_injury_children[index], accidents[index]))
  print('ДТП с более чем одним пострадавшим ребёнком:', accidents_injury_multiple_children[index], get_percentege(accidents_injury_multiple_children[index], accidents_injury_children[index]))
  print('Пострадало детей в ДТП:', injury_children[index], '\n')
  
  print('ДТП с погибшими детьми:', accidents_death_children[index], get_percentege(accidents_death_children[index], accidents[index]))
  print('Погибло детей в ДТП:', death_children[index], '\n')
  
  print('\nСтатистика по типам ДТП\n')
  
  sorted_type_map = sorted(type_map.items(), key=lambda x: x[1][index], reverse=True)
  for type in sorted_type_map:
    print(type[0], ' - ', type[1][index], get_percentege(type[1][index], accidents[index]))

  print('\n\nСтатистика по валидности исходных данных\n')
  
  print('Всего ДТП с адресами:', accidents_with_address[index], get_percentege(accidents_with_address[index], accidents[index]))
  print('Всего ДТП с адресами, которые удалось геокодировать:', accidents_with_address_geocoded[index], get_percentege(accidents_with_address_geocoded[index], accidents_with_address[index]), '\n')

  print('Координат, не попадающих на территорию:', incorrect_coordinates[index], get_percentege(incorrect_coordinates[index], accidents[index]))
  print('Координат, не попадающих в окружность радиусом 150 метров вокруг указанного в данных адреса:', incorrect_coordinates_strict[index], get_percentege(incorrect_coordinates_strict[index], accidents_with_address[index]), '\n')

  
def print_day_of_week_stat(index):
  for day in range(7):
    print(day_of_week[day] + ':', day_of_week_stat[index][day], get_percentege(day_of_week_stat[index][day], accidents[index]))
  

def get_percentege(part, whole):
  percentege = '0'
  if whole > 0:
    percentege = str(round(part * 100 / whole, 2))
  return '(' + percentege + '%)'

  
with open('../data/input_verified.csv', encoding='utf-8', mode='r') as input:
  # open csv files
  input = csv.reader(input, delimiter=',')
  
  for row in input:
    analize_row(row, 0)
    
    if row[consts.LOCATION] == consts.YOSHKAR_OLA:
      analize_row(row, YO)

    month_stat[int(row[consts.DATE][3:5]) - 1] += 1
    
    if row[consts.TYPE] == 'Падение пассажира' and row[consts.INJURY] == '0':
      easy_fall += 1

    for adm in consts.ADMINISTRATIVE:
      if row[consts.LOCATION].startswith(adm):
        if adm not in adm_map:
          adm_map[adm] = 0
        adm_map[adm] += 1
      

print('Республика Марий Эл:\n')

sorted_adm_map = sorted(adm_map.items(), key=lambda x: x[1], reverse=True)
for adm in sorted_adm_map:
  print(adm[0].split(', ')[1], ' - ', adm[1], get_percentege(adm[1], accidents[0]))

print_location_statistics(0)
  
print('\n\nг. Йошкар-Ола:\n')
print_location_statistics(YO)

print('\n\nПрочее:\n')

print('\nСтатистика ДТП по дням недели:\n')
print('Республика Марий Эл:\n')
print_day_of_week_stat(0)
print('\n\nг. Йошкар-Ола:\n')
print_day_of_week_stat(YO)

print('\nСтатистика ДТП по месяцам:\n')
for month_index in range(12):
  print(month[month_index] + ':', round(month_stat[month_index] / month_days[month_index], 2))
  
print('\nКоличество ДТП типа "Падение пассажира" без пострадавших:', easy_fall, get_percentege(easy_fall, type_map['Падение пассажира'][0]), '\n')