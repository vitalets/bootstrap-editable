$(function () {         
  
   $.support.transition = false;
   var fx = $('#async-fixture');
    
   module("api");
      
     test("validate, getValue, mark as saved", function () {
        var e = $(
          '<a href="#" data-type="text" id="username">user</a>' + 
          '<a href="#" data-type="textarea" id="comment">12345</a>' + 
          '<a href="#" data-type="select" id="sex" data-value="1" data-source=\'{"1":"q", "2":"w"}\'>q</a>' + 
          '<a href="#" data-type="date" id="dob">12345</a>'
         ).appendTo('#qunit-fixture');
        
        e = $('#qunit-fixture').find('a').editable({
           validate: {
                 username: function(value) {
                     if($.trim(value) !== 'user1') return 'username is required';
                 },
                 sex: function(value) {
                     if($.trim(value) != 2) return 'error';
                 }
             }
        });
        
        //check get value
        var values = e.editable('getValue');

        equal(values.username, 'user', 'username ok') ;
        equal(values.comment, '12345', 'comment ok') ;
        equal(values.sex, 1, 'sex ok') ;
        equal(values.dob, '12345', 'dob ok') ;
        
        //validate
        var errors = e.editable('validate'); 
        ok(errors.username && errors.sex && !errors.comment, 'validation failed ok');
        
        //enter correct values
        var e2 = $('#username');
        e2.click();
        var p = e2.data('popover').$tip;
        p.find('input').val('user1');
        p.find('button.btn-primary').click(); 
        ok(!p.is(':visible'), 'username changed');         
        
        e2 = $('#sex');
        e2.click();
        p = e2.data('popover').$tip;
        p.find('select').val(2);
        p.find('button.btn-primary').click(); 
        ok(!p.is(':visible'), 'sex changed');         
        
        //validate again
        var errors = e.editable('validate'); 
        ok($.isEmptyObject(errors), 'validation ok');  
        
        equal(e.filter('.editable-changed').length, 2, 'editable-changed exist');
        e.editable('markAsSaved');      
        ok(!e.filter('.editable-changed').length, 'editable-changed not exist');
    });
     
      asyncTest("'update' event", function () {
        expect(2);
        var e = $('<a href="#" data-pk="1" data-url="post.php" data-name="text1">abc</a>').appendTo(fx).editable(),
            e_nopk = $('<a href="#" data-url="post.php" data-name="text1">abc</a>').appendTo(fx).editable(),
            newVal = 'xyt';
        
        e.on('update', function() {
             equal($(this).data('editable').value, newVal, 'triggered update after submit');
        });

        e_nopk.on('update', function() {
             equal($(this).data('editable').value, newVal, 'triggered update after no-submit');
        });

        e_nopk.click();
        var p = e_nopk.data('popover').$tip;
        p.find('input').val(newVal);
        p.find('form').submit();        
                              
        e.click();
        p = e.data('popover').$tip;
        p.find('input').val(newVal);
        p.find('form').submit();
                
        setTimeout(function() {
           e.remove();    
           e_nopk.remove();    
           start();  
        }, timeout);                     
      });     
      
     test("'init' event", function () {
        expect(1);
        var e = $('<a href="#" data-pk="1" data-url="post.php" data-name="text1">abc</a>').appendTo('#qunit-fixture');
        
        e.on('init', function(e, editable) {
             equal(editable.value, 'abc', 'init triggered, value correct');
        });

        e.editable();
      });      
      
     asyncTest("'render' event for text", function () {
        expect(4);
        var val = 'afas',
            e = $('<a href="#" data-pk="1" data-type="text" data-url="post.php" data-name="text1">'+val+'</a>').appendTo(fx),
            isInit = true;
        
        e.on('render', function(e, editable) {
             equal(e.isInit, isInit, 'isInit flag correct');
             equal(editable.value, val, 'init triggered, value correct');
        });

        e.editable();   
        
        isInit = false;
        val = '123';
        
        e.click();
        var p = e.data('popover').$tip;
        p.find('input[type=text]').val(val);
        p.find('form').submit(); 
        
        setTimeout(function() {
           e.remove();    
           start();  
        }, timeout);                     
        
     });    
     
    asyncTest("'render' event for select", function () {
        expect(4);
        var val = '1',
            e = $('<a href="#" data-pk="1" data-type="select" data-url="post.php" data-name="text1" data-value="'+val+'"></a>').appendTo(fx),
            isInit = true;
        
        e.on('render', function(e, editable) {
             equal(e.isInit, isInit, 'isInit flag correct');
             equal(editable.value, val, 'init triggered, value correct');
        });

        e.editable({
            source: 'groups.php',
            autotext: 'always'
        });
        
        setTimeout(function() {
            isInit = false;
            val = '3';
            
            e.click();
            var p = e.data('popover').$tip;
            p.find('select').val(val);
            p.find('form').submit(); 
            
            setTimeout(function() {
               e.remove();    
               start();  
            }, timeout);  
        }, timeout);                                        
        
     });           
    
     test("show / hide methods", function () {
        var e = $('<a href="#" data-pk="1" data-url="post.php" data-name="text1">abc</a>').appendTo('#qunit-fixture').editable();
        e.editable('show');
        var p = e.data('popover').$tip;
        ok(p.is(':visible'), 'popover shown');
        e.editable('hide');
        ok(!p.is(':visible'), 'popover closed');
     });      
         
});            