
class Rectangle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = "red";
    }

    intersect(other) {
        if (this.width <= 0 || this.height <= 0 || other.width <= 0 || other.height <= 0) {
            return false;
        }
        return !(this.x > other.x + other.width ||
                 this.x + this.width < other.x  ||
                 this.y + this.height < other.y ||
                 this.y > other.y + other.height);
    }
}
