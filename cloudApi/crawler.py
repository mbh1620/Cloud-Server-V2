
import requests
from datetime import datetime
import json

class Crawler:

	def __init__(self, url, crawlerName, crawlerType, startingUrl, maxNumberOfLevels, outputType, codeBlock):

		self.url = url
		self.crawlerName = crawlerName
		self.crawlerType = crawlerType
		self.startingUrl = startingUrl
		self.maxNumberOfLevels = maxNumberOfLevels
		self.outputType = outputType
		self.codeBlock = codeBlock

	def authenticate(self, username, password):

		url = self.url
		url += f"/login"

		payload = {'email':username, 'password':password}

		self.session = requests.Session()

		r = self.session.post(url, data=payload)

		self.headers = r.headers
		self.cookies = r.cookies

	def createCrawler(self):
		
		url = self.url
		url += f"/crawlers/create"

		payload = {'crawlerType':self.crawlerType, 'crawlerName':self.crawlerName, 'startingUrl':self.startingUrl,
		'maxNumberOfLevels':self.maxNumberOfLevels, 'outputType':self.outputType, 'codeBlock':self.codeBlock}

		r = requests.post(url, cookies=self.session.cookies.get_dict(), data=body)

	def runCrawler(self):
		
		url = self.url
		url += f"/crawlers/run"

	def editCrawler(self):
		
		url = self.url
		url += f"/crawlers/edit"

