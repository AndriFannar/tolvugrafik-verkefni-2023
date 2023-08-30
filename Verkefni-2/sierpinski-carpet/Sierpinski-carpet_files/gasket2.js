"use strict";

var canvas;
var gl;

var points = [];

// Stilling hversu oft á að skipta ferhyrningunum niður.
var NumTimesToSubdivide = 5;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.

    // Upphafspunktarnir; hornpunktar teikniborðsins.
    var vertices = [
        vec2( -1, -1 ),
        vec2( -1,  1 ),
        vec2(  1,  1 ),
        vec2(  1, -1 )
    ];

    // Köllum á divideSquare til að búta ferhyrninginn niður.
    divideSquare( vertices[0], vertices[1], vertices[2], vertices[3],
                    NumTimesToSubdivide);

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};

// Setur gefin hnit í fylkið sem á að teikna.
function square( a, b, c, d)
{
    // Setur a og c tvisvar svo hægt sé að teikna ferhyrning með tveimur þríhyrningum.
    points.push( a, b, c, a, c, d);
}

// Brýtur ferhyrninginn í hnitunum niður í 9 minni ferhyrninga.
function divideSquare( a, b, c, d, count )
{

    // Athuga hvort hætta eigi að brjóta ferhyrninginn niður
    if ( count === 0 ) {
        square( a, b, c, d);
    }
    else {

        // Finna alla punkta fyrir nýju ferhyrningana.
        var aab = mix( a, b, (1 / 3) );
        var abb = mix( a, b, (2 / 3) );
        var bbc = mix( b, c, (1 / 3) );
        var bcc = mix( b, c, (2 / 3) );
        var ccd = mix( c, d, (1 / 3) );
        var cdd = mix( c, d, (2 / 3) );
        var aad = mix( a, d, (1 / 3) );
        var add = mix( a, d, (2 / 3) );
        var abd = mix( bbc, aad, (2 / 3) );
        var abc = mix( bbc, aad, (1 / 3) );
        var bcd = mix( bcc, add, (1 / 3) );
        var acd = mix( bcc, add, (2 / 3) );

        --count;

        // Búa til níu nýja ferhyrninga.
        divideSquare( a, aab, abd, aad, count );
        divideSquare( aab, abb, abc, abd, count );
        divideSquare( abb, b, bbc, abc, count );
        divideSquare( abc, bbc, bcc, bcd, count );
        divideSquare( bcd, bcc, c, ccd, count );
        divideSquare( acd, bcd, ccd, cdd, count );
        divideSquare( add, acd, cdd, d, count );
        divideSquare( aad, abd, acd, add, count );
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
}
