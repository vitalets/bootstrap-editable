(function($) {
    
   $.support.transition = false;
   var fx = $('#async-fixture');    
    
    module("common");
    
      test("should be defined on jquery object", function () {
        var div = $("<div id='modal-test'></div>")
        ok(div.editable, 'editable method is defined')
      });
      
      test("should return element", function () {
        var div = $('<div></div>');
        ok(div.editable() == div, 'element returned');
      });  
      
      test("should expose defaults var for settings", function () {
        ok($.fn.editable.defaults, 'default object exposed');
      });    
      
      test("should store editable instance in data object", function () {
        var editable = $('<a href="#">link</a>').editable();
        ok(!!editable.data('editable'), 'editable instance exists');
      });      
      
      test("should add 'editable' class when applied", function () {
        var editable = $('<a href="#">link</a>').appendTo('#qunit-fixture').editable();
        ok($('.editable').length, 'editable class exists');
      });
      
      test("should store name, value and lastSavedValue", function () {
        var v = 'abr><"&',
            esc_v = $('<div>').html(v).text(),
            editable = $('<a href="#123" data-name="abc" data-value="123">qwe</a>').appendTo('#qunit-fixture').editable(),
            e2 = $('<a href="#">'+esc_v+'</a>').appendTo('#qunit-fixture').editable();
       
        equal(editable.data('editable').name, 'abc', 'name exists');
        equal(editable.data('editable').value, '123', 'value exists');
        equal(editable.data('editable').lastSavedValue, '123', 'lastSavedValue exists');
        
        equal(e2.data('editable').value, v, 'value taken from elem content correctly');     
        equal(e2.data('editable').lastSavedValue, v, 'lastSavedValue taken from text correctly');     
      }); 
      
      test("should take popover's placement and title from json options", function () {
        var editable = $('<a href="#"></a>').appendTo('#qunit-fixture').editable({
              placement: 'bottom',
              title: 'abc'
        });

        editable.click();
        ok(editable.data('popover').$tip.is(':visible'), 'popover shown');
        equal(editable.data('popover').options.placement, 'bottom', 'placement ok');
        equal(editable.data('popover').options.originalTitle, 'abc', 'title ok');

        editable.data('popover').$tip.find('button[type=button]').click();
        ok(!editable.data('popover').$tip.is(':visible'), 'popover closed');
      });   
      
      test("should close all other popovers on click", function () {
        var e1 = $('<a href="#" data-pk="1" data-url="post.php">abc</a>').appendTo('#qunit-fixture').editable(),  
            e2 = $('<a href="#" data-pk="1" data-url="post.php">abcd</a>').appendTo('#qunit-fixture').editable();  

        e1.click()
        var p1 = e1.data('popover').$tip;
        ok(p1.is(':visible'), 'popover1 visible');
        
        e2.click()
        var p2 = e2.data('popover').$tip;
        ok(p2.is(':visible'), 'popover2 visible');
        ok(!p1.is(':visible'), 'popover1 closed');
        
        p2.find('button[type=button]').click();
        ok(!p2.is(':visible'), 'popover2 closed');
      });
      
      test("enablefocus option", function () {
            var e = $('<a href="#">abc</a>').appendTo('#qunit-fixture').editable({
              enablefocus: true
            }),
             e1 = $('<a href="#">abcd</a>').appendTo('#qunit-fixture').editable({
              enablefocus: false
            });            
            
            e.click()
            var p = e.data('popover').$tip;
            ok(p.is(':visible'), 'popover 1 visible');
            p.find('button[type=button]').click();
            ok(!p.is(':visible'), 'popover closed');            
            ok(e.is(':focus'), 'element 1 is focused');            
            
            e1.click()
            p = e1.data('popover').$tip;
            ok(p.is(':visible'), 'popover 2 visible');
            p.find('button[type=button]').click();
            ok(!p.is(':visible'), 'popover closed');            
            ok(!e1.is(':focus'), 'element 2 is not focused');            
      });  
          
}(jQuery));  