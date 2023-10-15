"use strict";

/**
 * Verkefni 2 í TÖL105M Tölvugrafík.
 *
 * @author Andri Fannar Kristjánsson, afk6@hi.is
 */
let canvas;
let gl;

let cubeVertexBuffer;
let fishVertexBuffer;

let fColour;
let vPosition;
let mvLoc;

let anaglyph = false;

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
    gl.clearColor(0.32, 0.4, 0.76, 0.76);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    //  Hlaða inn liturunum og upphafsstilla.
    let program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // Hlaða gögnunum inn í grafíkkortið.
    cubeVertexBuffer = gl.createBuffer();
    fishVertexBuffer = gl.createBuffer();

    let projectionLoc = gl.getUniformLocation(program, "projection");
    let projection = perspective(90.0, 1.0, 0.1, 100.0);
    gl.uniformMatrix4fv( projectionLoc, false, flatten(projection));

    mvLoc = gl.getUniformLocation(program, "modelView");
    fColour = gl.getUniformLocation(program, "fColour");

    mouseMovement(4.0);

    initScene();
    changeParams();

    // Teikna á skjáinn.
    //render();
    const renderScreen = setInterval(render, 10);
};


/**
 * Setja gögn inn í bufferinn.
 */
function resetBuffer(cubePoints, fishPoints)
{
    gl.bindBuffer( gl.ARRAY_BUFFER, cubeVertexBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cubePoints), gl.STATIC_DRAW);

    gl.bindBuffer( gl.ARRAY_BUFFER, fishVertexBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(fishPoints), gl.STATIC_DRAW);
}


function renderFish(fish, mv)
{
    fishTank.checkBounds(fish);
    fishTank.calculateFlocking();

    let normDirection = normalize(fish.currentDirection);
    let yaw = Math.atan2(-normDirection[2], normDirection[0]) * (180/Math.PI) ;
    let pitch = Math.asin(normDirection[1]) * (180/Math.PI);

    mv = mult(mv, translate(fish.move));
    if (!isNaN(yaw)) mv = mult(mv, rotateY(yaw));
    if (!isNaN(pitch))mv = mult(mv, rotateZ(pitch));

    gl.uniformMatrix4fv(mvLoc, false, flatten(mv));

    gl.uniform4fv(fColour, fish.colours[0]);

    gl.bindBuffer(gl.ARRAY_BUFFER, fishVertexBuffer);
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, fish.bodyPoints.length);

    gl.uniform4fv(fColour, fish.colours[1]);

    let mvTail = mult(mv, translate(fish.bodyPoints[0][0], 0.0, 0.0));
    mvTail = mult(mvTail, rotateY(fish.tailRotation));
    mvTail = mult(mvTail, translate(-fish.bodyPoints[0][0], 0.0, 0.0));

    gl.uniformMatrix4fv(mvLoc, false, flatten(mvTail));
    gl.drawArrays(gl.TRIANGLES, fish.bodyPoints.length, fish.tailPoints.length);

    gl.uniform4fv(fColour, fish.colours[2]);

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

    gl.uniform4fv(fColour, cube.lineColour);
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.LINES, cube.sidePoints.length, cube.linePoints.length);

    gl.uniform4fv(fColour, cube.sideColours[0]);

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, cube.sidePoints.length);
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

    for(let i = 0; i < noFish; i++)
    {
        renderFish(fishArray[i], mv);
    }

    renderCube(mv);

    //requestAnimFrame( render );
}