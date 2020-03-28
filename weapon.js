
class Weapon {
    constructor(projectile, amount, spread, rate) {
        this.projectile = projectile;
        this.amount = amount;
        this.spread = spread;
        this.rate = rate;

        this.fireTime = 0;
        this.ready = true;
    }

    shoot(now, direction) {
        // TODO amount, spread

        this.fireTime = now;

        // Populate a copy of the weapon's projectile
        var proj = this.projectile.clone();
        proj.speed.x *= direction.x;
        proj.speed.y *= direction.y;

        this.ready = false;
        return proj;
    }

    load(now) {
        if (now - this.fireTime > this.rate) {
            this.ready = true;
        }
    }
}
