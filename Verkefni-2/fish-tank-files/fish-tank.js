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

let fish;
let cube;

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

    cube = new Cube(1.5, [vec4(0.4, 0.97, 0.83, 0.1)]);
    fish = new Fish( 1, vec4(1, 0, 0, 1), vec4(0, 1, 0, 1), vec4(0, 0, 1, 1));

    //  Stilla WebGL.
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.32, 0.4, 0.76, 0.76);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    //  Hlaða inn liturunum og upphafsstilla.
    let program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    vColour = gl.getAttribLocation( program, "vColour" );
    gl.vertexAttribPointer( vColour, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColour );

    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // Hlaða gögnunum inn í grafíkkortið.
    cubeColourBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cubeColourBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cube.colours), gl.STATIC_DRAW );

    cubeVertexBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cubeVertexBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cube.points), gl.STATIC_DRAW );

    fishColourBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, fishColourBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(fish.colours), gl.STATIC_DRAW );

    console.log(fish.points)

    fishVertexBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, fishVertexBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(fish.points), gl.STATIC_DRAW );

    let projectionLoc = gl.getUniformLocation(program, "projection");
    let projection = perspective(90.0, 1.0, 0.1, 100.0);
    gl.uniformMatrix4fv( projectionLoc, false, flatten(projection));

    mvLoc = gl.getUniformLocation(program, "modelView");

    mouseMovement(-4.0);

    // Teikna á skjáinn.
    render();
};


function renderFish(mv)
{
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv));

    gl.bindBuffer(gl.ARRAY_BUFFER, fishColourBuffer);
    gl.vertexAttribPointer( vColour, 4, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, fishVertexBuffer);
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, fish.bodyPoints.length);

    let mvTail = mult(mv, translate(fish.bodyPoints[0][0], 0.0, 0.0));
    mvTail = mult(mvTail, rotateY(fish.tailRotation));
    mvTail = mult(mvTail, translate(-fish.bodyPoints[0][0], 0.0, 0.0));

    gl.uniformMatrix4fv(mvLoc, false, flatten(mvTail));
    gl.drawArrays(gl.TRIANGLES, fish.bodyPoints.length, fish.tailPoints.length);

    let mvFin = mult(mv, rotateX(fish.finRotation));
    let drawnPoints = fish.bodyPoints.length + fish.tailPoints.length;
    let singleFinPoints = fish.finPoints.length / 2;

    gl.uniformMatrix4fv(mvLoc, false, flatten(mvFin));
    gl.drawArrays(gl.TRIANGLES, drawnPoints, singleFinPoints);

    mvFin = mult(mv, rotateX(-fish.finRotation));
    drawnPoints += singleFinPoints;

    gl.uniformMatrix4fv(mvLoc, false, flatten(mvFin));
    gl.drawArrays(gl.TRIANGLES, drawnPoints, singleFinPoints);
}


function renderCube(mv)
{
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv));

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeColourBuffer);
    gl.vertexAttribPointer( vColour, 4, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, cube.points.length);
}


/**
 * Teiknar leikinn.
 */
function render()
{
    // Hreinsa teikniborðið
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let mv = lookAt( vec3(0.0, 0.0, zDist), vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0) );
    mv = mult( mv, rotateX(spinX) );
    mv = mult( mv, rotateY(spinY) );

    renderFish(mv);
    renderCube(mv);

    requestAnimFrame( render );

}