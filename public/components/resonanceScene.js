//A System to handle Resonance Audio
AFRAME.registerComponent('resonancesystem', {
  init: function () {
    // Set up the tick throttling
    this.tick = AFRAME.utils.throttleTick(this.tick, 30, this);

    // List of Sources handles by resonance //TODO
    this.sources = [];

    // Audio scene globals
    this.audioContext = new (window.AudioContext || window.webkitAudioContext);
    this.resonanceAudioScene = new ResonanceAudio(this.audioContext, { ambisonicOrder: 3 });
    // Connect the scene’s binaural output to stereo out.
    this.resonanceAudioScene.output.connect(this.audioContext.destination);

    //Source Handling (TODO: refactor out)
    let sourceEls = document.querySelectorAll('[resonancesource]');
    //register all source components
    let self = this;
    sourceEls.forEach(function (e) {
      self.registerMe(e.components.resonancesource)
    });
    //create all Sources //TODO put in registerMe
    this.sources.forEach(function (s) {
      s.system = self;
      s.resonanceAudioScene = self.resonanceAudioScene;
      s.audioContext = self.audioContext;
      s.audioElementSource = s.audioContext.createMediaElementSource(s.sourceNode);
      s.sceneSource = s.resonanceAudioScene.createSource();
      s.sceneSource.setGain(s.data.gain);
      s.audioElementSource.connect(s.sceneSource.input);
      if (s.data.autoplay) { s.sourceNode.play() }
    });

    this.audioContext.suspend();

    // TODO: This is crashing in recent versions of Resonance for me, and I'm
    // not sure why. It does run successfully without it, though.
    // Rough room dimensions in meters (estimated from model in Blender.)
    /*let roomDimensions = {
      width : 6,
      height : 3,
      depth : 6
    };
    // Simplified view of the materials that make up the scene.
    let roomMaterials = {
      left : 'plywood-panel', // Garage walls
      right : 'plywood-panel',
      front : 'plywood-panel',
      back : 'metal', // To account for the garage door
      down : 'polished-concrete-or-tile', // garage floor
      up : 'wood-ceiling'
    };
    resonance.setRoomProperties(roomDimensions, roomMaterials);*/
  },
  /**
   * Tick function that will be wrapped to be throttled.
   */
  tick: function (t, dt) {
    const cameraEl = this.el.camera.el;
    this.resonanceAudioScene.setListenerFromMatrix(cameraEl.object3D.matrixWorld);
  },

  registerMe: function (el) {
    this.sources.push(el);
    //TODO add logic to register source?
  },

  unregisterMe: function (el) {
    var index = this.sources.indexOf(el);
    this.sources.splice(index, 1);
    //TODO add logic to un-register source?
  },

  run: function () {
    this.audioContext.resume();
    this.sources.forEach(function (s) {
      if (s.data.autoplay) {
        s.sourceNode.play();
      }
    });
  }
});

AFRAME.registerComponent('resonancesource', {
  dependencies: ['geometry', 'position'],
  schema: {
    src: { type: 'string', default: '' },
    loop: { type: 'boolean', default: true },
    autoplay: { type: 'boolean', default: true },
    gain: { type: 'number', default: 1 },
  },
  init: function () {
    this.pos = new AFRAME.THREE.Vector3();
    this.system = undefined;
    this.resonanceAudioScene = undefined;
    this.audioContext = undefined;
    this.audioElementSource = undefined;
    this.sceneSource = undefined;



    //tick throttle for performance
    this.thick = AFRAME.utils.throttleTick(this.tick, 30, this);

    //this.el.sceneEl.addEventListener('loaded', this.afterLoadInit.bind(this));

    //get audio source from aframe asset management with #id
    const el = document.querySelector(this.data.src)
    this.sourceNode = document.querySelector(this.data.src)
    //set looping
    if (this.data.loop) {
      this.sourceNode.setAttribute('loop', 'true');
    } else {
      this.sourceNode.removeAttribute('loop');
    }
  },

  tick: function (t, td) {
    this.setPos();
  },

  afterLoadInit: function () {
    //get resonance System
    this.system = this.el.sceneEl.components['resonancesystem'];
    this.resonanceAudioScene = system.resonanceAudioScene;
    this.audioContext = system.audioContext;
    this.audioElementSource = this.audioContext.createMediaElementSource(this.sourcenode);
    this.sceneSource = this.resonanceAudioScene.createSource();
    this.sceneSource.setGain(this.data.gain);
    audioElementSource.connect(source.input);
    if (this.data.autoplay) { this.sourceNode.play() }
  },

  setPos: function () {
    if (this.sceneSource) {
      this.sceneSource.setFromMatrix(this.el.object3D.matrixWorld);
    }
  }
});