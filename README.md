# ULTIMATE JAVASCRIPT FORM HANDLER
Eliminate thousands of lines of code with this simple JavaScript form handler. This class has been design to account for all form handling scenarios and has custom data attributes which enables you to build faster and robust form. This form handler uses existing HTML form validators such as required, min, max, minLength, maxLength etc.. to ensure adaptability. This class relies on jQuery ajax to send POST and GET request and do callbacks once result is obtain. This class enables you to write simple html form and validate this form seamlessly, sending the result to the required destination with no hasstle. 

# ATTRIBUTES DEFINATIONS

## FORM ELEMENT ATTRIBUES

  #### action : required
      The form action which will be used to send the data once the form has been validated successfully.
     
  #### method : POST, GET, PUT, DELETE, | required
      The method with which you would like to submit the form.
  
  #### id : optional
      The form id.
      
  #### data-form-validate : true | false | live, option default form will be skipped
      Setting this value lets the class know this form element will be processed by ultimate-js-form-handler.
      - True: Form will be handle by the class on submission
      - flase: Form will not be tracked and validated
      - live: set this attribute to live if there are some form fields you'd live to validate a users key in their inputs
   
   #### data-form-callback : name of callback function, optional
      This attribute takes a string of the callback method you'd like to use after the form has been submited for processing. Callback function will be call with two parameters; the response and an instance of the class.
   
   #### data-form-ajax-request : true | false | function, optional
      Setting this value determins what to be done after the form has been validated. That is to use ajax, send http request or call a function once validation is complete.
      - True: Form will be parse with ajax and response send back through callback function.
      - false: Form will be submited normally with an http request (POST/GET)
      - function: the method will be called once the form validation has been completed with no errors
      
   #### data-form-append-errors : true | false, optional
      Ultimate js form handler has custom form errors which it collects upon validation of the form, this attributes determine if you'd like to append these errors to you predefined errors.
      - true: Display your custom error message and append ultimate js form handler errors to your users.
      - false: Only your defined error message will be displayed to users.

  #### data-form-error-file | optional
      Provide a link to which return a json object of errors to be used in validating a form. Your json filed should be structured in such a way the keys should represent the id's of the input fields.
      -- sample json:  { id_1 : 'erorr_message_1', 'id_2' : 'error_message_2', ...}
      Erorr keys must matched the form input keys in other for them to be properly assign and display to users on error.
  
  
  ## FORM INPUT ELEMENTS
   ### INPUT
   #### type : checkbox, color, date, datetime-local, hidden, month, password, radio, search, text, time, url, week, number, range, tel, email,  image, file | required
      Insert a valid input type for this element.
   
   #### id | optional
      Id of the input element.
   
   #### name | optional
      Name of the input element. This is required for grouped radio input.
   
   #### min: interger, optional
      This attribute only works for input type number.
   
   #### max : interger, optiona;
      This attribute only works for input type number.
      
   #### minLength: interger, optional
      Input the minimum number of characters required in this field. Setting a minumum length automatically considers this field as a required item.
   
   #### maxLength: interger, optional
      Input the maximum number of characters required in this field. Setting a maximum length automatically considers this field as a required item.
   
   #### required | optional
      Set this attribute if the input field is required.
   
   #### id | optional
      Set the id of the input element.
   
   #### class | optional
      Set the classes for the input element.
   
   #### data-live : true | false
        This attributes lets the class knows this item should be validated on user input. This attribute will only work if the form element has the attribute **data-form-validate* set to __live__.
   
   #### data-message
        This attributes holds an error message which will be used in case the form json error file could not be loaded, or the id key not found.
   
   #### data-validate true | false
        Set to false if you would like to skip an input element from being validated.   
      
   ### SELECT
   
   #### data-select-min : interger | optional
      This attribute only workd on select fields with the *multiple* attribute. It determines the minimum number of items a user can select from the dropdown list. 
   
   #### data-select-max : interger | optional
      This attribute only workd on select fields with the *multiple* attribute. It determines the maximum number of items a user can select from the dropdown list.
  
      
      
  
      
      
