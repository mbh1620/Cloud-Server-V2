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
    
for a in soup.find_all('img', src=True):
    links.append(a['src'])
    record = {"webLink":a['src'], "linkLevel":"1"}
    database.put(record)
    
print(links)`