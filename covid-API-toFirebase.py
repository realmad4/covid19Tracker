# get package information for firebase access to firestore type database
# get json and requests imported
import firebase_admin
import requests
from firebase_admin import credentials
from firebase_admin import firestore
import json

# get authorization and access to database
cred = credentials.Certificate("./covid-19-archive-cosc3810-firebase-adminsdk-f6ebs-6bfcc0fbbf.json")
default_app = firebase_admin.initialize_app(cred)

db = firestore.client()


# this creates a country entry in firestore
# noinspection PyMethodMayBeStatic
class countryEntry:
    def __init__(self):
        self.country = ""
        self.confirmed = []
        self.recovered = []
        self.critical = []
        self.deaths = []
        self.coordinates = []

    # creates a dictionary from json file received from API then hands to data retrieval then links back
    def getAvailableCountries(self):
        url = "https://covid-19-data.p.rapidapi.com/help/countries"

        querystring = {"format": "json"}

        headers = {
            'x-rapidapi-host': "covid-19-data.p.rapidapi.com",
            'x-rapidapi-key': "96c11ee776msh19e72b3b7c301d4p1a4ea7jsnb47d1d1beb7d"
        }

        response = requests.request("GET", url, headers=headers, params=querystring)
        # Dictionary made
        countryDict = json.loads(response.text)
        # Parse dict to pass country name into country data request
        for key in countryDict:
            newDict: dict = key
            fullNamesOnly = {k: newDict[k] for k in
                             newDict.keys() - {'longitude', 'latitude', 'alpha3code', 'alpha2code'}}
            self.country = fullNamesOnly['name']

    # Function gets the country name, confirmed cases, recovered cases, critical cases, deaths, and latitude+logitude of
    # that country as JSON file
    # Will also upload parse file into dict to then set self attributes
    def getCountryData(self):
        url = "https://covid-19-data.p.rapidapi.com/country"

        querystring = {"format": "json", "name": self.country}

        headers = {
            'x-rapidapi-host': "covid-19-data.p.rapidapi.com",
            'x-rapidapi-key': "96c11ee776msh19e72b3b7c301d4p1a4ea7jsnb47d1d1beb7d"
        }

        response = requests.request("GET", url, headers=headers, params=querystring)

        countryData = json.loads(response.text)
        print(countryData)
        self.confirmed = countryData['confirmed']
        self.recovered = countryData['recovered']
        self.critical = countryData['critical']
        self.deaths = countryData['deaths']
        self.coordinates = countryData['latitude'], countryData['longitude']

    # Set replaces, if we want to simply update instead of replacing our station we can use .


def uploadData():
    instance = countryEntry()
    instance.getAvailableCountries()
    instance.getCountryData()

    ref_station_type = db.collection(u'Countries').document(u'' + instance.country)

    countryData = {
        u'Timestamp': firestore.SERVER_TIMESTAMP,
        u'Type': u'Feature',
        u'Geometry': {
            u'Type': u'Point',
            u'Coordinates': instance.coordinates,
            u'Properties': {
                u'Country name:': instance.country,
                u'Confirmed cases:': instance.confirmed,
                u'Recovered cases:': instance.recovered,
                u'Critical cases:': instance.critical,
                u'Deaths:': instance.deaths,
                u'Coordinates:': instance.coordinates,
            }
        }
    }
    ref_station_type.set(countryData)


uploadData()
