// Helper functions
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
	
// SLIDES NAV	
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

/////////////////JQUERY STARTS HERE //////////////////

	$(document).ready(function() {
		console.log("dom ready")
		$('#map').hide()
		$('#submitMap').click(function() {
	   		$('#map').show()
	    	initMap()
		$(window).scroll(function(){
			console.log("someone scrolled")
  		})
	})

	////////---Text effect rotating
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
 	
////////---Scroll functions
	
$(document).on('click', 'a', function(event){
    event.preventDefault();

    $('html, body').animate({
        scrollTop: $( $.attr(this, 'href') ).offset().top
    }, 1000);
});


//////////----Button jumps
	$('#btnSpot').hover(function() {
		$("#btnSpot").addClass('animated shake').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', 
			function() {
			$('#btnSpot').removeClass('animated shake');
		});
});

//////////----Functions for random timeout images distortion

	function addRandomElement(thesource){
		return thesource[ getRandomInt(0, thesource.length - 1) ]
	}

	var randomm = function() {
		// Array with the elements
		var arr = $('.sv')
		console.log(arr)
		// How many to grab
		var elemnr = arr.length / 2
		// Empty array to hold the random elements
		var targets = []
		// Add random elements
		for (var i = 0; i < elemnr; i++) {
			targets.push( addRandomElement( arr ) )
		}
		console.log(targets)
		// animate elem from targets
		// select each elem from my array target
		$(targets).each(function(i, val) {
			console.log(val)
			if (Math.round(Math.random())) {
				$(val).addClass('jello')
			} else {
				$(val).removeClass('jello')
			}
		});		
	}
        
  	var randomTime = function() {
		return Math.random() * 1000
	}

	setInterval(function(){
		setTimeout(randomm, randomTime() )
	}, 1000);
	
})


// initialises google maps, Amsterdam as a default location on the map
function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 8,
    center: {lat: 52.3702157, lng: 4.895167899999933}
  });
  var geocoder = new google.maps.Geocoder();

  document.getElementById('submitMap').addEventListener('click', function() {
    geocodeAddress(geocoder, map);
  });
}

events = []

// searches location, outputs latitude and longitude to facebook search
function geocodeAddress(geocoder, resultsMap) {
  var address = document.getElementById('address').value;
  geocoder.geocode({'address': address}, function(results, status) {
    if (status === 'OK') {
      resultsMap.setCenter(results[0].geometry.location);
      var marker = new google.maps.Marker({
        map: resultsMap,
        position: results[0].geometry.location
      })

      let latlen = {
        latitude: results[0].geometry.location.lat(),
        longitude: results[0].geometry.location.lng()
      }

      console.log(latlen)

      $.get("/searchevent", latlen, (data, stat) => {
        $('#results').empty()
        console.log(data)

        for (let i = 0; i < data.length; i++) {
        	let date = data[i].startTime.substring(0, 10)
        	let time = data[i].startTime.substring(11, 16)

        	events.push(data[i])

          $('#results').append("<div class='col-md-4'><div class='box'>"+ data[i].name + "<br>" + data[i].venue.location.city + "<br>" + date + ", " + time + "<br>" +"<a href=https://www.facebook.com/events/" + data[i].id + ">go to event</a></div></div>")          
        }
      })

    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

// sorting results according to date
$('#sortDate').click(function () {


	for (let i = 0; i < events.length; i++) {
	events[i].startTime.sort(function(a,b){return a.getTime() - b.getTime()})
	}

	alert(events.join(","));

	$('#results').empty()

    for (let i = 0; i < events.length; i++) {

    	let date = events[i].startTime.substring(0, 10)
    	let time = events[i].startTime.substring(11, 16)

      $('#results').append("<div class='col-md-4'><div class='box'>"+ data[i].name + "<br>" + data[i].venue.location.city + "<br>" + date + ", " + time + "<br>" +"<a href=https://www.facebook.com/events/" + data[i].id + ">go to event</a></div></div>")          
    }
})
