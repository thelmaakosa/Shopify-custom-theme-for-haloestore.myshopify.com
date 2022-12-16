var fileToInbox;
var ftiWidget;
var widget;

function loadScript(scriptSrc, callback)
{
    var c = document.createElement("script");
    c.type = "text/javascript", c.async = !0, c.src = scriptSrc;
    var d = document.getElementsByTagName("script")[0];
    d.parentNode.insertBefore(c, d), c.addEventListener ? c.addEventListener("load", callback, !1) : c.attachEvent(readyStateChange, readyHandler = function() {
        /complete|loaded/.test(c.readyState) && (callback(), c.detachEvent(readyStateChange, readyHandler))
    })
}

function loadCss(cssSrc, callback)
{
    var c = document.createElement("link");
    c.type = "text/css", c.rel = 'stylesheet', c.media = 'all', c.async = !0, c.href = cssSrc;
    var d = document.getElementsByTagName("head")[0];
    d.parentNode.insertBefore(c, d), c.addEventListener ? c.addEventListener("load", callback, !1) : c.attachEvent(readyStateChange, readyHandler = function() {
        /complete|loaded/.test(c.readyState) && (callback(), c.detachEvent(readyStateChange, readyHandler))
    })
}

function addCss(css)
{
    head = document.head || document.getElementsByTagName('head')[0],
    style = document.createElement('style');

    style.type = 'text/css';
    if(style.styleSheet)
    {
      // This is required for IE8 and below.
      style.styleSheet.cssText = css;
    } else
    {
      style.appendChild(document.createTextNode(css));
    }

    head.appendChild(style);
}

