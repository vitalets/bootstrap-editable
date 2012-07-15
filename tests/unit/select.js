$(function () {

    $.support.transition = false;
    var fx = $('#async-fixture');    
    
    var groups =  {
            0: 'Guest',
            1: 'Service',
            2: 'Customer',
            3: 'Operator',
            4: 'Support',
            5: 'Admin',
            6: '',
            '': 'Nothing'
      }, size = 0;
      
    for (e in groups) { size++; }
    
    
    $.mockjax({
        url: 'groups.php',
        responseText: groups
    });

    $.mockjax({
        url: 'groups-error.php',
        status: 500,
        responseText: 'Internal Server Error'
    });   
   
    module("select-load")  

    test("popover should contain SELECT even if value & source not defined", function () {
        $.support.transition = false
        var  e = $('<a href="#" data-type="select">w</a>').appendTo('#qunit-fixture').editable();
        
        e.click();
        var p = e.data('popover').$tip;
        ok(p.find('select').length, 'select exists')
        p.find('button[type=button]').click(); 
        ok(!p.is(':visible'), 'popover was removed');        
      })  
    
     asyncTest("load options from server", function () {
         var e = $('<a href="#" data-type="select" data-value="2" data-source="groups.php">customer</a>').appendTo(fx).editable();

        e.click();
        var p = e.data('popover').$tip;    
        ok(p.find('.editable-loading').is(':visible'), 'loading class is visible');
        
        setTimeout(function() {
            ok(p.is(':visible'), 'popover visible')
            ok(p.find('.editable-loading').length, 'loading class exists')
            ok(!p.find('.editable-loading').is(':visible'), 'loading class is hidden')
            ok(p.find('select').length, 'select exists')
            equal(p.find('select').find('option').length, size, 'options loaded')
            equal(p.find('select').val(), e.data('editable').value, 'selected value correct') 
            p.find('button[type=button]').click(); 
            ok(!p.is(':visible'), 'popover was removed');  
            e.remove();    
            start();  
        }, timeout);                     
    })      
    
     test("load options from array", function () {
         var e = $('<a href="#" data-type="select" data-value="2" data-url="post.php">customer</a>').appendTo('#qunit-fixture').editable({
             pk: 1,
             source: groups
          });

        e.click()
        var p = e.data('popover').$tip;
        ok(p.is(':visible'), 'popover visible')
        ok(p.find('.editable-loading').length, 'loading class exists')
        ok(!p.find('.editable-loading').is(':visible'), 'loading class is hidden')
        ok(p.find('select').length, 'select exists')
        equal(p.find('select').find('option').length, size, 'options loaded')
        equal(p.find('select').val(), e.data('editable').value, 'selected value correct') 
        p.find('button[type=button]').click(); 
        ok(!p.is(':visible'), 'popover was removed');  
    })       
                    
     asyncTest("should show error if options cant be loaded", function () {
        var e = $('<a href="#" data-type="select" data-value="2" data-source="groups-error.php">customer</a>').appendTo(fx).editable();

        e.click();
        var p = e.data('popover').$tip;    
        
        setTimeout(function() {
            ok(p.is(':visible'), 'popover visible')
            ok(p.find('select:disabled').length, 'select disabled')   
            ok(!p.find('select').find('option').length, 'options not loaded')   
            ok(p.find('button[type=submit]:disabled').length, 'submit-btn disabled')
            ok(p.find('.help-block').text().length, 'error shown')              
            p.find('button[type=button]').click(); 
            ok(!p.is(':visible'), 'popover was removed');  
            e.remove();    
            start();  
        }, timeout);                     
    })           
   
 
    module("select-submit")
      
    asyncTest("popover should save new selected value", function () {
         var e = $('<a href="#" data-type="select" data-value="2" data-url="post.php">customer</a>').appendTo(fx).editable({
             pk: 1,
             source: groups
        }),
        selected = 3;

        e.click()
        var p = e.data('popover').$tip;
        ok(p.is(':visible'), 'popover visible')
        ok(p.find('select').length, 'select exists')
        equal(p.find('select').find('option').length, size, 'options loaded')
        equal(p.find('select').val(), e.data('editable').value, 'selected value correct') 

        p.find('select').val(selected);
        p.find('form').submit(); 
        ok(p.find('.editable-loading').is(':visible'), 'loading class is visible');
         
         setTimeout(function() {
               ok(!p.is(':visible'), 'popover closed')
               equals(e.data('editable').value, selected, 'new value saved')
               equals(e.text(), groups[selected], 'new text shown') 
               e.remove();    
               start();  
         }, timeout);                              
    })                  
   
   
     asyncTest("if new text is empty --> show emptytext on save", function () {
        var e = $('<a href="#" data-type="select" data-value="2" data-url="post.php">customer</a>').appendTo(fx).editable({
             pk: 1,
             source: groups
        }),
        selected = 6;

        e.click()
        var p = e.data('popover').$tip;
        ok(p.is(':visible'), 'popover visible')
        ok(p.find('select').length, 'select exists')
        equal(p.find('select').find('option').length, size, 'options loaded')
        equal(p.find('select').val(), e.data('editable').value, 'selected value correct') 

        p.find('select').val(selected);
        p.find('form').submit(); 
         
         setTimeout(function() {
               ok(!p.is(':visible'), 'popover closed')
               equals(e.data('editable').value, selected, 'new value saved')
               equals(e.text(), e.data('editable').settings.emptytext, 'emptytext shown') 
               e.remove();    
               start();  
         }, timeout);     
     })                        
   
   
     asyncTest("if new value is empty --> show work correct", function () {
         var e = $('<a href="#" data-type="select" data-value="2" data-url="post.php">customer</a>').appendTo(fx).editable({
             pk: 1,
             source: groups
        }),
        selected = '';

        e.click()
        var p = e.data('popover').$tip;
        ok(p.is(':visible'), 'popover visible')
        ok(p.find('select').length, 'select exists')
        equal(p.find('select').find('option').length, size, 'options loaded')
        equal(p.find('select').val(), e.data('editable').value, 'selected value correct') 

        p.find('select').val(selected);
        p.find('form').submit(); 
         
         setTimeout(function() {
               ok(!p.is(':visible'), 'popover closed')
               equals(e.data('editable').value, selected, 'new value saved')
               equals(e.text(), groups[selected], 'text shown correctly') 
               e.remove();    
               start();  
         }, timeout);   
     })      
})