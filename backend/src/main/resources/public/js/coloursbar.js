//colors selector bar script
$(document).ready(function () {
    $('select[name="colorpicker-change-background-color"]').on('change', function () {
        $(document.body).css('background-color', $('select[name="colorpicker-change-background-color"]').val());
    });

    setTimeout(function () {
        $('select[name="colorpicker-selectColor-#fbd75b"]').simplecolorpicker('selectColor', '#fbd75b');
    }, 5000);

    setTimeout(function () {
        $('select[name="colorpicker-selectColor-#FBD75B"]').simplecolorpicker('selectColor', '#FBD75B');
    }, 5000);

    setTimeout(function () {
        $('select[name="colorpicker-selectColor-#fbd75b-multiple"]').simplecolorpicker('selectColor', '#fbd75b');
    }, 5000);

    setTimeout(function () {
        // Generates a JavaScript error
        $('select[name="colorpicker-selectColor-unknown"]').simplecolorpicker('selectColor', 'unknown');
    }, 5000);

    setTimeout(function () {
        $('select[name="colorpicker-picker-selectColor-#fbd75b"]').simplecolorpicker('selectColor', '#fbd75b');
    }, 5000);

    setTimeout(function () {
        // Generates a JavaScript error
        $('select[name="colorpicker-picker-selectColor-unknown"]').simplecolorpicker('selectColor', 'unknown');
    }, 5000);

    $('#initColorPalette').on('click', function () {
        $('select[name="colorpicker-shortlist"]').simplecolorpicker();
        $('select[name="colorpicker-longlist"]').simplecolorpicker();
        $('select[name="colorpicker-notheme"]').simplecolorpicker();
        $('select[name="colorpicker-regularfont"]').simplecolorpicker({theme: 'regularfont'});
        $('select[name="colorpicker-glyphicons"]').simplecolorpicker({theme: 'glyphicons'});
        $('select[name="colorpicker-fontawesome"]').simplecolorpicker({theme: 'fontawesome'});
        $('select[name="colorpicker-bootstrap3-form"]').simplecolorpicker({theme: 'glyphicons'});
        $('select[name="colorpicker-modal-inline"]').simplecolorpicker();
        $('select[name="colorpicker-modal-picker"]').simplecolorpicker({picker: true});
        $('select[name="colorpicker-option-selected"]').simplecolorpicker({theme: 'glyphicons'});
        $('select[name="colorpicker-options-disabled"]').simplecolorpicker({theme: 'glyphicons'});
        $('select[name="colorpicker-option-selected-disabled"]').simplecolorpicker({theme: 'glyphicons'});
        $('select[name="colorpicker-optgroups"]').simplecolorpicker();
        $('select[name="colorpicker-change-background-color"]').simplecolorpicker();
        $('select[name="colorpicker-selectColor-#fbd75b"]').simplecolorpicker({theme: 'glyphicons'});
        $('select[name="colorpicker-selectColor-#FBD75B"]').simplecolorpicker({theme: 'glyphicons'});
        $('select[name="colorpicker-selectColor-#fbd75b-multiple"]').simplecolorpicker({theme: 'glyphicons'});
        $('select[name="colorpicker-selectColor-unknown"]').simplecolorpicker({theme: 'glyphicons'});

        $('select[name="colorpicker-picker-shortlist"]').simplecolorpicker({picker: true, theme: 'glyphicons'});
        $('select[name="colorpicker-picker-longlist"]').simplecolorpicker({picker: true, theme: 'glyphicons'});
        $('select[name="colorpicker-picker-delay"]').simplecolorpicker({
            picker: true,
            theme: 'glyphicons',
            pickerDelay: 1000
        });
        $('select[name="colorpicker-picker-option-selected"]').simplecolorpicker({
            picker: true,
            theme: 'glyphicons'
        });
        $('select[name="colorpicker-picker-options-disabled"]').simplecolorpicker({
            picker: true,
            theme: 'glyphicons'
        });
        $('select[name="colorpicker-picker-option-selected-disabled"]').simplecolorpicker({
            picker: true,
            theme: 'glyphicons'
        });
        $('select[name="colorpicker-picker-optgroups"]').simplecolorpicker({picker: true, theme: 'glyphicons'});
        $('select[name="colorpicker-picker-selectColor-#fbd75b"]').simplecolorpicker({
            picker: true,
            theme: 'glyphicons'
        });
        $('select[name="colorpicker-picker-selectColor-unknown"]').simplecolorpicker({
            picker: true,
            theme: 'glyphicons'
        });
    });

    $('#initColorPalette').trigger('click');
});
