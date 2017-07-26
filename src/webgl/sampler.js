'use strict';

var p5 = require('../core/core');

/**
 * p5 Geometry class
 * @class p5.Geometry
 * @constructor
 * @param  {Function | Object} vertData callback function or Object
 *                     containing routine(s) for vertex data generation
 * @param  {Number} [detailX] number of vertices on horizontal surface
 * @param  {Number} [detailY] number of vertices on horizontal surface
 * @param {Function} [callback] function to call upon object instantiation.
 *
 */
p5.Sampler = function
(minFilter, magFilter, wrapX, wrapY){
  this.minFilter = minFilter;
  this.magFilter =  magFilter;
  this.wrapX = wrapX;
  this.wrapY = wrapY;
  return this;
};