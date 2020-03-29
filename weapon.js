
function weaponAngle(pos1, pos2) {
    return (Math.PI / 2) - Math.atan2(pos2.y - pos1.y, pos2.x - pos1.x);
}

function weaponDistance(pos1, pos2) {
    return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
}

function variance(amount) {
    return amount * ((Math.random() * 2) - 1);
}

class Weapon {
    constructor(spritename, dropname,
            speed, speedVar,
            lifetime, lifetimeVar,
            amount, amountVar,
            spread, spreadVar,
            rate,
            damage) {
        this.projectile = new Projectile(spritename, speed, lifetime);
        this.amount = amount;
        this.spread = spread;
        this.rate = rate;
        this.damage = damage

        this.dropname = dropname;

        this.speedVar = speedVar;
        this.lifetimeVar = lifetimeVar;
        this.amountVar = amountVar;
        this.spreadVar = spreadVar;

        this.fireTime = 0;
        this.ready = true;
    }

    shoot(now, direction) {
        this.fireTime = now;

        // Populate a copy of the weapon's projectile
        let proj = this.projectile.clone();

        let spd = variance(this.speedVar);
        proj.phys.speed.x = (proj.phys.speed.x + spd) * direction.x;
        proj.phys.speed.y = (proj.phys.speed.y + spd) * direction.y;

        proj.heart.lifetime += variance(this.lifetimeVar);

        proj.damage = this.damage;
        return proj;
    }

    load(now) {
        if (now - this.fireTime > this.rate) {
            this.ready = true;
        }
    }
}

//spritename, speed, speedVar, lifetime, lifetimeVar, amount, amountVar, spread, spreadVar, rate, damage
var weapons = {
    starter:    () => { return new Weapon("PlayerBullet_32.png",     "Weapon_1_Pistol.png",         15, 1,  1500, 0,    1,  0,   0.1,        0,    555,  2); },
    peaShooter:    () => { return new Weapon("EnemyBulletSmall.png", "Weapon_1_Pistol.png",         10, 2,  1500, 0,    1,  0,   0.2,        0,    2222, 4); },
    laser:      () => { return new Weapon("EnemyBulletSmall.png",    "Weapon_3_Laser.png",          15, 5,  1500, 250,  15, 0,   0,          0,    3500, 2); },
    shotgun:    () => { return new Weapon("EnemyBulletSmall.png",    "Weapon_2_Shotgun.png",        7,  1,  1111, 0,    4,  1,   Math.PI/8,  0,    1000, 4); },
    homing:     () => { return new Weapon("EnemyBulletSmall.png",    "Weapon_5_HomingMissiles.png", 30, 5,  1000, 0,    1,  0,   Math.PI/32, 0,    2222, 4); },
    lawnMower: () => { return new Weapon("EnemyBulletSmall.png",     "Weapon_7_Lawnmower.png",      10, 5,  2000, 1000, 15, 5,   Math.PI/8,  0,    1234, 4); }
};
