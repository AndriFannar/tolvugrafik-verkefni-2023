//////////////////////////////////////////////////////////////////////
//    Sýnidæmi fyrir heimadæmi 1 í Tölvugrafík
//     Rétthyrningur teiknaður með tveimur sjálfstæðum þríhyrningum
//
//    Hjálmtýr Hafsteinsson, ágúst 2023
//////////////////////////////////////////////////////////////////////
var gl;
var points;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    // Röðun breytt svo hægt sé að teikna rétthyrninginn með TRIANGLE_FAN
    var vertices = new Float32Array([ 0.5,  0.25, 
                                     -0.5,  0.25, 
                                     -0.5, -0.25,
                                      0.5, -0.25]);

    //  Configure WebGL

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER,vertices, gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    // Breytt úr TRIANGLE í TRIANGLE_FAN
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );
}