/**
 * @module Lights, Camera
 * @submodule Material
 * @for p5
 * @requires core
 */

'use strict';

var p5 = require('../core/core');
//require('./p5.Texture');

/**
 * Normal material for geometry. You can view all
 * possible materials in this
 * <a href="https://p5js.org/examples/3d-materials.html">example</a>.
 * @method normalMaterial
 * @return {p5}                the p5 object
 * @example
 * <div>
 * <code>
 * function setup(){
 *   createCanvas(100, 100, WEBGL);
 * }
 *
 * function draw(){
 *  background(200);
 *  normalMaterial();
 *  sphere(50);
 * }
 * </code>
 * </div>
 *
 * @alt
 * Red, green and blue gradient.
 *
 */
p5.prototype.normalMaterial = function(){
  var shaderProgram =
  this._renderer._getShader('normalVert', 'normalFrag');
  this._renderer._useShader(shaderProgram);
  return this;
};

/**
 * Texture for geometry.  You can view other possible materials in this
 * <a href="https://p5js.org/examples/3d-materials.html">example</a>.
 * @method texture
 * @param {p5.Image | p5.MediaElement | p5.Graphics} tex 2-dimensional graphics
 *                    to render as texture
 * @return {p5}                the p5 object
 * @example
 * <div>
 * <code>
 * var img;
 * function setup(){
 *   createCanvas(100, 100, WEBGL);
 *   img = loadImage("assets/laDefense.jpg");
 * }
 *
 * function draw(){
 *   background(0);
 *   rotateZ(frameCount * 0.01);
 *   rotateX(frameCount * 0.01);
 *   rotateY(frameCount * 0.01);
 *   //pass image as texture
 *   texture(img);
 *   box(200, 200, 200);
 * }
 * </code>
 * </div>
 *
 * <div>
 * <code>
 * var pg;
 * function setup(){
 *   createCanvas(100, 100, WEBGL);
 *   pg = createGraphics(200, 200);
 *   pg.textSize(100);
 * }
 *
 * function draw(){
 *   background(0);
 *   pg.background(255);
 *   pg.text('hello!', 0, 100);
 *   //pass image as texture
 *   texture(pg);
 *   plane(200);
 * }
 * </code>
 * </div>
 *
 * <div>
 * <code>
 * var vid;
 * function preload(){
 *   vid = createVideo("assets/fingers.mov");
 *   vid.hide();
 *   vid.loop();
 * }
 * function setup(){
 *   createCanvas(100, 100, WEBGL);
 * }
 *
 * function draw(){
 *   background(0);
 *   //pass video frame as texture
 *   texture(vid);
 *   plane(200);
 * }
 * </code>
 * </div>
 *
 * @alt
 * Rotating view of many images umbrella and grid roof on a 3d plane
 * black canvas
 * black canvas
 *
 */
p5.prototype.texture = function(){
  var args = new Array(arguments.length);
  for (var i = 0; i < args.length; ++i) {
    args[i] = arguments[i];
  }
  var gl = this._renderer.GL;
  var renderer = this._renderer;
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  renderer.drawMode = 'texture';
  var shaderProgram = renderer._getShader('lightVert',
    'lightTextureFrag');
  renderer._useShader(shaderProgram);
  renderer._setUniform('uSpecular', false);
  
  var textureData;
  var sampler = renderer.defaultSampler;
  if(args.length > 0){
    if(args[1] instanceof p5.Sampler){
      sampler = args[1];
    }
    if(args[1] === 'sprite'){
      sampler = renderer.pointSampler;
    }
    else if(args[1] === 'repeat'){
      sampler = renderer.repeatSampler;
    }
  }
  
  //if argument is not already a texture
  //create a new one
  if(!args[0].isTexture){
    if (args[0] instanceof p5.Image) {
      textureData = args[0].canvas;
    }
    //if param is a video
    else if (typeof p5.MediaElement !== 'undefined' &&
            args[0] instanceof p5.MediaElement){
      if(!args[0].loadedmetadata) {return;}
      textureData = args[0].elt;
    }
    //used with offscreen 2d graphics renderer
    else if(args[0] instanceof p5.Graphics){
      textureData = args[0].elt;
    }
    var tex = gl.createTexture();
    args[0]._setProperty('tex', tex);
    args[0]._setProperty('isTexture', true);
    //renderer._bind.call(this, tex, textureData, sampler);
    renderer._bind(tex, textureData, sampler);
  }
  else {
    if(args[0] instanceof p5.Graphics ||
      (typeof p5.MediaElement !== 'undefined' &&
      args[0] instanceof p5.MediaElement)){
      textureData = args[0].elt;
    }
    else if(args[0] instanceof p5.Image){
      textureData = args[0].canvas;
    }
    renderer._bind(args[0].tex, textureData, sampler);
    //renderer._bind.call(this, args[0].tex, textureData, sampler);
  }

  //this is where we'd activate multi textures
  //@todo multi textures can be done in the _setUniform function
  renderer._setUniform('isTexture', true);
  renderer._setUniform('uSampler', args[0].tex);

  return this;
};

/**
 * Texture Util functions
 */
p5.RendererGL.prototype._convertFilter = function(mode){
  var gl = this.GL;
  if(mode === 'smooth') return gl.LINEAR;
  if(mode === 'sharp') return gl.NEAREST;
  return gl.LINEAR; //@todo warning instead?
}

p5.RendererGL.prototype._convertWrapMode = function(mode){
  var gl = this.GL;
  if(mode === 'clamp') return gl.CLAMP_TO_EDGE;
  if(mode === 'repeat') return gl.REPEAT;
  return gl.CLAMP_TO_EDGE; //@todo warning instead?
}

