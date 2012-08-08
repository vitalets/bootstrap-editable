$(function(){
    //ajax mocks
    $.mockjaxSettings.responseTime = 500; 
    
    $.mockjax({
        url: 'post.php',
        responseText: {
            success: true
        }
    });

    $.mockjax({
        url: 'error.php',
        status: 500,
        statusText: 'Internal Server Error',
        responseText: 'Error'
    });
    
    $.mockjax({
        url: 'status.php',
        status: 500,
        responseText: 'Internal Server Error'
    });
  
    $.mockjax({
        url: 'groups.php',
        responseText: {
             0: 'Guest',
             1: 'Service',
             2: 'Customer',
             3: 'Operator',
             4: 'Support',
             5: 'Admin'
        }
    });        
  
    
//    $.fn.editable.defaults.url = 'error.php'; 
    $.fn.editable.defaults.url = 'post.php'; 
    $.fn.editable.defaults.success = function(data) {
         if(typeof data == 'object' && !data.success) return data.msg; 
    }

    $('#username').editable({
                           url: 'post.php',
                           type: 'text',
                           pk: 1,
                           name: 'username',
                           title: 'Enter username'
    });
    $('#firstname').editable({
        validate: function(value) {
           if($.trim(value) == '') return 'This field is required';
        }
    });
    $('#lastname').editable();
    
    $('#sex').editable({
        source:{
            0: 'Male',
            1: 'Female'
        }   
    });    
    
    $('#status, #action').editable({
 
    });   
    
    $('#group').editable({
      //  source: 'groups.php'
    });   

    $('#dob').editable({
        format: 'dd.mm.yy'
    });      
    
    $('#weight').editable({
        url: 'error.php'  
    });     
    
    $('#comments, #note').editable(); 
    
    /* creating new record example */
  
    $.mockjax({
        url: 'new.php',
        responseTime: 500,
        responseText: {
            id: 1
        }
    });          
    
   $('.myeditable').editable({
      url: 'post.php',
      pk: '#user_id',
      validate: {
         username: function(v) {if(v == '') return 'Username is required!'}
      } 
   });
   
   $('#save-btn').click(function() {
       var  $btn = $(this),
            errors = $('.myeditable').editable('validate');
       if($.isEmptyObject(errors)) {
           var data = $('.myeditable').editable('getValue');
           $.post('new.php', data, function(response) {
              $('#user_id').text(response.id); 
              $btn.hide();
              $btn.parent().find('.alert-error').hide();
              $btn.parent().find('.alert-success').show();
              $('.myeditable').editable('markAsSaved');
          }); 
       } else {
          var msg = '<strong>Validation errors!</strong><br>';
          $.each(errors, function(k, v) { msg += v+'<br>'; });
          $btn.parent().find('.alert-error').html(msg).show(); 
       }
   });  
});