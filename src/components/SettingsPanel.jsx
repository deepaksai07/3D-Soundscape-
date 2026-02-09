import React from 'react';

const SettingsPanel = ({ settings, onUpdate, onClose }) => {
    const categories = Object.keys(settings);

    return (
        <div style={{
            position: 'absolute', top: 60, left: 20,
            width: '300px', maxHeight: '80vh', overflowY: 'auto',
            background: 'rgba(0,0,0,0.8)', color: 'white',
            padding: '20px', borderRadius: '10px',
            zIndex: 100, border: '1px solid #444',
            fontFamily: 'monospace'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Audio Settings</h2>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer' }}>X</button>
            </div>

            {categories.map(cat => (
                <div key={cat} style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1rem', color: '#4caf50', borderBottom: '1px solid #444', paddingBottom: '5px', textTransform: 'capitalize' }}>{cat}</h3>

                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                            Volume: {settings[cat].volume.toFixed(2)}
                        </label>
                        <input
                            type="range" min="0" max="2" step="0.01"
                            value={settings[cat].volume}
                            onChange={(e) => onUpdate(cat, 'volume', parseFloat(e.target.value))}
                            style={{ width: '100%', accentColor: '#4caf50' }}
                        />
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                            Filter Freq: {settings[cat].freq} Hz
                        </label>
                        <input
                            type="range" min="50" max="5000" step="10"
                            value={settings[cat].freq}
                            onChange={(e) => onUpdate(cat, 'freq', parseFloat(e.target.value))}
                            style={{ width: '100%', accentColor: '#2196f3' }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SettingsPanel;
