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
			
			//Calculate CSS Percentages
			var percentageX = (offsetX/imageW)*100;
			var percentageY = (offsetY/imageH)*100;
			var backgroundPosition = percentageX.toFixed(0) + '% ' + percentageY.toFixed(0) + '%';
			var backgroundPositionCSS = 'background-position: ' + backgroundPosition + ';';
			
			window.alert('FocusX:' + focusX.toFixed(2) + ', FocusY:' + focusY.toFixed(2) + ' (For CSS version: ' + backgroundPositionCSS + ')');
			
		});
		
	});
}(jQuery));