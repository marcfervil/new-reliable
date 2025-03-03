<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<title>
		Translating Viewport Coordinates To Element-Local Coordinates Using .getBoundingClientRect()
	</title>
 
	<link rel="stylesheet" type="text/css" href="./demo.css" />
</head>
<body>
 
	<h1>
		Translating Viewport Coordinates To Element-Local Coordinates Using .getBoundingClientRect()
	</h1>
 
	<div class="box box-a"></div>
	<div class="box box-b"></div>
	<div class="box box-c"></div>
	<div class="box box-d"></div>
	<div class="box box-e"></div>
	<div class="box box-f"></div>
 
	<script type="text/javascript">
 
		document.addEventListener( "click", handleClick, false );
 
		function handleClick( event ) {
 
			if ( ! event.target.classList.contains( "box" ) ) {
 
				return;
 
			}
 
			// Get the VIEWPORT-relative coordinates of the click.
			// --
			// NOTE: The MouseEvent interface has a bunch of coordinate-related values,
			// including offsetX and offsetY which may seem relevant to this demo. But,
			// this demo is NOT about the MouseEvent - it's about coordinate translation.
			// It's only coincidental that I'm using mouse events to drive it.
			var viewportX = event.clientX;
			var viewportY = event.clientY;
 
			// Now that we have the VIEWPORT coordinates of the CLICK, we need to get the
			// VIEWPORT position of the target element. This will give us coordinates
			// that are operating in the same grid system. Luckily, that's exactly what
			// the .getBoundingClientRect() method gives us!!
			var boxRectangle = event.target.getBoundingClientRect();
 
			// Now that we have the targets VIEWPORT coordinates and the click's VIEWPORT
			// coordinates, we can take the difference between the two in order to
			// translate the VIEWPORT coordinates into target-LOCAL coordinates.
			var localX = ( viewportX - boxRectangle.left );
			var localY = ( viewportY - boxRectangle.top );
 
			// In this particular demo, we have to take into account the border of the
			// box element since the .getBoundingClientRect() values will be relative to
			// the outer-most boundary of the box.
			var borderWidth = parseInt( window.getComputedStyle( event.target ).borderTopWidth, 10 );
			localX -= borderWidth;
			localY -= borderWidth;
 
			// Now that we have the target-LOCAL coordinates, let's append a DOT element
			// to the target container for proof of purchase.
			var point = document.createElement( "div" );
			point.classList.add( "point" );
			point.style.left = ( localX + "px" );
			point.style.top = ( localY + "px" );
			event.target.appendChild( point );
 
			console.log(
				"Translating Viewport {", viewportX, ",", viewportY, "}",
				"to Local {", localX, ",", localY, "}"
			);
 
		}
 
	</script>
 
</body>
</html>