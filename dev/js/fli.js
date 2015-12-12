/* Utilities
 *
 * App utility methods
 *
 */

(function(exports) {
    "use strict";

    var options = { weekday: "long", year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };

    function FireUtils(settings) {
        // make it a singleton
        if (exports.fireUtils) {
            return fireUtils;
        }

        // default ajax retry times is set to 3
        settings.retryTimes = settings.retryTimes || 3;
        // default ajax timeout is set to 10 seconds (ajax timeout value is in milliseconds, hence we need to multiply by 1000)
        settings.networkTimeout = 1000*(settings.networkTimeout || 10);

        this.prefix = '';
        this.errorTriggered = false;

        /**
         * Grabs the handlebars template, runs the data through it, and appends the final html to the homeview.
         * @param {object} el handlebars template element
         * @param {object} context data for filling out the template
         */
        this.buildTemplate = function (el, context) {
            var source = el.html();
            var template = Handlebars.compile(source);
            return template(context);
        };

        /**
         * Handlebars helper for only displaying items that fit in the main content view, this is decided by
         * the SHOWN_ROW_ITEM_LENGTH constant, this constant would change depending on the width of your items, this allows
         * handlebars to display items that are on the first page, and not display others.
         */
         Handlebars.registerHelper('firstPageItem', function (value, options) {
             if (value >= 6) {
                 return options.inverse(this);
             } else {
                 return options.fn(this);
             }
         });

        /**
         * apply vendor prefix (indiscriminately) to passed style
         */
        this.vendorPrefix = function(prop) {
            return this.prefix + prop;
        };

        // find the current vendor prefix
        var regex = /^(Moz|Webkit|ms)(?=[A-Z])/;
        var someScript = document.getElementsByTagName('script')[0];

        for (var prop in someScript.style) {
            if (someScript.style.hasOwnProperty(prop) && regex.test(prop))  {
                this.prefix = prop.match(regex)[0];
                break;
            }
        }

        if (!this.prefix && 'WebkitOpacity' in someScript.style) {
            this.prefix = 'Webkit';
        }
        if (!this.prefix) {
            // unprefixed, go figure
            this.prefix = '';
        }

       /**
        * Convert timestamp to formated date
        * @param {Number} date timestamp
        * @return {String}
        */
        this.formatDate = function(date){
            return new Date(date).toLocaleTimeString("en-us", options);
        };

       /**
        * Wrapper around ajax call to provide retry function
        * @param {Object} requestData data object that is to be passed to ajax call body
        */
        this.ajaxWithRetry = function(requestData) {
            requestData.timeout = settings.networkTimeout;
            this.ajaxHelper(settings.retryTimes, requestData, requestData.error, requestData.complete);
        };

       /**
        * Helper function to recursively call itself until we exhausted the retry times upon error
        * @param {Number} number of times to retry
        * @param {Object} request data object that is to be passed to ajax call body
        * @param {function} error callback function when we exhausted retries
        */
        this.ajaxHelper = function(retryTimes, requestData, errorCallBack, completeCallBack) {
            if (retryTimes < 0) {
                retryTimes = 0;
            }
            requestData.complete = function() {
                if (!this.errorTriggered && completeCallBack) {
                    completeCallBack(arguments);
                }
                this.errorTriggered = false;
            }.bind(this);

            requestData.error = function(jqXHR, textStatus, errorThrown) {
                this.errorTriggered = true;
                if (retryTimes === 0) {
                    errorCallBack(jqXHR, textStatus, errorThrown);
                } else {
                    this.ajaxHelper(retryTimes - 1, requestData, errorCallBack, completeCallBack);
                }
            }.bind(this);
            $.ajax(requestData);
        }.bind(this);
    }

    exports.FireUtils = FireUtils;
}(window));

/* Error Handler
 *
 * Handle errors that are raised up from all components
 *
 */

 (function (exports) {
    "use strict";

    /**
     * This is a list of error types for each components to slot a specific error. NETWORK_ERROR is now used in model.js. This list should be extended
     * as we deal with more error cases.
     */
    exports.ErrorTypes = {
        NETWORK_ERROR : {
          errTitle : "Network Error",
          errToDev : "Network error",
          errToUser : "An unexpected error occurred. Select OK to exit, or check your network and try again."
        },
        INITIAL_NETWORK_ERROR : {
          errTitle : "Network Error",
          errToDev : "Network error",
          errToUser : "An unexpected error occurred. Select OK to exit, or check your network and try again."
        },
        CATEGORY_NETWORK_ERROR : {
          errTitle : "Network Error",
          errToDev : "Network error",
          errToUser : "An unexpected error occurred. Select OK to exit, or check your network and try again."
        },
        SUBCATEGORY_NETWORK_ERROR : {
          errTitle : "Network Error",
          errToDev : "Network error",
          errToUser : "An unexpected error occurred. Select OK to exit, or check your network and try again."
        },
        SEARCH_NETWORK_ERROR : {
          errTitle : "Network Error",
          errToDev : "Network error",
          errToUser : "An unexpected error occurred. Select OK to exit, or check your network and try again."
        },
        TIMEOUT_ERROR : {
          errTitle : "Video Playback Error",
          errToDev : "Timeout error",
          errToUser : "An unexpected error occurred. Select OK to exit, or check your network and try again."
        },
        SLOW_RESPONSE : {
          errTitle : "Slow Response",
          errToDev : "Slow response",
        },
        CONTENT_SRC_ERROR : {
          errTitle : "Video Playback Error",
          errToDev : "Video source not available or supported",
          errToUser : "An unexpected error occurred. Select OK to exit, or try again."
        },
        CONTENT_DECODE_ERROR : {
          errTitle : "Video Playback Error",
          errToDev : "Content decode error",
          errToUser : "An unexpected error occurred. Select OK to exit, or try again."
        },
        VIDEO_NOT_FOUND : {
          errTitle : "Video Playback Error",
          errToDev : "Video not found",
          errToUser : "An unexpected error occurred. Select OK to exit, or try again."
        },
        HTML5_PLAYER_ERROR : {
          errTitle : "Video Playback Error",
          errToDev : "Video cannot be played in the html5 player or there's something wrong with the player",
          errToUser : "An unexpected error occurred. Select OK to exit, or try again."
        },
        EMBEDDED_PLAYER_ERROR : {
          errTitle : "Video Playback Error",
          errToDev : "Video cannot be played in the embedded player",
          errToUser : "An unexpected error occurred. Select OK to exit, or try again."
        },
        INITIAL_FEED_ERROR : {
          errTitle : "Video Feed Error",
          errToDev : "Initial feed error",
          errToUser : "An unexpected error occurred. Select OK to exit, or try again."
        },
        CATEGORY_FEED_ERROR : {
          errTitle : "Video Feed Error",
          errToDev : "Category Feed Error",
          errToUser : "An unexpected error occurred. Select OK to exit, or try again."
        },
        SUBCATEGORY_ERROR : {
          errTitle : "Video Feed Error",
          errToDev : "Subcategory Feed Error",
          errToUser : "An unexpected error occurred. Select OK to exit, or try again."
        },
        INITIAL_PARSING_ERROR : {
          errTitle : "Video Feed Error",
          errToDev : "Initial Parsing error",
          errToUser : "An unexpected error occurred. Select OK to exit, or try again."
        },
        CATEGORY_PARSING_ERROR : {
          errTitle : "Video Feed Error",
          errToDev : "Category Parsing Error",
          errToUser : "An unexpected error occurred. Select OK to exit, or try again."
        },
        SUBCATEGORY_PARSING_ERROR : {
          errTitle : "Video Feed Error",
          errToDev : "Subcategory Parsing Error",
          errToUser : "An unexpected error occurred. Select OK to exit, or try again."
        },
        INITIAL_FEED_TIMEOUT : {
          errTitle : "Video Feed Error",
          errToDev : "Initial Feed Timeout",
          errToUser : "An unexpected error occurred. Select OK to exit, or try again."
        },
        CATEGORY_FEED_TIMEOUT : {
          errTitle : "Video Feed Error",
          errToDev : "Category Feed Timeout",
          errToUser : "An unexpected error occurred. Select OK to exit, or try again."
        },
        SUBCATEGORY_TIMEOUT : {
          errTitle : "Video Feed Error",
          errToDev : "Subategory Feed Timeout",
          errToUser : "An unexpected error occurred. Select OK to exit, or try again."
        },
        YOUTUBE_SECTION_ERROR : {
          errTitle : "Video Feed Error",
          errToDev : "Youtube Section Error",
          errToUser : "An unexpected error occurred. Select OK to exit, or try again."
        },
        SEARCH_TIMEOUT : {
          errTitle : "Search Error",
          errToDev : "Search Timeout",
          errToUser : "An unexpected error occurred. Select OK to exit, or try again."
        },
        SEARCH_PARSING_ERROR : {
          errTitle : "Search Error",
          errToDev : "Search Parsing Error",
          errToUser : "An unexpected error occurred. Select OK to exit, or try again."
        },
        SEARCH_ERROR : {
          errTitle : "Search Error",
          errToDev : "Search Error",
          errToUser : "An unexpected error occurred. Select OK to exit, or try again."
        },
        IMAGE_LOAD_ERROR : {
          errTitle : "Image Load Error",
          errToDev : "Image load error",
          errToUser : "Unable to load thumbnail image."
        },
        PLAYER_ERROR : {
          errTitle : "Video Playback Error",
          errToDev : "Player Error",
          errToUser : "An unexpected error occurred. Select OK to exit."
        },
        TOKEN_ERROR : {
          errTitle : "Video Playback Error",
          errToDev : "Token Error",
          errToUser : "An unexpected error occurred. Select OK to exit."
        },
        UNKNOWN_ERROR : {
          errTitle : "Unknown Error",
          errToDev : "Unknown error",
          errToUser : "An unexpected error occurred. Select OK to exit, or try again."
        }
    };

    /**
     * @class ErrorHandler
     * @description The errorHandler object, this handles error reporting, logging, and displaying error dialog.
     */
    function ErrorHandler() {

        /**
         * This is a helper function to generate error stacktrace
         * @return {String}
         */
        this.genStack = function() {
            var e = Error();
            return e.stack;
        };

        /**
         * Write error details to console
         * @param {String} type of error (generic)
         * @param {String} error detail with context info
         * @param {String} full callstack when error occurs
         */
        this.writeToConsole = function(errType, errToDev, errStack) {
            var errStr = "ErrorType : " + errType.errTitle + "\nErrorMessage : " + errType.errToDev + "\nErrorStack : " + errStack + "\nTimestamp : " + new Date();
            console.error(errStr);
        };

        /**
         * Report error to app developer. By default it is no op. App dev can follow the example code to complete the implementation
         * @param {String} type of error (generic)
         * @param {String} error detail with context info
         * @param {String} full callstack when error occurs
         */
        this.informDev = function(errType, errToDev, errStack) {
            if (errType && errToDev && errStack) {
              /**
               * This commented code is an example of how to report error back to app developer.
               *
                 var errorObj = {
                     type: errType,
                     message: errToDev,
                     stack: errStack,
                     timestamp: new Date()
                 };

                 var requestData = {
                     url : "PUT-APP-ERROR-REPORT-URL-HERE",
                     type : 'GET',
                     crossDomain : true,
                     dataType : 'json',
                     context : this,
                     cache : false,
                     data : errorObj,
                     error : function() {
                         this.writeToConsole(ErrorTypes.NETWORK_ERROR, "Failed to report error to app developer", this.genStack());
                     }.bind(this)
                  };
                  utils.ajaxWithRetry(requestData);
               */
               return true;
             }
        };

        /**
         * Create error pop up. app.js will manage the view creation.
         * @param {String} error title to user
         * @param {String} error message to user
         * @param {Object} list of buttons with text string, and click callback
         */
        this.createErrorDialog = function(title, message, buttons) {
            var errorObj = {
                title: title,
                message: message,
                buttons: buttons
            };
            return new DialogView(errorObj);
        };
    }

    exports.ErrorHandler = ErrorHandler;
}(window));

/* Dialog View
 *
 * Handles modal dialog
 *
 */

(function (exports) {
    "use strict";

   
    function DialogView(dialogData) {
        Events.call(this, ['exit']);

        this.title = dialogData.title;
        this.message = dialogData.message;
        this.buttons = dialogData.buttons;
        this.buttonView = null;
        this.$el = null;
        
        
        this.render = function ($container) {
            var html = fireUtils.buildTemplate($("#dialog-template"), dialogData);
            $container.append(html);
            this.$el = $container.children().last();

            // set up the button view
            var buttonView = this.buttonView = new ButtonView();

            //Create a buttons array for the buttons you want to add
            var buttonArr = [];
            for (var i = 0; i < this.buttons.length; i++) {
                buttonArr.push({
                    id: this.buttons[i].id,
                    buttonValue: this.buttons[i].text
                });
            }

            // render the button view and select the first button
            buttonView.render(this.$el.find(".dialog-buttons-container"), buttonArr, this.handleButtonCallback);
            this.buttonView.updateCurrentSelectedIndex(0);

            // reselect the same button on the exit event, basically throw away the exit event in this dialog
            buttonView.on("exit", function() {
                this.buttonView.updateCurrentSelectedIndex(this.buttonView.selectedButtonIndex);
            }.bind(this));
        };

       
        this.handleButtonCallback = function(button) {
            var clickedButton = $(button).attr('id');
            // find the matching button from the buttons list to call the callback
            for (var i = 0; i < this.buttons.length; i++) {
                if (this.buttons[i].id === clickedButton) {
                    this.buttons[i].callback(this.buttons[i]);
                    return;
                }
            }
        }.bind(this);

        /**
         * Handle key events
         * @param {event} the keydown event
         */
        this.handleControls = function (e) {
            this.buttonView.handleControls(e);
        }.bind(this);

        /**
         * Remove the dialog from the app
         */
        this.remove = function() {
            this.$el.remove();
        };
    }

    exports.DialogView = DialogView;
}(window));

/* Button View
 *
 * Handles the display of buttons under the content description  
 * 
 */
(function (exports) {
    "use strict";

    //constants
    var CLASS_BUTTON_STATIC = "detail-item-button-static",

        CLASS_BUTTON_SELECTED = "detail-item-button-selected";

   /**
    * @class ButtonView 
    * @description The Button view object, this handles everything about the buttons 
    */
    function ButtonView() {

        // mixin inheritance, initialize this as an event handler for these events:
        Events.call(this, ['exit', 'revoke', 'select']);

        //global variables
        this.selectedButtonIndex = 0;
        this.handleButtonCallback = null;
        
        //jquery global variables
        this.$el = null;
        this.$buttons = null;

       /**
        * Hides the button view
        */
        this.hide = function () {
            this.$el.hide();
        };

        /**
         * Display the button view
         */
        this.show = function () {
            this.$el.show();
        };

       /**
        * Remove the button view
        */
        this.remove = function () {
            this.$el.remove();
        };

       /**
        * Remove the styling from the existing selected button
        * and add the selected style to the newly selected button
        */
        this.updateSelectedButton = function () {
            //remove hilight from last selected button
            this.setStaticButton();

            //add hilight to newly selected button
            this.setSelectedButton();
        };

       /**
        * Change the style of the selected element to selected 
        */
        this.setSelectedButton = function () {
            //apply the selected class to the newly-selected button
            var buttonElement = $(this.getCurrentSelectedButton());

            buttonElement.removeClass(CLASS_BUTTON_STATIC);
            buttonElement.addClass(CLASS_BUTTON_SELECTED);
        };

       /**
        * Change the style of the unselected button to static 
        */
        this.setStaticButton = function () {
            var buttonElement = $("." + CLASS_BUTTON_SELECTED);

            if(buttonElement) {
                buttonElement.removeClass(CLASS_BUTTON_SELECTED);
                buttonElement.addClass(CLASS_BUTTON_STATIC);
            }
        };

       /**
        * Event handler for remote "select" button press 
        */
        this.handleButtonEvent = function () {
            var currentButton = this.getCurrentSelectedButton();
            if(typeof this.handleButtonCallback === "function") {
                this.handleButtonCallback(currentButton);
            }
            else {
                console.log('no callback provided');
                alert("You pressed the " + currentButton.innerHTML + " button"); 
            }
            buttons.resync();
        }.bind(this);

      /**
        * Event hander for tap
        * @param {Event} e
        */
        this.handleButtonTap = function (e) {
            this.showAlert(e.target.innerHTML);
        }.bind(this);

        /**
         * Creates the button view from the template and appends it to the given element
         * @param {Element} $el the application container
         * @param {Array} buttonArr the buttons that need to be added
         * @param {Function} buttonCallbackHandler callback method for button selection 
         */
        this.render = function ($el, buttonArr, buttonCallbackHandler) {
            // Build the left nav template and add its
            var html = fireUtils.buildTemplate($("#button-view-template"), {
                items:buttonArr 
            });

            $el.append(html);

            this.$el = $el.children().last();
            this.$buttons = $el.find(".detail-item-button-static");

            this.handleButtonCallback = buttonCallbackHandler;

            //touches.registerTouchHandler("detail-item-button-static", this.handleButtonTap);
        };

       /**
        * Key event handler
        * handles controls: LEFT : select button to the left 
        *                   RIGHT: select button to the right 
        *                   UP:change focus back to 1D view 
        *                   DOWN:Nothing 
        *                   BACK: Change focus back to 1D view 
        * @param {event} the keydown event
        */
        this.handleControls = function (e) {
            if (e.type === 'buttonpress') {
                switch (e.keyCode) {
                    case buttons.UP:
                        this.setStaticButton();
                        this.trigger('exit');
                        break;

                    case buttons.DOWN:
                        break;
                    case buttons.LEFT:
                        this.incrementCurrentSelectedIndex(-1);
                        break;
                    case buttons.BACK:
                        this.setStaticButton();
                        this.trigger('exit');
                        break;
                    case buttons.SELECT:
                        //do button action
                        this.handleButtonEvent();
                        break;
                    case buttons.RIGHT:
                        this.incrementCurrentSelectedIndex(1);
                        break;
                }
           }
        }.bind(this);

       /**
        * Get the currently selected button
        */
        this.getCurrentSelectedButton = function() {
            return this.$buttons[this.selectedButtonIndex];
        };

       /**
        * Explicitly set the index of the currently selected item 
        * @param {number} index the index of the selected button 
        */
        this.setCurrentSelectedIndex = function(index) {
            this.selectedButtonIndex = index;
        };

       /**
        * Set the index and update the button views
        * @param {number} index the index of the selected button 
        */
        this.updateCurrentSelectedIndex = function(index) {
            this.selectedButtonIndex = index;
            this.updateSelectedButton();
        };

       /**
        * Increment the index of the currently selected item 
        * @param {number} increment the number to add or subtract from the currentSelectedIndex 
        */
        this.incrementCurrentSelectedIndex = function(increment) {
            var newIdx = this.selectedButtonIndex + increment;

            if(newIdx >= 0 && newIdx < this.$buttons.length) {
                this.selectedButtonIndex = newIdx;
                this.updateSelectedButton();
             }
        };

    }

    exports.ButtonView = ButtonView;

}(window));

/* Events
 *
 * A _very_ simple event manager, here only to keep this project framework agnostic, replace with something more robust.
 *
 */

(function(exports) {
    "use strict";

    /**
     * Events provides a VERY simple event manager, with just the minimum needed to support this app, if you're
     * doing anything interesting, replace this with the event system from a framework.
     *
     * @param {array} eventSet : optional, pass an array of event types and the class will throw if an unknown event is
     * mentioned, useful for catching typos in event names
     * @constructor
     */
    function Events(eventSet) {

        this.eventSet = eventSet;
        this.eventHandlers = {};

        /**
         * register for an event
         * @param {string} event to listen for
         * @param {function} callback function to call when event is triggered, args will be whatever is passed to trigger
         * @param {object} context, 'this' for callback function, optional
         */
        this.on = function(event, callback, context) {
            if (this.eventSet && this.eventSet.indexOf(event) === -1) {
                throw "Unknown event: " + event;
            }
            var handlers = this.eventHandlers[event] || (this.eventHandlers[event] = []);
            handlers.push({callback: callback, context: context});
        };

        /**
         * unregister for (an) event(s)
         * @param {string} event to stop listening, or undefined to match all events
         * @param {function} callback function to remove, or undefined to match all functions
         * @param {object} context for function to remove, must match context passed to on
         * Note: implication is that calling off() with no args removes all handlers for all events
         */
        this.off = function(event, callback, context) {
            for (var evt in this.eventHandlers) {
                if (!event || event === evt) {
                    this.eventHandlers[evt] = this.eventHandlers[evt].filter(this.createEventHandler(callback, context));
                }
            }

        };

        /**
         * creates event handler function
         */
        this.createEventHandler = function(callback, context) {
            return function(element) {return (callback && callback !== element.callback) || (context && context !== element.context);};
        };

        /**
         * triggers an event, calling all the handlers
         * @param {string} event to trigger
         */
        this.trigger = function(event) {
            if (this.eventSet && this.eventSet.indexOf(event) === -1) {
                throw "Unknown event: " + event;
            }
            var handlers = this.eventHandlers[event];
            if (handlers) {
                for (var i = 0; i < handlers.length; i++) {
                    handlers[i].callback.apply(handlers[i].context, Array.prototype.slice.call(arguments, 1));
                }
            }
        };
    }

    exports.Events = Events;
}(window));

/* Buttons utility
 *
 * Normalize input to a simple 5 way nav plus back button
 *
 */

(function(exports) {
    "use strict";

    /**
     * Buttons provides a simple abstraction for a 5-way nav plus back and media buttons.
     * Buttons trigger events: 'buttonpress', optionally 'buttonrepeat' at a decaying interval, and 'buttonrelease'
     * Only one button at a time can be pressed, other key events are ignored until that button is released.
     * Button codes are based on keyboard keyCodes for simplicity.
     * @return {*}
     * @constructor
     */
    function Buttons() {
        // make it a singleton
        if (exports.buttons) {
            return buttons;
        }

        /**
         * Buttons uses Events to trigger the button events
         */
        Events.call(this, ['buttonpress', 'buttonrepeat', 'buttonrelease']);

        /**
         * constants for buttons, based onf keyCode for key events:
         */

        this.TIZEN_CANCEL_OR_RETURN = 65385;
        this.TIZEN_RETURN = 10009;
        this.TIZEN_KEYBOARD_DONE = 65376;       

        this.CLICK = 0;
        this.UP = 38;
        this.DOWN = 40;
        this.LEFT = 37;
        this.RIGHT = 39;
        this.SELECT = 13;
        this.BACK = 8;
        this.REWIND = 227;
        this.PLAY_PAUSE = 179;
        this.FAST_FORWARD = 228;

        this.KEYCODES = [8, 13, 37, 38, 39, 40, 179, 227, 228, 0, 65385, 10009,65376];

        this.BUTTON_INTERVALS = [250, 350, 500];

        // records if the button is currently held down for different interaction on button hold
        this.startHeldDown = {};
        this.intervalIndex = 0;
        this.currentKey = 0;
        this.scrollTimerId = 0;
        this.suspended = false;
        this.buttonIntervals = this.BUTTON_INTERVALS;
        this.currentInterval = 0;

        /**
         * reset abandons any subsequent events from the current button press, no more buttonrepeat or buttonrelease events
         * will be generated even if the button remains held down
         */
        this.reset = function() {
            this.currentKey = 0;
            if (this.scrollTimerId) {
                window.clearTimeout(this.scrollTimerId);
                this.scrollTimerId = 0;
            }
            this.suspended = false;
        };

        /**
         * resync with browser key state, needed when window loses focus and system keyUp events may get lost
         * if a button is held down the next keyDown event (from auto-repeat) will trigger a 'buttonpress'
         */
        this.resync = function() {
            this.reset();
            this.startHeldDown = {};
        };

        /**
         * suspend processing of key events and let them propagate normally, e.g. so that an input
         * element can get text, call reset() to end suspension
         */
        this.suspend = function() {
            this.resync();
            this.suspended = true;
        };

        // gets the next delay interval, pass reset=true to start over
        this.getButtonInterval = function(reset) {
                if (reset) {
                    this.intervalIndex = this.buttonIntervals.length;
                }
                
                if (this.intervalIndex > 0) {
                    this.intervalIndex--;
                }
                this.currentInterval = this.buttonIntervals[this.intervalIndex];
                return this.currentInterval;

        };        

        // browser integration, de-bounce and de-duplicate key events, only allow one button at a time to be handled
        this.handleKeyDown = function (e) {
             // buffers automatically when created
            //app.pling.play();
            var keyCode = e.keyCode;
            if (!this.suspended && this.KEYCODES.indexOf(keyCode) >= 0) 
            {
                
                e.preventDefault();
               
                if (!this.startHeldDown[keyCode])
                 { // ignore any repeated keyDown events (cleared on keyUp)
                  
                    this.startHeldDown[keyCode] = e.timeStamp || (new Date()).getTime();
                    
                    if (!this.currentKey) 
                    {
                        
                        this.currentKey = keyCode;
                        

                        this.scrollTimerId = window.setTimeout(this.doRepeat, this.getButtonInterval(true));
                        

                        this.trigger('buttonpress', {type: 'buttonpress', keyCode: keyCode});
                    }
                }
            }
        }.bind(this);

        this.handleKeyUp = function (e) {
            
            var keyCode = e.keyCode;

            if (!this.suspended && this.KEYCODES.indexOf(keyCode) >= 0) 
            {

                e.preventDefault();
                
                if (this.startHeldDown[keyCode])
                 { // ignore any keyUp events that aren't for keys which are down

                    this.startHeldDown[keyCode] = 0;                    

                    // only emit release if this handler also got press
                    if (this.currentKey === keyCode) 
                    {
                        this.currentKey = 0;
                        if (this.scrollTimerId) 
                        {
                            window.clearTimeout(this.scrollTimerId);
                            this.scrollTimerId = 0;
                        }
                        

                        this.trigger('buttonrelease', {type: 'buttonrelease', keyCode: keyCode});
                    }
                }
            }
        }.bind(this);

        this.doRepeat = function () {
            if (!this.suspended && this.currentKey && this.startHeldDown[this.currentKey]) {
                this.scrollTimerId = window.setTimeout(this.doRepeat, this.getButtonInterval());
                this.trigger('buttonrepeat', {type: 'buttonrepeat', keyCode: this.currentKey});
            }
        }.bind(this);

        this.resetButtonIntervals = function() {
            this.setButtonIntervals(this.BUTTON_INTERVALS);
        }.bind(this);

        this.setButtonIntervals = function(interval) {
            if (this.buttonIntervals !== interval) {
                this.buttonIntervals = interval;
                this.intervalIndex = this.buttonIntervals.length;
            }
        }.bind(this);

       // window.addEventListener("mouseup", this.handleMouseUp, false);
       // window.addEventListener("mousedown", this.handleMouseDown, false);
        window.addEventListener("keydown", this.handleKeyDown, false);
        window.addEventListener("keyup", this.handleKeyUp, false);

        // the system handles the 'back' button on the remote and turns it into a browser back event, so
        // we use the history API to watch for 'popstate' (back button press) events and convert these into
        // button press events for the BACKSPACE key.
        // this is documented more in the AWV app knowledge base
        window.addEventListener("load", function () {
            window.addEventListener("popstate", function (evt) {
                if (window.history.state !== "backhandler") {
                    // state will be AFTER the 'backhandler' is popped, so we ignore it if it's popping dummy state
                    // handle same as BACKSPACE keycode
                    if (!this.suspended) {
                        this.handleKeyDown({type: 'keydown', keyCode: this.BACK, timeStamp: evt.timeStamp, preventDefault: function(){}});
                        this.handleKeyUp({type: 'keyup', keyCode: this.BACK, timeStamp: evt.timeStamp, preventDefault: function(){}});
                    }
                    window.history.pushState("backhandler", null, null);
                }
            }.bind(this));
            if (window.history.state !== "backhandler") {
                window.history.pushState("backhandler", null, null); // pushing a dummy state so that popstate is always called
            }
        }.bind(this));
    }

    exports.Buttons = Buttons;
    exports.buttons = new Buttons();
}(window));

(function (exports) {
    "use strict";


    function ControlsView() {

        Events.call(this, ['loadingComplete']);

         this.totalDurationFound = null;
         this.currSelection = 1;
         this.elementsLength = null;
         this.continuousSeek = false;


        this.render = function ($container, playerView ) {
            // Build the  content template and add it
            var html = fireUtils.buildTemplate($("#fli-controls-view"), {});

            $container.append(html);
            this.$containerControls = $container.children().last();
            this.containerControls = $container.children().last()[0];
            this.pauseIcon = $container.find(".pause")[0];
            $('div.pause').css('background-color', ' #ff6600');

            // this.$containerControls.find(".player-controls-content-title").text(data.title);
            // this.$containerControls.find(".player-controls-content-subtitle").text(this.truncateSubtitle(data.description));
            // this.seekHead = this.$containerControls.find(".player-controls-timeline-playhead")[0];
            this.$currTime = this.$containerControls.find(".currentRunTimeBox");
            this.$totalTime =  this.$containerControls.find(".totalRunTimeBox");
            this.$forwardIndicator = this.$containerControls.find(".ff");
            this.$rewindIndicator = this.$containerControls.find(".rw");
            this.forwardIndicator = this.$forwardIndicator[0];
            this.rewindIndicator = this.$rewindIndicator[0];
            this.seekHead = this.$containerControls.find(".progressDot")[0];
            this.progressContainer = this.$containerControls.find(".coloredProgressContainer")[0];
            // this.$forwardIndicatorText = this.$forwardIndicator.find(".player-controls-skip-number");
            // this.$rewindIndicatorText = this.$rewindIndicator.find(".player-controls-skip-number");
             this.playerView = playerView;
             playerView.on('videoStatus', this.handleVideoStatus, this);
             this.elementsLength = $(".controlBox").children().length + 1;
             //this.trigger('loadingComplete');
        };


            this.move = function (dir) {

              //this.trigger("startScroll", dir);
              this.selectRowElement(dir);
            }.bind(this);

            this.selectRowElement = function (direction) {

                  if ((direction > 0 && (this.elementsLength -1) === this.currSelection) || (direction < 0 && this.currSelection === 0 )) {
                    return false;
                  }



                 if (direction > 0 &&  this.currSelection === 2){

                    $(".controlBox").children().eq(this.currSelection).css('background-color', '');

                    this.currSelection += direction;

                     $(".closedCaption").css('background-color', '#ff6600');

                     return;

                 }

                 if(direction < 0 && this.currSelection === 3 ){

                    $(".closedCaption").css('background-color', '');

                    this.currSelection += direction;

                    $(".controlBox").children().eq(this.currSelection).css('background-color', '#ff6600');

                    return;
                 }


                $(".controlBox").children().eq(this.currSelection).css('background-color', '');

                this.currSelection += direction;

                $(".controlBox").children().eq(this.currSelection).css('background-color', '#ff6600');




            }.bind(this);



        this.convertSecondsToHHMMSS = function(seconds, alwaysIncludeHours) {
            var hours = Math.floor( seconds / 3600 );
            var minutes = Math.floor( seconds / 60 ) % 60;
            seconds = Math.floor( seconds % 60 );

            var finalString = "";

            if (hours > 0 || alwaysIncludeHours) {
                finalString += hours + ":";
            }
            return finalString + ('00' + minutes).slice(-2) + ":" + ('00' + seconds).slice(-2)  ;
        };

        this.handleVideoStatus = function(currentTime, duration, type) {
            // video has been loaded correctly
            if (!this.totalDurationFound) {
                this.durationChangeHandler(duration);
            }

            switch (type) {
                case "paused":
                    this.pausePressed();
                    break;
                case "durationChange":
                    this.durationChangeHandler(duration);
                    break;
                case "playing":
                    this.timeUpdateHandler(duration, currentTime);
                    break;
                case "resumed":
                    this.resumePressed();
                    break;
                case "seeking":
                    this.seekPressed(currentTime);
                    break;
            }
            this.previousTime = currentTime;
        }.bind(this);

         this.seekPressed = function(currentTime) {
            var skipTime = Math.round(Math.abs(currentTime - this.previousTime));
            if (this.previousTime > currentTime) {
                // // skip backwards
                // this.clearTimeouts();
                // this.showAndHideControls();
                // this.setIndicator("rewind", skipTime);
                // this.$forwardIndicator.hide();
                // this.indicatorTimeout = setTimeout(function() {
                //     this.$rewindIndicator.hide();
                // }.bind(this), this.controlsHideTime);
            }
            else if (currentTime > this.previousTime) {
                 //playerView.videoElement.playbackRate =
                // skip forward
                // this.clearTimeouts();
                // this.showAndHideControls();
                // this.setIndicator("forward", skipTime);
                // this.$rewindIndicator.hide();
                // this.indicatorTimeout = setTimeout(function() {
                //     this.$forwardIndicator.hide();
                // }.bind(this), this.controlsHideTime);
            }
        }.bind(this);

        this.pausePressed = function () {

            //$('div.pause').css('background-color', '');
            // $("div.pause").removeClass("pause").addClass("play");
            //  $('div.play').css('background-color', '#ff6600');
            // if (this.pauseTimeout) {
            //     clearTimeout(this.pauseTimeout);
            //     this.pauseTimeout = 0;
            // }
            // this.containerControls.style.opacity = "0.99";
            // // show pause icon
            // this.playIcon.style.opacity = "0.99";
            // // hide the pause icon after designated time by ux
            // this.pauseTimeout = setTimeout(function() {
            //     this.playIcon.style.opacity = "0";
            // }.bind(this), this.PAUSE_REMOVAL_TIME);
            // // cancel any pending timeouts
            // clearTimeout(this.removalTimeout);

        };

        this.resumePressed = function() {
            // hide pause icon
            // this.playIcon.style.opacity = "0";
             //this.showAndHideControls();
            // $("div.play").removeClass("play").addClass("pause");
            // $('div.pause').css('background-color', '#ff6600');
        };

         this.showAndHideControls = function() {
            //console.log("show and Hide");

            // this.containerControls.style.opacity = "0.99";
            // clearTimeout(this.removalTimeout);
            // this.removalTimeout = setTimeout(function() {
            //      this.containerControls.style.opacity = "0";
            //      this.$rewindIndicator.hide();
            //      this.$forwardIndicator.hide();
            // }.bind(this), this.controlsHideTime);
        };

        this.durationChangeHandler = function(videoDuration) {
            // check if we have found a duration yet, and that duration is a real value
            if (videoDuration) {
                    var duration = this.convertSecondsToHHMMSS(videoDuration);

                    this.$totalTime.text(duration);
                    // this.totalDurationFound = true;

                    // // show controls after duration found
                    // this.containerControls.style.opacity = "0.99";
                    // this.playIcon.style.opacity = "0";
                    // this.showAndHideControls();
            }
        }.bind(this);

        this.timeUpdateHandler = function(videoDuration, videoCurrentTime) {
            // Calculate the slider value
            var value = (600 / videoDuration) * videoCurrentTime;
             this.seekHead.style.marginLeft = value + "px";
             this.progressContainer.style.width = value + "px";
            // this.forwardIndicator.style.left = (value - this.SKIP_INDICATOR_OFFSET) + "%";
            // this.rewindIndicator.style.left = (value - this.SKIP_INDICATOR_OFFSET) + "%";
            this.$currTime.text(this.convertSecondsToHHMMSS(videoCurrentTime, this.videoDuration > 3600 ));
        }.bind(this);

        this.clearTimeouts = function() {
            if (this.indicatorTimeout) {
                clearTimeout(this.indicatorTimeout);
                this.indicatorTimeout = 0;
            }
        };


	}

    exports.ControlsView = ControlsView;
}(window));

