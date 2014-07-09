// ==UserScript==
// @name        CIC employee
// @namespace   cic.petardo.dk
// @description Additional tools for the CIC employee page
// @include     http://cms.ku.dk/admin/nat-sites/nbi-sites/cik/english/test-rune/
// @version     0.1
// @grant       none
// ==/UserScript==

// additional menu

// var staff_toolbar = $('[id="edit_.key::KRAKOW._save:editengine_value:key::KRAKOW:content_toolbar3"]').find('tbody > tr');

// function appendToolbox() {
//     staff_toolbar.append('<tr><span id="staffAddPerson">Add person</span></tr>');
//     $('#staffAddPerson').click(function() {
//         console.log('toolbar button clicked');
//     });
// }

var url = 'http://creep.gfy.ku.dk/employeepage/'

$(document).ready(

    function() {
      var btn = $('<input type="submit" value="Edit" />')

      btn.click(
        function(event) {
          event.preventDefault();
          sessid = document.cookie.split(';')
            .map(function(x) { return x.trim() })
            .filter(function(x) { return x.startsWith('obvius_login_session=') })[0]
            .split('=')[1];
          window.location.replace(url + '?sessid=' + sessid)
        }
      );
      $('form.obvius-handling > p').append(btn);


    }
);
