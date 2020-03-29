
function weaponAngle(pos1, pos2) {
    return (Math.PI / 2) - Math.atan2(pos2.y - pos1.y, pos2.x - pos1.x);
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
