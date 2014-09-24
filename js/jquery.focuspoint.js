/**
 * jQuery FocusPoint; version: 1.1.1
 * Author: http://jonathonmenz.com
 * Source: https://github.com/jonom/jquery-focuspoint
 * Copyright (c) 2014 J. Menz; MIT License
 * @preserve
 */
;
(function($) {

	var defaults = {
		reCalcOnWindowResize: true,
		throttleDuration: 17 //ms - set to 0 to disable throttling
	};

	//Setup a container instance
	var setupContainer = function($el) {
		var imageSrc = $el.find('img').attr('src');
		$el.data('imageSrc', imageSrc);

		resolveImageSize(imageSrc, function(err, dim) {
			$el.data({
				imageW: dim.width,
				imageH: dim.height
			});
			adjustFocus($el);
		});
	};

	//Get the width and the height of an image
	//by creating a new temporary image
	var resolveImageSize = function(src, cb) {
		//Create a new image and set a
		//handler which listens to the first
		//call of the 'load' event.
		$('<img />').one('load', function() {
			//'this' references to the new
			//created image
			cb(null, {
				width: this.width,
				height: this.height
			});
		}).attr('src', src);
	};

	//Create a throttled version of a function
	var throttle = function(fn, ms) {
		var isRunning = false;
		return function() {
			var args = Array.prototype.slice.call(arguments, 0);
			if (isRunning) return false;
			isRunning = true;
			setTimeout(function() {
				isRunning = false;
				fn.apply(null, args);
			}, ms);
		};
	};

	//Calculate the new left/top values of an image
	var calcShift = function(conToImageRatio, containerSize, imageSize, focusSize, toMinus) {
		var containerCenter = Math.floor(containerSize / 2); //Container center in px
		var focusFactor = (focusSize + 1) / 2; //Focus point of resize image in px
		var scaledImage = Math.floor(imageSize / conToImageRatio); //Can't use width() as images may be display:none
		var focus =  Math.floor(focusFactor * scaledImage);
		if (toMinus) focus = scaledImage - focus;
		var focusOffset = focus - containerCenter; //Calculate difference between focus point and center
		var remainder = scaledImage - focus; //Reduce offset if necessary so image remains filled
		var containerRemainder = containerSize - containerCenter;
		if (remainder < containerRemainder) focusOffset -= containerRemainder - remainder;
		if (focusOffset < 0) focusOffset = 0;

		return (focusOffset * -100 / containerSize)  + '%';
	};

	//Re-adjust the focus
	var adjustFocus = function($el) {
		var imageW = $el.data('imageW');
		var imageH = $el.data('imageH');
		var imageSrc = $el.data('imageSrc');

		if (!imageW && !imageH && !imageSrc) {
			return setupContainer($el); //Setup the container first
		}

		var containerW = $el.width();
		var containerH = $el.height();
		var focusX = parseFloat($el.data('focusX'));
		var focusY = parseFloat($el.data('focusY'));
		var $image = $el.find('img').first();

		//Amount position will be shifted
		var hShift = 0;
		var vShift = 0;

		if (!(containerW > 0 && containerH > 0 && imageW > 0 && imageH > 0)) {
			return false; //Need dimensions to proceed
		}

		//Which is over by more?
		var wR = imageW / containerW;
		var hR = imageH / containerH;

		//Reset max-width and -height
		$image.css({
			'max-width': '',
			'max-height': ''
		});

		//Minimize image while still filling space
		if (imageW > containerW && imageH > containerH) {
			$image.css((wR > hR) ? 'max-height' : 'max-width', '100%');
		}

		if (wR > hR) {
			hShift = calcShift(hR, containerW, imageW, focusX);
		} else if (wR < hR) {
			vShift = calcShift(wR, containerH, imageH, focusY, true);
		}

		$image.css({
			top: vShift,
			left: hShift
		});
	};

	var $window = $(window);

	var focusPoint = function($el, settings) {
		var thrAdjustFocus = settings.throttleDuration ?
			throttle(function(){adjustFocus($el);}, settings.throttleDuration)
			: function(){adjustFocus($el);};//Only throttle when desired
		var isListening = false;

		adjustFocus($el); //Focus image in container

		//Expose a public API
		return {

			adjustFocus: function() {
				return adjustFocus($el);
			},

			windowOn: function() {
				if (isListening) return;
				//Recalculate each time the window is resized
				$window.on('resize', thrAdjustFocus);
				return isListening = true;
			},

			windowOff: function() {
				if (!isListening) return;
				//Stop listening to the resize event
				$window.off('resize', thrAdjustFocus);
				isListening = false;
				return true;
			}

		};
	};

	$.fn.focusPoint = function(optionsOrMethod) {
		//Shortcut to functions - if string passed assume method name and execute
		if (typeof optionsOrMethod === 'string') {
			return this.each(function() {
				var $el = $(this);
				$el.data('focusPoint')[optionsOrMethod]();
			});
		}
		//Otherwise assume options being passed and setup
		var settings = $.extend({}, defaults, optionsOrMethod);
		return this.each(function() {
			var $el = $(this);
			var fp = focusPoint($el, settings);
			//Stop the resize event of any previous attached
			//focusPoint instances
			if ($el.data('focusPoint')) $el.data('focusPoint').windowOff();
			$el.data('focusPoint', fp);
			if (settings.reCalcOnWindowResize) fp.windowOn();
		});

	};

	$.fn.adjustFocus = function() {
		//Deprecated v1.2
		return this.each(function() {
			adjustFocus($(this));
		});
	};

})(jQuery);