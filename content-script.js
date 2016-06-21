// Jason Morrison for Minerva Project
// Derived from https://github.com/muaz-khan/Firefox-Extensions
// MIT License

window.addEventListener("message", function(event) {
  if(event && event.data && event.data.checkIfMinervaScreenCapturingEnabled) {
    window.postMessage({isMinervaScreenCapturingEnabled: true }, '*');
  }
}, false);
