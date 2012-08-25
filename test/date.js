$(function () {         

   $.support.transition = false;
   var fx = $('#async-fixture');
    
   module("date")
     
    asyncTest("popover should contain datepicker with value and save new entered date", function () {
        var d = '15/05/1984',
            e = $('<a href="#" data-type="date">'+d+'</a>').appendTo(fx).editable(),
            nextD = '16/05/1984';
            
        e.click();
        var p = e.data('popover').$tip;
        ok(p.find('.datepicker').is(':visible'), 'datepicker exists');
        ok(p.find('.editable-popover-date').length, 'class editable-popover-date exists');
        
        equal(e.data('editable').$input.data('datepicker').getFormattedDate(), d, 'day set correct');
        equal(p.find('td.day.active').text(), 15, 'day shown correct');

        //set new day
        p.find('td.day.active').next().click();
        p.find('form').submit();
        
        setTimeout(function() {
           ok(!p.is(':visible'), 'popover closed')
           equal(e.data('editable').value, nextD, 'new date saved to value')
           equal(e.text(), nextD, 'new text shown')            
           e.remove();    
           start();  
        }, timeout); 
     });  
     
     //todo: test options   
    /*
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
     */
     
     test("input should contain today if element is empty", function () {
        var e = $('<a href="#" data-type="date"></a>').appendTo('#qunit-fixture').editable();
        e.click();
        var p = e.data('popover').$tip,
            date1 = e.data('editable').$input.data('datepicker').date,
            date2 = new Date();
        
        equal(date1.setTime(0,0,0), date2.setTime(0,0,0), 'today set correct');
        
        p.find('button[type=button]').click();
        ok(!p.is(':visible'), 'popover closed');      
      });
   
});