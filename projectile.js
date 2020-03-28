
class Projectile {
    constructor(filename, pos, speed, lifetime) {
        this.phys = new Movable(pos, speed);
        this.body = new Collidable();
        this.sprite = new Sprite(filename, () => { this.body.useSprite(this.sprite) });

        // Protection against undying projectiles
        var t = lifetime;
        if (t > 10000) { t = 10000; }
        else if (t <= 0) { t = 1; }
        this.heart = new Destroyable(t);

        this.phys.onMove = (pos) => {
            this.body.pos = pos;
        };
    }

    clone() {
        return new Projectile(
            this.sprite.filename,
            {x: this.phys.pos.x, y: this.phys.pos.y},
            {x: this.phys.speed.x, y: this.phys.speed.y},
            this.heart.lifetime
        );
    }

    update(now) {
        this.phys.move();
        this.heart.tick(now);
        return this.heart.alive;
    }
}
