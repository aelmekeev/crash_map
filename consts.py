# encoding: utf-8

# input data constants

YOSHKAR_OLA = 'Республика Марий Эл, Йошкар-Ола'

# data indices
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
LONGITUDE_GEOCODE = 15
LATITUDE_GEOCODE = 16
VALID = 17
VALID_STRICT = 18

STREET_REPLACE_DICTIONARY = {
  'Кырля': 'Кырли',
  'Ленина пр-кт': 'Ленинский проспект',
  'Ленина пл': 'Ленинский проспект',
  'Л.Шевцовой': 'Шевцовой',
  'Панфилова пер': 'Панфилова улица',
  'Комсомольская пл': 'Комсомольская ул',
}

# coordinates grid borders

MARI_EL_WEST = 45.619745
MARI_EL_EAST = 50.200041
MARI_EL_SOUTH = 55.830512
MARI_EL_NORTH = 57.343631

YOSHKAR_OLA_WEST = 47.823484
YOSHKAR_OLA_EAST = 47.972560
YOSHKAR_OLA_SOUTH = 56.603073
YOSHKAR_OLA_NORTH = 56.669722

MAX_RADIUS = 0.0017

# Yandex API constants

YOSHKAR_OLA_YANDEX = 'Йошкар-Ола, Республика Марий Эл, Россия'
HOUSE_YANDEX = 'house'

