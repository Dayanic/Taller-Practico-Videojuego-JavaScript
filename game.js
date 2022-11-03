/* Se generan variables principales con los objetos de mi página */
const canvas = document.querySelector('#game');
const game = canvas.getContext('2d');
const btnUp = document.querySelector('#up');
const btnDown = document.querySelector('#down');
const btnLeft = document.querySelector('#left');
const btnRight = document.querySelector('#right');
const btnReset = document.querySelector('#reset')
const spanLives = document.querySelector('#lives');
const spanTime = document.querySelector('#time');
const spanRecord = document.querySelector('#record');
const pResult = document.querySelector('#result');

let canvasSize;
let elementsSize;
let level = 0;
let lives = 3;
let timeStart;
let timePlayer;
let timeInterval;
let record = 0;

const playerPosition = {
    x: undefined,
    y: undefined,
};
const giftPosition = {
    x: undefined,
    y: undefined,
};
let enemiesPositions = [];

/* Se agrega evento a la carga principal de la ventana para iniciar el juego */
window.addEventListener('load', setCanvasSize);
window.addEventListener('resize', setCanvasSize);
window.addEventListener('keydown', moveByKeys);
btnUp.addEventListener('click', moveUp);
btnDown.addEventListener('click', moveDown);
btnLeft.addEventListener('click', moveLeft);
btnRight.addEventListener('click', moveRight);
btnReset.addEventListener('click', resetGame);

function fixNumber(n) {
    return Number(n.toFixed(2));
}

function setCanvasSize() {
    if (window.innerHeight > window.innerWidth) {
        canvasSize = window.innerWidth * 0.7;//Se indica esto para usar el 80% de la pantalla
    } else {
        canvasSize = window.innerHeight * 0.7;//Se indica esto para usar el 80% de la pantalla
    }
    
    canvasSize = Number(canvasSize.toFixed(0));

    canvas.setAttribute('width', canvasSize);//Este atributo borra todo de mi canvas, por lo que se debe volver a crear el mapa
    canvas.setAttribute('height', canvasSize);//Este atributo borra todo de mi canvas, por lo que se debe volver a crear el mapa

    elementsSize = canvasSize / 10; // Se indica sobre 10 porque el juego será de 10 por 10 (cuadrado).

    playerPosition.x = undefined;
    playerPosition.y = undefined;
    startGame();
}

function startGame() {
    game.font = elementsSize + 'px Verdana';
    game.textAlign = 'end';

    //Solución del profe con arreglos dimensionales
    //A través de este for se generan emojis para insertar dentro del canvas y se renderizan según la medida de la pantalla
    const map = maps[level];

    if (!map) {
        gameWin();
        return;
    }

    if (!timeStart) {
        timeStart = Date.now();
        timeInterval = setInterval(showTime, 100);
        showRecord();
        btnUp.hidden = false;
        btnDown.hidden = false;
        btnLeft.hidden = false;
        btnRight.hidden = false;
        btnReset.hidden = true;
    }

    const mapsRow = map.trim().split('\n');
    const mapCol = mapsRow.map(row => row.trim().split(''));

    showLives();

    enemiesPositions = [];
    game.clearRect(0,0,canvasSize,canvasSize);//Permite borrar el renderizado
    //Opción más optimizada para renderizar el mapa del juego (dado por el profesor)
    mapCol.forEach((row, rowI) => {
        row.forEach((col , colI)=> {
            const emoji = emojis[col];
            const posX = elementsSize * (colI + 1);
            const posY = elementsSize * (rowI + 1);

            if (col == 'O') {
                if (!playerPosition.x && !playerPosition.y) {
                    playerPosition.x = posX;
                    playerPosition.y = posY;
                }
            } else if (col == 'I') {
                giftPosition.x = posX;
                giftPosition.y = posY;
            } else if (col == 'X') {
                enemiesPositions.push({
                    x: posX,
                    y: posY,
                });
            }

            game.fillText(emoji, posX, posY);
        })
    });

    movePlayer();
    //Segunda opción para renderizar mapa dada por el profesor
    /*for (let row = 1; row <= 10; row++) {
        for (let col = 1; col <= 10; col++) {
            game.fillText(emojis[mapCol[row - 1][col - 1]], elementsSize * col, elementsSize * row);
        }
    }

    //Mi solución sin arreglos dimensionales
    let lastValue = '';
    const arrayMap = maps[0].split("");
    let row = 1;
    let col = 1;

    for (let a = 0; a < arrayMap.length; a++) {
        if (arrayMap[a].trim()) {
            lastValue = arrayMap[a];
            game.fillText(emojis[arrayMap[a]], elementsSize * col, elementsSize * row);
            col++;
        } else if (lastValue != arrayMap[a].trim() && col != 1) {
            col = 1;
            row++;
        }
    }

    /*game.fillRect(0, 0, 100, 100);//Nos permite crear un cuadrado o rectagunlo de color negro dentro de la página web.
    game.clearRect(50, 50, 50, 50);//Nos permite borrar de lo que tengamos en canvas desde una posición especifica.
    game.font = '25px Verdana';//Propiedades que se le pueden dar al texto agregado con fillText tal como se usa en css
    game.fillStyle = 'purple';//Propiedades que se le pueden dar al texto agregado con fillText tal como se usa en css
    game.textAlign = 'center';//Esta alineación permite mover el texto solo dentro del lugar donde se indico que estaría (25, 25)
    game.fillText('Platzi', 25, 25);//Permite agregar texto dentro del canvas*/
}

