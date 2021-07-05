AFRAME.registerComponent('server-logger', {
  init: function() {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "https://VagueInfatuatedGraph.kxv.repl.co", true);
    xhr.setRequestHeader('Content-Type', 'text/plain');
    xhr.send("Damian, 60, 61, 65, 66, 64, 65, 56");
  }
});

/** 
* Timeline function that controls the whole experience from start to end 
* and at the same time provides a place to get timestamps
*/
AFRAME.registerComponent('timeline', {
  dependencies: ['raycasterlisten'],
  init: function() {
    this.timestamps = new Map();
    this.timestamps.set("starttime", performance.now())
    this.timestamps.set("tutorial_start", undefined)
    this.timestamps.set("tutorial_end", undefined)
    this.timestamps.set("anchoring_end", undefined)
    this.timestamps.set("scene_start", undefined)
    this.timestamps.set("scene_end", undefined)

    
    //find all patients to have access later
    this.patients = new Map();
    let patientlist = document.querySelectorAll('[patient]');
    for (p of patientlist) {
      this.patients.set(parseInt(p.components.patient.data.id), p);
    }

    console.log(this.patients)
  },

  startTutorial: function() {
    //log time
    this.timestamps.set("tutorial_start", performance.now())
    //make all things tutorial visible
    let container = document.querySelector("#tutorialcontainer")
    container.object3D.visible = true;
    let tutorialSound = document.querySelector("#s_tutorial").components.resonancesource.sourceNode

    tutorialSound.onended = (event) => {
      this.endTutorial();
      this.startAnchoring();
    };

    tutorialSound.play()
  },

  endTutorial: function() {
    //log time
    this.timestamps.set("tutorial_end", performance.now())

    let container = document.querySelector("#tutorialcontainer")
    container.object3D.visible = false;
  },

  startAnchoring: function() {
    //log time
    this.timestamps.set("anchoring_start", performance.now())

    let container = document.querySelector("#anchoringcontainer")
    container.object3D.visible = true;

    //TODO HR STUFFS


    let anchoringSound = document.querySelector("#s_anchor").components.resonancesource.sourceNode

    anchoringSound.onended = (event) => {
      this.endAnchoring();
      this.startScene();
    };

    anchoringSound.currentTime = 28; //PLAY ONLY LAST 2 SECONDS, TODO REMOVE FOR PRODUCTION
    anchoringSound.play()
  },

  endAnchoring: function() {
    //log time
    this.timestamps.set("anchoring_end", performance.now())
    let container = document.querySelector("#anchoringcontainer")
    container.object3D.visible = false;
  },

  startScene: function() {
    //log time
    this.timestamps.set("scene_start", performance.now())

    //make all visible
    let container = document.querySelector("#mainscenecontainer")
    container.object3D.visible = true;

    //let patient 1 cough after 2 seconds, stop after 1
    this.playPatientSound(1, "#coughing1", 2000, false, 1000);
    //let patient 1 beep wildly after 4 seconds, stop after 3
    this.playPatientSound(1, "#ekgBeep3", 4000, true, 3000);
  },

  endScene: function() {
    //log time
    this.timestamps.set("scene_end", performance.now())
  },

  run: function() {
    this.startTutorial()

  },

  /**
   * Play a sound of patiend at specific time, possible to loop
   * patientID: integer
   * sound: string with DOM key
   * startTime: int in milliseconds
   * loop: boolean, loop sound?
   * stopTime: int in milliseconds, for how long should the sound play
   */
  playPatientSound: function(patientID, sound, startTime, loop, stopTime = Infinity){
    let sourceNode = this.patients.get(patientID).components.patient.sounds.get(sound).components.resonancesource.sourceNode;

    if (loop) {
      sourceNode.setAttribute('loop', 'true');
    } else {
      sourceNode.removeAttribute('loop');
    }

    setTimeout(() => {
      sourceNode.play();
      this.patients.get(patientID).setAttribute('material', {color: 'red'});
      console.log('test_______________________________________________');
      console.log(this.patients.get(patientID).ac);
    }, startTime);

    if(stopTime < Infinity){
      setTimeout(() => {
      sourceNode.pause()
      this.patients.get(patientID).setAttribute('material', {color: 'green'});
    }, stopTime + startTime);
    }
  }

});