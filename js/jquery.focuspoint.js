/**
 * jQuery FocusPoint; version: v2-dev
 * Author: J. Menz http://jonathonmenz.com
 * Source: https://github.com/jonom/jquery-focuspoint
 * Copyright (c) 2014 - 2016 J. Menz; License TBC
 * @preserve
 */
;(function ( $, window, document, undefined ) {

	var defaults = {
		reCalcOnWindowResize: true,
		setTransformOrigin: true,
		legacyGrid: false
	};
	var $resizeElements = $(); // Which focuspoint containers are listening to resize event

	// https://davidwalsh.name/javascript-debounce-function
	var debounce = function(func, wait, immediate) {
		var timeout;
		return function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	};

	// Resize throttling. Let requestAnimationFrame set framerate rather than using resize event rate which may be too rapid or too slow.
	var running = false;
	// Called on resize event
	var resize = function() {
		if (!running) {
			running = true;
			doResize();
			cancelResize();
		}
	};
	var cancelResize = debounce(function() {
		running = false;
	}, 250);
	var doResize = function() {
		$resizeElements.focusPoint('adjustFocus');
		// Repeat if still running
		if (running) {
			if (window.requestAnimationFrame) {
				window.requestAnimationFrame(doResize);
			} else {
				setTimeout(doResize, 1000/15); //15fps fallback
			}
		}
	};

	// Single resize listener for all focus point instances
	var updateResizeListener = function() {
		$(window).off('resize.focuspoint');
		if ($resizeElements.length) {
			$(window).on('resize.focuspoint', resize);
		}
	};

	// For sorting
	var compareNumbers = function(a, b) {
		return a - b;
	};

	// Calculate the left or top offset for an image on an axis
	var getOffset = function(focusPos, scale) {
		// How much bigger is the image than the container?
		var spareSpace = scale - 1;
		// If the image doesn't fill the container, position image on center
		if (spareSpace < 0) {
			return (1 - scale) * 0.5;
		}
		// Otherwise move image so focus point is as close to center of frame as possible
		else if (spareSpace > 0) {
			var negSpareSpace = spareSpace * -1;
			var offset = 0.5 - (focusPos * scale);
			if (offset > 0) {
				return 0;
			}
			if (offset < 0 && offset < negSpareSpace) {
				return negSpareSpace;
			}
			return offset;
		}
		return 0;
	};

	// Convert one or two coords in to an array of min,max and average values. If one coord is passed they will all be the same.
	var getRange = function(axis, coordString, legacyGrid) {
		var axisCoords = coordString.split(','),
			axisRange = [];

		// Make numeric and account for classic grid
		$.each(axisCoords, function( index, value ) {
			axisCoords[index] = parseFloat(value.trim());
			if (legacyGrid === true) {
				if (axis === 'X') {
					axisCoords[index] = (axisCoords[index] + 1)*0.5;
				}
				else {
					axisCoords[index] = (axisCoords[index] - 1)*-0.5;
				}
			}
		});

		// Set ranges
		if (axisCoords.length > 1) {
			axisCoords.sort(compareNumbers);
			axisRange.start = axisCoords[0];
			axisRange.stop = axisCoords[1];
			// Average of min cropping region for classic focus point
			axisRange.average = (axisCoords[0] + axisCoords[1]) / 2;
		}
		else {
			// Same values for all
			axisRange.start = axisRange.stop = axisRange.average = axisCoords[0];
		}
		// Ratio of range to image on this axis, inverted so we can determine the maximum allowable zoom level before the region will not all be viewable
		axisRange.maxScale = 1 / (axisRange.stop - axisRange.start);

		return axisRange;
	};

	// The FocusPoint plugin constructor
	function FocusPoint ( element, options ) {
		this.element = element;
		this.settings = $.extend( {}, defaults, options );
		this.init();
	}

	// Avoid Plugin.prototype conflicts
	$.extend(FocusPoint.prototype, {
		init: function () {
			// Set up the values which won't change
			this.$el = $(this.element);
			this.$image = this.$el.find('img, video').first();
			this.imageW = this.$el.data('imageW');
			this.imageH = this.$el.data('imageH');
			this.imageRatio = this.imageW / this.imageH;

			// Determine image dimensions if missing
			if (!this.imageW && !this.imageH) {
				return this.resolveImageSize();
			}

			// Separate and sanitise focus points.
			// There may be one or two focus coordinates per axis, defining a single point or area
			var fp = this;
			$.each(['X','Y'], function( index, axis ) {
				// Get the main coordinates, including min cropping region if set
				var axisRange = getRange(axis, String(fp.$el.data('focus' + axis)), fp.settings.legacyGrid);
				fp['focus' + axis + 'MinStart'] = axisRange.start;
				fp['focus' + axis + 'MinStop'] = axisRange.stop;
				fp['focus' + axis] = axisRange.average;
				fp['minCroppingRegionMaxScale' + axis] = axisRange.maxScale;

				// Get the ideal region coordinates if set
				axisRange = getRange(axis, String(fp.$el.data('focus' + axis + 'Ideal')), fp.settings.legacyGrid);
				fp['focus' + axis + 'IdealStart'] = axisRange.start;
				fp['focus' + axis + 'IdealStop'] = axisRange.stop;
				fp['idealCroppingRegionMaxScale' + axis] = axisRange.maxScale;
			});

			this.minCroppingRegionW = (this.focusXMinStop - this.focusXMinStart) * this.imageW;
			this.minCroppingRegionH = (this.focusYMinStop - this.focusYMinStart) * this.imageH;
			this.minCroppingRegionRatio = this.minCroppingRegionW / this.minCroppingRegionH;
			this.idealCroppingRegionW = (this.focusXIdealStop - this.focusXIdealStart) * this.imageW;
			this.idealCroppingRegionH = (this.focusYIdealStop - this.focusYIdealStart) * this.imageH;
			this.idealCroppingRegionRatio = this.idealCroppingRegionW / this.idealCroppingRegionH;

			// Set transform origin
			if (this.settings.setTransformOrigin) {
				var transformOrigin = (fp.focusX * 100) + '% ' + (fp.focusY * 100) + '%';
				this.$image.css({
					'webkit-transform-origin': transformOrigin,
					'transform-origin': transformOrigin
				});
			}
			// Mark active
			this.$el.addClass('focuspoint-active');
			// Focus image in container
			this.adjustFocus();
			// Adjust on resize
			if (this.settings.reCalcOnWindowResize) {
				this.windowOn();
			}
		},
		// Get the width and the height of an image by creating a new temporary image
		resolveImageSize: function() {
			// Don't try this more than once
			if (this.triedAutoResolution) {
				return false;
			}
			this.triedAutoResolution = true;
			// Create a new image and set a handler which listens to the first call of the 'load' event.
			var $el = this.$el;
			$('<img />').one('load', function() {
				// 'this' references to the new created image
				$el.data('imageW', this.width);
				$el.data('imageH', this.height);
				$el.focusPoint('init');
			}).attr('src', this.$image.attr('src'));
		},
		// Adjust focus automatically when screen is resized
		windowOn: function() {
			$resizeElements = $resizeElements.add(this.element);
			updateResizeListener();
		},
		// Cancel automatic adjustments
		windowOff: function() {
			$resizeElements = $resizeElements.not(this.element);
			updateResizeListener();
		},
		// Optimally position image in container
		adjustFocus: function() {
			// Store all the cropping data in one var for easy debugging
			var data = {};
			data.containerW = this.$el.width();
			data.containerH = this.$el.height();
			if (!(data.containerW > 0 && data.containerH > 0 && this.imageW > 0 && this.imageH > 0)) {
				return false; //Need dimensions to proceed
			}
			data.containerRatio = data.containerW / data.containerH;

			// Stop processing if the image and container aspect ratio match
			if (data.containerRatio === this.imageRatio) {
				this.$image.css({
					'width': '100%',
					'height': '100%',
					'left': 0,
					'top': 0
				});
				return;
			}

			// ToDo: this is weird
			data.axisScale = {
				X: this.imageRatio / data.containerRatio,
				Y: data.containerRatio / this.imageRatio
			};

			// Determing the method of cropping to use
			if (data.containerRatio >= this.idealCroppingRegionRatio && data.containerRatio <= (this.imageW / this.idealCroppingRegionH)) {
				// Show entire ideal cropping range area, with extra image shown on the X axis
				data.clippingMode = 'ideal';
				data.primaryClippingAxis = 'Y';
				data.secondaryClippingAxis = 'X';
			}
			else if (data.containerRatio <= this.idealCroppingRegionRatio && data.containerRatio >= (this.idealCroppingRegionW / this.imageH)) {
				// Show entire ideal cropping range area, with extra image shown on the Y axis
				data.clippingMode = 'ideal';
				data.primaryClippingAxis = 'X';
				data.secondaryClippingAxis = 'Y';
			}
			else if (this.imageRatio > data.containerRatio) {
				// Show as much of the image as possible, cropping on the X axis
				data.clippingMode = 'classic';
				data.primaryClippingAxis = 'X';
				if (data.axisScale.X > this.minCroppingRegionMaxScaleX) {
					// Shrink the image to preserve the entire minimum cropping region, padding evenly on the Y axis
					data.clippingMode = 'min';
				}
			}
			else {
				// Show as much of the image as possible, cropping on the Y axis
				data.clippingMode = 'classic';
				data.primaryClippingAxis = 'Y';
				if (data.axisScale.Y > this.minCroppingRegionMaxScaleY) {
					// Shrink the image to preserve the entire minimum cropping region, padding evenly on the X axis
					data.clippingMode = 'min';
				}
			}

			data.scale = 1;
			data.shiftPrimary = 0;
			data.shiftSecondary = 0;
 			if (data.clippingMode === 'ideal') {
				// Scale up image to fit ideal cropping region in frame
				data.scale = this['idealCroppingRegionMaxScale' + data.primaryClippingAxis] / data.axisScale[data.primaryClippingAxis];
				data.shiftSecondary = (getOffset(this['focus' + data.secondaryClippingAxis], data.scale) * 100)  + '%';
				data.shiftPrimary = (this['focus' + data.primaryClippingAxis + 'IdealStart'] * -100 * data.axisScale[data.primaryClippingAxis] * data.scale) + '%';
			}
 			else if (data.clippingMode === 'min') {
				// Scale down image to fit min cropping region in frame
				data.scale = this['minCroppingRegionMaxScale' + data.primaryClippingAxis] / data.axisScale[data.primaryClippingAxis];
				data.shiftSecondary = (getOffset(this['focus' + data.secondaryClippingAxis], data.scale) * 100)  + '%';
				data.shiftPrimary = (this['focus' + data.primaryClippingAxis + 'MinStart'] * -100 * data.axisScale[data.primaryClippingAxis] * data.scale) + '%';
			}
			else {
				// Show as much image as possible, with focus point as close to center as possible
				data.shiftPrimary = (getOffset(this['focus' + data.primaryClippingAxis], data.axisScale[data.primaryClippingAxis]) * 100)  + '%';
			}

			// Assign CSS values to image container
			if (data.primaryClippingAxis === 'X') {
				this.$image.css({
					'width': ((data.axisScale[data.primaryClippingAxis] * data.scale * 100) + '%'),
					'height': ((data.scale * 100) + '%'),
					'left': (data.shiftPrimary),
					'top': (data.shiftSecondary)
				});
			}
			else { //clippingAxis === 'Y'
				this.$image.css({
					'width': ((data.scale * 100) + '%'),
					'height': ((data.axisScale[data.primaryClippingAxis] * data.scale * 100) + '%'),
					'left': (data.shiftSecondary),
					'top': (data.shiftPrimary)
				});
			}
		}
	});

	// Plugin wrapper around the constructor, preventing against multiple instantiations
	$.fn.focusPoint = function ( optionsOrMethod ) {
		this.each(function() {
			if ( !$.data( this, "focusPoint" ) ) {
				$.data( this, "focusPoint", new FocusPoint( this, optionsOrMethod ) );
			}
		});
		// Shortcut to functions - if string passed assume method name and execute
		if (typeof optionsOrMethod === 'string') {
			return this.each(function() {
				var $el = $(this);
				$el.data('focusPoint')[optionsOrMethod]();
			});
		}

		// Chain jQuery functions
		return this;
	};

})( jQuery, window, document );
