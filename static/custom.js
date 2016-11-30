$(document).ready(function () {
  console.log("jquery is working")
})

// initialises google maps, Amsterdam as a default location on the map
function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 8,
    center: {lat: 52.3702157, lng: 4.895167899999933}
  });
  var geocoder = new google.maps.Geocoder();

  document.getElementById('submit').addEventListener('click', function() {
    geocodeAddress(geocoder, map);
  });
}

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

      $.get("/searchevent", latlen)

    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}