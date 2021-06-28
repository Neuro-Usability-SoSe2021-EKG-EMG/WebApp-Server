//A System to handle Resonance Audio
AFRAME.registerComponent('resonancesystem', {
  init: function () {
    // Set up the tick throttling
    this.tick = AFRAME.utils.throttleTick(this.tick, 50, this);

    // List of Sources handles by resonance //TODO
    this.sources = [];

    // Audio scene globals
    this.audioContext = new (window.AudioContext || window.webkitAudioContext);
    this.resonanceAudioScene = new ResonanceAudio(this.audioContext, { ambisonicOrder: 3 });
    // Connect the scene’s binaural output to stereo out.
    this.resonanceAudioScene.output.connect(this.audioContext.destination);

    //Source Handling
    let sourceEls = document.querySelectorAll('[resonancesource]');
    //register all source components
    let self = this;
    sourceEls.forEach(function (e) {
      self.registerMe(e.components.resonancesource)
    });
    
    this.audioContext.suspend();

    // Set up a 80m², 4 bed ICU
    // NEEDS TO BE MIRRORED IN index.html for correct representation
    let roomDimensions = {
      width : 10,
      height : 3,
      depth : 8
    };
    // Simplified view of the materials that make up the scene
    let roomMaterials = {
      left : 'plaster-smooth', // WALLS
      right : 'glass-thick', // windows on one side
      front : 'plaster-smooth',
      back : 'plaster-smooth',
      down : 'linoleum-on-concrete', // floor
      up : 'acoustic-ceiling-tiles' // a hospital should have those
    };
    this.resonanceAudioScene.setRoomProperties(roomDimensions, roomMaterials);
  },

  /**
   * Tick function that will be wrapped to be throttled.
   */
  tick: function (t, dt) {
    const cameraEl = this.el.camera.el;
    this.resonanceAudioScene.setListenerFromMatrix(cameraEl.object3D.matrixWorld);
  },

  registerMe: function (el) {
    //create and finish init of audio source
    console.log("Registering audio source: ");
    console.log(el);
    el.system = this;
    el.resonanceAudioScene = this.resonanceAudioScene;
    el.audioContext = this.audioContext;
    el.audioElementSource = el.audioContext.createMediaElementSource(el.sourceNode);
    el.sceneSource = el.resonanceAudioScene.createSource();
    el.sceneSource.setGain(el.data.gain);
    el.sceneSource.setSourceWidth(el.data.width);
    el.audioElementSource.connect(el.sceneSource.input);

    this.sources.push(el);
  },

  unregisterMe: function (el) {
    var index = this.sources.indexOf(el);
    this.sources.splice(index, 1);
    //TODO add logic to un-register source?
  },

  /**
   * Circumvent browser autoplay block
   */
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
    loop: { type: 'boolean', default: false },
    autoplay: { type: 'boolean', default: false },
    gain: { type: 'number', default: 1 },
    width: {type: 'number', default: 0},
    starttime:  {type: 'number', default: 0},
    stoptime: {type: 'number', default: Infinity}
  },
  init: function () {
    this.pos = new AFRAME.THREE.Vector3();
    this.system = undefined;
    this.resonanceAudioScene = undefined;
    this.audioContext = undefined;
    this.audioElementSource = undefined;
    this.sceneSource = undefined;

    //tick throttle for performance
    this.thick = AFRAME.utils.throttleTick(this.tick, 50, this);

    //get audio source from aframe asset management with #id
    this.sourceNode = document.querySelector(this.data.src);
    console.log(this);
    console.log(this.sourceNode);
    //set looping
    if (this.data.loop) {
      this.sourceNode.setAttribute('loop', 'true');
    } else {
      this.sourceNode.removeAttribute('loop');
    }
  },

  tick: function (t, td) {
    //TODO performance?
    this.setSoundPos();
  },

  setSoundPos: function () {
    if (this.sceneSource) {
      this.sceneSource.setFromMatrix(this.el.object3D.matrixWorld);
    }
  }
});

AFRAME.registerComponent('raycaster-listen', {
	init: function () {
    let timer;
    // Use events to figure out what raycaster is listening so we don't have to
    // hardcode the raycaster.
    this.el.addEventListener('raycaster-intersected', evt => {
      this.raycaster = evt.detail.el;
      timer = setTimeout(() => this.el.setAttribute('material', {color: 'orange', opacity: 0.8}), 5000);
      //TODO unregister(?) after certain time
    });
    this.el.addEventListener('raycaster-intersected-cleared', evt => {
      this.raycaster = null;
      clearInterval(timer);
    });
  },

  tick: function () {
    if (!this.raycaster) { return; }  // Not intersecting.

    //TODO add logic to looking at things
    //let intersection = this.raycaster.components.raycaster.getIntersection(this.el);
    //if (!intersection) { return; }
    //console.log(intersection.point);
  }
});

/**
 * A Patient Component
 * meant to be used on entity in scene
 * creates it's own resonance sound entities and adds them to the scene
 */
