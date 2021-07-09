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

    this.timeouts = [];
    
    //find all patients to have access later
    this.patients = new Map();
    let patientlist = document.querySelectorAll('[patient]');
    for (p of patientlist) {
      this.patients.set(parseInt(p.components.patient.data.id), p);
    }

    console.log(this.patients)
  },

  clearAllTimeouts: function() {
    for (t of this.timeouts) {
      clearTimeout(t);
    }
    timeouts = []
  },

  startTutorial: function() {
    //log time
    this.timestamps.set("tutorial_start", performance.now())
    //make all things tutorial visible
    let container = document.querySelector("#tutorialcontainer")
    container.object3D.visible = true;

    let t_patient = document.querySelector("#t_patient")
    let tutorialSound = document.querySelector("#s_tutorial").components.resonancesource.sourceNode

    //make skippable
    document.addEventListener('keyup', event => {
      if (event.code === 'Space' && tutorialSound) {
        tutorialSound.pause();
        this.endTutorial();
        this.startAnchoring();
      }
    }, {once: true})

    tutorialSound.play();

    //make patient appear
    this.timeouts.push(setTimeout(() => {
      t_patient.components.patient.spawn()
    }, 19000));
    //patient has problem
    this.timeouts.push(setTimeout(() => {
      //pause IV sound, as it's part of the problem sound
      t_patient.components.patient.ivSound.pause()
      t_patient.components.patient.haveProblem("Tutorial_problem", "#t_IValarm2", true, 5000, Infinity, false)
    }, 21000));

    //wait for user to treat patient
    this.timeouts.push(setTimeout(() => {
      tutorialSound.pause();
      this.el.addEventListener('problemresolved', event => {
        //play IVpump again
        event.target.components.patient.ivSound.play();
        //continue tutorial
        tutorialSound.play();
        this.timeouts.push(setTimeout(() => {
          t_patient.remove();
        }, 4000));
      }, {once: true});
    }, 34000));    

    tutorialSound.onended = (event) => {
      this.endTutorial();
      this.startAnchoring();
    };
  },

  endTutorial: function() {
    //log time
    this.timestamps.set("tutorial_end", performance.now())

    //do not carry over any timeouts into next scene
    this.clearAllTimeouts();

    let container = document.querySelector("#tutorialcontainer")
    container.object3D.visible = false;
  },

  startAnchoring: function() {
    //log time
    this.timestamps.set("anchoring_start", performance.now())

    let container = document.querySelector("#anchoringcontainer")
    container.object3D.visible = true;

    //TODO HR STUFFS


    let anchoringSound = document.querySelector("#pinknoise")

    anchoringSound.volume = 0.2;
    anchoringSound.play();

     //make skippable
    document.addEventListener('keyup', event => {
      if (event.code === 'Space' && anchoringSound) {
        anchoringSound.pause();
        this.endAnchoring();
        this.startScene();
      }
    }, {once: true})

    anchoringSound.onended = (event) => {
      this.endAnchoring();
      this.startScene();
    };

    //anchoringSound.currentTime = 28; //PLAY ONLY LAST 2 SECONDS, TODO REMOVE FOR PRODUCTION
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

    //spawn patients
    this.patients.forEach((value, key) => {
      if (key != 99){
        value.components.patient.spawn();
      }
    }

    //let patient 1 cough after 2 seconds, dont loop, stop after 1s
    //this.playPatientSound(1, "#coughing1", 2000, false, 1000);
    //let patient 1 beep wildly after 4 seconds, loop sound, stop after 3s
    //this.playPatientSound(1, "#ekgBeep3", 4000, true, 3000);

    //--- let patient 1 have a problem

    //patient 1 coughs, loop sound, 5000 s treatment time, no end, not terminal
    this.timeouts.push(setTimeout(() => {
      let problemName = "Patient 1 coughs";
      //unsuccesfully solve any problem that is still there
      this.patients.get(1).components.patient.endProblem(false);
      this.patients.get(1).components.patient.haveProblem(problemName, "#coughing1", true, 5000, 10000, true);
      console.log('patient 1 coughs, loop sound, 5000 s treatment time, no end, not terminal');
    }, 2000));

    //--- let patient 1 have a problem
    //patient 1 coughs, loop sound, 5000 s treatment time, no end, not terminal
    this.timeouts.push(setTimeout(() => {
      let problemName = "Patient 1 IV obscruction";
      //unsuccesfully solve any problem that is still there
      this.patients.get(1).components.patient.endProblem(false);
      this.patients.get(1).components.patient.haveProblem(problemName, "#coughing1", true, 5000, 10000, false);
      console.log('patient 1 coughs, loop sound, 5000 s treatment time, no end, not terminal');
    }, 15000));
    

    // ---- END OF MAIN SCENE TIMEOUT ----
    this.timeouts.push(setTimeout(() => {
      this.endScene();
    }, 20000));  //TODO set reasonable timeout

  },

  endScene: function() {
    //log time
    this.timestamps.set("scene_end", performance.now())

    //stop all sounds

    //fade to black?

    //do not carry over any timeouts into next scene
    this.clearAllTimeouts();

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