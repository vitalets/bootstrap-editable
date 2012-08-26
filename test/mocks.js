var timeout = 200;
$(function () {
    
 $.mockjaxSettings.responseTime = 50;
    
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
        responseText: 'customtext'
    });   
    
    $.mockjax({
        url: 'post-resp.php',
        response: function(settings) {
            this.responseText = settings;  
        }
    });    


  $.support.transition = false; 
  //define name to not put it everywhere
  //$.fn.editable.defaults.name = 'name1';   
    
});
