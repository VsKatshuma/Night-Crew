
class Projectile {
    constructor(filename, speed, lifetime) {
        this.phys = new Movable({x: 0, y: 0}, {x: speed, y: speed});
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

        this.weaponPickup = null;
    }

    clone() {
        return new Projectile(
            this.sprite.filename,
            this.phys.speed.x,
            this.heart.lifetime
        );
    }

    update(now) {
        this.phys.move();
        this.heart.tick(now);
        return this.heart.alive;
    }
}
