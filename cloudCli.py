from cloudApi import *
import sys
import argparse
from getpass import getpass

#https://realpython.com/command-line-interfaces-python-argparse/
#https://docs.python.org/dev/library/argparse.html#sub-commands

parser = argparse.ArgumentParser()

subparsers = parser.add_subparsers(help='sub-command help')

#Create the parser for the "database" command

def authenticate():
	databaseObj = Database("http://192.168.2.12:8080", "default")
	user = input("Please enter user: ")
	password = getpass("Please enter password: ")
	databaseObj.authenticate(user, password)
	print("Authenticated Successfully!")

parser_database = subparsers.add_parser('database', help='database_help')
parser_database.add_argument('', action=authenticate()) #Argument takes in data
parser_database.add_argument('', action=createTable())


