
/*
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
*/

class Monster {
    constructor(spritefile, health) {
        this.phys = new Movable();
        this.body = new Collidable();
        this.sprite = new Sprite(spritefile, () => { this.body.useSprite(this.sprite) });

        this.heart = new Destroyable();
        var onDeath = () => { this.heart.alive = false; };
        this.health = new Damageable(health, onDeath);

        var weaponProjectile = new Projectile("crosshair.png", {x: 0, y: 0}, {x: 10, y: 10}, 1500);
        this.weapon = new Weapon(weaponProjectile, 1, 0, 250, 2);
        this.aggroRadius = 400;

        this.phys.onMove = (pos) => {
            this.body.pos = pos;
        };
    }

    isAggressiveAgainst(other) {
        let distanceTo = weaponDistance(this.phys.pos, other.phys.pos);
        return distanceTo < this.aggroRadius;
    }

    update(now) {
        this.phys.move();
        return this.heart.alive;
    }
}
