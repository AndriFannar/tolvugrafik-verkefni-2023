/**
 * Heimadæmi 6.3 í TÖL105M Tölvugrafík.
 * Forrit sem teiknar SAKARIAS kollustólinn, litaðann og skyggðan með Blinn-Phong.
 *
 * @author Andri Fannar Kristjánsson, afk6@hi.is
 */
var canvas;
var gl;

var NumVertices  = 36;

var pointsArray = [];
var normalsArray = [];

var movement = false;     // Do we rotate?
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var zDist = -3.0;

var fovy = 50.0;
var near = 0.2;
var far = 100.0;

var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 0.4, 0.4, 0.4, 1.0 );
var materialDiffuse = vec4( 0.6, 0.6, 0.6, 1.0 );
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 150.0;

var ctm;
var ambientColor, diffuseColor, specularColor;

var mv, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var normalMatrix, normalMatrixLoc;

var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    var dypi = gl.getParameter(gl.DEPTH_BITS);
    var gildi = gl.getParameter(gl.DEPTH_CLEAR_VALUE);
    var bil = gl.getParameter(gl.DEPTH_RANGE);
    //gl.enable(gl.CULL_FACE);
    //gl.cullFace(gl.BACK);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );


    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    normalCube();

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );

    projectionMatrix = perspective( fovy, 1.0, near, far );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );


    gl.uniform4fv( gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, "shininess"), materialShininess );

    // Músahreyfing
    canvas.addEventListener("mousedown", function(e){
        // Ef ýtt er með mús byrjar hreyfing.
        movement = true;
        origX = e.offsetX;
        origY = e.offsetY;

        // Koma í veg fyrir sjálfgefna virkni, að draga og sleppa.
        e.preventDefault();
    } );

    canvas.addEventListener("mouseup", function(e){
        // Ef músarhnappi er sleppt hættir hreyfing.
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        // Ef músin hreyfist og músarhnappur er niðri snýst hluturinn.
        if(movement) {
    	    spinY = ( spinY + (origX - e.offsetX) ) % 360;
            spinX = ( spinX + (origY - e.offsetY) ) % 360;
            origX = e.offsetX;
            origY = e.offsetY;
        }
    } );

    // Event listener for mousewheel
    window.addEventListener("wheel", function(e){
        if( e.deltaY > 0.0 ) {
            zDist += 0.2;
        } else {
            zDist -= 0.2;
        }
    }  );
    
    render();
}

/**
 * Býr til tening.
 */
function normalCube()
{
    quad( 1, 0, 3, 2, 0 );
    quad( 2, 3, 7, 6, 1 );
    quad( 3, 0, 4, 7, 2 );
    quad( 6, 5, 1, 2, 3 );
    quad( 4, 5, 6, 7, 4 );
    quad( 5, 4, 0, 1, 5 );
}

/**
 * Býr til eina hlið á ferhyrning.
 * 
 * @param {*} a Einn hnútur ferhyrningsins
 * @param {*} b Einn hnútur ferhyrningsins
 * @param {*} c Einn hnútur ferhyrningsins
 * @param {*} d Einn hnútur ferhyrningsins
 */
function quad(a, b, c, d, n)
{
    var vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5, -0.5, -0.5, 1.0 )
    ];

    var faceNormals = [
        vec4( 0.0, 0.0,  1.0, 0.0 ),  // front
        vec4(  1.0, 0.0, 0.0, 0.0 ),  // right
        vec4( 0.0, -1.0, 0.0, 0.0 ),  // down
        vec4( 0.0,  1.0, 0.0, 0.0 ),  // up
        vec4( 0.0, 0.0, -1.0, 0.0 ),  // back
        vec4( -1.0, 0.0, 0.0, 0.0 )   // left
    ];

    // We need to partition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    //fece normals assigned using the parameter n

    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        pointsArray.push( vertices[indices[i]] );
        normalsArray.push(faceNormals[n]);

    }
}


/**
 * Teikna á teikniborðið.
 */
function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mv = lookAt( vec3(0.0, 0.0, zDist), at, up );
    mv = mult( mv, rotateX( spinX ) );
    mv = mult( mv, rotateY( spinY ) );

    // normal matrix only really need if there is nonuniform scaling
    // it's here for generality but since there is
    // no scaling in this example we could just use modelView matrix in shaders
    normalMatrix = [
        vec3(mv[0][0], mv[0][1], mv[0][2]),
        vec3(mv[1][0], mv[1][1], mv[1][2]),
        vec3(mv[2][0], mv[2][1], mv[2][2])
    ];
    normalMatrix.matrix = true;

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mv) );
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix) );

    //gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    //window.requestAnimFrame(render);

    // Setja saman kollinn.
    // Fremri vinstri fóturinn.
    mv1 = mult( mv, translate( -0.3525, 0.0, -0.2625) );
    mv1 = mult( mv1, rotateX(3));
    mv1 = mult( mv1, rotateZ(-3));
    mv1 = mult( mv1, scalem( 0.1, 0.80, 0.1 ) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mv1));
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    // Aftari vinstri fóturinn.
    mv1 = mult( mv, translate( -0.3525, 0.0, 0.2625) );
    mv1 = mult( mv1, rotateX(-3));
    mv1 = mult( mv1, rotateZ(-3));
    mv1 = mult( mv1, scalem( 0.1, 0.80, 0.1 ) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mv1));
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    // Fremri hægri fóturinn.
    mv1 = mult( mv, translate( 0.3525, 0.0, -0.2625) );
    mv1 = mult( mv1, rotateX(3));
    mv1 = mult( mv1, rotateZ(3));
    mv1 = mult( mv1, scalem( 0.1, 0.80, 0.1 ) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mv1));
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    // Aftari hægri fóturinn.
    mv1 = mult( mv, translate( 0.3525, 0.0, 0.2625) );
    mv1 = mult( mv1, rotateX(-3));
    mv1 = mult( mv1, rotateZ(3));
    mv1 = mult( mv1, scalem( 0.1, 0.80, 0.1 ) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mv1));
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    // Sessa kollsins.
    mv1 = mult( mv, translate( 0.0, 0.351, 0.0) );
    mv1 = mult( mv1, scalem( 0.765, 0.135, 0.585 ) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mv1));
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    requestAnimFrame( render );
}

