class Player {
    constructor(color, positionX, movekeys) {
      this.lifes = 3;
      this.wasDamaged = true;
      this.movekeys = movekeys;
      this.speed = 0.175;
      this.directionY = 0; // Nova variável para direção Y
      this.dimensions = {x: 0.05, y: 2.5, z: 0.15};
      const geometry = new THREE.BoxGeometry(this.dimensions.x, this.dimensions.y, this.dimensions.z);
      const material = new THREE.MeshStandardMaterial({ color: color });
      this.mesh = new THREE.Mesh(geometry, material);
      this.mesh.position.x = positionX;
    }
  
    addToScene(scene) {
      scene.add(this.mesh);
    }

    move(keysPressed) {
        switch(true) {
            case keysPressed[this.movekeys.up]:
                if (this.mesh.position.y + this.dimensions.y/2 < 3.9) {
                    this.mesh.position.y += this.speed;
                    this.directionY = 1; // Movendo para cima
                }
                break;
            case keysPressed[this.movekeys.down]:
                if (this.mesh.position.y - this.dimensions.y/2 > -3.9) {
                    this.mesh.position.y -= this.speed;
                    this.directionY = -1; // Movendo para baixo
                }
                break;
            default:
                this.directionY = 0; // Parado
                break;
        }
    }
}

class Ball {
    constructor(color, directionX = () => Math.random() < 0.5 ? -1 : 1, directionY = () => Math.random() < 0.5 ? -1 : 1) {
        this.color = color;
        this.directionX = directionX();
        this.directionY = directionY();
        this.speed = 0.1;
        this.maxHits = 100;
        this.maxSpeed = 0.1 * Math.pow(1.1, this.maxHits);
        const geometry = new THREE.SphereGeometry(0.15, 8, 8);
        const material = new THREE.MeshStandardMaterial({ color: color });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(0, 0, 0); // Inicializa a posição da bola no centro
    }

    addToScene(scene) {
      scene.add(this.mesh);
    } 

    playerColision(player1, player2){
        // Colisão com player1
        if (this.mesh.position.x - 0.20 <= player1.mesh.position.x + player1.dimensions.x/2 &&
            this.mesh.position.x + 0.20 >= player1.mesh.position.x - player1.dimensions.x/2 &&
            this.mesh.position.y + 0.20 >= player1.mesh.position.y - player1.dimensions.y/2 &&
            this.mesh.position.y - 0.20 <= player1.mesh.position.y + player1.dimensions.y/2) {
            if (this.directionX < 0) {
                this.directionX *= -1;
                if (player1.directionY !== 0) {
                    this.directionY = player1.directionY;
                }
                if (this.speed < this.maxSpeed) {
                    this.speed *= 1.1;
                }
            }
        }

        // Colisão com player2
        if (this.mesh.position.x - 0.20 <= player2.mesh.position.x + player2.dimensions.x/2 &&
            this.mesh.position.x + 0.20 >= player2.mesh.position.x - player2.dimensions.x/2 &&
            this.mesh.position.y + 0.20 >= player2.mesh.position.y - player2.dimensions.y/2 &&
            this.mesh.position.y - 0.20 <= player2.mesh.position.y + player2.dimensions.y/2) {
            if (this.directionX > 0) {
                this.directionX *= -1;
                if (player2.directionY !== 0) {
                    this.directionY = player2.directionY;
                }
                if (this.speed < this.maxSpeed) {
                    this.speed *= 1.1;
                }
            }
        }

        // Colisão com as paredes superior e inferior
        if (this.mesh.position.y + 0.20 >= 4 || this.mesh.position.y - 0.20 <= -4) {
            this.directionY *= -1;
        }
    }

    reset(){
      if(this.mesh.position.x >= 9 || this.mesh.position.x <= -9){
        this.mesh.position.set(0,0,0)
        this.directionX = Math.random() < 0.5 ? -1 : 1
        this.directionY = Math.random() < 0.5 ? -1 : 1
        this.speed = 0.1
      }
    }

    damagePlayer(player1, player2){
        if(this.mesh.position.x >= 9){
            if(player1.lifes > 0){
                player1.lifes--;
                player1.wasDamaged = true;
            }
        }
        if(this.mesh.position.x <= -9){
            if(player2.lifes > 0){
                player2.lifes--;
                player2.wasDamaged = true;
            }
        }
    }

    move(player1, player2){
        this.mesh.rotation.x += 0.25;  // Roda no eixo X
        this.mesh.rotation.y += 0.25;  // Roda no eixo Y

        this.playerColision(player1, player2);

        this.mesh.position.x += this.directionX * this.speed;
        this.mesh.position.y += this.directionY * this.speed;

        this.damagePlayer(player1, player2);

        this.reset();
    }
}

