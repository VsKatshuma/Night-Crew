
class Projectile {
    constructor(filename, xpos, ypos, xspeed, yspeed, lifetime) {
        this.sprite = new Sprite(filename);
        this.speed = {x: xspeed, y: yspeed};
        this.pos = {x: xpos, y: ypos};
        this.body = new Collidable(this.sprite);

        // Protection against undying projectiles
        var t = lifetime;
        if (t > 10000) { t = 10000; }
        else if (t <= 0) { t = 1; }
        this.heart = new Destroyable(t);
    }

    clone() {
        return new Projectile(
            this.sprite.filename,
            this.pos.x,
            this.pos.y,
            this.speed.x,
            this.speed.y,
            this.heart.lifetime
        );
    }

    setPosition(x, y) {
        this.pos.x = x;
        this.pos.y = y;
        this.sprite.pos.x = this.pos.x;
        this.sprite.pos.y = this.pos.y;
        this.body.setPosition(x, y);
    }

    move(delta) {
        this.setPosition(this.pos.x + delta.x, this.pos.y + delta.y);
    }

    update(now) {
        this.move(this.speed);
        this.heart.tick(now);
        return this.heart.alive;
    }
}