(function (exports) {
  "use strict";

 
  function RegistrationView() {

  	 Events.call(this, ['loadComplete', 'startScroll', 'stopScroll','indexChange', 'select', 'mouseover', 'click', 'exit', 'back']);

    this.currSelection = 0;
    this.elementsLength = null;

  	this.render =  function($el, data){

      var html = fireUtils.buildTemplate($("#landingPage"), data);

      $el.append(html); 

      this.elementsLength = $(".landingPageLower").children().length;

      $(".landingPageLower div:nth-child(1)").addClass("orangeBorder");

       this.trigger('loadComplete');

  	};

    this.goToBrowse =function(){

      $("#main_landing_container").hide();
      $("#menu-bar").show();      
      $(".largeBrowseContainer").show();

    }.bind(this);

    this.hideShow = function(){

      $("#main_landing_container").hide();
      $("#signinContainer").show();      

    }.bind(this);

    this.move = function (dir) {
      
      this.trigger("startScroll", dir);
      this.selectRowElement(dir);
    }.bind(this);

    this.selectRowElement = function (direction) {
      
      if ((direction > 0 && (this.elementsLength - 1) === this.currSelection) ||
          (direction < 0 && this.currSelection === 0 )) {
            return false;
          }

      $(".landingPageLower").children().eq(this.currSelection).removeClass("orangeBorder");

      this.currSelection += direction;

     $(".landingPageLower").children().eq(this.currSelection).addClass("orangeBorder");
    
    }.bind(this);    

   this.handleControls = function (e) {
      
      if (e.type === 'buttonpress') {
        switch (e.keyCode) {
        case buttons.CLICK:
        case buttons.SELECT:         
        case buttons.PLAY_PAUSE:
          this.trigger('select', this.currSelection);
          break;

        case buttons.BACK:
          this.trigger("back");
          break;

        case buttons.UP:         
        case buttons.DOWN:
         // this.trigger("bounce");
          break;

        case buttons.LEFT:
          if(this.currSelection !== 0) {
            this.move(-1);
          } 

          break;

        case buttons.RIGHT:
          if(this.currSelection <= 2) {
            this.move(1);
          } 
          break;
        }
      } else if (e.type === 'buttonrepeat') {
        switch (e.keyCode) {
        case buttons.LEFT:
          this.selectRowElement(-1);
          break;

        case buttons.RIGHT:
          this.selectRowElement(1);
          break;
        }
      } else if (e.type === 'buttonrelease') {
        switch (e.keyCode) {
        case buttons.LEFT:
        case buttons.RIGHT:
          this.trigger("stopScroll", this.currSelection);


          break;
        }
      }
    }.bind(this);

  	}

  exports.RegistrationView = RegistrationView;
}(window));
(function (exports) {
  "use strict";

 
  function SearchView() {

  	Events.call(this, ['up', 'back']);  

    this.currSelection = 0;
    this.$el = null;

     this.render = function ($el, data) {

       var html = fireUtils.buildTemplate($("#fli-search"), data);
       $el.append(html);
       this.$el = $(".keyboard");
       
    };

    this.hideaway = function(){

       $(".keyboard").hide();

    };

    this.handleControls = function (e) {
       // console.log("SI"+e.keyCode+ " "+e.type);

      if (e.type === 'buttonpress') 
      {
      	console.log(e.keyCode);
        switch (e.keyCode) {


        case buttons.SELECT:         
        case buttons.PLAY_PAUSE:
        
          break;

        case buttons.BACK:
          this.trigger("back");
          break;

        case buttons.UP: 
        	this.trigger('up');
        	break;        
        case buttons.DOWN:

          //this.trigger("switchingInput");
          
         break;
        
        case buttons.LEFT:
         
          break;

        case buttons.RIGHT:
          
          break;

        case buttons.TIZEN_KEYBOARD_DONE:
          
          //this.trigger("done");
          break;

        }
      } 
      else if (e.type === 'buttonrepeat') 
      {
        switch (e.keyCode) {
        case buttons.LEFT:
          //this.selectRowElement(-1);
          break;

        case buttons.RIGHT:
          //this.selectRowElement(1);
          break;
        }
      } 
      else if (e.type === 'buttonrelease') 
      {
        switch (e.keyCode) {
        case buttons.LEFT:
        case buttons.RIGHT:
          //this.trigger("stopScroll", this.currSelection);


          break;
        }
      }
    }.bind(this);


  }

  	exports.SearchView = SearchView;
}(window));
(function (exports) {
  "use strict";

 
  function DeviceLinkingView() {

  	Events.call(this, ['back']); 


      this.render = function($el){

      var html = fireUtils.buildTemplate($("#deviceLinking"), {});

      $el.append(html);

      };

  	 this.handleControls = function (e) {       

            if (e.type === 'buttonpress') 
            {
              switch (e.keyCode) {

              case buttons.SELECT:         
              case buttons.PLAY_PAUSE:
             
                if( $(".lowerButton").css('background-color') === 'rgb(255, 102, 0)'){
                  $("#signinContainer").show();
                  $(".deviceLinkingView").remove();
                  this.trigger('back');
                }
                
                break;

              case buttons.BACK:
                
                $("#signinContainer").show();
        		    $(".deviceLinkingView").remove();
        		    this.trigger('back');
               
                break;

              case buttons.UP:
                    $(".upperButton").css('background-color', '#ff6600');     
                    $(".lowerButton").css('background-color', 'rgba(0,0,0,0.4');

                break;        
              case buttons.DOWN:
                    $(".upperButton").css('background-color', 'rgba(0,0,0,0.4');     
                    $(".lowerButton").css('background-color', '#ff6600');
               break;
              
              case buttons.LEFT:
             
               
                break;

              case buttons.RIGHT:
             
                
                break;

              }
            }     

  	 }.bind(this);
  	}
  exports.DeviceLinkingView = DeviceLinkingView;
}(window));
(function (exports) {
  "use strict";

  function ContinueWatchingView() {

	Events.call(this, ['select', 'back']);

	this.currSelection = 0;
	this.elementsLength = null;

	this.render =  function($el, data){    

	var html = fireUtils.buildTemplate($("#continueWatchingContainer"), data);

      $el.append(html); 		  

       this.elementsLength = $("#continueWatchingButtons").children().length;
       
       $('#continue-watching-overlay').show();
     

  	};

	this.move = function (dir) {            
	    
	    this.selectRowElement(dir);
	  }.bind(this);

	this.selectRowElement = function (direction) {
	  
	  if ((direction > 0 && (this.elementsLength - 1) === this.currSelection) ||
	      (direction < 0 && this.currSelection === 0 )) {
	        return false;
	  
	      }
	     
	  $("div#continueWatchingButtons").children().eq(this.currSelection).css('background-color', '#000000');

	  this.currSelection += direction;

	  $("div#continueWatchingButtons").children().eq(this.currSelection).css('background-color', '#ff6600');

	}.bind(this); 


  	this.handleControls = function (e) {
          
          if (e.type === 'buttonpress') {
            switch (e.keyCode) {
            case buttons.CLICK:
            case buttons.SELECT:         
            case buttons.PLAY_PAUSE:
              this.trigger('select', this.currSelection);
              break;

            case buttons.BACK:
              this.trigger('back');
              break;
    

            case buttons.UP: 
            if(this.currSelection !== 0) {
                this.move(-1);
              } 

            	break;        
            case buttons.DOWN:
            
              if(this.currSelection === 0) {
                this.move(1);
              } 

              break;

            case buttons.LEFT:
            

              break;

            case buttons.RIGHT:
             
              
            }
          } 
          else if (e.type === 'buttonrepeat') 
          {
            switch (e.keyCode) {
            case buttons.LEFT:
              // this.selectRowElement(-1);
              break;

            case buttons.RIGHT:
              // this.selectRowElement(1);
              break;
            }
          } 
          else if (e.type === 'buttonrelease') 
          {
            switch (e.keyCode) {
            case buttons.LEFT:
            case buttons.RIGHT:
              //this.trigger("stopScroll", this.currSelection);


              break;
            }
          }
        }.bind(this);

  	}

 exports.ContinueWatchingView = ContinueWatchingView;
}(window));
(function (exports) {
    "use strict";

   
    function AutoplayView() {

    	 Events.call(this, ['select', 'back', 'transitionDown', 'Ypos']);

    	this.currSelection = 1;
      this.currY = 0;

    	this.render = function($container, data){

    		var html = fireUtils.buildTemplate($("#autoplay-template"), data);           

        $container.append(html);
        $(".autoplayRow span:nth-child("+this.currSelection+")").addClass("orangeBorder");       
        
    	};

    	this.expandVideo = function(){
			 $(".FRAMER_EXAMPLE").css({ 
            '-webkit-transform': 'scale(1.0)',
            '-webkit-transform-origin': '50% 50%'
          	});
    	};

    	this.move = function(dir){

    		if((dir > 0 && this.currSelection === 3) || (dir < 0 && this.currSelection === 1) ){
    			return;
    		}
    		$(".autoplayRow span:nth-child("+this.currSelection+")").removeClass("orangeBorder");

    		this.currSelection += dir;

    		$(".autoplayRow span:nth-child("+this.currSelection+")").addClass("orangeBorder");

    	};

      this.transitionDown = function(){
           
          this.currY -=575; 
             
          $(".innerAutoplayContainer").css('transform', 'translate3d( 0px,'+this.currY+'px,0px)');
          $(".nextVideoText").css('transform', 'translate3d( 0px,'+this.currY+'px,0px)');
          $(".currentVideoText").css('transform', 'translate3d( 0px,'+this.currY+'px,0px)');
          $(".framerMovieTitle").css('transform', 'translate3d( 0px,'+this.currY+'px,0px)');
          $("#framerParent").css('transform', 'translate3d( 0px,'+this.currY+'px,0px)'); 
          this.trigger("Ypos", this.currY);
        };

        this.transitionUp = function(){
           
          this.currY +=575; 
             
          $(".innerAutoplayContainer").css('transform', 'translate3d( 0px,'+this.currY+'px,0px)');
          $(".nextVideoText").css('transform', 'translate3d( 0px,'+this.currY+'px,0px)');
          $(".currentVideoText").css('transform', 'translate3d( 0px,'+this.currY+'px,0px)');
           $(".framerMovieTitle").css('transform', 'translate3d( 0px,'+this.currY+'px,0px)'); 
          $("#framerParent").css('transform', 'translate3d( 0px,'+this.currY+'px,0px)'); 
          //this.trigger("Ypos", this.currY);
        };

    	this.handleControls = function (e) {
          
          if (e.type === 'buttonpress') {
            switch (e.keyCode) {
            case buttons.CLICK:
            case buttons.SELECT:         
            case buttons.PLAY_PAUSE:

                this.trigger('select', this.currSelection); 
                         
              break;

            case buttons.BACK:
             this.trigger('back');
              
              break;

            

            case buttons.UP:

              break;         
            case buttons.DOWN:
           
             this.transitionDown();
             this.trigger('transitionDown');
              break;

            case buttons.LEFT:

                this.move(-1);             

              break;

            case buttons.RIGHT:            

            	this.move(1);
                
             
              break;
            }
          } 
          else if (e.type === 'buttonrepeat') 
          {
            switch (e.keyCode) {
            case buttons.LEFT:
             
              break;

            case buttons.RIGHT:
              
              break;
            }
          } 
          else if (e.type === 'buttonrelease') 
          {
            switch (e.keyCode) {
            case buttons.LEFT:
            case buttons.RIGHT:
              


              break;
            }
          }
        }.bind(this);

	}

    exports.AutoplayView = AutoplayView;
}(window));
(function(exports) {
  "use strict";

  function PlayerView() {

    Events.call(this, ['loadComplete', 'startScroll', 'select', 'exit', 'back', 'videoStatus', 'error', 'novideo']);

    this.knownPlayerErrorTriggered = false;
    this.PLAYER_TIMEOUT = 60000;
    this.PLAYER_SLOW_RESPONSE = 30000;
    this.isSkipping = false;
    this.paused = false;
    this.SKIP_LENGTH_DEFAULT = 5;
    this.skipLength = /*settings.skipLength ||*/ this.SKIP_LENGTH_DEFAULT;
    this.videoLayer = null;
    this.BUTTON_INTERVALS = [100, 200, 300, 400, 500];
    var ccClicked = 0;
    this.ccChoice = "OFF";
    var timer = 1;
    var timeTimer = 80;
    var value;
    var jjj;
    this.fastfor = 0;
    this.rw = 0;
    this.fakeDisplayTime = 1;
    this.slideUp = 0;
    this.upTimeout = null;



    this.render = function($el, data) {

      $("#app-header-bar").hide();
      $(".overlayFade").hide();

      var html = fireUtils.buildTemplate($("#fli-player-view"));

      $el.append(html);

      if (data.hls !== null) {
        $(".player-main-container").attr('src', data.hls.self);
      } else if (data.video1080 !== null) {
        $(".player-main-container").attr('src', data.video1080.self);
      } else if (data.video720 !== null) {
        $(".player-main-container").attr('src', data.video720.self);
      } else if (data.videolow !== null) {
        $(".player-main-container").attr('src', data.videolow.self);
      }
      else{
        console.log("NO VIDEO");
        this.trigger('novideo');
        return;
      }

      this.videoElement = document.getElementsByClassName("player-main-container")[0];

      this.$el = $(".player-main-container").parent();

      // add event listeners
      this.videoElement.addEventListener("canplay", this.canPlayHandler);
      this.videoElement.addEventListener("ended", this.videoEndedHandler);
      this.videoElement.addEventListener("timeupdate", this.timeUpdateHandler);
      this.videoElement.addEventListener("pause", this.pauseEventHandler);
      this.videoElement.addEventListener("error", this.errorHandler);

      this.controlsView = new ControlsView();
      this.controlsView.render($(".FRAMER_EXAMPLE"), this);
      $(".FRAMER_EXAMPLE").append('<div class="scrubberThumbnail"><img class="scrubberImg" src="http://lorempixel.com/375/210" /><div class="scrubberSpeedOverlay">x2</div></div>');

    };

    this.turnOnEvents = function() {

      this.videoElement = document.getElementsByClassName("player-main-container")[0];
      this.videoElement.addEventListener("canplay", this.canPlayHandler);
      this.videoElement.addEventListener("ended", this.videoEndedHandler);
      this.videoElement.addEventListener("timeupdate", this.timeUpdateHandler);
      this.videoElement.addEventListener("pause", this.pauseEventHandler);
      this.videoElement.addEventListener("error", this.errorHandler);

    };

    this.turnOffEvents = function() {

      this.videoElement.removeEventListener("canplay", this.canPlayHandler);
      this.videoElement.removeEventListener("ended", this.videoEndedHandler);
      this.videoElement.removeEventListener("timeupdate", this.timeUpdateHandler);
      this.videoElement.removeEventListener("pause", this.pauseEventHandler);
      this.videoElement.removeEventListener("error", this.errorHandler);

    };

    this.errorHandler = function(e) {
      // this.clearTimeouts();
      // if (this.knownPlayerErrorTriggered) {
      //     return;
      // }
      // var errType;
      // if (e.target.error && e.target.error.code) {
      //     switch (e.target.error.code) {
      //         //A network error of some description caused the user agent to stop fetching the media resource, after the resource was established to be usable.
      //         case e.target.error.MEDIA_ERR_NETWORK:
      //             errType = ErrorTypes.NETWORK_ERROR;
      //             this.knownPlayerErrorTriggered = true;
      //             break;
      //         //An error of some description occurred while decoding the media resource, after the resource was established to be usable.
      //         case e.target.error.MEDIA_ERR_DECODE:
      //             errType = ErrorTypes.CONTENT_DECODE_ERROR;
      //             this.knownPlayerErrorTriggered = true;
      //             break;
      //         //The media resource indicated by the src attribute was not suitable.
      //         case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
      //             errType = ErrorTypes.CONTENT_SRC_ERROR;
      //             this.knownPlayerErrorTriggered = true;
      //             break;
      //         default:
      //             errType = ErrorTypes.UNKNOWN_ERROR;
      //             break;
      //     }
      // } else {
      //     // no error code, default to unknown type
      //     errType = ErrorTypes.UNKNOWN_ERROR;
      // }
      // this.trigger('error', errType, errorHandler.genStack(), arguments);
    }.bind(this);

    this.pauseEventHandler = function() {

      this.clearTimeouts();
      this.trigger('videoStatus', this.videoElement.currentTime, this.videoElement.duration, 'paused');
      var ddd = $(".progressDot").offset();
      this.scrubberCenter = ddd.left - 187.5;
      $(".scrubberThumbnail").css('-webkit-transform', 'translate3d(' + this.scrubberCenter + 'px, 0px, 0px');

    }.bind(this);

    this.videoEndedHandler = function() {
      this.clearTimeouts();
      this.trigger('videoStatus', this.videoElement.currentTime, this.videoElement.duration, 'ended');
      this.trigger('back');
    }.bind(this);

    this.timeUpdateHandler = function() {
      this.clearTimeouts();
      if (!this.videoElement.paused) {
        this.playerTimeout = setTimeout(function() {
          if (!this.knownPlayerErrorTriggered) {
            this.trigger('error', ErrorTypes.TIMEOUT_ERROR, errorHandler.genStack());
            this.knownPlayerErrorTriggered = true;
          }
        }.bind(this), this.PLAYER_TIMEOUT);

        this.playerSlowResponse = setTimeout(function() {
          this.trigger('error', ErrorTypes.SLOW_RESPONSE, errorHandler.genStack());
        }.bind(this), this.PLAYER_SLOW_RESPONSE);
      }
      // Don't update when skipping
      if (!this.isSkipping) {
        this.buttonDowntime = this.videoElement.currentTime;
        this.trigger('videoStatus', this.videoElement.currentTime, this.videoElement.duration, 'playing');
        this.ffTime = this.videoElement.currentTime;

      }
    }.bind(this);

    this.canPlayHandler = function() {
      this.canplay = true;
      //prevent triggering 'canplay' event when skipping or when video is paused
      if (!this.paused && !this.isSkipping) {
        this.buttonDowntime = this.videoElement.currentTime;
        this.trigger('videoStatus', this.videoElement.currentTime, this.videoElement.duration, 'canplay');
        var slideDown = function() {
          $(".roundedEdgeControlContainer").css('-webkit-transform', 'translate3d(0px, 200px, 0px');
        };
        setTimeout(slideDown, 6000);
      }
    }.bind(this);

    this.remove = function() {
      $(".fliVideo").remove();
    }.bind(this);

    this.reShow = function() {
      $(".fliVideo").show();
      $('.roundedEdgeControlContainer').show();

    }.bind(this);

    this.playVideo = function() {

      this.videoElement.play();
      this.paused = false;
      buttons.setButtonIntervals(this.BUTTON_INTERVALS);
      this.trigger('videoStatus', this.videoElement.currentTime, this.videoElement.duration, 'playing');
    }.bind(this);

    this.clearTimeouts = function() {
      if (this.playerTimeout) {
        clearTimeout(this.playerTimeout);
        this.playerTimeout = 0;
      }
      if (this.playerSlowResponse) {
        clearTimeout(this.playerSlowResponse);
        this.playerSlowResponse = 0;
      }
    };

    this.pauseVideo = function() {
      // this no longer directly sends a video status event, as the pause can come from Fire OS and not just
      // user input, so this strictly calls the video element pause
      if (!this.isSkipping) {
        this.videoElement.pause();
        this.paused = true;
      }
    };

    /**
     * Resume the currently playing video
     */
    this.resumeVideo = function() {
      $(".scrubberThumbnail").css('opacity', '0');
      this.videoElement.play();
      this.paused = false;
      this.trigger('videoStatus', this.videoElement.currentTime, this.videoElement.duration, 'resumed');
    };

    this.seekVideo = function(position) {
      this.controlsView.continuousSeek = false;
      this.trigger('videoStatus', this.videoElement.currentTime, this.videoElement.duration, 'playing');
      this.videoElement.currentTime = position;
      this.trigger('videoStatus', this.videoElement.currentTime, this.videoElement.duration, 'seeking');
    };

    this.fliSeek = function(time) {

      app.playerView.ffTime += time;

      if ((app.playerView.ffTime % 6) <= 1) {
        $(".scrubberImg").attr("src", " ");
        $(".scrubberImg").attr("src", "http://lorempixel.com/375/210");

      }

      value = (600 / app.playerView.videoElement.duration) * app.playerView.ffTime;

      app.playerView.controlsView.seekHead.style.marginLeft = value + "px";
      app.playerView.controlsView.progressContainer.style.width = value + "px";
      app.playerView.controlsView.$currTime.text(app.playerView.controlsView.convertSecondsToHHMMSS(app.playerView.ffTime, app.playerView.videoElement.duration > 3600));

      if ((this.controlsView.currSelection === 0 && value <= 5) || (this.controlsView.currSelection === 2 && value >= 595)) {

        clearInterval(jjj);
        timer = 1;
        app.playerView.videoElement.currentTime = app.playerView.ffTime;
        app.playerView.resumeVideo();
        $(".controlBox").children().css('background-color', '');
        $("div.play").removeClass("play").addClass("pause");
        $('div.pause').css('background-color', '#ff6600');
        app.playerView.controlsView.currSelection = 1;
      }

      var ddd = $(".progressDot").offset();
      this.scrubberCenter = ddd.left - 187.5;
      $(".scrubberThumbnail").css('-webkit-transform', 'translate3d(' + this.scrubberCenter + 'px, 0px, 0px');
    };


    this.handleControls = function(e) {

      if (e.type === 'buttonpress') {

        var slideDownFunc = function() {
          $(".roundedEdgeControlContainer").css('-webkit-transform', 'translate3d(0px, 200px, 0px');
          if (($(".ccOptions").css('opacity')) === '1') {
            $(".closedCaption").css('background-color', '#ff6600');
            $(".ccOptions").css('opacity', '0');
            ccClicked = 0;
          }
        };

        if (this.upTimeout !== null) {
          clearTimeout(this.upTimeout);
        }
        this.upTimeout = setTimeout(slideDownFunc, 6000);

        $(".roundedEdgeControlContainer").css('-webkit-transform', 'translate3d(0px, 0px, 0px');


        switch (e.keyCode) {
          case buttons.CLICK:
          case buttons.SELECT:

            switch (this.controlsView.currSelection) {

              case 0:
                clearTimeout(this.upTimeout);
                this.rw = 1;

                $(".scrubberThumbnail").css('opacity', '0.99');
                //$(".scrubberImg").attr("src", " ");
                //$(".scrubberImg").attr("src", "http://lorempixel.com/375/210");

                if (this.fastfor === 1) {

                  if (jjj !== undefined) {

                    clearInterval(jjj);
                    timeTimer = 80;
                    this.fakeDisplayTime = 1;
                    this.videoElement.currentTime = this.ffTime;

                  }

                  jjj = undefined;
                  $(".scrubberThumbnail").css('opacity', '0.0');
                  this.fastfor = 0;
                  $("div.pause").removeClass("pause").addClass("play");

                  return;
                }

                if (!this.paused) {

                  this.fastfor = 0;
                  $("div.pause").removeClass("pause").addClass("play");

                  this.pauseVideo();
                  this.ffTime = this.videoElement.currentTime;
                }

                timeTimer += 40;
                //timer = timeTimer/(this.videoElement.duration/1000);
                timer = timeTimer / 500;
                this.fakeDisplayTime *= 2;
                $(".scrubberSpeedOverlay").text('x' + this.fakeDisplayTime);

                if (jjj !== undefined) {
                  clearInterval(jjj);
                }

                jjj = setInterval(function() {
                  app.playerView.fliSeek(-timer);
                }, 1000 / Math.abs(timeTimer));

                if (this.fakeDisplayTime >= 256) {

                  clearInterval(jjj);
                  timeTimer = 80;
                  timer = timeTimer / 1000;
                  this.fakeDisplayTime = 2;
                  jjj = setInterval(function() {
                    app.playerView.fliSeek(-timer);
                  }, 1000 / Math.abs(timeTimer));
                  $(".scrubberSpeedOverlay").text('x' + this.fakeDisplayTime);

                }

                break;


              case 1:

                this.fastfor = 0;
                this.rw = 0;
                if ($("div.pause").hasClass('pause')) {

                  $("div.pause").removeClass("pause").addClass("play");
                  $('div.play').css('background-color', '#ff6600');
                } else {
                  $("div.play").removeClass("play").addClass("pause");
                  $('div.pause').css('background-color', '#ff6600');
                }

                if (this.videoElement.paused) {
                  if (jjj !== undefined) {
                    clearInterval(jjj);
                    timeTimer = 80;
                    this.fakeDisplayTime = 1;
                    this.videoElement.currentTime = this.ffTime;
                  }
                  jjj = undefined;
                  this.resumeVideo();
                } else {

                  this.pauseVideo();
                  this.videoElement.currentTime = this.ffTime;
                }

                break;


              case 2:
                clearTimeout(this.upTimeout);
                this.fastfor = 1;

                $(".scrubberThumbnail").css('opacity', '0.99');
                //$(".scrubberImg").attr("src", " ");
                //$(".scrubberImg").attr("src", "http://lorempixel.com/375/210");

                if (this.rw === 1) {

                  if (jjj !== undefined) {

                    clearInterval(jjj);
                    timeTimer = 80;
                    this.fakeDisplayTime = 1;
                    this.videoElement.currentTime = this.ffTime;

                  }

                  jjj = undefined;
                  $(".scrubberThumbnail").css('opacity', '0.0');
                  this.rw = 0;
                  $("div.pause").removeClass("pause").addClass("play");

                  return;
                }

                if (!this.paused) {

                  $("div.pause").removeClass("pause").addClass("play");

                  this.pauseVideo();

                  this.ffTime = this.videoElement.currentTime;
                }

                timeTimer += 40;
                //timer = timeTimer/(this.videoElement.duration/1000);
                timer = timeTimer / 500;
                this.fakeDisplayTime *= 2;
                $(".scrubberSpeedOverlay").text('x' + this.fakeDisplayTime);

                if (jjj !== undefined) {
                  clearInterval(jjj);
                }

                jjj = setInterval(function() {
                  app.playerView.fliSeek(timer);
                }, 1000 / timeTimer);

                if (this.fakeDisplayTime >= 256) {

                  clearInterval(jjj);
                  timeTimer = 80;
                  timer = timeTimer / 1000;
                  this.fakeDisplayTime = 2;
                  jjj = setInterval(function() {
                    app.playerView.fliSeek(timer);
                  }, 1000 / timeTimer);
                  $(".scrubberSpeedOverlay").text('x' + this.fakeDisplayTime);

                }

                break;

              case 3:
                if (!ccClicked) {
                  $(".closedCaption").css('background-color', '');
                  $(".ccOptions").css('opacity', '1');
                  ccClicked = 1;
                } else {

                  if (($(".ccTop").css('background-color')) === 'rgb(255, 102, 0)') {
                    this.ccChoice = "ON";
                  } else {
                    this.ccChoice = "OFF";
                  }

                  $(".closedCaption").css('background-color', '#ff6600');
                  $(".ccOptions").css('opacity', '0');
                  ccClicked = 0;

                }

                break;


            }

            break;

          case buttons.REWIND:

            $(".controlBox").children().eq(this.controlsView.currSelection).css('background-color', '');
            this.controlsView.currSelection = 0;
            $(".controlBox").children().eq(this.controlsView.currSelection).css('background-color', '#ff6600');

            clearTimeout(this.upTimeout);
            this.rw = 1;

            $(".scrubberThumbnail").css('opacity', '0.99');
            //$(".scrubberImg").attr("src", " ");
            //$(".scrubberImg").attr("src", "http://lorempixel.com/375/210");

            if (this.fastfor === 1) {

              if (jjj !== undefined) {

                clearInterval(jjj);
                timeTimer = 80;
                this.fakeDisplayTime = 1;
                this.videoElement.currentTime = this.ffTime;

              }

              jjj = undefined;
              $(".scrubberThumbnail").css('opacity', '0.0');
              this.fastfor = 0;
              $("div.pause").removeClass("pause").addClass("play");

              return;
            }

            if (!this.paused) {

              this.fastfor = 0;
              $("div.pause").removeClass("pause").addClass("play");

              this.pauseVideo();
              this.ffTime = this.videoElement.currentTime;
            }

            timeTimer += 40;
            timer = timeTimer / 500;
            this.fakeDisplayTime *= 2;
            $(".scrubberSpeedOverlay").text('x' + this.fakeDisplayTime);

            if (jjj !== undefined) {
              clearInterval(jjj);
            }

            jjj = setInterval(function() {
              app.playerView.fliSeek(-timer);
            }, 1000 / Math.abs(timeTimer));

            if (this.fakeDisplayTime >= 256) {

              clearInterval(jjj);
              timeTimer = 80;
              timer = timeTimer / 1000;
              this.fakeDisplayTime = 2;
              jjj = setInterval(function() {
                app.playerView.fliSeek(-timer);
              }, 1000 / Math.abs(timeTimer));
              $(".scrubberSpeedOverlay").text('x' + this.fakeDisplayTime);

            }

            break;

          case buttons.PLAY_PAUSE:

            $(".controlBox").children().eq(this.controlsView.currSelection).css('background-color', '');
            this.controlsView.currSelection = 1;
            $(".controlBox").children().eq(this.controlsView.currSelection).css('background-color', '#ff6600');

            this.fastfor = 0;
            this.rw = 0;
            if ($("div.pause").hasClass('pause')) {

              $("div.pause").removeClass("pause").addClass("play");
              $('div.play').css('background-color', '#ff6600');
            } else {
              $("div.play").removeClass("play").addClass("pause");
              $('div.pause').css('background-color', '#ff6600');
            }

            if (this.videoElement.paused) {
              if (jjj !== undefined) {
                clearInterval(jjj);
                timeTimer = 80;
                this.fakeDisplayTime = 1;
                this.videoElement.currentTime = this.ffTime;
              }
              jjj = undefined;
              this.resumeVideo();
            } else {

              this.pauseVideo();
              this.videoElement.currentTime = this.ffTime;
            }

            break;

          case buttons.FAST_FORWARD:

            $(".controlBox").children().eq(this.controlsView.currSelection).css('background-color', '');
            this.controlsView.currSelection = 2;
            $(".controlBox").children().eq(this.controlsView.currSelection).css('background-color', '#ff6600');

            clearTimeout(this.upTimeout);
            this.fastfor = 1;

            $(".scrubberThumbnail").css('opacity', '0.99');
            //$(".scrubberImg").attr("src", " ");
            //$(".scrubberImg").attr("src", "http://lorempixel.com/375/210");

            if (this.rw === 1) {

              if (jjj !== undefined) {

                clearInterval(jjj);
                timeTimer = 80;
                this.fakeDisplayTime = 1;
                this.videoElement.currentTime = this.ffTime;

              }

              jjj = undefined;
              $(".scrubberThumbnail").css('opacity', '0.0');
              this.rw = 0;
              $("div.pause").removeClass("pause").addClass("play");

              return;
            }

            if (!this.paused) {

              $("div.pause").removeClass("pause").addClass("play");

              this.pauseVideo();

              this.ffTime = this.videoElement.currentTime;
            }

            timeTimer += 40;
            timer = timeTimer / 500;
            this.fakeDisplayTime *= 2;
            $(".scrubberSpeedOverlay").text('x' + this.fakeDisplayTime);

            if (jjj !== undefined) {
              clearInterval(jjj);
            }

            jjj = setInterval(function() {
              app.playerView.fliSeek(timer);
            }, 1000 / timeTimer);

            if (this.fakeDisplayTime >= 256) {

              clearInterval(jjj);
              timeTimer = 80;
              timer = timeTimer / 1000;
              this.fakeDisplayTime = 2;
              jjj = setInterval(function() {
                app.playerView.fliSeek(timer);
              }, 1000 / timeTimer);
              $(".scrubberSpeedOverlay").text('x' + this.fakeDisplayTime);

            }

            break;

          case buttons.BACK:

            this.trigger("back");
            break;

          case buttons.UP:
            // this.trigger("bounce");
            if (($(".ccOptions").css('opacity')) === '1') {
              $(".ccBottom").css('background-color', '#000000');
              $(".ccDot").css('top', '-65px');
              $(".ccTop").css('background-color', '#ff6600');

            }

            break;
          case buttons.DOWN:
            if (($(".ccOptions").css('opacity')) === '1') {
              $(".ccBottom").css('background-color', '#ff6600');
              $(".ccDot").css('top', '-25px');
              $(".ccTop").css('background-color', '#000000');
            }

            break;

          case buttons.LEFT:
            $(".ccOptions").css('opacity', '0');
            ccClicked = 0;
            this.controlsView.move(-1);


            break;

          case buttons.RIGHT:

            this.controlsView.move(1);

            break;

        }
      } else if (e.type === 'buttonrepeat') {
        switch (e.keyCode) {
          case buttons.LEFT:
            // this.selectRowElement(-1);
            break;

          case buttons.RIGHT:
            // this.selectRowElement(1);
            break;
        }
      } else if (e.type === 'buttonrelease') {
        switch (e.keyCode) {
          case buttons.LEFT:
          case buttons.RIGHT:
            //this.trigger("stopScroll", this.currSelection);


            break;
        }
      }
    }.bind(this);

  }

  exports.PlayerView = PlayerView;
}(window));

