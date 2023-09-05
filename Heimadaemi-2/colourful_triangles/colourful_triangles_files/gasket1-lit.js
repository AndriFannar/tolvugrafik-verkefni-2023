var gl;
var points;

// Hversu marga þríhyrninga á að teikna.
var NumTriangles = 100;
var colorLoc;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    // Búa til fylkið sem á að halda utan um punktana.
    let totalSize = NumTriangles * 6;
    let vertices = new Float32Array(totalSize);

    // Finna staðsetningu af handahófi fyrir hvern þríhyrning sem á að teikna.
    for(i = 0; i < totalSize; i = i + 6)
    {
        // Finna stað af handahófi fyrir efsta punkt þríhyrningsins.
        vertices[i]     = ((Math.random() * 2) - 1);
        vertices[i + 1] = ((Math.random() * 2) - 1);
        
        // Út frá efsta punktinum, reikna staðsetningu neðri punktana svo allir þríhyrningarnir hafi sömu stærð.
        vertices[i + 2] = (vertices[i] - 0.08);
        vertices[i + 3] = (vertices[i + 1] - 0.15);

        vertices[i + 4] = (vertices[i] + 0.08);
        vertices[i + 5] = (vertices[i + 1] - 0.15);
    }

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
    gl.bufferData( gl.ARRAY_BUFFER, vertices/*flatten(points)*/, gl.STATIC_DRAW );

    // Associate shader variables with our data buffer
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // Find the location of the variable fColor in the shader program
    colorLoc = gl.getUniformLocation( program, "fColor" );
    
    render();
};


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );

    let colours = [0.0, 0.0, 0.0];

    // Keyra fyrir hvern þríhyrning sem á að teikna.
    for(i = 0; i < NumTriangles; i++)
    {
        // Búa til lit af handahófi fyrir hvern þríhyrning.
        for(j = 0; j < 3; j++)
        {
            colours[j] = Math.random();
        }

        // Setja litinn og teikna þríhyrninginn.
        gl.uniform4fv( colorLoc, vec4(colours[0], colours[1], colours[2], 1.0) );
        gl.drawArrays( gl.TRIANGLES, (3 * i), 3 );
    }
}