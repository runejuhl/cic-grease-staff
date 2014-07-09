#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests as r

from lxml import etree
from io import StringIO, BytesIO
from pprint import pprint

URL = 'http://cms.ku.dk/admin/nat-sites/nbi-sites/cik/english/test-rune/'
EDIT_URL = 'http://cms.ku.dk/admin/nat-sites/nbi-sites/cik/english/test-rune/?obvius_command_edit=1'
SESSID = 'fd655d7d01f7c4c8e246c127107eaba6'
HEADERS = {'Referer': EDIT_URL, 'Accept-Language': 'en-US,en'}
DATA = {}

class ObviusUpdate:
    def __init__(self, url, sessid):
        self.url = url
        self.editurl = url if ('obvius_command_edit' in url) else (url + '?obvius_command_edit=1')
        self.cookies = {'obvius_login_session': sessid}
        self.headers = {'Referer': self.editurl, 'Accept-Language': 'en-US,en'}

        self._get_current()

    def _get_current(self):
        req = r.get(self.editurl, cookies=self.cookies, headers={'Accept-Language': 'en-US,en'})
        data = self._get_fields(StringIO(req.text))
        self._current = data

    def _get_fields(self, text):
        parser = etree.HTMLParser(recover=True)
        tree = etree.parse(text, parser)

        form = False

        for f in tree.xpath('/html/body/div[3]/div/form'):
            items = dict(f.items())
            if items['enctype'] == 'multipart/form-data':
                form = f
                break

        elems = []
        for elem in form.iter('input', 'textarea', 'select'):
            elem = dict(elem.items())

            if 'name' in elem:
                if elem['name'].startswith('obvius_editengine_protocol_confirmation:') and \
                   elem['name'] != 'save_and_publish':
                    continue

                if elem['name'] in ['edit_.key::KRAKOW._save:editengine_value:key::KRAKOW:keyword',
                                    'edit_.key::KRAKOW._save:editengine_value:key::KRAKOW:rightboxes',
                                    'keyword_list1',
                                    'keyword_list2',
                                    'keyword_list3']:
                    continue

            if 'type' in elem:
                if elem['type'] == 'button':
                    continue

                if elem['type'] == 'radio':
                    if not 'checked' in elem:
                        continue
                if elem['type'] == 'select':
                    if not 'selected' in elem:
                        continue


            elems.append(elem)

        def has_name_and_value(e):
            return ('name' in e and 'value' in e)

        elems = list(map(lambda x: (x['name'], x['value'] if 'value' in x else ''), elems))
        elems = dict(elems)

        return elems

    def update(self, body, header=''):
        data = self._current
        data.update({
            # actual content
            'edit_.key::KRAKOW._save:editengine_value:key::KRAKOW:content': body,
            'obvius_editengine_protocol_confirmation:save_and_publish': 'Save and publish',
            'editengine_scheme:edit_.key::KRAKOW._save:': '\n',
            'obvius_editengine_protocol_function': 'save_and_publish=edit_.key::KRAKOW._save_and_publish:',
            'edit_.key::KRAKOW._save:editengine_value:key::KRAKOW:extra_html_head_thisonly': header
        })

        data2 = {k: ('', v) for k,v in data.items()}

        # use 'files' to have requests send data as multipart/form-data
        req = r.post(URL, files=data2, cookies=self.cookies, headers=self.headers)
        print(req.status_code)
        return req
