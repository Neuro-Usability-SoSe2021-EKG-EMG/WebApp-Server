AFRAME.registerComponent('serverlogger', {
  init: function() {
  
  },

  sendLog: function (contentString) {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "https://VagueInfatuatedGraph.kxv.repl.co", true);
    xhr.setRequestHeader('Content-Type', 'text/plain');
    console.log("Sending log: ");
    console.log(contentString);
    xhr.send(contentString);
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
      //this.endTutorial();
      //this.startAnchoring();
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

    //let patient 1 cough after 2 seconds, dont loop, stop after 1s
    //this.playPatientSound(1, "#coughing1", 2000, false, 1000);
    //let patient 1 beep wildly after 4 seconds, loop sound, stop after 3s
    //this.playPatientSound(1, "#ekgBeep3", 4000, true, 3000);

    //--- let patient 1 have a problem

    //patient 1 coughs, loop sound, 5000 s treatment time, no end, not terminal
    setTimeout(() => {
      let problemName = "Patient 1 coughs";
      //unsuccesfully solve any problem that is still there
      this.patients.get(1).components.patient.endProblem(false);
      this.patients.get(1).components.patient.haveProblem(problemName, "#coughing1", true, 5000, 10000, true);
      console.log('patient 1 coughs, loop sound, 5000 s treatment time, no end, not terminal');
    }, 2000);

    //--- let patient 1 have a problem
    //patient 1 coughs, loop sound, 5000 s treatment time, no end, not terminal
    setTimeout(() => {
      let problemName = "Patient 1 IV obscruction";
      //unsuccesfully solve any problem that is still there
      this.patients.get(1).components.patient.endProblem(false);
      this.patients.get(1).components.patient.haveProblem(problemName, "#coughing1", true, 5000, 10000, false);
      console.log('patient 1 coughs, loop sound, 5000 s treatment time, no end, not terminal');
    }, 15000);
    

    // ---- END OF MAIN SCENE TIMEOUT ----
    setTimeout(() => {
      this.endScene();
    }, 20000);  //TODO set reasonable timeout

  },

  endScene: function() {
    //log time
    this.timestamps.set("scene_end", performance.now())

    //stop all sounds

    //fade to black?

    //send log
    let log = "";
    this.timestamps.forEach((value, key) => {
      log += value + "," + key + "\n";
    })
    log += this.el.sceneEl.components.pairdevice.getHRString();
    this.el.components.serverlogger.sendLog(log);
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
   * duration: int in milliseconds, for how long should the sound play
   */
  playPatientSound: function(patientID, sound, startTime, loop, duration = Infinity){
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

    if(duration < Infinity){
      setTimeout(() => {
      sourceNode.pause()
      this.patients.get(patientID).setAttribute('material', {color: 'green'});
    }, duration + startTime);
    }
  }

});