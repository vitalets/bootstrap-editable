$(function () {         

   $.support.transition = false;
   var fx = $('#async-fixture');
    
   module("date")
     
    test("popover should contain ui-datepicker with value", function () {
        var e = $('<a href="#" data-type="date" data-format="dd.mm.yy">15.05.1984</a>').appendTo('#qunit-fixture').editable();
        e.click();
        var p = e.data('popover').$tip;
        ok(p.find('.ui-datepicker').length, 'ui-datepicker exists')
        ok(p.find('.editable-popover-date').length, 'class editable-popover-date exists')    
        equal( $.datepicker.formatDate('dd.mm.yy', e.data('editable').$input.datepicker( "getDate" )), e.data('editable').value, 'date set correct')
        p.find('button[type=button]').click();
        ok(!p.is(':visible'), 'popover closed');
      })     
    
     test("check json config options", function () {
        var format = 'dd.mm.yy',
            v = '15.05.1984',
            e = $('<a href="#" data-type="date">'+v+'</a>').appendTo('#qunit-fixture').editable({
               format: format,
               datepicker: {
                  changeYear: false
               } 
           });

        e.click();
        var p = e.data('popover').$tip;
        ok(!p.find('select.ui-datepicker-year').length, 'select for year not exist')    
        equal( $.datepicker.formatDate(format, e.data('editable').$input.datepicker( "getDate" )), e.data('editable').value, 'date set correct')
        p.find('button[type=button]').click();
        ok(!p.is(':visible'), 'popover closed');
      })        
   
     test("input should contain today if element is empty", function () {
        var e = $('<a href="#" data-type="date"></a>').appendTo('#qunit-fixture').editable()
        e.click()
        var p = e.data('popover').$tip;
        equal( p.find('.ui-datepicker').find('a.ui-state-active').text(), $.datepicker.formatDate('d', new Date()), 'day = today')
        p.find('button[type=button]').click();
        ok(!p.is(':visible'), 'popover closed');      
      })
      
      
  module("date-submit")
  
     asyncTest("should save new entered date (and value)", function () {
        var e = $('<a href="#">15.05.1984</a>').appendTo(fx).editable({
             type: 'date',
             url: 'post.php',
             pk: 1,
             format: 'dd.mm.yy'
          }),  
        nextDate = '16.05.1984';

        e.click();
        var p = e.data('popover').$tip;
        equal( $.datepicker.formatDate('dd.mm.yy', e.data('editable').$input.datepicker( "getDate" )), e.data('editable').value, 'date set correct');
        p.find('.ui-datepicker').find('a.ui-state-active').parent().next().click();
        p.find('form').submit(); 
        
        setTimeout(function() {
           ok(!p.is(':visible'), 'popover closed')
           equal(e.data('editable').value, nextDate, 'new date saved to value')
           equal(e.text(), nextDate, 'new text shown')            
           e.remove();    
           start();  
        }, timeout);                              
     })                        
   
})