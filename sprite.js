
var spritesPath = "Sprites/";

class Sprite {
    constructor(filename) {
        this.filename = filename;
        this.filepath = spritesPath + filename;
        this.image = new Image();
        this.image.src = this.filepath;
        this.pos = { x: 0, y: 0 };
    }

    drawTo(context) {
        if (this.image.complete) {
            context.drawImage(this.image, this.pos.x - (this.image.width / 2), this.pos.y - (this.image.height / 2));
        } else {
            console.log("Loading " + this.filepath + "...");
        }
    }
}