(function (exports) {
  "use strict";

 
  function SignInView() {
    
    var focused = "emailInput";

    Events.call(this, ['select', 'switchingInput', 'back', 'pwSubmit', 'devicelinking']);  

    this.currSelection = 0;
     var tt, EI;
     this.view = "input";

     this.render = function ($el) {
       var html = fireUtils.buildTemplate($("#signInView"), {});

       $el.append(html);
       
       $(".emailInput").addClass("orangeBorder"); 
      

      var emailInput = document.getElementsByClassName("emailInput");
              emailInput[0].addEventListener("change", function(e){             
              console.log("email change");
              $(".emailInput").blur();
              $(".emailInput").removeClass("orangeBorder");
              $(".passwordInput").addClass("orangeBorder");
          });

          var pwInput = document.getElementsByClassName("passwordInput");
          pwInput[0].addEventListener("change", function(e){
              if(emailInput[0].value !== null){
                 //app.signinView.trigger("pwSubmit");
                 return;
              }
             
          });
       
    };

    this.selectInput = function(){

      if($(".signupButton").hasClass("orangeBorder")){
        $("#signinContainer").hide();
        //$(".deviceLinkingImg").show();
        this.trigger('devicelinking');
        return;
      }


      if($(".cancelButton").hasClass("orangeBorder")){
          this.trigger("back");
          return;

        }

      if ($(".emailInput").hasClass("orangeBorder")){          
          $(".emailInput").focus();
          
          buttons.resync();
          return;
        }
        if ($(".passwordInput").hasClass("orangeBorder")){
           if ($(".emailInput").is(":focus")){
            console.log("EMAILFOCUS");
           }
           //$(".emailInput:focus").blur();
          $(".passwordInput").focus(); 
           buttons.resync();
          return;

        } 
        

    };

    this.hideaway = function(){
      $("#signinContainer").hide();
    };
    

    this.checkIfRegister = function(){

      if($(".signUpButton").hasClass("signUpButtonBorder")){
       // console.log("true");
        return true;
      }
      else{
        //console.log("false");
        return false;
      }

    };
    

    this.handleControls = function (e) { 

      if(this.view === "input"){

            if (e.type === 'buttonpress') 
            {
              switch (e.keyCode) {

              case buttons.SELECT:         
              case buttons.PLAY_PAUSE:

                this.trigger("select");                
                
                break;

              case buttons.BACK:
                this.trigger("back");
                console.log("BACK");
                break;

              case buttons.UP:
                if ($(".passwordInput").hasClass("orangeBorder")){
                  $(".passwordInput").blur();
                   $(".passwordInput").removeClass("orangeBorder");
                   $(".emailInput").addClass("orangeBorder");
                  
                 }      

                break;        
              case buttons.DOWN:
               if ($(".emailInput").hasClass("orangeBorder")){
                $(".emailInput").blur();
                $(".emailInput").removeClass("orangeBorder");
                $(".passwordInput").addClass("orangeBorder");
                return;
              }
              if ($(".passwordInput").hasClass("orangeBorder")){
                 $(".passwordInput").blur();
                 $(".passwordInput").removeClass("orangeBorder");
                 $(".signupButton").addClass("orangeBorder");
                 this.view = "buttons";
               }                
                
               break;
              
              case buttons.LEFT:
             
               
                break;

              case buttons.RIGHT:
             
                
                break;

              }
            } 
            
      }
      else if (this.view === "buttons"){

          if (e.type === 'buttonpress') 
            {
              switch (e.keyCode) {

              case buttons.SELECT:         
              case buttons.PLAY_PAUSE:
                this.trigger("select");
                
                break;

              case buttons.BACK:
                this.trigger("back");
                break;

              case buttons.UP: 
                $(".passwordInput").addClass("orangeBorder");
                $(".signInButtons").children().removeClass("orangeBorder");
                this.view= "input";
                break;        
              case buttons.DOWN:              
                
               break;
              
              case buttons.LEFT:
                if ($(".signupButton").hasClass("orangeBorder")){
                  $(".cancelButton").addClass("orangeBorder");
                   $(".signupButton").removeClass("orangeBorder");
                }
                else{
                  $(".signupButton").addClass("orangeBorder");
                  $(".cancelButton").removeClass("orangeBorder");
                }
               
                break;

              case buttons.RIGHT:
                if ($(".signupButton").hasClass("orangeBorder")){
                $(".cancelButton").addClass("orangeBorder");
                 $(".signupButton").removeClass("orangeBorder");
                }
                else{
                  $(".signupButton").addClass("orangeBorder");
                  $(".cancelButton").removeClass("orangeBorder");
                }
                
                break;            

              }
            } 

      }
    }.bind(this);

  }

  exports.SignInView = SignInView;
}(window));
(function(exports) {
  "use strict";

  function SpringboardPageView() {


    Events.call(this, ['loadComplete', 'startScroll', 'select', 'UP', 'back', 'transitionDown', 'stars', 'Ypos', 'delete']);
    this.currSelection = 0;
    this.elementsLength = null;
    var incrementer = 2;
    this.currY = 0;
    this.transformStyle = fireUtils.vendorPrefix('Transform');
    this.lastView = null;
    this.noItems = false;

    this.render = function($el, data) {

      this.data = data;

      var html = fireUtils.buildTemplate($("#springboard-template"), data);

      $el.append(html);

      this.elementsLength = $(".springboardRow").children().length;

      $(".springboardRow span:nth-child(1)").addClass("focusBorder");

      $(".director").text(data.authors[0].label + " " + "|");

      $(".ratingEtc").after(data.description);

      var image = new Image();

      image.onload = function() {
        $('.springboardBackground').css({

          'background': ' #000000 url("' +image.src + '") no-repeat left top'

        });
        $('.springboardBackground').fadeIn(200, "swing", function() {

        });

      };
      if (data.image !== null){
        image.src = data.image.self;
      }
      else{
        image.src = "assets/BT_placeholder.png";
      }


      $(".springboardBgOpacity").show();

      this.trigger('loadComplete');

      this.$children = $('.springboardContainer').children();

    };

    this.highLight = function() {
      $("div.springboardRow").children().eq(this.currSelection).addClass("focusBorder");
    };

    this.unHighLight = function() {
      $("div.springboardRow").children().eq(this.currSelection).removeClass("focusBorder");
    };

    this.move = function(dir) {

      this.trigger("startScroll", dir);
      this.selectRowElement(dir);
    }.bind(this);

    this.selectRowElement = function(direction) {

      if ((direction > 0 && (this.elementsLength - 1) === this.currSelection) ||
        (direction < 0 && this.currSelection === 0)) {
        return false;
      }

      $("div.springboardRow").children().eq(this.currSelection).removeClass("focusBorder");

      this.currSelection += direction;

      $("div.springboardRow").children().eq(this.currSelection).addClass("focusBorder");

    }.bind(this);

    this.changeWatchListText = function() {
      var qqq;
      var ttt;
      if ($(".springboardRow span:nth-child(3)").hasClass('orangeBorder')) {
        var kkk = $(".springboardRow span:nth-child(3)").children();
        if ($(kkk[1]).text() === "Remove From Watchlist") {
          $(kkk[1]).text("Add to Watchlist");
          if (app.gridWrapView !== undefined) {
            qqq = $(".moveableGridInternalContainer div:nth-child(" + (app.gridWrapView.currSelection + 1) + ")");
            ttt = $(".moveableGridInternalContainer").children();
            ttt = $(ttt[app.gridWrapView.currSelection]).children(".thumbnailVideoTitle").text();
            qqq.children('div').children('img').addClass("removedFromWatchlist");
            $(qqq.children(".innerThumbnailContainer")).append("<div class='inside'>Removed From Watchlist</div>");

            this.trigger('delete', (app.gridWrapView.currSelection), ttt);
          }
        } else {
          $(kkk[1]).text("Remove From Watchlist");
          if (app.gridWrapView !== undefined) {
            qqq.children('div').children('img').removeClass("removedFromWatchlist");
            $(qqq.children(".innerThumbnailContainer")).remove("<div class='inside'>Removed From Watchlist</div>");
          }
        }
      }
    };

    this.incrementStars = function() {

      if ($(".springboardRow span:nth-child(4)").hasClass('orangeBorder')) {
        if (incrementer < 5) {
          incrementer++;
        } else {
          incrementer = 0;
        }
        var icon = $(".springboardRow span:nth-child(4)").children('img');
        $(icon).attr('src', 'assets/stars_' + incrementer + '_fhd.png');
      }
    };

    this.transitionDown = function() {

      this.currY -= 545;
      this.$children[0].style[this.transformStyle] = "translate3d( 0px," + this.currY + "px,0px)";
      this.trigger("Ypos", this.currY);
    };
    this.transitionUp = function() {

      this.currY += 545;
      this.$children[0].style[this.transformStyle] = "translate3d( 0px," + this.currY + "px,0px)";

    };


    this.handleControls = function(e) {

      if (e.type === 'buttonpress') {
        switch (e.keyCode) {
          case buttons.CLICK:
          case buttons.SELECT:
          case buttons.PLAY_PAUSE:

            //this.incrementStars();
            //this.changeWatchListText();

            this.trigger('select', this.currSelection, this.data);

            break;

          case buttons.BACK:
            // $(".largeBrowseContainer").();
            //   $("#menu-bar").hide();
            $('.springboardBackground').hide();
            $(".springboardBgOpacity").hide();
            this.trigger("back");
            break;


          case buttons.UP:

            this.trigger("UP");

            break;
          case buttons.DOWN:
            //$("div.springboardRow").children().eq(this.currSelection).removeClass("focusBorder");

            //this.trigger('transitionDown');
            break;

          case buttons.LEFT:

            if (this.currSelection !== 0) {
              this.move(-1);
            }

            break;

          case buttons.RIGHT:


            if (this.currSelection <= 3) {
              this.move(1);
            }

            break;
        }
      } else if (e.type === 'buttonrepeat') {
        switch (e.keyCode) {
          case buttons.LEFT:
            // this.selectRowElement(-1);
            break;

          case buttons.RIGHT:
            // this.selectRowElement(1);
            break;
        }
      } else if (e.type === 'buttonrelease') {
        switch (e.keyCode) {
          case buttons.LEFT:
          case buttons.RIGHT:
            //this.trigger("stopScroll", this.currSelection);


            break;
        }
      }
    }.bind(this);

  }

  exports.SpringboardPageView = SpringboardPageView;
}(window));

(function (exports) {
  "use strict";

  function SeriesSpringboardPageView() {


        Events.call(this, ['loadComplete', 'startScroll', 'select', 'back', 'transitionDown', 'stars', 'Ypos', 'delete']);
        this.currSelection = 0;
        this.elementsLength = null;
        var incrementer = 2;
        this.currY = 0;
        this.transformStyle = fireUtils.vendorPrefix('Transform');
        this.lastView = null;

        this.render =  function($el, data){              

              var html = fireUtils.buildTemplate($("#springboard-template"), data);

              $el.append(html);               

              this.elementsLength = $(".springboardRow").children().length;

              $(".springboardRow span:nth-child(1)").addClass("orangeBorder");
              
              this.trigger('loadComplete');

              this.$children = $('.springboardContainer').children();

         };


        this.move = function (dir) {
            
            this.trigger("startScroll", dir);
            this.selectRowElement(dir);
          }.bind(this);

         this.selectRowElement = function (direction) {
          
          if ((direction > 0 && (this.elementsLength - 1) === this.currSelection) ||
              (direction < 0 && this.currSelection === 0 )) {
                return false;
              }

          $("div.springboardRow").children().eq(this.currSelection).removeClass("orangeBorder");

          this.currSelection += direction;

         $("div.springboardRow").children().eq(this.currSelection).addClass("orangeBorder");
        
        }.bind(this);

        this.changeWatchListText = function(){
          var qqq;
          var ttt;
          if( $(".springboardRow span:nth-child(2)").hasClass('orangeBorder')){ 
            var kkk = $(".springboardRow span:nth-child(2)").children();             
              if($(kkk[1]).text() === "Remove From Watchlist"){
                $(kkk[1]).text("Add to Watchlist");
                 if (app.gridWrapView !== undefined){               
                 qqq = $(".moveableGridInternalContainer div:nth-child("+(app.gridWrapView.currSelection+1)+")");
                 ttt = $(".moveableGridInternalContainer").children();
                 ttt = $(ttt[app.gridWrapView.currSelection]).children(".thumbnailVideoTitle").text();                
                 qqq.children('div').children('img').addClass("removedFromWatchlist");
                $(qqq.children(".innerThumbnailContainer")).append("<div class='inside'>Removed From Watchlist</div>");
                //console.log(app.gridWrapView.currSelection+1);
                this.trigger('delete',(app.gridWrapView.currSelection), ttt);
                }
              } 
              else{
                $(kkk[1]).text("Remove From Watchlist");
                if (app.gridWrapView !== undefined){ 
                qqq.children('div').children('img').removeClass("removedFromWatchlist");
                $(qqq.children(".innerThumbnailContainer")).remove("<div class='inside'>Removed From Watchlist</div>");
                }
              } 
            }
        }; 

        this.incrementStars = function(){

          if( $(".springboardRow span:nth-child(3)").hasClass('orangeBorder')){              
                if (incrementer < 5){
                  incrementer++;
                }
                else{
                  incrementer = 0;
                }                
                var icon = $(".springboardRow span:nth-child(3)").children('img');                
                $(icon).attr('src', 'assets/stars_'+incrementer+'_fhd.png');
            }
        }; 

        this.transitionDown = function(){
          
          this.currY -=545;    
          this.$children[0].style[this.transformStyle] = "translate3d( 0px,"+this.currY+"px,0px)";
          this.trigger("Ypos", this.currY);
        };
         this.transitionUp = function(){
          
          this.currY +=545;    
          this.$children[0].style[this.transformStyle] = "translate3d( 0px,"+this.currY+"px,0px)";
          
        };


         this.handleControls = function (e) {
          
          if (e.type === 'buttonpress') {
            switch (e.keyCode) {
            case buttons.CLICK:
            case buttons.SELECT:         
            case buttons.PLAY_PAUSE: 

              console.log("YEP");            

              this.incrementStars();
              this.changeWatchListText();             

              this.trigger('select', this.currSelection);

              break;

            case buttons.BACK:
              this.trigger("back");
              break;
           

            case buttons.UP: 

              break;        
            case buttons.DOWN:
           
             this.trigger('transitionDown');
              break;

            case buttons.LEFT:

              if(this.currSelection !== 0) {
                this.move(-1);
              } 

              break;

            case buttons.RIGHT:

             
              if(this.currSelection <= 3) {
                this.move(1);
              } 

              break;
            }
          } 
          else if (e.type === 'buttonrepeat') 
          {
            switch (e.keyCode) {
            case buttons.LEFT:
              // this.selectRowElement(-1);
              break;

            case buttons.RIGHT:
              // this.selectRowElement(1);
              break;
            }
          } 
          else if (e.type === 'buttonrelease') 
          {
            switch (e.keyCode) {
            case buttons.LEFT:
            case buttons.RIGHT:
              //this.trigger("stopScroll", this.currSelection);


              break;
            }
          }
        }.bind(this);

  	}

  exports.SeriesSpringboardPageView = SeriesSpringboardPageView;
}(window));
(function (exports) {
  "use strict";

  
  function LandingPageView() {

    Events.call(this, ['loadComplete', 'startScroll', 'stopScroll','indexChange', 'select', 'mouseover', 'click', 'exit']);

    this.currSelection = 0;
    this.elementsLength = null;

  	this.render =  function($el, data){

      var html = fireUtils.buildTemplate($("#landingPage"), data);

      $el.append(html); 

      this.elementsLength = $(".landingPageLower").children().length;

      $(".landingPageLower div:nth-child(1)").addClass("orangeBorder");

       this.trigger('loadComplete');

  	};

    this.goToBrowse =function(){

      $("#main_landing_container").hide();
      $("#menu-bar").show();      
      $(".largeBrowseContainer").show();

    }.bind(this);

    this.hideShow = function(){

      $("#main_landing_container").hide();
      $("#signinContainer").show();      

    }.bind(this);

    this.move = function (dir) {
      
      this.trigger("startScroll", dir);
      this.selectRowElement(dir);
    }.bind(this);

    this.selectRowElement = function (direction) {
      
      if ((direction > 0 && (this.elementsLength - 1) === this.currSelection) ||
          (direction < 0 && this.currSelection === 0 )) {
            return false;
          }

      $(".landingPageLower").children().eq(this.currSelection).removeClass("orangeBorder");

      this.currSelection += direction;

     $(".landingPageLower").children().eq(this.currSelection).addClass("orangeBorder");
    
    }.bind(this);    

   this.handleControls = function (e) {
      
      if (e.type === 'buttonpress') {
        switch (e.keyCode) {
        case buttons.CLICK:
        case buttons.SELECT:         
        case buttons.PLAY_PAUSE:
          this.trigger('select', this.currSelection);
          break;

        case buttons.BACK:
          this.trigger("exit");
          break;

        case buttons.UP:         
        case buttons.DOWN:
         // this.trigger("bounce");
          break;

        case buttons.LEFT:
          if(this.currSelection !== 0) {
            this.move(-1);
          } 

          break;

        case buttons.RIGHT:
          if(this.currSelection <= 2) {
            this.move(1);
          } 
          break;
        }
      } else if (e.type === 'buttonrepeat') {
        switch (e.keyCode) {
        case buttons.LEFT:
          this.selectRowElement(-1);
          break;

        case buttons.RIGHT:
          this.selectRowElement(1);
          break;
        }
      } else if (e.type === 'buttonrelease') {
        switch (e.keyCode) {
        case buttons.LEFT:
        case buttons.RIGHT:
          this.trigger("stopScroll", this.currSelection);


          break;
        }
      }
    }.bind(this);

  	 }

  exports.LandingPageView = LandingPageView;
}(window));


(function (exports) {
  "use strict";

  //gloabl constants
  var CONTAINER_SCROLLING_LIST    = "#menu-bar-scrolling-list",

      CONTAINER_MAIN              = "#menu-bar-list-container",

      CLASS_MENU_ITEM_SELECTED    = "menu-bar-list-item-selected",

      CLASS_MENU_ITEM_HIGHLIGHTED = "menu-bar-list-item-highlighted",

      CLASS_MENU_ITEM_CHOSEN      = "menu-bar-list-item-chosen";


  function MenuBarView() {
    // mixin inheritance, initialize this as an event handler for these events:
    Events.call(this, ['exit', 'deselect', 'indexChange', 'select', 'makeActive', 'loadComplete']);

    this.currSelection = 0;

    this.fadeOut = function() {
      this.$el.fadeOut();
    };

    this.fadeIn = function() {
      this.$el.fadeIn();
    };

    /**
     * Hides the menu bar view
     */
    this.hide = function () {
      this.$el.hide();
    };

    /**
     * Display the menu bar view
     */
    this.show = function () {
      this.$el.show();
    };

    /**
     * Hide the menu-bar overlay that covers the one-d-view
     */
    this.collapse = function () {

      $(".menuBottomFocus").css('background-color', 'white');

      //set the chosen item style
      this.setChosenElement();

      //set flag to false
      // this.isDisplayed = false;
      // if (typeof this.menuBarItems[this.currSelectedIndex] === "object") {
      //   this.menuBarItems[this.currSelectedIndex].deselect();
      // }
    };


    this.expand = function () {
      this.menuBarContainerEle.classList.remove('menu-bar-menulist-collapsed');
      this.menuBarContainerEle.classList.add('menu-bar-menulist-expanded');

      //set the selected item style
      this.setSelectedElement();

      //set flag to true
      this.isDisplayed = true;

      if (typeof this.menuBarItems[this.currSelectedIndex] === "object") {
        // this is a hack for dealing with selecting the input box, we need to wait for it to appear
        // TODO: Find out why this is and get a better solution.
        setTimeout(this.menuBarItems[this.currSelectedIndex].select, 200);
      }
    };


    this.setSelectedElement = function (ele) {
      ele = ele || this.currentSelectionEle;

      //remove highlighted class if it's there
      var highlightedEle = $("." + CLASS_MENU_ITEM_HIGHLIGHTED);
      if(highlightedEle) {
        highlightedEle.removeClass(CLASS_MENU_ITEM_HIGHLIGHTED);
        this.menuBarContainerEle.classList.remove('menu-bar-collapsed-highlight');
      }

      $(ele).addClass(CLASS_MENU_ITEM_SELECTED);
    };

    this.setChosenElement = function (ele) {
      // ele = ele || this.currentSelectionEle;

      // // make sure only one element can be chosen at a time
      // $(".menu-bar-list-item-static").removeClass(CLASS_MENU_ITEM_CHOSEN);

      // if($(ele).hasClass(CLASS_MENU_ITEM_SELECTED))
      // {
      //   $(ele).removeClass(CLASS_MENU_ITEM_SELECTED);
      // }
      // else if($(ele).hasClass(CLASS_MENU_ITEM_HIGHLIGHTED))
      // {
      //   $(ele).removeClass(CLASS_MENU_ITEM_HIGHLIGHTED);

      //   this.menuBarContainerEle.classList.remove('menu-bar-collapsed-highlight');

      // }
      // $(ele).addClass(CLASS_MENU_ITEM_CHOSEN);
    };


    this.setHighlightedElement = function (ele) {
      // ele = ele || this.currentSelectionEle;

      // $(ele).addClass(CLASS_MENU_ITEM_HIGHLIGHTED);
      // this.menuBarContainerEle.classList.add('menu-bar-collapsed-highlight');
      $(".menuBottomFocus").css('background-color', '#ba3a23');
    };


    this.handleListItemSelection = function(e) {
      if(!this.isDisplayed) {
        this.trigger('makeActive');
      } else {
        this.setCurrentSelectedIndex($(e.target).parent().index());
        this.confirmNavSelection();
      }
    }.bind(this);


    this.render = function ($el) {

       var html = fireUtils.buildTemplate($("#menu-bar-template"), {});
       $el.append(html);


      this.trigger('loadComplete');
    };


    this.handleControls = function (e) {

     if (e.type === 'buttonpress')
      {
        switch (e.keyCode) {
        case buttons.UP:

          break;
        case buttons.DOWN:
        case buttons.BACK:
          this.trigger('deselect');

          break;
        case buttons.RIGHT:

          $(".menuBottomFocus").css({
            '-webkit-transform': 'translate3d(255px,0px,0px)',
              'width': '195px'
              });

          break;

        case buttons.LEFT:

          $(".menuBottomFocus").css({
            '-webkit-transform': 'translate3d(0px,0px,0px)',
              'width': '240px'
              });


          break;

        case buttons.SELECT:

          if($(".menuBottomFocus").css('transform') === "matrix(1, 0, 0, 1, 245, 0)"){

          }
          else{

          }

          break;
        }
      }
      else if (e.type === 'buttonrepeat')
      {
        switch (e.keyCode) {
        case buttons.LEFT:
          // if(this.isDisplayed) {
          //   this.incrementCurrentSelectedIndex(-1);
          // }
          break;
        case buttons.RIGHT:
          // if(this.isDisplayed) {
          //   this.incrementCurrentSelectedIndex(1);
          // }
          break;
        }
      }

    }.bind(this);


    this.incrementCurrentSelectedIndex = function(direction) {
      if ((direction > 0 && this.currSelectedIndex !== (this.$menuItems.length - 1)) || (direction < 0 && this.currSelectedIndex !== 0)) {
        this.currSelectedIndex += direction;
        this.selectMenuBarItem();
      }
    };


    this.setCurrentSelectedIndex = function(index) {
      this.currSelectedIndex = index;
      this.selectMenuBarItem();
    };


    this.confirmNavSelection = function() {
      if(this.confirmedSelection !== this.currSelectedIndex)
      {

        this.confirmedSelection = this.currSelectedIndex;
        this.trigger('select', this.currSelectedIndex);

      }

    };


    this.selectMenuBarItem = function () {
      // update the menu bar to the current selection and run the selection animation
      $(this.currentSelectionEle).removeClass(CLASS_MENU_ITEM_SELECTED);

      this.currentSelectionEle = this.$menuItems.eq(this.currSelectedIndex).children()[0];
      this.setSelectedElement(this.currentSelectionEle);


      this.trigger('indexChange', this.currSelectedIndex);
    };


    this.shiftNavScrollContainer = function() {
      if(!this.translateAmount) {
        this.translateAmount = this.currentSelectionEle.getBoundingClientRect().height + 2;
      }

      //shift the nav as selection changes
      var translateHeight = 0 - (this.translateAmount * this.currSelectedIndex);
      this.scrollingContainerEle.style.webkitTransform = "translateY(" + translateHeight + "px)";
    };

  }

  exports.MenuBarView = MenuBarView;
}(window));

(function (exports) {
    "use strict";

   
    function ListscreenView() {

    	 Events.call(this, ['select', 'back', 'loadComplete']);

    

    	this.render = function($container){

    		var html = fireUtils.buildTemplate($("#listscreen-view"), {});           

        $container.append(html);
        $("#app-header-bar").hide();

        this.trigger("loadComplete");
         
        
    	};

    	

    	this.move = function(dir){

    		if((dir > 0 && this.currSelection === 3) || (dir < 0 && this.currSelection === 1) ){
    			return;
    		}
    		// $(".autoplayRow span:nth-child("+this.currSelection+")").removeClass("orangeBorder");

    		// this.currSelection += dir;

    		// $(".autoplayRow span:nth-child("+this.currSelection+")").addClass("orangeBorder");
        
    	};

    

    	this.handleControls = function (e) {
          
          if (e.type === 'buttonpress') {
            switch (e.keyCode) {
            case buttons.CLICK:
            case buttons.SELECT:         
            case buttons.PLAY_PAUSE:

              
                         
              break;

            case buttons.BACK:
             
              
              break;

            

            case buttons.UP:

              break;         
            case buttons.DOWN:
           
           
              break;

            case buttons.LEFT:

                  

              break;

            case buttons.RIGHT:            

            	
                
             
              break;
            }
          } 
          else if (e.type === 'buttonrepeat') 
          {
            switch (e.keyCode) {
            case buttons.LEFT:
             
              break;

            case buttons.RIGHT:
              
              break;
            }
          } 
          else if (e.type === 'buttonrelease') 
          {
            switch (e.keyCode) {
            case buttons.LEFT:
            case buttons.RIGHT:
              


              break;
            }
          }
        }.bind(this);

	}

    exports.ListscreenView = ListscreenView;
}(window));
(function (exports) {
  "use strict";

  
  function GridRowView() {
    
    Events.call(this, ['loadComplete', 'back', 'transitionUp', 'select']);

    this.currSelection = 0;
    this.rowSelection = null;
    this.rowSelection = 0;

    this.render = function($el){

      var html = utils.buildTemplate($("#grid-row"), {});

      $el.append(html);

      this.setUpTheRow(this.rowSelection, this.currSelection); 

    };

    this.transitionUp = function(){
      
      $('.innerLargeBrowseContainer').animate({marginTop: '+=620px'});
            

    };

    this.highLight = function(){

      $(this.kids[this.currSelection]).addClass("orangeBorder");
    };

    this.setUpTheRow = function(rowNumber){

        this.kids = $(".innerGridRow:eq("+rowNumber+")").find('img');
        
        this.gridrowLength = this.kids.length;

        this.addedGridrowLength = this.gridrowLength + 1;

        $(".innerGridRow").css('width', (this.addedGridrowLength*350) + "px");

        $(this.kids[0]).css('margin-left',  '16px' ); 

        

    } ;  
   
    this.handleControls = function (e) {

          if (e.type === 'buttonpress')
           {
            switch (e.keyCode) 
            {

            case buttons.SELECT:
            case buttons.PLAY_PAUSE:
              this.trigger('select');
              break;
            case buttons.BACK:
                this.trigger("back");
              break;
            case buttons.UP:          
             
              if(this.rowSelection === 0){

                $(this.kids[this.currSelection]).removeClass("orangeBorder"); 
              	 this.trigger('transitionUp');
              	  
              }
              else{
                this.rowSelection--;

                $('.innerLargeBrowseContainer').animate({marginTop: '+=620px'});

                $(this.kids[this.currSelection]).removeClass("orangeBorder");

                this.currSelection = 0;

                this.setUpTheRow(this.rowSelection);

                this.highLight();

              }
              
              break;
            case buttons.DOWN:

              var numGridRows = $('.gridRow').length;             

              if(this.rowSelection < numGridRows - 1){

                 this.rowSelection++;

                $('.innerLargeBrowseContainer').animate({marginTop: '-=620px'});

                $(this.kids[this.currSelection]).removeClass("orangeBorder");

                this.currSelection = 0;

                this.setUpTheRow(this.rowSelection);

                this.highLight();  

              }                              

              break;

            case buttons.LEFT:

              if (this.currSelection > 0){

                if(this.currSelection > 3) {

                $(this.kids[0]).css('margin-left',  '+=342px' );

                $(this.kids[this.currSelection]).removeClass("orangeBorder");

                this.currSelection--;

                $(this.kids[this.currSelection]).addClass("orangeBorder");

                return;

              }

               $(this.kids[this.currSelection]).removeClass("orangeBorder");           

               this.currSelection--;
                
               $(this.kids[this.currSelection]).addClass("orangeBorder");
               
              }              

            break;       

            case buttons.RIGHT:

            if(this.currSelection < this.gridrowLength -1){

                if(this.currSelection > 2) {

                  $(this.kids[0]).css('margin-left',  '-=342px' );

                  $(this.kids[this.currSelection]).removeClass("orangeBorder");

                  this.currSelection++;

                  $(this.kids[this.currSelection]).addClass("orangeBorder");

                  return;

                }

                 $(this.kids[this.currSelection]).removeClass("orangeBorder");

                 this.currSelection++;

        	     $(this.kids[this.currSelection]).addClass("orangeBorder");

            }

              break;
            }
          }

         
        }.bind(this);

      

     }

  exports.GridRowView = GridRowView;
}(window));
/* One D View
 *
 * Handles 1D view containing one sub-category of elements
 *
 */

