// init.js

(function(exports) {
  'use strict';

  var settings = {
    appTitle: "Porn Done Right",
    Model: JSONMediaModel,
    dataURL: 'http://www.pornhub.com/webmasters/search?id=10013401&search=compilation&thumbsize=large',
    numberOfCategories: 30,
    developerToken: "10013401",
    accountID: "",
    playerID: "",
    showSearch: false,
    displayButtons: false,
    tizen: false
  };

  exports.app = new App(settings);
}(window));
