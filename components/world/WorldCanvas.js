'use client';
import React, { useRef, useState, useEffect, Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment, Text, Box, Plane, Float, Clone, useTexture, Loader } from '@react-three/drei';

const TILE_SIZE = 100;

// House structural walls
const WALLS = [
    { x: 200, y: 150, w: 1100, h: 30 }, // North
    { x: 200, y: 150, w: 30, h: 900 },  // West
    { x: 1270, y: 150, w: 30, h: 930 }, // East
    { x: 200, y: 1050, w: 400, h: 30 }, // South Left
    { x: 900, y: 1050, w: 400, h: 30 }, // South Right
    { x: 200, y: 550, w: 300, h: 30 }, // Bottom wall of bedroom
    { x: 650, y: 150, w: 30, h: 300 }, // Right wall of bedroom
    { x: 950, y: 150, w: 30, h: 300 }, // Right wall of middle room
    { x: 650, y: 450, w: 200, h: 30 }, // Bottom wall of middle room
];

// Furniture layout mapped to 3D with rotations (Optimized count)
const FURNITURE = [
    { type: 'bedDouble', x: 300, y: 240, w: 120, h: 160, rot: [0, Math.PI / 2, 0] },
    { type: 'tableCoffeeSquare', x: 1100, y: 750, w: 100, h: 100, rot: [0, 0, 0] },
    
    { type: 'kitchenCabinet', x: 1050, y: 220, w: 100, h: 100, rot: [0, Math.PI, 0] },
    { type: 'kitchenCabinet', x: 1150, y: 220, w: 100, h: 100, rot: [0, Math.PI, 0] },
    { type: 'kitchenFridgeLarge', x: 1200, y: 320, w: 80, h: 160, rot: [0, -Math.PI / 2, 0] },
    
    { type: 'loungeDesignSofa', x: 450, y: 750, w: 150, h: 150, rot: [0, 0, 0] },
    { type: 'cabinetTelevisionDoors', x: 450, y: 950, w: 120, h: 120, rot: [0, Math.PI, 0] },
    { type: 'televisionModern', x: 450, y: 950, w: 120, h: 120, yOffset: 0.6, rot: [0, Math.PI, 0] },
    
    // Task-specific furniture
    { type: 'laptop', x: 750, y: 250, w: 100, h: 100, yOffset: 0.6, rot: [0, Math.PI, 0] },
    { type: 'trashcan', x: 1100, y: 600, w: 50, h: 50, rot: [0, 0, 0] },
    { type: 'coatRack', x: 950, y: 950, w: 50, h: 50, rot: [0, 0, 0] }
];

// Interactive Task Zones anchored to the house furniture
const ZONES = [
    { x: 5.2, z: 8.5, cat: 'energy', label: 'Energy Hub' },
    { x: 12.4, z: 4.0, cat: 'food', label: 'Smart Fridge' },
    { x: 11.0, z: 6.0, cat: 'waste', label: 'Recycling' },
    { x: 11.0, z: 7.5, cat: 'shopping', label: 'Eco Market' },
    { x: 9.8, z: 10.0, cat: 'transport', label: 'EV Keys' }
];

function rectTo3D(x, y, w, h) {
    const scale = 1 / TILE_SIZE;
    const cx = (x + w / 2) * scale;
    const cz = (y + h / 2) * scale;
    const sw = w * scale;
    const sd = h * scale;
    return { position: [cx, 0, cz], args: [sw, 1, sd] };
}

function GLTFModel({ name, position, rotation = [0, 0, 0], scale = 1 }) {
    const { scene } = useGLTF(`/assets/models/${name}.glb`);
    return <Clone object={scene} position={position} rotation={rotation} scale={scale} />;
}