(function(exports) {
  "use strict";

  var SHOVELER_ROW_ITEM_SELECTED = "featured-3D-shoveler-rowitem-selected";

  function FeaturedRowView() {
    // mixin inheritance, initialize this as an event handler for these events:
    Events.call(this, ['noContent', 'exit', 'startScroll', 'back', 'Ypos', 'indexChange', 'transitionDown', 'stopScroll', 'select', 'bounce', 'loadComplete']);

    //global variables
    this.currSelection = 1;
    this.currentView = null;
    this.elementWidths = [];
    this.titleText = null;
    this.$shovelerContainer = null;
    this.noItems = false;
    this.transformStyle = fireUtils.vendorPrefix('Transform');
    this.currY = 0;
    this.loadingImages = 0;
    this.MARGIN_WIDTH = 40;
    this.DEFAULT_IMAGE = "assets/default-image.png";


    //jquery global variables
    this.$el = null;
    this.el = null;

    this.fadeOut = function() {
      this.$el.css("opacity", "0");
      this.shovelerView.fadeOut();
    };

    this.transitionDown = function() {

      //$(".fixedFocusBorder").hide();

      this.currY -= 500;

      this.scroll[0].style[this.transformStyle] = "translate3d( 0px," + this.currY + "px,0px)";
      this.trigger("Ypos", this.currY);

    };

    this.transitionUp = function() {
      $(".fixedFocusBorder").css({

        '-webkit-transform': 'translate3d(0px, 0px, 0px)',
        'width': '825px',
        'height': '464px',
        'top':'195px'

      });
      this.currY += 500;
      this.scroll[0].style[this.transformStyle] = "translate3d( 0px," + this.currY + "px,0px)";

    };

    this.highLight = function() {
      $(".fixedFocusBorder").show();
      $(".fixedFocusBorder").css({

        '-webkit-transform': 'translate3d(0px, 0px, 0px)',
        'width': '825px',
        'height': '464px',
        'top':'195px'

      });
    };

    this.unhighLight = function() {
      $(".fixedFocusBorder").hide();
    };

    this.fadeIn = function() {
      this.$el[0].style.opacity = "";
      this.shovelerView.fadeIn();
    };

    this.hide = function() {
      this.$el[0].style.opacity = "0";
      this.shovelerView.hide();
    };


    this.show = function() {
      this.$el.css("opacity", "");
      this.shovelerView.show();
    };


    this.remove = function() {
      if (this.el) {
        $(this.el).remove();
      }
    };


    this.setCurrentView = function(view) {
      this.currentView = view;
    };


    this.render = function($el, rowData) {
      //Make sure we don't already have a full container

      this.remove();
      this.rowData = rowData[0].data;

      // Build the main content template and add it

      var html = fireUtils.buildTemplate($("#featured-template"), {
        items: this.rowData
      });

      $el.append(html);

      this.$el = $el.children().last().children().children();
      this.$rowElements = this.$el.children();


      this.el = this.$el[0];

      if (rowData.length <= 0) {
        console.log("featured row data length <= 0");
        $(".featured-no-items-container").show();
        this.trigger('loadComplete');
        this.trigger("noContent");
        this.noItems = true;
        return;
      }

      this.scroll = document.getElementsByClassName("innerLargeBrowseContainer");

      this.noItems = false;

      this.initialLayout();

    };

    this.initialLayout = function() {
      // compute all widths
      this.transformLimit = this.$el.width() + 300;
      this.limitTransforms = false;

      for (var i = 0; i < this.$rowElements.length; i++) {
        var $currElt = $(this.$rowElements[i]);
        var $currImage = $currElt.children("img.featured-full-img");
        if ($currImage.length === 0) {
          $currElt.prepend('<img class = "featured-full-img " src="' + this.rowData[i].image.styles.large + '" style="opacity:0"/>');
          $currElt.append('<div class="featuredOverlayText"><div class="featuredRowInfoOverlayTitle">' + this.rowData[i].label + '</div>');
          $currImage = $currElt.children("img.featured-full-img");
        }

        //set a callback to make sure all images are loaded
        this.createImageLoadHandlers($currElt, $currImage, i);
        //this.relayoutOnLoadedImages();
        this.loadingImages++;
      }
    };

    this.createImageLoadHandlers = function($elt, $currImage, index) {
      $currImage.on("load", this.imageLoadHandler($elt, this.rowData[index]));
      // handle error case for loading screen
      $currImage.on("error", this.imageLoadErrorHandler(this.rowData[index]));
    }.bind(this);

    this.imageLoadHandler = function($elt, itemType) {
      return function() {
        // if (itemType === "subcategory") {
        //     // add the 'stacks' asset if this is a subcategory type
        //     $elt.append('<div class = "featured-3D-shoveler-subcat-bg"></div>');
        // }
        $elt.children("img.featured-full-img")[0].style.opacity = "";
        this.relayoutOnLoadedImages();
      }.bind(this);
    };

    this.imageLoadErrorHandler = function(itemType) {
      return function(event) {
        var $elt = $(event.currentTarget).parent();
        $elt.children("img.featured-full-img").remove();
        $elt.prepend('<img class = "featured-full-img" src="' + this.DEFAULT_IMAGE + '" style="opacity:0"/>');
        var $currImage = $elt.children("img.featured-full-img");
        $currImage.on("load", this.imageLoadHandler($elt, itemType));
        errorHandler.writeToConsole(ErrorTypes.IMAGE_LOAD_ERROR, ErrorTypes.IMAGE_LOAD_ERROR.errorToDev, errorHandler.genStack());
      }.bind(this);
    }.bind(this);

    this.layoutElements = function() {

      for (var i = 0; i < this.$rowElements.length; i++) {

        var $currElt = $(this.$rowElements[i]);
        this.elementWidths[i] = $currElt.width();

        if ($currElt.children("img.featured-full-img").length > 0) {
          $currElt.children("img.featured-full-img")[0].style.opacity = "";
        }
      }

      this.setTransforms(1);

      window.setTimeout(function() {
        this.$rowElements.css("transition", "");
        this.limitTransforms = true;
        this.finalizeRender();
      }.bind(this), 500);
    };


    this.finalizeRender = function() {

      this.$el.css('opacity', '');
      this.trigger('loadComplete');

    };


    this.relayoutOnLoadedImages = function() {

      if (--this.loadingImages === 0) {
        this.layoutElements();
        // finalize selection on the first element in the shoveler
        this.finalizeSelection(1);
      }
    };

    this.shovelMove = function(dir) {
      this.trigger("startScroll", dir);
      this.selectRowElement(dir);
    }.bind(this);


    this.handleControls = function(e) {

      if (e.type === 'buttonpress') {

        switch (e.keyCode) {
          case buttons.SELECT:
          case buttons.PLAY_PAUSE:
            this.trigger('select', this.currSelection);
            break;

          case buttons.BACK:
            this.trigger("exit");
            break;

          case buttons.UP:
            this.trigger('bounce', e.keyCode);
            break;
          case buttons.DOWN:

            this.trigger("transitionDown");
            break;

          case buttons.LEFT:
            if (this.currSelection !== 0) {
              this.shovelMove(-1);
            } else {
              //this.trigger('bounce', e.keyCode);
            }

            break;

          case buttons.RIGHT:
            if (this.currSelection < this.rowData.length) {
              this.shovelMove(1);
            } else {
              this.trigger('bounce', e.keyCode);
            }
            break;
        }
      } else if (e.type === 'buttonrepeat') {
        switch (e.keyCode) {
          case buttons.LEFT:
            this.selectRowElement(-1);
            break;

          case buttons.RIGHT:
            this.selectRowElement(1);
            break;
        }
      } else if (e.type === 'buttonrelease') {
        switch (e.keyCode) {
          case buttons.LEFT:
          case buttons.RIGHT:
            this.trigger("stopScroll", this.currSelection);


            break;
        }
      }

    }.bind(this);


    this.prepareSelectionForAnimation = function() {
      // remove drop shadow and z-index before moving to speed up FPS on animation
      $(this.$rowElements[this.currSelection]).removeClass(SHOVELER_ROW_ITEM_SELECTED);
      $(this.$rowElements[this.currSelection]).css("z-index", "");
    }.bind(this);


    this.finalizeSelection = function(currSelection) {
      // add drop shadow to inner image
      //  $(this.$rowElements[currSelection]).addClass(SHOVELER_ROW_ITEM_SELECTED);
      // raise the outermost selected element div for the drop shadow to look right
      //$(this.$rowElements[currSelection]).css("z-index", "100");
      //$(this.$rowElements[currSelection]).find('img.featured-full-img').nextAll().show();
    }.bind(this);


    this.selectRowElement = function(direction) {

      if ((direction > 0 && (this.$rowElements.length - 1) === this.currSelection) ||
        (direction < 0 && this.currSelection === 0)) {
        return false;
      }
      //  $(this.$rowElements[this.currSelection]).find('img.featured-full-img').nextAll().hide();
      this.currSelection += direction;
      //$(this.$rowElements[this.currSelection]).find('img.featured-full-img').nextAll().show();
      this.transitionRow();

      return true;
    }.bind(this);


    this.transitionRow = function() {
      window.requestAnimationFrame(function() {
        this.setTransforms(this.currSelection);
      }.bind(this));

      this.trigger('indexChange', this.currSelection);
    }.bind(this);


    this.setSelectedElement = function(index) {
      this.currSelection = index;
    }.bind(this);


    this.manageSelectedElement = function(selectedEle) {
      selectedEle.style[this.transformStyle] = "translate3d(548px, 0, 0)";
      selectedEle.style.opacity = "0.99";
    };


    this.fadeSelected = function() {
      this.$rowElements[this.currSelection].style.opacity = "0.5";
    };


    this.unfadeSelected = function() {
      this.$rowElements[this.currSelection].style.opacity = "0.99";
    };


    this.shrinkSelected = function() {
      this.setRightItemPositions(this.currSelection, 0);
      this.setLeftItemPositions(this.currSelection - 1, 0 - this.MARGIN_WIDTH);
    };


    this.setRightItemPositions = function(start, currX) {
      var i;

      //this for loop handles elements to the right of the selected element
      for (i = start; i < this.$rowElements.length; i++) {
        if (this.elementWidths[i] > 0) {
          this.$rowElements[i].style[this.transformStyle] = "translate3d(" + currX + "px,0,0px) ";
          this.$rowElements[i].style.opacity = "";
        } else {
          //keep element offscreen if we have no width yet
          this.$rowElements[i].style[this.transformStyle] = "translate3d(" + this.transformLimit + " +px,0,0px)";
        }

        if (currX > this.transformLimit) {
          if (this.limitTransforms) {
            break;
          }
        } else {
          currX += Math.round(this.elementWidths[i] * 0.75 + this.MARGIN_WIDTH);
        }
      }
    };


    this.setLeftItemPositions = function(start, currX) {
      var i;

      for (i = start; i >= 0; i--) {
        var currPosition = (currX - this.elementWidths[i] - this.MARGIN_WIDTH);
        var itemTrans = "translate3d(" + currPosition + "px,0, 0px) ";

        if (this.elementWidths[i] > 0) {
          this.$rowElements[i].style[this.transformStyle] = itemTrans;
          this.$rowElements[i].style.opacity = "";
        } else {
          //keep element offscreen if we have no width yet
          this.$rowElements[i].style[this.transformStyle] = "translate3d(" + (-this.transformLimit) + "px,0,0px)";
          this.$rowElements[i].style.display = "none";
        }

        if (currX < -this.transformLimit + 1000) {
          if (this.limitTransforms) {
            break;
          }
        } else {
          currX -= Math.round(this.elementWidths[i] + this.MARGIN_WIDTH);
        }
      }
    };


    this.setTransforms = function(selected) {
      var currX = 548;
      selected = selected || this.currSelection;

      //set selected element properties
      this.manageSelectedElement(this.$rowElements[selected]);

      this.setLeftItemPositions(selected - 1, currX);

      currX = Math.round(this.elementWidths[selected] + currX + this.MARGIN_WIDTH);

      this.setRightItemPositions(selected + 1, currX);
    }.bind(this);


  }
  exports.FeaturedRowView = FeaturedRowView;
}(window));

/* One D View
 *
 * Handles 1D view containing one sub-category of elements
 *
 */

(function (exports) {
  "use strict";

  /**
   * @class OneDView
   * @description The 1D view object, this handles everything about the 1D menu.
   */
  function GridWrapView() {
    // mixin inheritance, initialize this as an event handler for these events:

    Events.call(this, ['noContent', 'exit', 'startScroll', 'indexChange', 'stopScroll', 'select', 'bounce', 'loadComplete', 'back']);

     this.$rowElements = null;
     this.currSelection = 0;
     this.rowsData = null;   
     this.noItems = false;
     this.rowOffset = 6; 
     this.imgsInRows = 5;
     this.transformStyle = fireUtils.vendorPrefix('Transform'); 
     this.currY = 0;
     this.firstPass = 1;


    this.hideaway = function(){
      $("#menu-bar").hide();
      $("#gridWrapMainWrap").hide();
      
    };

    
    this.remove = function () {
      if(this.el) {
        $(this.el).remove();
      }
     };

     this.highLight = function(){

      $(this.$rowElements[this.currSelection]).addClass("orangeBorder"); 

    };

    
    this.render = function ($el, rowData) {
       
      //console.log(rowData);
      var html = fireUtils.buildTemplate($("#grid-wrapper"), rowData);

      $el.append(html); 

      this.$el = $el.children().last();

      this.moveableWrapContainer = this.$el.children().children(".moveableGridInternalContainer");

      this.el = this.$el[0];

      this.$rowElements = this.$el.children().children().children().children(".innerThumbnailContainer");    

      this.rowsData =  this.$rowElements;     

      $(this.$rowElements[this.currSelection]).addClass("orangeBorder");

      if (this.rowsData.length <= 0) {
    
         this.noItems = true;
         return;
      }

       this.noItems = false; 

      $(".watchlistNumber1").text(this.currSelection+1);   
      $(".watchlistNumber2").text("|  "+this.$rowElements.length);
      this.trigger('loadComplete');
    };

  

    this.shovelMove = function (dir) {
      this.trigger("startScroll", dir);
      this.selectRowElement(dir);
    }.bind(this);

    this.shiftUp = function(){
         if(this.currSelection >= ( this.imgsInRows) ){

            $(this.$rowElements[this.currSelection]).removeClass("orangeBorder");
            this.currSelection -= this.imgsInRows;
             $(".watchlistNumber1").text(this.currSelection+1); 
            $(this.$rowElements[this.currSelection]).addClass("orangeBorder");
            this.currY += 575;    
            this.moveableWrapContainer[0].style[this.transformStyle] = "translate3d( 0px,"+this.currY+"px,0px)";          

        }
        else{
            $(this.$rowElements[this.currSelection]).removeClass("orangeBorder");
            this.trigger('bounce', null);
           return;
        }

    };

    this.shiftDown = function(){
         if(this.currSelection <= (this.rowsData.length - this.rowOffset) ){

            $(this.$rowElements[this.currSelection]).removeClass("orangeBorder");
            this.currSelection += this.imgsInRows;
             $(".watchlistNumber1").text(this.currSelection+1); 
            $(this.$rowElements[this.currSelection]).addClass("orangeBorder");          
            this.currY -= 575;    
            this.moveableWrapContainer[0].style[this.transformStyle] = "translate3d( 0px,"+this.currY+"px,0px)";         

        }

    };

    this.scrollDown = function(){          
        this.currY -= 575;    
        this.moveableWrapContainer[0].style[this.transformStyle] = "translate3d( 0px,"+this.currY+"px,0px)";                  

    }.bind(this);

    this.scrollUp = function(){

      if (this.currSelection <= 4) 
         {
          $(this.$rowElements[this.currSelection]).removeClass("orangeBorder");
           this.trigger('bounce', null);
           return;
         }       

        this.currY += 575;    
        this.moveableWrapContainer[0].style[this.transformStyle] = "translate3d( 0px,"+this.currY+"px,0px)";
        $(this.$rowElements[this.currSelection]).removeClass("orangeBorder");
        this.currSelection --;
        $(this.$rowElements[this.currSelection]).addClass("orangeBorder");

    }.bind(this);
  
    this.handleControls = function (e) {
      

      if (e.type === 'buttonpress')
       {
        switch (e.keyCode) 
        {

        case buttons.SELECT:
        case buttons.PLAY_PAUSE:

          this.trigger('select', this.currSelection);
          break;
        case buttons.BACK:
            this.trigger("back");
          break;
        case buttons.UP:          
         
          this.shiftUp();
          
          break;
        case buttons.DOWN:

          this.shiftDown();  

          break;

        case buttons.LEFT:
          if(this.currSelection !== 0) 
          {
            this.shovelMove(-1);
          } 
          else 
          {
            //this.trigger('bounce', e.keyCode);
            //$(this.$rowElements[this.currSelection]).removeClass("orangeBorder");
          }

        break;        

        case buttons.RIGHT:
          if(this.currSelection < this.rowsData.length) 
          {

            this.shovelMove(1);
          } 
          else
           {
            this.trigger('bounce', e.keyCode);
          }
          break;
        }
      }
      else if (e.type === 'buttonrepeat') {
        switch (e.keyCode) {
          case buttons.LEFT:
              if(this.currSelection !== 0) 
              {
                this.shovelMove(-1);
              } 
              else 
              {
                //this.trigger('bounce', e.keyCode);
                //$(this.$rowElements[this.currSelection]).removeClass("orangeBorder");
              }
             
            break;

          case buttons.RIGHT:
              if(this.currSelection < this.rowsData.length) 
              {

                this.shovelMove(1);
              } 
              else
               {
                this.trigger('bounce', e.keyCode);
              }
             
            break;
          case buttons.UP:
              this.shiftUp();
            break;
          case buttons.DOWN:
             this.shiftDown();
            break;
        }
      } else if (e.type === 'buttonrelease') {
        switch (e.keyCode) {
          case buttons.LEFT:
          case buttons.RIGHT:
              this.trigger("stopScroll", this.currSelection);


            break;
        }
      }

     
    }.bind(this);

      this.selectRowElement = function (direction) {

      if ((direction > 0 && (this.$rowElements.length - 1) === this.currSelection) ||
          (direction < 0 && this.currSelection === 0 )) {
            return false;
          }
     
      if(direction < 0 && (this.currSelection %5) === 0.0){
        this.scrollUp();
        return;
      }

      
      $(this.$rowElements[this.currSelection]).removeClass("orangeBorder");
      this.currSelection += direction;
      $(".watchlistNumber1").text(this.currSelection+1); 
      $(this.$rowElements[this.currSelection]).addClass("orangeBorder");
       
        if(direction > 0 && (this.currSelection %5) === 0.0){
        this.scrollDown();

      }
      
       

      return true;
    }.bind(this);

  
   }

  exports.GridWrapView = GridWrapView;
}(window));

/* Shoveler View
 *
 * Handles the "shoveler" which is a right-to-left carousel view with endpoints on both sides
 *
 */

(function (exports) {
  "use strict";

  var SHOVELER_ROW_ITEM_SELECTED = "autoplay-shoveler-rowitem-selected";

 
  function AutoplayShovelerView() {
   

    Events.call(this, ['loadComplete', 'giveMeData', 'exit', 'up', 'down','startScroll', 'indexChange', 'stopScroll', 'select', 'bounce', 'back']);

    
    this.currSelection = 0;
    this.elementWidths = [];
    this.isScrolling = false;
    this.currScrollDirection = null;
    this.loadingImages = 0;
    this.jjj = 4;
    this.globalRows=null;
    this.last=0;   
    this.$el = null;
    this.$rowElements = [];
    this.rowsData = null;
    this.rowIndex = 0;
    this.rowCounter = 0;
    this.firstPass = 0;
    this.lastUpperRowPos = [];
    this.lastLowerRowPos = [];
    this.currY = 0;
    this.lastView = null;
    this.MARGIN_WIDTH = 100;

    this.DEFAULT_IMAGE = "assets/l1.jpg";

    this.transformStyle = fireUtils.vendorPrefix('Transform');

    this.fadeOut = function() {
      this.$el.css("opacity", "0");
    };

    this.Ypos = function(ypos){
      this.currY = ypos;
    };

    this.fadeIn = function() {
      this.$el.css("opacity", "");
    };

    this.highLight =function(index){ 
    //this.rowCounter = index;
    //this.currSelection = index;         
         
       $(this.$rowElements[this.rowCounter][this.currSelection ]).css("z-index", "100");
       $(this.$rowElements[this.rowCounter][ this.currSelection]).children('img').addClass("orangeBorder"); 
      
     };

     this.transitionDown = function(){      
      this.currY -=695;    
      this.parentEle[0].style[this.transformStyle] = "translate3d( 0px,"+this.currY+"px,0px)"; 
     
     };

     this.transitionUp = function(){
      this.currY += 695;    
      this.parentEle[0].style[this.transformStyle] = "translate3d( 0px,"+this.currY+"px,0px)"; 
     
     };

     this.decrementRow = function(){
       this.rowCounter-=1;

     };

     this.incrementRow = function(){
        this.rowCounter+=1;
     };

    this.unHighLight =function(){
     
       $(this.$rowElements[this.rowCounter][this.currSelection]).css("z-index", "");  
       $(this.$rowElements[this.rowCounter][this.currSelection]).children().removeClass("orangeBorder");
           
    };

    this.showExtraData = function (index) {
      
  };

  
    this.hideExtraData = function () {
       
    };

    
    this.remove = function () {
      
      this.$el.remove();
    };

    
    this.hide = function () {
      this.$el.css("opacity", "0");
    };

   
    this.show = function () {
      this.$el.css("opacity", "");
    };

    this.down = function(){

      if(this.rowCounter >= this.finalNumOfRows-2 ){              
              return;
        }          

      var thisDownIndex = this.lastUpperRowPos[this.rowCounter+1] = this.currSelection;          
      this.currSelection = this.lastLowerRowPos[this.rowCounter] || 0;          
      $(this.$rowElements[this.rowCounter][thisDownIndex]).css("z-index", "");  
      $(this.$rowElements[this.rowCounter][thisDownIndex]).children('.autoplay-shoveler-full-img').removeClass("orangeBorder");      
      this.transitionDown();
      this.rowCounter+=1;
      this.selectARow(this.rowCounter);
      var mmm = this.lastLowerRowPos[this.rowCounter-1] || 0 ;           
      $(this.$rowElements[this.rowCounter][mmm ]).css("z-index", "100");
      $(this.$rowElements[this.rowCounter][ mmm]).children('.autoplay-shoveler-full-img').addClass("orangeBorder");   

    };

    this.up = function(eventKeycode){

      if(this.rowCounter  === 0){
          this.trigger('bounce',eventKeycode);
          return;
        }
        
      var thisUpIndex = this.lastLowerRowPos[this.rowCounter-1] = this.currSelection;         
      this.currSelection = this.lastUpperRowPos[this.rowCounter] || 0;
      $(this.$rowElements[this.rowCounter][thisUpIndex]).css("z-index", "");  
      $(this.$rowElements[this.rowCounter][thisUpIndex]).children('.autoplay-shoveler-full-img').removeClass("orangeBorder");
      this.transitionUp();
      this.rowCounter-=1;
      this.selectARow(this.rowCounter);
      var mmm = this.lastUpperRowPos[this.rowCounter+1] || 0;            
      $(this.$rowElements[this.rowCounter][mmm ]).css("z-index", "100");
      $(this.$rowElements[this.rowCounter][ mmm]).children('.autoplay-shoveler-full-img').addClass("orangeBorder"); 

    };

    
    this.handleContentItemSelection = function(e) {
      var targetIndex = $(e.target).parent().index();

      if(targetIndex === this.currSelection) {
        this.trigger('select', this.currSelection);
      } else {
        //set current selected item
        this.setSelectedElement(targetIndex);

        this.transitionRow();

        this.trigger("stopScroll", this.currSelection);
      }
    }.bind(this);
    
    this.render = function (el, row) {
      var ttt;
     
      this.parentContainer = el; 

      if(app.springboard || app.autoplay){
        this.myrow=row;
        if(this.myrow.number ==="four"){
           this.myrow.rowtitle = "YOU MIGHT ALSO LIKE";
        }
       
      } 
      else{
         this.myrow =row;
        if(this.myrow.number ==="four"){
           this.myrow.rowtitle = "Continue Watching";
         }
       
      }    
      
      var html = fireUtils.buildTemplate($("#autoplay-shoveler-template"), {
        row: this.myrow
      });  
       
      this.parentEle = el;           
       
      el.append(html);     

      this.rowsData = row.items;      

      this.$el = el.children().last().children('#autoplay-shoveler-view');

      this.$rowElements[this.rowCounter] = this.$el.children('div');

      ttt = $(this.parentEle).children(".autoplayShovelerParent")[this.rowCounter];
      $(ttt).children(".autoplayRowIndex").text(this.currSelection+1);
      $(ttt).children(".autoplayRowTotal").text("|  "+this.$rowElements[this.rowCounter].length);

      this.initialLayout();
      
    };

   
    this.initialLayout = function () {
     
      this.transformLimit = this.$el.width() + 300;
            
      this.limitTransforms = false;

      for (var i = 0; i < this.$rowElements[this.rowCounter].length; i++) {
        var $currElt = $(this.$rowElements[this.rowCounter][i]);

        var $currImage = $currElt.children("img.autoplay-shoveler-full-img");
        if ($currImage.length === 0) {
          $currElt.prepend('<img class = "autoplay-shoveler-full-img" src="'+ this.rowsData[i].hdbackgroundimageurl + '" style="opacity:0"/>');
          $currElt.append('<div class="autoplayShovelerMovieTitle">'+this.rowsData[i].movieTitle+'</div>');
          $currElt.append('<div class="autoplayShovelerMovieStars"></div>');
          $currImage = $currElt.children("img.autoplay-shoveler-full-img");
        }

        //set a callback to make sure all images are loaded
        this.createImageLoadHandlers($currElt, $currImage, i);

        this.loadingImages++;
      }
    };

    this.createImageLoadHandlers = function($elt, $currImage, index) {
      $currImage.on("load", this.imageLoadHandler($elt, this.rowsData[index].type));
      
      $currImage.on("error", this.imageLoadErrorHandler(this.rowsData[index].type));
    }.bind(this);

    this.imageLoadHandler = function($elt, itemType) {
      return function () {
        if (itemType === "subcategory") {
         
          $elt.append('<div class = "autoplay-shoveler-subcat-bg"></div>');
        }
        $elt.children("img.autoplay-shoveler-full-img")[0].style.opacity = "";
        this.relayoutOnLoadedImages();
      }.bind(this);
    };

    this.imageLoadErrorHandler = function(itemType) {
      return function (event) {
        var $elt = $(event.currentTarget).parent();
        $elt.children("img.autoplay-shoveler-full-img").remove();
        $elt.prepend('<img class = "autoplay-shoveler-full-img" src="'+ this.DEFAULT_IMAGE + '" style="opacity:0"/>');
        var $currImage = $elt.children("img.autoplay-shoveler-full-img");
        $currImage.on("load", this.imageLoadHandler($elt, itemType));
        errorHandler.writeToConsole(ErrorTypes.IMAGE_LOAD_ERROR, ErrorTypes.IMAGE_LOAD_ERROR.errorToDev,  errorHandler.genStack());
      }.bind(this);
    }.bind(this);

    
    this.layoutElements = function () {

      for (var i = 0; i < this.$rowElements[this.rowCounter].length; i++) {
        var $currElt = $(this.$rowElements[this.rowCounter][i]);
        this.elementWidths[i] = $currElt.width();

        if ($currElt.children("img.autoplay-shoveler-full-img").length > 0) {
          $currElt.children("img.autoplay-shoveler-full-img")[0].style.opacity = "";

        }
      }

      this.setTransforms(0);

      window.setTimeout(function() {
        this.$rowElements[this.rowCounter].css("transition", "");
        this.limitTransforms = true;
        this.finalizeRender();
      }.bind(this), 500);
    };

    
    this.finalizeRender = function () {
      this.$el.css('opacity', '');
      this.trigger('loadComplete');

    };

    
    this.relayoutOnLoadedImages = function () {
      if (--this.loadingImages === 0) {
        this.layoutElements();
        
        this.finalizeSelection(0);
      }
    };

    
    this.shovelMove = function (dir) {
      this.trigger("startScroll", dir);
      this.selectRowElement(dir);
    }.bind(this);

    
    this.handleControls = function (e) {

      if (e.type === 'buttonpress') {
        switch (e.keyCode) {
          case buttons.SELECT:
          case buttons.PLAY_PAUSE:
           
            this.trigger('select', this.rowCounter, this.currSelection);
            break;

          case buttons.BACK:
            this.trigger("back");
            break;

          case buttons.UP:

            this.trigger("up", e.keyCode);        

            break;

          case buttons.DOWN: 

            this.trigger("down");                 

            break;

          case buttons.LEFT:
            if(this.currSelection !== 0) {
              this.shovelMove(-1);
            } else {

              if(this.rowCounter === 0){
            
          }
            }

            break;       

          case buttons.RIGHT:
         
            if(this.currSelection < this.rowsData.length) {

              this.shovelMove(1);
            } else {
              this.trigger('bounce', e.keyCode);
            }
            break;
        }
      } else if (e.type === 'buttonrepeat') {
        switch (e.keyCode) {
          case buttons.LEFT:
              this.selectRowElement(-1);
            break;

          case buttons.RIGHT:
              this.selectRowElement(1);
            break;
          case buttons.UP:
              this.up();
            break;
          case buttons.DOWN:
              this.down();
            break;
        }
      } else if (e.type === 'buttonrelease') {
        switch (e.keyCode) {
          case buttons.LEFT:
          case buttons.RIGHT:
              this.trigger("stopScroll", this.currSelection);


            break;
        }
      }
    }.bind(this);

    
    this.prepareSelectionForAnimation = function() {
      
      $(this.$rowElements[this.currSelection]).removeClass(SHOVELER_ROW_ITEM_SELECTED);
      $(this.$rowElements[this.currSelection]).css("z-index", "");
    }.bind(this);

    this.selectARow = function(index){
      
       this.$el =  this.parentEle.children('.autoplayShovelerParent') ;       
       this.$rowElements[index] = $(this.$el[index]).children().children('div');      
         
    }.bind(this);

    
    this.finalizeSelection = function(currSelection) {     
      
      $(this.$rowElements[this.rowCounter][currSelection]).addClass(SHOVELER_ROW_ITEM_SELECTED);
     
      $(this.$rowElements[this.rowCounter][currSelection]).css("z-index", "100"); 


          if(!app.springboard || !app.autoplay){
            if (this.jjj < 7){
              this.jjj+=1;        
              this.rowCounter+=1;

              this.trigger('giveMeData', this.jjj);            
                       
              return;
            }
           }
      app.springboard = 0;
      app.autoplay = 0;
      this.rowCounter = 0;
      this.finalNumOfRows = this.parentEle.children().length;      
      this.selectARow(0);     
      this.trigger('loadComplete');
      
    }.bind(this);

    
    this.selectRowElement = function (direction) {       
      var ttt;
      if ((direction > 0 && (this.$rowElements[this.rowCounter].length -1 ) === this.currSelection) ||
          (direction < 0 && this.currSelection === 0 )) {

            return false;
          
          }
         
        $(this.$rowElements[this.rowCounter][this.currSelection]).css("z-index", "");  
        $(this.$rowElements[this.rowCounter][this.currSelection]).children('.autoplay-shoveler-full-img').removeClass("orangeBorder");    
        this.currSelection += direction;
        $(this.$rowElements[this.rowCounter][this.currSelection]).css("z-index", "100");
        $(this.$rowElements[this.rowCounter][this.currSelection]).children('.autoplay-shoveler-full-img').addClass("orangeBorder");
        ttt = $(this.parentEle).children(".autoplayShovelerParent")[this.rowCounter];
        $(ttt).children(".autoplayRowIndex").text(this.currSelection+1);
     
        if (this.currSelection < this.$rowElements[this.rowCounter].length -4){
          this.transitionRow();
          ttt = $(this.parentEle).children(".autoplayShovelerParent")[this.rowCounter];
          $(ttt).children(".autoplayShovelerRight").css('opacity','1' );
        }
        else{
          ttt = $(this.parentEle).children(".autoplayShovelerParent")[this.rowCounter];
          $(ttt).children(".autoplayShovelerRight").css('opacity','0' );
        }
        
        if(this.currSelection > 0){
          ttt = $(this.parentEle).children(".autoplayShovelerParent")[this.rowCounter];
          $(ttt).children(".autoplayShovelerLeft").css('opacity','1' );
        }
        else{
          ttt = $(this.parentEle).children(".autoplayShovelerParent")[this.rowCounter];
          $(ttt).children(".autoplayShovelerLeft").css('opacity','0' );
        }
        
       

    }.bind(this);

    this.transitionRow = function(theEnd) {
      window.requestAnimationFrame(function(){
        this.setTransforms(this.currSelection);
      }.bind(this));

        this.trigger('indexChange', this.currSelection);
      }.bind(this);

     this.setTransforms = function (selected) {
        
        var currX = 0;
        this.manageSelectedElement(this.$rowElements[this.rowCounter][selected]);     
        selected = selected || this.currSelection; 
        this.setLeftItemPositions(selected - 1, currX);
        currX = Math.round(this.elementWidths[selected] + 20);       
        this.setRightItemPositions(selected+ 1 , currX);
 
    }.bind(this); 

    this.manageSelectedElement = function (selectedEle) {
      
      selectedEle.style[this.transformStyle] = "translate3d(0, 0, 0)";      
      selectedEle.style.opacity = "0.99";

    }; 

    this.setLeftItemPositions = function (start, currX) {
      var i;
       
      for (i = start; i >= 0; i--) {
        var currPosition = (currX - this.elementWidths[i]-20);
       
        var itemTrans = "translate3d(" + currPosition + "px,0, 0px) ";

        if (this.elementWidths[i] > 0) {
          this.$rowElements[this.rowCounter][i].style[this.transformStyle] = itemTrans;
          this.$rowElements[this.rowCounter][i].style.opacity = "";

        } else {
          //keep element offscreen if we have no width yet
          this.$rowElements[this.rowCounter][i].style[this.transformStyle] = "translate3d("+ (-this.transformLimit) + "px,0,0px)";
          this.$rowElements[this.rowCounter][i].style.display = "none";

        }

        if (currX < -this.transformLimit + 1000) {
          if (this.limitTransforms) {
            break;
          }
        } else {
          currX -= Math.round(this.elementWidths[i] * 0.75 + this.MARGIN_WIDTH);
          
      }
    }
    };

    this.setRightItemPositions = function (start, currX) {
      var i;
      
      for (i = start; i < this.$rowElements[this.rowCounter].length; i++) {
        if (this.elementWidths[i] > 0) {
          this.$rowElements[this.rowCounter][i].style[this.transformStyle] = "translate3d(" + (currX+10) + "px,0,0px) ";
          this.$rowElements[this.rowCounter][i].style.opacity = "";
        } else {
          //keep element offscreen if we have no width yet
          this.$rowElements[this.rowCounter][i].style[this.transformStyle] = "translate3d("+ this.transformLimit +" +px,0,0px)";
        }

        if (currX > this.transformLimit) {
          if (this.limitTransforms) {
            break;
          }
        } else {
          currX += Math.round(this.elementWidths[i] * 0.75 + this.MARGIN_WIDTH);
          
        }
      }
    }; 
  
    this.setSelectedElement = function (index) {
      this.currSelection = index;
    }.bind(this);   

    
    this.fadeSelected = function () {
      this.$rowElements[this.currSelection].style.opacity = "0.5";

    };
    
    this.unfadeSelected = function () {
      this.$rowElements[this.currSelection].style.opacity = "0.99";

    };
    
    this.shrinkSelected = function () {
      this.setRightItemPositions(this.currSelection, 0);
      this.setLeftItemPositions(this.currSelection - 1, 0 - this.MARGIN_WIDTH);
    };   
   

  }

  exports.AutoplayShovelerView = AutoplayShovelerView;
}(window));

/* Shoveler View
 *
 * Handles the "shoveler" which is a right-to-left carousel view with endpoints on both sides
 *
 */

