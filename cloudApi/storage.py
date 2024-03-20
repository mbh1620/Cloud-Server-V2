
import requests
from datetime import datetime
import json


class Storage:

	def __init__(self, url):
		self.url = url

	def authenticate(self, username, password):
		url = self.url
		url += f"/login"

		self.username = username

		payload = {'email':username, 'password':password}

		self.session = requests.Session()

		r = self.session.post(url, data=payload)

		self.headers = r.headers
		self.cookies = r.cookies

	def searchDirectory(self, username, filePath):
	
		url = self.url
		url += f"/searchdir"

		currentPath = f'./public/{username}/{filePath}'

		body = {"currentPath":currentPath}

		r = self.session.post(url, data=body)

		content = json.loads(r.content)

		for i in content:
			print(i['filename'])

	def createNewDirectory(self, newFileName, username, filePath):
		
		url = self.url
		url += f"/newfolder"

		currentPath = f'./public/{username}/{filePath}'

		body = {"currentPath": currentPath, "name": newFileName}

		r = self.session.post(url, data=body)

	def uploadFile(self, fileName, username, fileDestination):
		
		#Upload a file to the server at the specified location, (more security is required in the server to stop people from pushing to other users files)
		'''
		This function could be used to batch upload from a directory when uploading from a memory stick to automate the process and not have to do it manually etc..

		'''
		url = self.url
		url += f"/uploadfile"

		with open(fileName, 'rb') as f:
			files = {'fileElem':f}
			body = {'filename':fileName, 'currentPath':f'{fileDestination}'} #Server needs to change the file upload function so that only the path after the user is to be defined.
			r = self.session.post(url, files=files, data=body)
			print("file uploaded to - " + f"/public/{username}/{fileDestination}")

	def downloadFile(self, fileName):
	
		pass

	def deleteFile(self, username, fileNameToDelete, filePath):
		
		url = self.url
		url += f"/deletedir"

		currentPath = f'./public/{username}/{filePath}'
		body = {"currentPath": currentPath, "name": fileNameToDelete}

		r = self.session.post(url, data=body)












