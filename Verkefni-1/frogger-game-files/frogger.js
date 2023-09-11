"use strict";

var canvas;
var gl;

// Heildar stigafjöldi leikmanns.
var points = 0;

// Staðsetning hnúta sem á að teikna.
var gameBoard = [];

// Stærð akgreinanna.
var laneSize = 0.40;

// Uniform breyta sem stjórnar lit á hlutunum.
var colorLoc;

// Uniform breyta sem stjórnar staðsetningu hluta.
var positionLoc;

// Uniform breyta sem stjórnar snúningi hluta.
var sinCosLoc;

// Sínus og Kósínus gildin sem á að senda á hnútalitarann (snúningur hlutarins).
var frogSinCos  = vec2( 0.0, 1.0);

// Núverandi staðsetning leikmanns (skipt í akgreinar).
var lane = [0.0 , -2.0];

// Er froskurinn á uppleið.
var goingUp = true;

// Staðsetning frosksins í hnitum.
var frogPos = [ 0.0 , -0.8 ];

// Líf leikmanns.
var life = 3;

// Hraði bílanna.
var carSpeed = 0.0005;

var carSinCos = vec2( 0.0, 1.0);

// Staðsetning bílanna.
var carsX = [ -1.5 , -1.5 , -1.5 ];

// Litir notaðir í forritinu.
var gameColours = {
    gray:   vec4(0.671, 0.671, 0.671, 1.0),
    yellow: vec4(0.929, 0.812, 0.078, 1.0),
    green:  vec4(0.039, 0.639, 0.004, 1.0),
    blue:   vec4(0.071, 0.408, 0.749, 1.0)
};


/**
 * Fall sem upphafsstillir WebGL og þar með leikinn.
 */
window.onload = function init()
{
    // Hlaða inn canvas hlutanum.
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    // Upphafsstaðsetningar leikhluta á leikborði fyrir breytingar.
    gameBoard = [
        // Gangstétt
        vec2( -1.0 , -0.6 ),
        vec2( -1.0 , -1   ),
        vec2(  1.0 , -0.6 ),
        vec2( -1.0 , -1   ),
        vec2(  1.0 , -0.6 ),
        vec2(  1.0 , -1   ),

        // Vegmerkingar
        vec2( -1.0 , -0.61),
        vec2( -1.0 , -0.59),
        vec2(  1.0 , -0.61),
        vec2( -1.0 , -0.59),
        vec2(  1.0 , -0.61),
        vec2(  1.0 , -0.59),

        //Froskur
        vec2(  0.0 ,  0.1 ),
        vec2( -0.1 , -0.1 ),
        vec2(  0.1 , -0.1 ),

        // Bíll
        vec2( -0.2 , -0.3 ),
        vec2( -0.2 , -0.5 ),
        vec2(  0.2 , -0.3 ),
        vec2( -0.2 , -0.5 ),
        vec2(  0.2 , -0.3 ),
        vec2(  0.2 , -0.5 )
    ];


    //  Stillum WebGL.
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    //  Hlaða inn liturunum og upphafsstilla.
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Hlaða gögnunum inn í grafíkkortið.
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(gameBoard), gl.STATIC_DRAW );

    // Tengja litarabreyturnar við gagnabufferinn.
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // Finna staðsetningu uniform breytanna í liturunum.
    colorLoc = gl.getUniformLocation( program, "fColor" );
    positionLoc = gl.getUniformLocation( program, "translation");
    sinCosLoc = gl.getUniformLocation( program, "sinCos");

    // Virkja hreyfingu leikmanns.
    movement();
    
    // Teikna á skjáinn.
    render();
};

/**
 * Fall sem sér um hreyfingu leikmanns.
 */
function movement()
{
    window.addEventListener("keydown", function(e) 
    {
        switch(e.key) {
            case "ArrowUp":
                frogSinCos[0] = Math.sin(0);
                frogSinCos[1] = Math.cos(0);
                // Athuga hvort leikmaður sé kominn út á enda.
                if (lane[1] == 2) break;
                lane[1]++; // Færa leikmann áfram um eina akgrein.
                if (lane[1] === 2 && goingUp) updatePoints(); // Ef svo er þá á hann ekki að færast lengra.
                break;

            case "ArrowDown":
                frogSinCos[0] = Math.sin(Math.PI);
                frogSinCos[1] = Math.cos(Math.PI);
                if (lane[1] === -2) break;
                lane[1]--;
                if (lane[1] === -2 && !goingUp) updatePoints();
                break;

            case "ArrowLeft":
                frogSinCos[0] = Math.sin(Math.PI / 2);
                frogSinCos[1] = Math.cos(Math.PI / 2);
                if (lane[0] === -2) break;
                lane[0]--;
                break;

            case "ArrowRight":
                frogSinCos[0] = Math.sin((3 * Math.PI) / 2);
                frogSinCos[1] = Math.cos((3 * Math.PI) / 2);
                if (lane[0] === 2) break;
                lane[0]++;
                break;
        }

        // Reikna staðsetningu frosksins.
        frogPos[0] = laneSize * lane[0];
        frogPos[1] = laneSize * lane[1];
    })
}

/**
 * Fall sem sér um að snúa leikmanni við.
 */
function updatePoints()
{
    // Auka stigafjölda.
    points++;
    console.log("Stig: ", points);
    goingUp = !goingUp;
}

function collisionDetection(car, carLane)
{
    if((lane[1] === carLane - 1) && ((frogPos[0] < car + 0.3) && (frogPos[0] > car - 0.3))) 
    {
        life--;
        frogPos[1] = -0.8;
        lane[1] = -2;
    }
}

function render()
{
    // Stilla hnúta og bútalitarann fyrir fyrstu teiknun. 
    gl.uniform2fv( sinCosLoc, vec2( 0.0 , 1.0 ));
    gl.uniform4fv( colorLoc, gameColours.gray );

    // Hreinsa teikniborðið
    gl.clear( gl.COLOR_BUFFER_BIT );

    // Teikna gangstéttina.
    for(let i = 0; i < 2; i++)
    {
        gl.uniform2fv( positionLoc, vec2(0, 1.6*i));
        gl.drawArrays( gl.TRIANGLES, 0, 6 );
    }

    gl.uniform2fv( positionLoc, vec2(0.0 , 0.0));
    gl.uniform4fv( colorLoc, gameColours.yellow );

    for(let i = 0; i < 4; i++)
    {
        gl.uniform2fv( positionLoc, vec2(0, laneSize * i));
        gl.drawArrays( gl.TRIANGLES, 6, 6 );
    }

    // Teikna bíla.
    for(let i = 0; i < 3; i++)
    {
        gl.uniform4fv( colorLoc, gameColours.blue );

        gl.uniform2fv( sinCosLoc, carSinCos );

        carsX[i] = carsX[i] + carSpeed * (i + 1);
        if (carsX[i] > 1.5) carsX[i] = -1.5;

        collisionDetection(carsX[i], i);

        gl.uniform2fv( positionLoc, vec2( carsX[i] , laneSize * i));
        gl.drawArrays( gl.TRIANGLES, 15, 6 );
    }

    gl.uniform2fv( positionLoc, vec2(0.0 , 0.0));

    gl.uniform4fv( colorLoc, gameColours.green );
    gl.uniform2fv( positionLoc, frogPos);
    gl.uniform2fv( sinCosLoc, frogSinCos);
    gl.drawArrays( gl.TRIANGLES, 12, 3 );

    window.requestAnimFrame( render );
}