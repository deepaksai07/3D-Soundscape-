import AudioContextManager from './AudioContextManager';

class SoundSource {
    constructor() {
        this.ctx = AudioContextManager.getAudioContext();
        this.panner = this.ctx.createPanner();
        this.gainNode = this.ctx.createGain();
        this.filterNode = this.ctx.createBiquadFilter();
        this.sourceNode = null;

        // Default Panner Settings for HRTF (High-quality 3D audio)
        this.panner.panningModel = 'HRTF';
        this.panner.distanceModel = 'inverse';
        this.panner.refDistance = 1;
        this.panner.maxDistance = 10000;
        this.panner.rolloffFactor = 1;

        // Connect chain: Source -> Filter -> Gain -> Panner -> Destination
        this.filterNode.connect(this.gainNode);
        this.gainNode.connect(this.panner);
        this.panner.connect(this.ctx.destination);

        // Default Filter: All parameters open
        this.filterNode.type = 'allpass';
    }

    setPosition(x, y, z) {
        if (this.panner.positionX) {
            this.panner.positionX.value = x;
            this.panner.positionY.value = y;
            this.panner.positionZ.value = z;
        } else {
            this.panner.setPosition(x, y, z);
        }
    }

    setVolume(val) {
        this.gainNode.gain.value = val;
    }

    setBuffer(buffer, loop = true) {
        if (this.sourceNode) {
            try {
                this.sourceNode.stop();
                this.sourceNode.disconnect();
            } catch (e) {
                // Find a better way to handle already stopped nodes
            }
        }
        this.sourceNode = this.ctx.createBufferSource();
        this.sourceNode.buffer = buffer;
        this.sourceNode.loop = loop;
        this.sourceNode.connect(this.filterNode);
    }

    start() {
        if (this.sourceNode) {
            this.sourceNode.start();
        }
    }

    stop() {
        if (this.sourceNode) {
            try {
                this.sourceNode.stop();
            } catch (e) {
                // ignore
            }
        }
    }

    setFilter(type, frequency, Q = 1) {
        this.filterNode.type = type;
        this.filterNode.frequency.value = frequency;
        this.filterNode.Q.value = Q;
    }
}


export default SoundSource;
