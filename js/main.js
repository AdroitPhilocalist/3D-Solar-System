/**
 * 3D Solar System Simulation
 * 
 * This file contains all the Three.js logic for creating and animating
 * a realistic solar system with interactive controls.
 */

// Global variables
let scene, camera, renderer, controls;
let sun, planets = {};
let planetData = [];
let clock = new THREE.Clock();
let isPaused = false;
let starField;
let tooltip = document.getElementById('tooltip');
let mouse = new THREE.Vector2();
let raycaster = new THREE.Raycaster();
let isDarkTheme = true;
let zoomFactor = 1.2; // Factor by which to zoom in/out

// Planet data with realistic relative values (scaled for visualization)
const PLANET_INFO = [
    {
        name: 'Mercury',
        radius: 0.38, // Size relative to Earth (scaled up for visibility)
        distance: 5, // Distance from Sun (scaled down for visualization)
        orbitalSpeed: 4.74, // Orbital speed multiplier
        rotationSpeed: 0.017, // Rotation speed
        color: '#A9A9A9', // Gray
        speedControl: 'mercury-speed',
        texture: generatePlanetTexture('#A9A9A9', '#8A8A8A', 0.5, 0.2) // Base color, crater color, noise scale, crater density
    },
    {
        name: 'Venus',
        radius: 0.95,
        distance: 7,
        orbitalSpeed: 3.5,
        rotationSpeed: 0.004, // Slow retrograde rotation
        color: '#E6E6FA', // Light yellow
        speedControl: 'venus-speed',
        texture: generatePlanetTexture('#E6E6FA', '#D6D6EA', 0.3, 0.1) // Subtle texture for Venus's cloud cover
    },
    {
        name: 'Earth',
        radius: 1,
        distance: 10,
        orbitalSpeed: 2.98,
        rotationSpeed: 0.1,
        color: '#6495ED', // Blue
        speedControl: 'earth-speed',
        texture: generateEarthTexture() // Special texture for Earth with continents and oceans
    },
    {
        name: 'Mars',
        radius: 0.53,
        distance: 15,
        orbitalSpeed: 2.41,
        rotationSpeed: 0.097,
        color: '#CD5C5C', // Red
        speedControl: 'mars-speed',
        texture: generatePlanetTexture('#CD5C5C', '#8B3A3A', 0.4, 0.3) // Reddish with darker craters
    },
    {
        name: 'Jupiter',
        radius: 11.2 * 0.3, // Scaled down for better visualization
        distance: 50,
        orbitalSpeed: 1.31,
        rotationSpeed: 0.24,
        color: '#F4A460', // Sandy brown
        speedControl: 'jupiter-speed',
        texture: generateGasGiantTexture('#F4A460', '#DAA520', 0.2) // Gas giant with bands
    },
    {
        name: 'Saturn',
        radius: 9.45 * 0.3, // Scaled down for better visualization
        distance: 95,
        orbitalSpeed: 0.97,
        rotationSpeed: 0.22,
        color: '#DAA520', // Golden
        speedControl: 'saturn-speed',
        texture: generateGasGiantTexture('#DAA520', '#B8860B', 0.15) // Gas giant with bands
    },
    {
        name: 'Uranus',
        radius: 4.0 * 0.5,
        distance: 192,
        orbitalSpeed: 0.68,
        rotationSpeed: 0.14,
        color: '#ADD8E6', // Light blue
        speedControl: 'uranus-speed',
        texture: generatePlanetTexture('#ADD8E6', '#87CEEB', 0.1, 0.05) // Light blue with subtle variations
    },
    {
        name: 'Neptune',
        radius: 3.88 * 0.5,
        distance: 301,
        orbitalSpeed: 0.54,
        rotationSpeed: 0.15,
        color: '#4169E1', // Royal blue
        speedControl: 'neptune-speed',
        texture: generatePlanetTexture('#4169E1', '#1E90FF', 0.15, 0.08) // Deep blue with subtle variations
    }
];

