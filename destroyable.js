
class Destroyable {
    constructor(lifetime) {
        this.lifetime = lifetime < 0 ? 0 : lifetime;
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

