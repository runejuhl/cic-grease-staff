#!/usr/bin/env python
import sys

import simplejson as json

from flask import Flask, jsonify, render_template
from flask.ext.sqlalchemy import SQLAlchemy

tags = ['Scientific staff', 'Tech+Adm staff', 'PhD students', 'Students', 'Guests', 'Former members']
groups = ['Ice and Climate', 'Meteorology', 'Oceanography']

# url_for('static', filename='style.css')

app = Flask(__name__)
app.debug = True
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////home/runejuhl/projects/staff/service/staff.sqlite3'
db = SQLAlchemy(app)

@app.template_filter('split')
def reverse_filter(s):
    return map(lambda(x): x.strip(), s.split(','))

class Person(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    email = db.Column(db.String)
    image_src = db.Column(db.String)
    kuid = db.Column(db.Integer)
    room = db.Column(db.String)
    phone = db.Column(db.String)
    tags = db.Column(db.String)
    groups = db.Column(db.String)

    def __init__(self, name, email, image_src, kuid, room, phone, tags, groups):
        self.name = name
        self.email = email
        self.image_src = image_src
        self.kuid = kuid
        self.room = room
        self.phone = phone
        self.tags = tags
        self.groups = groups

    def __repr__(self):
        return json.dumps({
            'id'                : self.id,
            'name'              : self.name,
            'email'             : self.email,
            'image_src'         : self.image_src,
            'kuid'              : self.kuid,
            'room'              : self.room,
            'phone'             : self.phone,
            'tags'              : self.tags,
            'groups'            : self.groups,
        })

@app.route('/')
def index():
    print Person.query.all().join(tag)
    return render_template('businesscard.jinja2', person = Person.query.all())

@app.route('/get/all')
def get_all():
    # return jsonify(all = [i.serialize for i in Person.query.all()])
    return render_template('businesscard.jinja2', persons = Person.query.order_by(Person.name).all())

@app.route('/get/<id>')
def get_single(id):
    p = Person.query.filter_by(id=id).first()
    return render_template('businesscard.jinja2', persons = [p])

def run():
    app.run()

if __name__ == '__main__':
    if '--db' in sys.argv:
        db.drop_all()
        db.create_all()

        db.session.add(Person('Rune Juhl Jacobsen', 'runejuhl@nbi.ku.dk', None, 410316, 'RF-346', "+45 6016 8337", 'Student', 'Ice and Climate'))
        db.session.add(Person('Ellen Emme Chrillesen', 'ec@nbi.ku.dk', None, 8645, 'RF-229', '+45 353-20551', 'Tech+Adm staff', 'Ice and Climate'))
        db.session.add(Person('Thomas Blunier', 'blunier@nbi.ku.dk', 'https://www2.adm.ku.dk/selv/pls/prt_www40.hentindhold_cms?p_personid=337115', 337115, 'RF-201', "+45 353-20584", 'Scientific staff', 'Ice and Climate'))
        db.session.add(Person('Susanne Lilja Buchardt', 'lilja@gfy.ku.dk', 'https://www2.adm.ku.dk/selv/pls/prt_www40.hentindhold_cms?p_personid=181090', 181090, 'RF-201', "+45 353-20584", 'Scientific staff', 'Ice and Climate'))
        db.session.add(Person('Viorela Gabriela Ciobanu', 'ciobanu@nbi.dk', None, 441353, 'RF-206', ' +45 353-20627', 'Scientific staff', 'Ice and Climate'))
        db.session.add(Person('Ivana Cvijanovic', 'ivanacv@nbi.ku.dk', 'https://www2.adm.ku.dk/selv/pls/prt_www40.hentindhold_cms?p_personid=353050', 353050, None, '+45 28 40 57 82', 'Scientific staff', 'Ice and Climate'))
        db.session.add(Person('Dorthe Dahl-Jensen', 'ddj@gfy.ku.dk', None, 45103, 'RF-316', '+45 353-20556', 'Scientific staff', 'Ice and Climate'))
        db.session.add(Person('Peter Ditlevsen', 'pditlev@nbi.ku.dk', 'https://www2.adm.ku.dk/selv/pls/prt_www40.hentindhold_cms?p_personid=6225', 6225, 'RF-304', '+45 353-20603', 'Scientific staff', 'Ice and Climate'))
        db.session.add(Person('Anne-Katrine Faber', 'akfaber@nbi.ku.dk', 'https://www2.adm.ku.dk/selv/pls/prt_www40.hentindhold_cms?p_personid=304875', 304875, 'RF-342', None, 'Student', 'Ice and Climate'))
        # db.session.add(Person('', '', , '', '', '', '', 'Ice and Climate'))
        # db.session.add(Person('', '', , '', '', '', '', 'Ice and Climate'))
        # db.session.add(Person('', '', , '', '', '', '', 'Ice and Climate'))
        # db.session.add(Person('', '', , '', '', '', '', 'Ice and Climate'))
        db.session.commit()

    app.run()