// Function to generate a procedural texture for a planet
function generatePlanetTexture(baseColor, craterColor, noiseScale, craterDensity) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Fill with base color
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add noise and craters
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            // Simple noise function
            const noise = Math.sin(x * noiseScale) * Math.cos(y * noiseScale) * 0.5 + 0.5;
            
            // Random craters
            if (Math.random() < craterDensity * noise) {
                const size = Math.random() * 5 + 1;
                ctx.fillStyle = craterColor;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
}

// Function to generate a special texture for Earth
function generateEarthTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Fill with ocean blue
    ctx.fillStyle = '#1E3F66';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw continents (simplified shapes)
    ctx.fillStyle = '#2E8B57'; // Forest green for land
    
    // North America
    ctx.beginPath();
    ctx.moveTo(100, 60);
    ctx.lineTo(150, 50);
    ctx.lineTo(170, 80);
    ctx.lineTo(140, 120);
    ctx.lineTo(100, 100);
    ctx.fill();
    
    // South America
    ctx.beginPath();
    ctx.moveTo(150, 130);
    ctx.lineTo(170, 150);
    ctx.lineTo(160, 200);
    ctx.lineTo(130, 180);
    ctx.lineTo(140, 140);
    ctx.fill();
    
    // Europe and Africa
    ctx.beginPath();
    ctx.moveTo(240, 60);
    ctx.lineTo(270, 70);
    ctx.lineTo(280, 120);
    ctx.lineTo(260, 170);
    ctx.lineTo(230, 150);
    ctx.lineTo(220, 100);
    ctx.fill();
    
    // Asia and Australia
    ctx.beginPath();
    ctx.moveTo(300, 70);
    ctx.lineTo(380, 80);
    ctx.lineTo(370, 130);
    ctx.lineTo(320, 120);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(350, 160);
    ctx.lineTo(380, 170);
    ctx.lineTo(370, 190);
    ctx.lineTo(340, 180);
    ctx.fill();
    
    // Add ice caps
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 10, 60, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height - 10, 60, 0, Math.PI * 2);
    ctx.fill();
    
    // Add some clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 20 + 5;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
}

// Function to generate a texture for gas giants with bands
function generateGasGiantTexture(baseColor, bandColor, bandScale) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Fill with base color
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add horizontal bands
    for (let y = 0; y < canvas.height; y++) {
        // Create alternating bands
        const noise = Math.sin(y * bandScale) * 0.5 + 0.5;
        
        if (noise > 0.6) {
            ctx.fillStyle = bandColor;
            ctx.fillRect(0, y, canvas.width, 1);
        }
        
        // Add some turbulence to the bands
        if (Math.random() < 0.01) {
            const turbulenceHeight = Math.random() * 10 + 5;
            const turbulenceWidth = Math.random() * 100 + 50;
            const x = Math.random() * canvas.width;
            
            ctx.fillStyle = bandColor;
            ctx.beginPath();
            ctx.ellipse(x, y, turbulenceWidth, turbulenceHeight, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
}

// Initialize the scene
function init() {
    // Create scene
    scene = new THREE.Scene();
    
    // Create camera
    const aspectRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(45, aspectRatio, 0.1, 2000);
    camera.position.set(0, 150, 350);
    camera.lookAt(0, 0, 0);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    
    // Add orbit controls for camera movement
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 20;
    controls.maxDistance = 800;
    
    // Create ambient light for general illumination
    const ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);
    
    // Create starry background
    createStarField();
    
    // Create sun and planets
    createSun();
    createPlanets();
    createOrbits();
    
    // Add event listeners
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);
    
    // Setup UI controls
    setupControls();
    
    // Setup zoom controls
    setupZoomControls();
    
    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loading-screen').style.opacity = 0;
        setTimeout(() => {
            document.getElementById('loading-screen').style.display = 'none';
        }, 500);
    }, 1000);
    
    // Start animation loop
    animate();
}

