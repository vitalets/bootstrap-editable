/* =========================================================
 * bootstrap-editable.js 
 * http://www.eyecon.ro/bootstrap-datepicker
 * =========================================================
 * Copyright 2012 Vitaliy Potapov
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================= */
 
!function( $ ) {
   
  //Editable object 
  var Editable = function ( element, options ) {
      this.$element = $(element);

      //if exists 'placement' or 'title' options, copy them to data attributes to aplly for popover 
      if(options && options.placement && !this.$element.data('placement')) this.$element.attr('data-placement', options.placement);
      if(options && options.title && !this.$element.data('original-title')) this.$element.attr('data-original-title', options.title);
      
     //detect type
      var type = (this.$element.data().type || (options && options.type) ||  $.fn.editable.defaults.type),
          typeDefaults = ($.fn.editable.types[type]) ? $.fn.editable.types[type] : {};
          
      //apply options    
      this.settings = $.extend({}, $.fn.editable.defaults, typeDefaults, options, this.$element.data());

      //if validate is map take only needed function
      if(typeof this.settings.validate == 'object' && this.settings.name in this.settings.validate) {
          this.settings.validate = this.settings.validate[this.settings.name];
      }
      
      if(typeof this.settings.init == 'function') this.settings.init.call(this, options);
      
      //error occured while rendering content
      this.errorOnRender = false;
      
      //add editable class
      this.$element.addClass('editable');
    
      //bind click event
      this.$element.on('click', $.proxy(this.click, this));
      
      //store name
      this.name = this.settings.name;
      
      //set value of element
      if (this.settings.value == undefined) {
         this.value = (this.settings.type == 'textarea') ? this.$element.html().replace(/<br\s*\/?>/gi, "\n") : this.$element.text(); 
      } else {
         this.value = this.settings.value; 
      }
      this.lastSavedValue = this.value; //also storing last saved value
      
      //show emptytext if needed
      this.handleEmpty();
  }
  
  Editable.prototype = {
     constructor: Editable,
     
     click: function(e) {
          e.stopPropagation();
          e.preventDefault();  
          
          if(!this.$element.data('popover')) { // for the first time render popover and show
              this.$element.popover({
                  trigger: 'manual',
                  placement: 'top',
                  content: this.settings.loading,
                  template: '<div class="popover"><div class="arrow"></div><div class="popover-inner '+this.settings.popoverClass+'"><h3 class="popover-title"></h3><div class="popover-content"><p></p></div></div></div>'
              }); 
          }

          this.startShow.call(this);
     },
     
     startShow: function () {
          this.$element.popover('show');
          this.$element.addClass('editable-open');  
          this.errorOnRender = false;
          this.settings.render.call(this); 
     },     
 
     endShow: function() {
         var $tip = this.$element.data('popover').tip(),
             that = this;
             
         //render content & input
         this.$content = $(this.settings.formTemplate);
         this.$content.find('div.control-group').prepend(this.$input);
             
         //show form
         $tip.find('.popover-content p').append(this.$content);
         
         if(this.errorOnRender) {
             this.$input.attr('disabled', true);
             $tip.find('button[type=submit]').attr('disabled', true);
             $tip.find('form').submit(function() {return false;}); 
             this.enableContent(this.errorOnRender);
         } else {
             this.$input.removeAttr('disabled');
             $tip.find('button[type=submit]').removeAttr('disabled');             
             //bind form submit
             $tip.find('form').submit($.proxy(this.submit, this));  
             //show content (and hide loading)
             this.enableContent();
             //set input value            
             this.settings.setInputValue.call(this);
         }
         
         //bind popover hide on button
         $tip.find('button[type=button]').click($.proxy(this.hide, this));          
         //bind popover hide on escape
         $(document).on('keyup.editable', function ( e ) {
            e.which == 27 && that.hide();
         });
     },
 
     submit: function(e) {
          e.stopPropagation();
          e.preventDefault();  
          
          //validation
          var error, 
              value = this.$input.val();
          if(typeof this.settings.validate == 'function' && (error = this.settings.validate.call(this, value))) {
              this.enableContent(error);
              if(this.settings.type == 'text' || this.settings.type == 'textarea') {
                  this.$input.focus();
              }
              return;
          }
         
          //getting primary key
          var pk = (typeof this.settings.pk == 'function') ? this.settings.pk.call(this) : this.settings.pk;
          var send = (this.settings.url != undefined) && ((this.settings.send == 'always') || (this.settings.send == 'ifpk' && pk));
          
          if(send) { //send to server
              var params = $.extend({}, this.settings.params, {value: value}),
                  that = this;
                
              //hide form, show loading
              this.enableLoading();
                            
              //adding name and pk    
              if(pk) params.pk = pk;   
              if(this.settings.name) params.name = this.settings.name;   
              var url = (typeof this.settings.url == 'function') ? this.settings.url.call(this) : this.settings.url;
              $.ajax({
                  url: url, 
                  params: params, 
                  method: 'post',
                  success: function(data) {
                      //check response
                      if(typeof that.settings.success == 'function' && (error = that.settings.success.call(that, data))) {
                          //show form with error message
                          that.enableContent(error);
                      } else {
                          //set new value and text
                          that.value = that.settings.getInputValue.call(that);           
                          that.settings.setText.call(that);
                          that.markAsSaved();
                          that.handleEmpty();      
                          that.hide();                           
                      }
                  },
                  error: function() {
                      that.enableContent('Server error'); 
                  }     
              });
          } else { //do not send to server   
              //set new value and text             
              this.value = this.settings.getInputValue.call(this);
              this.settings.setText.call(this);  
              //to show that value modified but not saved 
              this.markAsUnsaved();
              this.handleEmpty();   
              this.hide();
          }
     },

     hide: function() { 
        //  alert(this.$content.html());
          this.$element.popover('hide');
       //   alert(this.$content.html());
          this.$element.removeClass('editable-open');
          $(document).off('keyup.editable');
     },
     
     enableContent: function(error) {
         if(error != undefined && error.length > 0) {
             this.$content.find('div.control-group').addClass('error').find('span.help-block').html(error);
         } else {
             this.$content.find('div.control-group').removeClass('error').find('span.help-block').html('');
         }
         this.$content.show();  
         //hide loading
         this.$element.data('popover').tip().find('.editable-loading').hide();  
     },

     enableLoading: function() {
         this.$content.hide();  
         this.$element.data('popover').tip().find('.editable-loading').show();  
     },     
     
     handleEmpty: function() {
        (this.$element.text() == '') ? this.$element.addClass('editable-empty').text(this.settings.emptytext) : this.$element.removeClass('editable-empty');
     },
                                                        
     validate: function() {
        if(typeof this.settings.validate == 'function') return this.settings.validate.call(this, this.value); 
     },
     
     markAsUnsaved: function() {
         (this.value != this.lastSavedValue) ? this.$element.addClass('editable-changed') : this.$element.removeClass('editable-changed');  
     },     
     
     markAsSaved: function() {
         this.lastSavedValue = this.value;
         this.$element.removeClass('editable-changed');  
     }
  }
     
  
 /* EDITABLE PLUGIN DEFINITION
  * ======================= */  

  $.fn.editable = function (option) {
      return this.each(function () {
          var $this = $(this)
          , data = $this.data('editable')
          , options = typeof option == 'object' && option;
          if (!data) $this.data('editable', (data = new Editable(this, options)));
          if (typeof option == 'string') data[option](); 
      });      
  }
  
  $.fn.editable.Constructor = Editable;

  //defaults
  $.fn.editable.defaults = {
    emptytext: 'Empty',
    url: null,
    type: 'text',  //input type
    name: null,    //field name
    pk: null,     //primary key or record
    value: null,  //real value, not shown. Especially usefull for select
    params: null,   //additional params to submit
    send: 'ifpk', // strategy for sending data on server: 'always', 'never', 'ifpk' (default)
    
    validate: function() { }, //client-side validation. If returns msg - data will not be sent
    success: function(data) { }, //after send callback
    
   /* can be overriden in input type defaults */
    
    popoverClass: 'editable-popover-text', //to define size of popover for correct positioning
    formTemplate: '<form class="form-inline" style="margin-bottom: 0" autocomplete="off">'+
                       '<div class="control-group">'+
                           '&nbsp;<button type="submit" class="btn btn-primary"><i class="icon-ok icon-white"></i></button>&nbsp;<button type="button" class="btn"><i class="icon-ban-circle"></i></button>'+
                           '<span class="help-block" style="clear: both"></span>'+
                       '</div>'+
                  '</form>',
    loading: '<div class="editable-loading"></div>',    
    // render function should put jQuery object of input in this.$input and call this.endShow()
    render: function() {                  
        this.$input = $(this.settings.template);
        this.endShow();
    },
    // this function called every time popover shown. Should set value of this.$input
    setInputValue: function() {           
        this.$input.val(this.value);
        this.$input.focus();
    }, 
    //getter for value from input
    getInputValue: function() { 
        return this.$input.val();
    },    
    //setting text of element
    setText: function() {
        this.$element.text(this.value); 
    }
  };
  

  
  //input types
  $.fn.editable.types = {
      //text
      text: {
          template: '<input type="text" class="span2">',
          setInputValue: function() {
              this.$input.val(this.value);
              setCursorPosition.call(this.$input, this.$input.val().length);
              this.$input.focus();
          }
      },
      
      //select
      select: {
          template: '<select class="span2"></select>',
          source: null,
          render: function() {
              var that = this;
              this.$input = $(this.settings.template);

              function setOptions(source) {
                  if(typeof source == 'object' && source != null) {
                      $.each(source, function(key, value) {   
                          that.$input.append($('<option>', { value : key }).text(value)); 
                      });    
                  }
              }

              if(typeof this.settings.source == 'string' ) { //ajax loading from server
                  $.ajax({
                      url: this.settings.source, 
                      method: 'get',
                      success: function(data) {
                          that.settings.source = data;
                          setOptions(data);
                          that.endShow();
                      },
                      error: function() {
                          that.errorOnRender = 'Error when loading options';
                          that.endShow();
                      }
                  });
              } else {
                  setOptions(this.settings.source);
                  this.endShow();
              }
          },          
          getInputValue: function() {
              return this.$input.find('option:selected').val();      
          },   
          setText: function() {
              if(this.value in this.settings.source) {
                  this.$element.text(this.settings.source[this.value]);
              } else {
                  this.$element.text('');
              }
          }                            
      },

      //textarea
      textarea: {
          template: '<textarea class="span4" rows="8"></textarea>',
          popoverClass: 'editable-popover-textarea', 
          setInputValue: function() {
              this.$input.val(this.value);
              setCursorPosition.apply(this.$input, [this.$input.val().length]);
              this.$input.focus();
          },
          setText: function() {
              var lines = this.value.split("\n");
              for(var i = 0; i< lines.length; i++) lines[i] = $('<div>').text(lines[i]).html();
              var text = lines.join('<br>');
              this.$element.html(text); 
          }
      },
      
     /*
      date
      requires jQuery UI datepicker under bootstrap theme: http://addyosmani.github.com/jquery-ui-bootstrap/
      */
      date: {
          template: '<div style="float: left"></div>',
          popoverClass: 'editable-popover-date',
          datepicker: {
              dateFormat: 'yy-mm-dd',
              changeMonth: true,
              changeYear: true
          },
          init: function(options) {
              //dateFormat can be set from data-format attribute
              var dateFormat = this.settings.format,
                  options = options ? options : {};

              if(dateFormat) {
                  options.datepicker = $.extend({}, options.datepicker, {dateFormat: dateFormat});
              }

              //overriding datepicker config
              if(options.datepicker) this.settings.datepicker = $.extend({}, $.fn.editable.types.date.datepicker, options.datepicker);   
          },
          render: function() {
              this.$input = $(this.settings.template);      
              this.$input.datepicker(this.settings.datepicker);
              this.endShow();
          },
          setInputValue: function() {
              this.$input.datepicker('setDate', this.value);
          }
      }              
  };  

/**
* set caret position in input
* see http://stackoverflow.com/questions/499126/jquery-set-cursor-position-in-text-area     
*/
function setCursorPosition(pos) {
  this.each(function(index, elem) {
    if (elem.setSelectionRange) {
      elem.setSelectionRange(pos, pos);
    } else if (elem.createTextRange) {
      var range = elem.createTextRange();
      range.collapse(true);
      range.moveEnd('character', pos);
      range.moveStart('character', pos);
      range.select();
    }
  });
  return this;
};
    
  
}( window.jQuery );  
    