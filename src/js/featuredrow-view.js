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
    this.MARGIN_WIDTH = 20;
    //this.DEFAULT_IMAGE = "assets/default-image.png";


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
      this.rowData = rowData.videos;

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
          $currElt.prepend('<img class = "featured-full-img " src="' + this.rowData[i].thumb + '" style="opacity:0"/>');
          $currElt.append('<div class="featuredOverlayText"><div class="featuredRowInfoOverlayTitle">' + this.rowData[i].title+ '</div>');
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
    //  $(this.$rowElements[this.currSelection]).removeClass(SHOVELER_ROW_ITEM_SELECTED);
    //  $(this.$rowElements[this.currSelection]).css("z-index", "");
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
      selectedEle.style[this.transformStyle] = "translate3d(100px, 0, 0)";
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
          currX += Math.round(this.elementWidths[i] + this.MARGIN_WIDTH);
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
      var currX = 100;
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
