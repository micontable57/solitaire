const win = window;
const doc = document;
const body = doc.body;

/**
 * Object.assign polyfill
 * @param  {Object} target
 * @param  {Object} args
 * @return {Object}
 */
export const extend = function (r, t) {
  for (var e = Object(r), n = 1; n < arguments.length; n++) {
    var a = arguments[n];
    if (null != a)
      for (var o in a)
        Object.prototype.hasOwnProperty.call(a, o) && (e[o] = a[o]);
  }
  return e;
};

/**
 * Add event listener to target
 * @param  {Object} el
 * @param  {String} e
 * @param  {Function} fn
 */
export const on = function (el, e, fn) {
  el.addEventListener(e, fn, false);
};

/**
 * Iterator helper
 * @param  {(Array|Object)}   arr Any object, array or array-like collection.
 * @param  {Function} f   The callback function
 * @param  {Object}   s      Change the value of this
 * @return {Void}
 */
export const each = function (arr, fn, s) {
  if ("[object Object]" === Object.prototype.toString.call(arr)) {
    for (var d in arr) {
      if (Object.prototype.hasOwnProperty.call(arr, d)) {
        fn.call(s, d, arr[d]);
      }
    }
  } else {
    for (var e = 0, f = arr.length; e < f; e++) {
      fn.call(s, e, arr[e]);
    }
  }
};

/**
 * Mass assign style properties
 * @param  {Object} t
 * @param  {(String|Object)} e
 * @param  {String|Object}
 */
export const style = function (t, e) {
  var i = t && t.style,
    n = "[object Object]" === Object.prototype.toString.call(e);
  if (i) {
    if (!e) return win.getComputedStyle(t);
    n &&
      each(e, function (t, e) {
        (t in i || (t = "-webkit-" + t),
          (i[t] =
            e + ("string" == typeof e ? "" : "opacity" === t ? "" : "px")));
      });
  }
};

/**
 * Get an element's DOMRect relative to the document instead of the viewport.
 * @param  {Object} t   HTMLElement
 * @param  {Boolean} e  Include margins
 * @return {Object}     Formatted DOMRect copy
 */
export const rect = function (e) {
  var t = win,
    o = e.getBoundingClientRect(),
    b = doc.documentElement || body.parentNode || body,
    d = void 0 !== t.pageXOffset ? t.pageXOffset : b.scrollLeft,
    n = void 0 !== t.pageYOffset ? t.pageYOffset : b.scrollTop;
  return {
    left: o.left + d,
    top: o.top + n,
    height: Math.round(o.height),
    width: Math.round(o.width),
  };
};

/**
 * Get random integer between min and max
 * @param  {Number} min
 * @param  {Number} max
 * @return {Number}
 */
export const getRandomInt = function (min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
};

/**
 * Check if canvas is completely filled
 * @param  {CanvasRenderingContext2D} ctx
 * @param  {Number} x
 * @param  {Number} y
 * @param  {Number} w
 * @param  {Number} h
 * @return {Boolean}
 */
export function isFilled(ctx, x, y, w, h) {
  var idata = ctx.getImageData(x, y, w, h),
    u32 = new Uint32Array(idata.data.buffer),
    i = 0,
    len = u32.length;

  while (i < len) if (!u32[i++]) return false;
  return true;
}

export { win, doc, body };

export function getCardIndex(value, suit) {
  const suits = ["hearts", "spades", "diamonds", "clubs"];
  return suits.indexOf(suit) * 13 + (value - 1);
}

export function isVideo(url) {
  if (typeof url !== "string") return false;

  const videoExtensions = [".mp4", ".webm", ".ogg"];
  return videoExtensions.some((ext) => url.toLowerCase().endsWith(ext));
}
