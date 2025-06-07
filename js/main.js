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

// Planet data with realistic relative values (scaled for visualization)
const PLANET_INFO = [
    {
        name: 'Mercury',
        radius: 0.38, // Size relative to Earth (scaled up for visibility)
        distance: 5, // Distance from Sun (scaled down for visualization)
        orbitalSpeed: 4.74, // Orbital speed multiplier
        rotationSpeed: 0.017, // Rotation speed
        color: '#A9A9A9', // Gray
        speedControl: 'mercury-speed'
    },
    {
        name: 'Venus',
        radius: 0.95,
        distance: 7,
        orbitalSpeed: 3.5,
        rotationSpeed: 0.004, // Slow retrograde rotation
        color: '#E6E6FA', // Light yellow
        speedControl: 'venus-speed'
    },
    {
        name: 'Earth',
        radius: 1,
        distance: 10,
        orbitalSpeed: 2.98,
        rotationSpeed: 0.1,
        color: '#6495ED', // Blue
        speedControl: 'earth-speed'
    },
    {
        name: 'Mars',
        radius: 0.53,
        distance: 15,
        orbitalSpeed: 2.41,
        rotationSpeed: 0.097,
        color: '#CD5C5C', // Red
        speedControl: 'mars-speed'
    },
    {
        name: 'Jupiter',
        radius: 11.2 * 0.3, // Scaled down for better visualization
        distance: 50,
        orbitalSpeed: 1.31,
        rotationSpeed: 0.24,
        color: '#F4A460', // Sandy brown
        speedControl: 'jupiter-speed'
    },
    {
        name: 'Saturn',
        radius: 9.45 * 0.3, // Scaled down for better visualization
        distance: 95,
        orbitalSpeed: 0.97,
        rotationSpeed: 0.22,
        color: '#DAA520', // Golden
        speedControl: 'saturn-speed'
    },
    {
        name: 'Uranus',
        radius: 4.0 * 0.5,
        distance: 192,
        orbitalSpeed: 0.68,
        rotationSpeed: 0.14,
        color: '#ADD8E6', // Light blue
        speedControl: 'uranus-speed'
    },
    {
        name: 'Neptune',
        radius: 3.88 * 0.5,
        distance: 301,
        orbitalSpeed: 0.54,
        rotationSpeed: 0.15,
        color: '#4169E1', // Royal blue
        speedControl: 'neptune-speed'
    }
];

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

// Create a starry background
function createStarField() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 10000;
    const positions = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    
    for (let i = 0; i < starCount; i++) {
        // Random position in a sphere
        const radius = 1000;
        const theta = 2 * Math.PI * Math.random();
        const phi = Math.acos(2 * Math.random() - 1);
        
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);
        
        // Random star size
        sizes[i] = Math.random() * 2;
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const starMaterial = new THREE.PointsMaterial({
        color: 0xFFFFFF,
        size: 1,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });
    
    starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);
}

// Create the sun
function createSun() {
    // Sun geometry and material
    const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff00,
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

// Create all planets
function createPlanets() {
    PLANET_INFO.forEach(info => {
        // Create planet geometry and material
        const planetGeometry = new THREE.SphereGeometry(info.radius, 32, 32);
        const planetMaterial = new THREE.MeshStandardMaterial({
            color: info.color,
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

// Create orbital paths
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