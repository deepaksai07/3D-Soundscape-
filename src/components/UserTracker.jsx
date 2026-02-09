import React, { useEffect, useRef, useState } from 'react';
import AudioContextManager from '../audio/AudioContextManager';

const UserTracker = ({ onPositionChange, enabled = true }) => {
    const position = useRef({ x: 0, y: 0, z: 0 });
    const rotation = useRef({ yaw: 0 });
    const keys = useRef({});
    const isDraggingLook = useRef(false);

    useEffect(() => {
        const handleKeyDown = (e) => { keys.current[e.code] = true; };
        const handleKeyUp = (e) => { keys.current[e.code] = false; };

        const handleMouseDown = (e) => {
            // Only start looking if enabled and NOT clicking a UI element (like a button or map dot)
            // We'll rely on event bubbling prevention in UI elements, or check target.
            // Simplest: If target is the main container (canvas/div). 
            if (enabled && e.target.id === 'scene-container') {
                isDraggingLook.current = true;
            }
        };

        const handleMouseUp = () => {
            isDraggingLook.current = false;
        };

        const handleMouseMove = (e) => {
            if (isDraggingLook.current) {
                const sensitivity = 0.005;
                rotation.current.yaw -= e.movementX * sensitivity;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('mousemove', handleMouseMove);

        let animationFrameId;

        const update = () => {
            const speed = 0.1;
            const { yaw } = rotation.current;

            const forwardX = Math.sin(yaw);
            const forwardZ = -Math.cos(yaw);
            const rightX = Math.cos(yaw);
            const rightZ = Math.sin(yaw);

            if (keys.current['KeyW'] || keys.current['ArrowUp']) {
                position.current.x += forwardX * speed;
                position.current.z += forwardZ * speed;
            }
            if (keys.current['KeyS'] || keys.current['ArrowDown']) {
                position.current.x -= forwardX * speed;
                position.current.z -= forwardZ * speed;
            }
            if (keys.current['KeyA'] || keys.current['ArrowLeft']) {
                position.current.x -= rightX * speed;
                position.current.z -= rightZ * speed;
            }
            if (keys.current['KeyD'] || keys.current['ArrowRight']) {
                position.current.x += rightX * speed;
                position.current.z += rightZ * speed;
            }

            AudioContextManager.updateListener(
                position.current.x, position.current.y, position.current.z,
                forwardX, 0, forwardZ,
                0, 1, 0
            );

            if (onPositionChange) {
                onPositionChange({
                    x: position.current.x,
                    z: position.current.z,
                    yaw: rotation.current.yaw
                });
            }

            animationFrameId = requestAnimationFrame(update);
        };

        update();

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [enabled]);

    return null;
};

export default UserTracker;
