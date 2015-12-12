/* Main Application
 *
 * This module initializes the application and handles
 * transition between different views
 *
 */

(function(exports) {
  "use strict";

  // function onPause() {
  //   if (app.playerView) {
  //     app.playerView.pauseVideo();
  //   }
  // }


  // function onResume() {
  //   if (app.playerView) {
  //     app.playerView.resumeVideo();
  //   }
  // }


  // function onAmazonPlatformReady() {
  //   document.addEventListener("pause", onPause, false);
  //   document.addEventListener("resume", onResume, false);
  // }

  // document.addEventListener("amazonPlatformReady", onAmazonPlatformReady, false);


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


    this.dataLoaded = function() {bb

      var logo;
      this.$appContainer.empty();

      var html = fireUtils.buildTemplate($("#app-header-template"), {});

      this.$appContainer.append(html);

    //  this.browse();

      // this.gaUrl += "v=1"; // Version.
      // this.gaUrl += "&tid=UA-69425418-1"; // Tracking ID / Property ID.
      // this.gaUrl += "&cid=555"; // Anonymous Client ID.
      // this.gaUrl += "&t=event"; // Event hit type
      // this.gaUrl += "&ec=Channel%20Launch"; // Event Category. Required.
      // this.gaUrl += "&ea=App%20Launched"; // Event Action. Required.
      // this.gaUrl += "&el=Beyond%20Today%20FireTV"; // Event label.
      // this.gaUrl += "&z=" + Date.now();
      // app.data.postData(this.gaUrl);


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
