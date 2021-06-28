AFRAME.registerComponent('server-logger', {
  init: function() {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "https://VagueInfatuatedGraph.kxv.repl.co", true);
    xhr.setRequestHeader('Content-Type', 'text/plain');
    xhr.send("Damian, 60, 61, 65, 66, 64, 65, 56");
  }
});

/** 
* Timeline function that controls the whole experiencve from start to end 
* and at the same time provides a place to get timestamps
*/
AFRAME.registerComponent('timeline', {
  init: function() {
    let starttime = Performance.now()
    let tutorial_end = undefined
    let anchoring_end = undefined
    let scene_end = undefined
  },

  endTutorial: function() {
    tutorial_end = Performance.now()
  },

  endAnchoring: function() {
    anchoring_end = Performance.now()
  }
  
});

