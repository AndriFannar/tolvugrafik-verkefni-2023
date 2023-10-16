"use strict";

/**
 * Verkefni 2 í TÖL105M Tölvugrafík.
 * Skrá sem geymir öll föll tengd WebGL.
 *
 * @author Andri Fannar Kristjánsson, afk6@hi.is
 */

// WebGL breytur.
let canvas;
let gl;

// Breytur fyrir minnissvæði.
let cubeVertexBuffer;
let fishVertexBuffer;

// Uniform-breytur.
let fColour;
let vPosition;
let mvLoc;

/**
 * Fall sem keyrir í upphafi.
 */
window.onload = function init()
{
    // Hlaða inn canvas hlutanum.
    canvas = document.getElementById("gl-canvas");

    // Setja upp WebGL.
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    //  Stilla teiknisvæðið.
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.32, 0.4, 0.76, 0.76);

    // Stilla WebGL, kveikja á gegnsæi.
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    //  Hlaða inn liturunum.
    let program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Finna vPosition í litara.
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // Búa til minnissvæði fyrir fiska og búr.
    cubeVertexBuffer = gl.createBuffer();
    fishVertexBuffer = gl.createBuffer();

    // Tengja projection uniform-breytuna og stilla.
    let projectionLoc = gl.getUniformLocation(program, "projection");
    let projection = perspective(90.0, 1.0, 0.1, 100.0);
    gl.uniformMatrix4fv( projectionLoc, false, flatten(projection));

    // Tengja uniform-breytur.
    mvLoc = gl.getUniformLocation(program, "modelView");
    fColour = gl.getUniformLocation(program, "fColour");

    // Upphafsstilla músahreyfingu.
    mouseMovement(4.0);

    // Upphafsstilla senu.
    initScene();
    changeParams();

    // Teikna á skjáinn.
    render();
};


/**
 * Setja gögn inn í minnissvæði skjákortsins.
 */
function resetBuffer(cubePoints, fishPoints)
{
    // Setja hnit búrsins.
    gl.bindBuffer( gl.ARRAY_BUFFER, cubeVertexBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cubePoints), gl.STATIC_DRAW);

    // Setja hnit fisksins.
    gl.bindBuffer( gl.ARRAY_BUFFER, fishVertexBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(fishPoints), gl.STATIC_DRAW);

    // Stilla bakgrunnslitinn.
    if (anaglyph) gl.clearColor(1.0, 1.0, 1.0, 1.0);
    else gl.clearColor(0.32, 0.4, 0.76, 0.76);
}


/**
 * Teikna fisk.
 *
 * @param fish Fiskur sem á að teikna.
 * @param mv   Vörpunarfylki (fyrir hægra auga ef á að teikna í þrívídd).
 * @param mvL  Vörpunarfylki fyrir vinstra auga (ef á að teikna í þrívídd)
 */
function renderFish(fish, mv, mvL)
{
    // Athuga hvort fiskur sé kominn fyrir utan búrið.
    fishTank.checkBounds(fish);

    // Reikna nýjan hreyfivigur fyrir fiskinn.
    fishTank.calculateMovement(fish);


    // Reikna snúning fisks.
    let normDirection = normalize(fish.currentDirection);
    let yaw = Math.atan2(-normDirection[2], normDirection[0]) * (180/Math.PI) ;
    let pitch = Math.asin(normDirection[1]) * (180/Math.PI);

    // Bæta við snúningi í vörpunarfylki fisksins.
    mv = mult(mv, translate(fish.move));
    if (!isNaN(yaw))   mv = mult(mv, rotateY(yaw));
    if (!isNaN(pitch)) mv = mult(mv, rotateZ(pitch));

    // Senda vörpunarfylkið á hnútalitarann.
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv));

    // Ef það á ekki að teikna í þrívídd er náð í litinn sem á að vera á búk fisksins.
    if (!anaglyph) gl.uniform4fv(fColour, fish.colours[0]);

    // Teikna búk fisksins.
    gl.bindBuffer(gl.ARRAY_BUFFER, fishVertexBuffer);
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, fish.bodyPoints.length);

    // Ef það á ekki að teikna í þrívídd er náð í litinn sem á að vera á sporði fisksins.
    if (!anaglyph) gl.uniform4fv(fColour, fish.colours[1]);

    // Búa til vörpunarfylki fyrir sporðinn.
    let mvTail = mult(mv, translate(fish.bodyPoints[0][0], 0.0, 0.0));
    mvTail = mult(mvTail, rotateY(fish.tailRotation));
    mvTail = mult(mvTail, translate(-fish.bodyPoints[0][0], 0.0, 0.0));

    // Teikna sporð.
    gl.uniformMatrix4fv(mvLoc, false, flatten(mvTail));
    gl.drawArrays(gl.TRIANGLES, fish.bodyPoints.length, fish.tailPoints.length);

    // Ef það á ekki að teikna í þrívídd er náð í litinn sem á að vera á uggum fisksins.
    if (!anaglyph) gl.uniform4fv(fColour, fish.colours[2]);

    // Búa til vörpunarfylki fyrir einn ugga.
    let mvFin = mult(mv, rotateX(fish.finRotation));
    let drawnPoints = fish.bodyPoints.length + fish.tailPoints.length;
    let singleFinPoints = fish.finPoints.length / 2;

    // Teikna uggann.
    gl.uniformMatrix4fv(mvLoc, false, flatten(mvFin));
    gl.drawArrays(gl.TRIANGLES, drawnPoints, singleFinPoints);

    // Vörpuanrfylki fyrir hinn uggann.
    mvFin = mult(mv, rotateX(-fish.finRotation));
    drawnPoints += singleFinPoints;

    // Teikna uggann.
    gl.uniformMatrix4fv(mvLoc, false, flatten(mvFin));
    gl.drawArrays(gl.TRIANGLES, drawnPoints, singleFinPoints);


    if (anaglyph)
    {
        // Ef á að teikna í þrívídd þarf að teikna aðra senu.
        gl.uniform4fv(fColour, vec4(1.0, 0.0, 0.0, 1.0));

        mvL = mult(mvL, translate(fish.move));
        if (!isNaN(yaw))   mvL = mult(mvL, rotateY(yaw));
        if (!isNaN(pitch)) mvL = mult(mvL, rotateZ(pitch));

        // Senda vörpunarfylkið á hnútalitarann.
        gl.uniformMatrix4fv(mvLoc, false, flatten(mvL));

        // Teikna búk fisksins.
        gl.bindBuffer(gl.ARRAY_BUFFER, fishVertexBuffer);
        gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, fish.bodyPoints.length);

        // Búa til vörpunarfylki fyrir sporðinn.
        mvTail = mat4();
        mvTail = mult(mvL, translate(fish.bodyPoints[0][0], 0.0, 0.0));
        mvTail = mult(mvTail, rotateY(fish.tailRotation));
        mvTail = mult(mvTail, translate(-fish.bodyPoints[0][0], 0.0, 0.0));

        // Teikna sporð.
        gl.uniformMatrix4fv(mvLoc, false, flatten(mvTail));
        gl.drawArrays(gl.TRIANGLES, fish.bodyPoints.length, fish.tailPoints.length);

        // Búa til vörpunarfylki fyrir einn ugga.
        mvFin = mat4();
        mvFin = mult(mvL, rotateX(fish.finRotation));
        drawnPoints = fish.bodyPoints.length + fish.tailPoints.length;

        // Teikna uggann.
        gl.uniformMatrix4fv(mvLoc, false, flatten(mvFin));
        gl.drawArrays(gl.TRIANGLES, drawnPoints, singleFinPoints);

        // Vörpuanrfylki fyrir hinn uggann.
        mvFin = mult(mvL, rotateX(-fish.finRotation));
        drawnPoints += singleFinPoints;

        // Teikna uggann.
        gl.uniformMatrix4fv(mvLoc, false, flatten(mvFin));
        gl.drawArrays(gl.TRIANGLES, drawnPoints, singleFinPoints);
    }
}


