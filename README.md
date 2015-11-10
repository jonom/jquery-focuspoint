# jQuery FocusPoint

## Intelligent cropping for flexible image containers

![image](demos/img/demo.jpg?raw=true)

Websites don't have a single layout any more. The space you have for an image may be portrait on a laptop, landscape on a tablet, and square on a mobile - particularly if you're using a full-screen image.

If you have to use the same image file in all these contexts, you might not be happy with the results you get when you 'fill' the allocated space with your image. Your subject might be clipped or completely missing, or just really awkward looking.

FocusPoint makes sure your image looks great in any container, by ensuring the 'spare' parts of your image (negative space) are cropped out before the important parts.

For a quick overview of the plugin check out this [video by Petr Tichy](http://youtu.be/Wxmxsw65BQw?t=6m49s).

## Examples

Here are some examples showing the same image cropped a variety of different ways at once. Make sure you play with resizing the browser window to get a feel for what FocusPoint does.

* 	[Lizard](http://jonom.github.io/jquery-focuspoint/demos/grid/lizard.html)
* 	[Kangaroo](http://jonom.github.io/jquery-focuspoint/demos/grid/kangaroo.html)
* 	[Dolphin](http://jonom.github.io/jquery-focuspoint/demos/grid/dolphin.html)
* 	[Bird](http://jonom.github.io/jquery-focuspoint/demos/grid/bird.html)

And here is a [full screen](http://jonom.github.io/jquery-focuspoint/demos/full-screen/index.html) demo.

## How does it work?

The idea is that most images have a focal point or subject that is the most important part of the image. In the case of a traditional portrait photo this would be the subject's face (or specifically the spot right between their eyes). In the image above it's arguably the point halfway between the two people's faces.

FocusPoint requires you to indicate where this focal point is located within your image, and then works in the background to ensure that point is never cropped out.


## How to use

#### 1. Calculate your image's focus point

An image's focus point is made up of x (horizontal) and y (vertical) coordinates. The value of a coordinate can be a number with decimal points anywhere between -1 and +1, where 0 is the centre. X:-1 indicates the left edge of the image, x:1 the right edge. For the y axis, y:1 is the top edge and y:-1 is the bottom.

![image](demos/img/grid.png?raw=true)

**Confused?** Don't worry, there's a handy script included to help you find the focus coordinates of an image with a single click. Check out the [helper tool](http://jonom.github.io/jquery-focuspoint/demos/helper/index.html) *(vastly improved courtesy of [@auginator](https://github.com/auginator)).*

#### 2. Include javascript and CSS

You'll need to include jQuery (v1.9 or greater), the FocusPoint script, and FocusPoint css file. Example:

```html
<link rel="stylesheet" href="focuspoint.css">
<script src="jquery.js"></script>
<script src="focuspoint.js"></script>
```

#### 3. Mark up your image container

Specify the image dimensions and focus point coordinates on the image container. The image will take up whatever space is available in the container, so make sure there is some space to fill by setting a height for the container in your CSS. Example:

```html
<div class="focuspoint"
data-focus-x="0.331"
data-focus-y="-0.224"
data-image-w="400"
data-image-h="300">
	<img src="image.jpg" alt="" />
</div>
```

Note: setting `data-image-w` and `data-image-h` is optional but recommended. Omitting these value means your image will not be positioned correctly inside the frame until it has finished loading, which may cause a visible jump.

#### 4. Fire FocusPoint plugin

Usually the best place for this will be inside your `$(document).ready()` function.

```javascript
//Fire plugin
$('.focuspoint').focusPoint();
```

That's it!

#### Configuration options

FocusPoint comes with a few options you can change to suit your needs.

| Option                 | Values                | Default | Description |
| ---------------------- | --------------------- | ------- | ----------- |
| `reCalcOnWindowResize` | `true` or `false`     | `true`  | Whether or not to re-adjust image when the window is resized |
| `throttleDuration`     | Int e.g. `0` or `100` | `17`    | Throttling rate in milliseconds. Set to `0` to disable throttling. |

Example usage:

```javascript
$('.focuspoint').focusPoint({
	throttleDuration: 100 //re-focus images at most once every 100ms.
});
```

#### FocusPoint functions

Once you have initialised FocusPoint on an image container you can access FocusPoint methods like this: `$(someContainer).data('focusPoint').methodName()`.

Or the shorter way, like this: `$(someContainer).focusPoint('methodName')`

| Function        | Description |
| --------------- | ----------- |
| `adjustFocus()` | Re-do calculations and re-position an image in it's frame. Call if container dimensions change. |
| `windowOn()`    | Start window event listener and re-focus image when window is resized |
| `windowOff()`   | Stop re-focusing image when window is resized |

#### Using FocusPoint in content sliders

Currently FocusPoint can't do it's calculations properly if an image container or it's parent is set to `display:none`, as it won't have any dimensions. This can cause problems with sliders that hide non-active slides. A work-around for now is to trigger `adjustFocus()` on the image container as soon as it become visible.

## Tips & Tricks

#### Image composition
In order for this concept of 'fluid cropping' to work well, your images will need to include some negative space around the subject that you are happy to be cropped out when necessary. You don't need space on every side of the subject - but for maximum flexibility you'll want to include both some vertical and horizontal negative space.

#### Pure CSS alternative

You can get a similar effect to this technique using only CSS and the `background-position` and `background-size` properties. Browser support isn't as good (at the moment) and your image won't be positioned exactly the same way - but it's pretty close. The CSS technique leans towards preserving the original composition while FocusPoint is biased towards keeping the subject of the image in the centre of the frame. Depending on your requirements either technique may suit you better.

* [Pure CSS example and comparison](http://jonom.github.io/jquery-focuspoint/demos/css-js-comparison/index.html)
* [Helper tool for calculating CSS values](http://jonom.github.io/jquery-focuspoint/demos/helper/index.html)

#### SilverStripe CMS integration

This plugin plays really well with the [silverstripe-focuspoint](https://github.com/jonom/silverstripe-focuspoint) module, which lets you set the focuspoint on any image with just a click, and makes the info available in your front-end templates so you don't have to do any math. It also provides really easy 'destructive' cropping outputting resampled images cropped to a particular width and height based on the same logic.

## Feedback welcome!

Nothing would encourage me to keep updating this script more than hearing how it's been used in the real world. Get in touch with me at [jonathonmenz.com](http://jonathonmenz.com) to let me know how you've used this plugin or any suggestions you have for improving it. Please [report bugs or issues on github](https://github.com/jonom/jquery-focuspoint/issues).

**Note:** To date I'm not yet aware of any live websites (apart from my own) that use this plugin - so please get in touch if you launch a site that uses FocusPoint!

#### Tip jar

If FocusPoint helped you impress a client and you want to say thanks, you're welcome to [leave a small donation](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=5VUDD3ACRC4TC) to help fund the purchase of coffee, which will help me stay awake during future development.

[<img src="https://www.paypalobjects.com/en_AU/i/btn/btn_donate_LG.gif" alt="Donate">](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=5VUDD3ACRC4TC)

Donations received / Warm fuzzies generated: **6**  
Caffé Lattes funded: **17** :coffee: :relieved:  
**Thanks!** Daniil, Cohan, Romulo, Lemuel, David

## Changelog

#### v1.1.1 2014-09-23
Minor fixes
#### v1.1.0 2014-09-18
Refactored code (thanks @xat)  
Added ability to start/stop window-resize listener (thanks @xat)  
Use % instead of px for positioning, for better scaling  
Added shortcuts to plugin methods
#### v1.0.3 2014-09-06
Throttled window resize updates
#### v1.0.2 2014-09-05
Made setting image width and height on shell optional (thanks @luruke)
#### v1.0.1 2014-09-04
Cleaned up variables
#### v1.0.0 2014-08-19
Initial release
