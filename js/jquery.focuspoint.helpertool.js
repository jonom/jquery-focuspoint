//Get focus point coordinates from an image - adapt to suit your needs.

(function($) {
	$(document).ready(function() {
		
		var img = ['../img/kangaroo.jpg'];
		var $dataAttrInput = $('.helper-tool-data-attr');
		var $cssAttrInput = $('.helper-tool-css3-val');
		
		var $focusPointContainers;
		var $focusPointImages;
		var $helperToolImage = $('img.helper-tool-img, img.target-overlay');

		//This stores focusPoint's data-attribute values
		var focusPointAttr = {
				fX: 0,
				fY: 0,
				fW: 0,
				fH: 0
			}; 

		//Initialize Helper Tool
		(function() {
			for(var i = 1; i < 10; i++) {
				$('#Frames').append('<div id="Frame'+i+'" class="focuspoint"><img/></div>');
			}
			$focusPointContainers = $('.focuspoint');
			$focusPointImages = $('.focuspoint img');
			setImage(img[0]);
		})();
		
		function setImage(imgURL) {
			//Get the dimensions of the image by referencing an image stored in memory
			$("<img/>") 
				.attr("src", imgURL)
				.load(function() {
					focusPointAttr.fW = this.width;   // Note: $(this).width() will not
					focusPointAttr.fH = this.height; // work for in memory images.
					//Set the thumbnail used in the GUI
					$helperToolImage.attr('src', imgURL);
					//Create all images
					$focusPointImages.attr('src', imgURL);
					//Set up containers
					$focusPointContainers.attr({
						'data-focus-x':focusPointAttr.fX,
						'data-focus-y':focusPointAttr.fY,
						'data-image-w': focusPointAttr.fW,
						'data-image-h': focusPointAttr.fH
					});
					$focusPointContainers.data('focusX', focusPointAttr.fX);
					$focusPointContainers.data('focusY', focusPointAttr.fY);
					$focusPointContainers.data('imageW', focusPointAttr.fW);
					$focusPointContainers.data('imageH', focusPointAttr.fH);
					//Run FocusPoint
					$('.focuspoint').focusPoint();
				});
		}

		// Adjust focus on Click
		$helperToolImage.click(function(e){
		
			var imageW = $(this).width();
			var imageH = $(this).height();
			
			//Calculate FocusPoint coordinates
			var offsetX = e.pageX - $(this).offset().left;
			var offsetY = e.pageY - $(this).offset().top;
			var focusX = (offsetX/imageW - .5)*2;
			var focusY = (offsetY/imageH - .5)*-2;
			focusPointAttr.fX = focusX.toFixed(2);
			focusPointAttr.fY = focusY.toFixed(2);

			$dataAttrInput.val('data-focus-x="'+focusPointAttr.fX+'" data-focus-y="'+focusPointAttr.fY+'" data-focus-w="'+focusPointAttr.fW+'" data-focus-h="'+focusPointAttr.fH+'"');

			TweenLite.to(focusPointAttr, 1, {fX:focusX, fY:focusY, onUpdate:onGSAPUpdate})
			
			//Calculate CSS Percentages
			var percentageX = (offsetX/imageW)*100;
			var percentageY = (offsetY/imageH)*100;
			var backgroundPosition = percentageX.toFixed(0) + '% ' + percentageY.toFixed(0) + '%';
			var backgroundPositionCSS = 'background-position: ' + backgroundPosition + ';';
			$cssAttrInput.val(backgroundPositionCSS);

			//Leave a sweet target reticle at the focus point.
			var cssPosition = {
				'top':percentageY+'%',
				'left':percentageX+'%'
			};
			//$('.reticle').css(cssPosition);
			TweenLite.to($('.reticle'), 1, cssPosition)
		});
		
		//Change image on paste/type
		$('input.helper-tool-set-src').on('paste blur', function(e){
		  var element = this;
		  setTimeout(function () {
		    var text = $(element).val();
			setImage(text);
		  }, 100);
		});

		/* GSAP Update Helper */
		function onGSAPUpdate(){
			$focusPointContainers.attr({
				'data-focus-x': focusPointAttr.fX,
				'data-focus-y': focusPointAttr.fY
			});			
			$focusPointContainers.data('focusX', focusPointAttr.fX);
			$focusPointContainers.data('focusY', focusPointAttr.fY);
			$('.focuspoint').adjustFocus();
		};
	});
}(jQuery));