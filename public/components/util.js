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
    this.starttime = performance.now()
    this.tutorial_end = undefined
    this.anchoring_end = undefined
    this.scene_start = undefined
    this.scene_end = undefined
  },

  endTutorial: function() {
    this.tutorial_end = performance.now()
  },

  endAnchoring: function() {
    this.anchoring_end = performance.now()
  },

  startScene: function() {
    this.scene_start = performance.now()
  }
  
});

