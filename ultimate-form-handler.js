class ultimateFormHandler {


    constructor() {
        this.inputTypes = {
            'str': ['checkbox', 'color', 'date', 'datetime-local', 'hidden', 'month', 'password', 'radio', 'search', 'text', 'time', 'url', 'week'],
            'int': ['number', 'range', 'tel'],
            'eml': ['email'],
            'bol': ['button', 'image', 'reset', 'submit'],
            'obj': ['file']
        };
        this.formHandlers = {
            'errors': {}
        };
        this.formError = {};

        // get all the forms in the page with a valid 
        var forms = document.forms;
        // foreach of the forms add an event listener and stop browser default
        for (let index = 0; index < forms.length; index++) {
            const form = forms[index];

            // check to see if the system should handle form
            if (form.hasAttribute('data-form-validate') && form.getAttribute('data-form-validate') != false) {
                // get error file if set
                this.loadJsonErrorFile(form);

                form.addEventListener('submit', (e) => {
                    this.processForm(e);
                });

                // check if the user has live validate
                if (form.getAttribute('data-form-validate') == 'live') {
                    var inputs = form.elements;
                    for (let i = 0; i < inputs.length; i++) {
                        const element = inputs[i];
                        // check if live update is set for this item
                        if (element.hasAttribute('data-live')) {
                            element.addEventListener('input', el => {
                                this.processLiveInput(el.target);
                            });
                        }

                    }
                }
            }

        }
    }

    /**
     * loadJsonErrorFile
     * @param {*} form 
     * @return boleand
     * @description this method initias errors to be used for each form element.
     */
    loadJsonErrorFile(form) {
        if (form.hasAttribute('data-form-error-file') && form.getAttribute('data-form-error-file').length > 5) {
            // send get request to obtain json file
            $.ajax({
                url: form.getAttribute('data-form-error-file'),
                type: 'get',
                dataType: 'JSON',
                success: function (response) {
                    if (Object.keys(response).indexOf(form.getAttribute('id').toLowerCase) !== false) {
                        this.formHandlers.errors[form.getAttribute('id').toLowerCase] = response[form.getAttribute('id').toLowerCase];
                    } else {
                        this.formHandlers.errors[form.getAttribute('id').toLowerCase] = response;
                    }
                },
            }).fail(e => {
                console.log(form.getAttribute('id') + ' Failed to load error file.', e);
            })
        }
    }

    /**
     * ProcessForm
     * @param {*} e instance of the form element
     * @returns null 
     */
    processForm(e) {
        e.preventDefault();
        var form = e.target;

        // check for call backs
        var callback;
        if (form.hasAttribute('data-form-callback') && form.getAttribute('data-form-callback').length > 1) {
            callback = form.getAttribute('data-form-callback');
        }

        // check to see if you can submit with ajax or normally
        var processAjax = true;
        if (form.hasAttribute('data-form-ajax-request') && form.getAttribute('data-form-ajax-request') != 'true') {
            if (form.getAttribute('data-form-ajax-request') == 'false') {
                processAjax = false;
            } else {
                processAjax = 'function';
            }
        }

        var inputs = form.elements;
        var formAuth = true;

        var submitButton;

        for (let i = 0; i < inputs.length; i++) {
            const element = inputs[i];
            // register submit button
            if(element.getAttribute('type') == 'submit'){ submitButton = element; continue; }

            // check if live update is set for this item
            var check = this.processElements(element);
            if (check === false) {// there is an error in the file
                formAuth = false;
                break;
            }
        }
        // handle result

        if (formAuth == true) {

            // check if submit button has action to wait
            if(submitButton && submitButton.hasAttribute('data-action') && submitButton.getAttribute('data-action') == 'disabled'){
                submitButton.disabled = true;
            }
            
            if (processAjax == 'function') {
                // find object
                var fn = window[callback];
                // is object a function?
                var formData = new FormData(form);

                if (typeof fn === "function") { fn(formData, this); } else {
                    console.log('Could not find function ' + callback);
                };
            } else if (processAjax === true) {
                var action = form.getAttribute('action');
                var method = form.getAttribute('method') || 'get';
                var formData = new FormData(form);

                $.ajax({
                    url: action,
                    type: method,
                    dataType: 'JSON',
                    data: formData,
                    processData: false,
                    contentType: false
                }).done(response => {
                    
                    if (callback) {
                        // find object
                        var fn = window[callback];
                        // is object a function?
                        if (typeof fn === "function") { fn(response, this); } else {
                            console.log('Could not find ajax callback function ' + callback);
                        };
                        
                    }

                    // reset button
                    if(submitButton && submitButton.hasAttribute('data-action') && submitButton.getAttribute('data-action') == 'disabled'){
                        submitButton.disabled = false;
                    }
                    
                }).fail(error => {
                    console.log('Post route not found.\nError:: ', error);
                    // reset button
                    if(submitButton && submitButton.hasAttribute('data-action') && submitButton.getAttribute('data-action') == 'disabled'){
                        submitButton.disabled = false;
                    }
                });
            } else { // remove event listener and submit

                form.removeEventListener('submit', e => { console.log(e) });
                form.removeAttribute('onsubmit');

                // submit form
                form.submit();
            }
        } else {
            // send error to approprait screen
            var message = (Object.keys(this.formHandlers.errors).indexOf(form.getAttribute('id').toLowerCase()) >= 0) ? this.formHandlers.errors[form.getAttribute('id').toLowerCase()][this.formError.input.getAttribute('id')] : (this.formError.input.getAttribute('data-message') || '');
            // check if append is allowed 
            if (form.hasAttribute('data-form-append-errors') && form.getAttribute('data-form-append-errors') != 'false') {
                message += ' ' + this.formError.append;
            }

            this.formErr(this.formError.input, message);

        }

    }


    // send request to user after custom implementations
    /**
     * sendRequest for action called out of the class
     * @param {*} url 
     * @param {*} type 
     * @param {*} data 
     * @param {*} callback 
     * @returns empty or string on failed. ON Ajax completion returns a call to callback function
     */
    sendRequest(url, type, data, callback) {
        var error = '';
        if (url.length > 1) {
            if (type.length > 0) {
                $.ajax({
                    url: url,
                    type: type,
                    dataType: 'JSON',
                    data: data,
                    processData: false,
                    contentType: false
                }).done(response => {
                    if (callback) {
                        // find object
                        var fn = window[callback];
                        // is object a function?
                        if (typeof fn === "function") { fn(response, this); } else {
                            console.log('Could not find function ' + callback);
                        };
                    }
                }).fail(error => {
                    console.log(error);

                });
            } else {
                error = 'Invalid request type.';
            }
        } else {
            error = 'Invalid request url.';
        }

        if (error) {
            return error;
        }

    }

    /**
     * ProcessLiveInput
     * @param {*} input the input field itself
     * @description an event listener which will handle user inputs as they key in values to the live validate fields  
     */
    processLiveInput(input) {
        var response = this.processElements(input);
        var form = input.form;
        if (response === false) {
            // send error to approprait screen
            var message = (Object.keys(this.formHandlers.errors).indexOf(form.getAttribute('id').toLowerCase()) >= 0) ? this.formHandlers.errors[form.getAttribute('id').toLowerCase()][this.formError.input.getAttribute('id')] : (this.formError.input.getAttribute('data-message') || '');
            // check if append is allowed 
            if (form.hasAttribute('data-form-append-errors')) {
                message += ' ' + this.formError.append;
            }
            this.formErr(this.formError.input, message);
        }
    }

    /**
     * scrollToInput
     * @param {*} input 
     * @description Scroll an input element into view
     */
    scrollToInput(input) {
        input.parentNode.scrollIntoView();
        input.scrollIntoView(true);
        // add space to inview
        var scrolledY = window.scrollY;
        if (scrolledY) {
            window.scroll(0, scrolledY - 100);
        }

    }

    // function for content form error
    /**
     * FormErr
     * @param {*} input the input field with invalid data
     * @param {*} msg  the error message to display to the user
     * @description return an alert to the user of inputs with invalid data.
     */
    formErr(input, msg) {
        try {
            if (input) {
                // var input = idAppend + id;
                this.scrollToInput(input);
                $(input).addClass('is-invalid');
                $(input).removeClass('mb-3');

                // check for error container
                var parent = input.parentElement;
                var errorId = (input.getAttribute('id') || input.getAttribute('name')) + '_msg';
                var span = parent.querySelector('#' + errorId) != undefined;
                if (span != undefined) {
                    span = document.createElement('div');
                    span.setAttribute('id', errorId);
                    span.setAttribute('class', 'text-danger mb-3');
                    parent.appendChild(span);
                }
                $('#' + errorId).html(msg);
                // remove error from page after view
                setTimeout(() => {
                    $(input).removeClass('is-invalid');
                    $(input).addClass('mb-3');
                    $('#' + errorId).html('');
                }, 5000);
            }
        } catch (e) {
            console.log(e);
        }
    }


    /**
     * ProcessElements 
     * @param {*} input 
     * @returns boolean
     */
    processElements(input) {
        // convert all attributes to lowercase for standardization
        var attributes = input.attributes;
        for (let index = 0; index < attributes.length; index++) {
            const element = attributes[index].nodeName;
            input.setAttribute(element.toLowerCase(), input.getAttribute(element))
        }
        switch (input.tagName) {
            case 'INPUT':
                // code block
                return this.input(input);
            case 'SELECT':
                // code block
                return this.select(input);
            case 'TEXTAREA':
                return this.input(input);
            default:
            // code block
        }

    }

    /**
     * Input handles all input other than select input field
     * @param {*} input 
     * @returns bolean true for is valid false for invalid input field.
     */
    input(input) {
        var type = input.hasAttribute('type') ? input.getAttribute('type').toLowerCase() : '';
        // check the input type
        for (const [key, value] of Object.entries(this.inputTypes)) {
            if (value.indexOf(type) >= 0) {
                switch (key) {
                    case 'eml':
                        return this.validateEmail(input);
                    case 'str':
                        return this.validateString(input);
                    case 'int':
                        return this.validateInteger(input)
                    case 'obj':
                        return this.validateObject(input);
                    default:
                        break;
                }

                break;
            }
        }
    }

    /**
     * Hanndle select input fields
     * @param {*} input 
     * @returns boolean
     * @description This function handles input type select for both single and multiple select input fields
     */
    select(input) {
        // for select we will need to create a text element
        var inputElement = document.createElement('input');
        var value = input.value;
        if (input.hasAttribute('multiple')) {
            value = $(input).val().toString();
        }

        inputElement.setAttribute('type', 'text');
        inputElement.setAttribute('value', value);

        for (let index = 0; index < input.attributes.length; index++) {
            var attribute = input.attributes[index];
            var attributeValue = attribute.nodeValue;
            if (['id', 'name'].indexOf(attribute.nodeName.toLowerCase()) >= 0) {
                attributeValue += '_' + Math.random();
            }
            inputElement.setAttribute(attribute.nodeName.toLowerCase(), attributeValue);
        }
        var check = this.validateString(inputElement);
        // check to see if the item has min or max values
        if (input.hasAttribute('multiple')) {
            var min = input.hasAttribute('data-select-min') ? input.getAttribute('data-select-min') * 1 : 0;
            var max = input.hasAttribute('data-select-max') ? input.getAttribute('data-select-max') * 1 : 0;
            var object = $(input).val();

            if (min > 0 && object.length < min) {
                check = false;
                this.formError.input = input;
                this.formError.append = ' Select at lease ' + min + ' item' + (min > 1 ? 's' : '') + '.';
            } else if (max > 0 && object.length > max) {
                check = false;
                this.formError.input = input;
                this.formError.append = ' Select at most ' + max + ' item' + (max > 1 ? 's' : '') + '.';
            }
        }

        return check
    }

    /**
     * ValidateEmail Address
     * @param {*} input 
     * @returns boolean
     * @description This functions checks to ensure a valid email address has been inserted into the form field.
     */
    // process validations for str, int and bol
    validateEmail(input) {
        var value = input.value();
        // check if it has a full stop and
        var exp = value.split('@');
        if (exp.length == 2) {
            var expdot = val.split('.');
            if (expdot.length > 0) {
                return this.validateString(value);
            } else {
                this.formError.input = input;
                this.formError.append = 'Invalid email.';
            }
        } else {
            this.formError.input = input;
            this.formError.append = 'Invalid email address.';
        }

    }

    /**
     * ValidateString
     * @param {*} input 
     * @returns boolean
     * @description This function will validate a string base on the regular expression provided bellow
     */
    validateString(input) {
        var value = input.value;
        value = value.replace(/[^a-zA-Z0-9 \_\-\,\(\)\!\=\.\@\'\"]/gim, '');
        // check conditions
        var minLength = input.hasAttribute('minlength') ? input.getAttribute('minlength').replace(/[^0-9]/g, '') * 1 : 0;
        var maxLength = input.hasAttribute('maxlength') ? input.getAttribute('maxlength').replace(/[^0-9]/g, '') * 1 : 0;
        var check = false;
        if (!input.hasAttribute('data-validate') || (input.hasAttribute('data-validate') && input.getAttribute('data-validate') != false)) {
            
            if (value.length < minLength) {
                // error
                this.formError.input = input;
                this.formError.append = 'Input must be at least ' + minLength + ' character' + (minLength > 1 ? 's' : '') + '.';
            } else if (maxLength > 0 && value.length > maxLength) {
                // error
                this.formError.input = input;
                this.formError.append = 'Input must be at most ' + maxLength + ' character' + (maxLength > 1 ? 's' : '') + '.';
            } else {
                check = true;
            }
        }

        if (check !== false && value != '') {
            check = value;
            input.value = value;
        }
        return check;
    }


    /**
     * Validate Integer
     * @param {*} input 
     * @returns bolean
     */
    validateInteger(input) {
        var value = input.value;
        try {
            value = value.replace(/[^0-9.]/g, '');
            // check conditions
            var minLength = input.hasAttribute('minlength') ? input.getAttribute('minlength').replace(/[^0-9]/, '') * 1 : 0;
            var min = input.hasAttribute('min') ? input.getAttribute('min').replace(/[^0-9]/, '') * 1 : 0;
            var maxLength = input.hasAttribute('maxlength') ? input.getAttribute('maxlength').replace(/[^0-9]/, '') * 1 : 0;
            var max = input.hasAttribute('max') ? input.getAttribute('max').replace(/[^0-9]/, '') * 1 : 0;
            var check = false;
            if (!input.hasAttribute('data-validate') || (input.hasAttribute('data-validate') && input.getAttribute('data-validate') != 'false')) {

                if (value.length < minLength) {
                    // error
                    this.formError.input = input;
                    this.formError.append = 'Input must be at least ' + minLength + ' character' + (minLength > 1 ? 's' : '') + '.';
                } else if (maxLength > 0 && value.length > maxLength) {
                    // error
                    this.formError.input = input;
                    this.formError.append = 'Input must be at most ' + maxLength + ' character' + (maxLength > 1 ? 's' : '') + '.';
                } else if (value < min) {
                    // error
                    this.formError.input = input;
                    this.formError.append = 'Minimum allowed value ' + min + '.';
                } else if ((max > 0 && value > max)) {
                    this.formError.input = input;
                    this.formError.append = 'Maximum allowed value ' + max + '.';
                } else {
                    check = true;
                }
            } else {
                check = true;
            }
        } catch (e) {
            console.log(e);
            this.formError.input = input;
            this.formError.append = 'Cannot process interger.';
        }

        if (check !== false) {
            check = value;
            input.value = value;
        }
        return check;
    }
    /**
     * ValidateRadio, Used for input radio validations
     * @param {*} input 
     * @returns boolean
     */
    validateRadio(input) {
        // get all the raio with this name
        var name = input.getAttribute('name');
        var radios = document.querySelector(`input[name=${name}]`);
        var value = document.querySelector(`input[name=${name}:checked]`);

        // the first radio will carry the settings 
        var inputElement = document.createElement('input');
        inputElement.setAttribute('type', 'text');
        inputElement.setAttribute('value', value);

        // get attributes of the first radio
        for (let index = 0; index < radios[0].length; index++) {
            const attributes = radios[0][index].attributes;
            attributes.forEach(attribute => {
                inputElement.setAttribute(attribute.nodeName.toLowerCase, attribute.nodeValue);
            });
        }

        // send element to be processed
        return this.validateString(inputElement);

    }

    /**
     * Validate objects mostly used for file processing
     * @param {*} input 
     * @returns boolean
     */
    validateObject(input) {
        var files = input.files;
        // get specifications such as required, min size, count max size
        var maxSize = input.hasAttribute('data-file-max-size') ? input.getAttribute('data-file-max-size').replace(/[^0-9.]/g, '') * 1 : null; // in mb
        var minSize = input.hasAttribute('data-file-min-size') ? input.getAttribute('data-file-min-size').replace(/[^0-9.]/g, '') * 1 : null; // in mb
        var extensions = input.hasAttribute('data-file-min-size') ? input.getAttribute('data-file-extensions').replace(/[^a-zA-Z\,]\s/g, '').toLowerCase() : ''; // separate types with comma or use detault image [jpg, png, gif], doc
        var fileCountMax = input.hasAttribute('data-file-max-count') ? input.getAttribute('data-file-max-count').replace(/[^0-9]/g, '') * 1 : 0;// how many files expected
        var fileCountMin = input.hasAttribute('data-file-min-count') ? input.getAttribute('data-file-min-count').replace(/[^0-9]/g, '') * 1 : 0;// how many files expected

        if (files.length <= fileCountMax) {
            if (files.length >= fileCountMin) {

                var extensionList = extensions.split(',');
                for (let index = 0; index < files.length; index++) {
                    const file = files[index];
                    var fileName = file.name;
                    var fileSize = (file.size / 1052675.49738).toFixed(2);// files.size;

                    var fileType = file.type;
                    var fileExtension = fileType.split('/')[1];

                    if (minSize < 1 || fileSize >= minSize) {
                        if (maxSize < 1 || fileSize <= maxSize) {
                            if (extensionList.length < 1 || extensionList.indexOf(fileExtension) !== false) {
                                // all is well 
                                check = true;
                            } else {
                                this.formError.input = input;
                                this.formError.append = fileName + ' an has invalid file type. Accepted file formats are ' + extensions;
                                break;
                            }
                        } else {
                            this.formError.input = input;
                            this.formError.append = fileName + ' filesize must be at most ' + maxSize + 'mb.';
                            break;
                        }
                    } else {
                        this.formError.input = input;
                        this.formError.append = fileName + ' filesize must be at least ' + minSize + 'mb.';
                        break;
                    }


                }
            } else {
                if (!input.hasAttribute('required')) {
                    // place error 
                    this.formError.input = input;
                    this.formError.append = 'Select at least ' + fileCountMin + ' file' + (fileCountMin > 1 ? 's' : '') + '.';
                }

            }
        } else {
            if (!input.hasAttribute('required')) {
                // place error 
                this.formError.input = input;
                this.formError.append = 'Select at most ' + fileCountMax + ' file' + (fileCountMax > 1 ? 's' : '') + '.';
            }
        }

        if (!input.hasAttribute('required')) {
            check = true;
        }

        return check;

    }

}