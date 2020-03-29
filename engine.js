
var view = new View(document.getElementById("canvas"));
var g = view.gContext; // Fetch Context2D from View class

var requestAnimationFrame = window.requestAnimationFrame ||
                          window.mozRequestAnimationFrame ||
                          window.msRequestAnimationFrame ||
                          window.oRequestAnimationFrame ||
                          window.webkitRequestAnimationFrame;

var w, a, s, d, r = false;
var upArrow, leftArrow, downArrow, rightArrow = false;

// Handle keyboard events
document.onkeydown = function (event) {
    event = event || window.event;
    //console.log(event.code);
    if (event.code === 'KeyW' && !w) {
        w = true;
    }
    if (event.code === 'KeyA' && !a) {
        a = true;
    }
    if (event.code === 'KeyS' && !s) {
        s = true;
    }
    if (event.code === 'KeyD' && !d) {
        d = true;
    }
    if (event.code === 'KeyR' && !r) {
        r = true;
    }
    if (event.code === 'ArrowUp' && !upArrow) {
        upArrow = true;
    }
    if (event.code === 'ArrowLeft' && !leftArrow) {
        leftArrow = true;
    }
    if (event.code === 'ArrowDown' && !downArrow) {
        downArrow = true;
    }
    if (event.code === 'ArrowRight' && !rightArrow) {
        rightArrow = true;
    }
};

document.onkeyup = function(event) {
    event = event || window.event;
    if (event.code === 'KeyW')
        w = false;
    if (event.code === 'KeyA')
        a = false;
    if (event.code === 'KeyS')
        s = false;
    if (event.code === 'KeyD')
        d = false;
    if (event.code === 'KeyR')
        r = false;
    if (event.code === 'ArrowUp')
        upArrow = false;
    if (event.code === 'ArrowLeft')
        leftArrow = false;
    if (event.code === 'ArrowDown')
        downArrow = false;
    if (event.code === 'ArrowRight')
        rightArrow = false;
};

// Handle mouse events
document.onmousedown = function(event) {
    event = event || window.event;
    view.mouse.pressed = true;
}

document.onmouseup = function(event) {
    event = event || window.event;
    view.mouse.pressed = false;
}

document.onmousemove = function(event) {
    event = event || window.event;
    view.mouse.x = event.clientX;
    view.mouse.y = event.clientY;
};

function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function() {
        this.sound.play();
    }
    this.stop = function() {
        this.sound.pause();
    }
}
var damage = new sound("Sounds/heavyplasma2.wav");
var death = new sound("Sounds/heavyplasmahit2.wav");
var graveyard = new sound("Sounds/NEFFEXGraveyardByKaraokeLovers.mp3");

function msToTime(s) {
	// Pad to 2 or 3 digits, default is 2
	function pad(n, z) {
		z = z || 2;
		return ('00' + n).slice(-z);
	}

	var ms = s % 1000;
	s = (s - ms) / 1000;
	var secs = s % 60;
	s = (s - secs) / 60;
	var mins = s % 60;
	var hrs = (s - mins) / 60;

	return pad(hrs) + ':' + pad(mins) + ':' + pad(secs)
}

// Create a holder for game object arrays
var gameObjects;

// Initialize player
var player;
var playerAnimation = {timer: 0, phase: 1};

var collisionGroups = [
    {array: 'enemies', ignore: ['enemyProjectiles', 'player', 'weaponPickups']},
    {array: 'enemyProjectiles', ignore: ['enemies', 'weaponPickups']},
    {array: 'player', ignore: ['playerProjectiles', 'enemies']},
    {array: 'playerProjectiles', ignore: ['player', 'weaponPickups']},
    {array: 'weaponPickups', ignore: ['enemies', 'enemyProjectiles', 'playerProjectiles']}
];

// Create an array for storing active particle effects
var particles = [];

// Create an array for storing health bar effects
var healthBarEffects = [];

// Health bar position variables
var healthBarTop = 20;
var healthBarBottom = 50;
var healthBarMiddle = 35; // Spawning height of effects