AFRAME.registerComponent('patient', {
  schema: {
    id: {type: 'string'},
    ekg: { type: 'boolean', default: true },
    hr: {type: 'number', default: 60},
    ivpump: { type: 'boolean', default: false },
    ventilator: { type: 'boolean', default: false },
    cough: { type: 'boolean', default: false },      //[#id, duration (ms)]
    sounds: {
      default: new Map(),
      parse: function (value) {
        let array2d = value.split('/').map(function(s) {
          return s.split(",");
        });
        return new Map(array2d);
      },
      stringify: function (value) {
        return value.join('/'); //TODO not working, still standard
      }
    },
    starttime:  {type: 'number', default: 0},
    stoptime: {type: 'number', default: Infinity}
  },

  init: function () {
    console.log("Adding patient");
    console.log("With sounds:")
    console.log(this.data.sounds)

    // Set up the tick throttling
    this.tick = AFRAME.utils.throttleTick(this.tick, 100, this);

    //Variables
    this.needsHelp = false;
    this.sounds = []; //list of {name, starttime, sourceNode}
    this.nextSoundId = 0;

    //---- Appearance ----
    this.el.setAttribute('geometry',{primitive: 'sphere', radius: 0.8});
    this.el.setAttribute('material',{color: 'green', opacity: 0.8});

    //---- EKG ----
    console.log("HR: " + this.data.hr);
    this.ekgpause = 60 / this.data.hr - 0.62; //in seconds
    console.log("pause between ekg beeps: " + this.ekgpause);

    console.log('#ekgBeep'+this.data.id);
    if (this.data.ekg){
      this.el.setAttribute('resonancesource', {
        src: '#ekgBeep'+this.data.id,
        loop: false ,
        autoplay: true,
        gain: 0.05
      });
      this.ekgSound = this.el.components.resonancesource.sourceNode;
     

      //custom looping for variable HR
      this.ekgSound.onended =(event) => {
        event.target.currentTime = 2 - this.ekgpause; //the actual file is 2 s of silence + 0.62 of beep long
        event.target.play();
      };
    }

    //---- IV ----
    if (this.data.ivpump){
      //create new entity for IV sound
      let el = document.createElement('a-entity');
      el.setAttribute('resonancesource', {
        src: '#IVpump'+this.data.id,
        loop: true,
        autoplay: true,
        gain: 0.8
      });
      el.setAttribute('geometry',{primitive: 'sphere', radius: 0.3});
      this.el.appendChild(el);
      //this.ivSound = this.el.components.resonancesource.sourceNode;
    }

    //---- ventilator ----
    //TODO
    if (this.data.ventilator) {this.data.cough = false}

    //---- cough ----
    if(this.data.cough){
      //create new entity for IV sound
      let el = document.createElement('a-entity');
      el.setAttribute('resonancesource', {
        src: '#coughing1',
        loop: false,
        autoplay: true,
        gain: 0.8
      });
      el.setAttribute('geometry',{primitive: 'triangle'});
      this.el.appendChild(el);
    }

    //---- creating all choreographed sound entities beforhand ----
    if(this.data.sounds){
      for ([sound, start] of this.data.sounds.entries()){
        console.log("Starting sound " + sound + " at " + start);
        //create new entity sound
        let el = document.createElement('a-entity');
        el.setAttribute('resonancesource', {
          src: sound,
          loop: false, //TODO check if customizable
          autoplay: false,
          gain: 1
        });
        el.setAttribute('geometry',{primitive: 'box', width: 0.5, height: 0.5, depth: 0.5});
        //append to scene
        this.el.appendChild(el);

        //add to array
        this.sounds.push({name: sound, starttime: start, element: el})
      }
      console.log(this.sounds);
    }
  },

  haveProblem: function() {
    //get start time for logging
    //start sound and timer for success/fail
    //treatment progress
    //

  },

  solveProblem: function() {
    // log stop time, log success / failure
    // stop sounds
    // confirmation sounds
  },

  tick: function(t, td) {
    //play sounds at specified time
    if (this.nextSoundId < this.sounds.length && performance.now() - this.el.sceneEl.components.timeline.timestamps.get("scene_start") > this.sounds[this.nextSoundId].starttime)
    {
      console.log("Playing sound " + this.sounds[this.nextSoundId].name + " at " + this.sounds[this.nextSoundId].starttime + " |Current time: " + performance.now());
      this.sounds[this.nextSoundId].element.components.resonancesource.sourceNode.play();
      
      this.nextSoundId++;
    }
  }
  
});

AFRAME.registerComponent('telephone', {
  init: function () {
    this.clickhandler = this.clicked.bind(this);
    this.el.addEventListener('click', this.clickhandler);

    this.hello = document.createElement('a-entity');
    this.hello.setAttribute('resonancesource', {
      src: '#hello_lowQ',
      loop: false,
      autoplay: false,
      gain: 0.8
    });
    this.hello.setAttribute('material',{opacity: 0});
    this.el.appendChild(this.hello);
  },
  
  clicked: function (evt) {
    console.log("clicked telephone");
    let s = this.el.components.resonancesource.sourceNode;
    s.pause();  //pause ringing sound
    s.currentTime = 0; //set ringing sound to 0
    this.hello.components.resonancesource.sourceNode.play();
  },
});