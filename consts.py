# encoding: utf-8

# input data constants

MARI_EL = 'Республика Марий Эл'
YOSHKAR_OLA = 'Республика Марий Эл, Йошкар-Ола'
VOLZHSK = 'Республика Марий Эл, Волжск'
VOLZHSK_ADM = 'Республика Марий Эл, Волжский район'
MOUNTIN = 'Республика Марий Эл, Горномарийский район'
ZVENIGOVO = 'Республика Марий Эл, Звениговский район'
KILEMARY = 'Республика Марий Эл, Килемарский район'
KUZHENER = 'Республика Марий Эл, Куженерский район'
TUREK = 'Республика Марий Эл, Мари-Турекский район'
MEDVEDEVO = 'Республика Марий Эл, Медведевский район'
MORKI = 'Республика Марий Эл, Моркинский район'
NEW_TORYAL = 'Республика Марий Эл, Новоторъяльский район'
ORSHANKA = 'Республика Марий Эл, Оршанский район'
PARANGA = 'Республика Марий Эл, Параньгинский район'
SERNUR = 'Республика Марий Эл, Сернурский район'
SOVETSKIY = 'Республика Марий Эл, Советский район'
YURINO = 'Республика Марий Эл, Юринский район'

ADMINISTRATIVE = [YOSHKAR_OLA, VOLZHSK, VOLZHSK_ADM, MOUNTIN, ZVENIGOVO, KILEMARY, KUZHENER, TUREK, MEDVEDEVO, MORKI, NEW_TORYAL, ORSHANKA, PARANGA, SERNUR, SOVETSKIY, YURINO]

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
  'Маркса пер': 'Маркса ул'
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

EARTH_MEAN_RADIUS = 6371000
MAX_DISTANCE = 150

# Yandex API constants

HOUSE_YANDEX = 'house'