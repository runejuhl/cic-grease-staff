#!/usr/bin/env python
import sys

import simplejson as json

from flask import Flask, jsonify, render_template
from flask.ext.sqlalchemy import SQLAlchemy

# url_for('static', filename='style.css')

app = Flask(__name__)
app.debug = True
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////home/runejuhl/projects/staff/service/staff.sqlite3'
db = SQLAlchemy(app)

groups = db.Table(
    'groups',
    db.Column('group_id', db.Integer, db.ForeignKey('group.id')),
    db.Column('person_id', db.Integer, db.ForeignKey('person.id'))
)

tags = db.Table(
    'tags',
    db.Column('tag_id', db.Integer, db.ForeignKey('tag.id')),
    db.Column('person_id', db.Integer, db.ForeignKey('person.id'))
)

class Person(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    email = db.Column(db.String)
    image_src = db.Column(db.String)
    room = db.Column(db.String)
    phone = db.Column(db.String)
    tags = db.relationship('Tag', secondary=tags,
                           backref=db.backref('persons', lazy='dynamic'))
    groups = db.relationship('Group', secondary=groups,
                             backref=db.backref('persons', lazy='dynamic'))

    def __init__(self, name, email, image_src, room, phone):
        self.name = name
        self.email = email
        self.image_src = image_src
        self.room = room
        self.phone = phone

    def __repr__(self):
        return json.dumps({
            'id'                : self.id,
            'name'              : self.name,
            'email'             : self.email,
            'image_src'         : self.image_src,
            'room'              : self.room,
            'phone'             : self.phone,
        })

class Tag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)

    def __init__(self, name):
        self.name = name

class Group(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)

    def __init__(self, name):
        self.name = name

@app.route('/')
def index():
    print Person.query.all().join(tag)
    return render_template('businesscard.jinja2', person = Person.query.all())

@app.route('/get/all')
def get_all():
    # return jsonify(all = [i.serialize for i in Person.query.all()])
    return render_template('businesscard.jinja2', persons = Person.query.all())

@app.route('/raw/all')
def raw_all():
    all = Person.query.join(Group).all()
    print all
    return jsonify(all)
    # return render_template('businesscard.jinja2', persons = Person.query.all())

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

        db.session.add(Person('Rune Juhl Jacobsen', 'runejuhl@nbi.ku.dk', None, 'RF-346', "6016 8337"))
        db.session.add(Person('Thomas Blunier', 'blunier@nbi.ku.dk', 'https://www2.adm.ku.dk/selv/pls/prt_www40.hentindhold_cms?p_personid=337115', 'RF-201', None))

        for tag in ['Scientific stafff', 'Tech+Adm staff', 'PhD students', 'Students', 'Guests', 'Former members']:
            db.session.add(Tag(tag))
        for group in ['Ice and Climate', 'Meteorology', 'Oceanography']:
            db.session.add(Group(group))

        db.session.commit()

    app.run()