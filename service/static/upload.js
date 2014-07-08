// debugger;

$(document).ready(function() {
  var file = $('#file');
  var form = $('#people');
  var status = $('#status');
  // var res;

  form.submit(function(event) {
    event.preventDefault();
    // Update status
    status.html('Updating employee page...');

    // POST people
    $.ajax({
      async: true,
      data: {people: JSON.stringify(res.results.rows)},
      dataType: 'json',
      type: 'POST',
    })
      .done(
        function(html) {
          status.html(html);
        }
      )
      .fail(
        function(html) {
          status.html(html);
        }
      );
  });

  file.change(function(event) {
    update.disabled = true;

    var parsed = file.parse({
      config: {
        delimiter: "",
        header: true,
        dynamicTyping: true,
        preview: 0,
        step: undefined,
        encoding: "UTF-8"
      },
      complete: function(data, file, inputElem, event) {
        console.log(data);
        res = data;

        if (res.errors.length > 0) {
          $('#error').html("Error: " + res.errors[Object.keys(res.errors)[0]][0].message + " on row " + Object.keys(res.errors)[0]);
          console.log(res.errors[Object.keys(res.errors)[0]][0].message);
          return;
        }
        $('#table').TidyTable(
          {
            enableCheckbox: false,
            enableMenu: false,
          },
          {
            columnTitles: data.results.fields,
            columnValues: $.map(res.results.rows, function(row) { return [$.map(row, function(x) { return x})] }),
          }
        );
        update.disabled = false;
      },
    });

    return true;
  });
  file.change();

});
