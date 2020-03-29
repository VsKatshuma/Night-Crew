
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

class Behavior {
    constructor() {
        this.modes = {
            idle: Math.random(), // walking around
            angry: Math.random(), // attack + follow
            curious: Math.random() // follow
        };

        var keys = Object.keys(this.modes);
        this.mode = keys[keys.length * Math.random() << 0];
        this.rollInterval = Math.random() * 10000 + 5000

        this.aggroRadius = this.rollInterval / 20 + 100;
        this.followRadius = this.rollInterval / 50 + 100;
        this.moveSpeed = Math.random() * 3 + 0.5;
        this.moveDirection = {x: Math.random(), y: Math.random()};
        this.stamp = 0;
        this.roll(Date.now(), true);
    }

    roll(time, force) {
        if (time - this.stamp > this.rollInterval) {
            this.stamp = time;
            if (Math.random() > 0.80 && !force) {
                return;
            }

            let rand = Math.random();
            let roll = rand + 0.1;
            this.moveDirection = {x: Math.sin(2 * Math.PI * rand),
                                  y: Math.cos(2 * Math.PI * rand)};
            let mode = this.mode;
            let lowest = 10;
            for (var m in this.modes) {
                let modeRoll = this.modes[m] + roll;
                if (modeRoll > 1.0 && modeRoll < lowest) {
                    lowest = modeRoll;
                    this.mode = m;
                }
            }
        }
    }

};

class Monster {
    constructor(spritefile, health, color) {
        this.phys = new Movable();
        this.body = new Collidable();

        this.color = color;
        this.sprite = new Sprite(spritefile, () => { this.body.useSprite(this.sprite) });
        this.sprite.onDraw = (context) => {
            context.shadowColor = this.color;
            context.shadowBlur = 25;
        };

        this.heart = new Destroyable();
        var onDeath = () => {
            death.play();
            this.heart.alive = false;
        };
        this.health = new Damageable(health, onDeath);

        this.weapon = weapons.peaShooter();
        this.aggroRadius = 400;
        this.behavior = new Behavior();

        this.phys.onMove = (pos) => {
            this.body.pos = pos;
        };
    }

    behaviorAgainst(other) {
        let distanceTo = weaponDistance(this.phys.pos, other.phys.pos);
        let shouldFollow = this.behavior.mode !== 'idle' && distanceTo > this.behavior.followRadius;
        let shouldAttack = this.behavior.mode === 'angry' && distanceTo < this.behavior.aggroRadius;
        return {follow: shouldFollow, attack: shouldAttack};
    }

    update(now) {
        this.phys.move();
        return this.heart.alive;
    }
}
