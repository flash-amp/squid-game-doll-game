const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

renderer.setClearColor( 0xCEFFB3 , 1 );

const light = new THREE.AmbientLight( 0xffffff ); 
scene.add( light )

// global variables
const start_position = 3
const end_position = -start_position
const TIME_LIMIT = 10
let gamestat = "loading"
let isDollNotLooking = true 

function createCube(size,positionX, rotY=0 , color = 0xe3b62e){
    const geometry = new THREE.BoxGeometry(size.w,size.h,size.d);
    const material = new THREE.MeshBasicMaterial( { color: color } );
    const cube = new THREE.Mesh( geometry, material );
    cube.position.x = positionX;
    cube.rotation.y= rotY;
    scene.add( cube );
    return cube;
}

camera.position.z = 5;

const loader = new THREE.GLTFLoader()

function delay(ms){
    return new Promise(resolve => setTimeout(resolve,ms));
}

class Doll{
    constructor(){
        loader.load("../models/scene.gltf", ( gltf ) => {
            scene.add( gltf.scene );
            gltf.scene.scale.set( .4,.4,.4);
            gltf.scene.position.set(0,-1,0);
            this.doll = gltf.scene;
        })
    }

    lookBackward(){
    gsap.to(this.doll.rotation, {y : -3.15 , duration:.45})
    setTimeout(()=> isDollNotLooking = true, 150)
    }

    lookForward(){
        gsap.to(this.doll.rotation, {y : 0 , duration:.45})
        setTimeout(()=> isDollNotLooking = false, 450)
    }

    async start(){
        this.lookForward()
        await delay((Math.random() * 1000)+ 1000)
        this.lookBackward()
        await delay((Math.random() * 750)+ 750)
        this.start()
    }

}

function createTrack(){
    createCube({w:start_position * 2 +.2 , h: 1.5, d:1}, 0 , 0, 0xe5a716).position.z = -1;
    createCube({w:0.2 , h: 1.5, d:1},start_position, -0.35);
    createCube({w:0.2 , h: 1.5, d:1},end_position, 0.35);
    
}
createTrack()

class Player{
    constructor(){
        const geometry = new THREE.SphereGeometry( 0.3, 32, 16 );
        const material = new THREE.MeshBasicMaterial( { color: 0x4b2461 } );
        const sphere = new THREE.Mesh( geometry, material );
        sphere.position.z=1;
        sphere.position.x = start_position;
        scene.add( sphere );
        this.player = sphere
        this.playerInfo = {
            positionX :  start_position,
            velocity : 0
        }
    }

    run(){
        this.playerInfo.velocity = 0.03;
    }

    stop(){
        // this.playerInfo.velocity = 0;
        gsap.to(this.playerInfo, {velocity:0 ,duration : 0.1})
    }

    check(){
        if(this.playerInfo.velocity > 0 && !isDollNotLooking){
            text.innerText = "You Lose!!"
            gamestat = "Over"
        }
        if(this.playerInfo.positionX < end_position + 0.45){
            text.innerText = "You Win!!"
            gamestat = "Over"
        }
    }

    update(){
        this.check()
        this.playerInfo.positionX -= this.playerInfo.velocity;
        this.player.position.x = this.playerInfo.positionX;
    }
}
const player = new Player();
let doll = new Doll();

let text = document.querySelector(".text")

async function init(){
    await delay(500)
    text.innerText = "Starting in 3.."
    await delay(750)
    text.innerText = "Starting in 2.."
    await delay(750)
    text.innerText = "Starting in 1.."
    await delay(500)
    text.innerText = "GO.....!"
    startgame()
}

function startgame(){
    gamestat = "started"
    let progressbar = createCube({w: 5, h: .1, d: 1},0)
    progressbar.position.y = 3.35
    gsap.to(progressbar.scale, {x: 0 , duration: TIME_LIMIT, ease: "none"});
    doll.start()
    setTimeout(()=>{
        if(gamestat != "Over"){
            text.innerText = "Time Up!!"
            gamestat = "Over"
        }
    },TIME_LIMIT * 1000)
}

init()


function animate() {
    if(gamestat == "Over") return
	renderer.render( scene, camera );
    requestAnimationFrame( animate );
    player.update();
}
animate();

const sound = document.getElementById("snd");

window.addEventListener('resize', onWindowResize,false);

function onWindowResize(){
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight)
}

window.addEventListener('keydown', (e)=>{
    if(gamestat != "started")   return
    if(e.key == " "){
            player.run()
    }
    else{
        player.stop()
    }
})

