
function weaponAngle(pos1, pos2) {
    return (Math.PI / 2) - Math.atan2(pos2.y - pos1.y, pos2.x - pos1.x);
}

function weaponDistance(pos1, pos2) {
    return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
}

class Weapon {
    constructor(spritename, speed, lifetime, amount, spread, rate, damage) {
        this.projectile = new Projectile(spritename, speed, lifetime);
        this.amount = amount;
        this.spread = spread;
        this.rate = rate;
        this.damage = damage

        this.fireTime = 0;
        this.ready = true;
    }

    shoot(now, direction) {
        // TODO amount, spread

        this.fireTime = now;

        // Populate a copy of the weapon's projectile
        let proj = this.projectile.clone();
        proj.phys.speed.x *= direction.x;
        proj.phys.speed.y *= direction.y;
        proj.damage = this.damage;

        this.ready = false;
        return proj;
    }

    load(now) {
        if (now - this.fireTime > this.rate) {
            this.ready = true;
        }
    }
}

var weapons = {
    starter: () => { return new Weapon("PlayerBulletSmall.png", 15, 1500, 1, 0, 250, 2); },
    peaShooter: () => { return new Weapon("EnemyBulletSmall.png", 7, 1000, 1, 0, 500, 4); }
};
