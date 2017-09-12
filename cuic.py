# Imports
import requests
from BeautifulSoup import BeautifulStoneSoup

import config


# Class: CUIC
class CUIC:
	# Data
	def data(self):
		# Parse XML data as JSON
		data = {
			'queue': [],
			'success': False,
			'message': ''
		}

		# Get data
		try:
			if not config.DEBUG:
				xml = requests.get(config.DATA_URL, verify=False, timeout=config.TIMEOUT).text
			else:
				xml = open(config.DEBUG_FILE, 'r').read()

		except Exception, e:
			data['message'] = 'Could not get data (error: %s)' % (e)

		else:
			# Parse data
			try:
				for line in BeautifulStoneSoup(xml).findAll('row'):
					l = {}

					for column in line.findAll('column'):
						key = filter(lambda c: c.isalpha(), column['name'].lower())
						value = column.text
						l[key] = value
					
					l['prettyname'] = ' '.join(l['queuename'].split('_')[:-1])
					l['prettyname'] = l['prettyname'].upper() if len(l['prettyname']) == 3 else l['prettyname']

					data['queue'].append(l)

			except Exception, e:
				data['message'] = 'Could not parse telephone data (error: %s)' % (e)

			else:
				data['success'] = True

		# Return data
		return data


# Tests
if __name__ == '__main__':
	# CUIC
	cuic = CUIC()

	print cuic.data()