const states = {
  PAUSE: 1,
  PLAY: 2,
  REWIND: 3,
  FF: 4
};

new Vue({
  el: '#app',
  mounted: function() {
    this.video = document.querySelector('video');
    this.video.pause();
    this.video.addEventListener('pause', () => this.videoState = states.PAUSE);
    this.video.addEventListener('play', () => this.videoState = states.PAUSE);
  },
  data: {
    seeking: false,
    seekSpeed: 0,
    video: null,
    videoState: states.PAUSE,
    tiltThreshold: 0.025 // threshold for scrubbing to take effect
  },
  computed: {
    videoStateIcon: function() {
      switch (this.videoState) {
        case states.PAUSE:
          return 'fa fa-pause';
        case states.PLAY:
          return 'fa fa-play';
        case states.REWIND:
          return 'fa fa-fast-backward';
        case states.FF:
          return 'fa fa-fast-forward';
        default:
          throw new Error(`Unrecognized state ${this.videoState}`);
      }
    },
    seekStatusTransform: function() {
      const translate = Math.abs(this.seekSpeed) < this.tiltThreshold ? 0 : this.seekSpeed * 100;
      return `transform: translateX(${translate}vw)`
    }
  },
  methods: {
    toggleSeekMode: function() {
      this.seeking = !this.seeking;
      if (this.seeking) {
        this.listener = window.addEventListener('deviceorientation', _.throttle(this.handleOrientation, 100));
        this.video.pause();
      }
      else {
        window.removeEventListener('deviceorientation', this.listener);
        this.video.play();
      }
    },
    handleOrientation: function(event) {
      if (!this.seeking)
        return;
      // https://developer.mozilla.org/en-US/docs/Web/API/Detecting_device_orientation
      // const x = event.beta;
      const y = event.gamma;
      // const z = event.alpha;
      const n = y / 180; // normalized value between 0 and 1
      const s = 7.5; // scale factor
      if (Math.abs(n) < this.tiltThreshold) {
        this.videoState = states.PAUSE;
        return;
      }
      else 
        this.video.currentTime += (Math.pow(n*s, 4) * Math.sign(n));
      this.videoState = n < 0 ? states.REWIND : states.FF;
      this.seekSpeed = n;
    }
  }
});
