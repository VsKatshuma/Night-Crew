
var spritesPath = "Sprites/";

class Sprite {
    constructor(filename, onload) {
        this.filename = filename;
        this.filepath = spritesPath + filename;

        this.pos = { x: 0, y: 0 };
        this.image = new Image();
        this.image.onload = onload;

        // Start loading the image
        this.image.src = this.filepath;
    }

    drawTo(context) {
        if (this.image.complete) {
            context.drawImage(this.image, this.pos.x - (this.image.width / 2), this.pos.y - (this.image.height / 2));
        }
    }

}