function TexturedGround() {
    const grassMap = useTexture('/assets/textures/grass.png');
    grassMap.wrapS = grassMap.wrapT = THREE.RepeatWrapping;
    // Balanced repeat scaling
    grassMap.repeat.set(50, 50);
    return (
        <Plane args={[500, 500]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
            <meshStandardMaterial map={grassMap} roughness={1} color="#aadd88" />
        </Plane>
    );
}

function TexturedFloor() {
    const woodMap = useTexture('/assets/textures/wood.png');
    woodMap.wrapS = woodMap.wrapT = THREE.RepeatWrapping;
    woodMap.repeat.set(5, 5);
    return (
        <Box position={[7.35, -0.05, 6]} args={[10.7, 0.1, 9]}>
            <meshStandardMaterial map={woodMap} roughness={0.8} />
        </Box>
    );
}

// Preload models
['character-male-a', 'bedDouble', 'tableCoffeeSquare', 'kitchenCabinet', 'kitchenFridgeLarge', 'loungeDesignSofa', 'cabinetTelevisionDoors', 'televisionModern', 'tree_pineDefaultA', 'lampSquareFloor', 'laptop', 'trashcan', 'coatRack', 'fence_simple', 'grass', 'grass_large', 'tree_small', 'tree_oak', 'tree_detailed', 'tree_pineRoundA', 'rock_largeA', 'rock_tallA', 'plant_bushLarge', 'plant_bush', 'mushroom_redGroup', 'mushroom_tanGroup', 'stump_old', 'log'].forEach(m => {
    useGLTF.preload(`/assets/models/${m}.glb`);
});

function Player({ positionRef, keysRef, onPlayerMove }) {
    const groupRef = useRef();
    const { camera } = useThree();
    const targetCamPos = useRef(new THREE.Vector3());
    const { scene } = useGLTF(`/assets/models/character-male-a.glb`);

    // Initialize player position once to prevent React from resetting it on re-renders
    useEffect(() => {
        if (groupRef.current) {
            groupRef.current.position.set(positionRef.current[0], 0, positionRef.current[1]);
        }
    }, [positionRef]);

    useFrame((state, delta) => {
        const speed = 7 * delta;
        const keys = keysRef.current;
        let vx = 0;
        let vz = 0;
        if (keys.ArrowLeft || keys.a) vx -= speed;
        if (keys.ArrowRight || keys.d) vx += speed;
        if (keys.ArrowUp || keys.w) vz -= speed;
        if (keys.ArrowDown || keys.s) vz += speed;

        // Normalize diagonal movement speed
        if (vx !== 0 && vz !== 0) {
            const length = Math.sqrt(vx * vx + vz * vz);
            vx = (vx / length) * speed;
            vz = (vz / length) * speed;
        }

        if (groupRef.current) {
            let newX = groupRef.current.position.x + vx;
            let newZ = groupRef.current.position.z + vz;
            
            // Physical Wall Collision Check
            const wallCollision = (nx, nz) => {
                const wPad = 0.2; // Smaller padding to prevent getting stuck in doorways
                for (let w of WALLS) {
                    const wx = w.x / TILE_SIZE;
                    const wz = w.y / TILE_SIZE;
                    const ww = w.w / TILE_SIZE;
                    const wd = w.h / TILE_SIZE;
                    if (nx > wx - wPad && nx < wx + ww + wPad && nz > wz - wPad && nz < wz + wd + wPad) {
                        return true;
                    }
                }
                return false;
            };

            // Independent axis collision for smooth sliding along walls
            if (wallCollision(newX, groupRef.current.position.z)) newX = groupRef.current.position.x;
            if (wallCollision(groupRef.current.position.x, newZ)) newZ = groupRef.current.position.z;
            
            // Yard Boundaries (Locked inside the fence)
            const pad = 0.5;
            if (newX < -5 + pad) newX = -5 + pad;
            if (newX > 18 - pad) newX = 18 - pad;
            if (newZ < -2 + pad) newZ = -2 + pad;
            if (newZ > 16 - pad) newZ = 16 - pad;

            groupRef.current.position.x = newX;
            groupRef.current.position.z = newZ;
            positionRef.current = [newX, newZ];

            // Character rotation and procedural walk animation
            if (vx !== 0 || vz !== 0) {
                const angle = Math.atan2(vx, vz);
                groupRef.current.rotation.y = angle;
                
                // Bobbing walk cycle
                const time = state.clock.getElapsedTime();
                groupRef.current.position.y = Math.abs(Math.sin(time * 15)) * 0.15;
                groupRef.current.rotation.z = Math.sin(time * 15) * 0.05;
                
                if (onPlayerMove) onPlayerMove();
            } else {
                // Reset to standing still
                groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, 0.2);
                groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, 0.2);
            }

            // Lazy camera tracking so the character actually moves across the screen
            targetCamPos.current.set(newX, 12, newZ + 12);
            camera.position.lerp(targetCamPos.current, 0.1);
            
            // Lock the camera angle parallel to its position to prevent swinging
            camera.lookAt(camera.position.x, 0, camera.position.z - 12);
        }
    });

    return (
        <group ref={groupRef}>
            <primitive object={scene} scale={1.2} />
        </group>
    );
}

