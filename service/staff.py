#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sys

import simplejson as json

from flask import Flask, jsonify, render_template
from flask.ext.sqlalchemy import SQLAlchemy

tags = ['Scientific staff', 'Tech+Adm staff', 'PhD student', 'Student', 'Guest', 'Former member']
groups = ['Ice and Climate', 'Meteorology', 'Oceanography']

# url_for('static', filename='style.css')

app = Flask(__name__)
app.debug = True
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///staff.sqlite3'
db = SQLAlchemy(app)

@app.template_filter('split')
def reverse_filter(s):
    return map(lambda(x): x.strip(), s.split(','))

class Person(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    firstname = db.Column(db.String)
    lastname = db.Column(db.String)
    title = db.Column(db.String)
    phone = db.Column(db.String)
    email = db.Column(db.String)
    description = db.Column(db.String)
    homepage = db.Column(db.String)
    picture = db.Column(db.String)
    address = db.Column(db.String)
    kuid = db.Column(db.Integer)
    tags = db.Column(db.String)
    groups = db.Column(db.String)

    def __init__(self, firstname, lastname, title, phone, email, description, homepage, picture, address, kuid, tags, groups):
        self.firstname = firstname
        self.lastname = lastname
        self.title = title
        self.phone = phone
        self.email = email
        self.description = description
        self.homepage = homepage
        self.picture = picture
        self.address = address
        self.kuid = kuid
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
    return render_template('businesscard.jinja2', persons = Person.query.order_by(Person.lastname).all())

@app.route('/get/<id>')
def get_single(id):
    p = Person.query.filter_by(id=id).first()
    return render_template('businesscard.jinja2', persons = [p])

@app.route('/json/all', methods=['GET'])
def json_all():
    p = Person.query.all()
    return repr(p)

@app.route('/json/<id>', methods=['GET'])
def json_single():
    p = Person.query.filter_by(id=id).first()
    return repr(p)

@app.route('/json/new', methods=['POST'])
def json_new():
    pass

def run():
    app.run()

def toutf8(x):
    if x:
        return x.decode('utf-8')
    return x

def stripquotes(x):
    if x:
        x = x.strip()
        if x.startswith('"') and x.endswith('"'):
            return x[1:-1]
    return x

if __name__ == '__main__':
    if '--db' in sys.argv:
        import csv

        db.drop_all()
        db.create_all()

        # db.session.add(Person('Rune Juhl Jacobsen', 'runejuhl@nbi.ku.dk', None, 410316, 'RF-346', "+45 6016 8337", 'Student', 'Ice and Climate'))
        # db.session.add(Person('Ellen Emme Chrillesen', 'ec@nbi.ku.dk', None, 8645, 'RF-229', '+45 353-20551', 'Tech+Adm staff', 'Ice and Climate'))
        # db.session.add(Person('Thomas Blunier', 'blunier@nbi.ku.dk', 'https://www2.adm.ku.dk/selv/pls/prt_www40.hentindhold_cms?p_personid=337115', 337115, 'RF-201', "+45 353-20584", 'Scientific staff', 'Ice and Climate'))
        # db.session.add(Person('Susanne Lilja Buchardt', 'lilja@gfy.ku.dk', 'https://www2.adm.ku.dk/selv/pls/prt_www40.hentindhold_cms?p_personid=181090', 181090, 'RF-201', "+45 353-20584", 'Scientific staff', 'Ice and Climate'))
        # db.session.add(Person('Viorela Gabriela Ciobanu', 'ciobanu@nbi.dk', None, 441353, 'RF-206', ' +45 353-20627', 'Scientific staff', 'Ice and Climate'))
        # db.session.add(Person('Ivana Cvijanovic', 'ivanacv@nbi.ku.dk', 'https://www2.adm.ku.dk/selv/pls/prt_www40.hentindhold_cms?p_personid=353050', 353050, None, '+45 28 40 57 82', 'Scientific staff', 'Ice and Climate'))
        # db.session.add(Person('Dorthe Dahl-Jensen', 'ddj@gfy.ku.dk', None, 45103, 'RF-316', '+45 353-20556', 'Scientific staff', 'Ice and Climate'))
        # db.session.add(Person('Peter Ditlevsen', 'pditlev@nbi.ku.dk', 'https://www2.adm.ku.dk/selv/pls/prt_www40.hentindhold_cms?p_personid=6225', 6225, 'RF-304', '+45 353-20603', 'Scientific staff', 'Ice and Climate'))
        # db.session.add(Person('Anne-Katrine Faber', 'akfaber@nbi.ku.dk', 'https://www2.adm.ku.dk/selv/pls/prt_www40.hentindhold_cms?p_personid=304875', 304875, 'RF-342', None, 'Student', 'Ice and Climate'))
        # # db.session.add(Person('', '', , '', '', '', '', 'Ice and Climate'))
        # # db.session.add(Person('', '', , '', '', '', '', 'Ice and Climate'))
        # # db.session.add(Person('', '', , '', '', '', '', 'Ice and Climate'))
        # # db.session.add(Person('', '', , '', '', '', '', 'Ice and Climate'))
        for e in csv.DictReader(open('../data/employees.csv', 'r')):
            attrs = (e['firstname'], e['lastname'], e['title'], e['phone'], e['email'], e['description'], e['homepage'], e['picture'], e['address'], e['kuid'], e['tags'], 'Ice and Climate')
            attrs = map(toutf8, attrs)
            attrs = map(stripquotes, attrs)
            print attrs
            db.session.add(Person(*attrs))

        db.session.commit()
    else:
        app.run()

