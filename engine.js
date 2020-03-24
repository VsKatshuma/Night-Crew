
var canvas = document.getElementById("canvas");
var g = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var requestAnimationFrame = window.requestAnimationFrame ||
                          window.mozRequestAnimationFrame ||
                          window.msRequestAnimationFrame ||
                          window.oRequestAnimationFrame ||
                          window.webkitRequestAnimationFrame;

var w = false;
var a = false;
var s = false;
var d = false;

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
};

var playerX = 450;
var playerY = 450;

function draw() {
    if (w)
        playerY -= 10;
    if (a)
        playerX -= 10;
    if (s)
        playerY += 10;
    if (d)
        playerX += 10;

    g.fillStyle = '#000000';
    g.fillRect(0, 0, canvas.width, canvas.height);

    g.fillStyle = '#888888';
    g.fillRect(playerX, playerY, 50, 50);

    requestAnimationFrame(draw);
}

draw();