(function (exports) {
  "use strict";

  var SHOVELER_ROW_ITEM_SELECTED = "series-springboard-shoveler-rowitem-selected";

 
  function SeriesSpringboardShovelerView() {
   

    Events.call(this, ['loadComplete', 'giveMeData', 'exit', 'up', 'down','startScroll', 'indexChange', 'stopScroll', 'select', 'bounce', 'back']);

    
    this.currSelection = 0;
    this.elementWidths = [];
    this.isScrolling = false;
    this.currScrollDirection = null;
    this.loadingImages = 0;
    this.jjj = 4;
    this.globalRows=null;
    this.last=0;   
    this.$el = null;
    this.$rowElements = [];
    this.rowsData = null;
    this.rowIndex = 0;
    this.rowCounter = 0;
    this.firstPass = 0;
    this.lastUpperRowPos = [];
    this.lastLowerRowPos = [];
    this.currY = 0;
    this.lastView = null;
    this.MARGIN_WIDTH = 22;

    this.DEFAULT_IMAGE = "assets/l1.jpg";

    this.transformStyle = fireUtils.vendorPrefix('Transform');

    this.fadeOut = function() {
      this.$el.css("opacity", "0");
    };

    this.Ypos = function(ypos){
      this.currY = ypos;
    };

    this.fadeIn = function() {
      this.$el.css("opacity", "");
    };

    this.highLight =function(index){ 
    //this.rowCounter = index;
    //this.currSelection = index;         
         
       $(this.$rowElements[this.rowCounter][this.currSelection ]).css("z-index", "100");
       $(this.$rowElements[this.rowCounter][ this.currSelection]).children('img').addClass("orangeBorder"); 
      
     };

     this.transitionDown = function(){      
      this.currY -=695;    
      this.parentEle[0].style[this.transformStyle] = "translate3d( 0px,"+this.currY+"px,0px)"; 
     
     };

     this.transitionUp = function(){
      this.currY += 695;    
      this.parentEle[0].style[this.transformStyle] = "translate3d( 0px,"+this.currY+"px,0px)"; 
     
     };

     this.decrementRow = function(){
       this.rowCounter-=1;

     };

     this.incrementRow = function(){
        this.rowCounter+=1;
     };

    this.unHighLight =function(){
     
       $(this.$rowElements[this.rowCounter][this.currSelection]).css("z-index", "");  
       $(this.$rowElements[this.rowCounter][this.currSelection]).children().removeClass("orangeBorder");
           
    };

    this.showExtraData = function (index) {
      
  };

  
    this.hideExtraData = function () {
       
    };

    
    this.remove = function () {
      
      this.$el.remove();
    };

    
    this.hide = function () {
      this.$el.css("opacity", "0");
    };

   
    this.show = function () {
      this.$el.css("opacity", "");
    };

    this.down = function(){

      if(this.rowCounter >= this.finalNumOfRows-2 ){              
              return;
        }          

      var thisDownIndex = this.lastUpperRowPos[this.rowCounter+1] = this.currSelection;          
      this.currSelection = this.lastLowerRowPos[this.rowCounter] || 0;          
      $(this.$rowElements[this.rowCounter][thisDownIndex]).css("z-index", "");  
      $(this.$rowElements[this.rowCounter][thisDownIndex]).children('.series-springboard-shoveler-full-img').removeClass("orangeBorder");      
      this.transitionDown();
      this.rowCounter+=1;
      this.selectARow(this.rowCounter);
      var mmm = this.lastLowerRowPos[this.rowCounter-1] || 0 ;           
      $(this.$rowElements[this.rowCounter][mmm ]).css("z-index", "100");
      $(this.$rowElements[this.rowCounter][ mmm]).children('.series-springboard-shoveler-full-img').addClass("orangeBorder");   

    };

    this.up = function(eventKeycode){

      if(this.rowCounter  === 0){
          this.trigger('bounce',eventKeycode);
          return;
        }
        
      var thisUpIndex = this.lastLowerRowPos[this.rowCounter-1] = this.currSelection;         
      this.currSelection = this.lastUpperRowPos[this.rowCounter] || 0;
      $(this.$rowElements[this.rowCounter][thisUpIndex]).css("z-index", "");  
      $(this.$rowElements[this.rowCounter][thisUpIndex]).children('.series-springboard-shoveler-full-img').removeClass("orangeBorder");
      this.transitionUp();
      this.rowCounter-=1;
      this.selectARow(this.rowCounter);
      var mmm = this.lastUpperRowPos[this.rowCounter+1] || 0;            
      $(this.$rowElements[this.rowCounter][mmm ]).css("z-index", "100");
      $(this.$rowElements[this.rowCounter][ mmm]).children('.series-springboard-shoveler-full-img').addClass("orangeBorder"); 

    };

    
    this.handleContentItemSelection = function(e) {
      var targetIndex = $(e.target).parent().index();

      if(targetIndex === this.currSelection) {
        this.trigger('select', this.currSelection);
      } else {
        //set current selected item
        this.setSelectedElement(targetIndex);

        this.transitionRow();

        this.trigger("stopScroll", this.currSelection);
      }
    }.bind(this);
    
    this.render = function (el, row) {
      var ttt;
     
      this.parentContainer = el; 

      if(app.springboard || app.autoplay){
        this.myrow=row;
        if(this.myrow.number ==="four"){
           this.myrow.rowtitle = "YOU MIGHT ALSO LIKE";
        }
       
      } 
      else{
         this.myrow =row;
        if(this.myrow.number ==="four"){
           this.myrow.rowtitle = "Continue Watching";
         }
       
      }    
      
      var html = fireUtils.buildTemplate($("#series-springboard-shoveler-template"), {
        row: this.myrow
      });  
       
      this.parentEle = el;           
       
      el.append(html);     

      this.rowsData = row.items;      

      this.$el = el.children().last().children('#series-springboard-shoveler-view');

      this.$rowElements[this.rowCounter] = this.$el.children('div');

      ttt = $(this.parentEle).children(".seriesSpringboardShovelerParent")[this.rowCounter];
      $(ttt).children(".seriesSpringboardRowIndex").text(this.currSelection+1);
      $(ttt).children(".seriesSpringboardRowTotal").text("|  "+this.$rowElements[this.rowCounter].length);

      this.initialLayout();
      
    };

   
    this.initialLayout = function () {
      var num;
      this.transformLimit = this.$el.width() + 300;
            
      this.limitTransforms = false;

      for (var i = 0; i < this.$rowElements[this.rowCounter].length; i++) {
        var $currElt = $(this.$rowElements[this.rowCounter][i]);

        var $currImage = $currElt.children("img.series-springboard-shoveler-full-img");
        if ($currImage.length === 0) {
          
          num = Math.floor((Math.random() * 100) + 1);          

          $currElt.prepend('<img class = "series-springboard-shoveler-full-img" src="'+ this.rowsData[i].seriesimage + '" style="opacity:0"/>');
          $currElt.prepend('<div class="seriesProgressOnImage" style="width:'+num+'%;"></div>');
          $currElt.prepend('<div class="seriesBlackProgressOnImage"></div>');
          $currElt.append('<div class="seriesSpringboardShovelerMovieTitle">'+this.rowsData[i].movieTitle+'</div>');
          $currElt.append('<div class="seriesSpringboardShovelerMovieStars"></div>');

          $currImage = $currElt.children("img.series-springboard-shoveler-full-img");
        }

        //set a callback to make sure all images are loaded
        this.createImageLoadHandlers($currElt, $currImage, i);

        this.loadingImages++;
      }
    };

    this.createImageLoadHandlers = function($elt, $currImage, index) {
      $currImage.on("load", this.imageLoadHandler($elt, this.rowsData[index].type));
      
      $currImage.on("error", this.imageLoadErrorHandler(this.rowsData[index].type));
    }.bind(this);

    this.imageLoadHandler = function($elt, itemType) {
      return function () {
        if (itemType === "subcategory") {
         
          $elt.append('<div class = "series-springboard-shoveler-subcat-bg"></div>');
        }
        $elt.children("img.series-springboard-shoveler-full-img")[0].style.opacity = "";
        this.relayoutOnLoadedImages();
      }.bind(this);
    };

    this.imageLoadErrorHandler = function(itemType) {
      return function (event) {
        var $elt = $(event.currentTarget).parent();
        $elt.children("img.series-springboard-shoveler-full-img").remove();
        $elt.prepend('<img class = "series-springboard-shoveler-full-img" src="'+ this.DEFAULT_IMAGE + '" style="opacity:0"/>');
        var $currImage = $elt.children("img.series-springboard-shoveler-full-img");
        $currImage.on("load", this.imageLoadHandler($elt, itemType));
        errorHandler.writeToConsole(ErrorTypes.IMAGE_LOAD_ERROR, ErrorTypes.IMAGE_LOAD_ERROR.errorToDev,  errorHandler.genStack());
      }.bind(this);
    }.bind(this);

    
    this.layoutElements = function () {

      for (var i = 0; i < this.$rowElements[this.rowCounter].length; i++) {
        var $currElt = $(this.$rowElements[this.rowCounter][i]);
        this.elementWidths[i] = $currElt.width();

        if ($currElt.children("img.series-springboard-shoveler-full-img").length > 0) {
          $currElt.children("img.series-springboard-shoveler-full-img")[0].style.opacity = "";

        }
      }

      this.setTransforms(0);

      window.setTimeout(function() {
        this.$rowElements[this.rowCounter].css("transition", "");
        this.limitTransforms = true;
        this.finalizeRender();
      }.bind(this), 500);
    };

    
    this.finalizeRender = function () {
      this.$el.css('opacity', '');
      this.trigger('loadComplete');

    };

    
    this.relayoutOnLoadedImages = function () {
      if (--this.loadingImages === 0) {
        this.layoutElements();
        
        this.finalizeSelection(0);
      }
    };

    
    this.shovelMove = function (dir) {
      this.trigger("startScroll", dir);
      this.selectRowElement(dir);
    }.bind(this);

    
    this.handleControls = function (e) {

      if (e.type === 'buttonpress') {
        switch (e.keyCode) {
          case buttons.SELECT:
          case buttons.PLAY_PAUSE:
           
            this.trigger('select', this.rowCounter, this.currSelection);
            break;

          case buttons.BACK:
            this.trigger("back");
            break;

          case buttons.UP:

            this.trigger("up", e.keyCode);        

            break;

          case buttons.DOWN: 

            this.trigger("down");                 

            break;

          case buttons.LEFT:
            if(this.currSelection !== 0) {
              this.shovelMove(-1);
            } else {

              if(this.rowCounter === 0){
            
          }
            }

            break;       

          case buttons.RIGHT:
         
            if(this.currSelection < this.rowsData.length) {

              this.shovelMove(1);
            } else {
              this.trigger('bounce', e.keyCode);
            }
            break;
        }
      } else if (e.type === 'buttonrepeat') {
        switch (e.keyCode) {
          case buttons.LEFT:
              this.selectRowElement(-1);
            break;

          case buttons.RIGHT:
              this.selectRowElement(1);
            break;
          case buttons.UP:
              this.up();
            break;
          case buttons.DOWN:
              this.down();
            break;
        }
      } else if (e.type === 'buttonrelease') {
        switch (e.keyCode) {
          case buttons.LEFT:
          case buttons.RIGHT:
              this.trigger("stopScroll", this.currSelection);


            break;
        }
      }
    }.bind(this);

    
    this.prepareSelectionForAnimation = function() {
      
      $(this.$rowElements[this.currSelection]).removeClass(SHOVELER_ROW_ITEM_SELECTED);
      $(this.$rowElements[this.currSelection]).css("z-index", "");
    }.bind(this);

    this.selectARow = function(index){
      
       this.$el =  this.parentEle.children('.seriesSpringboardShovelerParent') ;       
       this.$rowElements[index] = $(this.$el[index]).children().children('div');      
         
    }.bind(this);

    
    this.finalizeSelection = function(currSelection) {     
      
      $(this.$rowElements[this.rowCounter][currSelection]).addClass(SHOVELER_ROW_ITEM_SELECTED);
     
      $(this.$rowElements[this.rowCounter][currSelection]).css("z-index", "100"); 


          // if(!app.springboard || !app.autoplay){
          //   if (this.jjj < 7){
          //     this.jjj+=1;        
          //     this.rowCounter+=1;

          //     this.trigger('giveMeData', this.jjj);            
                       
          //     return;
          //   }
          //  }
      app.springboard = 0;
      app.autoplay = 0;
      this.rowCounter = 0;
      this.finalNumOfRows = this.parentEle.children().length;      
      this.selectARow(0);     
      this.trigger('loadComplete');
      
    }.bind(this);

    
    this.selectRowElement = function (direction) {       
      var ttt;
      if ((direction > 0 && (this.$rowElements[this.rowCounter].length -1 ) === this.currSelection) ||
          (direction < 0 && this.currSelection === 0 )) {

            return false;
          
          }
         
        $(this.$rowElements[this.rowCounter][this.currSelection]).css("z-index", "");  
        $(this.$rowElements[this.rowCounter][this.currSelection]).children('.series-springboard-shoveler-full-img').removeClass("orangeBorder");    
        this.currSelection += direction;
        $(this.$rowElements[this.rowCounter][this.currSelection]).css("z-index", "100");
        $(this.$rowElements[this.rowCounter][this.currSelection]).children('.series-springboard-shoveler-full-img').addClass("orangeBorder");
        ttt = $(this.parentEle).children(".seriesSpringboardShovelerParent")[this.rowCounter];
        $(ttt).children(".seriesSpringboardRowIndex").text(this.currSelection+1);
     
        if (this.currSelection < this.$rowElements[this.rowCounter].length-3 ){
          this.transitionRow();
          ttt = $(this.parentEle).children(".seriesSpringboardShovelerParent")[this.rowCounter];
          $(ttt).children(".seriesSpringboardShovelerRight").css('opacity','1' );
        }
        else{
          ttt = $(this.parentEle).children(".seriesSpringboardShovelerParent")[this.rowCounter];
          $(ttt).children(".seriesSpringboardShovelerRight").css('opacity','0' );
        }
        
        if(this.currSelection > 0){
          ttt = $(this.parentEle).children(".seriesSpringboardShovelerParent")[this.rowCounter];
          $(ttt).children(".seriesSpringboardShovelerLeft").css('opacity','1' );
        }
        else{
          ttt = $(this.parentEle).children(".seriesSpringboardShovelerParent")[this.rowCounter];
          $(ttt).children(".seriesSpringboardShovelerLeft").css('opacity','0' );
        }
        
       

    }.bind(this);

    this.transitionRow = function(theEnd) {
      window.requestAnimationFrame(function(){
        this.setTransforms(this.currSelection);
      }.bind(this));

        this.trigger('indexChange', this.currSelection);
      }.bind(this);

     this.setTransforms = function (selected) {
        
        var currX = 0;
        this.manageSelectedElement(this.$rowElements[this.rowCounter][selected]);     
        selected = selected || this.currSelection; 
        this.setLeftItemPositions(selected - 1, currX);
        currX = Math.round(this.elementWidths[selected]+20);       
        this.setRightItemPositions(selected+ 1 , currX);
 
    }.bind(this); 

    this.manageSelectedElement = function (selectedEle) {
      
      selectedEle.style[this.transformStyle] = "translate3d(0, 0, 0)";      
      selectedEle.style.opacity = "0.99";

    }; 

    this.setLeftItemPositions = function (start, currX) {
      var i;
       
      for (i = start; i >= 0; i--) {
        var currPosition = (currX - this.elementWidths[i]);
       
        var itemTrans = "translate3d(" + currPosition + "px,0, 0px) ";

        if (this.elementWidths[i] > 0) {
          this.$rowElements[this.rowCounter][i].style[this.transformStyle] = itemTrans;
          this.$rowElements[this.rowCounter][i].style.opacity = "";

        } else {
          //keep element offscreen if we have no width yet
          this.$rowElements[this.rowCounter][i].style[this.transformStyle] = "translate3d("+ (-this.transformLimit) + "px,0,0px)";
          this.$rowElements[this.rowCounter][i].style.display = "none";

        }

        if (currX < -this.transformLimit + 1000) {
          if (this.limitTransforms) {
            break;
          }
        } else {
          currX -= Math.round(this.elementWidths[i] + this.MARGIN_WIDTH);
          
      }
    }
    };

    this.setRightItemPositions = function (start, currX) {
      var i;
      
      for (i = start; i < this.$rowElements[this.rowCounter].length; i++) {
        if (this.elementWidths[i] > 0) {
          this.$rowElements[this.rowCounter][i].style[this.transformStyle] = "translate3d(" + (currX) + "px,0,0px) ";
          this.$rowElements[this.rowCounter][i].style.opacity = "";
        } else {
          //keep element offscreen if we have no width yet
          this.$rowElements[this.rowCounter][i].style[this.transformStyle] = "translate3d("+ this.transformLimit +" +px,0,0px)";
        }

        if (currX > this.transformLimit) {
          if (this.limitTransforms) {
            break;
          }
        } else {
          currX += Math.round(this.elementWidths[i] + this.MARGIN_WIDTH);
          
        }
      }
    }; 
  
    this.setSelectedElement = function (index) {
      this.currSelection = index;
    }.bind(this);   

    
    this.fadeSelected = function () {
      this.$rowElements[this.currSelection].style.opacity = "0.5";

    };
    
    this.unfadeSelected = function () {
      this.$rowElements[this.currSelection].style.opacity = "0.99";

    };
    
    this.shrinkSelected = function () {
      this.setRightItemPositions(this.currSelection, 0);
      this.setLeftItemPositions(this.currSelection - 1, 0 - this.MARGIN_WIDTH);
    };   
   

  }

  exports.SeriesSpringboardShovelerView = SeriesSpringboardShovelerView;
}(window));

/* Shoveler View
 *
 * Handles the "shoveler" which is a right-to-left carousel view with endpoints on both sides
 *
 */

(function (exports) {
  "use strict";

  var SHOVELER_ROW_ITEM_SELECTED = "springboard-shoveler-rowitem-selected";

 
  function SpringboardShovelerView() {
   

    Events.call(this, ['loadComplete', 'giveMeData', 'exit', 'up', 'down','startScroll', 'indexChange', 'stopScroll', 'select', 'bounce', 'back']);

    
    this.currSelection = 0;
    this.elementWidths = [];
    this.isScrolling = false;
    this.currScrollDirection = null;
    this.loadingImages = 0;
    this.jjj = 4;
    this.globalRows=null;
    this.last=0;   
    this.$el = null;
    this.$rowElements = [];
    this.rowsData = null;
    this.rowIndex = 0;
    this.rowCounter = 0;
    this.firstPass = 0;
    this.lastUpperRowPos = [];
    this.lastLowerRowPos = [];
    this.currY = 0;
    this.lastView = null;
    this.MARGIN_WIDTH = 20;

    this.DEFAULT_IMAGE = "assets/l1.jpg";

    this.transformStyle = fireUtils.vendorPrefix('Transform');

    this.fadeOut = function() {
      this.$el.css("opacity", "0");
    };

    this.Ypos = function(ypos){
      this.currY = ypos;
    };

    this.fadeIn = function() {
      this.$el.css("opacity", "");
    };

    this.highLight =function(index){ 
    //this.rowCounter = index;
    //this.currSelection = index;         
         
       $(this.$rowElements[this.rowCounter][this.currSelection ]).css("z-index", "100");
       $(this.$rowElements[this.rowCounter][ this.currSelection]).children('img').addClass("focusBorder"); 
      
     };

     this.transitionDown = function(){      
      this.currY -=695;    
      this.parentEle[0].style[this.transformStyle] = "translate3d( 0px,"+this.currY+"px,0px)"; 
     
     };

     this.transitionUp = function(){
      this.currY += 695;    
      this.parentEle[0].style[this.transformStyle] = "translate3d( 0px,"+this.currY+"px,0px)"; 
     
     };

     this.decrementRow = function(){
       this.rowCounter-=1;

     };

     this.incrementRow = function(){
        this.rowCounter+=1;
     };

    this.unHighLight =function(){
     
       $(this.$rowElements[this.rowCounter][this.currSelection]).css("z-index", "");  
       $(this.$rowElements[this.rowCounter][this.currSelection]).children().removeClass("focusBorder");
           
    };

    this.showExtraData = function (index) {
      
  };

  
    this.hideExtraData = function () {
       
    };

    
    this.remove = function () {
      
      this.$el.remove();
    };

    
    this.hide = function () {
      this.$el.css("opacity", "0");
    };

   
    this.show = function () {
      this.$el.css("opacity", "");
    };

    this.down = function(){

      if(this.rowCounter >= this.finalNumOfRows-2 ){              
              return;
        }          

      var thisDownIndex = this.lastUpperRowPos[this.rowCounter+1] = this.currSelection;          
      this.currSelection = this.lastLowerRowPos[this.rowCounter] || 0;          
      $(this.$rowElements[this.rowCounter][thisDownIndex]).css("z-index", "");  
      $(this.$rowElements[this.rowCounter][thisDownIndex]).children('.springboard-shoveler-full-img').removeClass("focusBorder");      
      this.transitionDown();
      this.rowCounter+=1;
      this.selectARow(this.rowCounter);
      var mmm = this.lastLowerRowPos[this.rowCounter-1] || 0 ;           
      $(this.$rowElements[this.rowCounter][mmm ]).css("z-index", "100");
      $(this.$rowElements[this.rowCounter][ mmm]).children('.springboard-shoveler-full-img').addClass("focusBorder");   

    };

    this.up = function(eventKeycode){

      if(this.rowCounter  === 0){
          this.trigger('bounce',eventKeycode);
          return;
        }
        
      var thisUpIndex = this.lastLowerRowPos[this.rowCounter-1] = this.currSelection;         
      this.currSelection = this.lastUpperRowPos[this.rowCounter] || 0;
      $(this.$rowElements[this.rowCounter][thisUpIndex]).css("z-index", "");  
      $(this.$rowElements[this.rowCounter][thisUpIndex]).children('.springboard-shoveler-full-img').removeClass("focusBorder");
      this.transitionUp();
      this.rowCounter-=1;
      this.selectARow(this.rowCounter);
      var mmm = this.lastUpperRowPos[this.rowCounter+1] || 0;            
      $(this.$rowElements[this.rowCounter][mmm ]).css("z-index", "100");
      $(this.$rowElements[this.rowCounter][ mmm]).children('.springboard-shoveler-full-img').addClass("focusBorder"); 

    };

    
    this.handleContentItemSelection = function(e) {
      var targetIndex = $(e.target).parent().index();

      if(targetIndex === this.currSelection) {
        this.trigger('select', this.currSelection);
      } else {
        //set current selected item
        this.setSelectedElement(targetIndex);

        this.transitionRow();

        this.trigger("stopScroll", this.currSelection);
      }
    }.bind(this);
    
    this.render = function (el, rowData) {
      var ttt;
     
      this.parentContainer = el; 

      this.rowData = rowData[2];        
      
      var html = fireUtils.buildTemplate($("#springboard-shoveler-template"), {
        row: this.rowData
      });  
       
      this.parentEle = el;           
       
      el.append(html);            

      this.$el = el.children().last().children('#springboard-shoveler-view');

      this.$rowElements[this.rowCounter] = this.$el.children('div');

      ttt = $(this.parentEle).children(".springboardShovelerParent")[this.rowCounter];
      $(ttt).children(".springboardRowIndex").text(this.currSelection+1);
      $(ttt).children(".springboardRowTotal").text("|  "+this.$rowElements[this.rowCounter].length);
      $("#springboard-shoveler-view").find(".springboardRowTitle").text("You might also be interested in...");

      this.initialLayout();
      
    };

   
    this.initialLayout = function () {
     
      this.transformLimit = this.$el.width() + 300;
            
      this.limitTransforms = false;

      for (var i = 0; i < this.$rowElements[this.rowCounter].length; i++) {

        var $currElt = $(this.$rowElements[this.rowCounter][i]);
        var $currImage = $currElt.children("img.springboard-shoveler-full-img");

        if ($currImage.length === 0) {
          $currElt.prepend('<img class = "springboard-shoveler-full-img" src="'+ this.rowData[i].image.styles.medium+ '" style="opacity:0"/>');

          if(this.rowData[i].duration !== null && this.rowData[i].duration !== undefined  && this.rowData[i].duration > 0){
             $currElt.append('<div class="springboardShovelerDuration">'+this.rowData[i].fliTime+'</div>');
             $currElt.append('<div class="springboardShovelerMovieTitle">'+this.rowData[i].label+'</div>');
             $currElt.find(".springboardShovelerDuration").css('opacity', '1');

          }
          
          $currImage = $currElt.children("img.springboard-shoveler-full-img");
        }

        
        this.createImageLoadHandlers($currElt, $currImage, i);

        this.loadingImages++;
      }
    };

    this.createImageLoadHandlers = function($elt, $currImage, index) {
      $currImage.on("load", this.imageLoadHandler($elt, this.rowData[index]));
      
      $currImage.on("error", this.imageLoadErrorHandler(this.rowData[index]));
    }.bind(this);

    this.imageLoadHandler = function($elt, itemType) {
      return function () {
        // if (itemType === "subcategory") {
         
        //   $elt.append('<div class = "springboard-shoveler-subcat-bg"></div>');
        // }
        $elt.children("img.springboard-shoveler-full-img")[0].style.opacity = "";
        this.relayoutOnLoadedImages();
      }.bind(this);
    };

    this.imageLoadErrorHandler = function(itemType) {
      return function (event) {
        var $elt = $(event.currentTarget).parent();
        $elt.children("img.springboard-shoveler-full-img").remove();
        $elt.prepend('<img class = "springboard-shoveler-full-img" src="'+ this.DEFAULT_IMAGE + '" style="opacity:0"/>');
        var $currImage = $elt.children("img.springboard-shoveler-full-img");
        $currImage.on("load", this.imageLoadHandler($elt, itemType));
        errorHandler.writeToConsole(ErrorTypes.IMAGE_LOAD_ERROR, ErrorTypes.IMAGE_LOAD_ERROR.errorToDev,  errorHandler.genStack());
      }.bind(this);
    }.bind(this);

    
    this.layoutElements = function () {

      for (var i = 0; i < this.$rowElements[this.rowCounter].length; i++) {
        var $currElt = $(this.$rowElements[this.rowCounter][i]);
        this.elementWidths[i] = $currElt.width();

        if ($currElt.children("img.springboard-shoveler-full-img").length > 0) {
          $currElt.children("img.springboard-shoveler-full-img")[0].style.opacity = "";

        }
      }

      this.setTransforms(0);

      window.setTimeout(function() {
        this.$rowElements[this.rowCounter].css("transition", "");
        this.limitTransforms = true;
        this.finalizeRender();
      }.bind(this), 500);
    };

    
    this.finalizeRender = function () {
      this.$el.css('opacity', '');
      this.trigger('loadComplete');

    };

    
    this.relayoutOnLoadedImages = function () {
      if (--this.loadingImages === 0) {
        this.layoutElements();
        
        this.finalizeSelection(0);
      }
    };

    
    this.shovelMove = function (dir) {
      this.trigger("startScroll", dir);
      this.selectRowElement(dir);
    }.bind(this);

    
    this.handleControls = function (e) {

      if (e.type === 'buttonpress') {
        switch (e.keyCode) {
          case buttons.SELECT:
          case buttons.PLAY_PAUSE:
           
            this.trigger('select', this.rowCounter, this.currSelection);
            break;

          case buttons.BACK:
           $('.springboardBackground').hide();
           $(".springboardBgOpacity").hide();
            this.trigger("back");
            break;

          case buttons.UP:

            //this.trigger("up", e.keyCode); 

            this.up();       

            break;

          case buttons.DOWN: 

            //this.trigger("down");                 

            break;

          case buttons.LEFT:
            if(this.currSelection !== 0) {
              this.shovelMove(-1);
            } else {

              if(this.rowCounter === 0){
            
          }
            }

            break;       

          case buttons.RIGHT:
         
            if(this.currSelection < this.rowData.length) {

              this.shovelMove(1);
            } else {
              this.trigger('bounce', e.keyCode);
            }
            break;
        }
      } else if (e.type === 'buttonrepeat') {
        switch (e.keyCode) {
          case buttons.LEFT:
              this.selectRowElement(-1);
            break;

          case buttons.RIGHT:
              this.selectRowElement(1);
            break;
          case buttons.UP:
              this.up();
            break;
          case buttons.DOWN:
              this.down();
            break;
        }
      } else if (e.type === 'buttonrelease') {
        switch (e.keyCode) {
          case buttons.LEFT:
          case buttons.RIGHT:
              this.trigger("stopScroll", this.currSelection);


            break;
        }
      }
    }.bind(this);

    
    this.prepareSelectionForAnimation = function() {
      
      $(this.$rowElements[this.currSelection]).removeClass(SHOVELER_ROW_ITEM_SELECTED);
      $(this.$rowElements[this.currSelection]).css("z-index", "");
    }.bind(this);

    this.selectARow = function(index){
      
       this.$el =  this.parentEle.children('.springboardShovelerParent') ;       
       this.$rowElements[index] = $(this.$el[index]).children().children('div');      
         
    }.bind(this);

    
    this.finalizeSelection = function(currSelection) {     
      
      //$(this.$rowElements[this.rowCounter][currSelection]).addClass(SHOVELER_ROW_ITEM_SELECTED);
     
      $(this.$rowElements[this.rowCounter][currSelection]).css("z-index", "100"); 


          // if(!app.springboard || !app.autoplay){
          //   if (this.jjj < 7){
          //     this.jjj+=1;        
          //     this.rowCounter+=1;

          //     this.trigger('giveMeData', this.jjj);            
                       
          //     return;
          //   }
          //  }
      app.springboard = 0;
      app.autoplay = 0;
      this.rowCounter = 0;
      this.finalNumOfRows = this.parentEle.children().length;      
      this.selectARow(0);     
      this.trigger('loadComplete');
      
    }.bind(this);

    
    this.selectRowElement = function (direction) {       
      var ttt;
      if ((direction > 0 && (this.$rowElements[this.rowCounter].length -1 ) === this.currSelection) ||
          (direction < 0 && this.currSelection === 0 )) {

            return false;
          
          }
         
        $(this.$rowElements[this.rowCounter][this.currSelection]).css("z-index", "");  
        $(this.$rowElements[this.rowCounter][this.currSelection]).children('.springboard-shoveler-full-img').removeClass("focusBorder");    
        this.currSelection += direction;
        $(this.$rowElements[this.rowCounter][this.currSelection]).css("z-index", "100");
        $(this.$rowElements[this.rowCounter][this.currSelection]).children('.springboard-shoveler-full-img').addClass("focusBorder");
        ttt = $(this.parentEle).children(".springboardShovelerParent")[this.rowCounter];
        $(ttt).children(".springboardRowIndex").text(this.currSelection+1);
     
        if (this.currSelection < this.$rowElements[this.rowCounter].length -3){
          this.transitionRow();
          ttt = $(this.parentEle).children(".springboardShovelerParent")[this.rowCounter];
          $(ttt).children(".springboardShovelerRight").css('opacity','1' );
        }
        else{
          ttt = $(this.parentEle).children(".springboardShovelerParent")[this.rowCounter];
          $(ttt).children(".springboardShovelerRight").css('opacity','0' );
        }
        
        if(this.currSelection > 0){
          ttt = $(this.parentEle).children(".springboardShovelerParent")[this.rowCounter];
          $(ttt).children(".springboardShovelerLeft").css('opacity','1' );
        }
        else{
          ttt = $(this.parentEle).children(".springboardShovelerParent")[this.rowCounter];
          $(ttt).children(".springboardShovelerLeft").css('opacity','0' );
        }
        
       

    }.bind(this);

    this.transitionRow = function(theEnd) {
      window.requestAnimationFrame(function(){
        this.setTransforms(this.currSelection);
      }.bind(this));

        this.trigger('indexChange', this.currSelection);
      }.bind(this);

     this.setTransforms = function (selected) {
        
        var currX = 0;
        this.manageSelectedElement(this.$rowElements[this.rowCounter][selected]);     
        selected = selected || this.currSelection; 
        this.setLeftItemPositions(selected - 1, currX);
        currX = Math.round(this.elementWidths[selected] );       
        this.setRightItemPositions(selected+ 1 , currX);
 
    }.bind(this); 

    this.manageSelectedElement = function (selectedEle) {
      
      selectedEle.style[this.transformStyle] = "translate3d(0, 0, 0)";      
      selectedEle.style.opacity = "0.99";

    }; 

    this.setLeftItemPositions = function (start, currX) {
      var i;
       
      for (i = start; i >= 0; i--) {
        var currPosition = (currX - this.elementWidths[i] -this.MARGIN_WIDTH);
       
        var itemTrans = "translate3d(" + currPosition + "px,0, 0px) ";

        if (this.elementWidths[i] > 0) {
          this.$rowElements[this.rowCounter][i].style[this.transformStyle] = itemTrans;
          this.$rowElements[this.rowCounter][i].style.opacity = "";

        } else {
          //keep element offscreen if we have no width yet
          this.$rowElements[this.rowCounter][i].style[this.transformStyle] = "translate3d("+ (-this.transformLimit) + "px,0,0px)";
          this.$rowElements[this.rowCounter][i].style.display = "none";

        }

        if (currX < -this.transformLimit + 1000) {
          if (this.limitTransforms) {
            break;
          }
        } else {
          currX -= Math.round(this.elementWidths[i] + this.MARGIN_WIDTH);
          
      }
    }
    };

    this.setRightItemPositions = function (start, currX) {
      var i;
      
      for (i = start; i < this.$rowElements[this.rowCounter].length; i++) {
        if (this.elementWidths[i] > 0) {
          this.$rowElements[this.rowCounter][i].style[this.transformStyle] = "translate3d(" + (currX+ this.MARGIN_WIDTH) + "px,0,0px) ";
          this.$rowElements[this.rowCounter][i].style.opacity = "";
        } else {
          //keep element offscreen if we have no width yet
          this.$rowElements[this.rowCounter][i].style[this.transformStyle] = "translate3d("+ this.transformLimit +" +px,0,0px)";
        }

        if (currX > this.transformLimit) {
          if (this.limitTransforms) {
            break;
          }
        } else {
          currX += Math.round(this.elementWidths[i] + this.MARGIN_WIDTH);
          
        }
      }
    }; 
  
    this.setSelectedElement = function (index) {
      this.currSelection = index;
    }.bind(this);   

    
    this.fadeSelected = function () {
      this.$rowElements[this.currSelection].style.opacity = "0.5";

    };
    
    this.unfadeSelected = function () {
      this.$rowElements[this.currSelection].style.opacity = "0.99";

    };
    
    this.shrinkSelected = function () {
      this.setRightItemPositions(this.currSelection, 0);
      this.setLeftItemPositions(this.currSelection - 1, 0 - this.MARGIN_WIDTH);
    };   
   

  }

  exports.SpringboardShovelerView = SpringboardShovelerView;
}(window));

/* Shoveler View
 *
 * Handles the "shoveler" which is a right-to-left carousel view with endpoints on both sides
 *
 */

