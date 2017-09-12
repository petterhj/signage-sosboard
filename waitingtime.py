# Imports
from datetime import datetime, timedelta
from dateutil.parser import parse
from flask.ext.sqlalchemy import SQLAlchemy


# Database
db = SQLAlchemy()


# Model: WaitingTime
class WaitingTime(db.Model):
    # Fields
    id      = db.Column(db.Integer, primary_key=True)
    station = db.Column(db.Unicode(60), nullable=False)
    hours   = db.Column(db.Float(), nullable=True)
    comment = db.Column(db.Unicode(40))
    created = db.Column(db.DateTime(), nullable=False)
    expires = db.Column(db.DateTime(), nullable=False)

    # Entry
    def __init__(self, station, hours, comment, created, expires):
        self.station    = unicode(station)
        self.hours      = hours
        self.comment    = unicode(comment)
        self.created    = created
        self.expires    = expires

    # Active
    def active(self):
        return parse(str(self.expires)) > datetime.now()

    # String representation
    def __repr__(self):
        return '%s: %dt' % (self.station, self.hours)


# Current waiting times
def get_current_waiting_times():
    # Current waiting times
    data = {
        'waiting_times': [],
        'success': False,
        'message': ''
    }
    
    try:
        current = db.session.query(WaitingTime)
        current = current.order_by(WaitingTime.created.desc())
        current = current.limit(20)
        # current.all()

        for wt in current:
            # Return if not expired
            if wt.active():
                data['waiting_times'].append({
                    'sid': wt.id,
                    'station': wt.station,
                    'hours': wt.hours,
                    'comment': wt.comment,
                    'created': wt.created,
                    'expires': wt.expires
                })
    
    except Exception, e:
        data['message'] = 'Could not get data (error: %s)' % (e)

    else:
        data['success'] = True

    # Return
    return data


# Get station names
def get_station_names(query):

    print 'QUERY:', query

    # Station names
    station_names = []
    
    stations = db.session.query(WaitingTime.station.distinct().label('station'))
    stations = stations.filter(WaitingTime.station.startswith(query))
    stations = stations.order_by(WaitingTime.station.asc())
    stations = stations.limit(100)
    station_names = [wt.station for wt in stations]

    return station_names


# Update waiting times
def update_waiting_times(data):
    # Status
    status = {'success': True, 'message': ''}

    # Insert
    if 'insert' in data and len(data['insert']) > 0:
        for entry in data['insert']:
            try:
                # New waiting time
                station = unicode(entry['title'])
                hours   = float(entry['hours']) if 'hours' in entry else None
                created = datetime.now()
                comment = unicode(entry['comment'])
                expires = datetime.now() + timedelta(hours=float(entry['expires']))

                wt = WaitingTime(station, hours, comment, created, expires)

                # Commit
                db.session.add(wt)
                db.session.commit()

            except Exception, e:
                status = {'success': False, 'message': 'Insert error: %s' % (e)}

    # Update
    if 'update' in data and len(data['update']) > 0:
        for entry in data['update']:
            try:
                # Get entry
                wt = db.session.query(WaitingTime).get(int(entry['sid']))
                
                if wt:
                    wt.station  = unicode(entry['title'])
                    wt.hours    = float(entry['hours']) if 'hours' in entry else None
                    wt.comment  = unicode(entry['comment'])
                    wt.expires  = parse(str(wt.created)) + timedelta(hours=float(entry['expires']))
                    
                    # Commit
                    db.session.commit()
            
            except Exception, e:
                # raise
                status = {'success': False, 'message': 'Update error: %s' % (e)}

    # Remove
    if 'remove' in data and len(data['remove']) > 0:
        for entry in data['remove']:
            try:
                # Get entry
                wt = db.session.query(WaitingTime).get(int(entry))

                if wt:
                    wt.expires = datetime.now()

                    # Commit
                    db.session.commit()

            except Exception, e:
                # raise
                status = {'success': False, 'message': 'Remove error: %s' % (e)}

    # Return status
    return (status['success'], status['message'])