/**
 * Heimadæmi 6.3 í TÖL105M Tölvugrafík.
 * Forrit sem teiknar SAKARIAS kollustólinn, litaðann og skyggðan með Blinn-Phong.
 *
 * @author Andri Fannar Kristjánsson, afk6@hi.is
 */

// WebGL breytur.
let canvas;
let gl;

// Fjöldi hnúta í teningi.
const NumVertices = 36;

// Fylki fyrir hnúta og þvervigra.
const pointsArray = [];
const normalsArray = [];

// Breytur fyrir snúning hlutar.
let movement = false;     // Do we rotate?
let spinX = 0;
let spinY = 0;
let origX;
let origY;

// Fjarlægð myndavélar.
let zDist = -3.0;

// Stillingar sjónvörpunar.
const fovy = 50.0;
const near = 0.2;
const far = 100.0;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

// Stillingar ljóss.
const lightPosition = vec4(1.0, 1.0, 1.0, 0.0);
const lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
const lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
const lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

// Stillingar endurskins.
const materialAmbient = vec4(0.4, 0.4, 0.4, 1.0);
const materialDiffuse = vec4(0.6, 0.6, 0.6, 1.0);
const materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
const materialShininess = 150.0;

// Vörpunarfylki.
let mv, projectionMatrix;

// Uniform breytur.
let modelViewMatrixLoc, projectionMatrixLoc;

// Þvervigrar.
var normalMatrix, normalMatrixLoc;


/**
 * Keyrir þegar vefsíða er sótt.
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

    // Stilla teiknisvæðið.
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor( 0.9, 1.0, 1.0, 1.0 );

    // Stilla WebGL
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    // Hlaða inn liturunum.
    const program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram( program );

    // Margfalda eiginleika ljóssins og hlutarins.
    let ambientProduct = mult(lightAmbient, materialAmbient);
    let diffuseProduct = mult(lightDiffuse, materialDiffuse);
    let specularProduct = mult(lightSpecular, materialSpecular);

    // Búa til tening.
    normalCube();

    // Búa til minnissvæði fyrir þvervigra.
    const nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    // Sækja minnissvæði þvervigra fyrir hnútalitarann.
    const vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    // Búa til minnissvæði fyrir hnúta.
    const vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    // Sækja minnissvæði hnútanna fyrir hnútalitarann.
    const vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Sækja uniform breytur.
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );

    // Búa til sjónvörpun.
    projectionMatrix = perspective( fovy, 1.0, near, far );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );

    // Senda eiginleikana lýsingar yfir, með staðsetningu ljóssins.
    gl.uniform4fv( gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, "shininess"), materialShininess );

    // Hlusta eftir hvort músarhnappi er ýtt niður
    canvas.addEventListener("mousedown", function(e)
    {
        // Ef hnappi er ýtt niður er hreyfing hlutar leyfð.
        movement = true;

        // Núverandi staðsetning bendils.
        origX = e.offsetX;
        origY = e.offsetY;
        e.preventDefault();
    } );

    // Ef músarhnappi er sleppt hættir hreyfing hlutarins.
    canvas.addEventListener("mouseup", function ()
    {
        movement = false;
    });

    // Hlustar eftir hreyfingu músar.
    canvas.addEventListener("mousemove", function (e)
    {
        // Ef hreyfing er leyfð (músahnappur niðri) á að snúa hlutnum.
        if(movement)
        {
            spinY = ( spinY + (origX - e.offsetX)) % 360;
            spinX = ( spinX + (e.offsetY - origY)) % 360;
            origX = e.offsetX;
            origY = e.offsetY;
        }
    });

    // Hlusta eftir skruni músar.
    canvas.addEventListener("wheel", function (e)
    {
        // Færa myndavél nær/fjær hlutnum.
        e.preventDefault();
        if(e.deltaY > 0.0)
        {
            zDist += 0.2;
        }
        else
        {
            zDist -= 0.2;
        }
    });
    
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
 * @param n     Þvervigur hliðar.
 */
function quad(a, b, c, d, n)
{
    const vertices = [
        vec4(-0.5, -0.5, 0.5, 1.0),
        vec4(-0.5, 0.5, 0.5, 1.0),
        vec4(0.5, 0.5, 0.5, 1.0),
        vec4(0.5, -0.5, 0.5, 1.0),
        vec4(-0.5, -0.5, -0.5, 1.0),
        vec4(-0.5, 0.5, -0.5, 1.0),
        vec4(0.5, 0.5, -0.5, 1.0),
        vec4(0.5, -0.5, -0.5, 1.0)
    ];

    const faceNormals = [
        vec4(0.0, 0.0, 1.0, 0.0),  // front
        vec4(1.0, 0.0, 0.0, 0.0),  // right
        vec4(0.0, -1.0, 0.0, 0.0),  // down
        vec4(0.0, 1.0, 0.0, 0.0),  // up
        vec4(0.0, 0.0, -1.0, 0.0),  // back
        vec4(-1.0, 0.0, 0.0, 0.0)   // left
    ];

    const indices = [a, b, c, a, c, d];

    for (let i = 0; i < indices.length; ++i ) {
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

    normalMatrix = [
        vec3(mv[0][0], mv[0][1], mv[0][2]),
        vec3(mv[1][0], mv[1][1], mv[1][2]),
        vec3(mv[2][0], mv[2][1], mv[2][2])
    ];
    normalMatrix.matrix = true;

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(mv) );
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix) );

    // Setja saman kollinn.
    // Fremri vinstri fóturinn.
    let mv1 = mult(mv, translate(-0.3525, 0.0, -0.2625));
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

