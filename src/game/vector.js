/**
 * 2D Vector for physics calculations
 * @param {Number} x
 * @param {Number} y
 */
export function Vector(x, y) {
  this.x = x;
  this.y = y;
}

Vector.prototype = {
  add: function (v) {
    (this.x += v.x), (this.y += v.y);
  },
};
