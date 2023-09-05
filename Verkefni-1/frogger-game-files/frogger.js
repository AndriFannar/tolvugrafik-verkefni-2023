"use strict";

var canvas;
var gl;

var points = 0;

// Staðsetning hnúta sem á að teikna.
var gameBoard = [];

// Uniform breytur sem tengjast liturum.
var colorLoc;
var positionLoc;

var frog = vec2( 0.0 , 0.0 );
var frogUp = true;

var laneSize = 0.4;
var gameColours = {
    gray:   vec4(0.671, 0.671, 0.671, 1.0),
    yellow: vec4(0.929, 0.812, 0.078, 1.0),
    green:  vec4(0.039, 0.639, 0.004, 1.0)
};

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    var gameBoard = [
        // Gangstétt
        vec2( -1   , -0.6 ),
        vec2( -1   , -1   ),
        vec2(  1   , -0.6 ),
        vec2( -1   , -1   ),
        vec2(  1   , -0.6 ),
        vec2(  1   , -1   ),

        // Vegmerkingar
        vec2( -1   , -0.61),
        vec2( -1   , -0.59),
        vec2(  1   , -0.61),
        vec2( -1   , -0.59),
        vec2(  1   , -0.61),
        vec2(  1   , -0.59),

        // Froskur
        vec2(  0   , -0.7 ),
        vec2( -0.1 , -0.9 ),
        vec2(  0.1 , -0.9 )
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

    movement();
    
    render();
};

function movement()
{
    window.addEventListener("keydown", function(e) 
    {
        switch(e.key) {
            case "ArrowUp":
                if (frog[1] === 1.6) break;
                frog[1] += laneSize;
                if (frog[1] === 1.6) turnAround;
                break;

            case "ArrowDown":
                if (frog[1] === 0.0) break;
                frog[1] -= laneSize;
                if (frog[1] === 0.0) turnAround;
                break;

            case "ArrowLeft":
                if (frog[0] === -0.8) break;
                frog[0] -= laneSize;
                break;

            case "ArrowRight":
                if (frog[0] === 0.8) break;
                frog[0] += laneSize;
                break;
        }
    })
}

function turnAround()
{
    if ( (frogUp && frog[1] === -0.7) || (!frogUp && frog[1] === 0.7) ) return;
    else console.log("What");
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );

    gl.uniform2fv( positionLoc, vec2(0.0 , 0.0));
    gl.uniform4fv( colorLoc, gameColours.gray );

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
        gl.uniform2fv( positionLoc, vec2(0, 0.4*i));
        gl.drawArrays( gl.TRIANGLES, 6, 8 );
    }

    gl.uniform2fv( positionLoc, vec2(0.0 , 0.0));

    gl.uniform4fv( colorLoc, gameColours.green );
    gl.uniform2fv( positionLoc, frog);
    gl.drawArrays( gl.TRIANGLES, 12, 15 );

    window.requestAnimFrame( render );
}