/**
 * Teikna fiskabúr.
 *
 * @param mv   Vörpunarfylki(fyrir hægra auga ef á að teikna í þrívídd).
 * @param mvL  Vörpunarfylki fyrir vinstra auga (ef á að teikna í þrívídd)
 */
function renderCube(mv, mvL)
{
    // Senda vörpunarfylkið á hnútalitarann.
    gl.uniformMatrix4fv(mvLoc, false, flatten(mv));

    // Teikna útlínur.
    if(drawOutlines)
    {
        // Ef það á ekki að teikna í þrívídd er náð í lit útlínanna á búrinu.
        if (!anaglyph) gl.uniform4fv(fColour, cube.lineColour);
        else gl.uniform4fv(fColour, vec4(0.0, 1.0, 1.0, 1.0));

        // Teikna útlínur.
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
        gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.LINES, cube.sidePoints.length, cube.linePoints.length);

        if (anaglyph)
        {
            gl.uniformMatrix4fv(mvLoc, false, flatten(mvL));
            gl.uniform4fv(fColour, vec4(1.0, 0.0, 0.0, 1.0));

            // Teikna útlínur.
            gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
            gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.LINES, cube.sidePoints.length, cube.linePoints.length);
        }
    }

    // Teikna hliðar (ekki ef á að teikna í þrívídd).
    if (!anaglyph && drawSides)
    {
        // Sækja lit hliða og teikna.
        gl.uniform4fv(fColour, cube.sideColours[0]);

        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
        gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, cube.sidePoints.length);
    }
}


/**
 * Teikna senu.
 */
function render()
{
    // Hreinsa teikniborðið
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Ef teikna á í þrívídd þarf að teikna tvisvar.
    if(anaglyph)
    {
        // Hægra auga.
        let mvR = lookAt(
            vec3(eyesep / 2.0, 0.0, zDist),
            vec3(0.0, 0.0, 0.0),
            vec3(0.0, 1.0, 0.0) );

        mvR = mult( mvR, rotateX(spinX) );
        mvR = mult( mvR, rotateY(spinY) );

        // Vinstra auga.
        let mvL = lookAt(
            vec3(0.0 - eyesep / 2.0, 0.0, zDist),
            vec3(0.0, 0.0, 0.0),
            vec3(0.0, 1.0, 0.0) );

        mvL = mult( mvL, rotateX(spinX) );
        mvL = mult( mvL, rotateY(spinY) );

        for(let i = 0; i < noFish; i++)
        {
            gl.uniform4fv(fColour, vec4(0.0, 1.0, 1.0, 1.0));
            renderFish(fishArray[i], mvR, mvL);
        }

        renderCube(mvR, mvL);
    }
    else
    {
        // Búa til vörpunarfylkið.
        let mv = lookAt(
            vec3(0.0, 0.0, zDist),
            vec3(0.0, 0.0, 0.0),
            vec3(0.0, 1.0, 0.0) );
        mv = mult( mv, rotateX(spinX) );
        mv = mult( mv, rotateY(spinY) );

        // Teikna alla fiskana í fiskabúrinu.
        for(let i = 0; i < noFish; i++)
        {
            renderFish(fishArray[i], mv);
        }

        // Teikna fiskabúrið.
        renderCube(mv);
    }

    requestAnimFrame( render );
}