// Initialize background elements
var doodad1 = new Sprite('Tombstone1.png', undefined);
var doodad2 = new Sprite('Tombstone2.png', undefined);
var doodad3 = new Sprite('Cross1.png', undefined);
var doodad4 = new Sprite('Cross2.png', undefined);
var doodad5 = new Sprite('DeadGrass.png', undefined);
var doodad6 = new Sprite('Bush.png', undefined);
var tileAll1 = new Sprite('tileAll1.png', undefined);
var tileAll2 = new Sprite('tileAll2.png', undefined);
var tileAll3 = new Sprite('tileAll3.png', undefined);
var tileHor1 = new Sprite('tileHor1.png', undefined);
var tileHor2 = new Sprite('tileHor2.png', undefined);
var tileHor3 = new Sprite('tileHor3.png', undefined);
var tileVer1 = new Sprite('tileVer1.png', undefined);
var tileVer2 = new Sprite('tileVer2.png', undefined);
var tileVer3 = new Sprite('tileVer3.png', undefined);
var buttonW = new Sprite('W.png', undefined);
var buttonA = new Sprite('A.png', undefined);
var buttonS = new Sprite('S.png', undefined);
var buttonD = new Sprite('D.png', undefined);
var buttonMouse = new Sprite('Mouse.png', undefined);
var titleImage = new Sprite('TitleImageEdited.png', undefined);
var titleImagePosition = {x: -35, y: -200};

// Create a grid for storing active background elements
var doodadInterval = 70;
var screenSize = Math.max(view.width, view.height);
var doodadGridSize = Math.ceil(screenSize * 1.2 / doodadInterval);
if (doodadGridSize % 2 == 0) { doodadGridSize++; }
var doodadGridCrossroad; // Where tile paths appear
var totalShifts; // Where we are in relation to (0,0)
var doodadGrid = new Array(doodadGridSize);
for (var i = 0; i < doodadGridSize; i++) {
    doodadGrid[i] = new Array(doodadGridSize);
}

// Populate doodadGrid with background elements at (0,0)
function initializeDoodads() {
    for (var y = 0; y < doodadGridSize; y++) {
        for (var x = 0; x < doodadGridSize; x++) {
            let noise = simplexNoise(((Math.floor(player.phys.pos.x / doodadInterval) + x) * doodadInterval),
                                    ((Math.floor(player.phys.pos.y / doodadInterval) + y) * doodadInterval));
            if (y == doodadGridCrossroad.y && x == doodadGridCrossroad.x) {
                doodadGrid[y][x] = tileMiddle(noise);
            } else if (y == doodadGridCrossroad.y) {
                doodadGrid[y][x] = tileHorizontal(noise);
            } else if (x == doodadGridCrossroad.x) {
                doodadGrid[y][x] = tileVertical(noise);
            } else {
                doodadGrid[y][x] = randomDoodad(noise);
            }
        }
    }
}

// Functions for calculating random backround elements
function tileMiddle(noise) {
    if (Math.abs(noise) > 0.5) { return tileAll1; }
    else if (Math.abs(noise) > 0.35) { return tileAll2; }
    else if (Math.abs(noise) > 0.1) { return tileAll3; }
    else { return; }
}

function tileHorizontal(noise) {
    if (noise > 0.6) { return tileAll1; }
    else if (noise > 0.35) { return tileAll2; }
    else if (noise > 0.1) { return tileAll3; }
    else if (noise < -0.6) { return tileHor1; }
    else if (noise < -0.3) { return tileHor2; }
    else if (noise < -0.1) { return tileHor3; }
    else { return; }
}

function tileVertical(noise) {
    if (noise > 0.55) { return tileAll1; }
    else if (noise > 0.4) { return tileAll2; }
    else if (noise > 0.1) { return tileAll3; }
    else if (noise < -0.6) { return tileVer1; }
    else if (noise < -0.3) { return tileVer2; }
    else if (noise < -0.1) { return tileVer3; }
    else { return; }
}

function randomDoodad(noise) {
    if (noise > 0.85) { return doodad1; }
    else if (noise > 0.7) { return doodad2; }
    else if (noise > 0.55) { return doodad3; }
    else if (noise > 0.4) { return doodad5; }
    else { return; }
}

// Define a border around player character for unloading and loading background elements
var loadZoneLeft, loadZoneRight, loadZoneUp, loadZoneDown;
function initializeLoadZones() {
    loadZoneLeft = Math.floor(player.phys.pos.x / doodadInterval) * doodadInterval;
    loadZoneRight = (Math.floor(player.phys.pos.x / doodadInterval) + 1) * doodadInterval;
    loadZoneUp = Math.floor(player.phys.pos.y / doodadInterval) * doodadInterval;
    loadZoneDown = (Math.floor(player.phys.pos.y / doodadInterval) + 1) * doodadInterval;
}

