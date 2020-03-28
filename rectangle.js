
class Rectangle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    // SO 2752349
    intersect(other) {
       return !(other.left > this.right ||
                other.right < this.left ||
                other.top > this.bottom ||
                other.bottom < this.top);
    }
}