// Create a starry background with improved variety
function createStarField() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 15000; // Increased star count
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    
    for (let i = 0; i < starCount; i++) {
        // Random position in a sphere
        const radius = 1000;
        const theta = 2 * Math.PI * Math.random();
        const phi = Math.acos(2 * Math.random() - 1);
        
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);
        
        // Random star size with more variation
        sizes[i] = Math.random() * 3 + 0.5;
        
        // Random star color (white to blue-ish to yellow-ish)
        const colorChoice = Math.random();
        if (colorChoice > 0.8) {
            // Blue-ish stars
            colors[i * 3] = 0.8 + Math.random() * 0.2; // R
            colors[i * 3 + 1] = 0.8 + Math.random() * 0.2; // G
            colors[i * 3 + 2] = 1.0; // B
        } else if (colorChoice > 0.6) {
            // Yellow-ish stars
            colors[i * 3] = 1.0; // R
            colors[i * 3 + 1] = 0.9 + Math.random() * 0.1; // G
            colors[i * 3 + 2] = 0.6 + Math.random() * 0.2; // B
        } else {
            // White stars
            colors[i * 3] = 0.9 + Math.random() * 0.1; // R
            colors[i * 3 + 1] = 0.9 + Math.random() * 0.1; // G
            colors[i * 3 + 2] = 0.9 + Math.random() * 0.1; // B
        }
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const starMaterial = new THREE.PointsMaterial({
        vertexColors: true,
        size: 1,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });
    
    starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);
}

// Create the sun with enhanced glow
function createSun() {
    // Sun geometry and material with improved texture
    const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
    
    // Create a procedural sun texture
    const sunCanvas = document.createElement('canvas');
    sunCanvas.width = 512;
    sunCanvas.height = 256;
    const ctx = sunCanvas.getContext('2d');
    
    // Create a radial gradient for the sun
    const gradient = ctx.createRadialGradient(
        sunCanvas.width / 2, sunCanvas.height / 2, 0,
        sunCanvas.width / 2, sunCanvas.height / 2, sunCanvas.width / 2
    );
    gradient.addColorStop(0, '#FFFF00'); // Bright yellow at center
    gradient.addColorStop(0.5, '#FFA500'); // Orange
    gradient.addColorStop(1, '#FF4500'); // Red-orange at edges
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, sunCanvas.width, sunCanvas.height);
    
    // Add some solar flares
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 100 + 100;
        const x = sunCanvas.width / 2 + Math.cos(angle) * distance;
        const y = sunCanvas.height / 2 + Math.sin(angle) * distance;
        const size = Math.random() * 10 + 5;
        
        ctx.globalAlpha = Math.random() * 0.5 + 0.2;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    const sunTexture = new THREE.CanvasTexture(sunCanvas);
    
    const sunMaterial = new THREE.MeshBasicMaterial({
        map: sunTexture,
        transparent: true,
        opacity: 0.9
    });
    
    sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);
    
    // Add point light for sun's emission
    const sunLight = new THREE.PointLight(0xffffff, 1.5, 1000);
    sun.add(sunLight);
    
    // Add glow effect
    const glowGeometry = new THREE.SphereGeometry(3.5, 32, 32);
    const glowMaterial = new THREE.ShaderMaterial({
        uniforms: {
            viewVector: { type: "v3", value: camera.position }
        },
        vertexShader: `
            uniform vec3 viewVector;
            varying float intensity;
            void main() {
                vec3 vNormal = normalize(normalMatrix * normal);
                vec3 vNormel = normalize(normalMatrix * viewVector);
                intensity = pow(0.7 - dot(vNormal, vNormel), 2.0);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying float intensity;
            void main() {
                vec3 glow = vec3(1.0, 0.8, 0.0) * intensity;
                gl_FragColor = vec4(glow, 1.0);
            }
        `,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true
    });
    
    const sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(sunGlow);
}

