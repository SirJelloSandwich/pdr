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
