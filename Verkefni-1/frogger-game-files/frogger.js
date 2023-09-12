"use strict";

var canvas;
var gl;

// Heildar stigafjöldi leikmanns.
var points = 0;

// Staðsetning hnúta sem á að teikna.
var gameBoard = [];

// Stærð akgreinanna.
var laneSize = 0.27;

// Uniform breyta sem stjórnar lit á hlutunum.
var colorLoc;

// Uniform breyta sem stjórnar staðsetningu hluta.
var positionLoc;

// Uniform breyta sem stjórnar snúningi hluta.
var sinCosLoc;

// Sínus og Kósínus gildin sem á að senda á hnútalitarann (snúningur hlutarins).
var frogSinCos = vec2(0.0, 1.0);

// Er froskurinn á uppleið.
var goingUp = true;

// Staðsetning frosksins í hnitum.
var frogPos = [0.0, -0.87];

// Líf leikmanns.
var life = 3;

// Hraði bílanna.
var carSpeed = [0.004, -0.005, 0.003, -0.0045, 0.0055];

var carSinCos = vec2(0.0, 1.0);

// Staðsetning bílanna.
var carsX = [
  [0, -1.5],
  [0, 1.5],
  [0, -1.5],
  [0, 1.5],
  [0, -1.5],
];

var carColours = [
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0],
];

// Litir notaðir í forritinu.
var gameColours = {
  gray: vec4(0.671, 0.671, 0.671, 1.0),
  yellow: vec4(0.929, 0.812, 0.078, 1.0),
  green: vec4(0.039, 0.639, 0.004, 1.0),
  red: vec4(1.0, 0.2, 0.2, 1.0),
};

/**
 * Fall sem upphafsstillir WebGL og þar með leikinn.
 */
window.onload = function init() {
  // Hlaða inn canvas hlutanum.
  canvas = document.getElementById("gl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  // Upphafsstaðsetningar leikhluta á leikborði fyrir breytingar.
  gameBoard = [
    // Gangstétt
    vec2(-1.0, -0.73),
    vec2(-1.0, -1),
    vec2(1.0, -0.73),
    vec2(-1.0, -1),
    vec2(1.0, -0.73),
    vec2(1.0, -1),

    // Vegmerkingar
    vec2(-1.0, -0.72),
    vec2(-1.0, -0.74),
    vec2(1.0, -0.72),
    vec2(-1.0, -0.74),
    vec2(1.0, -0.72),
    vec2(1.0, -0.74),

    //Froskur
    vec2(0.0, 0.11),
    vec2(-0.1, -0.1),
    vec2(0.1, -0.1),

    // Bíll
    vec2(-0.2, -0.49),
    vec2(-0.2, -0.7),
    vec2(0.2, -0.49),
    vec2(-0.2, -0.7),
    vec2(0.2, -0.49),
    vec2(0.2, -0.7),

    // Stig
    vec2(-0.99, 0.99),
    vec2(-0.99, 0.92),
    vec2(-0.97, 0.99),
    vec2(-0.99, 0.92),
    vec2(-0.97, 0.99),
    vec2(-0.97, 0.92),

    // Hjarta
    vec2(0.95, 0.91),
    vec2(0.91, 0.97),
    vec2(0.99, 0.97),
    vec2(0.91, 0.97),
    vec2(0.93, 0.99),
    vec2(0.95, 0.97),
    vec2(0.95, 0.97),
    vec2(0.97, 0.99),
    vec2(0.99, 0.97),
  ];

  //  Stillum WebGL.
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  //  Hlaða inn liturunum og upphafsstilla.
  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // Hlaða gögnunum inn í grafíkkortið.
  var bufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(gameBoard), gl.STATIC_DRAW);

  // Tengja litarabreyturnar við gagnabufferinn.
  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  // Finna staðsetningu uniform breytanna í liturunum.
  colorLoc = gl.getUniformLocation(program, "fColor");
  positionLoc = gl.getUniformLocation(program, "translation");
  sinCosLoc = gl.getUniformLocation(program, "sinCos");

  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 2; j++) {
      carColours[i][j] = randomColour();
    }
  }

  // Virkja hreyfingu leikmanns.
  movement();

  // Teikna á skjáinn.
  render();
};

/**
 * Fall sem sér um hreyfingu leikmanns.
 */
