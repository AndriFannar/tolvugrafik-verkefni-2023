"use strict";

var canvas;
var gl;

var points = 0;

// Staðsetning hnúta sem á að teikna.
var gameBoard = [];

// Uniform breytur sem tengjast liturum.
var colorLoc;
var positionLoc;
var sinCosLoc;
var sinCos  = vec2( 0.0, -1.0);

var lane = [0.0 , -2.0];
var goingUp = true;

var laneSize = 0.40;
var gameColours = {
    gray:   vec4(0.671, 0.671, 0.671, 1.0),
    yellow: vec4(0.929, 0.812, 0.078, 1.0),
    green:  vec4(0.039, 0.639, 0.004, 1.0),
    blue:   vec4(0.071, 0.408, 0.749, 1.0)
};

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

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
        vec2( -0.9 , -0.3 ),
        vec2( -0.9 , -0.5 ),
        vec2( -0.6 , -0.3 ),
        vec2( -0.9 , -0.5 ),
        vec2( -0.6 , -0.3 ),
        vec2( -0.6 , -0.5 ),
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

    movement();
    
    render();
};

function movement()
{
    window.addEventListener("keydown", function(e) 
    {
        switch(e.key) {
            case "ArrowUp":
                if (lane[1] === 2) break;
                lane[1]++;
                if (lane[1] === 2) turnAround();
                break;

            case "ArrowDown":
                if (lane[1] === -2) break;
                lane[1]--;
                if (lane[1] === -2) turnAround();
                break;

            case "ArrowLeft":
                if (lane[0] === -2) break;
                lane[0]--;
                break;

            case "ArrowRight":
                if (lane[0] === 2) break;
                lane[0]++;
                break;
        }
    })
}

function turnAround()
{
    if ( lane[1] === -2 ) return;
    else 
    {
        points++;

        if (goingUp)
        {
            sinCos[0] = Math.sin(0);
            sinCos[1] = Math.cos(0);
        }
        else 
        {
            sinCos[0] = Math.sin(Math.PI);
            sinCos[1] = Math.cos(Math.PI);
        }
        lane[0] = -lane[0];
        lane[1] = -lane[1];
        goingUp = !goingUp;
    }
}

function render()
{
    gl.uniform2fv( sinCosLoc, vec2( 0.0 , -1.0));
    gl.uniform4fv( colorLoc, gameColours.gray );

    gl.clear( gl.COLOR_BUFFER_BIT );

    // Teikna gangstéttina.
    for(let i = 0; i < 2; i++)
    {
        gl.uniform2fv( positionLoc, vec2(0, 1.6*i));
        gl.drawArrays( gl.TRIANGLES, 0, 6 );
    }

    gl.uniform4fv( colorLoc, gameColours.blue );
    gl.uniform2fv( positionLoc, vec2(0 , 0));
    gl.drawArrays( gl.TRIANGLES, 15, 6 );

    gl.uniform2fv( positionLoc, vec2(0.0 , 0.0));
    gl.uniform4fv( colorLoc, gameColours.yellow );

    for(let i = 0; i < 4; i++)
    {
        gl.uniform2fv( positionLoc, vec2(0, laneSize * i));
        gl.drawArrays( gl.TRIANGLES, 6, 6 );
    }

    gl.uniform2fv( positionLoc, vec2(0.0 , 0.0));

    gl.uniform4fv( colorLoc, gameColours.green );
    gl.uniform2fv( positionLoc, vec2(laneSize * lane[0], laneSize * lane[1]));
    gl.uniform2fv( sinCosLoc, sinCos);
    gl.drawArrays( gl.TRIANGLES, 12, 3 );

    window.requestAnimFrame( render );
}
