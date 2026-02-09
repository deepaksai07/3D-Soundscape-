class AudioContextManager {
  constructor() {
    this.audioContext = null;
    this.isInitialized = false;
  }

  getAudioContext() {
    if (!this.audioContext) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  async resume() {
    const ctx = this.getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    this.isInitialized = true;
    return ctx.state;
  }

  updateListener(x, y, z, forwardX, forwardY, forwardZ, upX, upY, upZ) {
     const ctx = this.getAudioContext();
     const listener = ctx.listener;

     if (listener.positionX) {
       // Standard Way
       listener.positionX.value = x;
       listener.positionY.value = y;
       listener.positionZ.value = z;
       listener.forwardX.value = forwardX;
       listener.forwardY.value = forwardY;
       listener.forwardZ.value = forwardZ;
       listener.upX.value = upX;
       listener.upY.value = upY;
       listener.upZ.value = upZ;
     } else {
       // Deprecated Way (for older browsers, though less likely needed in modern React)
       listener.setPosition(x, y, z);
       listener.setOrientation(forwardX, forwardY, forwardZ, upX, upY, upZ);
     }
  }
}

export default new AudioContextManager();
