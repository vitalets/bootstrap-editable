$(function () {

   $.support.transition = false;
   var fx = $('#async-fixture');
    
    module("text-nosubmit")
      
     test("input should contain '' if element is empty", function () {
        var e = $('<a href="#"></a>').appendTo('#qunit-fixture').editable();
        e.click();
        var p = e.data('popover').$tip;
        ok(!p.find('input[type=text]').val().length, 'input val is empty')
        p.find('button[type=button]').click(); 
        ok(!p.is(':visible'), 'popover was removed')    
      })     
     
     module("text-submit") 
     
      asyncTest("should load correct value and save new entered text (and value)", function () {
        var e = $('<a href="#" data-pk="1" data-url="post.php">abc</a>').appendTo(fx).editable({
             success: function(data) {
                 return false;
             } 
          }),  
          newText = 'cd<e>;"'

        e.click()
        var p = e.data('popover').$tip;
        ok(p.is(':visible'), 'popover visible')
        ok(p.find('.editable-loading').length, 'loading class exists')
        ok(!p.find('.editable-loading').is(':visible'), 'loading class is hidden')
        ok(p.find('input[type=text]').length, 'input exists')
        equal(p.find('input[type=text]').val(), 'abc' , 'input contain correct value')
        p.find('input').val(newText);
        p.find('form').submit(); 
        ok(p.find('.editable-loading').is(':visible'), 'loading class is visible');
        
        setTimeout(function() {
           ok(!p.is(':visible'), 'popover closed')
           equals(e.data('editable').value, newText, 'new text saved to value')
           equals(e.text(), newText, 'new text shown') 
           e.remove();    
           start();  
        }, timeout);                     
      })     
      
     asyncTest("should show error on validation", function () {
        var e = $('<a href="#">abc</a>').appendTo(fx).editable({
              validate: function(value) { if(value == '') return 'required'; }
          }),
          newText = '';

        e.click();
        var p = e.data('popover').$tip;
        p.find('input').val(newText);
        p.find('form').submit(); 
        
        setTimeout(function() {
           ok(p.is(':visible'), 'popover still shown');  
           ok(p.find('.error').length, 'class "error" exists');
           equals(p.find('.help-block').text(), 'required', 'error msg shown');   
           p.find('button[type=button]').click(); 
           ok(!p.is(':visible'), 'popover was removed');
           e.remove();    
           start();   
        }, timeout);                     
     })      
     
     test("test validation map", function () {
        var e = $('<a href="#" class="map" data-name="e">abc</a>').appendTo('#qunit-fixture'),
            e1 = $('<a href="#" class="map" data-name="e1">abc</a>').appendTo('#qunit-fixture'),
            newText = '';
            
            $('.map').editable({
                validate: {
                    e: function(value) { if(value == '') return 'required1'; 
                    },
                    e1:function(value) { if(value == '') return 'required2'; 
                    },
                    e2: 'qwerty' //this should not throw error  
                }
            });
         

        e.click();
        var p = e.data('popover').$tip;
        p.find('input').val(newText);
        p.find('form').submit(); 
        ok(p.is(':visible'), 'popover still shown');  
        ok(p.find('.error').length, 'class "error" exists');
        equals(p.find('.help-block').text(), 'required1', 'error msg shown');   
        p.find('button[type=button]').click(); 
        ok(!p.is(':visible'), 'popover was removed');
        
        e = e1;
        e.click();
        var p = e.data('popover').$tip;
        p.find('input').val(newText);
        p.find('form').submit(); 
        ok(p.is(':visible'), 'popover still shown');  
        ok(p.find('.error').length, 'class "error" exists');
        equals(p.find('.help-block').text(), 'required2', 'error msg shown');   
        p.find('button[type=button]').click(); 
        ok(!p.is(':visible'), 'popover was removed');        
     })        
      
     asyncTest("should show error if success callback return string", function () {
        var e = $('<a href="#" data-pk="1" data-url="post.php">abc</a>').appendTo(fx).editable({
             success: function(data) {
                 return 'error';
             } 
          }),  
          newText = 'cd<e>;"'

        e.click()
        var p = e.data('popover').$tip;

        ok(p.find('input[type=text]').length, 'input exists')
        p.find('input').val(newText);
        p.find('form').submit(); 
        
        setTimeout(function() {
           ok(p.is(':visible'), 'popover still shown');  
           ok(p.find('.error').length, 'class "error" exists');
           equals(p.find('.help-block').text(), 'error', 'error msg shown');   
           p.find('button[type=button]').click(); 
           ok(!p.is(':visible'), 'popover was removed');
           e.remove();    
           start();  
        }, timeout);             
        
      })   
   
            
     
     asyncTest("should show emptytext if entered text is empty", function () {
            var emptytext = 'blabla',
                e = $('<a href="#" data-pk="1" data-url="post.php" data-emptytext="'+emptytext+'">abc</a>').appendTo(fx).editable(),
                newText = '';

            e.click()
            var p = e.data('popover').$tip;
            ok(p.find('input').length, 'input exists')
            p.find('input').val(newText);
            p.find('form').submit(); 
            
            setTimeout(function() {
               ok(!p.is(':visible'), 'popover closed')
               equals(e.data('editable').value, newText, 'value is empty')
               equals(e.text(), emptytext, 'emptytext shown')                 
               e.remove();    
               start();  
            }, timeout);            
      })  
           
       
     asyncTest("should show error when server-side error", function () {
            var e = $('<a href="#" data-pk="1">abc</a>').appendTo(fx).editable({
              url: 'error.php',
              error: function(xhr) {
                  if(xhr.status == 500) return 'Internal server error';
              }  
            }),
            newText = 'cde';

            e.click()
            var p = e.data('popover').$tip;
            ok(p.find('input').length, 'input exists')
            p.find('input').val(newText);
            p.find('form').submit(); 
            
            setTimeout(function() {
               ok(p.is(':visible'), 'popover visible')
               ok(p.find('.error').length, 'class "error" exists')
               equals(p.find('.help-block').text(), 'Internal server error', 'error shown')               
               
               p.find('button[type=button]').click(); 
               ok(!p.is(':visible'), 'popover was removed')
               
               e.remove();  
               start();  
            }, timeout);    
      })                            
              

     module("text-nosend") 

     test("if pk = null --> should save new entered text and value, but no ajax", function () {
            var e = $('<a href="#">abc</a>').appendTo('#qunit-fixture').editable({
              send: 'ifpk'
            }),
            newText = 'cde';

            e.click()
            var p = e.data('popover').$tip;
            ok(p.find('input').length, 'input exists')
            p.find('input').val(newText);
            p.find('form').submit(); 
            
            ok(!p.is(':visible'), 'popover was removed')
            equals(e.data('editable').value, newText, 'new text saved to value')
            equals(e.text(), newText, 'new text shown')
            ok(e.hasClass('editable-changed'), 'has class editable-changed')
      })   
})    