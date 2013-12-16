

var staff = $.('#staff');


// ---------------------------------------------

// Convert an object to an array
function toArray(c) {
    return [].slice.call(c, 0);
}

var staff = document.getElementById('staff');
var section = staff;
var bcards = document.getElementsByClassName('business-card');

function updateSelection() {
    selection = toArray(bcards);

    selection.map(function(x) {
        x.classList.remove('hidden');
    });

    var filters = document.querySelectorAll('div.filter ul li.toggled');
    filters = toArray(filters).map(function(x) { return x.innerHTML; });

    for (var i = 0; i < filters.length; i++) {
        for (var j = 0; j < selection.length; j++) {
            var tags = selection[j].querySelectorAll('.tags li');
            tags = toArray(tags);
            // get tag values
            tags = tags.map(function(y) { return y.innerHTML; });
            
            if (tags.indexOf(filters[i]) == -1) {
                selection[j].classList.add('hidden');
            }
        }
    }
   
}

// Find out where to place search box
while (section.nodeName != 'H1')
    section = section.previousSibling;

// Get all tags
var tagelems = [].slice.call(document.getElementsByClassName('tags'), 0);
var tagelems = tagelems.map(function(elem) { return [].slice.call(elem.children, 0).map(function(child) { return child.innerHTML;}) }).join();

tagelems = tagelems.split(',');

// Remove duplicates
var tags = [];
for (var i in tagelems) {
    var e = tagelems[i];
    if (tags[e] == undefined)
        tags[e] = [e, 1];
    else
        tags[e][1] += 1;
}

var searchbox = document.createElement('div');
var searchul = document.createElement('ul');
searchbox.className = 'filter';
searchul.className = 'tags';
searchbox.appendChild(searchul);
// Add tags to search box
for (var i in tags) {
    var e = tags[i];
    var d = document.createElement('li');
    d.innerHTML = e[0];
    d.onclick = function(x) {
        this.classList.toggle('toggled');
        updateSelection();
    }
    searchul.appendChild(d);
}

// Append searchbox
section.appendChild(searchbox);

// We should sort the list here...
// console.log(index);
// console.log(index.sort(function(a,b) { console.log("asdsad" + a + ": " + b); return a[1] > b[1];}));

// console.log(index)
