// ==UserScript==
// @name        CIC employee
// @namespace   cic.petardo.dk
// @description Additional tools for the CIC employee page
// @include     http://cms.ku.dk/admin/nat-sites/nbi-sites/cik/english/test-rune/?*
// @include     http://cms.ku.dk/admin/nat-sites/nbi-sites/cik/ansatte/?*
// @require     http://cms.ku.dk/jquery/1.8.3/jquery-1.8.3.min.js

// @version     0.51
// ==/UserScript==

var sitestyle = ' \
CSSSENTINEL \
';

var sitescript = function() {
$(document).ready(
  function() {
    // Containing div
    var staff = $("#staff");
    // All "business cards" have this class
    var bcards = $(".business-card");

    // Generate a list of tags used in the document and sort them
    var tags = [];
    var tmptags = staff.find(".tags li")
      .map(function() {
        return this.textContent;
      })
      .sort();

    // Remove duplicates
    for (var i = 0; i < tmptags.length; i++) {
      if (tags && tags[tags.length-1] != tmptags[i]) {
        tags.push(tmptags[i]);
      }
    }

    // Create the tag selection box
    var searchbox = $('<div class="filter"><h2>Filter</h2><p>Use the following tags to filter the list of employees.</p><ul class="tags"></ul></div>');
    var searchul = searchbox.find('ul');

    // Add tags to search box
    $.map(tags, function(x) {
      var id = 'filter-' + x.toLowerCase().replace(' ', '-');
      searchul.append('<li class="toggled"><label for="' + id + '">' + x + '<input id="' + id + '" class="hidden" type="checkbox" value="' + x + '" checked></label></li>');
    });

    // Append searchbox
    staff.prepend(searchbox);

    // Filter inputs
    var inputFilters = $('.filter .tags input');

    // Add function on click
    inputFilters.click(function() {
      console.log($(this));
      var currentTags = $('.filter ul.tags li')
        .get()
        .reduce(
          function (acc,x) {
            if (x.querySelector('input').checked) {
              return acc.concat(x.querySelector('input').value);
            } else {
              return acc;
            }
          }, []);

      // toggle clicked item
      $(this).parents('li').toggleClass('toggled');

      var matching = bcards
        .find('.tags')
        .map(
          function(x) {
            var tmp = $(this)
              .find('li')
              .get()
              .reduce(function (acc,x) {
                console.log(x.innerHTML);
                return (currentTags.indexOf(x.innerHTML) != -1) || acc;
              }, false);
            if (tmp) {
              return $(this).parents('li');
            }
          }
        );

      bcards.map(function() {
        $(this).hide();
      });

      matching.map(function() {
        $(this).show();
      });

    });
  });
};

