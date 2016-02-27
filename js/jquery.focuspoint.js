/**
 * jQuery FocusPoint; version: dev
 * Author: J. Menz http://jonathonmenz.com
 * Source: https://github.com/jonom/jquery-focuspoint
 * Copyright (c) 2014 - 2016 J. Menz; MIT License
 * @preserve
 */
;(function ( $, window, document, undefined ) {

	var defaults = {
		reCalcOnWindowResize: true,
		setTransformOrigin: true,
		legacyGrid: false
	};
	var $resizeElements = $(); // Which focuspoint containers are listening to resize event
	var throttleDuration = 17; // Same throttle duration for all containers (ms - set to 0 to disable throttling)

	// Create a throttled version of a function
	var throttle = function(fn, ms) {
		var isRunning = false;
		return function() {
			var args = Array.prototype.slice.call(arguments, 0);
			if (isRunning) {
				return false;
			}
			isRunning = true;
			setTimeout(function() {
				isRunning = false;
				fn.apply(null, args);
			}, ms);
		};
	};

	// Single resize listener for all focus point instances
	var updateResizeListener = function() {
		$(window).off('resize.focuspoint');
		if ($resizeElements.length) {
			if (throttleDuration > 0) {
				$(window).on('resize.focuspoint', throttle(function(){
					$resizeElements.focusPoint('adjustFocus');
				}, throttleDuration));
			}
			else {
				$(window).on('resize.focuspoint', function(){
					$resizeElements.focusPoint('adjustFocus');
				});
			}
		}
	};

	// For sorting
	var compareNumbers = function(a, b) {
		return a - b;
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
			// Pass through throttle rate if set
			if (this.settings.throttleDuration !== undefined) {
				this.setThrottleDuration(this.settings.throttleDuration);
			}

			// Set up the values which won't change
			this.$el = $(this.element);
			this.$image = this.$el.find('img').first();
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
				fp['focus' + axis] = String(fp.$el.data('focus' + axis)).split(',');
				// Make numeric
				$.each(fp['focus' + axis], function( index, value ) {
					fp['focus' + axis][index] = parseFloat(value.trim());
					// Account for classic grid
					if (fp.settings.legacyGrid === true) {
						if (axis === 'X') {
							fp['focus' + axis][index] = (fp['focus' + axis][index] + 1)*0.5;
						}
						else {
							fp['focus' + axis][index] = (fp['focus' + axis][index] - 1)*-0.5;
						}
					}
				});
				// Set ranges
				if (fp['focus' + axis].length > 1) {
					fp['focus' + axis].sort(compareNumbers);
					fp['focus' + axis + 'MinStart'] = fp['focus' + axis][0];
					fp['focus' + axis + 'MinStop'] = fp['focus' + axis][1];
					fp['focus' + axis] = (fp['focus' + axis][0] + fp['focus' + axis][1]) / 2;
				}
				else {
					fp['focus' + axis + 'MinStart'] = fp['focus' + axis + 'MinStop'] = fp['focus' + axis] = fp['focus' + axis][0];
				}
				// Min cropping region ratios
				fp['maxScaleRatio' + axis] = 1 / (fp['focus' + axis + 'MinStop'] - fp['focus' + axis + 'MinStart']);
			});

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
		// Change the throttling duration (affects all instances)
		setThrottleDuration: function(ms) {
			throttleDuration = ms;
			updateResizeListener();
		},
		// Optimally position image in container
		adjustFocus: function() {
			// Store all the cropping data in one var for easy debugging
			//var data = {};
			dataContainerW = this.$el.width();
			dataContainerH = this.$el.height();
			if (!(dataContainerW > 0 && dataContainerH > 0 && this.imageW > 0 && this.imageH > 0)) {
				return false; //Need dimensions to proceed
			}

			dataContainerRatio = dataContainerW / dataContainerH;
			dataAxisScale = {
				X: this.imageRatio / dataContainerRatio,
				Y: dataContainerRatio / this.imageRatio
			};
			dataClippingAxis = false;
			// Scale and position image
			if (this.imageRatio > dataContainerRatio) {
				dataClippingAxis = 'X';
			}
			else if (this.imageRatio < dataContainerRatio) {
				dataClippingAxis = 'Y';
			}
			else {
				// No clipping
				this.$image.css({
					'width': '100%',
					'height': '100%',
					'left': 0,
					'top': 0
				});
				return; // no more processing needed
			}

			dataScale = 1;
			dataShiftPrimary = 0;
			dataShiftSecondary = 0;
			if (this['maxScaleRatio' + dataClippingAxis] && dataAxisScale[dataClippingAxis] > this['maxScaleRatio' + dataClippingAxis]) {
				// Need to scale down image to fit min cropping region in frame
				dataScale = this['maxScaleRatio' + dataClippingAxis] / dataAxisScale[dataClippingAxis];
				dataShiftSecondary = ((1 - dataScale) * 50) + '%';
				dataShiftPrimary = (this['focus' + dataClippingAxis + 'MinStart'] * -100 * dataAxisScale[dataClippingAxis] * dataScale) + '%';
			}
			else {
				// Move image so focus point is in center of frame
				dataShiftPrimary = 0.5 - (this['focus' + dataClippingAxis] * dataAxisScale[dataClippingAxis]);
				// Make sure image fills frame
				dataSpareNeg = (dataAxisScale[dataClippingAxis] - 1) * -1;
				if (dataShiftPrimary > 0) {
					dataShiftPrimary = 0;
				}
				else if (dataShiftPrimary < 0 && dataShiftPrimary < dataSpareNeg) {
					dataShiftPrimary = dataSpareNeg;
				}
				dataShiftPrimary = (dataShiftPrimary * 100)  + '%';
			}
			this.$image.css((dataClippingAxis === 'X') ? 'width' : 'height', (dataAxisScale[dataClippingAxis] * dataScale * 100) + '%');
			this.$image.css((dataClippingAxis === 'X') ? 'height' : 'width', (dataScale * 100) + '%');
			this.$image.css((dataClippingAxis === 'X') ? 'left' : 'top', dataShiftPrimary);
			this.$image.css((dataClippingAxis === 'X') ? 'top' : 'left', dataShiftSecondary);

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