(function(exports) {
  "use strict";

  var SHOVELER_ROW_ITEM_SELECTED = "browse-shoveler-rowitem-selected";


  function BrowseShovelerView() {


    Events.call(this, ['loadComplete', 'giveMeData', 'exit', 'up', 'down', 'startScroll', 'indexChange', 'stopScroll', 'select', 'bounce', 'back']);


    this.currSelection = 0;
    this.elementWidths = [];
    this.isScrolling = false;
    this.currScrollDirection = null;
    this.loadingImages = 0;
    this.jjj = 4;
    this.globalRows = null;
    this.last = 0;
    this.$el = null;
    this.$rowElements = [];
    this.rowsData = null;
    //this.rowIndex = 0;
    this.rowCounter = 0;
    this.firstPass = 0;
    this.lastUpperRowPos = [];
    this.lastLowerRowPos = [];
    this.currY = 0;
    this.lastView = null;
    this.MARGIN_WIDTH = 30;
    this.kkk = 0;
    var pos = -420;
    this.pos = [];
    this.currSelec = [];

    this.DEFAULT_IMAGE = "assets/l1.jpg";

    this.transformStyle = fireUtils.vendorPrefix('Transform');

    this.fadeOut = function() {
      this.$el.css("opacity", "0");
    };

    this.Ypos = function(ypos) {
      this.currY = ypos;
    };

    this.fadeIn = function() {
      this.$el.css("opacity", "");
    };

    this.highLight = function(index) {

      $(".fixedFocusBorder").css({

        '-webkit-transform': 'translate3d('+pos+'px, 0px, 0px)',
        'width': '398px',
        'height': '224px',
        'top':'245px'

      });
    };

    this.transitionDown = function() {
      this.currY -= 442;
      this.parentEle[0].style[this.transformStyle] = "translate3d( 0px," + this.currY + "px,0px)";

    };

    this.transitionUp = function() {
      this.currY += 442;
      this.parentEle[0].style[this.transformStyle] = "translate3d( 0px," + this.currY + "px,0px)";

    };

    this.decrementRow = function() {
      this.rowCounter -= 1;

    };

    this.incrementRow = function() {
      this.rowCounter += 1;
    };

    this.unHighLight = function() {

      //$(this.$rowElements[this.rowCounter][this.currSelection]).css("z-index", "");
      //$(this.$rowElements[this.rowCounter][this.currSelection]).children().removeClass("focusBorder");
      //$(".focusBorder").hide(400, "swing");
    };

    this.showExtraData = function(index) {

    };


    this.hideExtraData = function() {

    };


    this.remove = function() {

      this.$el.remove();
    };


    this.hide = function() {
      this.$el.css("opacity", "0");
    };


    this.show = function() {
      this.$el.css("opacity", "");
    };

    this.down = function() {

      if (this.rowCounter >= this.finalNumOfRows - 2) {
        return;
      }

      this.pos[this.rowCounter] = pos;
      this.currSelec[this.rowCounter] = this.currSelection;
      this.transitionDown();
      this.rowCounter += 1;
      this.currSelection = this.currSelec[this.rowCounter] || 0;
      if(this.pos[this.rowCounter] !== null  && this.pos[this.rowCounter] !== undefined){
          pos = this.pos[this.rowCounter];
      }
      else{
          pos = -420;
      }

      $(".fixedFocusBorder").css({

         '-webkit-transform': 'translate3d('+pos+'px, 0px, 0px)'

       });

    };

    this.up = function(eventKeycode) {

      if (this.rowCounter === 0) {
        this.trigger('bounce', eventKeycode);
        return;
      }

      this.pos[this.rowCounter] = pos;
      this.currSelec[this.rowCounter] = this.currSelection;
      this.transitionUp();
      this.rowCounter -= 1;
      this.currSelection = this.currSelec[this.rowCounter] ;
      pos = this.pos[this.rowCounter] ;

      $(".fixedFocusBorder").css({

         '-webkit-transform': 'translate3d('+pos+'px, 0px, 0px)'

       });

    };


    this.handleContentItemSelection = function(e) {
      var targetIndex = $(e.target).parent().index();

      if (targetIndex === this.currSelection) {
        this.trigger('select', this.currSelection);
      } else {
        //set current selected item
        this.setSelectedElement(targetIndex);

        this.transitionRow();

        this.trigger("stopScroll", this.currSelection);
      }
    }.bind(this);

    this.render = function(el, rowData) {
      var ttt;

      this.rowData = rowData;

      this.parentContainer = el;

      var html = fireUtils.buildTemplate($("#browse-shoveler-template"), {
        row: this.rowData
      });

      this.parentEle = el;

      el.append(html);

      //this.rowsData = row.items;

      this.$el = el.children().last().children('#browse-shoveler-view');

      this.$rowElements[this.rowCounter] = this.$el.children('div');

      ttt = $(this.parentEle).children(".browseShovelerParent")[this.rowCounter];
      $(ttt).children(".browseRowIndex").text(this.currSelection + 1);
      $(ttt).children(".browseRowTotal").text("|  " + this.$rowElements[this.rowCounter].length);

      this.initialLayout();

    };


    this.initialLayout = function() {

      var num;
      this.transformLimit = this.$el.width() + 300;

      this.limitTransforms = false;

      for (var i = 0; i < this.$rowElements[this.rowCounter].length; i++) {

        var $currElt = $(this.$rowElements[this.rowCounter][i]);
        var $currImage = $currElt.children("img.browse-shoveler-full-img");

        if ($currImage.length === 0) {

          if (this.rowData[i].image !== null && this.rowData[i].image !== undefined) {
            $currElt.prepend('<img class = "browse-shoveler-full-img" src="' + this.rowData[i].image.styles.medium + '" style="opacity:0"/>');
          } else {
            $currElt.prepend('<img class = "browse-shoveler-full-img" src="assets/BT_placeholder.png" style="opacity:0"/>');
          }

          if (this.rowData[i].duration !== null && this.rowData[i].duration !== undefined && this.rowData[i].duration > 0) {
            $currElt.append('<div class="browseDuration">' + this.rowData[i].fliTime + '</div>');
            $currElt.append('<div class="browseShovelerMovieTitle">' + this.rowData[i].label + '</div>');
            //$currElt.find(".browseDuration").css('opacity', '1');
          }
          $currImage = $currElt.children("img.browse-shoveler-full-img");
        }

        //set a callback to make sure all images are loaded
        this.createImageLoadHandlers($currElt, $currImage, i);

        this.loadingImages++;

      }
    };

    this.createImageLoadHandlers = function($elt, $currImage, index) {
      $currImage.on("load", this.imageLoadHandler($elt, this.rowData[index]));

      $currImage.on("error", this.imageLoadErrorHandler(this.rowData[index]));
    }.bind(this);

    this.imageLoadHandler = function($elt, itemType) {
      return function() {
        // if (itemType === "subcategory") {

        //   $elt.append('<div class = "shoveler-subcat-bg"></div>');
        // }
        $elt.children("img.browse-shoveler-full-img")[0].style.opacity = "";
        this.relayoutOnLoadedImages();
      }.bind(this);
    };

    this.imageLoadErrorHandler = function(itemType) {
      return function(event) {
        var $elt = $(event.currentTarget).parent();
        $elt.children("img.browse-shoveler-full-img").remove();
        $elt.prepend('<img class = "browse-shoveler-full-img" src="' + this.DEFAULT_IMAGE + '" style="opacity:0"/>');
        var $currImage = $elt.children("img.browse-shoveler-full-img");
        $currImage.on("load", this.imageLoadHandler($elt, itemType));
        errorHandler.writeToConsole(ErrorTypes.IMAGE_LOAD_ERROR, ErrorTypes.IMAGE_LOAD_ERROR.errorToDev, errorHandler.genStack());
      }.bind(this);
    }.bind(this);

    this.relayoutOnLoadedImages = function() {
      if (--this.loadingImages === 0) {
        this.layoutElements();

        this.finalizeSelection(0);
      }
    };


    this.layoutElements = function() {

      for (var i = 0; i < this.$rowElements[this.rowCounter].length; i++) {
        var $currElt = $(this.$rowElements[this.rowCounter][i]);
        this.elementWidths[i] = $currElt.width();

        if ($currElt.children("img.browse-shoveler-full-img").length > 0) {
          $currElt.children("img.browse-shoveler-full-img")[0].style.opacity = "";

        }
      }

      this.setTransforms(0);

      window.setTimeout(function() {
        this.$rowElements[this.rowCounter].css("transition", "");
        this.limitTransforms = true;
        this.finalizeRender();
      }.bind(this), 500);
    };

    this.finalizeSelection = function(currSelection) {

      //$(this.$rowElements[this.rowCounter][currSelection]).addClass(SHOVELER_ROW_ITEM_SELECTED);

      //$(this.$rowElements[this.rowCounter][currSelection]).css("z-index", "100");

      if (this.kkk < 2) {
        this.kkk += 1;
        this.rowCounter += 1;
        this.trigger('giveMeData');
        return;
      }

      this.rowCounter = 0;
      this.finalNumOfRows = this.parentEle.children().length;
      this.selectARow(0);
      var ninos = $(".innerLargeBrowseContainer").children(".browseShovelerParent");
      $(ninos[0]).find(".browseRowTitle").text("Newest Dailies");
      $(ninos[1]).find(".browseRowTitle").text("Newest Programs");
      $(ninos[2]).find(".browseRowTitle").text("Newest Studies");

    }.bind(this);


    this.finalizeRender = function() {
      this.$el.css('opacity', '');
      this.trigger('loadComplete');

    };


    this.shovelMove = function(dir) {
      this.trigger("startScroll", dir);
      this.selectRowElement(dir);
    }.bind(this);


    this.handleControls = function(e) {

      if (e.type === 'buttonpress') {
        switch (e.keyCode) {
          case buttons.SELECT:
          case buttons.PLAY_PAUSE:

            this.trigger('select', this.rowCounter, this.currSelection);
            break;

          case buttons.BACK:
            this.trigger("exit");
            break;

          case buttons.UP:

            this.trigger("up", e.keyCode);

            break;

          case buttons.DOWN:

            this.trigger("down");

            break;

          case buttons.LEFT:
            if (this.currSelection !== 0) {
              this.shovelMove(-1);
            } else {

              if (this.rowCounter === 0) {

              }
            }

            break;

          case buttons.RIGHT:

            if (this.currSelection < this.$rowElements[this.rowCounter].length) {

              this.shovelMove(1);
            } else {
              // this.trigger('bounce', e.keyCode);
            }
            break;
        }
      } else if (e.type === 'buttonrepeat') {
        switch (e.keyCode) {
          case buttons.LEFT:
            this.selectRowElement(-1);
            break;

          case buttons.RIGHT:
            this.selectRowElement(1);
            break;
          case buttons.UP:
            this.up();
            break;
          case buttons.DOWN:
            this.down();
            break;
        }
      } else if (e.type === 'buttonrelease') {
        switch (e.keyCode) {
          case buttons.LEFT:
          case buttons.RIGHT:
            this.trigger("stopScroll", this.currSelection);


            break;
        }
      }
    }.bind(this);


    this.prepareSelectionForAnimation = function() {


    }.bind(this);

    this.selectARow = function(index) {

      this.$el = this.parentEle.children('.browseShovelerParent');
      this.$rowElements[index] = $(this.$el[index]).children().children('div');

    }.bind(this);


    this.selectRowElement = function(direction) {
      var ttt;
      if ((direction > 0 && (this.$rowElements[this.rowCounter].length - 1) === this.currSelection) ||
        (direction < 0 && this.currSelection === 0)) {
          console.log('false');
        return false;

      }

      this.currSelection += direction;
      ttt = $(this.parentEle).children(".browseShovelerParent")[this.rowCounter];
      $(ttt).children(".browseRowIndex").text(this.currSelection + 1);

      if (this.currSelection < this.$rowElements[this.rowCounter].length - 3) {
        console.log('normal');
        this.transitionRow();
        pos = -420;
        $(".fixedFocusBorder").css({

          '-webkit-transform': 'translate3d('+pos+'px, 0px, 0px)'

        });
        ttt = $(this.parentEle).children(".browseShovelerParent")[this.rowCounter];
        $(ttt).children(".browseShovelerRight").css('opacity', '0.3');
      } else {

        if(direction > 0){
          console.log('greater');
          pos+=428;
          $(".fixedFocusBorder").css({

            '-webkit-transform': 'translate3d('+pos+'px, 0px, 0px)'

          });
            //this.pos[this.rowCounter] = pos;

        }
        else if (direction < 0){
          console.log("less than");
            pos-=428;
          $(".fixedFocusBorder").css({

            '-webkit-transform': 'translate3d('+pos+'px, 0px, 0px)'

          });
            //this.pos[this.rowCounter] = pos;
        }

        ttt = $(this.parentEle).children(".browseShovelerParent")[this.rowCounter];
        $(ttt).children(".browseShovelerRight").css('opacity', '0');
      }

      if (this.currSelection > 0) {
        ttt = $(this.parentEle).children(".browseShovelerParent")[this.rowCounter];
        $(ttt).children(".browseShovelerLeft").css('opacity', '0.3');
      } else {
        ttt = $(this.parentEle).children(".browseShovelerParent")[this.rowCounter];
        $(ttt).children(".browseShovelerLeft").css('opacity', '0');
      }



    }.bind(this);

    this.transitionRow = function(theEnd) {
      window.requestAnimationFrame(function() {
        this.setTransforms(this.currSelection);
      }.bind(this));

      this.trigger('indexChange', this.currSelection);
    }.bind(this);

    this.setTransforms = function(selected) {

      var currX = 0;
      this.manageSelectedElement(this.$rowElements[this.rowCounter][selected]);
      selected = selected || this.currSelection;
      this.setLeftItemPositions(selected - 1, currX);
      currX = Math.round(this.elementWidths[selected] + this.MARGIN_WIDTH);
      this.setRightItemPositions(selected + 1, currX);

    }.bind(this);

    this.manageSelectedElement = function(selectedEle) {

      selectedEle.style[this.transformStyle] = "translate3d(0, 0, 0)";
      selectedEle.style.opacity = "0.99";

    };

    this.setLeftItemPositions = function(start, currX) {
      var i;

      for (i = start; i >= 0; i--) {
        var currPosition = (currX - this.elementWidths[i] - this.MARGIN_WIDTH);

        var itemTrans = "translate3d(" + currPosition + "px,0, 0px) ";

        if (this.elementWidths[i] > 0) {
          this.$rowElements[this.rowCounter][i].style[this.transformStyle] = itemTrans;
          this.$rowElements[this.rowCounter][i].style.opacity = "";

        } else {
          //keep element offscreen if we have no width yet
          this.$rowElements[this.rowCounter][i].style[this.transformStyle] = "translate3d(" + (-this.transformLimit) + "px,0,0px)";
          this.$rowElements[this.rowCounter][i].style.display = "none";

        }

        if (currX < -this.transformLimit + 1000) {
          if (this.limitTransforms) {
            break;
          }
        } else {
          currX -= Math.round(this.elementWidths[i] + this.MARGIN_WIDTH);

        }
      }
    };

    this.setRightItemPositions = function(start, currX) {
      var i;

      for (i = start; i < this.$rowElements[this.rowCounter].length; i++) {
        if (this.elementWidths[i] > 0) {
          this.$rowElements[this.rowCounter][i].style[this.transformStyle] = "translate3d(" + (currX) + "px,0,0px) ";
          this.$rowElements[this.rowCounter][i].style.opacity = "";
        } else {
          //keep element offscreen if we have no width yet
          this.$rowElements[this.rowCounter][i].style[this.transformStyle] = "translate3d(" + this.transformLimit + " +px,0,0px)";
        }

        if (currX > this.transformLimit) {
          if (this.limitTransforms) {
            break;
          }
        } else {
          currX += Math.round(this.elementWidths[i] + this.MARGIN_WIDTH);

        }
      }
    };

    this.setSelectedElement = function(index) {
      this.currSelection = index;
    }.bind(this);


    this.fadeSelected = function() {
      this.$rowElements[this.currSelection].style.opacity = "0.5";

    };

    this.unfadeSelected = function() {
      this.$rowElements[this.currSelection].style.opacity = "0.99";

    };

    this.shrinkSelected = function() {
      this.setRightItemPositions(this.currSelection, 0);
      this.setLeftItemPositions(this.currSelection - 1, 0 - this.MARGIN_WIDTH);
    };


  }

  exports.BrowseShovelerView = BrowseShovelerView;
}(window));

/* Shoveler View
 *
 * Handles the "shoveler" which is a right-to-left carousel view with endpoints on both sides
 *
 */

(function (exports) {
  "use strict";

  var SHOVELER_ROW_ITEM_SELECTED = "shoveler-rowitem-selected";

 
  function ShovelerView() {
   

    Events.call(this, ['loadComplete', 'giveMeData', 'exit', 'up', 'down','startScroll', 'indexChange', 'stopScroll', 'select', 'bounce', 'back']);

    
    this.currSelection = 0;
    this.elementWidths = [];
    this.isScrolling = false;
    this.currScrollDirection = null;
    this.loadingImages = 0;
    this.jjj = 4;
    this.globalRows=null;
    this.last=0;   
    this.$el = null;
    this.$rowElements = [];
    this.rowsData = null;
    this.rowIndex = 0;
    this.rowCounter = 0;
    this.firstPass = 0;
    this.lastUpperRowPos = [];
    this.lastLowerRowPos = [];
    this.currY = 0;
    this.lastView = null;
    this.MARGIN_WIDTH = 100;

    this.DEFAULT_IMAGE = "assets/l1.jpg";

    this.transformStyle = fireUtils.vendorPrefix('Transform');

    this.fadeOut = function() {
      this.$el.css("opacity", "0");
    };

    this.Ypos = function(ypos){
      this.currY = ypos;
    };

    this.fadeIn = function() {
      this.$el.css("opacity", "");
    };

    this.highLight =function(index){ 
    //this.rowCounter = index;
    //this.currSelection = index;         
         
       $(this.$rowElements[this.rowCounter][this.currSelection ]).css("z-index", "100");
       $(this.$rowElements[this.rowCounter][ this.currSelection]).children('img').addClass("orangeBorder"); 
      
     };

     this.transitionDown = function(){      
      this.currY -=695;    
      this.parentEle[0].style[this.transformStyle] = "translate3d( 0px,"+this.currY+"px,0px)"; 
     
     };

     this.transitionUp = function(){
      this.currY += 695;    
      this.parentEle[0].style[this.transformStyle] = "translate3d( 0px,"+this.currY+"px,0px)"; 
     
     };

     this.decrementRow = function(){
       this.rowCounter-=1;

     };

     this.incrementRow = function(){
        this.rowCounter+=1;
     };

    this.unHighLight =function(){
     
       $(this.$rowElements[this.rowCounter][this.currSelection]).css("z-index", "");  
       $(this.$rowElements[this.rowCounter][this.currSelection]).children().removeClass("orangeBorder");
           
    };

    this.showExtraData = function (index) {
      
  };

  
    this.hideExtraData = function () {
       
    };

    
    this.remove = function () {
      
      this.$el.remove();
    };

    
    this.hide = function () {
      this.$el.css("opacity", "0");
    };

   
    this.show = function () {
      this.$el.css("opacity", "");
    };

    this.down = function(){

      if(this.rowCounter >= this.finalNumOfRows-2 ){              
              return;
        }          

      var thisDownIndex = this.lastUpperRowPos[this.rowCounter+1] = this.currSelection;          
      this.currSelection = this.lastLowerRowPos[this.rowCounter] || 0;          
      $(this.$rowElements[this.rowCounter][thisDownIndex]).css("z-index", "");  
      $(this.$rowElements[this.rowCounter][thisDownIndex]).children('.shoveler-full-img').removeClass("orangeBorder");      
      this.transitionDown();
      this.rowCounter+=1;
      this.selectARow(this.rowCounter);
      var mmm = this.lastLowerRowPos[this.rowCounter-1] || 0 ;           
      $(this.$rowElements[this.rowCounter][mmm ]).css("z-index", "100");
      $(this.$rowElements[this.rowCounter][ mmm]).children('.shoveler-full-img').addClass("orangeBorder");   

    };

    this.up = function(eventKeycode){

      if(this.rowCounter  === 0){
          this.trigger('bounce',eventKeycode);
          return;
        }
        
      var thisUpIndex = this.lastLowerRowPos[this.rowCounter-1] = this.currSelection;         
      this.currSelection = this.lastUpperRowPos[this.rowCounter] || 0;
      $(this.$rowElements[this.rowCounter][thisUpIndex]).css("z-index", "");  
      $(this.$rowElements[this.rowCounter][thisUpIndex]).children('.shoveler-full-img').removeClass("orangeBorder");
      this.transitionUp();
      this.rowCounter-=1;
      this.selectARow(this.rowCounter);
      var mmm = this.lastUpperRowPos[this.rowCounter+1] || 0;            
      $(this.$rowElements[this.rowCounter][mmm ]).css("z-index", "100");
      $(this.$rowElements[this.rowCounter][ mmm]).children('.shoveler-full-img').addClass("orangeBorder"); 

    };

    
    this.handleContentItemSelection = function(e) {
      var targetIndex = $(e.target).parent().index();

      if(targetIndex === this.currSelection) {
        this.trigger('select', this.currSelection);
      } else {
        //set current selected item
        this.setSelectedElement(targetIndex);

        this.transitionRow();

        this.trigger("stopScroll", this.currSelection);
      }
    }.bind(this);
    
    this.render = function (el, row) {
      var ttt;
     
      this.parentContainer = el; 

      if(app.springboard || app.autoplay){
        this.myrow=row;
        if(this.myrow.number ==="four"){
           this.myrow.rowtitle = "YOU MIGHT ALSO LIKE";
        }
       
      } 
      else{
         this.myrow =row;
        if(this.myrow.number ==="four"){
           this.myrow.rowtitle = "Continue Watching";
         }
       
      }    
      
      var html = fireUtils.buildTemplate($("#shoveler-template"), {
        row: this.myrow
      });  
       
      this.parentEle = el;           
       
      el.append(html);     

      this.rowsData = row.items;      

      this.$el = el.children().last().children('#shoveler-view');

      this.$rowElements[this.rowCounter] = this.$el.children('div');

      ttt = $(this.parentEle).children(".shovelerParent")[this.rowCounter];
      $(ttt).children(".rowIndex").text(this.currSelection+1);
      $(ttt).children(".rowTotal").text("|  "+this.$rowElements[this.rowCounter].length);

      this.initialLayout();
      
    };

   
    this.initialLayout = function () {
     
      this.transformLimit = this.$el.width() + 300;
            
      this.limitTransforms = false;

      for (var i = 0; i < this.$rowElements[this.rowCounter].length; i++) {
        var $currElt = $(this.$rowElements[this.rowCounter][i]);

        var $currImage = $currElt.children("img.shoveler-full-img");
        if ($currImage.length === 0) {
          $currElt.prepend('<img class = "shoveler-full-img" src="'+ this.rowsData[i].hdbackgroundimageurl + '" style="opacity:0"/>');
          $currElt.append('<div class="shovelerMovieTitle">'+this.rowsData[i].movieTitle+'</div>');
          $currElt.append('<div class="shovelerMovieStars"></div>');
          $currImage = $currElt.children("img.shoveler-full-img");
        }

        //set a callback to make sure all images are loaded
        this.createImageLoadHandlers($currElt, $currImage, i);

        this.loadingImages++;
      }
    };

    this.createImageLoadHandlers = function($elt, $currImage, index) {
      $currImage.on("load", this.imageLoadHandler($elt, this.rowsData[index].type));
      
      $currImage.on("error", this.imageLoadErrorHandler(this.rowsData[index].type));
    }.bind(this);

    this.imageLoadHandler = function($elt, itemType) {
      return function () {
        if (itemType === "subcategory") {
         
          $elt.append('<div class = "shoveler-subcat-bg"></div>');
        }
        $elt.children("img.shoveler-full-img")[0].style.opacity = "";
        this.relayoutOnLoadedImages();
      }.bind(this);
    };

    this.imageLoadErrorHandler = function(itemType) {
      return function (event) {
        var $elt = $(event.currentTarget).parent();
        $elt.children("img.shoveler-full-img").remove();
        $elt.prepend('<img class = "shoveler-full-img" src="'+ this.DEFAULT_IMAGE + '" style="opacity:0"/>');
        var $currImage = $elt.children("img.shoveler-full-img");
        $currImage.on("load", this.imageLoadHandler($elt, itemType));
        errorHandler.writeToConsole(ErrorTypes.IMAGE_LOAD_ERROR, ErrorTypes.IMAGE_LOAD_ERROR.errorToDev,  errorHandler.genStack());
      }.bind(this);
    }.bind(this);

    
    this.layoutElements = function () {

      for (var i = 0; i < this.$rowElements[this.rowCounter].length; i++) {
        var $currElt = $(this.$rowElements[this.rowCounter][i]);
        this.elementWidths[i] = $currElt.width();

        if ($currElt.children("img.shoveler-full-img").length > 0) {
          $currElt.children("img.shoveler-full-img")[0].style.opacity = "";

        }
      }

      this.setTransforms(0);

      window.setTimeout(function() {
        this.$rowElements[this.rowCounter].css("transition", "");
        this.limitTransforms = true;
        this.finalizeRender();
      }.bind(this), 500);
    };

    
    this.finalizeRender = function () {
      this.$el.css('opacity', '');
      this.trigger('loadComplete');

    };

    
    this.relayoutOnLoadedImages = function () {
      if (--this.loadingImages === 0) {
        this.layoutElements();
        
        this.finalizeSelection(0);
      }
    };

    
    this.shovelMove = function (dir) {
      this.trigger("startScroll", dir);
      this.selectRowElement(dir);
    }.bind(this);

    
    this.handleControls = function (e) {

      if (e.type === 'buttonpress') {
        switch (e.keyCode) {
          case buttons.SELECT:
          case buttons.PLAY_PAUSE:
           
            this.trigger('select', this.rowCounter, this.currSelection);
            break;

          case buttons.BACK:
            this.trigger("back");
            break;

          case buttons.UP:

            this.trigger("up", e.keyCode);        

            break;

          case buttons.DOWN: 

            this.trigger("down");                 

            break;

          case buttons.LEFT:
            if(this.currSelection !== 0) {
              this.shovelMove(-1);
            } else {

              if(this.rowCounter === 0){
            
          }
            }

            break;       

          case buttons.RIGHT:
         
            if(this.currSelection < this.rowsData.length) {

              this.shovelMove(1);
            } else {
              this.trigger('bounce', e.keyCode);
            }
            break;
        }
      } else if (e.type === 'buttonrepeat') {
        switch (e.keyCode) {
          case buttons.LEFT:
              this.selectRowElement(-1);
            break;

          case buttons.RIGHT:
              this.selectRowElement(1);
            break;
          case buttons.UP:
              this.up();
            break;
          case buttons.DOWN:
              this.down();
            break;
        }
      } else if (e.type === 'buttonrelease') {
        switch (e.keyCode) {
          case buttons.LEFT:
          case buttons.RIGHT:
              this.trigger("stopScroll", this.currSelection);


            break;
        }
      }
    }.bind(this);

    
    this.prepareSelectionForAnimation = function() {
      
      $(this.$rowElements[this.currSelection]).removeClass(SHOVELER_ROW_ITEM_SELECTED);
      $(this.$rowElements[this.currSelection]).css("z-index", "");
    }.bind(this);

    this.selectARow = function(index){
      
       this.$el =  this.parentEle.children('.shovelerParent') ;       
       this.$rowElements[index] = $(this.$el[index]).children().children('div');      
         
    }.bind(this);

    
    this.finalizeSelection = function(currSelection) {     
      
      $(this.$rowElements[this.rowCounter][currSelection]).addClass(SHOVELER_ROW_ITEM_SELECTED);
     
      $(this.$rowElements[this.rowCounter][currSelection]).css("z-index", "100"); 


          if(!app.springboard || !app.autoplay){
            if (this.jjj < 7){
              this.jjj+=1;        
              this.rowCounter+=1;

              this.trigger('giveMeData', this.jjj);            
                       
              return;
            }
           }
      app.springboard = 0;
      app.autoplay = 0;
      this.rowCounter = 0;
      this.finalNumOfRows = this.parentEle.children().length;      
      this.selectARow(0);     
      this.trigger('loadComplete');
      
    }.bind(this);

    
    this.selectRowElement = function (direction) {       
      var ttt;
      if ((direction > 0 && (this.$rowElements[this.rowCounter].length -1 ) === this.currSelection) ||
          (direction < 0 && this.currSelection === 0 )) {

            return false;
          
          }
         
        $(this.$rowElements[this.rowCounter][this.currSelection]).css("z-index", "");  
        $(this.$rowElements[this.rowCounter][this.currSelection]).children('.shoveler-full-img').removeClass("orangeBorder");    
        this.currSelection += direction;
        $(this.$rowElements[this.rowCounter][this.currSelection]).css("z-index", "100");
        $(this.$rowElements[this.rowCounter][this.currSelection]).children('.shoveler-full-img').addClass("orangeBorder");
        ttt = $(this.parentEle).children(".shovelerParent")[this.rowCounter];
        $(ttt).children(".rowIndex").text(this.currSelection+1);
     
        if (this.currSelection < this.$rowElements[this.rowCounter].length -4){
          this.transitionRow();
          ttt = $(this.parentEle).children(".shovelerParent")[this.rowCounter];
          $(ttt).children(".shovelerRight").css('opacity','1' );
        }
        else{
          ttt = $(this.parentEle).children(".shovelerParent")[this.rowCounter];
          $(ttt).children(".shovelerRight").css('opacity','0' );
        }
        
        if(this.currSelection > 0){
          ttt = $(this.parentEle).children(".shovelerParent")[this.rowCounter];
          $(ttt).children(".shovelerLeft").css('opacity','1' );
        }
        else{
          ttt = $(this.parentEle).children(".shovelerParent")[this.rowCounter];
          $(ttt).children(".shovelerLeft").css('opacity','0' );
        }
        
       

    }.bind(this);

    this.transitionRow = function(theEnd) {
      window.requestAnimationFrame(function(){
        this.setTransforms(this.currSelection);
      }.bind(this));

        this.trigger('indexChange', this.currSelection);
      }.bind(this);

     this.setTransforms = function (selected) {
        
        var currX = 0;
        this.manageSelectedElement(this.$rowElements[this.rowCounter][selected]);     
        selected = selected || this.currSelection; 
        this.setLeftItemPositions(selected - 1, currX);
        currX = Math.round(this.elementWidths[selected] + 20);       
        this.setRightItemPositions(selected+ 1 , currX);
 
    }.bind(this); 

    this.manageSelectedElement = function (selectedEle) {
      
      selectedEle.style[this.transformStyle] = "translate3d(0, 0, 0)";      
      selectedEle.style.opacity = "0.99";

    }; 

    this.setLeftItemPositions = function (start, currX) {
      var i;
       
      for (i = start; i >= 0; i--) {
        var currPosition = (currX - this.elementWidths[i]-20);
       
        var itemTrans = "translate3d(" + currPosition + "px,0, 0px) ";

        if (this.elementWidths[i] > 0) {
          this.$rowElements[this.rowCounter][i].style[this.transformStyle] = itemTrans;
          this.$rowElements[this.rowCounter][i].style.opacity = "";

        } else {
          //keep element offscreen if we have no width yet
          this.$rowElements[this.rowCounter][i].style[this.transformStyle] = "translate3d("+ (-this.transformLimit) + "px,0,0px)";
          this.$rowElements[this.rowCounter][i].style.display = "none";

        }

        if (currX < -this.transformLimit + 1000) {
          if (this.limitTransforms) {
            break;
          }
        } else {
          currX -= Math.round(this.elementWidths[i] * 0.75 + this.MARGIN_WIDTH);
          
      }
    }
    };

    this.setRightItemPositions = function (start, currX) {
      var i;
      
      for (i = start; i < this.$rowElements[this.rowCounter].length; i++) {
        if (this.elementWidths[i] > 0) {
          this.$rowElements[this.rowCounter][i].style[this.transformStyle] = "translate3d(" + (currX+10) + "px,0,0px) ";
          this.$rowElements[this.rowCounter][i].style.opacity = "";
        } else {
          //keep element offscreen if we have no width yet
          this.$rowElements[this.rowCounter][i].style[this.transformStyle] = "translate3d("+ this.transformLimit +" +px,0,0px)";
        }

        if (currX > this.transformLimit) {
          if (this.limitTransforms) {
            break;
          }
        } else {
          currX += Math.round(this.elementWidths[i] * 0.75 + this.MARGIN_WIDTH);
          
        }
      }
    }; 
  
    this.setSelectedElement = function (index) {
      this.currSelection = index;
    }.bind(this);   

    
    this.fadeSelected = function () {
      this.$rowElements[this.currSelection].style.opacity = "0.5";

    };
    
    this.unfadeSelected = function () {
      this.$rowElements[this.currSelection].style.opacity = "0.99";

    };
    
    this.shrinkSelected = function () {
      this.setRightItemPositions(this.currSelection, 0);
      this.setLeftItemPositions(this.currSelection - 1, 0 - this.MARGIN_WIDTH);
    };   
   

  }

  exports.ShovelerView = ShovelerView;
}(window));

/* Model
 *
 * Model for JSON data
 */

