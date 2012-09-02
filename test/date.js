$(function () {         

   $.support.transition = false;
   var fx = $('#async-fixture');
    
   module("date", {
        setup: function(){
            $.fn.editable.defaults.name = 'name1';
        },
        teardown: function(){
            $.fn.editable.defaults.name = undefined;
        }
    });
     
    asyncTest("popover should contain datepicker with value and save new entered date", function () {
        var d = '15.05.1984',
            e = $('<a href="#" data-type="date" data-weekstart="1">'+d+'</a>').appendTo(fx).editable({
                format: 'dd.mm.yyyy',
                datepicker: {
                    
                }
            }),
            nextD = '16.05.1984';
            
        e.click();
        var p = e.data('popover').$tip;
        ok(p.find('.datepicker').is(':visible'), 'datepicker exists');
        
        equal(e.data('editable').$input.data('datepicker').getFormattedDate(), d, 'day set correct');
        equal(p.find('td.day.active').text(), 15, 'day shown correct');
        equal(p.find('th.dow').eq(0).text(), 'Mo', 'weekStart correct');

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