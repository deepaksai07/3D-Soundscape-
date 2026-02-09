import React, { useEffect, useRef, useState } from 'react';
import SoundSource from '../audio/SoundSource';
import Synthesizer from '../audio/Synthesizer';
import UserTracker from './UserTracker';
import Controls from './Controls';
import SettingsPanel from './SettingsPanel';
import bgAnim from '../assets/background.webp';

const SoundScene = () => {
    const [userPos, setUserPos] = useState({ x: 0, z: 0, yaw: 0 });
    const [isStarted, setIsStarted] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // Refs to hold SoundSource instances
    const waterSource = useRef(null);
    const windSource = useRef(null);
    const elephantSource = useRef(null);
    const birdSource = useRef(null);

    // Position State (independent of source refs, to drive UI)
    const [waterPos, setWaterPos] = useState({ x: -5, z: -10 });
    const [elephantPos, setElephantPos] = useState({ x: 10, z: 10 });
    const [lastBirdPos, setLastBirdPos] = useState(null); // {x, z}

    const [isAutoMoveElephant, setIsAutoMoveElephant] = useState(true); // Toggle for auto movement

    // Dragging State
    const [dragging, setDragging] = useState(null); // 'water' | 'elephant' | null

    // Default Settings
    const [settings, setSettings] = useState({
        water: { volume: 0.2, freq: 200, filterType: 'lowpass' },
        wind: { volume: 0.3, freq: 600, filterType: 'lowpass' },
        elephant: { volume: 0.6, freq: 150, filterType: 'lowpass' },
        birds: { volume: 0.1, freq: 1000, filterType: 'highpass' }
    });

    const handleUpdateSettings = (category, param, value) => {
        setSettings(prev => ({
            ...prev,
            [category]: { ...prev[category], [param]: value }
        }));
    };

    // Apply Settings
    useEffect(() => {
        if (waterSource.current) {
            waterSource.current.setFilter('lowpass', settings.water.freq);
        }
    }, [settings.water]);
    useEffect(() => {
        if (windSource.current) {
            windSource.current.setVolume(settings.wind.volume);
            windSource.current.setFilter('lowpass', settings.wind.freq, 0.5);
        }
    }, [settings.wind]);
    useEffect(() => {
        if (elephantSource.current) {
            elephantSource.current.setVolume(settings.elephant.volume);
            elephantSource.current.setFilter('lowpass', settings.elephant.freq, 5);
        }
    }, [settings.elephant]);
    useEffect(() => {
        if (birdSource.current) {
            birdSource.current.setVolume(settings.birds.volume);
            birdSource.current.setFilter('highpass', settings.birds.freq);
        }
    }, [settings.birds]);

    // Position Updates from Dragging
    const handleDragStart = (e, item) => {
        e.stopPropagation(); // Prevent look-drag
        setDragging(item);
        if (item === 'elephant') setIsAutoMoveElephant(false); // Stop auto move on manual interact
    };

    // Listen to global mouse move for dragging
    useEffect(() => {
        const handleGlobalMouseMove = (e) => {
            if (!dragging) return;
            const scale = 3;
            const cos = Math.cos(userPos.yaw);
            const sin = Math.sin(userPos.yaw);
            const dxScreen = e.movementX;
            const dyScreen = e.movementY;
            const dxWorld = (dxScreen * cos - dyScreen * sin) / scale;
            const dzWorld = (dxScreen * sin + dyScreen * cos) / scale;

            if (dragging === 'water') {
                setWaterPos(p => {
                    const nx = p.x + dxWorld;
                    const nz = p.z + dzWorld;
                    if (waterSource.current) waterSource.current.setPosition(nx, -1, nz);
                    return { x: nx, z: nz };
                });
            }
            if (dragging === 'elephant') {
                setElephantPos(p => {
                    const nx = p.x + dxWorld;
                    const nz = p.z + dzWorld;
                    if (elephantSource.current) elephantSource.current.setPosition(nx, 0, nz);
                    return { x: nx, z: nz };
                });
            }
        };

        const handleGlobalMouseUp = () => {
            setDragging(null);
        };

        if (dragging) {
            window.addEventListener('mousemove', handleGlobalMouseMove);
            window.addEventListener('mouseup', handleGlobalMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleGlobalMouseMove);
            window.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [dragging, userPos.yaw]);

    // Ref to access settings in loop
    const settingsRef = useRef(settings);
    useEffect(() => { settingsRef.current = settings; }, [settings]);
    const autoMoveElRef = useRef(isAutoMoveElephant);
    useEffect(() => { autoMoveElRef.current = isAutoMoveElephant; }, [isAutoMoveElephant]);

    useEffect(() => {
        if (!isStarted) return;

        // Initialize Sources
        waterSource.current = new SoundSource();
        waterSource.current.setBuffer(Synthesizer.createBrownNoise(10));
        waterSource.current.setFilter('lowpass', settings.water.freq);
        waterSource.current.setPosition(waterPos.x, -1, waterPos.z);
        waterSource.current.setVolume(settings.water.volume);
        waterSource.current.start();

        windSource.current = new SoundSource();
        windSource.current.setBuffer(Synthesizer.createPinkNoise(10));
        windSource.current.setFilter('lowpass', settings.wind.freq, 0.5);
        windSource.current.setPosition(0, 10, 0);
        windSource.current.setVolume(settings.wind.volume);
        windSource.current.start();

        elephantSource.current = new SoundSource();
        elephantSource.current.setBuffer(Synthesizer.createWhiteNoise(2));
        elephantSource.current.setFilter('lowpass', settings.elephant.freq, 5);
        elephantSource.current.setPosition(elephantPos.x, 0, elephantPos.z);
        elephantSource.current.setVolume(settings.elephant.volume);
        elephantSource.current.start();

        birdSource.current = new SoundSource();
        birdSource.current.setPosition(0, 5, -5);
        birdSource.current.setFilter('highpass', settings.birds.freq);
        birdSource.current.setVolume(settings.birds.volume);

        // Animation/Logic Loop
        let animationFrameId;
        let time = 0;

        const tick = () => {
            time += 0.01;
            const currentSettings = settingsRef.current;

            // Water Ripple
            if (waterSource.current) {
                const baseVol = currentSettings.water.volume;
                const ripple = baseVol + Math.sin(time * 0.8) * (baseVol * 0.25);
                waterSource.current.setVolume(Math.max(0, ripple));
            }

            // Move Elephant
            if (elephantSource.current && autoMoveElRef.current) {
                const r = 15;
                const ex = Math.sin(time * 0.5) * r;
                const ez = Math.cos(time * 0.5) * r;
                elephantSource.current.setPosition(ex, 0, ez);
                setElephantPos({ x: ex, z: ez });
            }

            // Birds
            if (Math.random() < 0.005) {
                const birdBuffer = Synthesizer.createBirdChirpBuffer();
                birdSource.current.setBuffer(birdBuffer, false);
                birdSource.current.setVolume(currentSettings.birds.volume);
                birdSource.current.start();

                const bx = (Math.random() - 0.5) * 20;
                const bz = (Math.random() - 0.5) * 20;

                birdSource.current.setPosition(bx, 5 + Math.random() * 5, bz);

                // Show on radar
                setLastBirdPos({ x: bx, z: bz });
                setTimeout(() => setLastBirdPos(null), 2000);
            }

            animationFrameId = requestAnimationFrame(tick);
        };
        tick();

        return () => {
            if (waterSource.current) waterSource.current.stop();
            if (windSource.current) windSource.current.stop();
            if (elephantSource.current) elephantSource.current.stop();
            if (birdSource.current) birdSource.current.stop();
            cancelAnimationFrame(animationFrameId);
        };
    }, [isStarted]);

    return (
        <div
            id="scene-container"
            style={{
                width: '100vw', height: '100vh',
                overflow: 'hidden', cursor: 'crosshair',
                backgroundImage: `url(${bgAnim})`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                // Removed dynamic scrolling to prevent edges/seams ("cuts") from showing
            }}
        >
            {/* Overlay */}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', pointerEvents: 'none' }} />

            <Controls onStart={() => setIsStarted(true)} />

            {isStarted && (
                <>
                    <UserTracker onPositionChange={setUserPos} />

                    <div style={{ position: 'absolute', bottom: 20, left: 20, color: '#0f0', fontFamily: 'monospace', zIndex: 10, pointerEvents: 'none' }}>
                        <p>WASD to Move | Drag Background to Look</p>
                        <p>Drag Dots on Radar to Move Sounds</p>
                    </div>

                    {/* Settings Toggle */}
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        style={{
                            position: 'absolute', top: 20, left: 20,
                            fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', zIndex: 110,
                            color: 'white'
                        }}
                    >
                        ⚙️
                    </button>

                    {showSettings && (
                        <SettingsPanel
                            settings={settings}
                            onUpdate={handleUpdateSettings}
                            onClose={() => setShowSettings(false)}
                        />
                    )}

                    {/* Interactive Radar */}
                    <div style={{
                        position: 'absolute', top: '20px', right: '20px',
                        width: '200px', height: '200px',
                        border: '2px solid #333', borderRadius: '50%',
                        background: 'rgba(0,0,0,0.5)',
                        overflow: 'hidden',
                        zIndex: 100 // Ensure it's clickable
                    }}>
                        <div style={{
                            position: 'absolute', top: '50%', left: '50%',
                            width: '0', height: '0',
                            transform: `rotate(${-userPos.yaw}rad)`
                        }}>
                            {/* Objects */}
                            {[
                                { id: 'water', x: waterPos.x, z: waterPos.z, color: '#00f' },
                                { id: 'elephant', x: elephantPos.x, z: elephantPos.z, color: '#aaa' },
                                ...(lastBirdPos ? [{ id: 'bird', x: lastBirdPos.x, z: lastBirdPos.z, color: '#ff0' }] : []),
                                { id: 'start', x: 0, z: 0, color: '#0f0' }
                            ].map((obj, i) => {
                                const dx = obj.x - userPos.x;
                                const dz = obj.z - userPos.z;
                                const scale = 3;

                                const isInteractive = obj.id === 'water' || obj.id === 'elephant';

                                return (
                                    <div
                                        key={obj.id}
                                        onMouseDown={(e) => isInteractive && handleDragStart(e, obj.id)}
                                        style={{
                                            position: 'absolute',
                                            left: `${dx * scale}px`,
                                            top: `${dz * scale}px`,
                                            width: isInteractive ? '12px' : '6px',
                                            height: isInteractive ? '12px' : '6px',
                                            background: obj.color,
                                            borderRadius: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            boxShadow: isInteractive ? `0 0 8px ${obj.color}` : `0 0 5px ${obj.color}`,
                                            cursor: isInteractive ? 'pointer' : 'default',
                                            border: isInteractive ? '2px solid white' : 'none'
                                        }}
                                    />
                                );
                            })}
                        </div>
                        {/* User Dot */}
                        <div style={{
                            position: 'absolute', top: '50%', left: '50%',
                            width: '8px', height: '8px', background: 'red',
                            borderRadius: '50%', transform: 'translate(-50%, -50%)',
                            pointerEvents: 'none'
                        }} />
                        {/* Cone */}
                        <div style={{
                            position: 'absolute', top: '50%', left: '50%',
                            width: '0', height: '0',
                            borderLeft: '40px solid transparent',
                            borderRight: '40px solid transparent',
                            borderTop: '60px solid rgba(255, 255, 255, 0.1)',
                            transform: 'translate(-50%, -100%)',
                            pointerEvents: 'none'
                        }} />
                    </div>

                    {/* Radar Legend */}
                    <div style={{
                        position: 'absolute', top: '230px', right: '20px',
                        color: '#ccc', fontSize: '0.8rem', fontFamily: 'monospace',
                        textAlign: 'right', pointerEvents: 'none',
                        background: 'rgba(0,0,0,0.3)', padding: '5px', borderRadius: '5px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '4px' }}>
                            <span>You</span> <div style={{ width: 8, height: 8, background: 'red', borderRadius: '50%', marginLeft: 8 }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '4px' }}>
                            <span>Water</span> <div style={{ width: 10, height: 10, background: '#00f', borderRadius: '50%', marginLeft: 8, border: '1px solid white' }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '4px' }}>
                            <span>Elephant</span> <div style={{ width: 10, height: 10, background: '#aaa', borderRadius: '50%', marginLeft: 8, border: '1px solid white' }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '4px' }}>
                            <span>Birds</span> <div style={{ width: 6, height: 6, background: '#ff0', borderRadius: '50%', marginLeft: 8 }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <span>Start</span> <div style={{ width: 6, height: 6, background: '#0f0', borderRadius: '50%', marginLeft: 8 }} />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default SoundScene;
