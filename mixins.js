
class Collidable {
    constructor(base) {
        if (base instanceof Rectangle) {
            this.rect = base;
        }
        else if (base instanceof Sprite) {
            this.useSprite(base);
        }
        else {
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

    setPosition(x, y) {
        this.rect.x = x;
        this.rect.y = y;
    }

    drawTo(context) {
        context.beginPath();
        context.lineWidth = "3";
        context.strokeStyle = "red";
        context.rect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
        context.stroke();
    }

}

class Damageable {
    constructor(health, rattle) {
        this.health = health
        this.rattle = rattle;
        this.rattled = false;
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) {
            this.health = 0;
            if (!this.rattled) {
                this.rattle()
                this.rattled = true
            }
        }
        return this.health
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
        }
        else if ((now - this.birthTime) > this.lifetime) {
            this.alive = false;
        }
    }

}

