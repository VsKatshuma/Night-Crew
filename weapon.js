
function weaponAngle(x1, y1, x2, y2) {
    return (Math.PI / 2) - Math.atan2(y2 - y1, x2 - x1);
}

class Weapon {
    constructor(projectile, amount, spread, rate, damage) {
        this.projectile = projectile;
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
