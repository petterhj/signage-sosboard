#!/usr/bin/python
# -*- coding: utf-8 -*-

# Imports
from flask import Flask, request, jsonify, render_template
from waitingtime import db, WaitingTime, get_current_waiting_times, get_station_names, update_waiting_times
from cuic import CUIC
import os.path
import config


# App
app = Flask(__name__)

# Database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///%s' % (config.SQLITE_DATABASE)
db.init_app(app)

if os.path.isfile(config.SQLITE_DATABASE):
    # Create datbase if not exists
    with app.app_context():
        db.create_all()


# Route: Index
@app.route('/')
def index():
    # Render
    return render_template('index.html', debug=config.DEBUG)


# Route: Telephone queue
@app.route('/json/telephonequeue')
def queue():
    # Return JSON data
    return jsonify(**CUIC().data())


# Route: Messages
@app.route('/json/waittimes')
def waittimes():
    # Return JSON data
    return jsonify(**get_current_waiting_times())


# Route: Stations
@app.route('/json/stations/<query>')
def stations(query):
    # Return JSON data
    return jsonify(**{'suggestions': get_station_names(query)})


# Route: Update waitig times
@app.route('/update/waittimes', methods=['POST'])
def update_wait():
    # status
    status = {'success': False, 'message': ''}

    try:
        # Posted data
        data = request.get_json(force=True)
        print data
    except:
        status['message'] = 'Could not parse posted data'
    else:
        # Update
        result = update_waiting_times(data)

        status['success'] = result[0]
        status['message'] = result[1]

    return jsonify(**status)


# Main
if __name__ == '__main__':
    app.debug = config.DEBUG
    app.run(host='0.0.0.0', port=8000)