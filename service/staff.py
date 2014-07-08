#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sys

import simplejson as json

from flask import Flask, jsonify, render_template
from flask import request

from ObviusUpdate import ObviusUpdate

app = Flask(__name__)
app.debug = True

@app.template_filter('split')
def reverse_filter(s):
    return map(lambda(x): x.strip(), s.split(','))

@app.route('/', methods=['POST', 'GET'])
def update():

    if request.method == 'GET':
        return render_template('upload.jinja2')

    if request.method == 'POST':
        try:
            sessid = request.args['sessid']
        except KeyError as e:
            return "You need to provide a session ID in the query string for this to work. Please access this page from Obvius.", 500
        people = request.form['people']

        print people
        print type(people)

        people = json.loads(people)
        print people
        print type(people)

        content = render_template('businesscard.jinja2', persons = people)
        print content

        header = '<script type="text/javascript">\n'
        header += open('static/staff.js', 'r').read()
        header += '</script>\n'
        header += '<style type="text/css">\n'
        header += open('static/style.css', 'r').read()
        header += '</style>\n'


        URL = 'http://cms.ku.dk/admin/nat-sites/nbi-sites/cik/english/test-rune/'

        o = ObviusUpdate(URL, sessid)
        resp = o.update(content, header)
        if resp.status_code == 200:
            return "Job done!"
        else:
            return """Err. Something happened. You probably need to get a hold of Rune/current IT God.

Here is some information for whoever it is:

Response code: %s
Headers: %s""" % (resp.status_code, resp.headers), 500

def run():
    app.run()

if __name__ == '__main__':
    app.run()
