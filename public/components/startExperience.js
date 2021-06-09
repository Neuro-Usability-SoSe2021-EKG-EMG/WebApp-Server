AFRAME.registerComponent('startexperience', {
  dependencies: ['resonanceSystem'],
  init: function () {
    document.querySelector("#startX").style.display = "flex";
    let sceneEl = this.el;
    //console.log(sceneEl.camera.el.object3D.matrixWorld);
    document.querySelector("button").onclick = () => {
      document.querySelector("#startX").style.display = "none";
      sceneEl.components.resonancesystem.run();
    }
  }
});