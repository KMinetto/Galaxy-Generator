import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 3;
scene.add(camera);

/**
 * Galaxy
 */
const galaxyParameters = {
    count: 100000,
    size: 0.01,
    radius: 5,
    branches: 3, // %3  => 0, 1, 2, 0, 1, 2
    spin: 1,
    randomness: 0.2,
    randomnessPower: 3,
    insideColor: "#FF6030",
    outsideColor: "#1B3984"
};

let particlesGeometry = null;
let particlesMaterial = null
let particles = null;

const generateGalaxy = () => {

    /**
     * Destroy old Galaxy
     */
    if (particles !== null) {
        particlesGeometry.dispose();
        particlesMaterial.dispose();
        scene.remove(particles);
    }

    const insideColor = new THREE.Color(galaxyParameters.insideColor);
    const outsideColor = new THREE.Color(galaxyParameters.outsideColor);

    particlesGeometry = new THREE.BufferGeometry();
    particlesMaterial = new THREE.PointsMaterial({
        size: galaxyParameters.size,
        sizeAttenuation: true,
        depthWrite: true,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    });

    const positions = new Float32Array(galaxyParameters.count * 3);
    const colors = new Float32Array(galaxyParameters.count * 3);

    for (let i = 0; i < galaxyParameters.count; i++) {
        const i3 = i * 3;

        // Position
        const radius = Math.random() * galaxyParameters.radius;
        const spinAngle = radius * galaxyParameters.spin;
        const branchesAngle =  (i % galaxyParameters.branches) / galaxyParameters.branches * (Math.PI * 2); // (i % galaxyParameters.branches) / galaxyParameters.branches = 1 * 2 PI

        const randomX = Math.pow(Math.random(), galaxyParameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
        const randomY = Math.pow(Math.random(), galaxyParameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
        const randomZ = Math.pow(Math.random(), galaxyParameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);

        positions[i3 + 0] = Math.sin(branchesAngle + spinAngle) * radius + randomX;
        positions[i3 + 1] = randomY;
        positions[i3 + 2] = Math.cos(branchesAngle + spinAngle) * radius + randomZ;

        // Color
        const mixedColor = insideColor.clone();
        mixedColor.lerp(outsideColor, radius / galaxyParameters.radius);

        colors[i3 + 0] = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
};

generateGalaxy();

/**
 * Tweaks
 */
const galaxyGUI = gui.addFolder("Taille");

galaxyGUI.add(galaxyParameters, 'count')
    .min(100)
    .max(1000000)
    .step(100)
    .onFinishChange(generateGalaxy)
    .name("Nombre d'étoile")
;

galaxyGUI.add(galaxyParameters, 'size')
    .min(0.01)
    .max(0.1)
    .step(0.01)
    .onFinishChange(generateGalaxy)
    .name("Taille Etoiles")
;

galaxyGUI.add(galaxyParameters, 'radius')
    .min(0.01)
    .max(20)
    .step(0.01)
    .onFinishChange(generateGalaxy)
    .name("Rayon Galaxy")
;

galaxyGUI.add(galaxyParameters, 'branches')
    .min(3)
    .max(20)
    .step(1)
    .onFinishChange(generateGalaxy)
    .name("Branches Galaxy")
;

galaxyGUI.add(galaxyParameters, 'spin')
    .min(-5)
    .max(5)
    .step(0.001)
    .onFinishChange(generateGalaxy)
    .name("Rotation Galaxy")
;

galaxyGUI.add(galaxyParameters, 'randomness')
    .min(-2)
    .max(2)
    .step(0.001)
    .onFinishChange(generateGalaxy)
    .name("Aléatoire Galaxy")
;

galaxyGUI.add(galaxyParameters, 'randomnessPower')
    .min(1)
    .max(10)
    .step(0.001)
    .onFinishChange(generateGalaxy)
    .name("Aléatoire Puissance Galaxy")
;

galaxyGUI.addColor(galaxyParameters, "insideColor")
    .onChange(generateGalaxy)
;

galaxyGUI.addColor(galaxyParameters, "outsideColor")
    .onChange(generateGalaxy)
;

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime();

    // Update controls
    controls.update();

    // Updates Points
    particles.rotation.y = elapsedTime * 0.02;

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();