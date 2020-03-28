
class Player {
    constructor(spritefile, health) {
        this.sprite = new Sprite(spritefile);
        this.body = new Collidable(this.sprite);

        this.pos = { x: 0, y: 0 };
        this.speed = { x: 0, y: 0 };

        this.heart = new Destroyable();
        var onDeath = function() { this.heart.alive = false; };
        this.health = new Damageable(health, onDeath);

        var weaponProjectile = new Projectile("crosshair.png", 0, 0, 10, 10, 1500);
        this.weapon = new Weapon(weaponProjectile, 1, 0, 250);
    }

    update(now) {
        this.pos.x += this.speed.x;
        this.pos.y += this.speed.y;
        this.sprite.pos = this.pos;
        this.body.pos = this.pos;
        return this.heart.alive;
    }
}

class Monster {
    constructor(spritefile, health) {
        this.sprite = new Sprite(spritefile);
        this.body = new Collidable(this.sprite);

        this.pos = { x: 0, y: 0 };
        this.speed = { x: 0, y: 0 };

        this.heart = new Destroyable();
        var onDeath = function() { this.heart.alive = false; };
        this.health = new Damageable(health, onDeath);

        var weaponProjectile = new Projectile("crosshair.png", 0, 0, 10, 10, 1500);
        this.weapon = new Weapon(weaponProjectile, 1, 0, 250);
    }

    update(now) {
        this.pos.x += this.speed.x;
        this.pos.y += this.speed.y;
        this.sprite.pos = this.pos;
        this.body.pos = this.pos;
        return this.heart.alive;
    }
}
