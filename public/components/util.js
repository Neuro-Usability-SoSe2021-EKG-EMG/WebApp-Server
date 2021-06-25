AFRAME.registerComponent('server-logger', {
  init: function() {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "https://VagueInfatuatedGraph.kxv.repl.co", true);
    xhr.setRequestHeader('Content-Type', 'text/plain');
    xhr.send("Damian, 60, 61, 65, 66, 64, 65, 56");
  }
});

