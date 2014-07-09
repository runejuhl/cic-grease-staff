#!/usr/bin/env python
# -*- coding: utf-8 -*-
import simplejson as json

from flask import Flask, render_template
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
            return 'You need to provide a session ID in the query string for this to work. Please access this page from Obvius. If you do not have an edit button on the relevant page, please install Greasemonkey and this: <a href="static/CIC_employee.user.js">CIC_employee.user.js</a>', 500
        people = request.form['people']
        people = json.loads(people)

        content = render_template('businesscard.jinja2', persons = people)

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
            print resp.headers
            return "Job done!"
        else:
            return """Err. Something happened. You probably need to get a hold of Rune/current IT God.

Here is some information for whoever it is:

Response code: %s
Headers: %s""" % (resp.status_code, resp.headers), 500

if __name__ == '__main__':
    app.run()