// Create all planets with enhanced materials
function createPlanets() {
    PLANET_INFO.forEach(info => {
        // Create planet geometry and material with texture
        const planetGeometry = new THREE.SphereGeometry(info.radius, 32, 32);
        const planetMaterial = new THREE.MeshStandardMaterial({
            map: info.texture,
            roughness: 0.7,
            metalness: 0.1
        });
        
        const planet = new THREE.Mesh(planetGeometry, planetMaterial);
        
        // Create planet object with orbit group
        const orbitGroup = new THREE.Group();
        scene.add(orbitGroup);
        orbitGroup.add(planet);
        
        // Position planet at its orbital distance
        planet.position.x = info.distance;
        
        // Add atmosphere for Earth
        if (info.name === 'Earth') {
            const atmosphereGeometry = new THREE.SphereGeometry(info.radius * 1.05, 32, 32);
            const atmosphereMaterial = new THREE.MeshBasicMaterial({
                color: 0x6495ED,
                transparent: true,
                opacity: 0.2,
                side: THREE.BackSide
            });
            const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
            planet.add(atmosphere);
        }
        
        // Add rings for Saturn
        if (info.name === 'Saturn') {
            const ringGeometry = new THREE.RingGeometry(info.radius * 1.4, info.radius * 2.0, 64);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: 0xDAA520,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.7
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2;
            planet.add(ring);
        }
        
        // Store planet data for animation
        planetData.push({
            planet: planet,
            orbitGroup: orbitGroup,
            info: info,
            angle: Math.random() * Math.PI * 2, // Random starting position
            speedMultiplier: 1 // Default speed multiplier
        });
        
        // Store planet reference by name
        planets[info.name] = planet;
    });
}

// Create orbital paths with improved appearance
function createOrbits() {
    PLANET_INFO.forEach(info => {
        const orbitGeometry = new THREE.RingGeometry(info.distance - 0.1, info.distance + 0.1, 128);
        const orbitMaterial = new THREE.MeshBasicMaterial({
            color: 0x444444,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.3
        });
        
        const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
        orbit.rotation.x = Math.PI / 2;
        scene.add(orbit);
    });
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Handle mouse movement for tooltips
function onMouseMove(event) {
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Update tooltip position
    tooltip.style.left = event.clientX + 15 + 'px';
    tooltip.style.top = event.clientY + 15 + 'px';
    
    // Check for planet hover
    checkPlanetHover();
}

// Check if mouse is hovering over a planet
function checkPlanetHover() {
    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);
    
    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(Object.values(planets));
    
    if (intersects.length > 0) {
        // Find the planet name
        const planetName = Object.keys(planets).find(key => planets[key] === intersects[0].object);
        
        // Show tooltip
        tooltip.textContent = planetName;
        tooltip.style.opacity = 1;
    } else if (raycaster.intersectObject(sun).length > 0) {
        // Show tooltip for sun
        tooltip.textContent = 'Sun';
        tooltip.style.opacity = 1;
    } else {
        // Hide tooltip
        tooltip.style.opacity = 0;
    }
}

// Setup zoom controls
function setupZoomControls() {
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    
    zoomInBtn.addEventListener('click', function() {
        // Zoom in by moving the camera closer
        const zoomDistance = camera.position.length() / zoomFactor;
        const minDistance = controls.minDistance;
        
        // Don't zoom in closer than the minimum distance
        if (zoomDistance > minDistance) {
            const direction = new THREE.Vector3();
            direction.subVectors(controls.target, camera.position).normalize();
            camera.position.addScaledVector(direction, camera.position.length() * (1 - 1/zoomFactor));
            controls.update();
        }
    });
    
    zoomOutBtn.addEventListener('click', function() {
        // Zoom out by moving the camera farther
        const zoomDistance = camera.position.length() * zoomFactor;
        const maxDistance = controls.maxDistance;
        
        // Don't zoom out farther than the maximum distance
        if (zoomDistance < maxDistance) {
            const direction = new THREE.Vector3();
            direction.subVectors(camera.position, controls.target).normalize();
            camera.position.addScaledVector(direction, camera.position.length() * (zoomFactor - 1));
            controls.update();
        }
    });
}

