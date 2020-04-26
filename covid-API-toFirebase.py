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
class countryEntry:
    def __init__(self):
        self.country = ""
        self.confirmed = 0
        self.recovered = 0
        self.critical = 0
        self.deaths = 0
        self.coordinates = []
        self.listAvailable = []

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
        jointCountryDict = json.loads(response.text)

        # Parse dict to pass country name into country data request
        for key in jointCountryDict:
            countryDict: dict = key
            # print(countryDict)
            fullNamesOnly = {k: countryDict[k] for k in
                             countryDict.keys() - {'longitude', 'latitude', 'alpha3code', 'alpha2code'}}
            self.country = fullNamesOnly['name']
            self.listAvailable.append(fullNamesOnly['name'])


    # Function gets the country name, confirmed cases, recovered cases, critical cases, deaths, and latitude+logitude of
    # that country as JSON file
    # Will also upload parse file into dict to then set self attributes
    def getCountryData(self):
        url = "https://covid-19-data.p.rapidapi.com/country"

        for x in range(len(self.listAvailable)):
            querystring = {"format": "json", "name": self.listAvailable[x]}

            headers = {
                'x-rapidapi-host': "covid-19-data.p.rapidapi.com",
                'x-rapidapi-key': "96c11ee776msh19e72b3b7c301d4p1a4ea7jsnb47d1d1beb7d"
            }

            response = requests.request("GET", url, headers=headers, params=querystring)

            countryData: dict = json.loads(response.text)
            print(countryData)
            for key in countryData:
                # print(key)
                # print(countryData)
                # print(key)
                countryDict: dict = key
                # print(countryDict)
                # print(self.coordinates)
                # print(int(countryDict['confirmed']))
                # print( int(countryDict['recovered']))
                # print(int(countryDict['critical']))
                # print(int(countryDict['deaths']))
                # print(float(countryDict['latitude']))
                # print(float(countryDict['longitude']))

                self.country = countryDict['country']
                self.confirmed = int(countryDict['confirmed'])
                self.recovered = int(countryDict['recovered'])
                self.critical = int(countryDict['critical'])
                self.deaths = int(countryDict['deaths'])
                self.coordinates.clear()
                self.coordinates.append(float(countryDict['latitude']))
                self.coordinates.append(float(countryDict['longitude']))

                self.uploadData()


    # Set replaces, if we want to simply update instead of replacing our station we can use .

    def uploadData(self):

        ref_station_type = db.collection(u'Countries').document(u'' + self.country)

        countryData = {
            u'Timestamp': firestore.SERVER_TIMESTAMP,
            u'Type': u'Feature',
            u'Geometry': {
                u'Type': u'Point',
                u'Coordinates': self.coordinates,
                u'Properties': {
                    u'Country': self.country,
                    u'Confirmed cases': self.confirmed,
                    u'Recovered cases': self.recovered,
                    u'Critical cases': self.critical,
                    u'Deaths': self.deaths,
                    u'Coordinates': self.coordinates,
                }
            }
        }

        ref_station_type.set(countryData)


test = countryEntry()
test.getAvailableCountries()
test.getCountryData()