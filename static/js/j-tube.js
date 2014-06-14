function onPlayerReady(){
	console.log("what what!! this shouldn't be playeing?!!");
}
(function ( $ ) {
$.fn.Jtube = function( options ) {
	/*
		version 0.1 of J-tube
		by Bohdan Anderson @ Also Collective
		24 10 2013

		05 11 2013
			added the loop functionality
			onLoaded function, run once, onStart is run every time...
			changed the request wmode from opaque to transparent
			added volume
		06 11 2013
			corrected the loop functionality
		07 11 2013
			removed the html-5 tag from the request, was causing problems
		12 11 2013
			discovered, that it does not work on some computers
			when loading into iframe on firefox, it doesn't load, so need to position off the screen when loading
	*/

	var settings = $.extend({
		iframeEl:this[0],
		player:null,
		playerResizer:null,
		fullscreen:true,
		animationTime:1000,
		winW:0,
		winH:0,
		videoW:16,
		videoH:9,
		pW:0,
		pH:0,
		loop:0,
		volume:100,
		applyToContainer:false,
		vidWidth:"640",
		vidHeight:"390",
		vidQuality:"highres",

		onDone:myDoneFunc,
		onStart:myStartFunc,
		onPause:myPauseFunc,
		onBuffering:function(){return null},
		onLoaded:function(){return null},

		videoId:"dYMgg1evFmw"/*"_vJG9kaVLEA"*//*"dYMgg1evFmw"*/,
		loadingDiv:false,
		loadingEl:null,
		loadingGif:"gif.gif",

		ldCss:true, 		//loading the element
		ldCssEl:null,
		ldCssFunc:function(){return null},

		bottomNav:null,
		skipvid:true,
		skipvidEl:null,
		skipvidText:"skipVideo",
		skipvidWidth:0,
		skipvidHeight:0,

		timeLeft:true,
		timeLeftPos:null,
		timePosColour:null,
		timePosGradient:[null,null,null],
		timeNegColour:null,
		timeCounter:true,
		timeCounterEl:null,
		videoLength:0,

		loaded:false,
		cancle:false,
		skipWhash:true,
		skipHash:"#skip-vid",
		debugMode:false,
		fallbackImage:null

	}, options );

	if(settings.skipWhash){
		var hash = window.location.hash;
		if(hash.length>0){
			settings.cancle = true;
			stateChange({data:0,target:{a:settings.iframeEl}});
			return null;
		}
	}
	if(settings.loadingDiv){
		settings.winW = $(window).width();
		settings.winH = ($(window).height());
		settings.loadingEl = document.createElement('img');
		settings.loadingEl.src = settings.loadingGif;
		settings.loadingEl.id = "yt-loading-element";
		settings.loadingEl.onload = function(){
			$(settings.loadingEl).css({left:(settings.winW/2)-(settings.loadingEl.width/2),top:(settings.winH/2)-(settings.loadingEl.height/2)});
			document.body.appendChild(settings.loadingEl);
		};
	}
	if(settings.skipvid){
		settings.bottomNav = document.createElement('a');
		settings.bottomNav.href = "#skip-vid";
		settings.bottomNav.id = "yt-bottom-nav";
		settings.skipvidEl = document.createElement('div');
		settings.skipvidEl.id= "yt-skip-video-button";
		settings.skipvidEl.innerHTML = settings.skipvidText;
		settings.bottomNav.appendChild(settings.skipvidEl);
		$(settings.bottomNav).click(function(){
			settings.cancle = true;
			stateChange({data:0,target:{a:settings.iframeEl}});
		});

		if(settings.timeLeft){
			settings.timeLeftPos = document.createElement("div");
			settings.timeLeftPos.id = "yt-tl-pos";
			if(settings.timePosColour == "" && settings.timePosGradient[0] != null){
				var jtl = $(settings.timeLeftPos);
				// jtl.css("background-image", "-webkit-gradient(linear, 50% 0%, 50% 100%, color-stop(0%, "+settings.timePosGradient[0]+"), color-stop(100%, "+settings.timePosGradient[1]+"))");
				jtl.css("background-image", "-webkit-linear-gradient("+ settings.timePosGradient[0]+", "+ settings.timePosGradient[1]+" 0%,"+settings.timePosGradient[2]+" 100%)");
				jtl.css("background-image", "-moz-linear-gradient("+ settings.timePosGradient[0]+", "+ settings.timePosGradient[1]+" 0%,"+settings.timePosGradient[2]+" 100%)");
				jtl.css("background-image", "-o-linear-gradient("+ settings.timePosGradient[0]+", "+ settings.timePosGradient[1]+" 0%,"+settings.timePosGradient[2]+" 100%)");
				jtl.css("background-image", "linear-gradient("+ settings.timePosGradient[0]+", "+ settings.timePosGradient[1]+" 0%,"+settings.timePosGradient[2]+" 100%)");
			} else {
				settings.timeLeftPos.style.backgroundColor = settings.timePosColour;
			}
			settings.bottomNav.style.backgroundColor = settings.timeNegColour;
			settings.bottomNav.appendChild(settings.timeLeftPos);
			document.body.appendChild(settings.bottomNav);
			resizeCountBar();
			if(settings.timeCounter){
				makeCounter(settings.timeLeftPos);
			}
		} else {
			$(settings.skipvidEl).css("position","absolute");
			document.body.appendChild(settings.bottomNav);
		}
	}

	if(settings.ldCss){
		settings.ldCssEl = settings.ldCssFunc();  //must return a div, this creates the loading elements
	}

	function makeCounter(parent){
		settings.timeCounterEl = document.createElement("div");
		settings.timeCounterEl.id= "time-counter";
		parent.appendChild(settings.timeCounterEl);
		//console.log("what what ",settings.skipvidWidth)
		$(settings.timeCounterEl).css("right",settings.skipvidWidth);

		setInterval(function(){
			if(settings.videoLength && settings.player){
				var out = settings.videoLength - settings.player.getCurrentTime();
				out = sectomin(Math.floor(out));
				settings.timeCounterEl.innerHTML = out;
			}
		},100);
	}

	function sectomin(seconds){
		var min = Math.floor(seconds/60);
		var sec = (seconds - 60*min);
		if(sec < 10){
			sec = "0"+sec;
		}
		return min + ":"+sec;
	}

	function resizeCountBar(){
		settings.skipvidWidth = $(settings.skipvidEl).outerWidth();
		settings.skipvidHeight = $(settings.skipvidEl).outerHeight();
		settings.winW = $(window).width();
		$(settings.timeLeftPos).css({height:settings.skipvidHeight,width:(100 - (settings.skipvidWidth/settings.winW*100)) + "%"});
		// $(settings.timeLeftPos).css({height:settings.skipvidHeight,width:"10%"});
	}

	var tag = document.createElement('script');
	tag.src = "https://www.youtube.com/iframe_api";
	settings.iframeEl.parentNode.insertBefore(tag, settings.iframeEl);
	$(settings.iframeEl).addClass("shift-left");

	this.setupPlayer = function(){
		if(settings.debugMode){
			console.log("set up player starting");
		}
		settings.player = new YT.Player(settings.iframeEl.id, {
			height: settings.vidHeight,
			width: settings.vidWidth,
			videoId: settings.videoId,
			// 'autoplay': 1,  wmode=transparent
			playerVars:{
				"loop":1,
				"controls":0,
				"showinfo":0,
				"rel":0,
				"autoplay":0,
				"vq":settings.vidQuality,
				"html5":1,
				"start":34,
				"enablejsapi":1,
				"wmode":"transparent",
				"modestbranding":1
			},
			events: {
				'onReady': onPlayerReady,
				'onStateChange':stateChange
			}
		});
		setPlayerSizeCustom();
		settings.playerResizer = $(window).on("resize",setPlayerSizeCustom);
		if(!window.addEventListener){
			stateChange({data:1});
		}
		if(settings.fallbackImage){
			var element = settings.player.a.parentNode.parentNode;
			$(element).css({
				backgroundPosition:"center",
				backgroundSize:"cover",
				WebkitBackgroundSize: "cover",
				MozBbackgroundSize: "cover",
				OBackgroundSize: "cover",
				backgroundImage: "url("+settings.fallbackImage+")"
			})
		}
		if(settings.debugMode){
			console.log("setup player ending");
		}
	};
	function onPlayerReady(evt){
		if(settings.debugMode){
			console.log("on player is ready");
		}
		if(!settings.cancle){
			settings.iframeEl = $("#youtube-player")[0];
			settings.player.playVideo();
			settings.player.setLoop(settings.loop);
			settings.player.setVolume(settings.volume);
			evt.target.setPlaybackQuality('hd720');
			setTimeout(fadeInEl,2000);

			//setting up the video length stuff...
			settings.videoLength = settings.player.getDuration();
			//console.log("ths video lenth should be set here", settings.player.getDuration());
			if(settings.skipvid && settings.timeLeft){
				setInterval(function(){
					if(!settings.videoLength){
						settings.videoLength = settings.player.getDuration();
					} else {
						settings.timeLeftPos.style.width = (100 - settings.player.getCurrentTime()/settings.videoLength*100) - (settings.skipvidWidth/settings.winW*100) + "%";
					}
				},50);
			}
		}
		settings.onLoaded(settings);

		if(settings.debugMode){
			console.log("on player is done");
		}
	}
	function fadeInEl(){
		if(!settings.cancle){
			$(settings.loadingEl).fadeOut('fast',function(){
				this.parentNode.removeChild(this);
			});
			$(settings.iframeEl).addClass('jtube-animation');
			$(settings.iframeEl).removeClass('shift-left');
				setTimeout(function(){
					$(settings.iframeEl).removeClass('jtube-animation');
				},settings.animationTime);
		}
	}
	function fadeOutEl(){
		$(settings.iframeEl).addClass('jtube-animation');
		$(settings.iframeEl).addClass('shift-left');
			setTimeout(function(){
				$(settings.iframeEl).removeClass('jtube-animation');
			},settings.animationTime);
	}
	function stateChange(evt){
		if(settings.debugMode){
			console.log("stateChange video is called " + evt.data);
		}
		// 0 video done playing
		// 1 play
		// 2 pause
		// 3 buffering
		if(evt.data == 0){
			if(settings.loop === 0){
				$(evt.target.a).fadeOut('slow',function(){
					this.parentNode.removeChild(this);
				});
				if(settings.skipvid){
					$(settings.bottomNav).fadeOut('slow',function(){
						this.parentNode.removeChild(this);
					});
				}
				if(!settings.loaded){
					function onPlayerReady(){
						return null;
					}
					$("#splash").fadeIn('fast');
					if(settings.ldCss){
						$(settings.ldCssEl).fadeOut('slow', function() {
							this.parentNode.removeChild(this);
						});
					}
				}
			}else {
				if(settings.debugMode){
					console.log("FORCE restart video");
				}
				settings.player.playVideo();
			}
			settings.onDone();
		}else if(evt.data == 1){
			settings.onStart(settings);
			setTimeout(function(){
				$("#splash").fadeIn('slow');
				if(settings.ldCss){
					$(settings.ldCssEl).fadeOut('slow', function() {
						this.parentNode.removeChild(this);
					});
				}
				settings.loaded = true;
			},200);
		} else if(evt.data == 2){
			settings.onPause(settings);
		} else if(evt.data == YT.PlayerState.BUFFERING){
			settings.onBuffering(settings);
		}
		if(settings.debugMode){
			console.log("stateChange video is done");
		}
	}
	function myStartFunc(){
		if(settings.debugMode){
			console.log("myStartFunc");
		}
	}
	function myDoneFunc(){
		if(settings.debugMode){
			console.log("myDoneFunc");
		}
	}
	function myPauseFunc() {
		if(settings.debugMode){
			console.log("myPauseFunc");
		}
	}
	function setPlayerSizeCustom(){
		if(settings.fullscreen){
			settings.winW = $(window).width();
			settings.winH = ($(window).height())+20; //adding 20 for the black bar at bottom
			settings.pW = settings.winW;
			settings.pH = settings.winH;
			var diff = (settings.winW/settings.winH);
			if(settings.winW/settings.videoW > settings.winH/settings.videoH){
				settings.pW = settings.winW;
				settings.pH = settings.winH*(1+diff);
			} else {
				settings.pW = settings.winW*(1+(settings.winH/settings.winW)+diff);
				settings.pH = settings.winH;
			}
			if(settings.applyToContainer){
				// console.log(settings.player.a.pa)
				// $(settings.player.a.parentNode.parentNode).css({width:settings.winW,height:settings.winH-20});
				$(settings.player.a.parentNode).css({width:Math.floor(settings.pW),height:Math.floor(settings.pH),left:Math.floor((settings.winW-settings.pW)/2),top:(settings.winH-settings.pH)/2,position:"absolute"});
				$(settings.player.a).css({width:"100%",height:"100%"});
			} else {
				$(settings.player.a).css({width:Math.floor(settings.pW),height:Math.floor(settings.pH),left:Math.floor((settings.winW-settings.pW)/2),top:(settings.winH-settings.pH)/2,position:"absolute"});
			}
		}
	}

	return this;


};

}( jQuery ));