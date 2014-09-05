/**
 * jQuery FocusPoint; version: 1.0.3
 * Author: http://jonathonmenz.com
 * Source: https://github.com/jonom/jquery-focuspoint
 * Copyright (c) 2014 J. Menz; MIT License
 * @preserve
 */
;
(function($) {
	$.fn.focusPoint = function(options) {
		var settings = $.extend({
			//These are the defaults.
			reCalcOnWindowResize: true,
			throttleDuration: 17 //ms - set to 0 to disable throttling
		}, options);
		return this.each(function() {
			//Initial adjustments
			var container = $(this), isThrottled = false;
			//Replace basic css positioning with more accurate version
			container.removeClass('focus-left-top focus-left-center focus-left-bottom focus-center-top focus-center-center focus-center-bottom focus-right-top focus-right-center focus-right-bottom');
			//Focus image in container
			container.adjustFocus();
			if (settings.reCalcOnWindowResize) {
				//Recalculate each time the window is resized
				$(window).resize(function() {
					//Throttle redraws
					if (settings.throttleDuration > 0){
				    if (isThrottled) { return; }
				    isThrottled = true;
				    setTimeout(function () {
				    	isThrottled = false;
				    	container.adjustFocus();
				    }, settings.throttleDuration);
			    }
					container.adjustFocus();
				});
			}
		});
	};
	$.fn.adjustFocus = function() {
		return this.each(function() {
			//Declare variables at top of scope
			var containerW,
				containerH,
				image,
				imageW,
				imageH,
				self,
				imageTmp,
				wR,
				hR,
				hShift,
				vShift,
				containerCenterX,
				focusFactorX,
				scaledImageWidth,
				focusX,
				focusOffsetX,
				xRemainder,
				containerXRemainder,
				containerCenterY,
				focusFactorY,
				scaledImageHeight,
				focusY,
				focusOffsetY,
				yRemainder,
				containerYRemainder;
			//Collect dimensions
			containerW = $(this).width();
			containerH = $(this).height();
			image = $(this).find('img').first();
			imageW = $(this).data('imageW');
			imageH = $(this).data('imageH');
			//Get image dimensions if not set on container
			if (!imageW || !imageH) {
				self = this;
				imageTmp = new Image();
				imageTmp.onload = function(){
					$(self).data('imageW', this.width);
					$(self).data('imageH', this.height);
					$(self).adjustFocus(); //adjust once image is loaded - may cause a visible jump
				};
				imageTmp.src = image.attr('src');
				return false; //Don't proceed right now, will try again once image has loaded
			}
			if (!(containerW > 0 && containerH > 0 && imageW > 0 && imageH > 0)) {
				//Need dimensions to proceed
				return false;
			}
			//Which is over by more?
			wR = imageW / containerW;
			hR = imageH / containerH;
			//Minimise image while still filling space
			if (imageW > containerW && imageH > containerH) {
				if (wR > hR) {
					image.css('max-width', '');
					image.css('max-height', '100%');
				} else {
					image.css('max-width', '100%');
					image.css('max-height', '');
				}
			} else {
				image.css('max-width', '');
				image.css('max-height', '');
			}
			//Amount position will be shifted
			hShift = 0;
			vShift = 0;
			if (wR > hR) {
				//Container center in px
				containerCenterX = Math.floor(containerW / 2);
				//Focus point of resize image in px
				focusFactorX = (Number($(this).data('focus-x')) + 1) / 2;
				//Can't use width() as images may be display:none
				scaledImageWidth = Math.floor(imageW / hR);
				focusX = Math.floor(focusFactorX * scaledImageWidth);
				//Calculate difference beetween focus point and center
				focusOffsetX = focusX - containerCenterX;
				//Reduce offset if necessary so image remains filled
				xRemainder = scaledImageWidth - focusX;
				containerXRemainder = containerW - containerCenterX;
				if (xRemainder < containerXRemainder){
					focusOffsetX -= containerXRemainder - xRemainder;
				}
				if (focusOffsetX < 0) {
					focusOffsetX = 0;
				}
				//Shift to left
				hShift = focusOffsetX * -1;
			} else if (wR < hR) {
				//Container center in px
				containerCenterY = Math.floor(containerH / 2);
				//Focus point of resize image in px
				focusFactorY = (Number($(this).data('focus-y')) + 1) / 2;
				//Can't use width() as images may be display:none
				scaledImageHeight = Math.floor(imageH / wR);
				focusY = scaledImageHeight - Math.floor(focusFactorY * scaledImageHeight);
				//Calculate difference beetween focus point and center
				focusOffsetY = focusY - containerCenterY;
				//Reduce offset if necessary so image remains filled
				yRemainder = scaledImageHeight - focusY;
				containerYRemainder = containerH - containerCenterY;
				if (yRemainder < containerYRemainder) {
					focusOffsetY -= containerYRemainder - yRemainder;
				}
				if (focusOffsetY < 0) {
					focusOffsetY = 0;
				}
				//Shift to top
				vShift = focusOffsetY * -1;
			}
			image.css('left', hShift + 'px');
			image.css('top', vShift + 'px');
		});
	};
})(jQuery);