// Setup UI controls
function setupControls() {
    // Speed control sliders
    PLANET_INFO.forEach(info => {
        const slider = document.getElementById(info.speedControl);
        const valueDisplay = document.getElementById(info.speedControl + '-value');
        
        slider.addEventListener('input', function() {
            // Find the planet data and update its speed multiplier
            const planet = planetData.find(p => p.info.name === info.name);
            if (planet) {
                planet.speedMultiplier = parseFloat(this.value);
                valueDisplay.textContent = this.value + 'x';
            }
        });
    });
    
    // Pause/Resume button
    const pauseButton = document.getElementById('pause-button');
    pauseButton.addEventListener('click', function() {
        isPaused = !isPaused;
        this.textContent = isPaused ? 'Resume' : 'Pause';
    });
    
    // Reset button
    const resetButton = document.getElementById('reset-button');
    resetButton.addEventListener('click', function() {
        // Reset all speed sliders to 1
        PLANET_INFO.forEach(info => {
            const slider = document.getElementById(info.speedControl);
            const valueDisplay = document.getElementById(info.speedControl + '-value');
            slider.value = 1;
            valueDisplay.textContent = '1.0x';
            
            // Reset planet speed multiplier
            const planet = planetData.find(p => p.info.name === info.name);
            if (planet) {
                planet.speedMultiplier = 1;
            }
        });
    });
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    themeToggle.addEventListener('click', function() {
        isDarkTheme = !isDarkTheme;
        document.body.classList.toggle('dark-theme', isDarkTheme);
        document.body.classList.toggle('light-theme', !isDarkTheme);
        themeIcon.textContent = isDarkTheme ? '☀️' : '🌙';
        
        // Update control panel colors based on theme
        const controlPanel = document.getElementById('control-panel');
        if (isDarkTheme) {
            controlPanel.classList.remove('bg-gray-200');
            controlPanel.classList.add('bg-gray-800');
        } else {
            controlPanel.classList.remove('bg-gray-800');
            controlPanel.classList.add('bg-gray-200');
        }
    });
    
    // Mobile panel toggle
    const togglePanel = document.getElementById('toggle-panel');
    const showPanel = document.getElementById('show-panel');
    const controlPanel = document.getElementById('control-panel');
    
    togglePanel.addEventListener('click', function() {
        controlPanel.classList.add('translate-y-full');
        controlPanel.classList.remove('md:translate-y-0');
        setTimeout(() => {
            showPanel.classList.remove('hidden');
        }, 300);
    });
    
    showPanel.addEventListener('click', function() {
        controlPanel.classList.remove('translate-y-full');
        controlPanel.classList.add('md:translate-y-0');
        this.classList.add('hidden');
    });
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Update controls
    controls.update();
    
    // Update sun glow effect
    const sunGlow = scene.children.find(child => 
        child instanceof THREE.Mesh && 
        child.material instanceof THREE.ShaderMaterial);
    
    if (sunGlow) {
        sunGlow.material.uniforms.viewVector.value = new THREE.Vector3().subVectors(
            camera.position, sunGlow.position
        );
    }
    
    // If paused, skip animation updates
    if (!isPaused) {
        // Get elapsed time
        const delta = clock.getDelta();
        
        // Rotate sun
        sun.rotation.y += 0.005;
        
        // Update star field rotation slightly
        starField.rotation.y += 0.0001;
        
        // Update planets
        planetData.forEach(data => {
            // Update orbital position
            data.angle += delta * 0.5 * data.info.orbitalSpeed * data.speedMultiplier;
            
            // Apply orbital rotation
            data.orbitGroup.rotation.y = data.angle;
            
            // Apply planet self-rotation
            data.planet.rotation.y += delta * data.info.rotationSpeed;
        });
    }
    
    // Render scene
    renderer.render(scene, camera);
}

// Start the application
init();