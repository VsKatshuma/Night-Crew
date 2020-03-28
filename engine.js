
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

// Initialize player
var player = new Player("wisp1.png");
player.pos = { x: 0, y: 0 };

// Create arrays for storing game objects
var gameObjects = {
    enemies: [],
    projectiles: []
};

// Create an array for storing active particle effects
var particles = [];

// Create an array for storing health bar effects
var healthBarEffects = [];

// Health bar position variables
var healthBarTop = 20;
var healthBarBottom = 50;
var healthBarMiddle = 35; // Spawning height of effects

// Create a grid for storing nearby active background elements
var doodadInterval = 50;
var screenSize = Math.max(view.width, view.height);
var doodadGridSize = Math.ceil(screenSize * 1.2 / doodadInterval);
var doodadGrid = new Array(doodadGridSize);
for (var i = 0; i < doodadGridSize; i++) {
    doodadGrid[i] = new Array(doodadGridSize);
}

for (var y = 0; y < doodadGridSize; y++) {
    for (var x = 0; x < doodadGridSize; x++) {
        doodadGrid[y][x] = simplexNoise(((Math.floor(player.pos.x / doodadInterval) + x) * doodadInterval),
                                        ((Math.floor(player.pos.y / doodadInterval) + y) * doodadInterval));
    }
}

// Define a border around player character for unloading and loading background elements
var loadZoneLeft = Math.floor(player.pos.x / doodadInterval) * doodadInterval;
var loadZoneRight = (Math.floor(player.pos.x / doodadInterval) + 1) * doodadInterval;
var loadZoneUp = Math.floor(player.pos.y / doodadInterval) * doodadInterval;
var loadZoneDown = (Math.floor(player.pos.y / doodadInterval) + 1) * doodadInterval;

// Fps counter variables
var fps = 0;
var timestamps = [];