function movePlayer() {
    const giftColisionX = playerPosition.x.toFixed(3) == giftPosition.x.toFixed(3);
    const giftColisionY = playerPosition.y.toFixed(3) == giftPosition.y.toFixed(3);
    const giftColision = giftColisionX && giftColisionY;

    if (giftColision)
    {
        levelWin();
    }

    const enemyColision = enemiesPositions.find(enemy => {
        const enemyCollisionX = enemy.x.toFixed(3) == playerPosition.x.toFixed(3)
        const enemyCollisionY = enemy.y.toFixed(3) == playerPosition.y.toFixed(3)
        return enemyCollisionX && enemyCollisionY;
    } )

    if (enemyColision) {
        collision();
        setTimeout(levelFail,100);
    }

    game.fillText(emojis['PLAYER'], playerPosition.x, playerPosition.y);
}

function collision() {
    game.fillText(emojis['BOMB_COLLISION'], playerPosition.x, playerPosition.y);
}

function levelWin() {
    console.log('Subiste de nivel');
    level++;

    startGame();
}

function gameWin() {
    clearInterval(timeInterval);
    const recordTime = localStorage.getItem('record');

    if(recordTime) {
        game.clearRect(0,0,canvasSize,canvasSize);
        if (parseInt(localStorage.getItem('record')) > record)
        {
            localStorage.setItem('record',record);
            pResult.innerHTML = 'Superaste el record';
            game.fillText(emojis['WIN'], canvasSize/2, canvasSize/2);
        } else {
            pResult.innerHTML = 'Record no superado';
            game.fillText(emojis['GAME_OVER'], canvasSize/2, canvasSize/2);
        }
    } else
    {
        pResult.innerHTML = 'Primer record';
        localStorage.setItem('record',record);
        game.clearRect(0,0,canvasSize,canvasSize);
        game.fillText(emojis['WIN'], canvasSize/2, canvasSize/2);
    }

    btnUp.hidden = true;
    btnDown.hidden = true;
    btnLeft.hidden = true;
    btnRight.hidden = true;
    btnReset.hidden = false;
}

function resetGame() {
    level = 0;
    lives = 3;
    timeStart = undefined;
    playerPosition.x = undefined;
    playerPosition.y = undefined;
    pResult.innerText = "";
    endGame = false;
    startGame();
}

function levelFail() {
    lives--;

    if (lives <= 0) {
        level = 0;
        lives = 3;
        timeStart = undefined;
    }

    playerPosition.x = undefined;
    playerPosition.y = undefined;
    startGame();
}

function showLives() {
    const heartsArray = Array(lives).fill(emojis['HEART']);

    spanLives.innerHTML = "";
    // heartsArray.forEach(heart => spanLives.append(heart));//Solución del profe
    for (heart of heartsArray) spanLives.innerHTML += heart;//Mi solución
    // spanLives.innerHTML = emojis["HEART"].repeat(lives);//Aporte de un compañero buenisima solución
}

function showTime() {
    spanTime.innerHTML = Date.now() - timeStart;
    record = spanTime.innerText;
}

function showRecord() {
    spanRecord.innerHTML = localStorage.getItem('record');
}

function moveUp() {
    if (fixNumber((playerPosition.y - elementsSize)) < elementsSize) {
        console.log('OUT');
    } else {
        playerPosition.y -= elementsSize;
        startGame();
    }
}

function moveDown() {
    if (fixNumber((playerPosition.y + elementsSize)) > canvasSize) {
        console.log('OUT');
    } else {
        playerPosition.y += elementsSize;
        startGame();
    }
}

function moveRight() {
    if (fixNumber((playerPosition.x + elementsSize)) > canvasSize) {
        console.log('OUT');
    } else {
        playerPosition.x += elementsSize;
        startGame();
    }
}

function moveLeft() {
    if (fixNumber((playerPosition.x - elementsSize)) < elementsSize) {
        console.log('OUT');
    } else {
        playerPosition.x -= elementsSize;
        startGame();
    }
}

function moveByKeys(event) {
    if (event.key == 'ArrowUp') moveUp();
    else if (event.key == 'ArrowDown') moveDown();
    else if (event.key == 'ArrowRight') moveRight();
    else if (event.key == 'ArrowLeft') moveLeft();
}