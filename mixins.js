
class Collidable {
    constructor(base) {
        if (base instanceof Rectangle) {
            this.rect = base;
        } else if (base instanceof Sprite) {
            // this.useSprite(base);
        } else {
            this.rect = new Rectangle(0, 0, 0, 0);
        }
    }

    useSprite(sprite) {
        this.rect = new Rectangle(
            sprite.pos.x,
            sprite.pos.y,
            sprite.image.width,
            sprite.image.height
        );
    }

    set pos(pos) {
        this.rect.x = pos.x;
        this.rect.y = pos.y;
    }

}

class Damageable {
    constructor(health, rattle) {
        this.health = health;
        this.rattle = rattle;
        this.rattled = false;
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) {
            this.health = 0;
            if (!this.rattled) {
                this.rattle();
                this.rattled = true;
            }
        }
        return this.health;
    }
}

class Destroyable {
    constructor(lifetime) {
        this.lifetime = lifetime > 0 ? lifetime : 0;
        this.ticking = lifetime ? true : false;
        this.alive = true;
        this.birthTime = null;
    }

    tick(now) {
        if (!this.birthTime) {
            this.birthTime = now;
        } else if (now - this.birthTime > this.lifetime) {
            this.alive = false;
        }
    }
}

class Movable {
    constructor(pos, speed) {
        this.pos = pos ? pos : {x: 0, y: 0};
        this.speed = speed ? speed : {x: 0, y: 0};
        this.onMove = function(newPos) { };
    }

    move() {
        if (this.speed.x || this.speed.y) {
            this.translate(this.speed);
        }
    }

    translate(delta) {
        this.moveTo({x: this.pos.x + delta.x, y: this.pos.y + delta.y});
    }

    moveTo(pos) {
        this.pos = pos
        this.onMove(pos);
    }

}
