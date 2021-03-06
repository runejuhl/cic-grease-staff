$(document).ready(function() {
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
  var searchbox = $('<div class="filter"><h2>Filter</h2><p>Use the following tags to filter the list of employees.</p><ul class="tags"></ul></div>');
  var searchul = searchbox.find('ul');

  // Add tags to search box
  $.map(tags, function(x) {
    var id = 'filter-' + x.toLowerCase().replace(' ', '-')
    searchul.append('<li><label for="' + id + '">' + x + '<input id="' + id + '" type="checkbox" value="' + x + '" checked></label></li>');
  });

  // Append searchbox
  staff.prepend(searchbox);

  // Add function on click
  $('.filter .tags input').click(function() {
    var curr = $(this).attr('value');
    // toggle clicked item
    $(this).toggleClass('toggled');

    bcards.find('.tags').each(function() {
      $(this).find('li').each(function() {
        if ($(this).text() == curr) {
          $(this).parents('li').toggle('toggled');
          return false;
        }
      });
    });
  });
});
