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
        responseText: 'Internal Server Error'
    });   
    
    $.mockjax({
        url: 'post-resp.php',
        response: function(settings) {
            this.responseText = settings;  
        }
    });    
    
    
});