"use strict";

/**
 * Verkefni 2 í TÖL105M Tölvugrafík.
 *
 * @author Andri Fannar Kristjánsson, afk6@hi.is
 */

var canvas;
var gl;

var cubeColourBuffer;
var cubeVertexBuffer;

var fishColourBuffer;
var fishVertexBuffer;

var vColour;
var vPosition;
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

    createCube(0.5, [vec4(0.4, 0.97, 0.83, 0.6)]);
    createFish( 1, vec4(1, 0, 0, 1), vec4(0, 1, 0, 1), vec4(0, 0, 1, 1));

    //  Stilla WebGL.
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.32, 0.4, 0.76, 0.76);

    gl.enable(gl.DEPTH_TEST);

    //  Hlaða inn liturunum og upphafsstilla.
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    vColour = gl.getAttribLocation( program, "vColour" );
    gl.vertexAttribPointer( vColour, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColour );

    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Hlaða gögnunum inn í grafíkkortið.
    cubeColourBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cubeColourBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cubeColours), gl.STATIC_DRAW );

    console.log(cubeColours);

    cubeVertexBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cubeVertexBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cubePoints), gl.STATIC_DRAW );

    console.log(cubePoints);

    fishColourBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, fishColourBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(fishColours), gl.STATIC_DRAW );

    console.log(fishColours);

    fishVertexBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, fishVertexBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(fishPoints), gl.STATIC_DRAW );

    console.log(fishPoints);

    var projectionLoc = gl.getUniformLocation(program, "projection");
    var projection = perspective(90.0, 1.0, 0.1, 100.0);
    gl.uniformMatrix4fv( projectionLoc, false, flatten(projection));

    mvLoc = gl.getUniformLocation(program, "modelView");

    mouseMovement(-4.0);

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

    var mv = lookAt( vec3(0.0, 0.0, zDist), vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0) );
    mv = mult( mv, rotateX(spinX));
    mv = mult( mv, rotateY(spinY));
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv));

    /*gl.bindBuffer(gl.ARRAY_BUFFER, cubeColourBuffer);
    gl.vertexAttribPointer( vColour, 4, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, cubePoints.length);*/

    gl.bindBuffer(gl.ARRAY_BUFFER, fishColourBuffer);
    gl.vertexAttribPointer( vColour, 4, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, fishVertexBuffer);
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimFrame( render );

}