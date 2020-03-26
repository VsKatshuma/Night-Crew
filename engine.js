
var canvas = document.getElementById("canvas");
canvas.style.cursor = "none";
var g = canvas.getContext("2d");

var width = window.innerWidth;
var height = window.innerHeight;

canvas.width = width;
canvas.height = height;

var requestAnimationFrame = window.requestAnimationFrame ||
                          window.mozRequestAnimationFrame ||
                          window.msRequestAnimationFrame ||
                          window.oRequestAnimationFrame ||
                          window.webkitRequestAnimationFrame;

var w, a, s, d = false;
var up, left, down, right = false;
var mousePos = { x: 0, y: 0 };

// Images
sprites = {
	crosshair: new Image()
};
sprites.crosshair.src = "Images/crosshair.png"

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
    if (event.code === 'ArrowUp' && !up) {
        up = true;
    }
    if (event.code === 'ArrowLeft' && !left) {
        left = true;
    }
    if (event.code === 'ArrowDown' && !down) {
        down = true;
    }
    if (event.code === 'ArrowRight' && !right) {
        right = true;
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
        up = false;
    if (event.code === 'ArrowLeft')
        left = false;
    if (event.code === 'ArrowDown')
        down = false;
    if (event.code === 'ArrowRight')
        right = false;
};

document.onmousemove = function(event) {
    event = event || window.event;
    mousePos.x = event.clientX;
    mousePos.y = event.clientY;
};

// Initialize player location and movement attributes
var playerX = -0.5;
var playerY = -0.5;
var direction = Math.PI * 1.8;
var speed = 0;

// Calculate where to draw an object based on game location
function locationToCanvas(x, y) {
    var canvasX = (width / 2) - playerX + x;
    var canvasY = (height / 2) - playerY + y;

    return [canvasX, canvasY];
}

// ***
// 2D simplex noise implementation from http://staffwww.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf
// ***
var gradient = [[1,1,0], [-1,1,0], [1,-1,0], [-1,-1,0], [1,0,1], [-1,0,1],
    [1,0,-1], [-1,0,-1], [0,1,1], [0,-1,1], [0,1,-1], [0,-1,-1]];
var p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36, 103,
    30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62, 94,
    252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136, 171,
    168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,
    211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25, 63, 161, 1,
    216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188, 159, 86,
    164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202, 38, 147, 118,
    126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183, 170,
    213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22, 39,
    253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251, 34,
    242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107, 49,
    192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4, 150, 254,
    138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
var perm = new Array(512); // To remove the need for index wrapping, double the permutation table length
for (var i = 0; i < 512; i++) {
    perm[i] = p[i & 255];
}

function dotProduct(vector1, vector2) {
    var result = 0;
    for (var i = 0; i < 3; i++) {
        result += vector1[i] * vector2[i];
    }
    return result;
}

