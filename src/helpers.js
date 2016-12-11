const request = require( 'request' )
const async = require ( 'async' )
const express = require( 'express' )
const app = express( )

let generateRandomString = function(length) {
	
  // function to create a a random string for the state
	
  let text = ''
	let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

	for (var i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length))
	}
	return text
}

let getTracks = ( playlistArray, accessToken, callback ) => {
  
  // function that puts all tracks form the user's playlist into an array!

  let artists =  []
  let artistCounter = 0  
  playlistArray.forEach ( playlist => {
    artistCounter += playlist.tracks.total
    let playlistTrackRequest = {
      url: playlist.tracks.href,
      headers: { 'Authorization': 'Bearer ' + accessToken },
      json: true
    }

    request.get( playlistTrackRequest, ( err, response, tracks ) => {
      // send a request to the Spotify API to retrieve track data

      tracks.items.forEach( trackOfArray => { // for every artist of the song
        
        trackOfArray.track.artists.forEach( artistOfTrack => {
          artists.push ( artistOfTrack.name )
          // controlling the updates: only do callback when the artist array big enough
          if ( artists.length >= artistCounter ) {
            callback ( artists )
          }
        })
      })
    })
  })
}

module.exports = {
  generateRandomString: generateRandomString,
  getTracks: getTracks
}