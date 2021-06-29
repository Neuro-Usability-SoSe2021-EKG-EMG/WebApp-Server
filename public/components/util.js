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

    //let patient 1 cough after 2 seconds
    setTimeout(() => {
      //TODO cast into function!!! way to complicated this way..
      this.patients.get(1).components.patient.sounds.get("#coughing1").components.resonancesource.sourceNode.play()
    }, 2000);
  },

  endScene: function() {
    //log time
    this.timestamps.set("scene_end", performance.now())
  },

  run: function() {
    this.startTutorial()

  },

});

