# 3D Solar System Simulation

## Overview
This project is a 3D simulation of our solar system built with Three.js. It features a responsive, interactive visualization of the Sun and all eight planets (Mercury to Neptune) with realistic orbital mechanics and customizable animation speeds.

## Features

- **Realistic Solar System**: Includes the Sun and all 8 planets with scaled sizes and distances
- **Interactive Controls**: Adjust orbital speeds for each planet individually
- **Responsive Design**: Works on both desktop and mobile devices
- **Smooth Animations**: Utilizes THREE.Clock and requestAnimationFrame for fluid motion
- **Intuitive UI**: Clean, dark-themed interface with Tailwind CSS

### Bonus Features

- **Pause/Resume**: Toggle animation of all planets
- **Starry Background**: Beautiful particle-based star field
- **Planet Labels**: Hover over planets to see their names
- **Theme Toggle**: Switch between dark and light themes
- **Camera Controls**: Orbit and zoom functionality for interactive exploration

## How to Run

### Option 1: Open Directly in Browser
Simply open the `index.html` file in a modern web browser (Chrome, Firefox, Safari, or Edge).

### Option 2: Use a Local Server (Recommended)

1. Install Node.js if you don't have it already
2. Open a terminal/command prompt in the project directory
3. Run: `npx serve`
4. Open the URL displayed in the terminal (typically http://localhost:3000)

Using a local server is recommended to avoid potential CORS issues with textures and other resources.

## Controls

- **Planet Speed Sliders**: Adjust the orbital speed of each planet
- **Pause/Resume Button**: Toggle all planet animations
- **Reset Button**: Reset all speeds to default values
- **Theme Toggle**: Switch between dark and light themes
- **Mouse Controls**:
  - **Left-click + drag**: Rotate the camera around the scene
  - **Scroll wheel**: Zoom in and out
  - **Right-click + drag**: Pan the camera

## Technical Implementation

### Technologies Used

- **Three.js**: For 3D rendering and animation
- **Tailwind CSS**: For responsive UI components
- **Vanilla JavaScript**: For DOM manipulation and event handling

### Code Structure

- **index.html**: Main HTML file with Three.js canvas and control panel
- **js/main.js**: JavaScript file with all Three.js logic, animations, and controls
- **assets/**: Folder for planet textures (using simple color materials in this implementation)

### Performance Considerations

- Optimized for 60 FPS on most devices
- Simplified planet geometries for better performance
- Efficient animation loop using requestAnimationFrame

## Browser Compatibility

Tested and working on:
- Google Chrome (latest)
- Mozilla Firefox (latest)
- Safari (latest)
- Microsoft Edge (latest)

## License

This project is open source and available for educational and personal use.

---

Enjoy exploring our solar system! 🚀✨