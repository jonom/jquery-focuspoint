//Get focus point coordinates from an image - adapt to suit your needs.

(function($) {
	$(document).ready(function() {
		
		$('img').click(function(e){
		
			var imageW = $(this).width();
			var imageH = $(this).height();
			
			//Calculate FocusPoint coordinates
			var offsetX = e.pageX - $(this).offset().left;
			var offsetY = e.pageY - $(this).offset().top;
			var focusX = (offsetX/imageW - .5)*2;
			var focusY = (offsetY/imageH - .5)*-2;
			
			window.alert('X: '+focusX.toFixed(2)+' Y: '+focusY.toFixed(2));
			
		});
		
	});
}(jQuery));