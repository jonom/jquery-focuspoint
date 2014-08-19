# jQuery FocusPoint

## Intelligent cropping for flexible image containers

Websites don't have a single layout any more. The space you have for an image may be portrait on a laptop, landscape on a tablet, and square on a mobile - particularly if you're using a full-screen image.

![image](demos/img/demo.jpg?raw=true)

FocusPoint makes sure your image looks great in any container, by ensuring the 'spare' parts of your image (negative space) are cropped out before the important parts.

## Examples

Here are some examples showing the same image cropped a variety of different ways at once. Make sure you play with resizing the browser window to get a feel for what FocusPoint does.

* 	[Lizard](http://htmlpreview.github.io/?https://github.com/jonom/jquery-focuspoint/blob/master/demos/grid/lizard.html)
* 	[Kangaroo](http://htmlpreview.github.io/?https://github.com/jonom/jquery-focuspoint/blob/master/demos/grid/kangaroo.html)
* 	[Dolphin](http://htmlpreview.github.io/?https://github.com/jonom/jquery-focuspoint/blob/master/demos/grid/dolphin.html)
* 	[Bird](http://htmlpreview.github.io/?https://github.com/jonom/jquery-focuspoint/blob/master/demos/grid/bird.html)

And here is a [full screen](http://htmlpreview.github.io/?https://github.com/jonom/jquery-focuspoint/blob/master/demos/full-screen/index.html) demo.

## How's it work?

The idea is that most images have a focal point or subject that is the most important part of the image. In the case of a traditional portrait photo this would be the subject's face (or specifically the spot right between their eyes). In the image above it's arguably the point halfway between the two people's faces.

FocusPoint requires you to indicate where this focal point is located within your image, and then works in the background to ensure that point is never cropped out.


## How to use

#### Calculate your image's focus point

An image's **focus point** is made up of x (horizontal) and y (vertical) coordinates. The value of a coordinate can be a number with decimal points anywhere between -1 and +1, where 0 is the centre. X:-1 indicates the left edge of the image, x:1 the right edge. For the y axis, y:1 is the top edge and y:-1 is the bottom.

![image](demos/img/grid.png?raw=true)

**Pretty confusing eh?** Don't worry, I've included a handy script to help you find the focus coordinates of an image with a single click. [See an example here](http://htmlpreview.github.io/?https://github.com/jonom/jquery-focuspoint/blob/master/demos/helper/index.html).

#### Include javascript and CSS

You'll need to include jQuery, the FocusPoint script, and FocusPoint css file. Example:

	<link rel="stylesheet" href="focuspoint.css">
	<script src="jquery.js"></script>
	<script src="focuspoint.js"></script>
	
#### Mark up image container

Specify the image dimensions and focus point coordinates on the image container. Note: I know it shouldn't really be necessary to specify image dimensions but I've found this to be more reliable than reading the dimensions from the image. Example:

	<div class="focuspoint"
	data-focus-x="0.331"
	data-focus-y="-0.224"
	data-image-w="400"
	data-image-h="300">
		<img src="image.jpg" alt="" />
	</div>

#### Fire FocusPoint plugin

Usually the best place for this will be inside your `$(document).ready()` function.

	//Fire plugin
	$('.focuspoint').focusPoint();

There aren't many configuration options available at the moment, but if you want to you can prevent images being re-focused when the window is resized like so:

	$('.focuspoint').focusPoint({
		reCalcOnWindowResize : false
	});
	
You can re-focus images at any time with `adjustFocus()`. This recalculates where the image should be positioned in the frame. An example where you may need to do this is if you are using FocusPoint images within a slider. FocusPoint can't do it's calculations properly if an image container is hidden (as it won't have any dimensions), so you should trigger `adjustFocus()` on the target container as soon as it becomes visible. Example:

	$('.focuspoint').adjustFocus()

## Tips & Tricks

#### Image composition
In order for this concept of 'fluid cropping' to work well, your images will need to include some negative space around the subject that you are happy to be cropped out when necessary. You don't need space on every side of the subject - but for maximum flexibility you'll want to include both some vertical and horizontal negative space.

#### Pure CSS alternative

You can get a similar effect to this technique using only CSS and the `background-position` and `background-size` properties. Browser support isn't as good (at the moment) and your image won't be positioned exactly the same way - but it's pretty close. The CSS technique leans towards preserving the original composition while FocusPoint is biased towards keeping the subject of the image in the centre of the frame. Depending on your requirements either technique may suit you better.

[Pure CSS Example and comparison](http://htmlpreview.github.io/?https://github.com/jonom/jquery-focuspoint/blob/master/demos/css-js-comparison/index.html)

#### SilverStripe CMS integration

This plugin plays really well with the [silverstripe-focuspoint](https://github.com/jonom/silverstripe-focuspoint) module, which lets you set the focuspoint on any image with just a click, and makes the info available in your front-end templates so you don't have to do any math. It also provides really easy 'destructive' cropping outputting resampled images cropped to a particular width and height based on the same logic.

## Feedback welcome!

Nothing would encourage me to keep updating this script more than hearing how it's been used in the real world. Get in touch with me at [jonathonmenz.com](http://jonathonmenz.com) to let me know how you've used this plugin or any suggestions you have for improving it. Please report bugs or issues [on github](https://github.com/jonom/jquery-focuspoint).

**Feeling generous?**  
If FocusPoint helped you impress a client and you want to say thanks, you're welcome to [leave a small donation](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=5VUDD3ACRC4TC) to help fund the purchase of coffee, which will help facilitate future development. But that is totally optional.

