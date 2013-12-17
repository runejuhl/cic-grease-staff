// containing div
var staff = $('#staff');
// all "business cards" have this class
var bcards = $('.business-card')

// generate a list of tags used in the document, sort them and remove
// duplicates
var tags = [];
var tmptags = staff.find('.tags li')
    .map(function() {
        return this.textContent;
    })
    .sort();

for (var i = 0; i < tmptags.length; i++)
    if (tags && tags[tags.length-1] != tmptags[i])
        tags.push(tmptags[i])

// Create the tag selection box
var searchbox = $('<div class="filter"><ul class="tags"></ul></div>');
var searchul = searchbox.find('ul');

// Add tags to search box
$.map(tags, function(x) {
    searchul.append('<li class="toggled">' + x + '</li>');
});

// Append searchbox
staff.prepend(searchbox);

// Add function on click
$('.filter .tags li').click(function() {
    var curr = $(this).text();
    // toggle clicked item
    $(this).toggleClass('toggled');

    bcards.find('.tags').each(function() {
        $(this).find('li').each(function() {
            console.log($(this).text());
            if ($(this).text() == curr) {
                console.log($(this));
                console.log($(this).parentsUntil('li'));
                $(this).parents('li').toggle('toggled');
                return false;
            }
        });
    });
});