p5.RendererGL.prototype._bind = function(tex, data, sampler){
  var gl = this.GL;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0,
    gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data);
  
  var minFilter = this._convertFilter(sampler.minFilter);
  var magFilter = this._convertFilter(sampler.magFilter);
  var wrapX = this._convertWrapMode(sampler.wrapX);
  var wrapY = this._convertWrapMode(sampler.wrapY);

  var gl = this.GL;
  gl.texParameteri(gl.TEXTURE_2D,
  gl.TEXTURE_MAG_FILTER, magFilter);
  gl.texParameteri(gl.TEXTURE_2D,
  gl.TEXTURE_MIN_FILTER, minFilter);
  gl.texParameteri(gl.TEXTURE_2D,
  gl.TEXTURE_WRAP_S, wrapX);
  gl.texParameteri(gl.TEXTURE_2D,
  gl.TEXTURE_WRAP_T, wrapY);

  gl.bindTexture(gl.TEXTURE_2D, null);
};

/**
 * Checks whether val is a pot
 * more info on power of 2 here:
 * https://www.opengl.org/wiki/NPOT_Texture
 * @param  {Number}  value
 * @return {Boolean}
 */
// function _isPowerOf2 (value){
//   return (value & (value - 1)) === 0;
// }

/**
 * returns the next highest power of 2 value
 * @param  {Number} value [description]
 * @return {Number}       [description]
 */
// function _nextHighestPOT (value){
//   --value;
//   for (var i = 1; i < 32; i <<= 1) {
//     value = value | value >> i;
//   }
//   return value + 1;

/**
 * Ambient material for geometry with a given color. You can view all
 * possible materials in this
 * <a href="https://p5js.org/examples/3d-materials.html">example</a>.
 * @method  ambientMaterial
 * @param  {Number|Array|String|p5.Color} v1  gray value,
 * red or hue value (depending on the current color mode),
 * or color Array, or CSS color string
 * @param  {Number}            [v2] optional: green or saturation value
 * @param  {Number}            [v3] optional: blue or brightness value
 * @param  {Number}            [a]  optional: opacity
* @return {p5}                 the p5 object
 * @example
 * <div>
 * <code>
 * function setup(){
 *   createCanvas(100, 100, WEBGL);
 * }
 * function draw(){
 *  background(0);
 *  ambientLight(100);
 *  pointLight(250, 250, 250, 100, 100, 0);
 *  ambientMaterial(250);
 *  sphere(50);
 * }
 * </code>
 * </div>
 *
 * @alt
 * radiating light source from top right of canvas
 *
 */
p5.prototype.ambientMaterial = function(v1, v2, v3, a) {
  var shaderProgram =
    this._renderer._getShader('lightVert', 'lightTextureFrag');

  this._renderer._useShader(shaderProgram);

  var colors = this._renderer._applyColorBlend.apply(this._renderer, arguments);
  this._renderer._setUniform('uMaterialColor', colors);
  this._renderer._setUniform('uSpecular', false);
  this._renderer._setUniform('isTexture', false);
  return this;
};

p5.RendererGL.prototype._createEmptyTexture = function() {
  if(this.emptyTexture === null) {
    var gl = this.GL;
    var data = new Uint8Array([1,1,1,1]);
    this.emptyTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.emptyTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0,
      gl.RGBA, gl.UNSIGNED_BYTE, data);
  }
};

/**
 * Specular material for geometry with a given color. You can view all
 * possible materials in this
 * <a href="https://p5js.org/examples/3d-materials.html">example</a>.
 * @method specularMaterial
 * @param  {Number|Array|String|p5.Color} v1  gray value,
 * red or hue value (depending on the current color mode),
 * or color Array, or CSS color string
 * @param  {Number}            [v2] optional: green or saturation value
 * @param  {Number}            [v3] optional: blue or brightness value
 * @param  {Number}            [a]  optional: opacity
 * @return {p5}                the p5 object
 * @example
 * <div>
 * <code>
 * function setup(){
 *   createCanvas(100, 100, WEBGL);
 * }
 * function draw(){
 *  background(0);
 *  ambientLight(100);
 *  pointLight(250, 250, 250, 100, 100, 0);
 *  specularMaterial(250);
 *  sphere(50);
 * }
 * </code>
 * </div>
 *
 * @alt
 * diffused radiating light source from top right of canvas
 *
 */
p5.prototype.specularMaterial = function(v1, v2, v3, a) {
  var shaderProgram =
    this._renderer._getShader('lightVert', 'lightTextureFrag');
  this._renderer._useShader(shaderProgram);

  var colors = this._renderer._applyColorBlend.apply(this._renderer, arguments);
  this._renderer._setUniform('uMaterialColor', colors);
  this._renderer._setUniform('uSpecular', true);
  this._renderer._setUniform('isTexture', false);
  return this;
};

/**
 * @private blends colors according to color components.
 * If alpha value is less than 1, we need to enable blending
 * on our gl context.  Otherwise opaque objects need to a depthMask.
 * @param  {Number} v1 [description]
 * @param  {Number} v2 [description]
 * @param  {Number} v3 [description]
 * @param  {Number} a  [description]
 * @return {[Number]}  Normalized numbers array
 */
p5.RendererGL.prototype._applyColorBlend = function(v1,v2,v3,a){
  var gl = this.GL;
  var color = this._pInst.color.apply(
    this._pInst, arguments);
  var colors = color._array;
  if(colors[colors.length-1] < 1.0){
    gl.depthMask(false);
    gl.enable(gl.BLEND);
    gl.blendEquation( gl.FUNC_ADD );
    gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
  } else {
    gl.depthMask(true);
    gl.disable(gl.BLEND);
  }
  return colors;
};

module.exports = p5;