
	function before(){
		document.getElementById("main").style.marginLeft = "30px";
		document.getElementById("leftNav").style.width = "30px";
	}

	function openNav(){
		document.getElementById("leftNav").style.width = "400px";
		document.getElementById("main").style.marginLeft = "400px";

	}

	function closeNav(){
		document.getElementById("leftNav").style.width = "30px";
		document.getElementById("main").style.marginLeft = "30px";
	}



$(document).ready(function() {
	$("#js-rotating").Morphext({
    // The [in] animation type. Refer to Animate.css for a list of available animations.
   	animation: "bounceIn",
    // An array of phrases to rotate are created based on this separator. Change it if you wish to separate the phrases differently (e.g. So Simple | Very Doge | Much Wow | Such Cool).
    separator: ",",
    // The delay between the changing of each phrase in milliseconds.
    speed: 1500,
    complete: function () {
        // Called after the entrance animation is executed.
    }
});

	$('.anchor-scroll').anchorScroll({
    scrollSpeed: 800, // scroll speed
    offsetTop: 0, // offset for fixed top bars (defaults to 0)
    onScroll: function () { 
      // callback on scroll start
    },
    scrollEnd: function () { 
      // callback on scroll end
    }
 });

})