(function (exports) {
  "use strict";

  function JSONMediaModel(appSettings) {

    Events.call(this, ['error']);

    this.beyondTodayDaily = [];
    this.beyondTodayTV = [];
    this.bibleStudy = [];
    this.currData = {};
    this.currentCategory = 0;
    this.currentItem     = 0;
    this.defaultTheme    = "default";
    this.currentlySearchData = false;
    this.featuredIds = [];
    this.finalFeaturedData = [];
    this.featuredUrl = 'http://www.ucg.org/api/v1.0/media/';
    this.gaUrl = "http://www.google-analytics.com/collect?";


    //timeout default to 1 min
    this.TIMEOUT = 60000;

    this.loadInitialData = function (dataLoadedCallback) {
      var requestData = {
        url: appSettings.dataURL,
        type: 'GET',
        crossDomain: true,
        dataType: 'json',
        context : this,
        cache : true,
        timeout: this.TIMEOUT,
        success : function() {
          var contentData = arguments[0];
          this.handleJsonData(contentData);
          dataLoadedCallback();
        }.bind(this),
        error : function(jqXHR, textStatus) {
          // Data feed error is passed to model's parent (app.js) to handle
          if (jqXHR.status === 0) {
            this.trigger("error", ErrorTypes.INITIAL_NETWORK_ERROR, errorHandler.genStack());
            return;
          }
          switch (textStatus) {
          case "timeout" :
            this.trigger("error", ErrorTypes.INITIAL_FEED_TIMEOUT, errorHandler.genStack());
            break;
          case "parsererror" :
            this.trigger("error", ErrorTypes.INITIAL_PARSING_ERROR, errorHandler.genStack());
            break;
          default:
            this.trigger("error", ErrorTypes.INITIAL_FEED_ERROR, errorHandler.genStack());
            break;
          }
        }.bind(this)
      };
      fireUtils.ajaxWithRetry(requestData);
    }.bind(this);

    this.postData = function (postUrl) {
      this.gaUrl += postUrl;

      var postData = {
        url: this.gaUrl,
        type: 'POST',
        crossDomain: true,      
        context : this,
        cache : true,
        timeout: this.TIMEOUT,
        success : function() {
          var postReturnData = arguments[0];
        }.bind(this),
        error : function(jqXHR, textStatus) {
          // Data feed error is passed to model's parent (app.js) to handle
          if (jqXHR.status === 0) {
            this.trigger("error", ErrorTypes.INITIAL_NETWORK_ERROR, errorHandler.genStack());
            return;
          }
          switch (textStatus) {
          case "timeout" :
            this.trigger("error", ErrorTypes.INITIAL_FEED_TIMEOUT, errorHandler.genStack());
            break;
          case "parsererror" :
            this.trigger("error", ErrorTypes.INITIAL_PARSING_ERROR, errorHandler.genStack());
            break;
          default:
            this.trigger("error", ErrorTypes.INITIAL_FEED_ERROR, errorHandler.genStack());
            break;
          }
        }.bind(this)
      };
      fireUtils.ajaxWithRetry(postData);
    }.bind(this);

    this.handleJsonData = function (beyondData) {

      this.categoryData = [];
      this.currentCategory = 0;
      this.beyondData = beyondData;

    }.bind(this);

    this.getFeaturedUrl = function(successCallback){

      var requestData = {
        url: 'http://www.ucg.org/api/v1.0/featured_media',
        type: 'GET',
        crossDomain: true,
        dataType: 'json',
        context : this,
        cache : true,
        timeout: this.TIMEOUT,
        success : function() {
          var featuredItems = arguments[0];

          for (var ttt in featuredItems.data){

            this.featuredUrl += featuredItems.data[ttt].id + ',';
          }
          this.featuredUrl = this.featuredUrl.substring(0, this.featuredUrl.length - 1);
          this.getFeaturedData(this.featuredUrl,successCallback);
        }.bind(this),
        error : function(jqXHR, textStatus) {
          // Data feed error is passed to model's parent (app.js) to handle
          if (jqXHR.status === 0) {
            this.trigger("error", ErrorTypes.INITIAL_NETWORK_ERROR, errorHandler.genStack());
            return;
          }
          switch (textStatus) {
          case "timeout" :
            this.trigger("error", ErrorTypes.INITIAL_FEED_TIMEOUT, errorHandler.genStack());
            break;
          case "parsererror" :
            this.trigger("error", ErrorTypes.INITIAL_PARSING_ERROR, errorHandler.genStack());
            break;
          default:
            this.trigger("error", ErrorTypes.INITIAL_FEED_ERROR, errorHandler.genStack());
            break;
          }
        }.bind(this)
      };

      fireUtils.ajaxWithRetry(requestData);

    };

    this.getFeaturedData = function(finalUrl, successCallback){

            var requestData = {
              url: finalUrl,
              type: 'GET',
              crossDomain: true,
              dataType: 'json',
              context : this,
              cache : true,
              timeout: this.TIMEOUT,
              success : function() {
                this.finalFeaturedData.push(arguments[0]);
                successCallback(this.finalFeaturedData);
              }.bind(this),
              error : function(jqXHR, textStatus) {
                // Data feed error is passed to model's parent (app.js) to handle
                if (jqXHR.status === 0) {
                  this.trigger("error", ErrorTypes.INITIAL_NETWORK_ERROR, errorHandler.genStack());
                  return;
                }
                switch (textStatus) {
                case "timeout" :
                  this.trigger("error", ErrorTypes.INITIAL_FEED_TIMEOUT, errorHandler.genStack());
                  break;
                case "parsererror" :
                  this.trigger("error", ErrorTypes.INITIAL_PARSING_ERROR, errorHandler.genStack());
                  break;
                default:
                  this.trigger("error", ErrorTypes.INITIAL_FEED_ERROR, errorHandler.genStack());
                  break;
                }
              }
            };

            fireUtils.ajaxWithRetry(requestData);
            //console.log(this.finalFeaturedData);

    };

    this.browseShovelerData = function(callback){

      this.browseRows = [];

       for(var ttt in this.beyondData.data){
         if(this.beyondData.data[ttt].production !== undefined){

          if(this.beyondData.data[ttt].production.name === "Beyond Today Daily")//208
           {
              this.beyondTodayDaily.push(this.beyondData.data[ttt]);
           }
           if (this.beyondData.data[ttt].production.name === "Beyond Today Television Program")//209
           {
              this.beyondTodayTV.push(this.beyondData.data[ttt]);
           }
           if (this.beyondData.data[ttt].production.name === "Beyond Today Bible Study")//275
           {
              this.bibleStudy.push(this.beyondData.data[ttt]);
           }
         }

       }

       this.browseRows.push(this.beyondTodayDaily);
       this.browseRows.push(this.beyondTodayTV);
       this.browseRows.push(this.bibleStudy);

       for(var kkk in this.browseRows){
          for(var ppp in this.browseRows[kkk]){
            if(this.browseRows[kkk][ppp].duration !== null){
              var newTime = this.convertSecondsToMMSS (this.browseRows[kkk][ppp].duration);
              // var fliTime = {
              //   FLItime:newTime
              // };
              this.browseRows[kkk][ppp].fliTime = newTime;
            }
          }
       }
       callback(this.browseRows);

    };

    this.sortAlphabetically = function (arr) {
      arr.sort();
    };




    this.setCurrentCategory = function (index) {

       this.currentCategory = index;

    };


    this.setCurrentSubCategory = function(data) {
      this.currSubCategory = data;
    };


    this.getCategoryItems = function () {
      return this.categoryData;
    };


    this.getCategoryData = function (container,categoryCallback) {

      this.currData = this.categories[this.currentCategory];
      categoryCallback(container,this.currData);
    };


    this.filterLiveData = function(data) {
      for (var i = 0; i < data.length; i++) {
        if (data[i].type === "video-live") {
          var startTime = new Date(data[i].startTime).getTime();
          var endTime = new Date(data[i].endTime).getTime();
          var currTime = Date.now();
          var isAlwaysLive = data[i].alwaysLive;
          if (currTime < endTime && currTime >= startTime)
          {
            data[i].isLiveNow = true;
          }
          else if (isAlwaysLive) {
            data[i].isLiveNow = true;
          }
          else if (currTime > endTime){
            // remove old broadcasts
            data.splice(i, 1);
            i--;
          }
          else {
            var upcomingTimeSeconds = Math.round((startTime - currTime) / 1000);
            var days = Math.floor( upcomingTimeSeconds / 86400 );
            data[i].isLiveNow = false;
            if (days > 0) {
              data[i].upcomingTime = exports.utils.formatDate(data[i].startTime);
            }
            else {
              data[i].upcomingTime = "Starts in " + this.convertSecondsToHHMM(upcomingTimeSeconds);
            }
          }
        }
      }
      return data;
    };

    this.convertSecondsToMMSS = function(seconds){
        var minutes = Math.floor( seconds / 60 );
        var displaySeconds = seconds - minutes * 60;
        if(displaySeconds < 10){
          return minutes +":0"+ displaySeconds;
        }
        return minutes +":"+ displaySeconds;
    };


    this.convertSecondsToHHMM = function(seconds, alwaysIncludeHours) {
      var hours = Math.floor( seconds / 3600 );
      var minutes = Math.floor( seconds / 60 );

      var finalString = "";

      if (hours > 0 || alwaysIncludeHours) {
        finalString += hours + " hours ";
      }
      if(minutes < 10 && minutes > 0){
        return finalString + ('00:0' + minutes) ;
      }
      else{
        return finalString + ('00:' + minutes) ;
      }

    };


    this.getFullContentsForFolder = function(folder) {
      var i;
      var j;
      var contents = [];
      var currContents = folder.items;

    };


    this.getSubCategoryData = function(subCategoryCallback) {

      var returnData = JSON.parse(JSON.stringify(this.currSubCategory));
      returnData.contents = this.getFullContentsForFolder(this.currSubCategory);

      subCategoryCallback(returnData);
    };


    this.getDataFromSearch = function (searchTerm, searchCallback) {
      this.currData = [];
      for (var i = 0; i < this.mediaData.length; i++) {
        if (this.mediaData[i].title.toLowerCase().indexOf(searchTerm) >= 0 || this.mediaData[i].description.toLowerCase().indexOf(searchTerm) >= 0) {
          //make sure the date is in the correct format
          if(this.mediaData[i].pubDate) {
            this.mediaData[i].pubDate = exports.utils.formatDate(this.mediaData[i].pubDate);
          }
          this.currData.push(this.mediaData[i]);
        }
      }
      searchCallback(this.currData);
    };

    this.setCurrentItem = function (index) {
      this.currentItem = index;
      this.currentItemData = this.currData[index];
    };

    this.getCurrentItemData = function () {
      return this.currentItemData;
    };





  }

  exports.JSONMediaModel = JSONMediaModel;

})(window);

/* Main Application
 *
 * This module initializes the application and handles
 * transition between different views
 *
 */

