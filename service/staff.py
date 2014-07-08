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

tags = ['Scientific staff', 'Tech+Adm staff', 'PhD student', 'Student', 'Guest', 'Former member']
groups = ['Ice and Climate', 'Meteorology', 'Oceanography']

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

    elif request.method == 'POST':
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

def UnicodeDictReader(utf8_data, **kwargs):
    csv_reader = csv.DictReader(utf8_data, **kwargs)
    for row in csv_reader:
        try:
            yield dict([(key, unicode(value, 'latin-1')) for key, value in row.iteritems()])
        except TypeError as e:
            print "Row: " + str(row)

def csv_to_people(f):
    people = []
    # for e in csv.DictReader(f):
    for e in UnicodeDictReader(f):
        # print e
        people.append(e)

    return people


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

class UTF8Recoder:
    """
    Iterator that reads an encoded stream and reencodes the input to UTF-8
    """
    def __init__(self, f, encoding):
        self.reader = codecs.getreader(encoding)(f)

    def __iter__(self):
        return self

    def next(self):
        return self.reader.next().encode("utf-8")

class UnicodeReader:
    """
    A CSV reader which will iterate over lines in the CSV file "f",
    which is encoded in the given encoding.
    """

    def __init__(self, f, dialect=csv.excel, encoding="utf-8", **kwds):
        f = UTF8Recoder(f, encoding)
        self.reader = csv.DictReader(f, dialect=dialect, **kwds)

    def next(self):
        row = self.reader.next()
        print row
        print [unicode(s, "utf-8") for s in row]
        return [unicode(s, "utf-8") for s in row]

    def __iter__(self):
        return self

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
            attrs = ("%s %s" % (e['firstname'], e['lastname']), e['title'], e['phone'], e['email'], e['description'], e['homepage'], e['picture'], e['address'], e['kuid'], e['tags'], 'Ice and Climate')
            attrs = map(toutf8, attrs)
            attrs = map(stripquotes, attrs)
            print attrs
            db.session.add(Person(*attrs))

        db.session.commit()
    else:
        app.run()
