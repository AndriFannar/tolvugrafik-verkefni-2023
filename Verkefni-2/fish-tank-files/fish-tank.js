"use strict";

/**
 * Verkefni 2 í TÖL105M Tölvugrafík.
 *
 * @author Andri Fannar Kristjánsson, afk6@hi.is
 */

var canvas;
var gl;

var vColour;


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

    createCube(0.5, vec4(1.0, 0.0, 0.0, 1.0));

    //  Stilla WebGL.
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    //  Hlaða inn liturunum og upphafsstilla.
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Hlaða gögnunum inn í grafíkkortið.
    var colourBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, colourBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cubeColours), gl.STATIC_DRAW );

    vColour = gl.getAttribLocation( program, vColour );
    gl.vertexAttribPointer( vColour, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColour );

    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cubePoints), gl.STATIC_DRAW );

    // Tengja litarabreyturnar við gagnabufferinn.
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Teikna á skjáinn.
    render();
};


/**
 * Teiknar leikinn.
 */
function render()
{
    // Hreinsa teikniborðið
    gl.clear(gl.COLOR_BUFFER_BIT);
}