// ***
// Main gameplay loop, called with requestAnimationFrame
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
            player.speed.y = player.speed.y > -7.7 ? Math.max(player.speed.y - 0.385, -7.7) : Math.min(player.speed.y + 0.15, -7.7);
            player.speed.x = player.speed.x < 7.7 ? Math.min(player.speed.x + 0.385, 7.7) : Math.max(player.speed.x - 0.15, 7.7);
            movedUp = true;
            movedRight = true;
        } else if (right && down) {
            player.speed.x = player.speed.x < 7.7 ? Math.min(player.speed.x + 0.385, 7.7) : Math.max(player.speed.x - 0.15, 7.7);
            player.speed.y = player.speed.y < 7.7 ? Math.min(player.speed.y + 0.385, 7.7) : Math.max(player.speed.y - 0.15, 7.7);
            movedRight = true;
            movedDown = true;
        } else if (down && left) {
            player.speed.y = player.speed.y < 7.7 ? Math.min(player.speed.y + 0.385, 7.7) : Math.max(player.speed.y - 0.15, 7.7);
            player.speed.x = player.speed.x > -7.7 ? Math.max(player.speed.x - 0.385, -7.7) : Math.min(player.speed.x + 0.15, -7.7);
            movedDown = true;
            movedLeft = true;
        } else if (left && up) {
            player.speed.x = player.speed.x > -7.7 ? Math.max(player.speed.x - 0.385, -7.7) : Math.min(player.speed.x + 0.15, -7.7);
            player.speed.y = player.speed.y > -7.7 ? Math.max(player.speed.y - 0.385, -7.7) : Math.min(player.speed.y + 0.15, -7.7);
            movedLeft = true;
            movedUp = true;
        } else {
            if (up) {
                player.speed.y = Math.max(player.speed.y - 0.5, -10);
                movedUp = true;
            }
            if (left) {
                player.speed.x = Math.max(player.speed.x - 0.5, -10);
                movedLeft = true;
            }
            if (down) {
                player.speed.y = Math.min(player.speed.y + 0.5, 10);
                movedDown = true;
            }
            if (right) {
                player.speed.x = Math.min(player.speed.x + 0.5, 10);
                movedRight = true;
            }
        }
    }

    // Apply friction
    if (!movedUp) {
        if (player.speed.y < 0) {
            player.speed.y = Math.min(player.speed.y + 0.15, 0);
        }
    }
    if (!movedLeft) {
        if (player.speed.x < 0) {
            player.speed.x = Math.min(player.speed.x + 0.15, 0);
        }
    }
    if (!movedDown) {
        if (player.speed.y > 0) {
            player.speed.y = Math.max(player.speed.y - 0.15, 0);
        }
    }
    if (!movedRight) {
        if (player.speed.x > 0) {
            player.speed.x = Math.max(player.speed.x - 0.15, 0);
        }
    }

    // Update player's position based on speed
    player.pos.x += player.speed.x;
    player.pos.y += player.speed.y;

    // Follow player's position with the view
    view.x = player.pos.x - view.width / 2;
    view.y = player.pos.y - view.height / 2;

    // Unload and load background elements if necessary
    if (player.pos.y < loadZoneUp) {
        let loadArray = new Array(doodadGridSize);
        for (var x = 0; x < doodadGridSize; x++) {
            loadArray[x] = simplexNoise(((Math.floor(player.pos.x / doodadInterval) + x) * doodadInterval),
                                        (Math.floor(player.pos.y / doodadInterval) * doodadInterval));
        }
        doodadGrid.pop();
        doodadGrid.unshift(loadArray);
        loadZoneUp -= doodadInterval;
        loadZoneDown -= doodadInterval;
        //console.log("Shifted load zone up. New loadZoneUp: ", loadZoneUp);
    } else if (player.pos.y > loadZoneDown) {
        let loadArray = new Array(doodadGridSize);
        for (var x = 0; x < doodadGridSize; x++) {
            loadArray[x] = simplexNoise(((Math.floor(player.pos.x / doodadInterval) + x) * doodadInterval),
                                        ((Math.floor(player.pos.y / doodadInterval) + (doodadGridSize - 1)) * doodadInterval));
        }
        doodadGrid.shift();
        doodadGrid.push(loadArray);
        loadZoneUp += doodadInterval;
        loadZoneDown += doodadInterval;
        //console.log("Shifted load zone down. New loadZoneDown: ", loadZoneDown);
    }
    if (player.pos.x < loadZoneLeft) {
        for (var y = 0; y < doodadGridSize; y++) {
            doodadGrid[y].pop();
            doodadGrid[y].unshift(simplexNoise( (Math.floor(player.pos.x / doodadInterval) * doodadInterval),
                                                ((Math.floor(player.pos.y / doodadInterval) + y) * doodadInterval)));
        }
        loadZoneLeft -= doodadInterval;
        loadZoneRight -= doodadInterval;
        //console.log("Shifted load zone left. New loadZoneLeft: ", loadZoneLeft);
    } else if (player.pos.x > loadZoneRight) {
        for (var y = 0; y < doodadGridSize; y++) {
            doodadGrid[y].shift();
            doodadGrid[y].push(simplexNoise(((Math.floor(player.pos.x / doodadInterval) + (doodadGridSize - 1)) * doodadInterval),
                                            ((Math.floor(player.pos.y / doodadInterval) + y) * doodadInterval)));
        }
        loadZoneLeft += doodadInterval;
        loadZoneRight += doodadInterval;
        //console.log("Shifted load zone right. New loadZoneRight: ", loadZoneRight);
    }

    // Create enemies
    if (Math.random() < 0.033) {
        let seed = Math.random();
        let x, y, speedX, speedY = 0;
        if (seed < 0.25) {
            x = player.pos.x - (view.width * 0.6) + (Math.random() * view.width * 1.2);
            y = player.pos.y - (view.height * 0.6);
            speedX = -1 + (Math.random() * 2);
            speedY = Math.random();
        } else if (seed < 0.5) {
            x = player.pos.x - (view.width * 0.6);
            y = player.pos.y - (view.height * 0.6) + (Math.random() * view.height * 1.2);
            speedX = Math.random();
            speedY = -1 + (Math.random() * 2);
        } else if (seed < 0.75) {
            x = player.pos.x - (view.width * 0.6) + (Math.random() * view.width * 1.2);
            y = player.pos.y + (view.height * 0.6);
            speedX = -1 + (Math.random() * 2);
            speedY = -Math.random();
        } else {
            x = player.pos.x + (view.width * 0.6);
            y = player.pos.y - (view.height * 0.6) + (Math.random() * view.height * 1.2);
            speedX = -Math.random();
            speedY = -1 + (Math.random() * 2);
        }
        var mon = new Monster("wisp2.png", 10);
        mon.speed = { x: (speedX + 0.1) * 5, y: (speedY + 0.1) * 5 };
        mon.pos = { x: x, y: y };
        gameObjects.enemies.push(mon);
    }

    // Create floating particles around the player
    if (Math.random() < 0.13) {
        let theta = (2 * Math.PI) * Math.random();
        particles.push({x: player.pos.x, y: player.pos.y, speedX: Math.cos(theta), speedY: Math.sin(theta), framesAlive: 120});
    }

    // Create health bar animation effects
    if (Math.random() < 0.06) {
        healthBarEffects.push({x: view.width / 2 - 365, y: healthBarMiddle, radius: 6 + (Math.random() * 9), speedX: 1.5 + (Math.random() * 1.25), speedY: -0.1 + (Math.random() * 0.2)});
    }

    // Draw the background
    view.drawBackground();

    // Draw background elements
    g.fillStyle = '#0F0F9F';
    for (var y = 0; y < doodadGridSize; y++) {
        for (var x = 0; x < doodadGridSize; x++) {
            if (doodadGrid[y][x] > 0.5) {
                // Shift background elements towards the top-left corner, since their "real" top-left corner is at the middle of the screen
                let doodadLocation = view.worldToView({
                    x: ((Math.floor(player.pos.x / doodadInterval) + x) * doodadInterval) - (screenSize * 0.6),
                    y: ((Math.floor(player.pos.y / doodadInterval) + y) * doodadInterval) - (screenSize * 0.6)
                });
                g.fillRect(doodadLocation.x, doodadLocation.y, 25, 25);
            }
        }
    }

    // Destroy enemies if they wander too far
    for (let i = 0; i < gameObjects.enemies.length; i++) {
        let enemy = gameObjects.enemies[i];
        if (enemy.pos.x < player.pos.x - view.width ||
            enemy.pos.x > player.pos.x + view.width ||
            enemy.pos.y < player.pos.y - view.height ||
            enemy.pos.y > player.pos.y + view.height) {
                gameObjects.enemies.splice(i--, 1);
        }
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
        let theta = weaponAngle(player.pos.x, player.pos.y, mouse.x, mouse.y);
        let direction = { x: Math.sin(theta), y: Math.cos(theta) };
        let proj = player.weapon.shoot(time, direction);
        proj.setPosition(player.pos.x, player.pos.y);
        gameObjects.projectiles.push(proj);
    }

    // Update and draw rest of the game objects
    for (var type in gameObjects) {
        let array = gameObjects[type];
        for (var i = 0; i < array.length; i++) {
            let item = array[i];
            if (item.update(time)) {
                view.draw(item);
            } else {
                array.splice(i--, 1);
            }
        }
    }

    // Draw player character
    view.draw(player);

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

    // Draw mouse
    view.drawMouse();

    // Calculate frames per second
    timestamps.push(time);
    while (timestamps[0] < time - 1000) {
        timestamps.shift();
    }
    fps = timestamps.length;

    g.fillStyle = '#00FF00';
    g.font = '14px Helvetica';
    g.fillText(fps + " fps", 6, 16);

    requestAnimationFrame(draw);
}

draw();