(function(exports) {
  "use strict";

  function onPause() {
    if (app.playerView) {
      app.playerView.pauseVideo();
    }
  }


  function onResume() {
    if (app.playerView) {
      app.playerView.resumeVideo();
    }
  }


  function onAmazonPlatformReady() {
    document.addEventListener("pause", onPause, false);
    document.addEventListener("resume", onResume, false);
  }

  document.addEventListener("amazonPlatformReady", onAmazonPlatformReady, false);


  function App(settingsParams) {

    this.settingsParams = settingsParams;
    this.showSearch = settingsParams.showSearch;
    this.$appContainer = $("#app-container");
    var signInInited = 0;
    var menuAndgridWrapViewInited = 0;
    var menuAndFeaturedRowViewInited = 0;
    var searchInited = 0;
    var springboardPageInited = 0;
    var registerInited = 0;
    var playerInited = 0;
    this.autoPlayTriggered = 0;
    this.gaUrl = "";
    this.timer =0;

    this.makeInitialDataCall = function() {

      this.data.loadInitialData(this.dataLoaded);

    };


    this.dataLoaded = function() {

      var logo;
      this.$appContainer.empty();

      var html = fireUtils.buildTemplate($("#app-header-template"), {});

      this.$appContainer.append(html);

      this.browse();

      this.gaUrl += "v=1"; // Version.
      this.gaUrl += "&tid=UA-69425418-1"; // Tracking ID / Property ID.
      this.gaUrl += "&cid=555"; // Anonymous Client ID.
      this.gaUrl += "&t=event"; // Event hit type
      this.gaUrl += "&ec=Channel%20Launch"; // Event Category. Required.
      this.gaUrl += "&ea=App%20Launched"; // Event Action. Required.
      this.gaUrl += "&el=Beyond%20Today%20FireTV"; // Event label.
      this.gaUrl += "&z=" + Date.now();
      app.data.postData(this.gaUrl);


    }.bind(this);


    this.selectView = function(view) {
      this.currentView = view;
    };

    this.lastVisibleView = function(lastView) {

      this.lastView = lastView;

    };

    this.exitApp = function() {

      if (!this.settingsParams.tizen) {
        if (confirm("Are you sure you want to exit?")) {
          window.open('', '_self').close();
        }
        buttons.resync();
        return true;
      }
      tizen.application.getCurrentApplication().exit();

      buttons.resync();
    };

    this.exitPlayerView = function() {
      this.loadingSpinner.hide.all();

      clearTimeout(this.liveUpdater);
      if (this.subCategoryView) {
        this.transitionFromPlayerToSubCategory();
      } else {
        this.transitionFromPlayerToOneD();
      }
    };

    this.exitSignIn = function() {

      $("#signinContainer").remove();

      buttons.resync();

      this.selectView(this.landingPageView);

      $("#main_landing_container").show();
    };


    this.handleButton = function(e) {

      if (this.currentView) {
        this.currentView.handleControls(e);
      } else if (e.type === 'buttonpress' && e.keyCode === buttons.BACK) {
        this.exitApp();
      }
    };


    this.checkIfSignIn = function(index) {
      if (index === 0) {
        this.inititializeSignInView();
        this.selectView(this.signinView);
        return true;
      } else {
        return false;
      }
    };

    this.checkIfExit = function(index) {

      if (index === 2) {

        this.exitApp();
        return true;
      } else {

        return false;
      }

    };

    this.browse = function() {

      this.initializeMenuBarView();
      this.initFeaturedRowView();
      this.selectView(this.featuredRowView);
      $(".overlayFade").show();

    };


    this.exitGridWrapView = function() {
      $("#menu-bar").remove();
      $("#gridWrapMainWrap").remove();
      this.browse();
      buttons.resync();

    };

    /***************************
     *
     * List Screen View
     *
     **************************/
    this.initListscreenView = function() {

      var listscreenView = this.listscreenView = new ListscreenView();

      listscreenView.on("loadComplete", function() {

        this.loadingSpinner.hide.all();

      }, this);

      listscreenView.render(this.$appContainer);
    };

    /***************************
     *
     * Series Springboard Shoveler View
     *
     **************************/

    this.initSeriesSpringboardShovelerView = function(container) {

      this.index = 5;

      var seriesSpringboardShovelerView = this.seriesSpringboardShovelerView = new SeriesSpringboardShovelerView();

      seriesSpringboardShovelerView.on('exit', function() {
        this.trigger('exit');
      }, this);

      seriesSpringboardShovelerView.on('giveMeData', function(index) {

        this.seriesSpringboardShovelerView.updateCategory(container, index);
      }, this);

      seriesSpringboardShovelerView.on('back', function() {
        this.springboard = 0;

        if (this.lastView === "browseShovelerView") {

          $('.springboardContainer').remove();
          $(".largeBrowseContainer").show();
          $("#menu-bar").show();
          this.browseShovelerView.highLight();
          this.selectView(this.browseShovelerView);
          buttons.resync();
          return;

        }
        if (this.lastView === "featuredRow") {

          $('.springboardContainer').remove();
          $(".largeBrowseContainer").show();
          $("#menu-bar").show();
          this.featuredRowView.highLight();
          this.selectView(this.featuredRowView);
          buttons.resync();
          return;

        }
        if (this.lastView === "gridwrap") {
          $('.springboardContainer').remove();
          $("#gridWrapMainWrap").show();
          $("#menu-bar").show();
          buttons.resync();
          this.selectView(this.gridWrapView);
          return;
        }



      }, this);

      seriesSpringboardShovelerView.on('select', function(row, index) {
        var rowdatum = app.data.getGridRowData(4 + row);
        this.springboard = 1;
        //$(".largeBrowseContainer").remove();
        //$("#menu-bar").remove();
        $('.springboardContainer').remove();
        this.initSpringboardPageView(rowdatum.items[index]);
        //this.initShovelerView($(".innerSpringboardContainer"));
        this.selectView(this.springboardPageView);
        // this.seriesSpringboardShovelerView.lastView = "browse";
        //this.lastView = "springboard";
      }, this);

      seriesSpringboardShovelerView.on('down', function() {

        this.seriesSpringboardShovelerView.down();

      }, this);

      seriesSpringboardShovelerView.on('up', function() {

        this.seriesSpringboardShovelerView.up();

      }, this);

      seriesSpringboardShovelerView.on('bounce', function() {

        if (this.seriesSpringboardShovelerView.rowIndex === 0) {
          this.seriesSpringboardPageView.transitionUp();
          this.seriesSpringboardShovelerView.unHighLight();
          this.selectView(this.seriesSpringboardPageView);
        }


      }, this);

      seriesSpringboardShovelerView.on('startScroll', function(direction) {
        seriesSpringboardShovelerView.hideExtraData();
      }, this);

      seriesSpringboardShovelerView.on('stopScroll', function(index) {
        seriesSpringboardShovelerView.currSelection = index;
        seriesSpringboardShovelerView.showExtraData(index);
      }, this);

      seriesSpringboardShovelerView.on('indexChange', function(index) {

      }, this);

      seriesSpringboardShovelerView.on('loadComplete', function() {


      }, this);

      var successCallback = function(container, shovelerData) {
        this.shovelerData = shovelerData;
        //console.log(this.shovelerData);
        seriesSpringboardShovelerView.render(container, this.shovelerData);
      }.bind(this);


      seriesSpringboardShovelerView.updateCategory = function(container, index) {
        app.data.setCurrentCategory(index);
        app.data.getCategoryData(container, successCallback);
      }.bind(this);

      this.seriesSpringboardShovelerView.updateCategory(container, this.index);


    };

    /***************************
     *
     * Springboard Shoveler View
     *
     **************************/

    this.initSpringboardShovelerView = function(container) {

      var springboardShovelerView = this.springboardShovelerView = new SpringboardShovelerView();

      //this.index = 4;

      springboardShovelerView.on('exit', function() {
        this.trigger('exit');
      }, this);

      springboardShovelerView.on('giveMeData', function(index) {

        this.springboardShovelerView.updateCategory(container, index);
      }, this);

      springboardShovelerView.on('back', function() {
        this.springboard = 0;

        if (this.lastView === "browseShovelerView") {

          $('.springboardContainer').remove();
          $(".largeBrowseContainer").show();
          $("#menu-bar").show();
          this.browseShovelerView.highLight();
          this.selectView(this.browseShovelerView);
          buttons.resync();
          return;

        }
        if (this.lastView === "featuredRow") {

          $('.springboardContainer').remove();
          $(".largeBrowseContainer").show();
          $("#menu-bar").show();
          this.featuredRowView.highLight();
          this.selectView(this.featuredRowView);
          buttons.resync();
          return;

        }
        if (this.lastView === "gridwrap") {
          $('.springboardContainer').remove();
          $("#gridWrapMainWrap").show();
          $("#menu-bar").show();
          buttons.resync();
          this.selectView(this.gridWrapView);
          return;
        }



      }, this);

      springboardShovelerView.on('select', function(row, index) {
        var rowdatum = app.data.getGridRowData(4 + row);
        this.springboard = 1;
        $('.springboardContainer').remove();
        this.initSpringboardPageView(rowdatum.items[index]);
        this.selectView(this.springboardPageView);

      }, this);

      springboardShovelerView.on('down', function() {

        this.springboardShovelerView.down();

      }, this);

      springboardShovelerView.on('up', function() {

        // this.springboardShovelerView.up();

      }, this);

      springboardShovelerView.on('bounce', function() {

        if (this.springboardShovelerView.rowIndex === 0) {

          this.springboardShovelerView.unHighLight();
          this.springboardPageView.highLight();
          this.selectView(this.springboardPageView);
        }


      }, this);

      springboardShovelerView.on('startScroll', function(direction) {
        springboardShovelerView.hideExtraData();
      }, this);

      springboardShovelerView.on('stopScroll', function(index) {
        springboardShovelerView.currSelection = index;
        springboardShovelerView.showExtraData(index);
      }, this);

      springboardShovelerView.on('indexChange', function(index) {

      }, this);

      springboardShovelerView.on('loadComplete', function() {


      }, this);


      springboardShovelerView.showAsSelected = function() {
        this.unfadeSelected();
        this.setTransforms();
      };
      var successCallback = function(container, shovelerData) {
        //this.shovelerData = shovelerData;
        //springboardShovelerView.render(container, this.shovelerData);
      }.bind(this);


      springboardShovelerView.updateCategory = function(container) {
        //app.data.setCurrentCategory(index);
        //app.data.getCategoryData(container,successCallback);
      }.bind(this);

      //this.springboardShovelerView.updateCategory(container);
      springboardShovelerView.render(container, app.data.browseRows);

    };

    /***************************
     *
     * Browse Shoveler View
     *
     **************************/

    this.initBrowseShovelerView = function(container) {

      var browseShovelerView = this.browseShovelerView = new BrowseShovelerView();

      this.browseIndex = 0;

      browseShovelerView.on('exit', function() {
        this.exitApp();
      }, this);

      browseShovelerView.on('giveMeData', function() {
        this.browseIndex += 1;

        this.browseShovelerView.updateCategory(successCallback);
      }, this);

      browseShovelerView.on('back', function() {

        this.springboard = 0;

        buttons.resync();
        $(".fixedOrangeBorder").hide();
        $(".overlayFade").hide();
        $(".largeBrowseContainer").remove();
        $("#menu-bar").remove();
        this.initLandingPageView();
        this.selectView(this.landingPageView);

      }, this);

      browseShovelerView.on('select', function(row, index) {

        var rowdatum = app.data.browseRows[row][index];
        $(".largeBrowseContainer").hide();
        $("#menu-bar").hide();
        this.featuredRowView.unhighLight();
        this.initSpringboardPageView(rowdatum);
        this.selectView(this.springboardPageView);
        this.lastView = "browseShovelerView";

        switch (row) {
          case 0:

            this.gaUrl += "v=1"; // Version.
            this.gaUrl += "&tid=UA-69425418-1"; // Tracking ID / Property ID.
            this.gaUrl += "&cid=555"; // Anonymous Client ID.
            this.gaUrl += "&t=event"; // Event hit type
            this.gaUrl += "&ec=Newest%20Dailies"; // Event Category. Required.
            this.gaUrl += "&ea=select"; // Event Action. Required.
            this.gaUrl += "&el=" + rowdatum.label; // Event label.
            this.gaUrl += "&z=" + Date.now();
            app.data.postData(this.gaUrl);


            break;

          case 1:

            this.gaUrl += "v=1"; // Version.
            this.gaUrl += "&tid=UA-69425418-1"; // Tracking ID / Property ID.
            this.gaUrl += "&cid=555"; // Anonymous Client ID.
            this.gaUrl += "&t=event"; // Event hit type
            this.gaUrl += "&ec=Newest%20Programs"; // Event Category. Required.
            this.gaUrl += "&ea=select"; // Event Action. Required.
            this.gaUrl += "&el=" + rowdatum.label; // Event label.
            this.gaUrl += "&z=" + Date.now();
            app.data.postData(this.gaUrl);


            break;

          case 2:

            this.gaUrl += "v=1"; // Version.
            this.gaUrl += "&tid=UA-69425418-1"; // Tracking ID / Property ID.
            this.gaUrl += "&cid=555"; // Anonymous Client ID.
            this.gaUrl += "&t=event"; // Event hit type
            this.gaUrl += "&ec=Newest%20Studies"; // Event Category. Required.
            this.gaUrl += "&ea=select"; // Event Action. Required.
            this.gaUrl += "&el=" + rowdatum.label; // Event label.
            this.gaUrl += "&z=" + Date.now();
            app.data.postData(this.gaUrl);

            break;

          default:
            break;
        }


      }, this);

      browseShovelerView.on('down', function() {

        this.browseShovelerView.down();

      }, this);

      browseShovelerView.on('up', function() {

        this.browseShovelerView.up();

      }, this);

      browseShovelerView.on('bounce', function() {

        if (this.browseShovelerView.rowCounter === 0) {
          $(".innerLargeBrowseContainer").on('webkitTransitionEnd', function(e) {
            app.featuredRowView.highLight();
            $(this).off(e);
          });
          this.featuredRowView.transitionUp();
          this.browseShovelerView.unHighLight();
          this.selectView(this.featuredRowView);
        }


      }, this);

      browseShovelerView.on('startScroll', function(direction) {
        browseShovelerView.hideExtraData();
      }, this);

      browseShovelerView.on('stopScroll', function(index) {
        browseShovelerView.currSelection = index;
        browseShovelerView.showExtraData(index);
      }, this);

      browseShovelerView.on('indexChange', function(index) {

      }, this);

      browseShovelerView.on('loadComplete', function() {

        app.featuredRowView.highLight();
        this.loadingSpinner.hide.all();

      }, this);


      browseShovelerView.showAsSelected = function() {
        this.unfadeSelected();
        this.setTransforms();
      };
      var successCallback = function(shovelerData) {
        this.shovelerData = shovelerData;
        browseShovelerView.render(container, this.shovelerData[this.browseIndex]);
      }.bind(this);


      browseShovelerView.updateCategory = function(successCallback) {
        //app.data.setCurrentCategory(index);
        app.data.browseShovelerData(successCallback);
      }.bind(this);

      this.browseShovelerView.updateCategory(successCallback);


    };


    /***************************
     *
     * Autoplay Shoveler View
     *
     **************************/

    this.initAutoplayShovelerView = function(container) {

      var autoplayShovelerView = this.autoplayShovelerView = new AutoplayShovelerView();

      this.index = 4;

      autoplayShovelerView.on('exit', function() {
        this.trigger('exit');
      }, this);

      autoplayShovelerView.on('giveMeData', function(index) {

        this.autoplayShovelerView.updateCategory(container, index);
      }, this);

      autoplayShovelerView.on('back', function() {

        this.springboard = 0;
        $(".autoplayContainer").remove();
        $("#framerParent").remove();
        $(".springboardContainer").show();
        $('.overlayFade').show();
        this.selectView(this.springboardPageView);
        this.playerView.turnOffEvents();
        this.autoPlayTriggered = 0;
        this.timer = 0;
        buttons.resync();


      }, this);

      autoplayShovelerView.on('select', function(row, index) {
        var rowdatum = app.data.getGridRowData(4 + row);
        this.springboard = 1;
        $(".largeBrowseContainer").remove();
        $("#menu-bar").remove();
        $('.springboardContainer').remove();
        this.initSpringboardPageView(rowdatum.items[index]);
        this.initShovelerView($(".innerSpringboardContainer"));
        this.selectView(this.springboardPageView);
        this.autoplayShovelerView.lastView = "browse";

      }, this);

      autoplayShovelerView.on('down', function() {

        this.autoplayShovelerView.down();

      }, this);

      autoplayShovelerView.on('up', function() {

        this.autoplayShovelerView.up();

      }, this);

      autoplayShovelerView.on('bounce', function() {

        if (this.lastView === "featuredRow" || this.lastView === "browseShovelerView") {
          if (this.autoplayShovelerView.rowIndex === 0) {
            this.autoplayView.transitionUp();
            this.autoplayShovelerView.unHighLight();
            this.selectView(this.autoplayView);
          }
        }


      }, this);

      autoplayShovelerView.on('startScroll', function(direction) {
        autoplayShovelerView.hideExtraData();
      }, this);

      autoplayShovelerView.on('stopScroll', function(index) {
        autoplayShovelerView.currSelection = index;
        autoplayShovelerView.showExtraData(index);
      }, this);

      autoplayShovelerView.on('indexChange', function(index) {

      }, this);

      autoplayShovelerView.on('loadComplete', function() {


      }, this);


      autoplayShovelerView.showAsSelected = function() {
        this.unfadeSelected();
        this.setTransforms();
      };
      var successCallback = function(container, shovelerData) {
        this.shovelerData = shovelerData;
        autoplayShovelerView.render(container, this.shovelerData);
      }.bind(this);


      autoplayShovelerView.updateCategory = function(container, index) {
        app.data.setCurrentCategory(index);
        app.data.getCategoryData(container, successCallback);
      }.bind(this);

      this.autoplayShovelerView.updateCategory(container, this.index);


    };


    /***************************
     *
     * Featured Row View
     *
     **************************/
    this.initFeaturedRowView = function() {

      var featuredRowView = this.featuredRowView = new FeaturedRowView();

      featuredRowView.on('select', function(index) {

        this.springboard = 1;
        this.featuredRowView.unhighLight();
        $("#menu-bar").hide();
        $(".largeBrowseContainer").hide();
        this.initSpringboardPageView(this.featuredRowData[0].data[index]);

        this.gaUrl += "v=1"; // Version.
        this.gaUrl += "&tid=UA-69425418-1"; // Tracking ID / Property ID.
        this.gaUrl += "&cid=555"; // Anonymous Client ID.
        this.gaUrl += "&t=event"; // Event hit type
        this.gaUrl += "&ec=Featured%20Row"; // Event Category. Required.
        this.gaUrl += "&ea=select"; // Event Action. Required.
        this.gaUrl += "&el=" + this.featuredRowData[0].data[index].label; // Event label.
        this.gaUrl += "&z=" + Date.now();
        app.data.postData(this.gaUrl);
        this.selectView(this.springboardPageView);
        this.lastView = "featuredRow";

      }, this);


      featuredRowView.on('noContent', function() {
        window.setTimeout(function() {
          this.loadingSpinner.hide.spinner();
          this.transitionToLeftNavView();
          this.leftNavView.setHighlightedElement();
        }.bind(this), 10);
      }, this);

      featuredRowView.on('bounce', function(dir) {
        if (dir === buttons.DOWN) {
          if (this.settingsParams.entitlement) {
            this.transitionToEntitlementView();
          }
        } else {
          this.featuredRowView.unhighLight();
          this.transitionToMenuBarView();
        }
      }, this);

      featuredRowView.on('transitionDown', function() {

        this.featuredRowView.transitionDown();
        this.browseShovelerView.highLight();
        this.selectView(this.browseShovelerView);
        //this.lastVisibleView("featuredRow");
      }, this);

      featuredRowView.on('Ypos', function(ypos) {

        this.browseShovelerView.Ypos(ypos);

      }, this);

      featuredRowView.on('exit', function() {
        this.exitApp();
      }, this);

      featuredRowView.on('back', function() {
        buttons.resync();
        $(".fixedOrangeBorder").hide();
        $(".overlayFade").hide();
        $(".largeBrowseContainer").remove();
        $("#menu-bar").remove();
        this.initLandingPageView();
        this.selectView(this.landingPageView);
      }, this);


      featuredRowView.on('loadComplete', function() {

        this.initBrowseShovelerView($(".innerLargeBrowseContainer"));
        //$(".innerLargeBrowseContainer").on('webkitTransitionEnd', function(e){ app.featuredRowView.highLight();  console.log("hererenderxxx");$(this).off(e); }  );

      }, this);

      var successCallback = function(featuredData) {
        this.featuredRowData = featuredData;
        featuredRowView.render(this.$appContainer, this.featuredRowData);
      }.bind(this);


      featuredRowView.updateCategory = function() {
        app.data.getFeaturedUrl(successCallback);

      }.bind(this);

      this.featuredRowView.updateCategory();

    };

    /***************************
     *
     * Autoplay Page View
     *
     **************************/
    this.initAutoplayView = function(data) {

      var autoplayView = this.autoplayView = new AutoplayView();

      autoplayView.on('select', function(index) {


        switch (index) {

          case 1:
            this.playerView.trigger('videoStatus', this.playerView.videoElement.currentTime, this.playerView.videoElement.duration, 'ended');
            break;
          case 2:
            $(".autoplayContainer").remove();
            buttons.resync();
            this.playerView.turnOffEvents();
            $("#framerParent").remove();
            this.autoPlayTriggered = 0;
            this.timer = 0;
            this.browse();
            break;
          case 3:
            this.autoplayView.expandVideo();
            this.selectView(this.playerView);

            break;
        }

      }, this);

      autoplayView.on('transitionDown', function() {

        this.autoplayShovelerView.highLight();
        this.selectView(this.autoplayShovelerView);


      }, this);

      autoplayView.on('Ypos', function(ypos) {

        this.autoplayShovelerView.Ypos(ypos);

      }, this);

      autoplayView.on('back', function() {

        $(".autoplayContainer").remove();
        $("#framerParent").remove();
        $(".springboardContainer").show();
        $('.overlayFade').show();
        $("#app-header-bar").show();
        this.selectView(this.springboardPageView);
        this.playerView.turnOffEvents();
        this.autoPlayTriggered = 0;
        this.timer = 0;
        buttons.resync();


      }, this);

      var successCallback = function(autoplayData) {
        this.autoplayData = autoplayData;
        autoplayView.render(this.$appContainer, this.autoplayData);
      }.bind(this);

      autoplayView.updateCategory = function() {

        app.data.getAutoplayData(successCallback);

      }.bind(this);

      this.autoplayView.updateCategory();


    };

    /***************************
     *
     * Springboard Page View
     *
     **************************/
    this.initSpringboardPageView = function(data) {

      var springboardPageView = this.springboardPageView = new SpringboardPageView();

      springboardPageView.on('loadComplete', function() {

        this.loadingSpinner.hide.all();
      }, this);


      springboardPageView.on('startScroll', function() {


      }, this);

      springboardPageView.on('delete', function(index, title) {

        for (var qqq in app.data.gridWrap.items) {

          if (app.data.gridWrap.items[qqq].movieTitle === title) {

            delete app.data.gridWrap.items[qqq].hdbackgroundimageurl;
            delete app.data.gridWrap.items[qqq].movieTitle;

          }
        }


      }, this);

      springboardPageView.on('UP', function(ypos) {

        this.springboardPageView.unHighLight();
        this.transitionToMenuBarView();

      }, this);


      springboardPageView.on('Ypos', function(ypos) {

        this.springboardShovelerView.Ypos(ypos);

      }, this);

      springboardPageView.on('transitionDown', function() {

        //springboardPageView.transitionDown();
        this.springboardShovelerView.highLight();
        this.selectView(this.springboardShovelerView);
        //this.lastVisibleView("springboard");
      }, this);

      springboardPageView.on('select', function(index, data) {

        if (index === 0 || index === 1) {

          this.initPlayerView(data);

          return;

        }

      }, this);

      springboardPageView.on('back', function() {

        app.springboard = 0;
        $(".fixedFocusBorder").show();
        if (this.lastView === "featuredRow" /*|| this.springboardPageView.lastView === "browse"*/ ) {

          $('.springboardContainer').remove();
          $("#menu-bar").show();
          $(".largeBrowseContainer").show();
          this.featuredRowView.highLight();
          this.selectView(this.featuredRowView);
          buttons.resync();
          return;

        }
        if (this.lastView === "browseShovelerView") {

          $('.springboardContainer').remove();
          $("#menu-bar").show();
          $(".largeBrowseContainer").show();
          //this.featuredRowView.highLight();
          this.browseShovelerView.highLight();
          this.selectView(this.browseShovelerView);
          buttons.resync();
          return;

        }
        if (this.lastView === "gridwrap") {
          $('.springboardContainer').remove();
          $("#gridWrapMainWrap").show();
          $("#menu-bar").show();
          buttons.resync();
          this.selectView(this.gridWrapView);
          return;
        }


      }, this);

      springboardPageView.render(app.$appContainer, data);

    };

    /***************************
     *
     * Series Springboard Page View
     *
     **************************/
    this.initSeriesSpringboardPageView = function(data) {

      var video = null;
      video = app.data.getMovies(11);
      this.videoIndex = 0;
      //var videoIndex = 0;
      var seriesSpringboardPageView = this.seriesSpringboardPageView = new SeriesSpringboardPageView();

      seriesSpringboardPageView.on('loadComplete', function() {

        this.loadingSpinner.hide.all();
      }, this);


      seriesSpringboardPageView.on('startScroll', function() {


      }, this);

      seriesSpringboardPageView.on('delete', function(index, title) {

        for (var qqq in app.data.gridWrap.items) {

          if (app.data.gridWrap.items[qqq].movieTitle === title) {

            delete app.data.gridWrap.items[qqq].hdbackgroundimageurl;
            delete app.data.gridWrap.items[qqq].movieTitle;

          }
        }


        //console.log(app.data.gridWrap);
      }, this);


      seriesSpringboardPageView.on('Ypos', function(ypos) {

        this.seriesSpringboardShovelerView.Ypos(ypos);

      }, this);

      seriesSpringboardPageView.on('transitionDown', function() {

        seriesSpringboardPageView.transitionDown();
        this.seriesSpringboardShovelerView.highLight();
        this.selectView(this.seriesSpringboardShovelerView);
        //this.lastVisibleView("springboard");
      }, this);

      seriesSpringboardPageView.on('select', function(index) {

        if (index === 0) {

          this.initPlayerView(video.movies[this.videoIndex].movie);

          return;

        }

      }, this);

      seriesSpringboardPageView.on('back', function() {

        app.springboard = 0;

        if (this.lastView === "featuredRow" /*|| this.seriesSpringboardPageView.lastView === "browse"*/ ) {

          $('.springboardContainer').remove();
          $("#menu-bar").show();
          $(".largeBrowseContainer").show();
          this.featuredRowView.highLight();
          this.selectView(this.featuredRowView);
          buttons.resync();
          return;

        }
        if (this.lastView === "browseShovelerView") {

          $('.springboardContainer').remove();
          $("#menu-bar").show();
          $(".largeBrowseContainer").show();
          //this.featuredRowView.highLight();
          this.browseShovelerView.highLight();
          this.selectView(this.browseShovelerView);
          buttons.resync();
          return;

        }
        if (this.lastView === "gridwrap") {
          $('.springboardContainer').remove();
          $("#gridWrapMainWrap").show();
          $("#menu-bar").show();
          buttons.resync();
          this.selectView(this.gridWrapView);
          return;
        }


      }, this);

      seriesSpringboardPageView.render(app.$appContainer, data);

    };

    /***************************
     *
     * Continue Watching View
     *
     **************************/

    this.initContinueWatchingView = function(video) {

      var continueWatchingView = this.continueWatchingView = new ContinueWatchingView();

      continueWatchingView.on('back', function() {

        $('#continue-watching-overlay').remove();
        this.selectView(this.springboardPageView);

      }, this);

      continueWatchingView.on('select', function(index) {

        if (index === 0) {

        } else {
          this.autoplay = 1;
          $('#continue-watching-overlay').remove();
          $(".springboardContainer").hide();
          $("#black-app-overlay").show();
          this.loadingSpinner.show.spinner();
          this.initAutoplayView();
          this.initAutoplayShovelerView($(".innerAutoplayContainer"));
          this.playerView.render(app.$appContainer, video);
          this.selectView(this.playerView);
          //this.selectView(this.autoplayView);

        }

      }, this);

      var bodyContainer = $("body");
      continueWatchingView.render(bodyContainer, {});

    };


    /***************************
     *
     * Player View
     *
     **************************/
    this.initPlayerView = function(data) {

      this.playerSpinnerHidden = false;

      var playerView = this.playerView = new PlayerView();

      playerView.on('novideo', function(){

          console.log("NO VIDEO message received");

          $("#black-app-overlay").hide();
          app.loadingSpinner.hide.spinner();
          $(".autoplayContainer").remove();
          $("#framerParent").remove();
          $(".springboardContainer").show();
          $("#app-header-bar").show();
          $(".app-top-bar").show();
          $(".overlayFade").show();
          //this.autoPlayTriggered = 0;
          app.timer = 0;
          $(".fliModalError").show();
          $(".fliModalError").text("There are currently no videos available");
          setTimeout(function(){
              $(".fliModalError").hide();
              app.selectView(app.springboardPageView);
          }, 3000);


      });

      playerView.on('back', function() {

        this.playerView.turnOffEvents();
        $(".autoplayContainer").remove();
        $("#framerParent").remove();
        $(".springboardContainer").show();
        $("#app-header-bar").show();
        $(".app-top-bar").show();
        $(".overlayFade").show();
        this.autoPlayTriggered = 0;
        this.timer = 0;
        this.selectView(this.springboardPageView);
        buttons.resync();
      }, this);

      playerView.on('loadComplete', function() {

      }, this);

      playerView.on('videoStatus', this.handleVideoStatus, this);

      playerView.on('error', function(errType, errStack) {
        var errorDialog;

        switch (errType) {
          case ErrorTypes.PLAYER_ERROR:
            var buttons = this.createOkButtonForErrorDialog(this.exitAppCallback);
            errorDialog = errorHandler.createErrorDialog(errType.errTitle, errType.errToUser, buttons);
            this.transitionToErrorDialog(errorDialog);
            break;
          case ErrorTypes.CONTENT_SRC_ERROR:
          case ErrorTypes.CONTENT_DECODE_ERROR:
          case ErrorTypes.VIDEO_NOT_FOUND:
          case ErrorTypes.TIMEOUT_ERROR:
          case ErrorTypes.NETWORK_ERROR:
          case ErrorTypes.HTML5_PLAYER_ERROR:
          case ErrorTypes.EMBEDDED_PLAYER_ERROR:
            buttons = this.createButtonsForErrorDialog(this.playerErrorOkCallback, this.playerErrorRetryCallback);
            errorDialog = errorHandler.createErrorDialog(errType.errTitle, errType.errToUser, buttons);
            this.transitionToErrorDialog(errorDialog);
            break;
          default:
            errType.errToDev = "An unknown error occurred in the player adapter";
            errType.errToUser = "There is an error with the player.";
            break;
        }
        errorHandler.writeToConsole(errType, errType.errToDev, errStack);
        errorHandler.informDev(errType, errType.errToDev, errStack);
      }.bind(this));

      // if(this.movieData.progress){
      //   this.initContinueWatchingView(video);
      //   this.selectView(this.continueWatchingView);
      //   return;
      // }
      $(".app-top-bar").hide();
      $("#black-app-overlay").show();
      this.loadingSpinner.show.spinner();
      this.selectView(this.playerView);
      playerView.render(app.$appContainer, data);

    };


    this.handleVideoStatus = function(currTime, duration, type) {

      if (!this.timer && currTime > 0) {

        $("#black-app-overlay").hide();
        this.loadingSpinner.hide.spinner();
        this.timer = 1;
        return;

      }

      if (type === "playing") {


        // var remainingTime = ( Math.round(this.playerView.videoElement.duration - this.playerView.videoElement.currentTime));
        //  $(".playNextCounter").text(remainingTime);
        //
        // if((remainingTime <= 21 && remainingTime > 0) && !this.autoPlayTriggered)
        // {
        //   $(".autoplayRow").children().removeClass("orangeBorder");
        //   $(".autoplayRow span:nth-child(1)").addClass("orangeBorder");
        //   this.autoplayView.currSelection = 1;
        //   $(".FRAMER_EXAMPLE").css({
        //       '-webkit-transform': 'scale(0.235)',
        //       '-webkit-transform-origin': '8% 28%'
        //     });
        //   this.autoPlayTriggered = 1;
        //   this.selectView(this.autoplayView);
        //   $("div.play").removeClass("play").addClass("pause");
        //}
        return;
      }

      if (!this.playerSpinnerHidden && type === "playing") {

        this.playerSpinnerHidden = true;
        return;
      }

      if (type === "canplay") {

        $(".app-top-bar").hide();
        this.selectView(this.playerView);
        this.playerView.playVideo();

        return;
      }

      if (type === "ended") {

        // this.loadingSpinner.hide.all();
        // $(".controlBox").children().css('background-color', '');
        // this.playerView.controlsView.currSelection = 1;
        // //this.autoPlayTriggered = 0;
        // $("div.pause").removeClass("pause").addClass("play");
        // $('div.play').css('background-color', '#ff6600');
        // this.autoPlayTriggered = 0;
        // this.timer = 0;
        // this.playerView.turnOffEvents();
        // var video = null;
        // video = app.data.getMovies(11);
        // this.videoIndex+=1;
        // var ttt = video.movies[this.videoIndex].movie;
        //  $(".player-main-container").attr('src',ttt);
        //  this.playerView.turnOnEvents();

        return;
      }
      if (type === "paused") {

        return;

      }
      if (type === "FF") {

        return;
      }
    };

    /***************************
     *
     * Landing Page View
     *
     **************************/
    this.initLandingPageView = function() {

      var landingPageView = this.landingPageView = new LandingPageView();

      landingPageView.on('loadComplete', function() {

        //setTimeout(this.loadingSpinner.hide.overlay, 3000);
        // setTimeout(this.loadingSpinner.hide.spinner, 3000);

      }, this);

      landingPageView.on('startScroll', function(direction) {


      }, this);

      landingPageView.on('stopScroll', function(index) {
        this.currSelection = index;


      }, this);

      landingPageView.on('indexChange', function(index) {
        this.currSelection = index;


      }, this);

      landingPageView.on('select', function(index) {

        if (!this.checkIfSignIn(index)) {
          if (!this.checkIfExit(index)) {
            this.browse();
          }
        }

      }, this);

      landingPageView.on('exit', function() {

        this.exitApp();

      }, this);

      var landingPageData = app.data.getLandingPageData();

      landingPageView.render(app.$appContainer, landingPageData);


    };

    /***************************
     *
     * Menu Bar View Object
     *
     **************************/
    this.initializeMenuBarView = function() {

      var menuBarView = this.menuBarView = new MenuBarView();

      menuBarView.on('select', function(index) {
        // switch (index)
        // {
        //   case 0:

        //       $(".keyboard").remove();
        //       $('#menu-bar').remove();
        //       $('#gridWrapMainWrap').remove();
        //       this.browse();
        //         break;
        //   case 1:

        //       $(".largeBrowseContainer").remove();
        //       $(".keyboard").remove();

        //       this.initializeGridWrapView();
        //       app.data.setCurrentCategory(index + 8);
        //       this.gridWrapView.updateCategory();
        //       this.selectView(this.gridWrapView);
        //       this.menuBarView.collapse();
        //       this.lastVisibleView("gridwrap");
        //         break;

        //   case 2:

        //       $(".largeBrowseContainer").remove();
        //       $('#gridWrapMainWrap').remove();
        //       this.initSearchView();
        //       this.selectView(this.searchView);
        //       this.menuBarView.collapse();
        //       $('.overlayFade').hide();

        //        break;

        // }


      }, this);


      menuBarView.on('deselect', function() {
        this.transitionFromLefNavToOneD();
        if (this.featuredRowView.noItems) {
          this.exitApp();
        }
      }, this);


      menuBarView.on('exit', function() {
        // this.menuBarView.collapse();
        // this.transitionToMenuBarView();
      }, this);

      if (this.showSearch) {
        // this.searchInputView.on('searchQueryEntered', function() {
        //   if (this.menuBarView.currSelectedIndex === 0) {
        //     this.menuBarView.searchUpdated = true;
        //     this.menuBarView.confirmNavSelection();
        //   }
        // }, this);
      }


      menuBarView.on('makeActive', function() {
        // this.transitionToExpandedMenuBarView();
      }, this);


      menuBarView.on('indexChange', function(index) {
        // //set the newly selected category index
        // if (this.showSearch && index === 0) {
        //   this.searchInputView.select();
        // }
        // else {
        //   if (this.showSearch) {
        //     app.data.setCurrentCategory(index - 1);
        //   }
        //   else {
        //     app.data.setCurrentCategory(index);
        //   }
        //   if (this.showSearch) {
        //     this.searchInputView.deselect();
        //   }
        // }

      }, this);


      menuBarView.on('loadComplete', function() {

      }, this);


      // var menuBarData = this.menuData.getMenuData();
      // var startIndex = 0;
      // if (this.showSearch) {
      //   menuBarData.unshift(this.searchInputView);
      //   startIndex = 1;
      // }

      menuBarView.render($(".app-top-bar"));
    };

    /***************************
     *
     * Search View
     *
     **************************/
    this.initSearchView = function() {

      var searchView = this.searchView = new SearchView();

      searchView.on('up', function() {

        this.transitionToMenuBarView();

      }, this);

      searchView.on('back', function() {
        $(".keyboard").remove();
        $('#menu-bar').remove();

        this.browse();

      }, this);

      this.searchView.render(this.$appContainer, {});

    };

    /***************************
     *
     * Grid Wrap View
     *
     **************************/
    this.initializeGridWrapView = function() {

      var gridWrapView = this.gridWrapView = new GridWrapView();

      gridWrapView.on('noContent', function() {
        window.setTimeout(function() {
          this.loadingSpinner.hide.spinner();
          this.transitionToMenuBarView();
          this.menuBarView.setHighlightedElement();
        }.bind(this), 10);
      }, this);


      gridWrapView.on('bounce', function(dir) {
        if (dir === buttons.DOWN) {
          if (this.settingsParams.entitlement) {
            this.transitionToEntitlementView();
          }
        } else {
          this.transitionToMenuBarView();
        }
      }, this);


      gridWrapView.on('select', function(index) {

        $("#gridWrapMainWrap").hide();
        $("#menu-bar").hide();
        var ttt = app.data.gridWrap;
        this.initSpringboardPageView(ttt.items[index]);
        this.initSpringboardShovelerView($(".innerSpringboardContainer"));
        this.selectView(this.springboardPageView);
        //this.shovelerView.lastView = 'gridwrap';

      }, this);


      gridWrapView.on('exit', function() {
        this.exitApp();
      }, this);

      gridWrapView.on('back', function() {
        if (this.lastView === "watchlist") {
          $("#gridWrapMainWrap").remove();
          $("#menu-bar").remove();
          this.browse();
          buttons.resync();
        }
      }, this);


      gridWrapView.on('loadComplete', function() {
        this.loadingSpinner.hide.blackOverlay();
        this.loadingSpinner.hide.spinner();
      }, this);

      var successCallback = function(x, categoryData) {
        this.succeededCategoryIndex = this.menuBarView.confirmedSelection;
        this.categoryData = categoryData;
        if (this.categoryData.items === "undefined") {
          console.log(this.categoryData);
        }

        gridWrapView.render(this.$appContainer, categoryData);

      }.bind(this);


      gridWrapView.updateCategoryFromSearch = function(searchTerm) {
        app.data.getDataFromSearch(searchTerm, successCallback);
      }.bind(this);

      gridWrapView.updateCategory = function() {
        var xxx;
        app.data.getGridWrapData(xxx, successCallback);
      }.bind(this);


    };

    /***************************
     *
     * Registration View
     *
     **************************/

    this.initRegistrationView = function() {

      var registrationView = this.registrationView = new RegistrationView();

      registrationView.on('loadComplete', function() {

        // setTimeout(this.loadingSpinner.hide.overlay, 3000);
        //setTimeout(this.loadingSpinner.hide.spinner, 3000);

      }, this);

      registrationView.on('startScroll', function(direction) {


      }, this);

      registrationView.on('stopScroll', function(index) {
        this.currSelection = index;


      }, this);

      registrationView.on('indexChange', function(index) {
        this.currSelection = index;


      }, this);

      registrationView.on('select', function(index) {

        if (index === 0) {
          this.inititializeSignInView();
          this.selectView(this.signinView);
          return;
        }
        if (index === 1) {

          return;
        }
        if (index === 2) {
          $("#main_landing_container").remove();
          $(".springboardContainer").show();
          this.selectView(this.springboardPageView);
        }



      }, this);

      registrationView.on('back', function() {
        $("#main_landing_container").remove();
        $(".springboardContainer").show();
        this.selectView(this.springboardPageView);

      }, this);

      var registrationData = app.data.getRegisterPageData();

      registrationView.render(app.$appContainer, registrationData);


    };

    /***************************
     *
     * Device Linking View
     *
     **************************/

    this.inititializeDeviceLinkingView = function() {

      var deviceLinkingView = this.deviceLinkingView = new DeviceLinkingView();

      deviceLinkingView.on('back', function() {

        this.selectView(this.signinView);

      }, this);

      deviceLinkingView.render(app.$appContainer);

    }.bind(this);


    /***************************
     *
     * Sign In View
     *
     **************************/

    this.inititializeSignInView = function() {

      var signinView = this.signinView = new SignInView();

      signinView.on('select', function() {

        this.signinView.selectInput();

      }, this);

      signinView.on("switchingInput", function(keycode) {



      }, this);

      signinView.on('devicelinking', function() {
        buttons.resync();
        this.inititializeDeviceLinkingView();
        this.selectView(this.deviceLinkingView);

      }, this);

      signinView.on("back", function() {

        if (this.notRegistered) {
          $("#signinContainer").remove();
          $("#main_landing_container").show();
          this.selectView(this.registrationView);
        } else {
          this.exitSignIn();
        }


      }, this);


      signinView.on("pwSubmit", function() {
        this.loadingSpinner.show.all();
        $("#signinContainer").remove();
        buttons.resync();
        //setTimeout(this.loadingSpinner.hide.overlay, 3000);
        //setTimeout(this.loadingSpinner.hide.spinner, 3000);
        this.initializeMenuBarView();
        this.initFeaturedRowView();
        this.initShovelerView($(".innerLargeBrowseContainer"));
        this.selectView(this.featuredRowView);
        $("#main_landing_container").remove();



      }, this);

      $("#main_landing_container").hide();

      signinView.render($("#app-container"));

    }.bind(this);


    this.openSubCategory = function(data) {
      this.succeededSubCategoryIndex = this.oneDView.currSelection;
      if (this.subCategoryView) {
        if (!this.subCategoryStack) {
          this.subCategoryStack = [];
        }
        this.subCategoryStack.push(this.subCategoryView);
        this.subCategoryView.hide();
      }
      var subCategoryView = this.subCategoryView = new SubCategoryView();
      this.subCategoryView.data = data.contents;
      this.oneDView.fadeOut();
      this.menuBarView.fadeOut();
      subCategoryView.render(this.$appContainer, data.title, data.contents, this.settingsParams.displayButtons);
      subCategoryView.hide();
      subCategoryView.fadeIn();
      this.selectView(this.subCategoryView);


      subCategoryView.on('select', function(index) {
        if (this.subCategoryView.data[index].type === "subcategory") {
          this.transitionToSubCategory(this.subCategoryView.data, index);
        } else if (this.subCategoryView.data[index].type === "video-live" && !this.subCategoryView.data[index].isLiveNow) {
          alert("This video is not yet available.");
          buttons.resync();
        } else {
          this.createLiveStreamUpdater(this.subCategoryView.data, index);
          this.transitionToPlayer(this.subCategoryView.data, index);
        }
      }, this);


      subCategoryView.on('exit', function() {
        this.subCategoryView.remove();
        this.subCategoryView = null;
        if (this.subCategoryStack && this.subCategoryStack.length > 0) {
          this.subCategoryView = this.subCategoryStack.pop();
          this.subCategoryView.fadeIn();
          this.selectView(this.subCategoryView);
        } else {
          this.menuBarView.fadeIn();
          this.oneDView.fadeIn();
          this.selectView(this.oneDView);
        }

      }, this);
    }.bind(this);


    this.transitionToSubCategory = function(data, index) {
      app.data.setCurrentSubCategory(data[index]);
      app.data.getSubCategoryData(this.openSubCategory);
    }.bind(this);

    this.createLiveStreamUpdater = function(data, index) {
      if (index + 1 < data.length) {
        var nextIndex = index + 1;
        if (data[nextIndex].type === "video-live") {
          var startTime = new Date(data[nextIndex].startTime).getTime();
          var currTime = new Date().getTime();
          var updateTime = startTime - currTime;
          this.liveUpdater = setTimeout(function() {
            this.updateLiveStream(data, nextIndex);
          }.bind(this), updateTime);
        }
      }
    }.bind(this);

    /* Update the title and description of the live stream when the time has come and set up the next updator */
    this.updateLiveStream = function(data, index) {
      if (this.playerView) {
        this.playerView.updateTitleAndDescription(data[index].title, data[index].description);
      }
      this.createLiveStreamUpdater(data, index);
    }.bind(this);


    this.loadingSpinner = {
      show: {
        overlay: function() {
          $('#app-overlay').show();
        },
        spinner: function() {
          $('#app-loading-spinner').show();
        },
        blackOverlay: function() {
          $('#black-app-overlay').show();
        },
        all: function() {
          this.overlay();
          this.spinner();
        }
      },

      hide: {
        overlay: function() {
          $('#app-overlay').fadeOut(250);
        },
        spinner: function() {

          $('#app-loading-spinner').hide();
        },
        blackOverlay: function() {
          $('#black-app-overlay').fadeOut(250);
        },
        all: function() {

          this.overlay();
          this.spinner();
        }
      }
    };


    this.hideHeaderBar = function() {
      $("#app-header-bar").hide();
    };

    /**
     * Show application header bar
     */
    this.showHeaderBar = function() {
      $("#app-header-bar").show();
    };

    /***********************************
     *
     * Application Transition Methods
     *
     ***********************************/
    /**
     * Set the UI appropriately for the menu-bar view
     */
    this.transitionToMenuBarView = function() {
      this.selectView(this.menuBarView);
      this.menuBarView.setHighlightedElement();
      this.menuBarView.isDisplayed = true;

    };


    this.transitionToEntitlementView = function() {
      this.selectView(this.entitlementView);

      //handle content buttons
      this.oneDView.transitionToExternalView();

      //set button to selected state
      this.entitlementView.highlightButton();
    };

    /**
     * Set the UI back to the oneDView
     */
    this.transitionOutOfEntitlementView = function() {
      this.selectView(this.oneDView);

      //set active view in the oneDView
      this.oneDView.transitionFromExternalView();

      //set button to selected state
      this.entitlementView.deselectButton();
    };

    /**
     * For touch there is no need to select the chosen menu-bar
     * item, so we go directly to the expanded view
     */
    this.transitionToExpandedMenuBarView = function() {
      this.selectView(this.menuBarView);

      //expand the left nav
      this.menuBarView.expand();

      //change size of selected shoveler item
      this.oneDView.shrinkShoveler();
    };

    /**
     * Transition from left nav to the oneD view
     */
    this.transitionFromLefNavToOneD = function() {
      if ($(".largeBrowseContainer").is(":visible")) {
        if (this.featuredRowView.noItems) {
          this.menuBarView.setHighlightedElement();
          return;
        }
        this.menuBarView.collapse();
        this.selectView(this.featuredRowView);
        this.featuredRowView.highLight();
        return;

      }
      if ($("#gridWrapMainWrap").is(":visible")) {
        if (this.gridWrapView.noItems) {
          this.menuBarView.setHighlightedElement();
          return;
        }
        this.menuBarView.collapse();
        this.selectView(this.gridWrapView);
        this.gridWrapView.highLight();
        return;
      }
      if ($(".springboardContainer").is(":visible")) {
        if (this.springboardPageView.noItems) {
          this.menuBarView.setHighlightedElement();
          return;
        }
        this.menuBarView.collapse();
        this.springboardPageView.highLight();
        this.selectView(this.springboardPageView);
        return;
      }



    };


    this.transitionFromPlayerToOneD = function() {
      this.selectView(this.oneDView);
      if (this.playerView) {
        this.playerView.off('videoStatus', this.handleVideoStatus, this);
        this.playerView.remove();
        this.playerView = null;
      }
      this.oneDView.show();
      this.menuBarView.show();
      this.oneDView.shovelerView.show();
      this.showHeaderBar();
    };

    /**
     * Transition from player view to SubCategory view
     */
    this.transitionFromPlayerToSubCategory = function() {
      this.selectView(this.subCategoryView);
      if (this.playerView) {
        this.playerView.off('videoStatus', this.handleVideoStatus, this);
        this.playerView.remove();
        this.playerView = null;
      }
      this.subCategoryView.show();
      this.showHeaderBar();
    };

    // set up button handlers
    buttons.on('buttonpress', this.handleButton, this);
    buttons.on('buttonrepeat', this.handleButton, this);
    buttons.on('buttonrelease', this.handleButton, this);

    // initialize error handler instance that will be used globally
    exports.errorHandler = new ErrorHandler();
    // initialize utils instance
    exports.fireUtils = new FireUtils(this.settingsParams);

    // an error has occured that should generate a dialog to the user transition to that error
    this.transitionToErrorDialog = function(dialogView) {
      // show the error dialog
      if ($('#app-loading-spinner').is(":visible")) {
        this.loadingSpinner.hide.spinner();
      }
      $('#app-overlay').show();
      this.errorDialog = dialogView;
      this.errorDialog.render(this.$appContainer);
      this.appViewBeforeError = this.currentView;
      this.selectView(this.errorDialog);

    }.bind(this);

    // transition the error dialog back to the previous view
    this.transitionFromErrorDialog = function() {
      // remove the error dialog
      this.errorDialog.remove();
      this.errorDialog = null;
      var $appOverlay = $('#app-overlay');

      if ($appOverlay.css('display') !== 'none') {
        $appOverlay.fadeOut(250);
      }
      this.selectView(this.appViewBeforeError);
    }.bind(this);

    //create OK button for error dialog
    this.createOkButtonForErrorDialog = function(okCallback) {
      var buttons = [{
        text: "OK",
        id: "ok",
        callback: okCallback
      }];
      return buttons;
    };

    //create buttons for error dialog
    this.createButtonsForErrorDialog = function(okCallback, retryCallback) {
      var buttons = [{
        text: "OK",
        id: "ok",
        callback: okCallback
      }, {
        text: "Retry",
        id: "retry",
        callback: retryCallback
      }];
      return buttons;
    };

    //player error callback function for the OK button
    this.playerErrorOkCallback = function() {
      //go back to one D view
      this.exitPlayerView();
      if (this.subCategoryStack && this.subCategoryStack.length > 0) {
        this.appViewBeforeError = this.subCategoryView;
        this.transitionFromErrorDialog();
        this.transitionFromPlayerToSubCategory();
      } else {
        this.appViewBeforeError = this.oneDView;
        this.transitionFromErrorDialog();
        this.transitionFromPlayerToOneD();
      }
    }.bind(this);

    //player error callback function for the retry button
    this.playerErrorRetryCallback = function() {
      //retry playing the video from the beginning
      if (this.appViewBeforeError instanceof PlaylistPlayerView || this.appViewBeforeError instanceof PlayerView) {
        this.transitionFromErrorDialog();
        this.playerView.remove();
        var el = this.appViewBeforeError.$el;
        var data = this.appViewBeforeError.items;
        var index = this.appViewBeforeError.currentIndex;
        this.appViewBeforeError.render(el, data, index);
      }
    }.bind(this);

    //callback function for the OK button
    this.exitAppCallback = function() {
      window.open('', '_self').close();
    };

    //initial feed error callback function for the retry button
    this.initialFeedErrorRetryCallback = function() {
      this.transitionFromErrorDialog();
      this.data.loadInitialData(this.dataLoaded);
    }.bind(this);

    //category error callback function for the OK button
    this.categoryErrorOkCallback = function() {
      this.transitionFromErrorDialog();
      //if there's an error when loaing the first category, exit the app
      if (!this.succeededCategoryIndex) {
        this.exitAppCallback();
      }
      //go back to previous category
      this.menuBarView.currSelectedIndex = this.succeededCategoryIndex;
      if (this.showSearch) {
        this.data.setCurrentCategory(this.succeededCategoryIndex - 1);
      } else {
        this.data.setCurrentCategory(this.succeededCategoryIndex);
      }
      this.menuBarView.selectMenuBarItem();
      this.menuBarView.confirmNavSelection();
    }.bind(this);

    //category error callback function for the retry button
    this.categoryErrorRetryCallback = function() {
      //retry updating category
      this.transitionFromErrorDialog();
      this.loadingSpinner.show.spinner();
      this.oneDView.updateCategory();
      this.selectView(this.oneDView);
      this.menuBarView.collapse();

      if (this.showSearch) {
        this.menuBarView.searchUpdated = false;
        this.searchInputView.reset();
      }
    }.bind(this);

    //subcategory error callback function for the OK button
    this.subCategoryErrorOkCallback = function() {
      //go back to previous sub category
      this.transitionFromErrorDialog();
      this.data.setCurrentSubCategory(this.succeededSubCategoryIndex);
      this.data.getSubCategoryData(this.openSubCategory);
    }.bind(this);

    //subcategory error call back function for the retry button
    this.subCategoryErrorRetryCallback = function() {
      //retry updating subcategory
      this.transitionFromErrorDialog();
      this.data.getSubCategoryData(this.openSubCategory);
    }.bind(this);

    //search error callback functino for the OK button
    this.searchErrorOkCallback = function() {
      //transition from error dialog to previous view
      this.transitionFromErrorDialog();
    }.bind(this);

    //search error callback function for the retry button
    this.searchErrorRetryCallback = function() {
      //retry
      this.transitionFromErrorDialog();
      this.loadingSpinner.show.spinner();
      this.oneDView.updateCategoryFromSearch(this.searchInputView.currentSearchQuery);
      //set the selected view
      this.selectView(this.oneDView);
      //hide the menuBar
      this.menuBarView.collapse();

    }.bind(this);

    //initialize the model and get the first data set
    this.data = new this.settingsParams.Model(this.settingsParams);

    this.data.on("error", function(errType, errStack) {
      var errorDialog;
      var buttons;

      switch (errType) {
        case ErrorTypes.INITIAL_FEED_ERROR:
        case ErrorTypes.INITIAL_PARSING_ERROR:
        case ErrorTypes.INITIAL_FEED_TIMEOUT:
        case ErrorTypes.INITIAL_NETWORK_ERROR:
          // Create buttons for the error dialog pop up.
          // buttons = this.createButtonsForErrorDialog(this.exitAppCallback, this.initialFeedErrorRetryCallback);
          // errorDialog = errorHandler.createErrorDialog(errType.errTitle, errType.errToUser, buttons);
          // this.transitionToErrorDialog(errorDialog);
          break;
        case ErrorTypes.CATEGORY_FEED_ERROR:
        case ErrorTypes.CATEGORY_PARSING_ERROR:
        case ErrorTypes.CATEGORY_FEED_TIMEOUT:
        case ErrorTypes.CATEGORY_NETWORK_ERROR:
          buttons = this.createButtonsForErrorDialog(this.categoryErrorOkCallback, this.categoryErrorRetryCallback);
          errorDialog = errorHandler.createErrorDialog(errType.errTitle, errType.errToUser, buttons);
          this.transitionToErrorDialog(errorDialog);
          break;
        case ErrorTypes.SUBCATEGORY_ERROR:
        case ErrorTypes.SUBCATEGORY_PARSING_ERROR:
        case ErrorTypes.SUBCATEGORY_TIMEOUT:
        case ErrorTypes.SUBCATEGORY_NETWORK_ERROR:
          buttons = this.createButtonsForErrorDialog(this.subCategoryErrorOkCallback, this.subCategoryErrorRetryCallback);
          errorDialog = errorHandler.createErrorDialog(errType.errTitle, errType.errToUser, buttons);
          this.transitionToErrorDialog(errorDialog);
          break;
        case ErrorTypes.SEARCH_ERROR:
        case ErrorTypes.SEARCH_PARSING_ERROR:
        case ErrorTypes.SEARCH_TIMEOUT:
        case ErrorTypes.SEARCH_NETWORK_ERROR:
          buttons = this.createButtonsForErrorDialog(this.searchErrorOkCallback, this.searchErrorRetryCallback);
          errorDialog = errorHandler.createErrorDialog(errType.errTitle, errType.errToUser, buttons);
          this.transitionToErrorDialog(errorDialog);
          break;
        case ErrorTypes.TOKEN_ERROR:
          buttons = this.createOkButtonForErrorDialog(this.exitAppCallback);
          errorDialog = errorHandler.createErrorDialog(errType.errTitle, errType.errToUser, buttons);
          this.transitionToErrorDialog(errorDialog);
          break;
        default:
          //won't show an error dialog for unknown errors, so that users don't see many bad error messages
          errType.errToDev = "An unknown error occurred in the data model adapter";
          errType.errToUser = "There is an error with the data.";
          break;

      }
      errorHandler.writeToConsole(errType, errType.errToDev, errStack);
      errorHandler.informDev(errType, errType.errToDev, errStack);
    }.bind(this));


    this.makeInitialDataCall();
  }

  exports.App = App;
}(window));

// init.js

(function(exports) {
  'use strict';

  var settings = {
    appTitle: "FLICast",
    Model: JSONMediaModel,
    dataURL: 'http://www.ucg.org/api/v1.0/media?production=209',   
    numberOfCategories: 30,
    developerToken: "sScWYPLSHmM76WQu_xBVQtvWMHXXbdEwbVcP38LBB9Q.",
    accountID: "3986618082001",
    playerID: "115d0726-53ff-4cd9-8a5d-c68ea10d3ea2",
    showSearch: false,
    displayButtons: false,
    tizen: false  
  }; 

  exports.app = new App(settings);
}(window));


























