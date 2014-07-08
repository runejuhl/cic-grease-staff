#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sys

import simplejson as json

from flask import Flask, jsonify, render_template
from flask.ext.sqlalchemy import SQLAlchemy
from flask import request

from ObviusUpdate import ObviusUpdate

import csv, codecs, cStringIO

UPLOAD_FOLDER = '/tmp'
ALLOWED_EXTENSIONS = set(['csv'])

# tags = ['Scientific staff', 'Tech+Adm staff', 'PhD student', 'Student', 'Guest', 'Former member']
# groups = ['Ice and Climate', 'Meteorology', 'Oceanography']

# url_for('static', filename='style.css')

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.debug = True
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///staff.sqlite3'
db = SQLAlchemy(app)

@app.template_filter('split')
def reverse_filter(s):
    return map(lambda(x): x.strip(), s.split(','))

class Person(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    # lastname = db.Column(db.String)
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

    def __init__(self, name, title, phone, email, description, homepage, picture, address, kuid, tags, groups):
        self.name = name
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

    # def __repr__(self):
    #     return json.dumps({
    #         'id'                : self.id,
    #         'name'              : self.name,
    #         'email'             : self.email,
    #         'image_src'         : self.image_src,
    #         'kuid'              : self.kuid,
    #         'room'              : self.room,
    #         'phone'             : self.phone,
    #         'tags'              : self.tags,
    #         'groups'            : self.groups,
    #     })


@app.route('/get/all')
def get_all():
    # return jsonify(all = [i.serialize for i in Person.query.all()])
    p = Person.query.all()
    p = [{'name': 'omg'}]
    return render_template('businesscard.jinja2', persons = p)

@app.route('/get/<id>')
def get_single(id):
    p = Person.query.filter_by(id=id).first()
    return render_template('businesscard.jinja2', persons = [p])

@app.route('/edit/<id>', methods=['POST', 'GET'])
def edit_single(id):
    p = Person.query.filter_by(id=id).first()
    return render_template('single.jinja2', person = p)

@app.route('/', methods=['POST', 'GET'])
def update():

    if request.method == 'GET':
        return render_template('upload.jinja2')

    if request.method == 'POST':
        people =  csv_to_people(request.files['file'])

        content = render_template('businesscard.jinja2', persons = people)
        print "PEOPLE!!!!!!"
        print people
        # print content

        return
        header = '<script type="text/javascript">\n'
        header += open('static/staff.js', 'r').read()
        header += '</script>\n'
        header += '<style type="text/css">\n'
        header += open('static/style.css', 'r').read()
        header += '</style>\n'


        URL = 'http://cms.ku.dk/admin/nat-sites/nbi-sites/cik/english/test-rune/'
        SESSID = '732c50ab1b73a497d68d4470e2792ddc'

        o = ObviusUpdate(URL, SESSID)
        resp = o.update(content, header)
        if resp.status_code == 200:
            return "Job done!"
        else:
            return """Err. Something happened. You probably need to get a hold of Rune/current IT God.

Here is some information for whoever it is:

Response code: %s
Headers: %s""" % (resp.status_code, resp.headers)

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
    app.run()
