// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('viewport').appendChild(renderer.domElement);

// Raycaster for object selection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedObject = null;
let outlineMesh = null;

// Set up the Shapes button and menu
document.getElementById('shapes-button').addEventListener('click', () => {
    const shapesMenu = document.getElementById('shapes-menu');
    shapesMenu.classList.toggle('hidden');
});

// Add shape event listeners
document.getElementById('add-cube').addEventListener('click', () => addShape('cube'));
document.getElementById('add-sphere').addEventListener('click', () => addShape('sphere'));
document.getElementById('add-cylinder').addEventListener('click', () => addShape('cylinder'));
document.getElementById('add-plane').addEventListener('click', () => addShape('plane'));
document.getElementById('add-cone').addEventListener('click', () => addShape('cone'));
document.getElementById('add-torus').addEventListener('click', () => addShape('torus'));

// Function to add a shape to the scene
function addShape(shape) {
    let geometry;
    let mesh;

    const subdivisions = parseInt(document.getElementById('subdivisions').value, 10);
    const width = parseFloat(document.getElementById('width').value);
    const height = parseFloat(document.getElementById('height').value);
    const depth = parseFloat(document.getElementById('depth').value);

    switch (shape) {
        case 'cube':
            geometry = new THREE.BoxGeometry(width, height, depth);
            mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
            break;
        case 'sphere':
            geometry = new THREE.SphereGeometry(width, subdivisions, subdivisions);
            mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
            break;
        case 'cylinder':
            geometry = new THREE.CylinderGeometry(width, width, height, subdivisions);
            mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
            break;
        case 'plane':
            geometry = new THREE.PlaneGeometry(width, height);
            mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide }));
            mesh.rotation.x = Math.PI / 2; // Rotate plane to be horizontal
            break;
        case 'cone':
            geometry = new THREE.ConeGeometry(width, height, subdivisions);
            mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
            break;
        case 'torus':
            geometry = new THREE.TorusGeometry(width, height, subdivisions, subdivisions);
            mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
            mesh.rotation.x = Math.PI / 2; // Rotate torus to be horizontal
            break;
        default:
            return;
    }

    // Position the mesh at the origin
    mesh.position.set(0, 0, 0);
    scene.add(mesh);
    
    // Update the properties panel for the new shape
    showPropertiesPanel(shape);
    updatePositionInputs(mesh); // Update position inputs
}

// Function to show properties panel for the selected shape
function showPropertiesPanel(shape) {
    const panel = document.getElementById('properties-panel');
    panel.style.display = 'block';

    const subdivisionsInput = document.getElementById('subdivisions');
    const widthInput = document.getElementById('width');
    const heightInput = document.getElementById('height');
    const depthInput = document.getElementById('depth');
    
    // Set default values based on shape
    switch (shape) {
        case 'cube':
            widthInput.value = 1;
            heightInput.value = 1;
            depthInput.value = 1;
            subdivisionsInput.value = ''; // Not used for cube
            break;
        case 'sphere':
            widthInput.value = 1;
            heightInput.value = 1;
            depthInput.value = ''; // Not used for sphere
            subdivisionsInput.value = 8;
            break;
        case 'cylinder':
            widthInput.value = 1;
            heightInput.value = 1;
            depthInput.value = ''; // Not used for cylinder
            subdivisionsInput.value = 8;
            break;
        case 'plane':
            widthInput.value = 1;
            heightInput.value = 1;
            depthInput.value = ''; // Not used for plane
            subdivisionsInput.value = ''; // Not used for plane
            break;
        case 'cone':
            widthInput.value = 1;
            heightInput.value = 1;
            depthInput.value = ''; // Not used for cone
            subdivisionsInput.value = 8;
            break;
        case 'torus':
            widthInput.value = 1;
            heightInput.value = 0.4; // Tube radius
            depthInput.value = ''; // Not used for torus
            subdivisionsInput.value = 8;
            break;
    }
}

// Update position inputs based on the selected shape
function updatePositionInputs(mesh) {
    document.getElementById('pos-x').value = mesh.position.x;
    document.getElementById('pos-y').value = mesh.position.y;
    document.getElementById('pos-z').value = mesh.position.z;

    selectedObject = mesh;
}

// Event listener to update position when inputs change
document.getElementById('pos-x').addEventListener('input', function () {
    if (selectedObject) {
        selectedObject.position.x = parseFloat(this.value);
    }
});
document.getElementById('pos-y').addEventListener('input', function () {
    if (selectedObject) {
        selectedObject.position.y = parseFloat(this.value);
    }
});
document.getElementById('pos-z').addEventListener('input', function () {
    if (selectedObject) {
        selectedObject.position.z = parseFloat(this.value);
    }
});

// Raycast to select an object on mouse click
window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        selectedObject = intersectedObject;
        updatePositionInputs(intersectedObject); // Update inputs when an object is selected
    }
});

// Function to save the current state for undo functionality
function saveState() {
    // Save the current scene or state to undo stack
}

// Set the camera position
camera.position.z = 5; // Move the camera back to see the objects

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();