class Camera {
    constructor(fov = 75, aspect = window.innerWidth / window.innerHeight, near = 0.1, far = 1000) {
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.camera.position.set(0, 0, 5); // Posição fixa
        this.camera.lookAt(0, 0, 0); // Olha para o centro
    }

    updateAspect() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }

    followBall(ball) {
        // Mantém a posição fixa e apenas olha para a bola
        this.camera.position.set(ball.mesh.position.x, 0, 5);
    }

    getCamera() {
        return this.camera;
    }
}

class  HudAndGameController {
    constructor(){
        this.pauseState = false;
        this.pauseKey = "p";
        this.gameMenuModal = new bootstrap.Modal('#gameMenuModal', {
            keyboard: false
        })
    }

    updateLifes(player1, player2){
        if(player1.wasDamaged){
            const player1Lifes = document.getElementById("player1Lifes")
            player1Lifes.innerHTML = "<p>Player1 Lifes:</p>";
            for(let i = 0; i < player1.lifes; i++){
                player1Lifes.innerHTML += "<i class='bi bi-heart-fill'></i>";
            }
            player1.wasDamaged = false;
        }

        if(player2.wasDamaged){
            const player2Lifes = document.getElementById("player2Lifes")
            player2Lifes.innerHTML = "<p>Player2 Lifes:</p>";
            for(let i = 0; i < player2.lifes; i++){
                player2Lifes.innerHTML += "<i class='bi bi-heart-fill'></i>";
            }
            player2.wasDamaged = false;
        }
    }

    updateGameOver(player1, player2) {
        const gameOver = document.getElementById("gameOver");
        const winnerText = document.getElementById("winnerText");
        
        if (player1.lifes <= 0) {
            winnerText.textContent = "Game Over Player2 Wins!";
            gameOver.style.visibility = "visible";
        }
        if (player2.lifes <= 0) {
            winnerText.textContent = "Game Over Player1 Wins!";
            gameOver.style.visibility = "visible";
        }

    }

    updatePauseState(keysToggled){
        switch(keysToggled[this.pauseKey]){
            case false:
                this.pauseState = true;
                this.gameMenuModal.show();
                break;
            case true:
                this.pauseState = false;
                this.gameMenuModal.hide();
                break;
        }
    }

    updateHudAndGame(player1, player2, keysPressed, keysToggled){
        this.updateLifes(player1, player2); 
        this.updatePauseState(keysToggled);
        this.updateGameOver(player1, player2);
    }
}

let white = 0xffffff;
let primaryColor = 0x212226;
let secondaryColor = 0xD7D7D9;

// Cena, câmera e renderizador
const scene = new THREE.Scene();
scene.background = new THREE.Color(primaryColor); // Fundo cinza

const camera = new Camera();
const cameraInstance = camera.getCamera();

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Luz ambiente (ilumina tudo suavemente)
const ambientLight = new THREE.AmbientLight(white, 0.3);
scene.add(ambientLight);

// Luz direcional (como uma lanterna)
const directionalLight1 = new THREE.DirectionalLight(0x00BFFF, 1);
directionalLight1.position.set(-7, 9, 5); // Posição da luz vindo de cima
scene.add(directionalLight1);

const directionalLight2 = new THREE.DirectionalLight(0xFF1493, 1);
directionalLight2.position.set(7, -9, 5); // Posição da luz vindo de cima
scene.add(directionalLight2);

// Criando o jogador
const player1 = new Player(secondaryColor, -7, {up: "w", down: "s"});
player1.addToScene(scene);

const player2 = new Player(secondaryColor, 7, {up: "ArrowUp", down: "ArrowDown"});
player2.addToScene(scene);

const ball = new Ball(secondaryColor);
ball.addToScene(scene);

// Criando o HUD Controller
const hudAndGameController = new HudAndGameController();

// Controle de teclas
const keysPressed = {};
const keysToggled = { p: false };

document.addEventListener("keydown", (event) => {
  keysPressed[event.key] = true;

  if (keysToggled.hasOwnProperty(event.key) && !event.repeat) {
    keysToggled[event.key] = !keysToggled[event.key];
    console.log(keysToggled);
  }
});

document.addEventListener("keyup", (event) => {
  keysPressed[event.key] = false;
});

// Animação
function animate() {
  requestAnimationFrame(animate);

  hudAndGameController.updateHudAndGame(player1, player2, keysPressed, keysToggled);
  
  if(player1.lifes > 0 && player2.lifes > 0 && !hudAndGameController.pauseState){
    player1.move(keysPressed);
    player2.move(keysPressed);
    ball.move(player1, player2);
    //camera.followBall(ball);
  }
  
  renderer.render(scene, cameraInstance);
}

animate();

// Adicionar listener para redimensionamento da janela
window.addEventListener('resize', () => {
    camera.updateAspect();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
