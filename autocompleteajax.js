/**************************
 * Auto complete plugin  *
 *************************/
$.fn.autocompleteajax = function (options) {
    // Defaults
    var defaults = {
        data: {},
        ajax: {},
        callback: null,
        delay: null,
        minLength: 2,
        autocomplete_id: null,
        input_name: null
    };

    options = $.extend(defaults, options);

    return this.each(function() {
        var $input = $(this);
        var data = options.data,
            $inputDiv = $input.closest('.input-field'); // Div to append on

        // Create autocomplete element
        var $autocomplete = $('<ul class="autocomplete-content dropdown-content"></ul>');

        // Append autocomplete element
        if ($inputDiv.length) {
            $inputDiv.append($autocomplete); // Set ul in body
        } else {
            $input.after($autocomplete);
        }

        var highlight = function(string, $el) {
            var img = $el.find('img');
            var matchStart = $el.text().toLowerCase().indexOf("" + string.toLowerCase() + ""),
                matchEnd = matchStart + string.length - 1,
                beforeMatch = $el.text().slice(0, matchStart),
                matchText = $el.text().slice(matchStart, matchEnd + 1),
                afterMatch = $el.text().slice(matchEnd + 1);
            $el.html("<span>" + beforeMatch + "<span class='highlight'>" + matchText + "</span>" + afterMatch + "</span>");

            if (img.length) {
                $el.prepend(img);
            }
        };

        var timer;

        // Perform search
        $input.on('keyup', function (e) {
            if($(this).val().length > options.minLength) {
                // Send ajax request
                if (timer){
                    clearTimeout(timer);
                }

                timer =  setTimeout(function() {
                    if(!$.isEmptyObject(options.ajax)) {
                        $.ajax({
                            url: options.ajax.url,
                            method: options.ajax.method,
                            data: {
                                data: $input.val(),
                                ajax_data: options.ajax.data
                            },
                            dataType: options.ajax.dataType,
                            error: options.ajax.error,
                            beforeSend: function(jqXHR, settings) {
                                options.ajax.beforeSend ? options.ajax.beforeSend(jqXHR, settings) : null;
                            },
                            success: function(res) {
                                data = res;

                                // If wanna work with response result
                                if(options.callback != null) {
                                    options.callback(res);
                                }
                            }
                        });
                    }

                    // Capture Enter
                    if (e.which === 13) {
                        $autocomplete.find('li').first().click();
                        return;
                    }
                }, options.delay);
            }

            var val = $input.val().toLowerCase();
            $autocomplete.empty();

            // Check if the input isn't empty
            if (val !== '') {
                $.each(data, function(i, value) {
                    if (value.value.toLowerCase().indexOf(val) !== -1 &&
                        value.value.toLowerCase() !== val) {
                        var autocompleteOption = $('<li data-id="'+ value.id +'"></li>');

                        if(!!value.image) {
                            autocompleteOption.append('<img src="'+ value.image +'" class="right circle"><span>'+ value.image +'</span>');
                        } else {
                            autocompleteOption.append('<span>'+ value.value +'</span>');
                        }

                        $autocomplete.append(autocompleteOption);
                        highlight(val, autocompleteOption);
                    }
                });
            }
        });

        // Set input value
        $autocomplete.on('click', 'li', function () {
            $input.val($(this).text().trim());

            var autocomplete_id = options.autocomplete_id;

            if (autocomplete_id) {
                var input_name = options.input_name ? options.input_name : 'autocomplete-id[' + autocomplete_id + ']';

                if($('#' + autocomplete_id).length == 0) {
                    $input.after("<input type='hidden' id='" + autocomplete_id +
                        "' name='" + input_name + "' class='multi_autocomplete_id' value='" + $(this).attr('data-id') +
                        "' data-initial='" + $(this).attr('data-id') + "'>");
                } else {
                    $('#' + autocomplete_id).val($(this).attr('data-id')).attr('data-initial', $(this).attr('data-id'));
                }
            } else {
                if($('.autocomplete-id').length == 0) {
                    $input.after("<input type='hidden' class='autocomplete-id' name='autocomplete-id' value='" + $(this).attr('data-id') + "'>");
                } else {
                    $('.autocomplete-id').val($(this).attr('data-id'));
                }
            }

            $autocomplete.empty();
        });
    });
};

}); // End of $(document).ready
