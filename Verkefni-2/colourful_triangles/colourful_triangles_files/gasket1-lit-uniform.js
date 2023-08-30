var gl;
var points;

// Hversu marga þríhyrninga á að teikna.
var NumTriangles = 100;
var posLoc;
var colorLoc;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    // Búa til fylki sem inniheldur einn þríhyrning í miðju.
    var vertices = new Float32Array([ 0.0, 0.0, -0.08, -0.15, 0.08, -0.15 ]);

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
    gl.bufferData( gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW );

    // Associate shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // Find the location of the variable fColor in the shader program
    colorLoc = gl.getUniformLocation( program, "fColor" );
    // Finnum staðsetningu translation breytunnar í hnútalitaranum
    posLoc = gl.getUniformLocation( program, "translation");
    
    render();
};


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );

    let colours = [0.0, 0.0, 0.0];
    let movement;

    // Keyra fyrir hvern þríhyrning sem á að teikna.
    for(i = 0; i < NumTriangles; i++)
    {
        // Búa til lit af handahófi fyrir hvern þríhyrning.
        for(j = 0; j < 3; j++)
        {
            colours[j] = Math.random();
        }

        // Búum til nýja staðsetningu af handahófi til að færa þríhyrninginn á.
        movement = [((Math.random() * 2) - 1), ((Math.random() * 2) - 1)];

        // Setja litinn, senda breytta staðsetningu á hnútalitarann og teikna þríhyrninginn.
        gl.uniform4fv( colorLoc, vec4(colours[0], colours[1], colours[2], 1.0) );
        gl.uniform4fv( posLoc,   vec4(movement, 0.0, 0.0) );
        gl.drawArrays( gl.TRIANGLES, 0, 3 );
    }
} 