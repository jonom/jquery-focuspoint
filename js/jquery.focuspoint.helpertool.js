// Gets focus point coordinates from an image - adapt to suit your needs.

(function($) {
	$(document).ready(function() {
		
		var defaultImage;
		var $dataAttrInput;
		var $cssAttrInput;
		var $focusPointContainers;
		var $focusPointImages;
		var $helperToolImage;

		//This stores focusPoint's data-attribute values
		var focusPointAttr = {
				x: 0,
				y: 0,
				w: 0,
				h: 0
			}; 

		//Initialize Helper Tool
		(function() {

			//Initialize Variables
			defaultImage = '../img/city_from_unsplash.jpg';
			$dataAttrInput = $('.helper-tool-data-attr');
			$cssAttrInput = $('.helper-tool-css3-val');
			$helperToolImage = $('img.helper-tool-img, img.target-overlay');

			//Create Grid Elements
			for(var i = 1; i < 10; i++) {
				$('#Frames').append('<div id="Frame'+i+'" class="focuspoint"><img/></div>');
			}
			//Store focus point containers
			$focusPointContainers = $('.focuspoint');
			$focusPointImages = $('.focuspoint img');

			//Set the default source image
			setImage( defaultImage );

		})();
		
		/*-----------------------------------------*/

		// function setImage(<URL>)
		// Set a new image to use in the demo, requires URI to an image
		
		/*-----------------------------------------*/

		function setImage(imgURL) {
			//Get the dimensions of the image by referencing an image stored in memory
			$("<img/>") 
				.attr("src", imgURL)
				.load(function() {
					focusPointAttr.w = this.width;  
					focusPointAttr.h = this.height;
					
					//Set src on the thumbnail used in the GUI
					$helperToolImage.attr('src', imgURL);
					
					//Set src on all .focuspoint images
					$focusPointImages.attr('src', imgURL);
					
					//Set up initial properties of .focuspoint containers

					/*-----------------------------------------*/
					// Note ---
					// Setting these up with attr doesn't really make a difference
					// added to demo only so changes are made visually in the dom 
					// for users inspecting it. Because of how FocusPoint uses .data()
					// only the .data() assignments that follow are necessary.
					/*-----------------------------------------*/
					$focusPointContainers.attr({
						'data-focus-x':focusPointAttr.x,
						'data-focus-y':focusPointAttr.y,
						'data-image-w': focusPointAttr.w,
						'data-image-h': focusPointAttr.h
					});

					/*-----------------------------------------*/
					// These assignments using .data() are what counts.
					/*-----------------------------------------*/
					$focusPointContainers.data('focusX', focusPointAttr.x);
					$focusPointContainers.data('focusY', focusPointAttr.y);
					$focusPointContainers.data('imageW', focusPointAttr.w);
					$focusPointContainers.data('imageH', focusPointAttr.h);
					
					//Run FocusPoint for the first time.
					$('.focuspoint').focusPoint();

					//Update the data attributes shown to the user
					printDataAttr();

				});
		}

		/*-----------------------------------------*/

		// Update the data attributes shown to the user

		/*-----------------------------------------*/
		
		function printDataAttr(){
			$dataAttrInput.val('data-focus-x="'+focusPointAttr.x.toFixed(2)+'" data-focus-y="'+focusPointAttr.y.toFixed(2)+'" data-focus-w="'+focusPointAttr.w+'" data-focus-h="'+focusPointAttr.h+'"');
		}

		/*-----------------------------------------*/

		// Bind to helper image click event
		// Adjust focus on Click / provides focuspoint and CSS3 properties
		
		/*-----------------------------------------*/

		$helperToolImage.click(function(e){
		
			var imageW = $(this).width();
			var imageH = $(this).height();
			
			//Calculate FocusPoint coordinates
			var offsetX = e.pageX - $(this).offset().left;
			var offsetY = e.pageY - $(this).offset().top;
			var focusX = (offsetX/imageW - .5)*2;
			var focusY = (offsetY/imageH - .5)*-2;
			focusPointAttr.x = focusX;
			focusPointAttr.y = focusY;

			//Write values to input
			printDataAttr();

			//Update focus point
			updateFocusPoint();

			//Calculate CSS Percentages
			var percentageX = (offsetX/imageW)*100;
			var percentageY = (offsetY/imageH)*100;
			var backgroundPosition = percentageX.toFixed(0) + '% ' + percentageY.toFixed(0) + '%';
			var backgroundPositionCSS = 'background-position: ' + backgroundPosition + ';';
			$cssAttrInput.val(backgroundPositionCSS);

			//Leave a sweet target reticle at the focus point.
			$('.reticle').css({ 
				'top':percentageY+'%',
				'left':percentageX+'%'
			});
		});
		
		/*-----------------------------------------*/

		// Change image on paste/blur
		// When you paste an image into the specified input, it will be used for the demo

		/*-----------------------------------------*/
		
		$('input.helper-tool-set-src').on('paste blur', function(e){
		  var element = this;
		  setTimeout(function () {
		    var text = $(element).val();
			setImage(text);
		  }, 100);
		});

		/*-----------------------------------------*/

		/* Update Helper */
		// This function is used to update the focuspoint 

		/*-----------------------------------------*/
		
		function updateFocusPoint(){
			/*-----------------------------------------*/
			// See note in setImage() function regarding these attribute assignments.
			//TLDR - You don't need them for this to work.
			/*-----------------------------------------*/
			$focusPointContainers.attr({
				'data-focus-x': focusPointAttr.x,
				'data-focus-y': focusPointAttr.y
			});			
			/*-----------------------------------------*/
			// These you DO need :)
			/*-----------------------------------------*/
			$focusPointContainers.data('focusX', focusPointAttr.x);
			$focusPointContainers.data('focusY', focusPointAttr.y);
			$focusPointContainers.adjustFocus();
		};
	});
}(jQuery));