const canvas = document.querySelector('#game');
const game = canvas.getContext('2d');
const btnUp = document.querySelector('#up');
const btnLeft = document.querySelector('#left');
const btnRight = document.querySelector('#right');
const btnDown = document.querySelector('#down');
const spanLives = document.querySelector('#lives');
const spanTime = document.querySelector('#time');
const spanRecord = document.querySelector('#record');
const pResult = document.querySelector('#result');
const reset_button = document.querySelector('#reset_button');

const playerPosition = {
    x: undefined,
    y: undefined,
}
const bookPosition = {
    x: undefined,
    y: undefined,
}

let enemiesPositions = [];
let canvasSize;
let elementsSize;
let level = 0;
let lives = 3;
let timeStart;
let timePlayer;
let timeInterval;

window.addEventListener('load',setCanvasSize);
window.addEventListener('resize',setCanvasSize);

function setCanvasSize(){
    windowHeight = window.innerHeight * 0.8;
    windowWidth = window.innerWidth * 0.8;
    //Dependiendo del tamaño de la pantalla, va a colocar el tamaño cuadrado del canvas
    //Al dividir entre 10 y luego aproximar el valor a un entero garantiza que el canvas será un entero múltiplo de 10. Finalmente se multiplica la expresión por 10 para obtener el dato real del canvas
    //Con Math.ceil nos ahorramos el problema de los decimales
    if (window.innerHeight > window.innerWidth) {
        if ((windowWidth % 10) !== 0) {
             canvasSize = Math.ceil(windowWidth / 10) * 10;
        } else {
             canvasSize = windowWidth;
        }} 
    else {
        if ((windowHeight % 10) !== 0) {
             canvasSize = Math.ceil(windowHeight / 10) * 10;
        } else {
             canvasSize = windowHeight;
        }
    }

     canvas.setAttribute('width', canvasSize);
     canvas.setAttribute('height', canvasSize);
     elementsSize = (canvasSize / 10);
    startGame();
}

//refactor del mapa del juego
function startGame(){
    console.log({ canvasSize, elementsSize});

    game.font = elementsSize + 'px Segoe UI';
    game.textAlign = 'end';
    game.textBaseline = 'bottom';   

    const map = maps[level];
    if(!map){
        gameWin();
        return;
    }

    if(!timeStart){
        timeStart = Date.now();
        timeInterval = setInterval(showtime,100);
        showRecord();
    }
    const mapRows=map.trim().split('\n');
    const mapRowCols=mapRows.map(row=>row.trim().split(''));

    showLives();

    enemiesPositions = [];
    game.clearRect(0,0,canvasSize, canvasSize);

    mapRowCols.forEach((row, rowI) => {
        row.forEach((col, colI) => {
           const emoji = emojis[col];
           const posX = elementsSize * (colI + 1);
           const posY = elementsSize * (rowI + 1);
           game.fillText(emoji, posX, posY);

           if(col == 'O'){
            if(!playerPosition.x && !playerPosition.y){
                playerPosition.x = posX;
                playerPosition.y = posY;
            }
           } else if (col == 'I') {
            bookPosition.x = posX;
            bookPosition.y = posY;
           } else if (col == 'X'){
            enemiesPositions.push({
                x: posX,
                y: posY,
            });
           }

           game.fillText(emoji,posX,posY);
        });
    });   

    movePlayer();
}

function movePlayer(){
    const bookCollisionX = playerPosition.x.toFixed(2) == bookPosition.x.toFixed(2);
    const bookCollisionY = playerPosition.y.toFixed(2) == bookPosition.y.toFixed(2);
    const bookCollision = bookCollisionX && bookCollisionY;
    if (bookCollision){
        levelWin();
    }

    const enemiesCollision = enemiesPositions.find(enemy =>{
        const enemiesCollisionX = enemy.x.toFixed(2) == playerPosition.x.toFixed(2);
        const enemiesCollisionY = enemy.y.toFixed(2) == playerPosition.y.toFixed(2);
        return enemiesCollisionX && enemiesCollisionY;

    });
    if (enemiesCollision){
        levelFail();
    }

    game.fillText(emojis['PLAYER'], playerPosition.x,playerPosition.y);
}

function levelWin(){
    console.log('NEXT LEVEL');
    level++;
    startGame();
}

function gameWin(){
    console.log("WINNER");
    clearInterval(timeInterval);

    const recordTime = localStorage.getItem('record_time');
    const playerTime = Date.now() - timeStart;
    if(recordTime){
        if(recordTime >= playerTime){
            localStorage.setItem('record_time',playerTime);
            pResult.innerHTML = 'Felicidades, superaste el record';
        } else {
            pResult.innerHTML = 'No superaste el record';
        }
    } else {
        localStorage.setItem('record_time', playerTime);
    }
    console.log({recordTime,playerTime});
}

function showLives(){
    const hearstArray = Array(lives).fill(emojis['HEART']) //[1,2,3]

    spanLives.innerHTML = "";
    hearstArray.forEach(heart => spanLives.append(heart));
}

function showtime(){
    spanTime.innerHTML = formatTime(Date.now() - timeStart);
}

function showRecord(){
    spanRecord.innerHTML = formatTime(localStorage.getItem('record_time'));
}

function formatTime(ms){
    const cs = parseInt(ms/10) % 100
    const seg = parseInt(ms/1000) % 60
    const min = parseInt(ms/60000) % 60
    const csStr = `${cs}`.padStart(2,"0")
    const segStr = `${seg}`.padStart(2,"0")
    const minStr = `${min}`.padStart(2,"0")
    return`${minStr}:${segStr}:${csStr}`
}

function levelFail(){
    console.log('CRASH');
    lives--;

    
    if (lives <= 0){
        level = 0;
        lives = 3;
        timeStart = undefined;
    }
    playerPosition.x = undefined;
    playerPosition.y = undefined;
    startGame();
    
}

function resetGame(){
    location.reload();
}

window.addEventListener('keydown', moveByKeys);
btnUp.addEventListener('click', moveUp);
btnRight.addEventListener('click', moveRight);
btnLeft.addEventListener('click', moveLeft);
btnDown.addEventListener('click', moveDown);
reset_button.addEventListener('click',resetGame);

function moveByKeys(event){
    if (event.key == 'w') moveUp(); 
    else if (event.key == 'a') moveLeft(); 
    else if (event.key == 'd') moveRight(); 
    else if (event.key == 's') moveDown(); 
}

function moveUp(){
    if((playerPosition.y - elementsSize) < elementsSize){
        console.log('OUT OF THE MAP');
    }else{
      playerPosition.y -= elementsSize;
    startGame();  
    }
}

function moveRight(){
    if((playerPosition.x + elementsSize) > canvasSize){
        console.log('OUT OF THE MAP');
    }else{
      playerPosition.x += elementsSize;
    startGame();  
    }
}

function moveLeft(){
    if((playerPosition.x - elementsSize) < elementsSize){
        console.log('OUT OF THE MAP');
    }else{
      playerPosition.x -= elementsSize;
    startGame();  
    }
}

function moveDown(){
    if((playerPosition.y + elementsSize) > canvasSize){
        console.log('OUT OF THE MAP');
    }else{
        playerPosition.y += elementsSize;
        startGame();
    }
}