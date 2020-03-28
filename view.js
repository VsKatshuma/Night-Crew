
class View {
    constructor(canvas) {
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.canvas = canvas;
        this.gContext = canvas.getContext("2d");

        // Hide cursor and synchronize canvas size
        this.canvas.style.cursor = "none";
        this.updateSize()

        // Initialize mouse
        this.mouse = {
            x: 0,
            y: 0,
            pressed: false,
            sprite: new Sprite("crosshair.png")
        };
    }

    updateSize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    // Draws and object to viewport
    // The object must have both sprite and pos members
    draw(drawable) {
        drawable.sprite.pos = this.worldToView(drawable.pos);
        drawable.sprite.drawTo(this.gContext);
    }

    worldToView(worldPos) {
        return { x: worldPos.x - this.x, y: worldPos.y - this.y };
    }

    viewToWorld(viewPos) {
        return { x: viewPos.x + this.x, y: viewPos.y + this.y };
    }

    drawBackground(color) {
        this.gContext.fillStyle = color ? color : '#000000';
        this.gContext.fillRect(0, 0, this.width, this.height);
    }

    drawMouse() {
        this.mouse.sprite.pos.x = this.mouse.x;
        this.mouse.sprite.pos.y = this.mouse.y;
        this.mouse.sprite.drawTo(this.gContext);
    }

};