loadScript('//ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js', function()
{
    jQueryFTI = jQuery.noConflict(true);
    jQueryFTI(document).ready(function()
    {

        var widgetArray = [];
        var form = jQueryFTI('form[action$="cart/add"]');

        form.each(function(i, element){
            if(typeof jQueryFTI(element).attr('id') === 'undefined')
            {
                jQueryFTI(element).attr('id', 'form-' + i);
            }
        });

        var fileCount = 1;
        var filesBeingUploaded = 0;
        var filesAdded = 0;

        var maxNumberOfFiles = 0;
        var immediateUpload = true;
        var shareable = false;

        var delayedUploadDone = false;

        var ftiDebug = false;

        var themeId = 138460954901;
        var currentThemeId = Shopify.theme.id || -1;

        var isProductPage = jQueryFTI('form[action$="cart/add"]').length > 0 || window.location.pathname.includes('/products/');

        var timestamp = new Date().getTime();

        var localStorageKey = 'ftiSessionId_' + (isProductPage ? (meta.product?.id || -1) : -1);
        var sessionId = localStorage.getItem(localStorageKey);

        if(sessionId === null || typeof sessionId === 'undefined' || sessionId.length < 1)
        {
            sessionId = (new Date().toISOString().split('T')[0]) + '-' + makeid();
            localStorage.setItem(localStorageKey, sessionId);
        }

        var zipUrl = 'https://www.dropbox.com/home/Apps/FileToInbox.com/' + sessionId + '.zip';

        console.log(sessionId, zipUrl);

        // console.log([themeId, currentThemeId, themeId == currentThemeId]);

        function ftiValidate()
        {
            if(ftiDebug)
            {
                console.log('validate');
                console.log('filesBeingUploaded: ' +filesBeingUploaded);
            }

            if(jQueryFTI('.price').hasClass('price--unavailable'))
            {
                // variation unavailable
                return false;
            }

            var valid = filesBeingUploaded < 1;

            // hide all error messages
            jQueryFTI('.fti-widget-container').css('border', '0');

            widgetArray.forEach((oneWidget, i) =>
            {
                widget = ftiWidget = oneWidget;
                var uploadFieldId = 'fti_upload_' + i;
                var messageFieldId = 'fti_message_' + i;
                var hiddenMessageFieldId = 'fti_hidden_message_' + i;

                if(form.find('#' + hiddenMessageFieldId).length < 1)
                {
                    if(jQueryFTI('#' + messageFieldId).closest('form').length < 1)
                    {
                        form.each(function(i, element){
                            jQueryFTI(element).append('<input style="display: none;" class="fti-upload-file-hidden" type="text" id="' + hiddenMessageFieldId + '" name="properties[Message ' + i + ']" form="' + jQueryFTI(element).attr('id') + '"/>');
                        });
                        form.find('#' + hiddenMessageFieldId).val(jQueryFTI('#' + messageFieldId).val());
                    }
                } else
                {
                    form.find('#' + hiddenMessageFieldId).val(jQueryFTI('#' + messageFieldId).val());
                }

                // validate
                if(ftiWidget.required)
                {
                    var currentWidgetValid = typeof fileToInbox !== 'undefined'  && fileToInbox.flow.files.length > 0; //jQueryFTI('#' + uploadFieldId).val() != '';
                    if(!currentWidgetValid)
                    {
                        // todo show error message if invalid
                        jQueryFTI('.fti-widget-container').css('border', '2px solid #FF3C3C');
                    }
                    // valid if not empty
                    valid &= currentWidgetValid;
                }
            });

            return valid;
        }

        function ftiDoDelayedUpload()
        {
            if(ftiDebug)
            {
                console.log('do delayed upload');
            }
            if(!immediateUpload && !delayedUploadDone)
            {
                delayedUploadDone = true;

                if(zipFilesMinNumber > 0 && fileToInbox.flow.files.length >= zipFilesMinNumber)
                {
                    // zip
                    // foreach fileToInbox.flow.files => remove all existing files
                    fileToInbox.flow.files.forEach((myFile) => {
                        ftiRemoveFile(myFile);
                    });

                    fileCount = 1;

                    // todo add zip file
                    if(typeof form == 'object')
                    {
                        if(form.find('#fti-zip').length < 1)
                        {
                            form.each(function(i, element){
                                jQueryFTI(element).append('<input style="display: none;" class="fti-upload-file-hidden" type="text" id="fti-zip" name="properties[Uploaded file ' + fileCount + ']" value="' + zipUrl + '" form="' + jQueryFTI(element).attr('id') + '"/>');
                            });
                            fileCount++;

                            var url = 'https://filetoinbox.com/p/gdu/' + sessionId;

                            jQueryFTI.ajax
                            ({
                                url: url,
                                async: false, //true,
                                xhrFields: {
                                        withCredentials: true
                                    },
                                success: function(data)
                                {
                                    if(data != '-1')
                                    {
                                        if(ftiDebug)
                                        {
                                            console.log('#' + sessionId + ' - ' + data);
                                        }
                                    } else
                                    {
                                        // todo - show error?
                                    }
                                }
                            });
                        }
                    }
                } else
                {
                    // not zip
                    fileToInbox.flow.files.forEach((myFile) => {
                        ftiAddFile(myFile);
                    });
                }
                                
                            }
        }

        function ftiAddFile(file)
        {
            if(typeof form == 'object')
            {
                if(form.find('#' + file.uniqueIdentifier).length < 1)
                {
                    form.each(function(i, element){
                        jQueryFTI(element).append('<input style="display: none;" class="fti-upload-file-hidden" type="text" id="' + file.uniqueIdentifier + '" name="properties[Uploaded file ' + fileCount + ']" form="' + jQueryFTI(element).attr('id') + '"/>');
                    });
                    fileCount++;
                }

                var url = 'https://filetoinbox.com/p/gdu/' + file.uniqueIdentifier + '?doUpload='+(immediateUpload ? 0 : 1)+'&shareable=' + (shareable ? 1 : 0) + '&email=' + email +'&sessionId=' + sessionId;

                jQueryFTI.ajax
                ({
                    url: url,
                    async: shareable ? false : true,
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function(data)
                    {
                        if(data != '-1')
                        {
                            form.find('#' + file.uniqueIdentifier).val(data);
                            if(ftiDebug)
                            {
                                console.log('#' + file.uniqueIdentifier + ' - ' + data);
                            }
                        } else
                        {
                            // todo - show error?
                        }
                    }
                });
            }
        }

        function ftiGetTempDropboxUrl(file)
        {
            if(typeof form == 'object')
            {
                if(form.find('#' + file.uniqueIdentifier).length < 1)
                {
                    form.each(function(i, element){
                        jQueryFTI(element).append('<input style="display: none;" class="fti-upload-file-hidden" type="text" id="' + file.uniqueIdentifier + '" name="properties[Uploaded file ' + fileCount + ']" form="' + jQueryFTI(element).attr('id') + '"/>');
                    });
                    fileCount++;
                }

                var url = 'https://filetoinbox.com/p/gdu/' + file.uniqueIdentifier + '?doUpload=0&email=' + email +'&sessionId=' + sessionId;

                jQueryFTI.ajax
                ({
                    url: url,
                    async: false,
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function(data)
                    {
                        if(data != '-1')
                        {
                            form.find('#' + file.uniqueIdentifier).val(data);
                            if(ftiDebug)
                            {
                                console.log('#' + file.uniqueIdentifier + ' - temp DB url ' + data);
                            }
                        } else
                        {
                            // todo - show error?
                        }
                    }
                });
            }
        }

        function ftiRemoveFile(file)
        {
            if(typeof form == 'object')
            {
                form.find('#' + file.uniqueIdentifier).remove();
                // don't decrease fileCount
                // fileCount--;
            }
        }

        function makeid()
        {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            var i = 0;
            while(i < 15)
            {
                text += possible.charAt(Math.floor(Math.random() * possible.length));
                i++;
            }

            return text;
        }

        if(isProductPage && currentThemeId == themeId)
        {
                        var uploadWidgets = {"white-video-booklet":[{"uploadLabel":"Upload file","messageLabel":"Message","message":false,"required":true,"slug":"05ee9423f4406963a033fc15b55a2068","instructions":"","widgetElementPosition":"1","widgetElementPositionJS":"addToCart.closest('div').before(widgetHtml);","maxNumberOfFiles":0,"immediateUpload":1,"shareable":0,"messages":{"dragDropFilesHere":"Drag & drop files here or","selectFromYourComputer":"select from your computer","uploading":"Uploading","download":"Download","pause":"Pause","resume":"Resume","cancel":"Remove","unableLoad":"Upload error","completed":"Completed","instructions":"Instructions","requireEmailLabel":"Enter your email address to upload a file","requireEmailError":"Please enter a valid email address","requireEmailButton":"Save email"},"zipFilesMinNumber":0,"requireEmailAddressBeforeUploading":false,"customCssColors":" color: #666666; background-color: #EEEEEE; border-color: #AAAAAA;","customCssTextColor":"#666666","customCss":false}]};
            var productHandle = window.location.pathname.substr(window.location.pathname.lastIndexOf('/') + 1);
            if(uploadWidgets.hasOwnProperty(productHandle))
            {
                // var addToCart = form.find('[type="submit"]:visible,[type="button"]:visible');
                var addToCart = form.find('[type="submit"],[type="button"]').not('.fti-email-submit,.js-qty__adjust,.quantity-selector__button,.qty-selector__btn').first();

                widgetArray = uploadWidgets[productHandle];
                var widgetHtml;
                var widgetRequired = false;
                var ulcSlug = 'slug';
                var zipFilesMinNumber = 0;
                var email = '';

                widgetArray.forEach((oneWidget, i) =>
                {
                    widget = ftiWidget = oneWidget;
                    console.log(ftiWidget);
                    console.log(ftiWidget.messages);

                    ulcSlug = ftiWidget.slug;
                    immediateUpload = ftiWidget.immediateUpload;
                    shareable = ftiWidget.shareable;
                    maxNumberOfFiles = ftiWidget.maxNumberOfFiles;
                    zipFilesMinNumber = ftiWidget.zipFilesMinNumber;

                    if(ftiWidget.customCss)
                    {
                        addCss(ftiWidget.customCss);
                    } else
                    {
                        loadCss('https://filetoinbox.com/css/flow.css?' + timestamp);
                    }

                    var uploadFieldId = 'fti_upload_' + i;
                    var uploadFieldName = ftiWidget.uploadLabel + ' ' + i;
                    var messageFieldId = 'fti_message_' + i;
                    // var messageFieldName = ftiWidget.messageLabel;// + ' ' + i;
                    var messageFieldName = (ftiWidget.messageLabel ?? '').replaceAll(/["':]/ig, '').substring(0, 100);// + ' ' + i;

                    widgetHtml = '<div class="flow-drop fti-widget-container' + (ftiWidget.required ? ' fti-validate"' : '') + '" style="display: block; margin: 20px 0; clear: both; width: 100%; ' + ftiWidget.customCssColors + '" ondragenter="jQueryFTI(this).addClass(\'flow-dragover\');" ondragend="jQueryFTI(this).removeClass(\'flow-dragover\');" ondrop="jQueryFTI(this).removeClass(\'flow-dragover\');">';

                    if(ftiWidget.instructions)
                    {
                        widgetHtml += '<span class="fti-upload-instructions">' + ftiWidget.instructions + '</span><br />';
                    }

                    if(ftiWidget.uploadLabel)
                    {
                        widgetHtml += '<span class="fti-upload-label">' + ftiWidget.uploadLabel + '</span><br />';
                    }

                    if(ftiWidget.requireEmailAddressBeforeUploading)
                    {
                        widgetHtml += '<div class="line-item-property__field fti-email-container">' +
                            '<label class="form__label" style="margin: 2px;" for="' + messageFieldId + '">' + ftiWidget.messages.requireEmailLabel + '</label>' +
                            '<span class="fti-email-error" style="display: none;">' + ftiWidget.messages.requireEmailError + '</span>' +
                            '<input type="text" class="fti-email product-form__input" />' +
                            '<button type="button" class="fti-email-submit btn">\n'+
                            '<span id="AddToCartText">' + ftiWidget.messages.requireEmailButton + '</span>'+
                            '</button>' +
                            '</div>';
                    }

                    widgetHtml += '<div class="fti-upload-links" ' + (ftiWidget.requireEmailAddressBeforeUploading ? 'style="display: none;"' :'') + '>' + ftiWidget.messages.dragDropFilesHere + ' <span class="flow-browse" style="text-decoration: underline; cursor: pointer; color: '+ ftiWidget.customCssTextColor +'">' + ftiWidget.messages.selectFromYourComputer + '</span></div>';

                    widgetHtml += '</div>';
                    widgetHtml += '<div class="flow-number-of-files" style="display: none;">' +
                        '<span style="color: #FF0000">Maximum number of uploaded files: ' + maxNumberOfFiles + '</span>' +
                        '</div>' +
                        '<div class="flow-progress">' +
                        '<table style="background: none;">' +
                        '<tr>' +
                        '<td width="100%">' +
                        '<div class="flow-progress-container"><div class="progress-bar"></div></div>' +
                        '</td>' +
                        '<td class="progress-text" nowrap="nowrap"></td>' +
                        '<td class="progress-pause" nowrap="nowrap">' +
                        '<a href="#" onclick="r.upload(); return(false);" class="progress-resume-link"><img src="https://filetoinbox.com/images/flowjs/resume.png" title="Resume upload"/></a>'+
                        '<a href="#" onclick="r.pause(); return(false);" class="progress-pause-link"><img src="https://filetoinbox.com/images/flowjs/pause.png" title="Pause upload"/></a>'+
                        '<a href="#" onclick="r.cancel(); return(false);" class="progress-cancel-link"><img src="https://filetoinbox.com/images/flowjs/cancel.png" title="Cancel upload"/></a>'+
                        '</td>' +
                        '</tr>' +
                        '</table>' +
                        '</div>' +
                        '<ul class="flow-list" style="padding-bottom: 20px;"></ul>';
                    if(ftiWidget.message)
                    {
                        widgetHtml += '<div class="line-item-property__field fti-message">' +
                            '<label style="margin: 2px; display:block;" for="' + messageFieldId + '">' + ftiWidget.messageLabel + '</label>' +
                            '<textarea style="min-height: 100px; border-width: 1px; border-style:solid;" ' + (ftiWidget.hasOwnProperty('messageRequired') && ftiWidget.messageRequired ? 'required="required"' : '') + ' id="' + messageFieldId + '" name="properties[' + messageFieldName + ']" class="product-form__input' + (ftiWidget.hasOwnProperty('messageRequired') && ftiWidget.messageRequired ? ' fti-validate"' : '') + '" form="' + addToCart.closest('form').attr('id') + '"></textarea>' +
                            '</div>';
                    }

                    if(ftiWidget.widgetElementPosition == '1')
                    {
                        addToCart.closest('div').before(widgetHtml);
                    } else
                    {
                        eval(ftiWidget.widgetElementPositionJS);
                    }

                    if(ftiWidget.required && !widgetRequired)
                    {
                        // disable add to cart button
                        // addToCart.attr('disabled', 'disabled');
                        addToCart.prop('disabled', true);

                        /*
                        var observer = new MutationObserver(function(mutations) {
                            // don't change if it's already disabled
                            if(!ftiValidate() && jQueryFTI(mutations[0].target).attr('disabled') != 'disabled')
                            {
                                jQueryFTI(mutations[0].target).attr('disabled', 'disabled');
                                jQueryFTI(mutations[0].target).prop('disabled', true);
                            }
                        });

                        observer.observe(addToCart[0], {
                            attributes: true,
                            attributeOldValue: true,
                            attributeFilter: ['disabled']
                        });*/

                        widgetRequired = true;
                    }
                });

                form.on('submit', function(e)
                {
                    if(ftiDebug)
                    {
                        console.log('form submit');
                    }

                    var valid = ftiValidate();

                    if(!valid)
                    {
                        e.stopImmediatePropagation();
                        e.preventDefault();
                    } else
                    {
                        if(!immediateUpload)
                        {
                            ftiDoDelayedUpload();
                        } else
                        {
                                                        
                                                    }
                        localStorage.removeItem(localStorageKey);
                    }
                });

                addToCart.on('click', function(e)
                {
                    if(ftiDebug)
                    {
                        console.log('addtocart click');
                    }

                    var valid = ftiValidate();

                    if(!valid)
                    {
                        e.stopImmediatePropagation();
                        e.preventDefault();
                    } else
                    {
                        if(!immediateUpload)
                        {
                            ftiDoDelayedUpload();
                        } else
                        {
                                                        
                                                    }
                        localStorage.removeItem(localStorageKey);
                    }
                });

                form.find('.fti-validate,input,textarea,select').on('change', function(e) {
                    addToCart = form.find('[type="submit"],[type="button"]').not('.fti-email-submit');
                    if(!ftiValidate())
                    {
                        // not valid
                        // addToCart.attr('disabled', 'disabled');
                        addToCart.prop('disabled', true);
                    } else
                    {
                        // valid
                        // addToCart.removeAttr('disabled');
                        addToCart.prop('disabled', false);
                    }
                });


                loadScript('https://filetoinbox.com/js/flow.js?' + timestamp, function() {
                    if(jQueryFTI('.flow-drop').length > 0)
                    {
                        (function() {
                            var r = new Flow({
                                target: 'https://filetoinbox.com/p/ulc',
                                chunkSize: 1024 * 1024,
                                testChunks: false,
                                query: {'slug': ulcSlug, 'immediateUpload': (immediateUpload ? 1 : 0), 'sessionId': sessionId, 'isShopify': 1},
                                withCredentials: true,
                                // simultaneousUploads: 1
                            });
                            // Flow.js isn't supported, fall back on a different method
                            if(!r.support)
                            {
                                jQueryFTI('.flow-error').show();
                                return;
                            }
                            jQueryFTI('.fti-email-submit').click(function(){
                                email = jQueryFTI('.fti-email').val();

                                var url = 'https://filetoinbox.com/p/se';

                                jQueryFTI.ajax
                                ({
                                    type: "POST",
                                    url: url,
                                    async: false,
                                    data: {email: email, sessionId: sessionId},
                                    xhrFields: {
                                        withCredentials: true
                                    },
                                    success: function(data)
                                    {
                                        if(data == '1')
                                        {
                                            jQueryFTI('.fti-email-container').hide();
                                            jQueryFTI('.fti-upload-links').show();
                                        } else
                                        {
                                            jQueryFTI('.fti-upload-links').hide();
                                            jQueryFTI('.fti-email-container').show();
                                            jQueryFTI('.fti-email-error').show();
                                        }
                                    }
                                });
                            });

                            if(ftiWidget.requireEmailAddressBeforeUploading)
                            {
                                var url = 'https://filetoinbox.com/p/ge?sessionId=' + sessionId;

                                jQueryFTI.ajax
                                ({
                                    type: "GET",
                                    url: url,
                                    async: true,
                                    xhrFields: {
                                        withCredentials: true
                                    },
                                    success: function(data)
                                    {
                                        if(data != '')
                                        {
                                            email = data;
                                            jQueryFTI('.fti-email').val(email);
                                            jQueryFTI('.fti-email-container').hide();
                                            jQueryFTI('.fti-upload-links').show();
                                        } else
                                        {
                                            jQueryFTI('.fti-upload-links').hide();
                                            jQueryFTI('.fti-email-container').show();
                                        }
                                    }
                                });
                            }
                            // Show a place for dropping/selecting files
                            jQueryFTI('.flow-drop').show();
                            r.assignDrop(jQueryFTI('.flow-drop')[0]);
                            r.assignBrowse(jQueryFTI('.flow-browse')[0]);
                            r.assignBrowse(jQueryFTI('.flow-browse-folder')[0], true);
                            r.assignBrowse(jQueryFTI('.flow-browse-image')[0], false, false, {accept: 'image/*'});
                            // Handle file add event
                            r.on('fileAdded', function(file) {
                                if(maxNumberOfFiles > 0 && filesAdded >= maxNumberOfFiles)
                                {
                                    // todo show warning
                                    jQueryFTI('.flow-number-of-files').hide().slideDown('slow');
                                    return false;
                                } else
                                {
                                    // todo hide warning
                                    jQueryFTI('.flow-number-of-files').hide();
                                }
                                filesAdded++;
                                filesBeingUploaded++;
                                // disable add to cart button
                                // addToCart.attr('disabled', 'disabled');
                                addToCart.prop('disabled', true);
                                // Show progress bar
                                jQueryFTI('.flow-progress, .flow-list').show();
                                // jQueryFTI('#appbundle_uploadpageupload_submit').addClass('disabled');
                                // Add the file to the list
                                jQueryFTI('.flow-list').append(
                                    '<li class="flow-file flow-file-' + file.uniqueIdentifier + '">' +
                                    ftiWidget.messages.uploading + ' <span class="flow-file-name"></span> ' +
                                    '<span class="flow-file-size"></span> ' +
                                    '<span class="flow-file-progress"></span> ' +
                                    '<a href="" class="flow-file-download" target="_blank">' +
                                    + ftiWidget.messages.download +
                                    '</a> ' +
                                    '<span class="flow-file-pause">' +
                                    ' <img src="https://filetoinbox.com/images/flowjs/pause.png" title="' + ftiWidget.messages.pause + '" />' +
                                    '</span>' +
                                    '<span class="flow-file-resume">' +
                                    ' <img src="https://filetoinbox.com/images/flowjs/resume.png" title="' + ftiWidget.messages.resume + '" />' +
                                    '</span>' +
                                    '<span class="flow-file-cancel">' +
                                    ' <img src="https://filetoinbox.com/images/flowjs/cancel.png" title="' + ftiWidget.messages.cancel + '" />' +
                                    '</span>'
                                );
                                var $self = jQueryFTI('.flow-file-' + file.uniqueIdentifier);
                                $self.find('.flow-file-name').text(file.name);
                                $self.find('.flow-file-size').text(readablizeBytes(file.size));
                                $self.find('.flow-file-download').attr('href', '/download/' + file.uniqueIdentifier).hide();
                                $self.find('.flow-file-pause').on('click', function() {
                                    file.pause();
                                    $self.find('.flow-file-pause').hide();
                                    $self.find('.flow-file-resume').show();
                                });
                                $self.find('.flow-file-resume').on('click', function() {
                                    file.resume();
                                    $self.find('.flow-file-pause').show();
                                    $self.find('.flow-file-resume').hide();
                                });
                                $self.find('.flow-file-cancel').on('click', function() {
                                    file.cancel();
                                    $self.remove();
                                    setTimeout(function() {
                                        if(!ftiValidate())
                                        {
                                            // not valid
                                            // addToCart.attr('disabled', 'disabled');
                                            addToCart.prop('disabled', true);
                                        } else
                                        {
                                            // valid
                                            // addToCart.removeAttr('disabled');
                                            addToCart.prop('disabled', false);
                                        }
                                    }, 1000);
                                });
                                                                    
                                                            });
                            r.on('filesSubmitted', function(file) {
                                r.upload();
                            });
                            r.on('complete', function() {
                                // Hide pause/resume when the upload has completed
                                jQueryFTI('.flow-progress .progress-resume-link, .flow-progress .progress-pause-link').hide();
                                setTimeout(function() {
                                    addToCart = form.find('[type="submit"],[type="button"]').not('.fti-email-submit');
                                    if(!ftiValidate())
                                    {
                                        // not valid
                                        // addToCart.attr('disabled', 'disabled');
                                        addToCart.prop('disabled', true);
                                    } else
                                    {
                                        // valid
                                        // addToCart.removeAttr('disabled');
                                        addToCart.prop('disabled', false);
                                    }
                                }, 1000);
                            });
                            r.on('fileSuccess', function(file, message) {
                                filesBeingUploaded--;
                                if(immediateUpload)
                                {
                                    ftiAddFile(file);
                                } else
                                {
                                    ftiGetTempDropboxUrl(file);
                                }
                                var $self = jQueryFTI('.flow-file-' + file.uniqueIdentifier);
                                // Reflect that the file upload has completed
                                $self.find('.flow-file-progress').text(ftiWidget.messages.completed ?? 'completed');
                                $self.find('.flow-file-pause, .flow-file-resume').remove();
                                setTimeout(function() {
                                    ftiValidate()
                                }, 1000);
                                //$self.find('.flow-file-download').attr('href', '/download/' + file.uniqueIdentifier).show();
                            });
                            r.on('fileRemoved', function(file, message) {
                                var url = 'https://filetoinbox.com/p/ulr?isShopify=1&flowIdentifier=' + file.uniqueIdentifier +'&sessionId=' + sessionId;

                                jQueryFTI.get(url, function(data) {
                                    ftiRemoveFile(file);

                                    filesAdded = r.files.length;
                                    // console.log('filesAdded: ' + filesAdded);
                                    if(filesAdded == 0)
                                    {
                                        fileCount = 1;
                                    }
                                    jQueryFTI('.flow-number-of-files').hide();
                                    if(filesBeingUploaded > 0)
                                    {
                                        filesBeingUploaded--;
                                    }
                                    // enable add to cart button?
                                    // addToCart.removeAttr('disabled');
                                    addToCart.prop('disabled', false);
                                                                            
                                                                    });
                            });
                            r.on('fileError', function(file, message) {
                                filesBeingUploaded--;
                                // enable add to cart button?
                                // addToCart.removeAttr('disabled');
                                addToCart.prop('disabled', false);
                                // Reflect that the file upload has resulted in error
                                jQueryFTI('.flow-file-' + file.uniqueIdentifier).find('.flow-file-pause, .flow-file-resume').remove();
                                jQueryFTI('.flow-file-' + file.uniqueIdentifier + ' .flow-file-progress').html(+ ftiWidget.messages.unableLoad + ': ' + message + ')').css('color', 'red');
                            });
                            r.on('fileProgress', function(file) {
                                // Handle progress for both the file and the overall upload
                                jQueryFTI('.flow-file-' + file.uniqueIdentifier + ' .flow-file-progress')
                                    .html(Math.floor(file.progress() * 100) + '% '
                                        + readablizeBytes(file.averageSpeed) + '/s '
                                        + secondsToStr(file.timeRemaining()) + ' remaining');
                                jQueryFTI('.progress-bar').css({width: Math.floor(r.progress() * 100) + '%'});
                            });
                            r.on('uploadStart', function() {
                                // Show pause, hide resume
                                jQueryFTI('.flow-progress .progress-resume-link').hide();
                                jQueryFTI('.flow-progress .progress-pause-link').show();
                            });
                            r.on('catchAll', function() {
                                // console.log.apply(console, arguments);
                            });

                            var fakeXhr = new XMLHttpRequest();
                            fakeXhr.open('OPTIONS', 'https\u003A\/\/filetoinbox.com\/p\/ulc');
                            fakeXhr.send();

                            r.addFileFromSession = function(file, fileIdentifier, fileSize) {
                                var f = typeof window.Flow != 'undefined' ? new window.Flow.FlowFile(this, file) : new flowUploader.FlowFile(this, file);

                                f.uniqueIdentifier = fileIdentifier;
                                f.size = fileSize;
                                // prevent upload
                                if(f.chunks.length)
                                {
                                    f.chunks[0].xhr = fakeXhr;
                                }
                                console.log(f.chunks);

                                r.files.push(f);
                                r.fire('fileAdded', f);
                                setTimeout(function(){
                                    r.fire('fileSuccess', f);
                                    r.fire('complete');
                                }, 2000);
                            }

                            r.resetAfterAddToCart = function(){
                                r.files = [];
                                filesAdded = 0;
                                fileCount = 1;
                                filesBeingUploaded = 0;
                                delayedUploadDone = false;
                                timestamp = new Date().getTime();
                                sessionId = (new Date().toISOString().split('T')[0]) + '-' + makeid();
                                localStorage.setItem(localStorageKey, sessionId);
                                zipUrl = 'https://www.dropbox.com/home/Apps/FileToInbox.com/' + sessionId + '.zip';
                                console.log(sessionId, zipUrl);
                                jQueryFTI('.flow-list').html("");
                                jQueryFTI('.fti-upload-file-hidden').remove();
                            };

                            fileToInbox = {
                                pause: function() {
                                    r.pause();
                                    // Show resume, hide pause
                                    jQueryFTI('.flow-file-resume').show();
                                    jQueryFTI('.flow-file-pause').hide();
                                    jQueryFTI('.flow-progress .progress-resume-link').show();
                                    jQueryFTI('.flow-progress .progress-pause-link').hide();
                                },
                                cancel: function() {
                                    r.cancel();
                                    jQueryFTI('.flow-file').remove();
                                },
                                upload: function() {
                                    jQueryFTI('.flow-file-pause').show();
                                    jQueryFTI('.flow-file-resume').hide();
                                    r.resume();
                                },
                                flow: r
                            };
                        })();
                    }
                    var url = 'https\u003A\/\/filetoinbox.com\/p\/ulffs?sessionId=' + sessionId;

                    jQueryFTI.getJSON(url, function(data) {
                        var filesFromSession = data.files;
                        if(typeof filesFromSession === 'object')
                        {
                            filesFromSession = Object.values(filesFromSession);
                        }
                        console.log('filesFromSession: ' + filesFromSession);
                        filesFromSession.forEach((fileFromSession) => {
                            console.log('fileFromSession: ' + fileFromSession);
                            var file = new File(["foo"], fileFromSession.name);

                            //  fileIdentifier, fileSize, fileName
                            fileToInbox.flow.addFileFromSession(file, fileFromSession.identifier, fileFromSession.size);
                        });
                    });
                });

                let readablizeBytes = function(bytes)
                {
                    var s = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];
                    var e = Math.floor(Math.log(bytes) / Math.log(1024));
                    return (bytes / Math.pow(1024, e)).toFixed(2) + " " + s[e];
                }

                let secondsToStr = function(temp)
                {
                    function numberEnding(number)
                    {
                        return (number > 1) ? 's' : '';
                    }

                    var years = Math.floor(temp / 31536000);
                    if(years)
                    {
                        return years + ' year' + numberEnding(years);
                    }
                    var days = Math.floor((temp %= 31536000) / 86400);
                    if(days)
                    {
                        return days + ' day' + numberEnding(days);
                    }
                    var hours = Math.floor((temp %= 86400) / 3600);
                    if(hours)
                    {
                        return hours + ' hour' + numberEnding(hours);
                    }
                    var minutes = Math.floor((temp %= 3600) / 60);
                    if(minutes)
                    {
                        return minutes + ' minute' + numberEnding(minutes);
                    }
                    var seconds = temp % 60;
                    return seconds + ' second' + numberEnding(seconds);
                }
            }
        }
    });
});
