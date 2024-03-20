
import requests
from datetime import datetime
import json


class Database(object):

	def __init__(self, url, tableName):

		self.url = url
		self.tableName = tableName

	def updateSchema(self):
		pass

	def authenticate(self, username, password):
		url = self.url
		url += f"/login"

		payload = {'email':username, 'password':password}

		self.session = requests.Session()

		r = self.session.post(url, data=payload)

		self.headers = r.headers
		self.cookies = r.cookies

	def createTable(self, schemaDefinition):
		url = self.url
		url += f"/database/create"

		body = {}
		body['tableName'] = self.tableName
		body['schemaDefinition'] = json.dumps(schemaDefinition)

		r = requests.post(url, cookies=self.session.cookies.get_dict(), data=body)

	def deleteTable(self):
		url = self.url
		url += f"/database/delete"

		body = {}
		body['tableName'] = self.tableName

		r = requests.post(url, cookies=self.session.cookies.get_dict(), data=body)

	def put(self, dictRecord):

		url = self.url
		url += f"/database/put/{self.tableName}"

		body = {'data':dictRecord}

		body['data'] = json.dumps(body['data'])

		r = requests.post(url, cookies=self.session.cookies.get_dict(), data=body)

		print(r.text)


	def get(self):
		pass

	def query(self, queryType, queryField, queryString):

		url = self.url
		url += f"/database/query/{self.tableName}"

		body = {}

		body['queryType'] = queryType
		body['queryField'] = queryField
		body['queryString'] = queryString

		r = requests.post(url, cookies=self.session.cookies.get_dict(), data=body)

		response = json.loads(r.text)

		queryType = "Query Type: " + queryType + " \nQuery Search: " + queryString

		queryTimeString = "Query Time: " + response['queryTime']
		recordCountString = "Record Count: " + str(response['recordCount'])

		print(queryType)
		print(queryTimeString)
		print(recordCountString)

		return response['record']


	def update(self):
		pass