// Fps counter variables
var fps = 0;
var timestamps = [];

// Text that is updated and shown when player dies
var gameOverText = "";

// Initialize game state and play time
var gameState = null; // 0 = title, 1 = game, 2 = failure state
var startTime = NaN;
var finishTime = NaN;

function stateTransition(toState) {
    if (toState == 0) {
        graveyard.stop();
        startTime = NaN;
        finishTime = NaN;
        gameObjects = {
            enemies: [],
            projectiles: [],
            enemyProjectiles: [],
            player: [],
            playerProjectiles: [],
            weaponPickups: []
        };
        gameObjects.player.push(new Monster("Player_Idle1.png", 100, '#00FFFF'));
        player = gameObjects.player[0];
        player.health.onHit = () => {
            player.sprite.changeImage("Player_Hit.png");
            playerAnimation.phase = 3;
            playerAnimation.timer = -5;
        };
        player.weapon = [weapons.starter()];
        doodadGridCrossroad = {x: Math.floor(doodadGridSize / 2), y: Math.floor(doodadGridSize / 2)};
        totalShifts = {x: 0, y: 0};
        initializeDoodads();
        initializeLoadZones();
    } else if (toState == 1) {
        startTime = Date.now();
        graveyard.play();
    } else if (toState == 2) {
        // Save finish time and make all monsters wander away
        finishTime = Date.now() - startTime;
        for (var i = 0; i < gameObjects.enemies.length; i++) {
            let mon = gameObjects.enemies[i];
            mon.behavior.modes.idle = 1.0;
            mon.behavior.modes.curious = -1.0
            mon.behavior.modes.angry = -1.0;
            mon.weapon.rate = 999999999;
        }
		// Show playtime to player
		gameOverText = "Your Limbo Life lasted " + msToTime(finishTime);
    } else {
        throw "Unknown gameState " + toState;
    }
    gameState = toState;
}

// Enter title screen
stateTransition(0);

