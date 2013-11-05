// Convert an object to an array
function toArray(c) {
    return [].slice.call(c, 0);
}

var staff = document.getElementById('staff');
var section = staff;
var filter = [];
var bcards = document.getElementsByClassName('business-card');

// Remove all current filters from the list of business cards.
function clearFilters() {
    for (var b in bcards) {
        bcards[b].hidden = false;
    }
}

// Add a selection filter to the list of business cards
function addFilter(tag) {
    for (var ib = 0; ib < bcards.length; ib++) {
        var found = false;
        var tagelem = bcards[ib].getElementsByClassName('tags');
        
        if (tagelem[0] == undefined)
            continue;

        var tags = tagelem[0].getElementsByTagName('li');
        for (var it = 0; it < tags.length; it++) {
            if (tags[it].innerHTML == tag) {
                console.log(tags[it]);
                tags[it].classList.toggle('toggled');
                found = true;
                break;
            }
        }

        if (!found) {
            bcards[ib].classList.toggle('hidden');
        }
    }
}

function removeFilter(tag) {
    // find all toggled tags
    var active = toArray(document.querySelectorAll('.business-card.hidden li:not(.toggled)'));

    // filter to matching
    active = active.filter(function(x) { return x.innerHTML != tag });

    // if current filter, untoggle
    for (var it=0; it < active.length; it++) {
        // find parent node
        var parent = active[it].parentNode;
        // and see if there are more applied filters
        console.log(parent.querySelectorAll('.toggled'));
        if (parent.querySelectorAll('.toggled').length == 0) {
            // if not, unhide
            console.log(parent.parentNode.parentNode);
            parent.parentNode.parentNode.classList.remove('hidden');
        }
    }

    // var hidden = toArray(bcards).filter(function(x) { return x.hidden; });
    
    // for (var it=0; it < hidden.length; it++) {
    //     console.log("remove, it: " + it);

    //     var tags = hidden[it].querySelectorAll('li');
    //     console.log(toArray(tags).map(function(x) { return x.innerHTML;}));
    //     if (toArray(tags).filter(function(x) { return x.innerHTML == tag; }).length == 0)
    //         hidden[it].hidden = false;
    // }

    
    
}

// function removeFilter(tag) {
//     var bcards = document.getElementsByClassName('business-card');
//     for (var i = 0; i < bcards.length; i++) {
//         var tagsul = document.getElementsByClassName('tags')[0];
//         console.log(tagsul);
//         var tags = tagsul.getElementsByTagName('li');
//         console.log(tags);
//         for (var ti = 0; ti < tags.length; ti++) {
//             console.log(tags[ti].innerHTML);
//             if (tags[ti].innerHTML == tag) {
//                 tagsul.parentNode.parentNode.hidden = false;
//                 break;
//             }
//         }
//     }
// }


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

var searchbox = document.createElement('ul');
searchbox.className = 'tags';
// Add tags to search box
for (var i in tags) {
    var e = tags[i];
    var d = document.createElement('li');
    d.innerHTML = e[0];
    d.onclick = function(x) {
        if (this.classList.toggle('toggled')) {
            console.log("Toggled!");
            addFilter(this.innerHTML);
        } else {
            console.log("Untoggled!");
            removeFilter(this.innerHTML);
        }
    }
    searchbox.appendChild(d);
}

// Append searchbox
section.appendChild(searchbox);

// We should sort the list here...
// console.log(index);
// console.log(index.sort(function(a,b) { console.log("asdsad" + a + ": " + b); return a[1] > b[1];}));

// console.log(index)
