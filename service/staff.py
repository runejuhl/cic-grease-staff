#!/usr/bin/env python
import simplejson as json

from flask import Flask, jsonify, render_template
from flask.ext.sqlalchemy import SQLAlchemy


app = Flask(__name__)
app.debug = True
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////home/runejuhl/projects/staff/service/staff.sqlite3'
db = SQLAlchemy(app)

class Person(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    email = db.Column(db.String)

    def __init__(self, name, email):
        self.name = name
        self.email = email

    def __repr__(self):
        return json.dumps({
            'id'         : self.id,
            'name'         : self.name,
            'email'         : self.email,
        })

    @property
    def serialize(self):
        """Return object data in easily serializeable format"""
        return json.dumps({
            'id'         : self.id,
            'name'         : self.name,
            'email'         : self.email,
            # This is an example how to deal with Many2Many relations
            # 'many2many'  : self.serialize_many2many
        })

@app.route('/')
def index():
    print Person.query.all()
    return render_template('businesscard.jinja2', person = Person.query.all())

@app.route('/get/all')
def get_all():
    return jsonify(all = [i.serialize for i in Person.query.all()])

@app.route('/get/<id>')
def get_single(id):
    p = Person.query.filter_by(id=id).first()
    return render_template('businesscard.jinja2', person = p)

def run():
    app.run()

if __name__ == '__main__':
    app.run()
