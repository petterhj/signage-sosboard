# Imports
import os

# General
DEBUG 				= True
TIMEZONE			= 'Europe/Oslo'

# CUIC
HOST 				= ''
PORT 				= ''
VIEWID 				= '1234425ECA213D4FC6123...'
UUID 				= '9feaf-1f8a...'
DEBUG_FILE			= os.path.join(os.path.dirname(__file__), 'report.demo.example.xml')
BASE_URL			= 'https://%s:%s/cuic/permalink/PermalinkViewer.htmx?viewId=%s&viewType=Grid&uuid=%s'
XML_URL 			= BASE_URL + '&linkType=xmlType'
DATA_URL			= XML_URL % (HOST, PORT, VIEWID, UUID) if not DEBUG else DEBUG_FILE
TIMEOUT				= 3

# Database
SQLITE_DATABASE 	= os.path.join(os.path.dirname(__file__), 'database.db')