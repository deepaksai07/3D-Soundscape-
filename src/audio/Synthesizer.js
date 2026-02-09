import AudioContextManager from './AudioContextManager';

const Synthesizer = {
    // Create simple Pink Noise buffer (good for water/wind/forest ambience)
    createPinkNoise: (duration = 5) => {
        const ctx = AudioContextManager.getAudioContext();
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        let b0, b1, b2, b3, b4, b5, b6;
        b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;

        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            data[i] *= 0.11; // (roughly) compensate for gain
            b6 = white * 0.115926;
        }
        return buffer;
    },

    // Create White Noise
    createWhiteNoise: (duration = 5) => {
        const ctx = AudioContextManager.getAudioContext();
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return buffer;
    },

    // Create Brown Noise (softer, deeper, good for distant heavy water or rumble)
    createBrownNoise: (duration = 5) => {
        const ctx = AudioContextManager.getAudioContext();
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = data[i];
            data[i] *= 3.5; // Compensate for gain loss
        }
        return buffer;
    },

    // Basic oscillator chirp ( bird-like ) - returning a buffer is tricky for varying pitch, 
    // better to return a function that plays it, BUT for now we adhere to buffer pattern if possible, 
    // or just use this helper to create a short buffer of a chirp.
    createBirdChirpBuffer: () => {
        const ctx = AudioContextManager.getAudioContext();
        const duration = 0.5; // short chirp
        const sampleRate = ctx.sampleRate;
        const length = sampleRate * duration;
        const buffer = ctx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        // Simple FM synthesis for a chirp
        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            const freq = 2000 + Math.sin(t * 50) * 1000 - (t * 2000); // Frequency drops
            data[i] = Math.sin(2 * Math.PI * freq * t) * (1 - t / duration); // Envelope
        }
        return buffer;
    }
};

export default Synthesizer;
