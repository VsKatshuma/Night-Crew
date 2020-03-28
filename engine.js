
var view = new View(document.getElementById("canvas"));
var g = view.gContext; // Fetch Context2D from View class

var requestAnimationFrame = window.requestAnimationFrame ||
                          window.mozRequestAnimationFrame ||
                          window.msRequestAnimationFrame ||
                          window.oRequestAnimationFrame ||
                          window.webkitRequestAnimationFrame;

var w, a, s, d = false;
var upArrow, leftArrow, downArrow, rightArrow = false;

// Handle keyboard events
document.onkeydown = function (event) {
    event = event || window.event;
    console.log(event.code);
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

// Initialize game state
var gameState = 1; // 0 = title, 1 = game, 2 = failure state

// Create arrays for storing game objects
var gameObjects = {
    enemies: [],
    projectiles: [],
    enemyProjectiles: [],
    player: [],
    playerProjectiles: []
};

// Initialize player
gameObjects.player.push(new Monster("wisp1.png"))
var player = gameObjects.player[0];

var collisionGroups = [
    {array: 'enemies', ignore: ['enemyProjectiles', 'player']},
    {array: 'enemyProjectiles', ignore: ['enemies']},
    {array: 'player', ignore: ['playerProjectiles', 'enemies']},
    {array: 'playerProjectiles', ignore: ['player']}
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
var doodad1 = new Sprite('tombstone1.png', undefined);
var doodad2 = new Sprite('tombstone2.png', undefined);
var doodad3 = new Sprite('cross1.png', undefined);
var doodad4 = new Sprite('cross2.png', undefined);
var doodad5 = new Sprite('deadGrass.png', undefined);
var doodad6 = new Sprite('bush.png', undefined);
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
var buttonStart = new Sprite('StartButton.png', undefined);
var titleImage = new Sprite('TitleImage.png', undefined);

// Create a grid for storing active background elements
var doodadInterval = 70;
var screenSize = Math.max(view.width, view.height);
var doodadGridSize = Math.ceil(screenSize * 1.2 / doodadInterval);
if (doodadGridSize % 2 == 0) {
    doodadGridSize++;
}
var doodadGridCrossroad = {x: Math.floor(doodadGridSize / 2), y: Math.floor(doodadGridSize / 2)}; // Where tile paths appear
var doodadGrid = new Array(doodadGridSize);
for (var i = 0; i < doodadGridSize; i++) {
    doodadGrid[i] = new Array(doodadGridSize);
}

// Populate doodadGrid with background elements at (0,0)
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

// Functions for calculating random backround elements
function tileMiddle(noise) {
    if (Math.abs(noise) > 0.5) {
        return tileAll1;
    } else if (Math.abs(noise) > 0.35) {
        return tileAll2;
    } else if (Math.abs(noise) > 0.1) {
        return tileAll3;
    } else {
        return;
    }
}

function tileHorizontal(noise) {
    if (noise > 0.6) {
        return tileAll1;
    } else if (noise > 0.35) {
        return tileAll2;
    } else if (noise > 0.1) {
        return tileAll3;
    } else if (noise < -0.6) {
        return tileHor1;
    } else if (noise < -0.3) {
        return tileHor2;
    } else if (noise < -0.1) {
        return tileHor3;
    } else {
        return;
    }
}

function tileVertical(noise) {
    if (noise > 0.55) {
        return tileAll1;
    } else if (noise > 0.4) {
        return tileAll2;
    } else if (noise > 0.1) {
        return tileAll3;
    } else if (noise < -0.6) {
        return tileVer1;
    } else if (noise < -0.3) {
        return tileVer2;
    } else if (noise < -0.1) {
        return tileVer3;
    } else {
        return;
    }
}

function randomDoodad(noise) {
    if (noise > 0.85) {
        return doodad1;
    } else if (noise > 0.7) {
        return doodad2;
    } else if (noise > 0.55) {
        return doodad3;
    } else if (noise > 0.4) {
        return doodad5;
    } else {
        return;
    }
}

// Define a border around player character for unloading and loading background elements
var loadZoneLeft = Math.floor(player.phys.pos.x / doodadInterval) * doodadInterval;
var loadZoneRight = (Math.floor(player.phys.pos.x / doodadInterval) + 1) * doodadInterval;
var loadZoneUp = Math.floor(player.phys.pos.y / doodadInterval) * doodadInterval;
var loadZoneDown = (Math.floor(player.phys.pos.y / doodadInterval) + 1) * doodadInterval;

// Fps counter variables
var fps = 0;
var timestamps = [];

// ***
// Main gameplay loop, called every frame
// ***
function draw() {
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

    // Follow player's position with view if game has been started
    if (gameState != 0) {
        view.x = player.phys.pos.x - view.width / 2;
        view.y = player.phys.pos.y - view.height / 2;
    }

    // Unload and load background elements if necessary
    if (gameState != 0) {
        if (player.phys.pos.y < loadZoneUp) {
            //console.log("Shifting load zone up. New loadZoneUp: ", loadZoneUp);
            let loadArray = new Array(doodadGridSize);
            for (var x = 0; x < doodadGridSize; x++) {
                let noise = simplexNoise(((Math.floor(player.phys.pos.x / doodadInterval) + x) * doodadInterval),
                                        (Math.floor(player.phys.pos.y / doodadInterval) * doodadInterval));
                if (doodadGridCrossroad.y == doodadGridSize - 1) {
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
            if (doodadGridCrossroad.y == doodadGridSize) {
                doodadGridCrossroad.y = 0;
            }
        } else if (player.phys.pos.y > loadZoneDown) {
            //console.log("Shifting load zone down. New loadZoneDown: ", loadZoneDown);
            let loadArray = new Array(doodadGridSize);
            for (var x = 0; x < doodadGridSize; x++) {
                let noise = simplexNoise(((Math.floor(player.phys.pos.x / doodadInterval) + x) * doodadInterval),
                                        ((Math.floor(player.phys.pos.y / doodadInterval) + (doodadGridSize - 1)) * doodadInterval));
                if (doodadGridCrossroad.y == 0) {
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
            if (doodadGridCrossroad.y == -1) {
                doodadGridCrossroad.y = doodadGridSize - 1;
            }
        }
        if (player.phys.pos.x < loadZoneLeft) {
            //console.log("Shifting load zone left. New loadZoneLeft: ", loadZoneLeft);
            for (var y = 0; y < doodadGridSize; y++) {
                let noise = simplexNoise((Math.floor(player.phys.pos.x / doodadInterval) * doodadInterval),
                                        ((Math.floor(player.phys.pos.y / doodadInterval) + y) * doodadInterval));
                doodadGrid[y].pop();
                if (doodadGridCrossroad.x == doodadGridSize - 1) {
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
            if (doodadGridCrossroad.x == doodadGridSize) {
                doodadGridCrossroad.x = 0;
            }
        } else if (player.phys.pos.x > loadZoneRight) {
            //console.log("Shifting load zone right. New loadZoneRight: ", loadZoneRight);
            for (var y = 0; y < doodadGridSize; y++) {
                let noise = simplexNoise(((Math.floor(player.phys.pos.x / doodadInterval) + (doodadGridSize - 1)) * doodadInterval),
                                        ((Math.floor(player.phys.pos.y / doodadInterval) + y) * doodadInterval));
                doodadGrid[y].shift();
                if (doodadGridCrossroad.x == 0) {
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
            if (doodadGridCrossroad.x == -1) {
                doodadGridCrossroad.x = doodadGridSize - 1;
            }
        }
    }

    // Create enemies if game has been started
    if (gameState != 0) {
        if (Math.random() < 0.033) {
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
            var mon = new Monster("wisp2.png", 10);
            mon.phys.speed = { x: (speedX + 0.1) * 5, y: (speedY + 0.1) * 5 };
            mon.phys.pos = { x: x, y: y };
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
    var backgroundAnchorX = gameState == 0 ? 0 : player.phys.pos.x;
    var backgroundAnchorY = gameState == 0 ? 0 : player.phys.pos.y;
    // Edit title screen
    if (gameState == 0) {
        doodadGrid[doodadGridCrossroad.y + 2][doodadGridCrossroad.x - 3] = buttonW;
        doodadGrid[doodadGridCrossroad.y + 3][doodadGridCrossroad.x - 4] = buttonA;
        doodadGrid[doodadGridCrossroad.y + 3][doodadGridCrossroad.x - 3] = buttonS;
        doodadGrid[doodadGridCrossroad.y + 3][doodadGridCrossroad.x - 2] = buttonD;
        doodadGrid[doodadGridCrossroad.y + 3][doodadGridCrossroad.x + 3] = buttonMouse;
    }
    // Background elements are shifted towards the top-left corner, since their "real" top-left corner is at the middle of the screen
    var doodadY = (Math.floor(backgroundAnchorY / doodadInterval) * doodadInterval) - (screenSize * 0.6);
    for (var y = 0; y < doodadGridSize; y++) {
        var doodadX = (Math.floor(backgroundAnchorX / doodadInterval) * doodadInterval) - (screenSize * 0.6);
        for (var x = 0; x < doodadGridSize; x++) {
            let doodadLocation = view.worldToView({x: doodadX, y: doodadY});
            if (doodadGrid[y][x]) {
                doodadGrid[y][x].pos.x = doodadLocation.x;
                doodadGrid[y][x].pos.y = doodadLocation.y;
                doodadGrid[y][x].drawTo(g);
            }
            doodadX += doodadInterval;
        }
        doodadY += doodadInterval;
    }

    // Create floating particles around the player
    if (Math.random() < 0.13) {
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

        g.fillStyle = '#00CC55';
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
    player.weapon.load(time);
    if (view.mouse.pressed && player.weapon.ready) {
        let mouse = view.viewToWorld(view.mouse);
        let theta = weaponAngle(player.phys.pos.x, player.phys.pos.y, mouse.x, mouse.y);
        let direction = { x: Math.sin(theta), y: Math.cos(theta) };
        let proj = player.weapon.shoot(time, direction);
        proj.phys.moveTo(player.phys.pos);
        gameObjects.playerProjectiles.push(proj);
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

    // Update and draw game objects
    for (var type in gameObjects) {
        let array = gameObjects[type];
        for (var i = 0; i < array.length; i++) {
            let item = array[i];
            if (item.update(time)) {
                view.drawSprite(item);
                view.drawRectangle(item.body.rect);
            } else {
                array.splice(i--, 1);
            }
        }
    }

    // Draw title screen if game hasn't started
    if (gameState == 0) {
        titleImage.pos.x = view.width / 2;
        titleImage.pos.y = view.height / 4;
        titleImage.drawTo(g);
    }

    // Update and draw player character
    player.update(time);
    view.drawSprite(player);
    view.drawRectangle(player.body.rect);

    // Draw health bar if game has been started
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
        g.fillRect(view.width / 2 - 350, healthBarTop, 700, healthBarBottom - healthBarTop);

        // Calculate clipping path for health bar
        g.save();
        g.beginPath();
        g.moveTo(view.width / 2 - 350, healthBarTop);
        g.lineTo(view.width / 2 + 349, healthBarTop);
        g.lineTo(view.width / 2 + 349, healthBarBottom);
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

    // Show frames per second if game has been started
    if (gameState != 0) {
        timestamps.push(time);
        while (timestamps[0] < time - 1000) {
            timestamps.shift();
        }
        fps = timestamps.length;

        g.fillStyle = '#00FF00';
        g.font = '14px Helvetica';
        g.fillText(fps + " fps", 6, 16);
    }

    requestAnimationFrame(draw);
}

view.x = player.phys.pos.x - view.width / 2;
view.y = player.phys.pos.y - view.height / 2;
draw();
/*
WebFont.load({
	google: {families: 'Frijole'},
  	active: draw
});*/
