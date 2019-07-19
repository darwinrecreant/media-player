var handleClientLoad = (() => {
 /**
   * Load the API's client and auth2 modules.
   * Call the initClient function after the modules load.
   */
  function handleClientLoad() {
    return new Promise((resovle, reject) => {
        gapi.load('client', () => {
        gapi.client.init({
          'apiKey': 'AIzaSyBGscE5JoOQCAtZw0XbKjSjEcqknqUBW7Y',
          'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'],
          'scope': 'https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/youtubepartner'
        }).then(resovle, reject).then(start);
      });
    });
  }

  function ytRequest(requestMethod, path, params, properties) {
    params = removeEmptyParams(params);
    var request;
    if (properties) {
      var resource = createResource(properties);
      request = gapi.client.request({
          'body': resource,
          'method': requestMethod,
          'path': path,
          'params': params
      });
    } else {
      request = gapi.client.request({
          'method': requestMethod,
          'path': path,
          'params': params
      });
    }
    request.execute((e) => {
      resolve(e);
    });
  }


  class VideoEntity {
    endCallbacks = new Set();
    player;
    videoId;
    elementId;
    duration;

    constructor(eid, id) {
      this.videoId = id;
      this.elementId = eid;
    }

    init() {
      return Promise.resolve({});
    }

    play(at) {
      
    }

    stop() {

    }

    pause() {

    }

    change(id) {

    }

    onEnd(callback) {
      this.endCallbacks.add(callback);
    }

  }

  class YoutubeVideo extends VideoEntity {
    init() {
      if (this.player) return Promise.resolve(this.player)
      return new Promise((resolve, reject) => this.player = new YT.Player(this.elementId, {
        videoId: this.videoId,
        events: {
          'onReady': () => resolve(this.player),
          'onStateChange': (e) => {
            if (e.data == YT.PlayerState.ENDED) {
              this.player.stopVideo();
              this.endCallbacks.forEach((callback) => callback())
            }
          }
        },
        playerVars: { 'autoplay': 1, 'controls': 0, 'modestbranding': 1 },
      }));
    }

    play(at) {
      this.init().then((player) => {
        if (at) {
          player.seekTo(at, true);
        }
        player.playVideo();
      });
    }

    stop() {
      this.init().then((player) => {
        player.stopVideo();
      });
    }

    pause() {
      this.init().then((player) => {
        player.pauseVideo();
      });
    }

    change(id) {
      this.init().then((player) => {
        player.loadVideoById(id);
      });
    }
  }

  function start() {
    try {
        let settings = parseHash(location.hash);
        update(settings);
    } catch (e) {}
    window.addEventListener("hashchange", () => {
        let settings = parseHash(location.hash);
        update(settings);
    }, false);
  }

  let currentVid;

  function update(settings) {
    if (settings == null) return;
    let start = settings['n'] - settings['s'] - settings['p'];
    start /= 1000;
    const videoId = settings['v'];
    if (currentVid) {
      currentVid.change(videoId);
    } else {
      currentVid = new YoutubeVideo('player', videoId);
    }
    currentVid.play(start);
  }

  function parseHash(hash) {
    try {
      const query = new URLSearchParams(decodeURIComponent(hash.substring(1)));
      if (!query.get('v') || !query.get('s') || !query.get('p') || !query.get('n')) {
        return null;
      }
      return {
        "v": query.get('v'),
        "n": parseInt(query.get('n'), 10),
        "s": parseInt(query.get('s'), 10),
        "p": parseInt(query.get('p'), 10),
      };
    } catch (e) {
      return null;
    }
  }

  return handleClientLoad;
})()
 