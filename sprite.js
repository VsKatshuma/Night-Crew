
var spritesPath = "Sprites/";

class Sprite {
    constructor(filename) {
        this.filename = filename
        this.filepath = spritesPath + filename;
        this.image = new Image();
        this.image.src = this.filepath;
        this.pos = { x: 0, y: 0 };
    }

    drawTo(context) {
        if (this.image.complete) {
            context.drawImage(this.image, this.pos.x, this.pos.y);
        }
        else {
            console.log(this.filepath + " not yet loaded");
        }
    }

}
