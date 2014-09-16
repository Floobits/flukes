"use strict()";

/**
 * @param {Function} c
 * @param {Function} sc
 */
function inherit (c, sc) {
  c.prototype = Object.create(sc.prototype, {});
  c.super_ = sc;
  /** @Overrider */
  c.prototype.constructor = c;
}

module.exports = {
  inherit: inherit
};
