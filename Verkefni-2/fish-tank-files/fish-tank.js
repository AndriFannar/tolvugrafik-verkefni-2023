"use strict";

/**
 * Verkefni 2 í TÖL105M Tölvugrafík.
 *
 * @author Andri Fannar Kristjánsson, afk6@hi.is
 */

var canvas;
var gl;

var colourBuffer;
var vertexBuffer;

var vColour;
var mvLoc;


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
    colourBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, colourBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cubeColours), gl.STATIC_DRAW );

    vColour = gl.getAttribLocation( program, "vColour" );
    gl.vertexAttribPointer( vColour, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColour );

    vertexBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cubePoints), gl.STATIC_DRAW );

    // Tengja litarabreyturnar við gagnabufferinn.
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var projectionLoc = gl.getUniformLocation(program, "projection");
    var projection = perspective(50.0, 1, 0.2, 100.0);
    gl.uniform4fv ( projectionLoc, flatten(projection));

    mvLoc = gl.getUniformLocation(program, "modelView");

    // Teikna á skjáinn.
    render();
};


/**
 * Teiknar leikinn.
 */
function render()
{
    // Hreinsa teikniborðið
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var mv = lookAt( vec3(0.0, 0.0, -4.0), vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0) );
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv));

    gl.bindBuffer(gl.ARRAY_BUFFER, colourBuffer);
    gl.vertexAttribPointer( colourBuffer, 4, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer( vertexBuffer, 3, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, cubePoints.length);

    requestAnimFrame( render );

}