function simplexNoise(xin, yin) {
    var n0, n1, n2; // Noise contributions from the three corners
    // Skew the input space to determine which simplex cell we're in
    var f2 = 0.5 * (Math.sqrt(3.0) - 1.0);
    var s = (xin + yin) * f2; // Hairy factor for 2D
    var i = Math.floor(xin + s);
    var j = Math.floor(yin + s);
    var g2 = (3.0 - Math.sqrt(3.0)) / 6.0;
    var t = (i + j) * g2;
    var xOrigin = i - t; // Unskew the cell origin back to (x,y) space
    var yOrigin = j - t;
    var x0 = xin - xOrigin; // The x,y distances from the cell origin
    var y0 = yin - yOrigin;
    // For the 2D case, the simplex shape is an equilateral triangle.
    // Determine which simplex we are in.
    var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
    if (x0 > y0) {
        i1 = 1; j1 = 0; // lower triangle, XY order: (0,0)->(1,0)->(1,1)
    } else {
        i1 = 0; j1 = 1; // upper triangle, YX order: (0,0)->(0,1)->(1,1)
    }
    // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
    // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
    // c = (3-sqrt(3))/6
    var x1 = x0 - i1 + g2; // Offsets for middle corner in (x,y) unskewed coords
    var y1 = y0 - j1 + g2;
    var x2 = x0 - 1.0 + 2.0 * g2; // Offsets for last corner in (x,y) unskewed coords
    var y2 = y0 - 1.0 + 2.0 * g2;
    // Work out the hashed gradient indices of the three simplex corners
    var ii = i & 255;
    var jj = j & 255;
    var gi0 = perm[ii + perm[jj]] % 12;
    var gi1 = perm[ii + i1 + perm[jj + j1]] % 12;
    var gi2 = perm[ii + 1 + perm[jj + 1]] % 12;
    // Calculate the contribution from the three corners
    var t0 = 0.5 - (x0 * x0) - (y0 * y0);
    if (t0 < 0) {
        n0 = 0.0;
    } else {
        t0 *= t0;
        n0 = t0 * t0 * dotProduct(gradient[gi0], [x0, y0, 0]); // Only (x,y) of gradient is used for 2D
    }
    var t1 = 0.5 - (x1 * x1) - (y1 * y1);
    if (t1 < 0) {
        n1 = 0.0;
    } else {
        t1 *= t1;
        n1 = t1 * t1 * dotProduct(gradient[gi1], [x1, y1, 0]);
    }
    var t2 = 0.5 - (x2 * x2) - (y2 * y2);
    if (t2 < 0) {
        n2 = 0.0;
    } else {
        t2 *= t2;
        n2 = t2 * t2 * dotProduct(gradient[gi2], [x2, y2, 0]);
    }
    // Add contributions from each corner to get the final noise value.
    // The result is scaled to return values in the interval [-1,1].
    return 70.0 * (n0 + n1 + n2);
}

// Create an array for storing active particle effects
var particles = [];
// Create an array for storing active enemies
var enemies = [];
// Create an array for storing health bar effects
var healthBarEffects = [];
// Create a grid for storing nearby active background elements
var doodadInterval = 50;
var screenSize = Math.max(width, height);
var doodadGridSize = Math.ceil(screenSize * 1.2 / doodadInterval);
var doodadGrid = new Array(doodadGridSize);
for (var i = 0; i < doodadGridSize; i++) {
    doodadGrid[i] = new Array(doodadGridSize);
}
for (var y = 0; y < doodadGridSize; y++) {
    for (var x = 0; x < doodadGridSize; x++) {
        doodadGrid[y][x] = simplexNoise(((Math.floor(playerX / doodadInterval) + x) * doodadInterval),
                                        ((Math.floor(playerY / doodadInterval) + y) * doodadInterval));
    }
}
// Define a border around player character for unloading and loading background elements
var loadZoneLeft = Math.floor(playerX / doodadInterval) * doodadInterval;
var loadZoneRight = (Math.floor(playerX / doodadInterval) + 1) * doodadInterval;
var loadZoneUp = Math.floor(playerY / doodadInterval) * doodadInterval;
var loadZoneDown = (Math.floor(playerY / doodadInterval) + 1) * doodadInterval;

// Fps counter variables
var fps = 0;
var timestamps = [];

