/* Model
 *
 * Model for JSON data
 */

(function(exports) {
  "use strict";

  function JSONMediaModel(appSettings) {

    Events.call(this, ['error']);

    // this.beyondTodayDaily = [];
    // this.beyondTodayTV = [];
    // this.bibleStudy = [];
    // this.currData = {};
    // this.currentCategory = 0;
    // this.currentItem     = 0;
    // this.defaultTheme    = "default";
    // this.currentlySearchData = false;
    // this.featuredIds = [];
    // this.finalFeaturedData = [];
    //  this.featuredUrl = 'http://www.ucg.org/api/v1.0/media/';
    //this.gaUrl = "http://www.google-analytics.com/collect?";
    this.pdrData = [];


    //timeout default to 1 min
    this.TIMEOUT = 60000;

    this.loadInitialData = function(dataLoadedCallback) {
      var requestData = {
        url: 'http://www.pornhub.com/webmasters/video_embed_code?id=965909603',
        type: 'GET',
        crossDomain: true,
        dataType: 'json',
        context: this,
        cache: true,
        timeout: this.TIMEOUT,
        success: function() {
          this.pdrData = arguments[0];
          //  this.handleJsonData(contentData);
          dataLoadedCallback();
        }.bind(this),
        error: function(jqXHR, textStatus) {
          // Data feed error is passed to model's parent (app.js) to handle
          if (jqXHR.status === 0) {
            this.trigger("error", ErrorTypes.INITIAL_NETWORK_ERROR, errorHandler.genStack());
            return;
          }
          switch (textStatus) {
            case "timeout":
              this.trigger("error", ErrorTypes.INITIAL_FEED_TIMEOUT, errorHandler.genStack());
              break;
            case "parsererror":
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




    // Make the actual CORS request.
    this.makeCorsRequest = function(callback) {
      // Create the XHR object.
      var createCORSRequest = function(method, url) {

        var xhr = new XMLHttpRequest();
        if ("withCredentials" in xhr) {
          // XHR for Chrome/Firefox/Opera/Safari.
          xhr.open(method, url, true);
        } else if (typeof XDomainRequest != "undefined") {
          // XDomainRequest for IE.
          xhr = new XDomainRequest();
          xhr.open(method, url);
        } else {
          // CORS not supported∫.
          xhr = null;
        }
        return xhr;
      };
      // Helper method to parse the title tag from the response.
      var getTitle = function(text) {
        return text.match('<title>(.*)?</title>')[1];
      };

      // All HTML5 Rocks properties support CORS.
      var url = 'http://www.pornhub.com/webmasters/search?id=d8397be8e3c3a959&search=compilation&thumbsize=large';

      var xhr = createCORSRequest('GET', url);
      if (!xhr) {
        console.log('CORS not supported');
        return;
      }

      // Response handlers.
      xhr.onload = function() {
        var text = xhr.responseText;
        var title = getTitle(text);
        console.log('Response from CORS request to ' + url + ': ' + title);
      };

      xhr.onerror = function() {
        console.log('Error' + " " + xhr.status + " " + xhr.statusText);
      };

      xhr.send();
    }.bind(this);

    this.postData = function(postUrl) {
      this.gaUrl += postUrl;

      var postData = {
        url: this.gaUrl,
        type: 'POST',
        crossDomain: true,
        context: this,
        cache: true,
        timeout: this.TIMEOUT,
        success: function() {
          var postReturnData = arguments[0];
        }.bind(this),
        error: function(jqXHR, textStatus) {
          // Data feed error is passed to model's parent (app.js) to handle
          if (jqXHR.status === 0) {
            this.trigger("error", ErrorTypes.INITIAL_NETWORK_ERROR, errorHandler.genStack());
            return;
          }
          switch (textStatus) {
            case "timeout":
              this.trigger("error", ErrorTypes.INITIAL_FEED_TIMEOUT, errorHandler.genStack());
              break;
            case "parsererror":
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

    this.handleJsonData = function(beyondData) {

      this.categoryData = [];
      this.currentCategory = 0;
      this.beyondData = beyondData;

    }.bind(this);

    this.getFeaturedUrl = function(successCallback) {

      var requestData = {
        url: 'http://www.ucg.org/api/v1.0/featured_media',
        type: 'GET',
        crossDomain: true,
        dataType: 'json',
        context: this,
        cache: true,
        timeout: this.TIMEOUT,
        success: function() {
          var featuredItems = arguments[0];

          for (var ttt in featuredItems.data) {

            this.featuredUrl += featuredItems.data[ttt].id + ',';
          }
          this.featuredUrl = this.featuredUrl.substring(0, this.featuredUrl.length - 1);
          this.getFeaturedData(this.featuredUrl, successCallback);
        }.bind(this),
        error: function(jqXHR, textStatus) {
          // Data feed error is passed to model's parent (app.js) to handle
          if (jqXHR.status === 0) {
            this.trigger("error", ErrorTypes.INITIAL_NETWORK_ERROR, errorHandler.genStack());
            return;
          }
          switch (textStatus) {
            case "timeout":
              this.trigger("error", ErrorTypes.INITIAL_FEED_TIMEOUT, errorHandler.genStack());
              break;
            case "parsererror":
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

    this.getFeaturedData = function(finalUrl, successCallback) {

      var requestData = {
        url: finalUrl,
        type: 'GET',
        crossDomain: true,
        dataType: 'json',
        context: this,
        cache: true,
        timeout: this.TIMEOUT,
        success: function() {
          this.finalFeaturedData.push(arguments[0]);
          successCallback(this.finalFeaturedData);
        }.bind(this),
        error: function(jqXHR, textStatus) {
          // Data feed error is passed to model's parent (app.js) to handle
          if (jqXHR.status === 0) {
            this.trigger("error", ErrorTypes.INITIAL_NETWORK_ERROR, errorHandler.genStack());
            return;
          }
          switch (textStatus) {
            case "timeout":
              this.trigger("error", ErrorTypes.INITIAL_FEED_TIMEOUT, errorHandler.genStack());
              break;
            case "parsererror":
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

    this.browseShovelerData = function(callback) {

      this.browseRows = [];

      for (var ttt in this.beyondData.data) {
        if (this.beyondData.data[ttt].production !== undefined) {

          if (this.beyondData.data[ttt].production.name === "Beyond Today Daily") //208
          {
            this.beyondTodayDaily.push(this.beyondData.data[ttt]);
          }
          if (this.beyondData.data[ttt].production.name === "Beyond Today Television Program") //209
          {
            this.beyondTodayTV.push(this.beyondData.data[ttt]);
          }
          if (this.beyondData.data[ttt].production.name === "Beyond Today Bible Study") //275
          {
            this.bibleStudy.push(this.beyondData.data[ttt]);
          }
        }

      }

      this.browseRows.push(this.beyondTodayDaily);
      this.browseRows.push(this.beyondTodayTV);
      this.browseRows.push(this.bibleStudy);

      for (var kkk in this.browseRows) {
        for (var ppp in this.browseRows[kkk]) {
          if (this.browseRows[kkk][ppp].duration !== null) {
            var newTime = this.convertSecondsToMMSS(this.browseRows[kkk][ppp].duration);
            // var fliTime = {
            //   FLItime:newTime
            // };
            this.browseRows[kkk][ppp].fliTime = newTime;
          }
        }
      }
      callback(this.browseRows);

    };

    this.sortAlphabetically = function(arr) {
      arr.sort();
    };




    this.setCurrentCategory = function(index) {

      this.currentCategory = index;

    };


    this.setCurrentSubCategory = function(data) {
      this.currSubCategory = data;
    };


    this.getCategoryItems = function() {
      return this.categoryData;
    };


    this.getCategoryData = function(container, categoryCallback) {

      this.currData = this.categories[this.currentCategory];
      categoryCallback(container, this.currData);
    };


    this.filterLiveData = function(data) {
      for (var i = 0; i < data.length; i++) {
        if (data[i].type === "video-live") {
          var startTime = new Date(data[i].startTime).getTime();
          var endTime = new Date(data[i].endTime).getTime();
          var currTime = Date.now();
          var isAlwaysLive = data[i].alwaysLive;
          if (currTime < endTime && currTime >= startTime) {
            data[i].isLiveNow = true;
          } else if (isAlwaysLive) {
            data[i].isLiveNow = true;
          } else if (currTime > endTime) {
            // remove old broadcasts
            data.splice(i, 1);
            i--;
          } else {
            var upcomingTimeSeconds = Math.round((startTime - currTime) / 1000);
            var days = Math.floor(upcomingTimeSeconds / 86400);
            data[i].isLiveNow = false;
            if (days > 0) {
              data[i].upcomingTime = exports.utils.formatDate(data[i].startTime);
            } else {
              data[i].upcomingTime = "Starts in " + this.convertSecondsToHHMM(upcomingTimeSeconds);
            }
          }
        }
      }
      return data;
    };

    this.convertSecondsToMMSS = function(seconds) {
      var minutes = Math.floor(seconds / 60);
      var displaySeconds = seconds - minutes * 60;
      if (displaySeconds < 10) {
        return minutes + ":0" + displaySeconds;
      }
      return minutes + ":" + displaySeconds;
    };


    this.convertSecondsToHHMM = function(seconds, alwaysIncludeHours) {
      var hours = Math.floor(seconds / 3600);
      var minutes = Math.floor(seconds / 60);

      var finalString = "";

      if (hours > 0 || alwaysIncludeHours) {
        finalString += hours + " hours ";
      }
      if (minutes < 10 && minutes > 0) {
        return finalString + ('00:0' + minutes);
      } else {
        return finalString + ('00:' + minutes);
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


    this.getDataFromSearch = function(searchTerm, searchCallback) {
      this.currData = [];
      for (var i = 0; i < this.mediaData.length; i++) {
        if (this.mediaData[i].title.toLowerCase().indexOf(searchTerm) >= 0 || this.mediaData[i].description.toLowerCase().indexOf(searchTerm) >= 0) {
          //make sure the date is in the correct format
          if (this.mediaData[i].pubDate) {
            this.mediaData[i].pubDate = exports.utils.formatDate(this.mediaData[i].pubDate);
          }
          this.currData.push(this.mediaData[i]);
        }
      }
      searchCallback(this.currData);
    };

    this.setCurrentItem = function(index) {
      this.currentItem = index;
      this.currentItemData = this.currData[index];
    };

    this.getCurrentItemData = function() {
      return this.currentItemData;
    };





  }

  exports.JSONMediaModel = JSONMediaModel;

})(window);
