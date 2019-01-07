//import three.js
const THREE = require('three');

//export stateless React component
export default function Root() {
    return null;
}

//Setup:

//get the DOM element in which you want to attach the scene
const container = document.querySelector('#container');

//create a WebGL renderer
const renderer = new THREE.WebGLRenderer();

//set the attributes of the renderer
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

//set the renderer size
renderer.setSize(WIDTH, HEIGHT);

//Adding a Camera

//set camera attributes
const VIEW_ANGLE = 45;
const ASPECT = WIDTH / HEIGHT;
const NEAR = 0.1;
const FAR = 30000 * 32.39;

//create a camera
const camera =
    new THREE.PerspectiveCamera(
        VIEW_ANGLE,
        ASPECT,
        NEAR,
        FAR
    );

//set the camera position - x, y, z
camera.position.set(0, 0, 3000 * 32.39);

// Create a scene
const scene = new THREE.Scene();

//set the scene background
scene.background = new THREE.Color(0x000);

//add the camera to the scene.
scene.add(camera);

// Attach the renderer to the DOM element.
container.appendChild(renderer.domElement);

//Three.js uses geometric meshes to create primitive 3D shapes like spheres, cubes, etc. I’ll be using a sphere.

// Set up the sphere attributes
const EARTH_RADIUS = 6378;
const MOON_RADIUS = 1737;
const SEGMENTS = 100;
const RINGS = 100;

//Create a group (which will later include our sphere and its texture meshed together)
const miniUniverse = new THREE.Group();
//add it to the scene
scene.add(miniUniverse);

//Let's create our globe using TextureLoader

// instantiate a loader
var loader = new THREE.TextureLoader();

function addSphere(radius, textureFilename, coord3d) {
    loader.load(textureFilename, function (texture) {
        //create the sphere
        var sphere = new THREE.SphereGeometry(radius, SEGMENTS, RINGS);

        //map the texture to the material. Read more about materials in three.js docs
        var material = new THREE.MeshBasicMaterial({ map: texture, overdraw: 0.5 });

        //create a new mesh with sphere geometry. 
        var mesh = new THREE.Mesh(sphere, material);

        mesh.position.x = coord3d.x;
        mesh.position.y = coord3d.y;
        mesh.position.z = coord3d.z;

        //add mesh to universe group
        miniUniverse.add(mesh);
    });
}

//const earthTexture = 'land_ocean_ice_cloud_2048.jpg';
const earthTexture = 'earth_no_clouds_4k.jpg';
const moonTexture = 'moon_4k.jpg';


const DISTANCE_MOON_EARTH = 384402;
addSphere(EARTH_RADIUS, earthTexture, { x: 0, y: 0, z: 0 });

var moonCoords = get3dCoordsOfGpsCoord(EARTH_RADIUS, DISTANCE_MOON_EARTH - EARTH_RADIUS, degrees_to_radians(-7.09), degrees_to_radians(-150.3));
console.log("moonCoords", moonCoords)
addSphere(MOON_RADIUS, moonTexture, moonCoords)


// Move the sphere back (z) so we can see it.
//miniUniverse.position.z = -700 * 32.39; //0; //-300;

//Lighting

//create a point light (won't make a difference here because our material isn't affected by light)
const pointLight =
    new THREE.PointLight(0xFFFFFF);

//set its position
pointLight.position.x = 320;
pointLight.position.y = 1600;
pointLight.position.z = 12800;

//add light to the scene
scene.add(pointLight);

function degrees_to_radians(degrees) {
    var pi = Math.PI;
    return degrees * (pi / 180);
}

function get3dCoordsOfGpsCoord(earthRadiusInKilometers, alt, latInRadians, lonInRadians) {
    var r = earthRadiusInKilometers + alt;
    var x = r * Math.cos(latInRadians) * Math.cos(lonInRadians);
    var y = r * Math.cos(latInRadians) * Math.sin(lonInRadians);
    var z = r * Math.sin(latInRadians);

    return {
        x: x,
        y: y,
        z: z
    };
}

//Update

//set update function to transform the scene and view
function update() {
    //render
    renderer.render(scene, camera);

    //schedule the next frame.
    requestAnimationFrame(update);
}

//schedule the first frame.
requestAnimationFrame(update);

//Rotate on Arrow Key Press

//setting up our rotation based on arrow key
function animationBuilder(direction) {
    return function animateRotate() {
        //based on key pressed, rotate +-x or +-y
        switch (direction) {
            case 'up':
                miniUniverse.rotation.x -= 0.2;
                break;
            case 'down':
                miniUniverse.rotation.x += 0.2;
                break;
            case 'left':
                miniUniverse.rotation.y -= 0.2;
                break;
            case 'right':
                miniUniverse.rotation.y += 0.2;
                break;
            default:
                break;
        }
    }
}

//store animation call in directions object
var animateDirection = {
    up: animationBuilder('up'),
    down: animationBuilder('down'),
    left: animationBuilder('left'),
    right: animationBuilder('right')
}

//callback function for key press event listener
function checkKey(e) {

    e = e || window.event;

    e.preventDefault();

    //based on keycode, trigger appropriate animation
    if (e.keyCode == '38') {
        animateDirection.up();
    }
    else if (e.keyCode == '40') {
        animateDirection.down();
    }
    else if (e.keyCode == '37') {
        animateDirection.left();
    }
    else if (e.keyCode == '39') {
        animateDirection.right();
    }
}

//on key down, call checkKey
document.onkeydown = checkKey;

//Rotate on Mouse Move

//store our previous mouse move; start value is at center
var lastMove = [window.innerWidth / 2, window.innerHeight / 2];

//callback function for mouse move event listener
function rotateOnMouseMove(e) {
    e = e || window.event;

    //calculate difference between current and last mouse position
    const moveX = (e.clientX - lastMove[0]);
    const moveY = (e.clientY - lastMove[1]);

    //rotate the globe based on distance of mouse moves (x and y)
    miniUniverse.rotation.y += (moveX * .005);
    miniUniverse.rotation.x += (moveY * .005);

    //store new position in lastMove
    lastMove[0] = e.clientX;
    lastMove[1] = e.clientY;
}

//on mousemove, call rotateOnMouseMove
document.addEventListener('mousemove', rotateOnMouseMove);