// ***
// Main gameplay loop, called every frame
// ***
function draw() {
    // Update view size in case window dimensions change
    view.updateSize();

    // Current time
    var time = Date.now();

    // Player status
    var up = w || upArrow;
    var left = a || leftArrow;
    var down = s || downArrow;
    var right = d || rightArrow;

    // Friction variables
    var movedUp = false;
    var movedLeft = false;
    var movedDown = false;
    var movedRight = false;

    // Movement handling
    if (!(up && left && down && right)) {
        if (up && right && down) {
            up = false;
            down = false;
        }
        if (right && down && left) {
            right = false;
            left = false;
        }
        if (down && left && up) {
            down = false;
            up = false;
        }
        if (left && up && right) {
            left = false;
            right = false;
        }
        if (up && right) {
            player.phys.speed.y = player.phys.speed.y > -7.7 ? Math.max(player.phys.speed.y - 0.385, -7.7) : Math.min(player.phys.speed.y + 0.15, -7.7);
            player.phys.speed.x = player.phys.speed.x < 7.7 ? Math.min(player.phys.speed.x + 0.385, 7.7) : Math.max(player.phys.speed.x - 0.15, 7.7);
            movedUp = true;
            movedRight = true;
        } else if (right && down) {
            player.phys.speed.x = player.phys.speed.x < 7.7 ? Math.min(player.phys.speed.x + 0.385, 7.7) : Math.max(player.phys.speed.x - 0.15, 7.7);
            player.phys.speed.y = player.phys.speed.y < 7.7 ? Math.min(player.phys.speed.y + 0.385, 7.7) : Math.max(player.phys.speed.y - 0.15, 7.7);
            movedRight = true;
            movedDown = true;
        } else if (down && left) {
            player.phys.speed.y = player.phys.speed.y < 7.7 ? Math.min(player.phys.speed.y + 0.385, 7.7) : Math.max(player.phys.speed.y - 0.15, 7.7);
            player.phys.speed.x = player.phys.speed.x > -7.7 ? Math.max(player.phys.speed.x - 0.385, -7.7) : Math.min(player.phys.speed.x + 0.15, -7.7);
            movedDown = true;
            movedLeft = true;
        } else if (left && up) {
            player.phys.speed.x = player.phys.speed.x > -7.7 ? Math.max(player.phys.speed.x - 0.385, -7.7) : Math.min(player.phys.speed.x + 0.15, -7.7);
            player.phys.speed.y = player.phys.speed.y > -7.7 ? Math.max(player.phys.speed.y - 0.385, -7.7) : Math.min(player.phys.speed.y + 0.15, -7.7);
            movedLeft = true;
            movedUp = true;
        } else {
            if (up) {
                player.phys.speed.y = Math.max(player.phys.speed.y - 0.5, -10);
                movedUp = true;
            }
            if (left) {
                player.phys.speed.x = Math.max(player.phys.speed.x - 0.5, -10);
                movedLeft = true;
            }
            if (down) {
                player.phys.speed.y = Math.min(player.phys.speed.y + 0.5, 10);
                movedDown = true;
            }
            if (right) {
                player.phys.speed.x = Math.min(player.phys.speed.x + 0.5, 10);
                movedRight = true;
            }
        }
    }

    // Apply friction
    if (!movedUp) {
        if (player.phys.speed.y < 0) {
            player.phys.speed.y = Math.min(player.phys.speed.y + 0.15, 0);
        }
    }
    if (!movedLeft) {
        if (player.phys.speed.x < 0) {
            player.phys.speed.x = Math.min(player.phys.speed.x + 0.15, 0);
        }
    }
    if (!movedDown) {
        if (player.phys.speed.y > 0) {
            player.phys.speed.y = Math.max(player.phys.speed.y - 0.15, 0);
        }
    }
    if (!movedRight) {
        if (player.phys.speed.x > 0) {
            player.phys.speed.x = Math.max(player.phys.speed.x - 0.15, 0);
        }
    }

    // Follow player's position with view
    //if (gameState != 0) {
        view.x = player.phys.pos.x - view.width / 2;
        view.y = player.phys.pos.y - view.height / 2;
    //}

    // Unload and load background elements if necessary
    //if (gameState != 0) {
        if (player.phys.pos.y < loadZoneUp) {
            let loadArray = new Array(doodadGridSize);
            for (var x = 0; x < doodadGridSize; x++) {
                let noise = simplexNoise(((Math.floor(player.phys.pos.x / doodadInterval) + x) * doodadInterval),
                                        (Math.floor(player.phys.pos.y / doodadInterval) * doodadInterval));
                if (doodadGridCrossroad.y /*% doodadGridSize*/ == doodadGridSize - 1) {
                    loadArray[x] = doodadGridCrossroad.x == x ? tileMiddle(noise) : tileHorizontal(noise);
                } else {
                    loadArray[x] = doodadGridCrossroad.x == x ? tileVertical(noise) : randomDoodad(noise);
                }
            }
            doodadGrid.pop();
            doodadGrid.unshift(loadArray);
            loadZoneUp -= doodadInterval;
            loadZoneDown -= doodadInterval;
            // Keep track of tile path position
            doodadGridCrossroad.y++;
            totalShifts.y--;
            if (doodadGridCrossroad.y == doodadGridSize) {
                doodadGridCrossroad.y = 0;
            }
            //console.log("Shifting load zone up. New loadZoneUp: ", loadZoneUp);
        } else if (player.phys.pos.y > loadZoneDown) {
            let loadArray = new Array(doodadGridSize);
            for (var x = 0; x < doodadGridSize; x++) {
                let noise = simplexNoise(((Math.floor(player.phys.pos.x / doodadInterval) + x) * doodadInterval),
                                        ((Math.floor(player.phys.pos.y / doodadInterval) + (doodadGridSize - 1)) * doodadInterval));
                if (doodadGridCrossroad.y /*% doodadGridSize*/ == 0) {
                    loadArray[x] = doodadGridCrossroad.x == x ? tileMiddle(noise) : tileHorizontal(noise);
                } else {
                    loadArray[x] = doodadGridCrossroad.x == x ? tileVertical(noise) : randomDoodad(noise);
                }
            }
            doodadGrid.shift();
            doodadGrid.push(loadArray);
            loadZoneUp += doodadInterval;
            loadZoneDown += doodadInterval;
            // Keep track of tile path position
            doodadGridCrossroad.y--;
            totalShifts.y++;
            if (doodadGridCrossroad.y == -1) {
                doodadGridCrossroad.y = doodadGridSize - 1;
            }
            //console.log("Shifting load zone down. New loadZoneDown: ", loadZoneDown);
        }
        if (player.phys.pos.x < loadZoneLeft) {
            for (var y = 0; y < doodadGridSize; y++) {
                let noise = simplexNoise((Math.floor(player.phys.pos.x / doodadInterval) * doodadInterval),
                                        ((Math.floor(player.phys.pos.y / doodadInterval) + y) * doodadInterval));
                doodadGrid[y].pop();
                if (doodadGridCrossroad.x /*% doodadGridSize*/ == doodadGridSize - 1) {
                    let tile = doodadGridCrossroad.y == y ? tileMiddle(noise) : tileVertical(noise);
                    doodadGrid[y].unshift(tile);
                } else {
                    let tile = doodadGridCrossroad.y == y ? tileHorizontal(noise) : randomDoodad(noise);
                    doodadGrid[y].unshift(tile);
                }
            }
            loadZoneLeft -= doodadInterval;
            loadZoneRight -= doodadInterval;
            // Keep track of tile path position
            doodadGridCrossroad.x++;
            totalShifts.x--;
            if (doodadGridCrossroad.x == doodadGridSize) {
                doodadGridCrossroad.x = 0;
            }
            //console.log("Shifting load zone left. New loadZoneLeft: ", loadZoneLeft);
        } else if (player.phys.pos.x > loadZoneRight) {
            for (var y = 0; y < doodadGridSize; y++) {
                let noise = simplexNoise(((Math.floor(player.phys.pos.x / doodadInterval) + (doodadGridSize - 1)) * doodadInterval),
                                        ((Math.floor(player.phys.pos.y / doodadInterval) + y) * doodadInterval));
                doodadGrid[y].shift();
                if (doodadGridCrossroad.x /*% doodadGridSize*/ == 0) {
                    let tile = doodadGridCrossroad.y == y ? tileMiddle(noise) : tileVertical(noise);
                    doodadGrid[y].push(tile);
                } else {
                    let tile = doodadGridCrossroad.y == y ? tileHorizontal(noise) : randomDoodad(noise);
                    doodadGrid[y].push(tile);
                }
            }
            loadZoneLeft += doodadInterval;
            loadZoneRight += doodadInterval;
            // Keep track of tile path position
            doodadGridCrossroad.x--;
            totalShifts.x++;
            if (doodadGridCrossroad.x == -1) {
                doodadGridCrossroad.x = doodadGridSize - 1;
            }
            //console.log("Shifting load zone right. New loadZoneRight: ", loadZoneRight);
        }
    //}

    // Create enemies if game is in progress
    if (gameState == 1) {
        let timePassed = (Date.now() - startTime) / 300000; // 5 minutes
        let enemyCount = gameObjects.enemies.length;
        if (Math.random() < 0.033 && enemyCount < timePassed * 50 + 1) {
            let seed = Math.random();
            let x, y, speedX, speedY = 0;
            if (seed < 0.25) {
                x = player.phys.pos.x - (view.width * 0.6) + (Math.random() * view.width * 1.2);
                y = player.phys.pos.y - (view.height * 0.6);
                speedX = -1 + (Math.random() * 2);
                speedY = Math.random();
            } else if (seed < 0.5) {
                x = player.phys.pos.x - (view.width * 0.6);
                y = player.phys.pos.y - (view.height * 0.6) + (Math.random() * view.height * 1.2);
                speedX = Math.random();
                speedY = -1 + (Math.random() * 2);
            } else if (seed < 0.75) {
                x = player.phys.pos.x - (view.width * 0.6) + (Math.random() * view.width * 1.2);
                y = player.phys.pos.y + (view.height * 0.6);
                speedX = -1 + (Math.random() * 2);
                speedY = -Math.random();
            } else {
                x = player.phys.pos.x + (view.width * 0.6);
                y = player.phys.pos.y - (view.height * 0.6) + (Math.random() * view.height * 1.2);
                speedX = -Math.random();
                speedY = -1 + (Math.random() * 2);
            }
            var mon = monsterHouse(timePassed * 2);
            mon.phys.pos = { x: x, y: y };

            if (timePassed < 0.07) {
                // makes monster passive for first 20 seconds in
                mon.behavior.mode = 'idle';
                mon.behavior.modes.idle = 1.0;
                mon.behavior.modes.curious = 0.3;
                mon.behavior.modes.angry = -1.0;
                mon.moveSpeed = Math.random() * 0.5 + 0.1;
            }
            gameObjects.enemies.push(mon);
        }
    }

    // Destroy enemies if they wander too far
    for (let i = 0; i < gameObjects.enemies.length; i++) {
        let enemy = gameObjects.enemies[i];
        if (enemy.phys.pos.x < player.phys.pos.x - view.width ||
            enemy.phys.pos.x > player.phys.pos.x + view.width ||
            enemy.phys.pos.y < player.phys.pos.y - view.height ||
            enemy.phys.pos.y > player.phys.pos.y + view.height) {
                gameObjects.enemies.splice(i--, 1);
        }
    }

    // Draw the background
    view.drawBackground('rgb(29, 7, 38)');

    // Draw background elements
    //var backgroundAnchorX = gameState == 0 ? 0 : player.phys.pos.x;
    //var backgroundAnchorY = gameState == 0 ? 0 : player.phys.pos.y;
    var backgroundAnchorX = player.phys.pos.x;
    var backgroundAnchorY = player.phys.pos.y;
    // Draw controls
    var middleGrid = Math.floor(doodadGridSize / 2);
    if (middleGrid + 2 - totalShifts.y >= 0 && middleGrid + 2 - totalShifts.y < doodadGridSize && middleGrid - 3 - totalShifts.x >= 0 && middleGrid - 3 - totalShifts.x < doodadGridSize)
        doodadGrid[middleGrid + 2 - totalShifts.y][middleGrid - 3 - totalShifts.x] = buttonW;
    if (middleGrid + 3 - totalShifts.y >= 0 && middleGrid + 3 - totalShifts.y < doodadGridSize && middleGrid - 4 - totalShifts.x >= 0 && middleGrid - 4 - totalShifts.x < doodadGridSize)
        doodadGrid[middleGrid + 3 - totalShifts.y][middleGrid - 4 - totalShifts.x] = buttonA;
    if (middleGrid + 3 - totalShifts.y >= 0 && middleGrid + 3 - totalShifts.y < doodadGridSize && middleGrid - 3 - totalShifts.x >= 0 && middleGrid - 3 - totalShifts.x < doodadGridSize)
        doodadGrid[middleGrid + 3 - totalShifts.y][middleGrid - 3 - totalShifts.x] = buttonS;
    if (middleGrid + 3 - totalShifts.y >= 0 && middleGrid + 3 - totalShifts.y < doodadGridSize && middleGrid - 2 - totalShifts.x >= 0 && middleGrid - 2 - totalShifts.x < doodadGridSize)
        doodadGrid[middleGrid + 3 - totalShifts.y][middleGrid - 2 - totalShifts.x] = buttonD;
    if (middleGrid + 3 - totalShifts.y >= 0 && middleGrid + 3 - totalShifts.y < doodadGridSize && middleGrid + 3 - totalShifts.x >= 0 && middleGrid + 3 - totalShifts.x < doodadGridSize)
        doodadGrid[middleGrid + 3 - totalShifts.y][middleGrid + 3 - totalShifts.x] = buttonMouse;
    // Background elements are shifted towards the top-left corner, since their "real" top-left corner is at the middle of the screen
    var doodadY = (Math.floor(backgroundAnchorY / doodadInterval) * doodadInterval) - (screenSize * 0.6);
    for (var y = 0; y < doodadGridSize; y++) {
        var doodadX = (Math.floor(backgroundAnchorX / doodadInterval) * doodadInterval) - (screenSize * 0.6);
        for (var x = 0; x < doodadGridSize; x++) {
            let doodadLocation = view.worldToView({x: doodadX, y: doodadY});
            if (doodadY )
            if (doodadGrid[y][x]) {
                doodadGrid[y][x].pos.x = doodadLocation.x;
                doodadGrid[y][x].pos.y = doodadLocation.y;
                doodadGrid[y][x].drawTo(g);
            }
            doodadX += doodadInterval;
        }
        doodadY += doodadInterval;
    }

    // Draw title screen if game hasn't started
    if (gameState == 0) {
        let titleImageViewPosition = view.worldToView(titleImagePosition);
        titleImage.pos.x = titleImageViewPosition.x;
        titleImage.pos.y = titleImageViewPosition.y;
        titleImage.drawTo(g);
    }

    // Create floating particles around the player
    if (Math.random() < 0.13 && gameState != 2) {
        let theta = (2 * Math.PI) * Math.random();
        particles.push({x: player.phys.pos.x, y: player.phys.pos.y, speedX: Math.cos(theta), speedY: Math.sin(theta), framesAlive: 120});
    }

    // Draw particles
    var particleIndex = 0;
    while (particleIndex < particles.length) {
        let particle = particles[particleIndex];

        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.speedX *= 0.99;
        particle.speedY *= 0.99;
        particle.framesAlive -= 1;

        g.fillStyle = '#00CCCC';
        g.globalAlpha = particle.framesAlive / 120; // Particles emanating from the player have a lifespan of 2 seconds
        g.beginPath();
        let particleLocation = view.worldToView(particle);
        g.arc(particleLocation.x, particleLocation.y, 4, 0, 2 * Math.PI, 0);
        g.fill();

        if (particle.framesAlive <= 0) {
            particles.splice(particleIndex, 1);
        } else {
            particleIndex++;
        }
    }
    g.globalAlpha = 1.0;

    // Spawn weapon projectiles on mouse press
    for (var k = 0; k < player.weapon.length; k++) {
        let weapon = player.weapon[k];

        weapon.load(time);
        if (view.mouse.pressed && weapon.ready && gameState != 2) {
            let mouse = view.viewToWorld(view.mouse);

            let theta = weaponAngle(player.phys.pos, mouse);
            let amount = weapon.amount + Math.round(variance(weapon.amountVar));
            for (let i = 0; i < amount; i++) {
                let spread = variance(weapon.spread);
                let direction = { x: Math.sin(theta + spread), y: Math.cos(theta + spread) };
                let proj = weapon.shoot(time, direction);
                proj.phys.moveTo(player.phys.pos);
                gameObjects.playerProjectiles.push(proj);
            }
            weapon.ready = false;
        }
    }

    // Update enemy logic
    for (var i = 0; i < gameObjects.enemies.length; i++) {
        let mon = gameObjects.enemies[i];
        mon.behavior.roll(time);
        mon.weapon.load(time);

        if (mon.behavior.mode === 'idle') {
            mon.phys.speed = {x: mon.behavior.moveSpeed * mon.behavior.moveDirection.x,
                              y: mon.behavior.moveSpeed * mon.behavior.moveDirection.y};
        } else {
            let behavior = mon.behaviorAgainst(player);

            let theta = weaponAngle(mon.phys.pos, player.phys.pos);
            let amount = mon.weapon.amount + Math.round(variance(mon.weapon.amountVar));
            if (behavior.attack && mon.weapon.ready) {
                for (let i = 0; i < amount; i++) {
                    let spread = variance(mon.weapon.spread);
                    let playerDirection = { x: Math.sin(theta + spread), y: Math.cos(theta + spread) };
                    let proj = mon.weapon.shoot(time, playerDirection);
                    proj.phys.moveTo(mon.phys.pos);
                    gameObjects.enemyProjectiles.push(proj);
                }
                mon.weapon.ready = false;
            }

            if (behavior.follow) {
                let playerDirection = { x: Math.sin(theta), y: Math.cos(theta) };
                mon.phys.speed = {x: mon.behavior.moveSpeed * playerDirection.x,
                                  y: mon.behavior.moveSpeed * playerDirection.y};
            }
        }
    }

    // Check all collisions
    for (var i = 0; i < collisionGroups.length; i++) {
        let firstGroup = collisionGroups[i];
        for (var j = i + 1; j < collisionGroups.length; j++) {
            let secondGroup = collisionGroups[j];
            if (!firstGroup.ignore.includes(secondGroup.array)) {
                checkAllCollisions(gameObjects[firstGroup.array], gameObjects[secondGroup.array]);
            }
        }
    }

    // Player animation
    playerAnimation.timer++;
    if (view.mouse.pressed && playerAnimation.timer > 0) {
        player.sprite.changeImage("Shooting.png")
        playerAnimation.phase = 2;
        playerAnimation.timer = 0;
    } else {
        if (playerAnimation.timer >= 40) {
            if (playerAnimation.phase > 1) {
                player.sprite.changeImage("Player_Idle1.png");
                playerAnimation.phase = 1;
                playerAnimation.timer = 0;
            } else if (player.phys.speed.x == 0 && player.phys.speed.y == 0) {
                player.sprite.changeImage("Player_Idle2.png");
                playerAnimation.phase = 2;
                playerAnimation.timer = 0;
            }
        }
    }

    // Update and draw game objects
    for (var type in gameObjects) {
        let array = gameObjects[type];
        for (var i = 0; i < array.length; i++) {
            let item = array[i];
            if (item.update(time)) {
                view.drawSprite(item);
                // view.drawRectangle(item.body.rect); DEBUG
            } else {
                if (item instanceof Monster && Math.random() < 0.25) {
                    var drop = new Projectile(item.weapon.dropname, Math.random(), 5000);
                    drop.weaponPickup = item.weapon;
                    drop.phys.moveTo(item.phys.pos);
                    gameObjects.weaponPickups.push(drop);
                }
                array.splice(i--, 1);
            }
        }
    }

    // Draw health bar if game has started
    if (gameState != 0) {
        // Create health bar animation effects
        if (Math.random() < 0.06) {
            healthBarEffects.push({x: view.width / 2 - 365, y: healthBarMiddle, radius: 6 + (Math.random() * 9), speedX: 1.5 + (Math.random() * 1.25), speedY: -0.1 + (Math.random() * 0.2)});
        }

        // Draw health bar outline
        g.fillStyle = '#000000'; // Black
        g.fillRect(view.width / 2 - 354, healthBarTop - 4, 708, 3); // Top
        g.fillRect(view.width / 2 - 354, healthBarTop - 1, 3, 32); // Left
        g.fillRect(view.width / 2 - 354, healthBarBottom + 1, 708, 3); // Bottom
        g.fillRect(view.width / 2 + 351, healthBarTop - 1, 3, 32); // Right
        g.fillStyle = '#FFFFFF'; // White
        g.fillRect(view.width / 2 - 350, healthBarTop - 1, 700, 1); // Top
        g.fillRect(view.width / 2 - 351, healthBarTop - 1, 1, 32); // Left
        g.fillRect(view.width / 2 - 350, healthBarBottom, 700, 1); // Bottom
        g.fillRect(view.width / 2 + 350, healthBarTop - 1, 1, 32); // Right

        // Draw health bar
        g.fillStyle = 'rgba(0, 200, 255, 0.75)';
        g.fillRect(view.width / 2 - 350, healthBarTop, (player.health.health / 100) * 700, healthBarBottom - healthBarTop);

        // Calculate clipping path for health bar
        g.save();
        g.beginPath();
        g.moveTo(view.width / 2 - 350, healthBarTop);
        g.lineTo(view.width / 2 + 349 - ((1.0 - (player.health.health / 100)) * 700), healthBarTop);
        g.lineTo(view.width / 2 + 349 - ((1.0 - (player.health.health / 100)) * 700), healthBarBottom);
        g.lineTo(view.width / 2 - 350, healthBarBottom);
        g.lineTo(view.width / 2 - 350, healthBarTop);
        g.closePath();
        g.clip();

        // Animate health bar
        var healthBarEffectIndex = 0;
        while (healthBarEffectIndex < healthBarEffects.length) {
            let effect = healthBarEffects[healthBarEffectIndex];

            effect.x += effect.speedX;
            effect.y += effect.speedY;

            g.fillStyle = 'rgba(100, 255, 255, 0.75)';
            g.beginPath();
            g.arc(effect.x, effect.y, effect.radius, 0, 2 * Math.PI, 0);
            g.fill();

            if (effect.x > view.width / 2 + 365) {
                healthBarEffects.splice(healthBarEffectIndex, 1);
            } else {
                healthBarEffectIndex++;
            }
        }
        g.restore();
    }

    // Draw mouse
    view.drawMouse();

    // Show frames per second if game has started
    if (gameState != 0) {
        timestamps.push(time);
        while (timestamps[0] < time - 1000) {
            timestamps.shift();
        }
        fps = timestamps.length;

        g.fillStyle = '#00FF00';
        g.font = '14px Helvetica';
        g.fillText(fps + " fps", 6, 16);

        if (gameState == 2) {
            g.fillText(gameOverText, view.width / 2 - 100, view.height / 2 - 10);
            g.fillText("Press R to restart", view.width / 2 - 55, view.height / 2 + 10);
        }
    }

    // Start the game if player had walked far away from the start
    if (gameState == 0 && Math.sqrt((player.phys.pos.x * player.phys.pos.x) + (player.phys.pos.y * player.phys.pos.y)) > 1900) {
        stateTransition(1);
    }

    // End the game if the player is dead
    if (gameState == 1 && !player.heart.alive) {
        stateTransition(2);
    }

    // Restart the game
    if (gameState == 2 && r) {
        stateTransition(0);
    }

    requestAnimationFrame(draw);
}

// Bring view to player for title screen
//view.x = player.phys.pos.x - view.width / 2;
//view.y = player.phys.pos.y - view.height / 2;
draw();