export default function WorldCanvas({ environment = 'home', tier = 1, unlockedElements = [], categoryCounts = {}, onZoneClick, onNearZone, onEnterExit, onPlayerMove }) {
    const keys = useRef({});
    const playerPos = useRef([6.5, 12]);
    const lastZone = useRef(null);
    const localEnv = useRef(environment); // Strictly track local environment to prevent modal spam

    // Sync local environment if parent forces a change
    useEffect(() => {
        localEnv.current = environment;
    }, [environment]);

    // Generates the visual fence bounding box
    const fencePerimeter = useMemo(() => {
        const fences = [];
        const minX = -5, maxX = 18;
        const minZ = -2, maxZ = 16;
        for (let x = minX; x <= maxX; x += 1.5) fences.push({ id: `n${x}`, x, z: minZ, rot: [0, 0, 0] });
        for (let x = minX; x <= maxX; x += 1.5) fences.push({ id: `s${x}`, x, z: maxZ, rot: [0, Math.PI, 0] });
        for (let z = minZ; z <= maxZ; z += 1.5) fences.push({ id: `w${z}`, x: minX, z, rot: [0, Math.PI / 2, 0] });
        for (let z = minZ; z <= maxZ; z += 1.5) fences.push({ id: `e${z}`, x: maxX, z, rot: [0, -Math.PI / 2, 0] });
        return fences;
    }, []);

    // Procedural nature inside the yard
    const yardNature = useMemo(() => {
        const items = [];
        // Add grass tufts, excluding the house interior
        for(let i=0; i<30; i++) {
            let tx = -4 + Math.random() * 20;
            let tz = -1 + Math.random() * 15;
            while (tx > 1.5 && tx < 13.5 && tz > 0.5 && tz < 11.5) {
                tx = -4 + Math.random() * 20;
                tz = -1 + Math.random() * 15;
            }
            items.push({
                id: `g${i}`,
                type: Math.random() > 0.5 ? 'grass' : 'grass_large',
                x: tx,
                z: tz,
                scale: 1 + Math.random() * 0.5
            });
        }
        return items;
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            keys.current[e.key] = true;
            if (e.key.toLowerCase() === 'e' && lastZone.current) {
                if (onZoneClick) onZoneClick(lastZone.current);
            }
        };
        const handleKeyUp = (e) => (keys.current[e.key] = false);
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            const [px, pz] = playerPos.current;
            let currentZone = null;
            
            // Check interaction zones directly near furniture
            for (let z of ZONES) {
                if (Math.hypot(px - z.x, pz - z.z) < 1.5) {
                    currentZone = z.cat;
                    break;
                }
            }

            if (currentZone !== lastZone.current) {
                lastZone.current = currentZone;
                if (onNearZone) onNearZone(currentZone);
            }
            
            // Check house enter/exit (Entrance is around x:6.5, z:10.5)
            const inside = px > 1.5 && px < 13.0 && pz > 1.0 && pz < 11.0;
            const currentEnv = inside ? 'home' : 'outside';

            if (currentEnv !== localEnv.current) {
                localEnv.current = currentEnv; // Instantly lock it locally
                if (onEnterExit) onEnterExit(currentEnv);
            }
        }, 200);
        return () => clearInterval(interval);
    }, [onNearZone, onEnterExit]);

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -10, backgroundColor: '#7dd3fc' }}>
            <Canvas gl={{ antialias: false, powerPreference: 'high-performance' }} dpr={1} camera={{ position: [6.5, 12, 24], fov: 45 }}>
                <color attach="background" args={['#7dd3fc']} />
                <ambientLight intensity={0.8} />
                <directionalLight position={[20, 30, 10]} intensity={1.2} />
                
                <Suspense fallback={null}>
                    <Player positionRef={playerPos} keysRef={keys} onPlayerMove={onPlayerMove} tier={tier} />

                    {/* House Geometry */}
                    <group>
                        {/* Floor */}
                        <TexturedFloor />
                        
                        {/* Walls */}
                        {WALLS.map((w, i) => {
                            const { position, args } = rectTo3D(w.x, w.y, w.w, w.h);
                            return (
                                <Box key={i} position={[position[0], 0.5, position[2]]} args={args}>
                                    <meshStandardMaterial color="#64748B" roughness={0.9} />
                                </Box>
                            );
                        })}

                        {/* Furniture Models */}
                        {FURNITURE.map((f, i) => {
                            const { position } = rectTo3D(f.x, f.y, f.w, f.h);
                            const yPos = f.yOffset ? f.yOffset : 0;
                            return (
                                <GLTFModel 
                                    key={i} 
                                    name={f.type} 
                                    position={[position[0], yPos, position[2]]} 
                                    rotation={f.rot} 
                                    scale={1.2} // Reduced scale so it doesn't clip walls
                                />
                            );
                        })}
                    </group>

                    {/* Outside Ground */}
                    <TexturedGround />

                    {/* Perimeter Fence */}
                    <group>
                        {fencePerimeter.map((f) => (
                            <GLTFModel key={f.id} name="fence_simple" position={[f.x, 0, f.z]} rotation={f.rot} scale={1.5} />
                        ))}
                    </group>

                    {/* Render Sustainability Zones */}
                    <group>
                        {ZONES.map((z, i) => {
                            return (
                                <group key={i} position={[z.x, 0, z.z]} onClick={() => onZoneClick && onZoneClick(z.cat)}>
                                    <Float speed={2} rotationIntensity={0} floatIntensity={0.5}>
                                        <Text position={[0, 1.5, 0]} fontSize={0.3} color="black" outlineWidth={0.02} outlineColor="white">
                                            {z.label}
                                        </Text>
                                    </Float>
                                </group>
                            );
                        })}
                    </group>

                    {/* Yard Nature Inside */}
                    <group>
                        {yardNature.map((n) => (
                            <GLTFModel key={n.id} name={n.type} position={[n.x, 0, n.z]} scale={n.scale} />
                        ))}
                    </group>

                </Suspense>
            </Canvas>
            <Loader />
        </div>
    );
}
