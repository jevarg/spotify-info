const SpotifyWebHelper = require('spotify-web-helper');
const http = require('http-request');
const _ = require('lodash');
const fs = require('fs');

const helper = SpotifyWebHelper();
console.log('Starting...');

helper.player.on('error', error => {
  console.error(error);
  if (error.message.match(/No user logged in/)) {
    // also fires when Spotify client quits
  } else {
    // other errors: /Cannot start Spotify/ and /Spotify is not installed/
  }
});

helper.player.on('ready', () => {
  console.log('Ready !');

  helper.player.on('track-will-change', updateTrackInfo);

  if (helper.status.track && Object.keys(helper.status.track).length !== 0) {
    updateTrackInfo(helper.status.track);
  }
});

updateTrackInfo = (track) => {
  if (!track) {
    return;
  }
  writeTrackTextInfo(track.track_resource.name, track.artist_resource.name);

  let resource_uri = track.track_resource.uri;

  http.get('https://open.spotify.com/oembed?url=' + resource_uri, function (err, res) {
    if (err) {
      console.error(err);
      return;
    }

    let track_info = JSON.parse(res.buffer.toString('utf8'));

    if (track_info.thumbnail_url) {
      http.get({
        url: track_info.thumbnail_url
      }, 'track_artwork.jpg', function (err, res) {
        if (err) {
          console.error(err);
          return;
        }

        console.log(res.code, res.headers, res.file);
      });
    }
  });
}

writeTrackTextInfo = (title, artist) => {
  fs.writeFile("./track_title.txt", `${title}\r\n${artist}`, function (err) {
    if (err) {
      return console.log(err);
    }
  }); 
}