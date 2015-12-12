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