// PAPA PARSE!
$(document).ready(
  function() {

    (function($)
     {
	     "use strict";

	     $.fn.parse = function(options)
	     {
		     var config = options.config || {};
		     var queue = [];

		     this.each(function(idx)
		               {
			               var supported = $(this).prop('tagName').toUpperCase() == "INPUT" && $(this).attr('type') == "file" && window.FileReader;

			               if (!supported)
				               return true;	// continue to next input element

			               var instanceConfig = $.extend({}, config);	// This copy is very important

			               if (!this.files || this.files.length == 0)
			               {
				               error("NoFileError", undefined, this);
				               return true;	// continue to next input element
			               }

			               for (var i = 0; i < this.files.length; i++)
				               queue.push({
					               file: this.files[i],
					               inputElem: this,
					               instanceConfig: instanceConfig
				               });

			               if (queue.length > 0)
				               parseFile(queue[0]);
		               });

		     return this;


		     function parseFile(f)
		     {
			     var completeFunc = complete, errorFunc;

			     if (isFunction(options.error))
				     errorFunc = function() { options.error(reader.error, f.file, f.inputElem); };
			     if (isFunction(options.complete))
				     completeFunc = function(results, file, inputElem, event) { options.complete(results, file, inputElem, event); complete(); };

			     if (isFunction(options.before))
			     {
				     var returned = options.before(f.file, f.inputElem);

				     if (typeof returned === 'object')
					     f.instanceConfig = $.extend(f.instanceConfig, returned);
				     else if (returned === "skip")
					     return complete();		// Proceeds to next file
				     else if (returned === false)
				     {
					     error("AbortError", f.file, f.inputElem);
					     return;	// Aborts all queued files immediately
				     }
			     }

			     if (f.instanceConfig.step)
			     {
				     var streamer = new Streamer(f.file, {
					     inputElem: f.inputElem,
					     config: $.extend({}, f.instanceConfig)	// This copy is very important
				     });
				     streamer.stream(completeFunc, errorFunc);
			     }
			     else
			     {
				     var reader = new FileReader();
				     reader.onerror = errorFunc;
				     reader.onload = function(event)
				     {
					     var text = event.target.result;
					     var results = $.parse(text, f.instanceConfig);
					     completeFunc(results, f.file, f.inputElem, event);
				     };
				     reader.readAsText(f.file, f.instanceConfig.encoding);
			     }
		     }

		     function error(name, file, elem)
		     {
			     if (isFunction(options.error))
				     options.error({name: name}, file, elem);
		     }

		     function complete()
		     {
			     queue.splice(0, 1);
			     if (queue.length > 0)
				     parseFile(queue[0]);
		     }
	     };

	     $.parse = function(input, options)
	     {
		     var parser = new Parser(options);
		     return parser.parse(input);
	     };

	     function isFunction(func) { return typeof func === 'function'; }

	     // Streamer is a wrapper over Parser to handle chunking the input file
	     function Streamer(file, settings)
	     {
		     if (!settings)
			     settings = {};

		     if (!settings.chunkSize)
			     settings.chunkSize = 1024 * 1024 * 5;	// 5 MB

		     if (settings.config.step)	// it had better be there...!
		     {
			     var userStep = settings.config.step;
			     settings.config.step = function(data) { return userStep(data, file, settings.inputElem); };
		     }

		     var start = 0;
		     var aggregate = "";
		     var partialLine = "";
		     var parser = new Parser(settings.config);
		     var reader = new FileReader();

		     reader.onload = blobLoaded;
		     reader.onerror = blobError;

		     this.stream = function(completeCallback, fileErrorCallback)
		     {
			     settings.onComplete = completeCallback;
			     settings.onFileError = fileErrorCallback;
			     nextChunk();
		     };

		     function blobLoaded(event)
		     {
			     aggregate += partialLine + event.target.result;
			     partialLine = "";

			     if (start < file.size)
			     {
				     var lastLineEnd = aggregate.lastIndexOf("\n");

				     if (lastLineEnd < 0)
					     lastLineEnd = aggregate.lastIndexOf("\r");

				     if (lastLineEnd > -1)
				     {
					     partialLine = aggregate.substring(lastLineEnd + 1);	// skip the line ending character
					     aggregate = aggregate.substring(0, lastLineEnd);
				     }
				     else
				     {
					     // For chunk sizes smaller than a line (a line could not fit in a single chunk)
					     // we simply build our aggregate by reading in the next chunk, until we find a newline
					     nextChunk();
					     return;
				     }
			     }

			     var results = parser.parse(aggregate);
			     aggregate = "";

			     if (start >= file.size)
				     return done(event);
			     else if (results.errors.abort)
				     return;
			     else
				     nextChunk();
		     }

		     function done(event)
		     {
			     if (typeof settings.onComplete === 'function')
				     settings.onComplete(undefined, file, settings.inputElem, event);
		     }

		     function blobError()
		     {
			     if (typeof settings.onFileError === 'function')
				     settings.onFileError(reader.error, file, settings.inputElem);
		     }

		     function nextChunk()
		     {
			     if (start < file.size)
			     {
				     reader.readAsText(file.slice(start, Math.min(start + settings.chunkSize, file.size)), settings.config.encoding);
				     start += settings.chunkSize;
			     }
		     }
	     }

	     // Parser is the actual parsing component.
	     // It is under test and does not depend on jQuery.
	     // You could rip this entire function out of the plugin
	     // and use it independently (with attribution).
	     function Parser(config)
	     {
		     var self = this;
		     var _invocations = 0;
		     var _input = "";
		     var _chunkOffset = 0;
		     var _abort = false;
		     var _config = {};
		     var _state = freshState();
		     var _defaultConfig = {
			     delimiter: "",
			     header: true,
			     dynamicTyping: true,
			     preview: 0
		     };
		     var _regex = {
			     floats: /^\s*-?(\d*\.?\d+|\d+\.?\d*)(e[-+]?\d+)?\s*$/i,
			     empty: /^\s*$/
		     };

		     config = validConfig(config);
		     _config = {
			     delimiter: config.delimiter,
			     header: config.header,
			     dynamicTyping: config.dynamicTyping,
			     preview: config.preview,
			     step: config.step
		     };

		     this.parse = function(input)
		     {
			     if (typeof input !== 'string')
				     return returnable();

			     reset(input);

			     if (!_config.delimiter && !guessDelimiter(input))
			     {
				     addError("Delimiter", "UndetectableDelimiter", "Unable to auto-detect delimiting character; defaulted to comma", "config");
				     _config.delimiter = ",";
			     }

			     for (_state.i = 0; _state.i < _input.length; _state.i++)
			     {
				     if (_abort || (_config.preview > 0 && _state.lineNum > _config.preview))
					     break;

				     _state.ch = _input[_state.i];
				     _state.line += _state.ch;

				     if (_state.ch == '"')
					     handleQuote();
				     else if (_state.inQuotes)
					     inQuotes();
				     else
					     notInQuotes();
			     }

			     if (_abort)
				     addError("Abort", "ParseAbort", "Parsing was aborted by the user's step function", "abort");
			     else
			     {
				     endRow();	// End of input is also end of the last row
				     if (_state.inQuotes)
					     addError("Quotes", "MissingQuotes", "Unescaped or mismatched quotes");
			     }

			     return returnable();
		     };

		     this.getOptions = function()
		     {
			     return {
				     delimiter: _config.delimiter,
				     header: _config.header,
				     dynamicTyping: _config.dynamicTyping,
				     preview: _config.preview,
				     step: _config.step
			     };
		     };

		     function validConfig(config)
		     {
			     if (typeof config !== 'object')
				     config = {};

			     if (typeof config.delimiter !== 'string' || config.delimiter.length != 1)
				     config.delimiter = _defaultConfig.delimiter;

			     if (config.delimiter == '"' || config.delimiter == "\n")
				     config.delimiter = _defaultConfig.delimiter;

			     if (typeof config.header !== 'boolean')
				     config.header = _defaultConfig.header;

			     if (typeof config.dynamicTyping !== 'boolean')
				     config.dynamicTyping = _defaultConfig.dynamicTyping;

			     if (typeof config.preview !== 'number')
				     config.preview = _defaultConfig.preview;

			     if (typeof config.step !== 'function')
				     config.step = _defaultConfig.step;

			     return config;
		     }

		     function guessDelimiter(input)
		     {
			     var recordSep = String.fromCharCode(30);
			     var unitSep = String.fromCharCode(31);
			     var delimiters = [",", "\t", "|", ";", recordSep, unitSep];
			     var bestDelim, bestDelta, fieldCountPrevRow;

			     for (var i = 0; i < delimiters.length; i++)
			     {
				     var delim = delimiters[i];
				     var delta = 0, avgFieldCount = 0;

				     var preview = new Parser({
					     delimiter: delim,
					     header: false,
					     dynamicTyping: false,
					     preview: 10
				     }).parse(input);

				     for (var j = 0; j < preview.results.length; j++)
				     {
					     var fieldCount = preview.results[j].length;
					     avgFieldCount += fieldCount;

					     if (typeof fieldCountPrevRow === 'undefined')
					     {
						     fieldCountPrevRow = fieldCount;
						     continue;
					     }
					     else if (fieldCount > 1)
					     {
						     delta += Math.abs(fieldCount - fieldCountPrevRow);
						     fieldCountPrevRow = fieldCount;
					     }
				     }

				     avgFieldCount /= preview.results.length;

				     if ((typeof bestDelta === 'undefined' || delta < bestDelta)
					       && avgFieldCount > 1.99)
				     {
					     bestDelta = delta;
					     bestDelim = delim;
				     }
			     }

			     _config.delimiter = bestDelim;

			     return !!bestDelim;
		     }

		     function handleQuote()
		     {
			     var delimBefore = (_state.i > 0 && isBoundary(_state.i-1))
					   || _state.i == 0;
			     var delimAfter  = (_state.i < _input.length - 1 && isBoundary(_state.i+1))
					   || _state.i == _input.length - 1;
			     var escaped     = _state.i < _input.length - 1
					   && _input[_state.i+1] == '"';

			     if (_state.inQuotes && escaped)
			     {
				     _state.fieldVal += '"';
				     _state.i++;
			     }
			     else if (delimBefore || delimAfter)
				     _state.inQuotes = !_state.inQuotes;
			     else
				     addError("Quotes", "UnexpectedQuotes", "Unexpected quotes");
		     }

		     function inQuotes()
		     {
			     appendCharToField();
		     }

		     function appendCharToField()
		     {
			     _state.fieldVal += _state.ch;
		     }

		     function notInQuotes()
		     {
			     if (_state.ch == _config.delimiter)
				     saveValue();
			     else if ((_state.ch == "\r" && _state.i < _input.length - 1
						         && _input[_state.i+1] == "\n")
					          || (_state.ch == "\n" && _state.i < _input.length - 1
						            && _input[_state.i+1] == "\r"))
			     {
				     newRow();
				     _state.i++;
			     }
			     else if (_state.ch == "\r" || _state.ch == "\n")
				     newRow();
			     else
				     appendCharToField();
		     }

		     function isBoundary(i)
		     {
			     return _input[i] == _config.delimiter
				     || _input[i] == "\n"
				     || _input[i] == "\r";
		     }

		     function saveValue()
		     {
			     if (_config.header)
			     {
				     if (_state.lineNum == 1 && _invocations == 1)
					     _state.parsed.fields.push(_state.fieldVal);
				     else
				     {
					     var currentRow = _state.parsed.rows[_state.parsed.rows.length - 1];
					     var fieldName = _state.parsed.fields[_state.field];
					     if (fieldName)
					     {
						     if (_config.dynamicTyping)
							     _state.fieldVal = tryParseFloat(_state.fieldVal);
						     currentRow[fieldName] = _state.fieldVal;
					     }
					     else
					     {
						     if (typeof currentRow.__parsed_extra === 'undefined')
							     currentRow.__parsed_extra = [];
						     currentRow.__parsed_extra.push(_state.fieldVal);
					     }
				     }
			     }
			     else
			     {
				     if (_config.dynamicTyping)
					     _state.fieldVal = tryParseFloat(_state.fieldVal);
				     _state.parsed[_state.parsed.length - 1].push(_state.fieldVal);
			     }

			     _state.fieldVal = "";
			     _state.field ++;
		     }

		     function newRow()
		     {
			     endRow();

			     if (streaming())
			     {
				     _state.errors = {};
				     _state.errors.length = 0;
			     }

			     if (_config.header)
			     {
				     if (_state.lineNum > 0)
				     {
					     if (streaming())
						     _state.parsed.rows = [ {} ];
					     else
						     _state.parsed.rows.push({});
				     }
			     }
			     else
			     {
				     if (streaming())
					     _state.parsed = [ [] ];
				     else if (!_config.header)
					     _state.parsed.push([]);
			     }

			     _state.lineNum++;
			     _state.line = "";
			     _state.field = 0;
		     }

		     function endRow()
		     {
			     if (_abort)
				     return;

			     saveValue();

			     var emptyLine = trimEmptyLine();

			     if (!emptyLine && _config.header)
				     inspectFieldCount();

			     if (streaming() && (!_config.header ||
					                     (_config.header && _state.parsed.rows.length > 0)))
			     {
				     var keepGoing = _config.step(returnable());
				     if (keepGoing === false)
					     _abort = true;
			     }
		     }

		     function streaming()
		     {
			     return typeof _config.step === 'function';
		     }

		     function tryParseFloat(num)
		     {
			     var isNumber = _regex.floats.test(num);
			     return isNumber ? parseFloat(num) : num;
		     }

		     function trimEmptyLine()
		     {
			     if (_regex.empty.test(_state.line))
			     {
				     if (_config.header)
				     {
					     if (_state.lineNum == 1)
					     {
						     _state.parsed.fields = [];
						     _state.lineNum--;
					     }
					     else
						     _state.parsed.rows.splice(_state.parsed.rows.length - 1, 1);
				     }
				     else
					     _state.parsed.splice(_state.parsed.length - 1, 1);

				     return true;
			     }
			     return false;
		     }

		     function inspectFieldCount()
		     {
			     if (!_config.header)
				     return true;

			     if (_state.parsed.rows.length == 0)
				     return true;

			     var expected = _state.parsed.fields.length;

			     // Actual field count tabulated manually because IE<9 doesn't support Object.keys
			     var actual = 0;
			     var lastRow = _state.parsed.rows[_state.parsed.rows.length - 1];
			     for (var prop in lastRow)
				     if (lastRow.hasOwnProperty(prop))
					     actual++;

			     if (actual < expected)
				     return addError("FieldMismatch", "TooFewFields", "Too few fields: expected " + expected + " fields but parsed " + actual);
			     else if (actual > expected)
				     return addError("FieldMismatch", "TooManyFields", "Too many fields: expected " + expected + " fields but parsed " + actual);
			     return true;
		     }

		     function addError(type, code, msg, errKey)
		     {
			     var row = _config.header
					   ? (_state.parsed.rows.length ? _state.parsed.rows.length - 1 : undefined)
				   : _state.parsed.length - 1;
			     var key = errKey || row;

			     if (typeof _state.errors[key] === 'undefined')
				     _state.errors[key] = [];

			     _state.errors[key].push({
				     type: type,
				     code: code,
				     message: msg,
				     line: _state.lineNum,
				     row: row,
				     index: _state.i + _chunkOffset
			     });

			     _state.errors.length ++;

			     return false;
		     }

		     function returnable()
		     {
			     return {
				     results: _state.parsed,
				     errors: _state.errors,
				     meta: {
					     delimiter: _config.delimiter
				     }
			     };
		     }

		     function reset(input)
		     {
			     _invocations++;
			     if (_invocations > 1 && streaming())
				     _chunkOffset += input.length;
			     _state = freshState();
			     _input = input;
		     }

		     function freshState()
		     {
			     // If streaming, and thus parsing the input in chunks, this
			     // is careful to preserve what we've already got, when necessary.
			     var parsed;
			     if (_config.header)
			     {
				     parsed = {
					     fields: streaming() ? _state.parsed.fields || [] : [],
					     rows: streaming() && _invocations > 1 ? [ {} ] : []
				     };
			     }
			     else
				     parsed = [ [] ];

			     return {
				     i: 0,
				     lineNum: streaming() ? _state.lineNum : 1,
				     field: 0,
				     fieldVal: "",
				     line: "",
				     ch: "",
				     inQuotes: false,
				     parsed: parsed,
				     errors: { length: 0 }
			     };
		     }
	     }

     })(jQuery);


    var imgBasePath = 'http://www.isogklima.nbi.ku.dk/ansatte/proeve/';

    var csvtab = $('<li id="upload-csv-tab"><a onclick="javascript:this.blur(); return(obvius_goto_editpage(\'upload-csv-page\', obvius_all_ids));" accesskey="5" title="Alt-5">Upload CSV</a></li>');
    var csvform = $('<div id="upload-csv-page"><h2>Upload employee CSV</h2><div class="obvius-editengine-confirmation"><form id="people"><div><label for="people-file">Select the .csv file: <input id="people-file" name="file" type="file" accept=".csv" /></label></div><div id="people-status"> </div> <div id="error"> </div> </form></div></div>');
    $('.obvius-editing > ul').append(csvtab);
    $('.obvius-common > .obvius-editengine > form > div').children().last().before(csvform);
    obvius_all_ids.push('upload-csv-page');

    $('#upload-csv-tab').toggleClass('obvius-current');
    obvius_goto_editpage('upload-csv-page', obvius_all_ids);

    var file = $('#people-file');
    var form = $('form#people');
    var status = $('#people-status');

    var link = function(type, titleurl) {
      var items = titleurl.split('|');

      var result = '';

      var hrefPrefix = '';

      if (type == 'phone') {
        hrefPrefix = 'tel:';
      } else if (type == 'email') {
        hrefPrefix = 'mailto:';
      }

      var multiple = items.length > 1;

      for (var i = 0; i < items.length; i++) {
        if (multiple && i == 0) {
          result += '<ul>';
        }

        var tmp = items[i].split(',');
        var title, url;

        if (tmp.length == 2) {
          title = tmp[0].trim();
          url = tmp[1].trim();
        } else {
          url = items[i];
        }

        if (multiple)
          result += '<li>';

        if (title) {
          if (type == 'homepage') {
            result += '<a href="' + hrefPrefix + url + '" class="' + type + '">' + title + '</a>';
          } else {
            result += '<a href="' + hrefPrefix + url + '" class="' + type + '">' + title + ": " + url + '</a>';
          }
        } else {
          result += '<a href="' + hrefPrefix + url + '" class="' + type + '">' + url + '</a>';
        }

        if (multiple)
          result += '</li>';

        if (multiple && i == items.length-1)
          result += '</ul>';
      }

      return result;
    };

    // Function for rendering information (an array of people) to DOM.
    var render = function(people) {
      var result = '<div id="staff"> <ul>';

      var person;

      for (var i = 0; i < people.length; i++) {
        person = people[i];

        result += '<li class="business-card">';
        result += '<div>';

        if (person.picture) {
          result += '<div class="photo"><img src="' + imgBasePath + person.picture.replace(" ", "_") + '" title="' + person.name + '" alt="Picture of ' + person.name + '" /> </div> ';
        }

        result += '<h1>';

        if (person.kuid) {
          result += '<a href="http://www.isogklima.nbi.ku.dk/ansatte/?id=' + person.kuid + '&vis=medarbejder">' + person.name + '</a>';
        } else {
          result += person.name + '</h1>';
        }

        if (person.title) {
          result += '<h2>' +  person.title + '</h2>';
        }

        // tags
        result += '<ul class="tags" style="display:none;">';

        var tags = person.tags.split(',');
        for (var j = 0; j < tags.length; j++) {
          result += '<li>' + tags[j] + '</li>';
        }
        result += '</ul>';

        result += '<div class="row-wrapper"> <div class="column info">';

        // description
        result += '<div class="column description">' + person.description + ' </div> ';

        if (person.project) {
          result += '<div class="project">' + person.project + '</div>';
        }

        // contact information
        result += '<ul class="contact">';

        var contactAttrs = ['phone', 'email', 'homepage'];

        for (var j = 0; j < contactAttrs.length; j++) {
          var attr = contactAttrs[j];
          var attrName = attr[0].toUpperCase() + attr.slice(1);
          if (person[attr]) {
            result += '<li class="' + attr + '">' + attrName + ': ';

            result += link(attr, person[attr]);
            // result += '<a href="' + hrefPrefix + person[attr] + '" class="' + attr + '">' + person[attr] + '</a>';

            result += '</li>';
          }

        }

        result += '</ul> </div>';
        result += '</div> </div> </li>';

      }

      result += '</ul></div>';

      return result;
    };

    var head = document.getElementById('edit_.key::KRAKOW._save:editengine_value:key::KRAKOW:extra_html_head_thisonly');
    head.value = '<style type="text/css">\n' + sitestyle + '\n</style>\n';
    head.value += '<script type="text/javascript">\n' + sitescript.toString().slice(14,-1) + '\n</script>';

    status.html('Ready...');

    file.change(function(event) {
      status.html('Please wait...');
      var parsed = file.parse({
        config: {
          delimiter: "",
          header: true,
          dynamicTyping: false,
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

          var iframe = $('td.mceIframeContainer.mceFirst.mceLast > iframe').last();
          var iframeContents = iframe.contents().find('html > body');

          iframeContents.html(render(data.results.rows));

          status.html('Everything seems fine. Feel free to save and publish.');
        },
      });

      return true;
    });

  }
);
