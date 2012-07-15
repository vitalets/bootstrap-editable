$(function () {
    
   $.support.transition = false;
    
    module("common")
    
      test("should be defined on jquery object", function () {
        var div = $("<div id='modal-test'></div>")
        ok(div.editable, 'editable method is defined')
      })
      
      test("should return element", function () {
        var div = $('<div></div>')
        ok(div.editable() == div, 'element returned')
      })  
      
      test("should expose defaults var for settings", function () {
        ok($.fn.editable.defaults, 'default object exposed')
      })    
      
      test("should store editable instance in data object", function () {
        var editable = $('<a href="#">link</a>').editable()
        ok(!!editable.data('editable'), 'editable instance exists')
      })      
      
      test("should add 'editable' class when applied", function () {
        var editable = $('<a href="#">link</a>').appendTo('#qunit-fixture').editable()
        ok($('.editable').length, 'editable class exists')
      })        
      
      test("should store name, value and lastSavedValue", function () {
        var editable = $('<a href="#123" data-name="abc" data-value="123">qwe</a>').appendTo('#qunit-fixture').editable(),
            e2 = $('<a href="#">qwe</a>').appendTo('#qunit-fixture').editable();
          
        equals(editable.data('editable').name, 'abc', 'name exists');
        equals(editable.data('editable').value, '123', 'value exists');
        equals(editable.data('editable').lastSavedValue, '123', 'lastSavedValue exists');
        
        equals(e2.data('editable').value, 'qwe', 'value taken from text');     
        equals(e2.data('editable').lastSavedValue, 'qwe', 'lastSavedValue taken from text');     
      }) 
      
      test("should take popover's placement and title from json options", function () {
        var editable = $('<a href="#"></a>').appendTo('#qunit-fixture').editable({
              placement: 'bottom',
              title: 'abc'
          })

        editable.click()
        equals(editable.data('popover').options.placement, 'bottom', 'placement ok');
        equals(editable.data('popover').options.originalTitle, 'abc', 'title ok');
        
        editable.data('popover').$tip.find('button[type=button]').click();
        ok(!editable.data('popover').$tip.is(':visible'), 'popover closed');
      })       
})    