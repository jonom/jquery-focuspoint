/**
 * jQuery FocusPoint; version: 1.0.3
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

	// fallback css classes
	var focusCssClasses = [
		'focus-left-top', 'focus-left-center', 'focus-left-bottom',
		'focus-center-top', 'focus-center-center', 'focus-center-bottom',
		'focus-right-top', 'focus-right-center', 'focus-right-bottom'
	];

	// setup a container instance
	var setupContainer = function($el) {
		var imageSrc = $el.find('img').attr('src');
		$el.data('imageSrc', imageSrc);

		resolveImageSize(imageSrc)
			.then(function(dim) {
				$el.data({
					imageW: dim.width,
					imageH: dim.height
				});
				$el.adjustFocus();
			});
	};

	// get the width and the height of an image
	// by creating a new temporary image
	var resolveImageSize = function(src) {
		var def = new jQuery.Deferred();
		var $img = $('<img />');

		$img.one('load', function() {
			def.resolve({
				width: $img.width(),
				height: $img.height()
			});
		}).attr('src', src);

		return def.promise();
	};

	// create a debounced version of a function
	var debounce = function(fn, ms) {
		var timer;
		return function() {
			var args = Array.prototype.slice.call(arguments, 0);
			if (timer) clearTimeout(timer);
			timer = setTimeout(function() {
				fn.apply(null, args);
			}, ms);
		};
	};

	// this calculates the new left/top values of an image
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

		return focusOffset * -1;
	};

	// re-adjust the focus
	var adjustFocus = function($el) {
		var imageW = $el.data('imageW');
		var imageH = $el.data('imageH');
		var imageSrc = $el.data('imageSrc');

		if (!imageW && !imageH && !imageSrc) {
			return setupContainer($el); // setup the container first
		}

		var containerW = $el.width();
		var containerH = $el.height();
		var focusX = parseFloat($el.data('focus-x'));
		var focusY = parseFloat($el.data('focus-y'));
		var $image = $el.find('img').first();

		//Amount position will be shifted
		var hShift = 0;
		var vShift = 0;

		//Which is over by more?
		var wR = imageW / containerW;
		var hR = imageH / containerH;

		if (!(containerW > 0 && containerH > 0 && imageW > 0 && imageH > 0)) {
			return false; //Need dimensions to proceed
		}

		// reset max-width and -height
		$image.css({
			'max-width': '',
			'max-height': ''
		});

		//Minimize image while still filling space
		if (imageW > containerW && imageH > containerH) {
			if (wR > hR) {
				$image.css('max-height', '100%');
			} else {
				$image.css('max-width', '100%');
			}
		}

		if (wR > hR) {
			hShift = calcShift(hR, containerW, imageW, focusX);
		} else if (wR < hR) {
			vShift = calcShift(wR, containerH, imageH, focusY, true);
		}

		$image.css({
			top: vShift + 'px',
			left: hShift + 'px'
		});
	};

	$.fn.focusPoint = function(options) {
		var settings = $.extend({}, defaults, options);

		return this.each(function() {
			//Initial adjustments
			var $el = $(this);
			var $window = $(window);
			var debAdjustFocus = debounce($.proxy($el.adjustFocus, $el), settings.throttleDuration);

			$el.removeClass(focusCssClasses.join(' ')); //Replace basic css positioning with more accurate version
			$el.adjustFocus(); //Focus image in container

			if (settings.reCalcOnWindowResize) {
				//Recalculate each time the window is resized
        $window.on('resize', debAdjustFocus);
			}
		});
	};

	$.fn.adjustFocus = function() {
		return this.each(function() {
			adjustFocus($(this));
		});
	};

})(jQuery);