// ***
// Main gameplay loop, called with requestAnimationFrame
// ***
function draw() {
    if (w || up) {
        speed = Math.min(speed + 0.5, 10);
    }
    if (a || left) {
        direction -= 0.1;
    }
    if (s || down) {
        speed = Math.max(speed - 0.5, 0);
    }
    if (d || right) {
        direction += 0.1;
    }

    // Update player position based on current direction and speed
    let angle = direction % (2 * Math.PI);
    playerX += Math.cos(angle) * speed;
    playerY += Math.sin(angle) * speed;

    // Unload and load background elements if necessary
    if (playerY < loadZoneUp) {
        let loadArray = new Array(doodadGridSize);
        for (var x = 0; x < doodadGridSize; x++) {
            loadArray[x] = simplexNoise(((Math.floor(playerX / doodadInterval) + x) * doodadInterval),
                                        (Math.floor(playerY / doodadInterval) * doodadInterval));
        }
        doodadGrid.pop();
        doodadGrid.unshift(loadArray);
        loadZoneUp -= doodadInterval;
        loadZoneDown -= doodadInterval;
        //console.log("Shifted load zone up. New loadZoneUp: ", loadZoneUp);
    } else if (playerY > loadZoneDown) {
        let loadArray = new Array(doodadGridSize);
        for (var x = 0; x < doodadGridSize; x++) {
            loadArray[x] = simplexNoise(((Math.floor(playerX / doodadInterval) + x) * doodadInterval),
                                        ((Math.floor(playerY / doodadInterval) + (doodadGridSize - 1)) * doodadInterval));
        }
        doodadGrid.shift();
        doodadGrid.push(loadArray);
        loadZoneUp += doodadInterval;
        loadZoneDown += doodadInterval;
        //console.log("Shifted load zone down. New loadZoneDown: ", loadZoneDown);
    }
    if (playerX < loadZoneLeft) {
        for (var y = 0; y < doodadGridSize; y++) {
            doodadGrid[y].pop();
            doodadGrid[y].unshift(simplexNoise( (Math.floor(playerX / doodadInterval) * doodadInterval),
                                                ((Math.floor(playerY / doodadInterval) + y) * doodadInterval)));
        }
        loadZoneLeft -= doodadInterval;
        loadZoneRight -= doodadInterval;
        //console.log("Shifted load zone left. New loadZoneLeft: ", loadZoneLeft);
    } else if (playerX > loadZoneRight) {
        for (var y = 0; y < doodadGridSize; y++) {
            doodadGrid[y].shift();
            doodadGrid[y].push(simplexNoise(((Math.floor(playerX / doodadInterval) + (doodadGridSize - 1)) * doodadInterval),
                                            ((Math.floor(playerY / doodadInterval) + y) * doodadInterval)));
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
            x = playerX - (width * 0.6) + (Math.random() * width * 1.2);
            y = playerY - (height * 0.6);
            speedX = -1 + (Math.random() * 2);
            speedY = Math.random();
        } else if (seed < 0.5) {
            x = playerX - (width * 0.6);
            y = playerY - (height * 0.6) + (Math.random() * height * 1.2);
            speedX = Math.random();
            speedY = -1 + (Math.random() * 2);
        } else if (seed < 0.75) {
            x = playerX - (width * 0.6) + (Math.random() * width * 1.2);
            y = playerY + (height * 0.6);
            speedX = -1 + (Math.random() * 2);
            speedY = -Math.random();
        } else {
            x = playerX + (width * 0.6);
            y = playerY - (height * 0.6) + (Math.random() * height * 1.2);
            speedX = -Math.random();
            speedY = -1 + (Math.random() * 2);
        }
        enemies.push({x: x, y: y, speedX: speedX * 5, speedY: speedY * 5});
    }

    // Create floating particles around the player
    if (Math.random() < 0.13) {
        let theta = (2 * Math.PI) * Math.random();
        particles.push({x: playerX, y: playerY, speedX: Math.cos(theta), speedY: Math.sin(theta), framesAlive: 120});
    }

    // Create health bar animation effects
    if (Math.random() < 0.07) {
        healthBarEffects.push({x: width / 2 - 365, y: 40, radius: 8 + (Math.random() * 10), speedX: 1.5 + (Math.random() * 1.25), speedY: -0.15 + (Math.random() * 0.3)});
    }

    // Draw black background
    g.fillStyle = '#000000';
    g.fillRect(0, 0, canvas.width, canvas.height);

    // Draw background elements
    g.fillStyle = '#0F0F9F';
    for (var y = 0; y < doodadGridSize; y++) {
        for (var x = 0; x < doodadGridSize; x++) {
            if (doodadGrid[y][x] > 0.5) {
                // Shift background elements towards the top-left corner, since their "real" top-left corner is at the middle of the screen
                let doodadLocation = locationToCanvas(
                    ((Math.floor(playerX / doodadInterval) + x) * doodadInterval) - (screenSize * 0.6),
                    ((Math.floor(playerY / doodadInterval) + y) * doodadInterval) - (screenSize * 0.6)
                );
                g.fillRect(doodadLocation[0], doodadLocation[1], 25, 25);
            }
        }
    }

    // Draw enemies
    var enemyIndex = 0;
    while (enemyIndex < enemies.length) {
        let enemy = enemies[enemyIndex];

        enemy.x += enemy.speedX;
        enemy.y += enemy.speedY;

        g.fillStyle = '#FFFF00';
        g.beginPath();
        let enemyLocation = locationToCanvas(enemy.x, enemy.y);
        g.arc(enemyLocation[0], enemyLocation[1], 20, 0, 2 * Math.PI, 0);
        g.fill();

        if (enemy.x < playerX - width || enemy.x > playerX + width || enemy.y < playerY - height || enemy.y > playerY + height) {
            enemies.splice(enemyIndex, 1);
        } else {
            enemyIndex++;
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
        g.beginPath();
        let particleLocation = locationToCanvas(particle.x, particle.y);
        g.arc(particleLocation[0], particleLocation[1], 4, 0, 2 * Math.PI, 0);
        g.fill();

        if (particle.framesAlive <= 0) {
            particles.splice(particleIndex, 1);
        } else {
            particleIndex++;
        }
    }

    // Draw player character
    g.fillStyle = '#C0C0C0';
    g.beginPath();
    var playerLocation = locationToCanvas(playerX, playerY);
    g.arc(playerLocation[0], playerLocation[1], 20, 0, 2 * Math.PI, 0);
    g.fill();

    // Draw health bar outline
    g.fillStyle = '#000000'; // Black
    g.fillRect(width / 2 - 354, 16, 708, 3); // Top
    g.fillRect(width / 2 - 354, 19, 3, 42); // Left
    g.fillRect(width / 2 - 354, 61, 708, 3); // Bottom
    g.fillRect(width / 2 + 351, 19, 3, 42); // Right
    g.fillStyle = '#FFFFFF'; // White
    g.fillRect(width / 2 - 350, 19, 700, 1); // Top
    g.fillRect(width / 2 - 351, 19, 1, 42); // Left
    g.fillRect(width / 2 - 350, 60, 700, 1); // Bottom
    g.fillRect(width / 2 + 350, 19, 1, 42); // Right

    // Draw health bar
    g.fillStyle = 'rgba(0, 200, 255, 0.75)';
    g.fillRect(width / 2 - 350, 20, 700, 40);

    // Calculate clipping path for health bar
    g.save();
    g.beginPath();
    g.moveTo(width / 2 - 350, 20);
    g.lineTo(width / 2 + 349, 20);
    g.lineTo(width / 2 + 349, 60);
    g.lineTo(width / 2 - 350, 60);
    g.lineTo(width / 2 - 350, 20);
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

        if (effect.x > width / 2 + 365) {
            healthBarEffects.splice(healthBarEffectIndex, 1);
        } else {
            healthBarEffectIndex++;
        }
    }
    g.restore();

    // Calculate frames per second
    var time = Date.now();
    timestamps.push(time);
    while (timestamps[0] < time - 1000) {
        timestamps.shift();
    }
    fps = timestamps.length;

    g.fillStyle = '#00FF00';
    g.font = '14px Helvetica';
    g.fillText(fps + " fps", 6, 16);

	// Draw crosshair
	g.drawImage(sprites.crosshair, mousePos.x, mousePos.y);

    requestAnimationFrame(draw);
}

draw();
