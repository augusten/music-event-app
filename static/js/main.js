
	
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
	console.log("dom ready")
	$(window).scroll(function(){
		console.log("someone scrolled")
	})


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
 	
	function scrollTo(aid){
		var taag = $("a[name='"+ aid +"']");
		$("html, body").animate({scrollTop: taag.offset().top}, 1000)
	}

	$('#link').click(function(){
		scrollTo('aki')
	})




// function doSomething() {
// 	 $("#sv2").addClass('animated jello');
// 	 console.log('jump works')
// }

// function init() {
//     var try = function() {
//         doSomething();
//         var randomtime = Math.random() * 1000;
//         setTimeout(try, randomtime);
//     }
//     myFunction();
// }

// $(function() {
//     init();
// });

// function doIt() {
// // do stuff, happens to use jQuery here (nothing else does)
// $(“#sv2”).addClass(“animated jello”);

// clearInterval(timer);
// timer = setInterval(toggleSomething, (Math.random() * 1000) );
// }

// // The random range will be from 0 to 3000, or whatever you want !
// var timer = setInterval(doIt, 1000);
// // 1000 = Initial timer when the page is first loaded


// function jumping() {
//        // do stuff with jquery
// }

// var randomtime = Math.random() * 1000;
// setInterval(jumping, randomtime);



// 1000 = Initial timer when the page is first loaded

	var randomm = function() {
		var arr = $('.sv')
		var item = arr[Math.floor(Math.random()*arr.length)];
        $(item).animate('animated jello');
            return false;
    };
  	var randomTime = function() {
		return Math.random() * 1000
	}

	setInterval(function(){
		setTimeout(randomm, randomTime() )
	}, 500);
	
})