function movement() {
  window.addEventListener("keydown", function (e) {
    switch (e.key) {
      case "ArrowUp":
        frogSinCos[0] = Math.sin(0);
        frogSinCos[1] = Math.cos(0);
        // Athuga hvort leikmaður sé kominn út á enda.
        if (frogPos[1] === 0.75) break;
        frogPos[1] = parseFloat((frogPos[1] + laneSize).toFixed(2)); // Færa leikmann áfram um eina akgrein.
        if (frogPos[1] === 0.75 && goingUp) updatePoints(); // Ef svo er þá á hann ekki að færast lengra.
        break;

      case "ArrowDown":
        frogSinCos[0] = Math.sin(Math.PI);
        frogSinCos[1] = Math.cos(Math.PI);
        if (frogPos[1] === -0.87) break;
        frogPos[1] = parseFloat((frogPos[1] - laneSize).toFixed(2));
        if (frogPos[1] === -0.87 && !goingUp) updatePoints();
        break;

      case "ArrowLeft":
        frogSinCos[0] = Math.sin(Math.PI / 2);
        frogSinCos[1] = Math.cos(Math.PI / 2);
        if (frogPos[0] === -0.81) break;
        frogPos[0] = parseFloat((frogPos[0] - laneSize).toFixed(2));
        break;

      case "ArrowRight":
        frogSinCos[0] = Math.sin((3 * Math.PI) / 2);
        frogSinCos[1] = Math.cos((3 * Math.PI) / 2);
        if (frogPos[0] === 0.81) break;
        frogPos[0] = parseFloat((frogPos[0] + laneSize).toFixed(2));
        break;
    }
  });
}

/**
 * Fall sem sér um að snúa leikmanni við.
 */
function updatePoints() {
  // Auka stigafjölda.
  points++;
  goingUp = !goingUp;

  if (points > 10) restart();
}

function collisionDetection(car, carLane) {
  if (
    parseInt(Math.round(frogPos[1] / laneSize)) === carLane - 2 &&
    frogPos[0] < car + 0.3 &&
    frogPos[0] > car - 0.3
  ) {
    if (goingUp) frogPos[1] = -0.87;
    else frogPos[1] = 0.75;
    if (--life === 0) restart();
  }
}

function restart() {
  life = 3;
  points = 0;
  frogPos = [0.0, -0.87];
  frogSinCos = vec2(0.0, 1.0);
}

function randomColour() {
  return vec4(
    Math.random() / 0.7 + 0.3,
    Math.random() / 0.7 + 0.3,
    Math.random() / 0.7 + 0.3,
    1.0
  );
}

function renderBackground() {
  gl.uniform4fv(colorLoc, gameColours.gray);

  for (let i = 0; i < 2; i++) {
    gl.uniform2fv(positionLoc, vec2(0, 1.62 * i));
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  gl.uniform2fv(positionLoc, vec2(0.0, 0.0));
  gl.uniform4fv(colorLoc, gameColours.yellow);

  // Teikna vegamerkingar.
  for (let i = 0; i < 6; i++) {
    gl.uniform2fv(positionLoc, vec2(0, laneSize * i));
    gl.drawArrays(gl.TRIANGLES, 6, 6);
  }
}

function renderCars() {
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 2; j++) {
      gl.uniform4fv(colorLoc, carColours[i][j]);

      carsX[i][j] = carsX[i][j] + carSpeed[i];
      if (carsX[i][j] > 1.6) carsX[i][j] = -1.5;
      else if (carsX[i][j] < -1.6) carsX[i][j] = 1.5;

      collisionDetection(carsX[i][j], i);

      gl.uniform2fv(positionLoc, vec2(carsX[i][j], laneSize * i));
      gl.drawArrays(gl.TRIANGLES, 15, 6);
    }
  }
}

function renderPlayer() {
  gl.uniform4fv(colorLoc, gameColours.green);
  gl.uniform2fv(positionLoc, frogPos);
  gl.uniform2fv(sinCosLoc, frogSinCos);
  gl.drawArrays(gl.TRIANGLES, 12, 3);
}

function renderPoints() {
  for (let i = 0; i < points; i++) {
    gl.uniform2fv(sinCosLoc, vec2(0.0, 1.0));

    gl.uniform4fv(colorLoc, gameColours.red);

    gl.uniform2fv(positionLoc, vec2(i * 0.03, 0.0));
    gl.drawArrays(gl.TRIANGLES, 21, 6);
  }
}

function renderHearts() {
  for (let i = 0; i < life; i++) {
    gl.uniform2fv(sinCosLoc, vec2(0.0, 1.0));

    gl.uniform4fv(colorLoc, gameColours.red);

    gl.uniform2fv(positionLoc, vec2(i * -0.08, 0.0));
    gl.drawArrays(gl.TRIANGLES, 27, 9);
  }
}

function render() {
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

  renderPoints();

  renderHearts();

  window.requestAnimFrame(render);
}
