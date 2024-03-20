
import requests 
from datetime import datetime
import json 

class Workflow:

	def __init__(self, url, workflowName):

		self.url = url
		self.workflowName = workflowName

	def authenticate(self, username, password):
		url = self.url
		url += f"/login"

		payload = {'email':username, 'password':password}

		self.session = requests.Session()

		r = self.session.post(url, data=payload)

		self.headers = r.headers
		self.cookies = r.cookies

	def createWorkflow(self, schedule, codeContent):
		url = self.url
		url += f"/workflows/save"

		body = {}

		body['name'] = self.workflowName
		body['schedule'] = schedule
		body['content'] = codeContent

		r = requests.post(url, cookies=self.session.cookies.get_dict(), data=body)

	def runWorkflow(self, workflowDictionary):
		url = self.url 
		url += f"/workflows/test"

		workflowObject = json.dumps(workflowDictionary)

		body = {}
		body['workflow'] = workflowObject

		r = requests.post(url, cookies=self.session.cookies.get_dict(), data=body)

	def updateWorkflow(self, workflowName):

		'''
		This is not yet implemented because the route to edit a workflow is not implemented.

		Currently the method is to use the save workflow route to overwrite (not a good way).
		'''

		pass

	def deleteWorkflow(self, workflowName):
		url = self.url
		url += f"/workflows/delete"

		body = {}

		body['workflow'] = workflowName
		r = requests.post(url, cookies=self.session.cookies.get_dict(), data=body)




