/////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Ferningur skoppar um gluggann.  Notandi getur breytt
//     hraðanum með upp/niður örvum.
//
//    Hjálmtýr Hafsteinsson, september 2023
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

// Núverandi staðsetning miðju ferningsins
var box = vec2( 0.0, 0.0 );

// Stefna (og hraði) fernings
var dX;
var dY;

// Svæðið er frá -maxX til maxX og -maxY til maxY
var maxX = 1.0;
var maxY = 1.0;

// Hálf breidd/hæð ferningsins
var boxRad = 0.05;

// Staðsetning punktana.
var vertices;

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );
    
    // Gefa ferningnum slembistefnu í upphafi
    dX = Math.random()*0.02-0.006;
    dY = Math.random()*0.02-0.006;

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Staðsetning punktana
    vertices = [
        // Kassi
        vec2( -0.05, -0.05 ), 
        vec2(  0.05, -0.05 ),
        vec2(  0.05,  0.05 ),
        vec2( -0.05,  0.05 ),

        // Spaði
        vec2( -0.1, -0.90 ),
        vec2( -0.1, -0.86 ),
        vec2(  0.1, -0.86 ),
        vec2(  0.1, -0.90 ) 
    ];
    
    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.DYNAMIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    locBox = gl.getUniformLocation( program, "boxPos" );

    // Meðhöndlun örvalykla
    window.addEventListener("keydown", function(e){
        switch( e.key ) {
            case "ArrowLeft": // Færa spaða til vinstri.
                xmove = -0.08;
                break;
            case "ArrowRight": // Færa spaða til hægri.
                xmove = 0.08;
                break;
            case "ArrowUp": // Auka hraða kassans;
                dX *= 1.1;
                dY *= 1.1;
                xmove = 0.0;
                break;
            case "ArrowDown": // Minnka hraða kassans.
                dX /= 1.1;
                dY /= 1.1;
                xmove = 0.0;
                break;
            default:
                xmove = 0.0;
        }
        for(i=4; i<8; i++) {
            vertices[i][0] += xmove; // Reikna staðsetningu spaðans.
        }

        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));
    } );

    render();
}


/**
 * Athugar hvort kassinn hafi rekist á spaðann.
 */
function collisionDetection() 
{
  // Athugar hvort neðri hluti kassans hafi rekist á efri hluta spaðans.
    if ((((box[0] + boxRad) >=  vertices[5][0]) && ((box[1] - boxRad) <= vertices[5][1])) &&
        (((box[0] - boxRad) <=  vertices[6][0]) && ((box[1] - boxRad) <= vertices[6][1])))
    {
        dY = -dY; // Ef árekstur á sér stað, senda kassann aftur upp.
    }
}


function render() {
    
    // Láta ferninginn skoppa af veggjunum
    if (Math.abs(box[0] + dX) > maxX - boxRad) dX = -dX;
    if (Math.abs(box[1] + dY) > maxY - boxRad) dY = -dY;

    // Uppfæra staðsetningu
    box[0] += dX;
    box[1] += dY;
    
    gl.clear( gl.COLOR_BUFFER_BIT );

    // Teikna spaðann.
    gl.uniform2fv( locBox, vec2(0 , 0) );
    gl.drawArrays( gl.TRIANGLE_FAN, 4, 4 );

    // Teikna kassann.
    gl.uniform2fv( locBox, flatten(box) );
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );

    // Athuga árekstur.
    collisionDetection();

    window.requestAnimFrame(render);
}
