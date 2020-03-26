
var spritesPath = "Sprites/";

class Sprite {
    constructor(filename) {
        this.filename = filename
        this.filepath = spritesPath + filename;
        this.image = new Image();
        this.image.src = this.filepath;
        this.pos = { x: 0, y: 0 };
    }

    drawTo(canvas) {
        if (this.image.complete) {
            canvas.drawImage(this.image, this.pos.x, this.pos.y);
        }
        else {
            console.log(this.filepath + " not yet loaded");
        }
    }

}
