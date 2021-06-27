AFRAME.registerComponent('startexperience', {
  dependencies: ['resonanceSystem', 'heartratemonitor'],
  init: function () {
    document.querySelector("#startX").style.display = "flex";
    let sceneEl = this.el;
   
    document.querySelector("#startwithoutHR").onclick = () => {
      document.querySelector("#startX").style.display = "none";
       console.log("Starting without HR monitoring");
      sceneEl.components.resonancesystem.run();
    }
    document.querySelector("#startwithHR").onclick = () => {
      document.querySelector("#startX").style.display = "none";
      console.log("Starting with HR monitoring");
      sceneEl.components.heartratemonitor.run();
      sceneEl.components.resonancesystem.run();
    }
  }
});