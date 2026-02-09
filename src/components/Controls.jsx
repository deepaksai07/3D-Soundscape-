import React, { useState } from 'react';
import AudioContextManager from '../audio/AudioContextManager';

const Controls = ({ onStart }) => {
    const [started, setStarted] = useState(false);

    const handleStart = async () => {
        await AudioContextManager.resume();
        setStarted(true);
        if (onStart) onStart();
    };

    if (started) return null;

    return (
        <div style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.8)',
            color: 'white',
            zIndex: 100
        }}>
            <h1>Mudumalai Soundscape</h1>
            <p>Click to Enter the Forest</p>
            <button
                onClick={handleStart}
                style={{
                    padding: '10px 20px', fontSize: '1.2rem', cursor: 'pointer',
                    marginTop: '20px'
                }}
            >
                Start Experience
            </button>
            <p style={{ marginTop: '10px', fontSize: '0.8rem' }}>Use WASD to move, Mouse to look</p>
        </div>
    );
};

export default Controls;
