`
import requests
from bs4 import BeautifulSoup
from cloudApi import Database
import os

URL = "${startingURL}"

page = requests.get(URL)

soup = BeautifulSoup(page.content)

password = os.environ.get('PASS')

database = Database("http://localhost:8080", 'crawlerDB-${crawlerName}')
database.authenticate('${user.email}', password)

links = []

for a in soup.find_all('a', href=True):
    links.append(a['href'])
    record = {"webLink":a['href'], "linkLevel":"1"}
    database.put(record)

print(links)
`