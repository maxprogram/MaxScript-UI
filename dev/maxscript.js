/*********************************
==========================
MaxScript jQuery Add-Ons
Version: 1.7
Author: Max Olson
Last update: 2/24/2012
==========================
**********************************/

(function($,exports) {


	// Universal function gets mouse position for all browsers

	var Mouse = {
		x: 0,
		y: 0,
		init: function(e){ 
			var posX, posY;
			if (!e) e = window.event;
			if (e.pageX||e.pageY){posX=e.pageX; posY=e.pageY;}
			else if (e.clientX||e.clientY){
				posX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
				posY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;}
			Mouse.x = posX;
			Mouse.y = posY;
		}
	};
	
	$(function(){
		$(window).bind("mousemove", Mouse.init);
	});
	
	// Prevents selection
	
	$.fn.selectOff = function() {
		return this.each(function(){
			if ($.support.selectstart)
				$(this).on("selectstart.selectOff", function(){return false});
			else $(this).on("mousedown.selectOff", function(){return false});
		});
	};
	$.fn.selectOn = function() {
		return this.off(".selectOff");
	};
	
	// Drag element UI
	
	$.fn.drag = function(options){
		var o = $.extend({
			constraint: false,
			xbounds: false,
			ybounds: false,
			snap: [1,1],
			onStart: function(){},
			onDrag: function(){},
			onStop: function(){},
			dragClass: ""
		}, options);
		return this.each(function(){
			$(this).data("drag",new DragObj($(this), o));
		});
	};
	
	function DragObj(el,o){
		
		var self = this, ui = {};

		function init(){
			el.css("position","absolute");
			el.mousedown(setEvents); 
			return self;
		}
		
		function setEvents(e){
			// Adds drag events
			window.focus();
			$(document).mousemove(mouseMove)
				.mouseup(mouseUp)
				.selectOff();
			
			// Sets starting positions
			ui.startX = Mouse.x;
			ui.startY = Mouse.y;
			ui.pos = el.position();
			el.addClass(o.dragClass);
			o.onStart(e,ui);
			return false;
		}
			
		function mouseMove(e){
			window.focus();
			var	movedX = Mouse.x - ui.startX,
				movedY = Mouse.y - ui.startY;

			movedX = Math.round(movedX/o.snap[0]) * o.snap[0];
			movedY = Math.round(movedY/o.snap[1]) * o.snap[1];
				
			if (o.constraint=="x") movedY = 0;
			if (o.constraint=="y") movedX = 0;
			
			var	moveX = ui.pos.left + movedX,
				moveY = ui.pos.top + movedY;
			
			if (o.xbounds) {
				var rightBound = o.xbounds[1] - el.outerWidth();
				if (moveX < o.xbounds[0]) moveX = o.xbounds[0];
				if (moveX > rightBound) moveX = rightBound;}
			if (o.ybounds) {
				var bottomBound = o.ybounds[1] - el.outerHeight();
				if (moveY < o.ybounds[0]) moveY = o.ybounds[0];
				if (moveY > bottomBound) moveY = bottomBound;}
			
			el.css({left: moveX, top: moveY});
			ui.left = moveX;
			ui.top = moveY;
			if (movedX!=0 || movedY!=0) o.onDrag(e,ui);
		}
		
		function mouseUp(e){
			$(document).off("mousemove",mouseMove)
				.off("mouseup",mouseUp)
				.selectOn();
			el.removeClass(o.dragClass);
			o.onStop(e,ui);
		}
		return init();
	};
	
	
	// Resize element UI
	
	$.fn.resize = function(options){
		var o = $.extend({
			container: false,
			maxHeight: null,
			maxWidth: null,
			minHeight: 20,
			minWidth: 20,
			snap: [1,1],
			n: false,
			e: false,
			s: false,
			w: false,
			onStart: function(){},
			onResize: function(){},
			onStop: function(){},
			resizeClass: ""
		}, options);
		return this.each(function(){
			$(this).data("resize",new ResizeObj($(this), o));
		});
	};
	
	function ResizeObj(el,o){
		
		var	self = this, ui = {}, direction,
			allDirects = ["n", "e", "s", "w"],
			directs = {};

		function init(){
			el.css("position","absolute");
			
			$(allDirects).each(function(i,d){
				if (o[d]!=false) {
					directs[d] = $(o[d], el);
					directs[d].css("cursor",d+"-resize");
					directs[d].mousedown(setEvents);
				}
			});
			return self;
		}
		
		function setEvents(e){
			// Sets starting positions
			ui.startX = Mouse.x;
			ui.startY = Mouse.y;
			ui.old = {
				left: el.position().left,
				top: el.position().top,
				width: el.width(),
				height: el.height()
			};
			// Gets what direction is being resized
			var handle = $(e.target);
			$(allDirects).each(function(i,d){
				if (handle.is(directs[d]) || handle.parent().is(directs[d]))
					direction = d;
			});
			
			// Adds drag events & prevents text selection
			el.css({top: ui.old.top, left: ui.old.left});
			window.focus();
			$(document).mousemove(mouseMove)
				.mouseup(mouseUp)
				.selectOff();
			
			el.addClass(o.resizeClass);
			o.onStart(e,ui);
			return false;
		}
			
		function mouseMove(e){
			var handle = directs[direction];
			
			window.focus();
			var	movedX = Mouse.x - ui.startX,
				movedY = Mouse.y - ui.startY,
				width = ui.old.width,
				height = ui.old.height,
				moveX, moveY;
			movedX = Math.round(movedX/o.snap[0]) * o.snap[0];
			movedY = Math.round(movedY/o.snap[1]) * o.snap[1];
			
			switch (direction){
				case "n":
					movedX = 0;
					height -= movedY;
					break;
				case "e":
					movedY = 0;
					width += movedX;
					movedX = 0;
					break;
				case "s":
					movedX = 0;
					height += movedY;
					movedY = 0;
					break;
				case "w":
					movedY = 0;
					width -= movedX;
					break;
				default:
					console.log("No handles!");
			}
			moveX = ui.old.left + movedX;
			moveY = ui.old.top + movedY;
			
			// Restrict resize to parent container if option is on
			if (o.container) {
				var	parent = el.parent(),
					rightBound = parent.width() - width,
					bottomBound = parent.height() - height;
				if (moveX < 0 || moveX > rightBound) return true;
				if (moveY < 0 || moveY > bottomBound) return true;
			}
			// Restrict size
			if (width<=o.minWidth || height<=o.minHeight) return true;
			if (o.maxWidth!=null && width>=o.maxWidth) return true;
			if (o.maxHeight!=null && height>=o.maxHeight) return true;
			
			el.css({
				left: moveX, top: moveY,
				width: width, height: height
			});
			ui.left = moveX;
			ui.top = moveY;
			ui.width = width;
			ui.height = height;
			if (ui.old.width!=width || ui.old.height!=height)
				o.onResize(e,ui);
		}
		
		function mouseUp(e){
			$(document).off("mousemove",mouseMove)
				.off("mouseup",mouseUp)
				.selectOn();
			
			el.removeClass(o.resizeClass);
			o.onStop(e,ui);
		}
		return init();
	};
	
	
	// Scroll wheel usage
	
	$.fn.wheel = function(options){
		var o = $.extend({
			scroll: 1,
			onUp: function(){},
			onDown: function(){}
		}, options);
		return this.each(function(){
			$(this).data("wheel",new Wheel($(this), o));
		});
	};
	
	function Wheel(el,o){
		
		var	self = this, ui = {};

		function init(){
			setEvents();
			return self;
		}
		function setEvents(e){
			if(this.addEventListener){
				el[0].addEventListener('DOMMouseScroll', wheel, false);
				el[0].addEventListener('mousewheel', wheel, false);
			}
			else {el[0].onmousewheel = wheel;}
			return false;
		}
		function wheel(e){
			var	e = e || window.event, scroll;
			if (e.wheelDelta) scroll = e.wheelDelta / 120 * o.scroll;
			else scroll = -e.detail / 3 * o.scroll;
			if (window.opera) scroll = -scroll;
			
			ui.el		= e.target;
			ui.scroll	= scroll;
			ui.left		= Mouse.x - el.offset().left;
			ui.top		= Mouse.y - el.offset().top;
			
			if (scroll < 0) o.onDown(e,ui);
			if (scroll > 0) o.onUp(e,ui);
			
			e = $.event.fix(e);
			if (e.preventDefault) e.preventDefault();
		}
		return init();
	};


})(jQuery, window);