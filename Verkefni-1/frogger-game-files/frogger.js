"use strict";

// Uniform breytur sem tengjast liturunum.
var colorLoc;     // Litur.
var positionLoc;  // Staðsetning.
var sinCosLoc;    // Snúningur.


/**
 * Fall sem keyrir í upphafi.
 */
window.onload = function init() 
{
  // Hlaða inn canvas hlutanum.
  canvas = document.getElementById("gl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  //  Stilla WebGL.
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  //  Hlaða inn liturunum og upphafsstilla.
  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // Hlaða gögnunum inn í grafíkkortið.
  var bufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);

  // Upphafsstilla leikinn.
  initGame();

  // Tengja litarabreyturnar við gagnabufferinn.
  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  // Finna staðsetningu uniform breytanna í liturunum.
  colorLoc = gl.getUniformLocation(program, "fColor");
  positionLoc = gl.getUniformLocation(program, "translation");
  sinCosLoc = gl.getUniformLocation(program, "sinCos");

  // Virkja hreyfingu leikmanns.
  movement();

  // Breyta stillingum leiks frá HTML.
  changeParams();

  // Teikna á skjáinn.
  const renderScreen = setInterval(render, 10);
};


/**
 * Setja gögn inn í bufferinn.
 */
function resetBuffer()
{
  gl.bufferData(gl.ARRAY_BUFFER, flatten(gameBoard), gl.STATIC_DRAW);
}


/**
 * Teiknar bakgrunn leikborðsins.
 */
function renderBackground() 
{
  // Teikna gangstétt.
  gl.uniform4fv(colorLoc, GAME_COLOURS.gray);

  for (let i = 0; i < 2; i++) 
  {
    gl.uniform2fv(positionLoc, vec2(0, (((LANES - 1) * laneSize) * i)));
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  // Teikna vegmerkingar.
  gl.uniform2fv(positionLoc, vec2(0.0, 0.0));
  gl.uniform4fv(colorLoc, GAME_COLOURS.yellow);

  for (let i = 0; i < (LANES - 1); i++) 
  {
    gl.uniform2fv(positionLoc, vec2(0, laneSize * i));
    gl.drawArrays(gl.TRIANGLES, 6, 6);
  }
}


/**
 * Teiknar bíla á skjáinn.
 */
function renderCars() 
{
  for (let i = 0; i < (LANES - 2); i++) {
    for (let j = 0; j < CARS_PER_LANE; j++) 
    {
      gl.uniform4fv(colorLoc, carColours[i][j]); // Nær í lit.

      carsX[i][j] = carsX[i][j] + CAR_SPEED[i];  // Reiknar tilfærslu.
      if (carsX[i][j] > 1.6) carsX[i][j] = -1.5; // Ef bíll er kominn fyrir utan mörk þá færist hann til baka.
      else if (carsX[i][j] < -1.6) carsX[i][j] = 1.5;

      // Athuga árekstur.
      collisionDetection(carsX[i][j], i);

      gl.uniform2fv(positionLoc, vec2(carsX[i][j], laneSize * i));
      gl.drawArrays(gl.TRIANGLES, 15, 6);
    }
  }
}


/**
 * Teiknar leikmanninn.
 */
function renderPlayer() 
{
  gl.uniform4fv(colorLoc, GAME_COLOURS.green);
  gl.uniform2fv(positionLoc, vec2(((currentPlayerLane[0] * laneSize) + playerOffset), 
                                  ((currentPlayerLane[1] * laneSize) + playerOffset)));
  gl.uniform2fv(sinCosLoc, frogSinCos);

  gl.drawArrays(gl.TRIANGLES, 12, 3);
}


/**
 * Teiknar stigafjöldann.
 */
function renderPoints() 
{
  for (let i = 0; i < points; i++) 
  {
    gl.uniform2fv(sinCosLoc, vec2(0.0, 1.0));
    gl.uniform4fv(colorLoc, GAME_COLOURS.red);
    gl.uniform2fv(positionLoc, vec2(i * 0.03, 0.0));

    gl.drawArrays(gl.TRIANGLES, 21, 6);
  }
}


/**
 * Teiknar lífin.
 */
function renderHearts() 
{
  for (let i = 0; i < livesLeft; i++) 
  {
    gl.uniform2fv(sinCosLoc, vec2(0.0, 1.0));
    gl.uniform4fv(colorLoc, GAME_COLOURS.red);
    gl.uniform2fv(positionLoc, vec2(i * -0.08, 0.0));

    gl.drawArrays(gl.TRIANGLES, 27, 9);
  }
}


/**
 * Teiknar leikinn.
 */
function render() 
{
  // Stilla hnúta og bútalitarann fyrir fyrstu teiknun.
  gl.uniform2fv(sinCosLoc, vec2(0.0, 1.0));

  // Hreinsa teikniborðið
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Teikna bakgrunn.
  renderBackground();

  // Teikna bíla.
  renderCars();

  gl.uniform2fv(positionLoc, vec2(0.0, 0.0));

  // Teikna leikmann.
  renderPlayer();

  // Teikna stig.
  renderPoints();

  // Teikna líf.
  renderHearts();
}