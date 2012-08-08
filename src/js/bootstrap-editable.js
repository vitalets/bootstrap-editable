(function( $ ) {
   
  //Editable object 
  var Editable = function ( element, options ) {
      this.$element = $(element);

      //if exists 'placement' or 'title' options, copy them to data attributes to aplly for popover 
      if(options && options.placement && !this.$element.data('placement')) {
          this.$element.attr('data-placement', options.placement);
      }
      if(options && options.title && !this.$element.data('original-title')) {
          this.$element.attr('data-original-title', options.title);
      }
      
     //detect type
      var type = (this.$element.data().type || (options && options.type) ||  $.fn.editable.defaults.type),
          typeDefaults = ($.fn.editable.types[type]) ? $.fn.editable.types[type] : {};
          
      //apply options    
      this.settings = $.extend({}, $.fn.editable.defaults, $.fn.editable.types.defaults, typeDefaults, options, this.$element.data());
      
      //store name
      this.name = this.$element.attr('name') || this.$element.attr('id') || this.settings.name; 
      if(!this.name) {
        $.error('You should define name (or id) for Editable element');     
      }
      
      //if validate is map take only needed function
      if(typeof this.settings.validate === 'object' && this.name in this.settings.validate) {
          this.settings.validate = this.settings.validate[this.name];
      }
      //apply specific init() if defined
      if(typeof this.settings.init === 'function') {
          this.settings.init.call(this, options);
      }
      
      //set toggle element
      if(this.settings.toggle) {
          this.$toggle = $(this.settings.toggle);
          //insert in DOM if needed
          if(!this.$toggle.parent().length) {
              this.$element.after(this.$toggle);
          }
  
          //prevent tabstop on container element
          this.$element.attr('tabindex', -1);
      } else {
          this.$toggle = this.$element;
      }      
                                  
      //error occured while rendering content
      this.errorOnRender = false;
      
      //add editable class
      this.$element.addClass('editable');
    
      //bind click event
      this.$toggle.on('click', $.proxy(this.click, this));
      
      //set value from settings or by element text
      if (this.settings.value === undefined || this.settings.value === null) {
         this.settings.setValueByText.call(this);
      } else {
         this.value = this.settings.value; 
      }
      
      //also storing last saved value (initially equals to value)
      this.lastSavedValue = this.value; 
      
      //set element text by value (if option autotext = true)
      if(this.settings.autotext) {
          this.settings.setTextByValue.call(this);
      }
      
      //show emptytext if visible text is empty
      this.handleEmpty();
  };
  
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
          
          if(this.$element.data('popover').tip().is(':visible')) {
             this.hide(); 
          } else {
             this.startShow();
          }
     },
     
     startShow: function () {
          //hide all other popovers if shown
          $('.popover').find('form').find('button.editable-cancel').click();

          //show popover
          this.$element.popover('show');
          this.$element.addClass('editable-open');  
          this.errorOnRender = false;
          this.settings.renderInput.call(this); 
     },     
 
     endShow: function() {
         var $tip = this.$element.data('popover').tip();
             
         //render content & input
         this.$content = $(this.settings.formTemplate);
         this.$content.find('div.control-group').prepend(this.$input);
             
         //show form
         $tip.find('.popover-content p').append(this.$content);
         
         if(this.errorOnRender) {
             this.$input.attr('disabled', true);
             $tip.find('button.btn-primary').attr('disabled', true);
             $tip.find('form').submit(function() {return false;}); 
             //show error
             this.enableContent(this.errorOnRender);
         } else {
             this.$input.removeAttr('disabled');
             $tip.find('button.btn-primary').removeAttr('disabled');             
             //bind form submit
             $tip.find('form').submit($.proxy(this.submit, this));  
             //show input (and hide loading)
             this.enableContent();
             //set input value            
             this.settings.setInputValue.call(this);
         }
         
         //bind popover hide on button
         $tip.find('button.editable-cancel').click($.proxy(this.hide, this));          
         
         //bind popover hide on escape
         var that = this;
         $(document).on('keyup.editable', function(e) {
             if(e.which === 27) {
                 e.stopPropagation();
                 that.hide();
             }
         });         
     },
              
     submit: function(e) {
          e.stopPropagation();
          e.preventDefault();  
          
          var error, pk, params,
              that = this,
              value = this.settings.getInputValue.call(this);

          //validation              
          if(error = this.validate(value)) {
              this.enableContent(error);
              //TODO: find elegant way to exclude hardcode of types here
              if(this.settings.type === 'text' || this.settings.type === 'textarea') {
                  this.$input.focus();
              }
              return;
          }
         
          //getting primary key
          if(typeof this.settings.pk === 'function') {
              pk = this.settings.pk.call(this.$element);
          } else if(typeof this.settings.pk === 'string' && $(this.settings.pk).length === 1 && $(this.settings.pk).parent().length) { //pk is ID of existing element
              pk = $(this.settings.pk).text();
          } else {
              pk = this.settings.pk;
          }
          var send = (this.settings.url !== undefined) && ((this.settings.send === 'always') || (this.settings.send === 'ifpk' && pk));
          
          if(send) { //send to server
          
              //try parse json in single quotes
              this.settings.params = tryParseJson(this.settings.params, true);
              
              params = (typeof this.settings.params === 'string') ? {params: this.settings.params} : $.extend({}, this.settings.params);
              params.value = value;
                
              //hide form, show loading
              this.enableLoading();
                            
              //adding name and pk    
              if(pk) {
                  params.pk = pk;   
              }
              if(this.settings.name) {
                  params.name = this.settings.name;   
              }
              var url = (typeof this.settings.url === 'function') ? this.settings.url.call(this) : this.settings.url;
              $.ajax({
                  url: url, 
                  data: params, 
                  type: 'post',
                  dataType: 'json',
                  success: function(data) {
                      //check response
                      if(typeof that.settings.success === 'function' && (error = that.settings.success.apply(that, arguments))) {
                          //show form with error message
                          that.enableContent(error);
                      } else {
                          //set new value and text
                          that.value = value;
                          that.settings.setTextByValue.call(that);
                          that.markAsSaved();
                          that.handleEmpty();      
                          that.hide();                           
                      }
                  },
                  error: function(xhr) {
                      var msg = (typeof that.settings.error === 'function') ? that.settings.error.apply(that, arguments) : null;
                      that.enableContent(msg || xhr.statusText); 
                  }     
              });
          } else { //do not send to server   
              //set new value and text             
              this.value = value;
              this.settings.setTextByValue.call(this);  
              //to show that value modified but not saved 
              this.markAsUnsaved();
              this.handleEmpty();   
              this.hide();
          }
     },

     hide: function() { 
          this.$element.popover('hide');
          this.$element.removeClass('editable-open');
          $(document).off('keyup.editable');
          
          //returning focus on element if needed
          if(this.settings.enablefocus || this.$element.get(0) !== this.$toggle.get(0)) {
              this.$toggle.focus();
          }
     },
     
     /**
     * show input inside popover
     */
     enableContent: function(error) {
         if(error !== undefined && error.length > 0) {
             this.$content.find('div.control-group').addClass('error').find('span.help-block').text(error);
         } else {
             this.$content.find('div.control-group').removeClass('error').find('span.help-block').text('');
         }
         this.$content.show();  
         //hide loading
         this.$element.data('popover').tip().find('.editable-loading').hide();  
     },

     /**
     * show loader inside popover
     */
     enableLoading: function() {
         this.$content.hide();  
         this.$element.data('popover').tip().find('.editable-loading').show();  
     },     
     
     handleEmpty: function() {
         if(this.$element.text() === '') {
             this.$element.addClass('editable-empty').text(this.settings.emptytext);
         } else {
             this.$element.removeClass('editable-empty');
         }
     },
                                                        
     validate: function(value) {
         if(value === undefined) {
             value = this.value;
         }
         if(typeof this.settings.validate === 'function') {
             return this.settings.validate.call(this, value); 
         } 
     },
     
     markAsUnsaved: function() {
        if(this.value !== this.lastSavedValue) {
            this.$element.addClass('editable-changed');
        } else {
            this.$element.removeClass('editable-changed');  
        }
     },     
     
     markAsSaved: function() {
         this.lastSavedValue = this.value;
         this.$element.removeClass('editable-changed');  
     }
  };
     
  
 /* EDITABLE PLUGIN DEFINITION
  * ======================= */  

  $.fn.editable = function (option) {
      //special methods returning non-jquery object
      var result = {};
      switch(option) {
         case 'validate':
           this.each(function () {
              var $this = $(this), data = $this.data('editable'), error;
              if(data && (error = data.validate())) {
                  result[data.name] = error;
              }
           });
           return result;    

         case 'getValue':
           this.each(function () {
              var $this = $(this), data = $this.data('editable');
              if(data) {
                  result[data.name] = data.value;
              }
           });
           return result;    
      }

      //return jquery object
      return this.each(function () {
          var $this = $(this),
              data = $this.data('editable'),
              options = typeof option === 'object' && option;
          if (!data) {
              $this.data('editable', (data = new Editable(this, options)));
          }
          if (typeof option === 'string') {
              data[option]();
          }
      });      
  };
  
  $.fn.editable.Constructor = Editable;

  //default settings
  $.fn.editable.defaults = {
    url: null,     //url for submit
    type: 'text',  //input type
    name: null,    //field name
    pk: null,     //primary key or record
    value: null,  //real value, not shown. Especially usefull for select
    emptytext: 'Empty', //text shown on empty element
    params: null,   //additional params to submit
    send: 'ifpk', // strategy for sending data on server: 'always', 'never', 'ifpk' (default)
    autotext: false, //if true -> element text will be automatically set by provided value. Useful for select element
    enablefocus: true, //wether to return focus on link after popover is closed. It's more functional, but focused links may look not pretty
    popoverClass: 'editable-popover-text', //to define size of popover for correct positioning
    formTemplate: '<form class="form-inline" style="margin-bottom: 0" autocomplete="off">'+
                       '<div class="control-group">'+
                           '&nbsp;<button type="submit" class="btn btn-primary"><i class="icon-ok icon-white"></i></button>&nbsp;<button type="button" class="btn editable-cancel"><i class="icon-ban-circle"></i></button>'+
                           '<span class="help-block" style="clear: both"></span>'+
                       '</div>'+
                  '</form>',
    loading: '<div class="editable-loading"></div>',    
    
    validate: function(value) { }, //client-side validation. If returns msg - data will not be sent
    success: function(data) { }, //after send callback
    error: function(xhr) { }  //error wnen submitting data    
  };
  
  //input types
  $.fn.editable.types = {
      //for all types
      defaults: {
            // this function called every time popover shown. Should set value of this.$input
            renderInput: function() {                  
                this.$input = $(this.settings.template);
                this.endShow();
            }, 
            setInputValue: function() {           
                this.$input.val(this.value);
                this.$input.focus();
            }, 
            //getter for value from input
            getInputValue: function() { 
                return this.$input.val();
            },    

            //setting text of element (init)
            setTextByValue: function() {
                this.$element.text(this.value); 
            },

            //setting value by element text (init)
            setValueByText: function() {
                this.value = this.$element.text(); 
            }    
      },
      
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
          prepend: false,          
          onSourceReady: function(success, error) {
              // try parse json in single quotes (for double quotes qjuery does automatically)
              try {
                  this.settings.source = tryParseJson(this.settings.source, false);
              } catch(e) {
                  error.call(this);
                  return;
              }
              
              if(typeof this.settings.source === 'string') { 
                  var cacheID = this.settings.source+'-'+this.name,
                      cache = $(document).data(cacheID);
                  //check for cached value    
                  if(typeof cache === 'object') {
                     this.settings.source = cache; 
                     success.call(this);
                     return;
                  }
                  //options loading from server
                  $.ajax({
                      url: this.settings.source, 
                      type: 'get',
                      data: {name: this.name},
                      dataType: 'json',
                      success: $.proxy(function(data) {
                          this.settings.source = this.settings.doPrepend.call(this, data);
                          $(document).data(cacheID, this.settings.source);                          
                          success.call(this);
                      }, this),
                      error: $.proxy(error, this)
                  });
              } else { //options as json
                  this.settings.source = this.settings.doPrepend.call(this, this.settings.source);
                  success.call(this);
              }              
          }, 
          
          doPrepend: function(data) {
              this.settings.prepend = tryParseJson(this.settings.prepend, true);
              
              if(typeof this.settings.prepend === 'string') {
                  return $.extend({}, {'': this.settings.prepend}, data);
              } else if(typeof this.settings.prepend === 'object') {
                  return $.extend({}, this.settings.prepend, data); 
              } else {
                  return data;
              }                 
          },  
          
          renderInput: function() {     
              this.$input = $(this.settings.template);  
              this.settings.onSourceReady.call(this,
              function(){
                  if(typeof this.settings.source === 'object' && this.settings.source != null) {
                      $.each(this.settings.source, $.proxy(function(key, value) {   
                          this.$input.append($('<option>', { value : key }).text(value)); 
                      }, this));    
                  }
                  this.endShow();
              },
              function(){
                  this.errorOnRender = 'Error when loading options';
                  this.endShow();
              });
          },
          
          setValueByText: function() {
              this.value = null; //it's not good to set value by select text. better set NULL
          },           
          
          setTextByValue: function() {
              this.settings.onSourceReady.call(this,
              function(){
                  if(this.value in this.settings.source) {
                      this.$element.text(this.settings.source[this.value]);
                  } else {
                      this.$element.text('Undefined!');
                  }
              },
              function(){
                 this.$element.text('Error!');
              });
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
          setValueByText: function() {
              var lines = this.$element.html().split(/<br\s*\/?>/i);
              for(var i = 0; i < lines.length; i++) {
                  lines[i] = $('<div>').html(lines[i]).text();
              }              
              this.value = lines.join("\n");
          },           
          setTextByValue: function() {
              var lines = this.value.split("\n");
              for(var i = 0; i < lines.length; i++) {
                  lines[i] = $('<div>').text(lines[i]).html();
              }
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
              var dateFormat = this.settings.format;
              options = options ? options : {};

              if(dateFormat) {
                  options.datepicker = $.extend({}, options.datepicker, {dateFormat: dateFormat});
              }

              //overriding datepicker config
              if(options.datepicker) {
                  this.settings.datepicker = $.extend({}, $.fn.editable.types.date.datepicker, options.datepicker);   
              }
          },
          renderInput: function() {
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
}

/**
* function to parse JSON in *single* quotes. (jquery automatically parse only double quotes)
* That allows such code as: <a data-source="{'a': 'b', 'c': 'd'}"
* for details see http://stackoverflow.com/questions/7410348/how-to-set-json-format-to-html5-data-attributes-in-the-jquery   
*/
function tryParseJson(s, safe) {   
     if(typeof s === 'string' && s.length && s.match(/^\{.*\}$/)) {
          if(safe) {
              try {
                  s = (new Function( 'return ' + s ))();
              } catch(e) {}
              finally {
                  return s;
              }
          } else {
              s = (new Function( 'return ' + s ))();  
          }
     } 
    
     return s;
}

  
}( window.jQuery ));  