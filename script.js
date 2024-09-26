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

// Undo stack to keep track of actions
const undoStack = [];

// Set up the Shapes button and menu
document.getElementById('shapes-button').addEventListener('click', () => {
    const shapesMenu = document.getElementById('shapes-menu');
    shapesMenu.classList.toggle('hidden');
});

document.getElementById('add-cube').addEventListener('click', () => addShape('cube'));
document.getElementById('add-sphere').addEventListener('click', () => addShape('sphere'));
document.getElementById('add-cylinder').addEventListener('click', () => addShape('cylinder'));
document.getElementById('add-plane').addEventListener('click', () => addShape('plane'));
document.getElementById('add-cone').addEventListener('click', () => addShape('cone'));
document.getElementById('add-torus').addEventListener('click', () => addShape('torus'));

// Function to add a shape to the scene
function addShape(shape) {
    saveState(); // Save the current state before making changes
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
    
    scene.add(mesh);
    showPropertiesPanel(shape);
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
            heightInput.value = 0.4; // Default tube radius
            depthInput.value = ''; // Not used for torus
            subdivisionsInput.value = 8;
            break;
        default:
            panel.style.display = 'none';
    }
}

// Function to save the current state of the scene
function saveState() {
    const objects = scene.children.map(child => child.clone());
    undoStack.push(objects);
}

// Function to restore the last saved state
function undo() {
    if (undoStack.length === 0) return;
    
    // Clear the current scene
    scene.clear();
    
    // Restore the last saved state
    const lastState = undoStack.pop();
    lastState.forEach(object => scene.add(object));
    
    // Update selectedObject and outlineMesh
    selectedObject = null;
    outlineMesh = null;
}

// Set up the camera position
camera.position.z = 5;

// Set up controls
let isMouseDown = false;
let isMiddleMouseDown = false;
let startX, startY;
const sensitivity = 0.005; // 50% slower sensitivity

document.addEventListener('mousedown', (event) => {
    if (event.button === 0) { // Left mouse button
        isMouseDown = true;
        startX = event.clientX;
        startY = event.clientY;
    } else if (event.button === 1) { // Middle mouse button
        isMiddleMouseDown = true;
        startX = event.clientX;
        startY = event.clientY;
    }
});

document.addEventListener('mouseup', () => {
    isMouseDown = false;
    isMiddleMouseDown = false;
});

document.addEventListener('mousemove', (event) => {
    if (isMouseDown) {
        const deltaX = (event.clientX - startX) * sensitivity;
        const deltaY = (event.clientY - startY) * sensitivity;
        scene.rotation.y += deltaX;
        scene.rotation.x += deltaY;
        startX = event.clientX;
        startY = event.clientY;
    } else if (isMiddleMouseDown) {
        const deltaX = (event.clientX - startX) * sensitivity;
        const deltaY = (event.clientY - startY) * sensitivity;
        camera.position.x -= deltaX;
        camera.position.y += deltaY;
        startX = event.clientX;
        startY = event.clientY;
    }
});

// Add scroll wheel zoom functionality
document.addEventListener('wheel', (event) => {
    const zoomSpeed = 0.005; // Slower zoom speed
    camera.position.z += event.deltaY * zoomSpeed;
});

// Handle object selection and deselection
document.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    
    if (intersects.length > 0) {
        if (selectedObject) {
            scene.remove(outlineMesh); // Remove previous outline
        }
        selectedObject = intersects[0].object;
        
        // Create an outline mesh with 50% thinner outline
        const outlineMaterial = new THREE.MeshBasicMaterial({ color: 0xffa500, side: THREE.BackSide });
        outlineMesh = new THREE.Mesh(selectedObject.geometry, outlineMaterial);
        outlineMesh.scale.multiplyScalar(1.05); // Slightly larger to create a thinner outline effect
        
        // Match the rotation of the selected object
        outlineMesh.rotation.copy(selectedObject.rotation);
        
        outlineMesh.position.copy(selectedObject.position);
        scene.add(outlineMesh);
    } else {
        // Deselect if clicked on empty space
        if (selectedObject) {
            scene.remove(outlineMesh);
            selectedObject = null;
            outlineMesh = null;
            document.getElementById('properties-panel').style.display = 'none'; // Hide properties panel
        }
    }
});

// Handle object deletion
document.addEventListener('keydown', (event) => {
    if (event.key === 'Delete' && selectedObject) {
        saveState(); // Save the state before deletion
        scene.remove(selectedObject);
        scene.remove(outlineMesh); // Remove the outline
        selectedObject = null;
        outlineMesh = null;
        document.getElementById('properties-panel').style.display = 'none'; // Hide properties panel
    } else if (event.ctrlKey && event.key === 'z') { // Ctrl + Z for undo
        undo();
    }
});

// Handle property changes
document.getElementById('subdivisions').addEventListener('input', updateShapeProperties);
document.getElementById('width').addEventListener('input', updateShapeProperties);
document.getElementById('height').addEventListener('input', updateShapeProperties);
document.getElementById('depth').addEventListener('input', updateShapeProperties);

function updateShapeProperties() {
    if (selectedObject) {
        const shapeType = getShapeType(selectedObject);

        let geometry;
        const subdivisions = parseInt(document.getElementById('subdivisions').value, 10);
        const width = parseFloat(document.getElementById('width').value);
        const height = parseFloat(document.getElementById('height').value);
        const depth = parseFloat(document.getElementById('depth').value);

        switch (shapeType) {
            case 'cube':
                geometry = new THREE.BoxGeometry(width, height, depth);
                break;
            case 'sphere':
                geometry = new THREE.SphereGeometry(width, subdivisions, subdivisions);
                break;
            case 'cylinder':
                geometry = new THREE.CylinderGeometry(width, width, height, subdivisions);
                break;
            case 'plane':
                geometry = new THREE.PlaneGeometry(width, height);
                break;
            case 'cone':
                geometry = new THREE.ConeGeometry(width, height, subdivisions);
                break;
            case 'torus':
                geometry = new THREE.TorusGeometry(width, height, subdivisions, subdivisions);
                break;
            default:
                return;
        }

        selectedObject.geometry.dispose(); // Dispose of old geometry
        selectedObject.geometry = geometry;
        outlineMesh.geometry.dispose(); // Dispose of old outline geometry
        outlineMesh.geometry = geometry; // Update outline geometry
    }
}

// Function to get the shape type from the object
function getShapeType(object) {
    if (object instanceof THREE.Mesh) {
        if (object.geometry instanceof THREE.BoxGeometry) return 'cube';
        if (object.geometry instanceof THREE.SphereGeometry) return 'sphere';
        if (object.geometry instanceof THREE.CylinderGeometry) return 'cylinder';
        if (object.geometry instanceof THREE.PlaneGeometry) return 'plane';
        if (object.geometry instanceof THREE.ConeGeometry) return 'cone';
        if (object.geometry instanceof THREE.TorusGeometry) return 'torus';
    }
    return null;
}

// Handle window resize
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

// Render loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();