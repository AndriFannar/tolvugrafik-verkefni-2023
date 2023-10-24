/**
 * Heimadæmi 6.1 í TÖL105M Tölvugrafík.
 * Forrit sem teiknar tvöfaldan pendúl
 *
 * @author Andri Fannar Kristjánsson, afk6@hi.is
 */

// Myndavél
let movement = false;
let spinX = 0;
let spinY = 0;
let origX;
let origY;

let zDist = -25.0;

// Hnútar ferhyrningsins.
let NumVertices = 36;

const points = [];
const colors = [];

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

// Litir
const vertexColors = [
    vec4(0.0, 0.0, 0.0, 1.0),  // black
    vec4(1.0, 0.0, 0.0, 1.0),  // red
    vec4(1.0, 1.0, 0.0, 1.0),  // yellow
    vec4(0.0, 1.0, 0.0, 1.0),  // green
    vec4(0.0, 0.0, 1.0, 1.0),  // blue
    vec4(1.0, 0.0, 1.0, 1.0),  // magenta
    vec4(0.0, 1.0, 1.0, 1.0),  // cyan
    vec4(1.0, 1.0, 1.0, 1.0)   // white
];


// Stærð arma á pendúl.
const UPPER_PENDULUM_HEIGHT = 5.0;
const UPPER_PENDULUM_WIDTH = 0.5;
const LOWER_PENDULUM_HEIGHT = 5.0;
const LOWER_PENDULUM_WIDTH = 0.5;

// Breytur fyrir hnútalitarann.
let modelViewMatrix, projectionMatrix;

let modelViewMatrixLoc;

let vBuffer, cBuffer;

// Snúningur arma pendúls
const UPPER_PENDULUM = 0;
const LOWER_PENDULUM = 1;

let theta = [0, 0];

// Hraði og snúningur pendúls
let upperArmMaxAngle = 70;
let upperArmMovement = 1;

let lowerArmMaxAngle = 50;
let lowerArmMovement = 0.2;

//----------------------------------------------------------------------------

/**
 * Búa til hlið ferhyrnings.
 */
function quad(  a,  b,  c,  d ) {
    colors.push(vertexColors[a]);
    points.push(vertices[a]);
    colors.push(vertexColors[a]);
    points.push(vertices[b]);
    colors.push(vertexColors[a]);
    points.push(vertices[c]);
    colors.push(vertexColors[a]);
    points.push(vertices[a]);
    colors.push(vertexColors[a]);
    points.push(vertices[c]);
    colors.push(vertexColors[a]);
    points.push(vertices[d]);
}

/**
 * Búa til ferhyrning.
 */
function colorCube() {
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

//____________________________________________

window.onload = function init()
{
    // Hlaða inn canvas hlutanum.
    canvas = document.getElementById("gl-canvas");

    // Setja upp WebGL.
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    //  Stilla teiknisvæðið.
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.32, 0.4, 0.76, 0.76);

    // Stilla WebGL
    gl.enable( gl.DEPTH_TEST );

    //  Hlaða inn liturunum.
    let program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Búa til ferhyrning.
    colorCube();

    //  Hlaða inn liturunum.
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Búa til minnissvæði fyrir hnúta.
    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Finna vPosition í litara.
    const vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // Búa til minnissvæði fyrir liti.
    cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    // Finna vColor í litara.
    const vColour = gl.getAttribLocation(program, "vColour");
    gl.vertexAttribPointer( vColour, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColour );

    // Tengja uniform-breytu fyrir vörpunarfylki.
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    // Stilla myndavél.
    projectionMatrix = perspective( 60.0, 1.0, 0.1, 100.0 );
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),  false, flatten(projectionMatrix) );

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

    // Teikna.
    changeParams();
    render();
}

//----------------------------------------------------------------------------

/**
 * Breytir stillingum forritsins.
 */
function changeParams()
{
    document.getElementById("changeParams").onclick = function()
    {
        upperArmMaxAngle = document.getElementById("upperAngle").value;
        upperArmMovement = document.getElementById("upperMovement").value * 0.1;
        lowerArmMaxAngle = document.getElementById("lowerAngle").value;
        lowerArmMovement = document.getElementById("lowerMovement").value * 0.1;

        theta = [0, 0];
    };
}

//----------------------------------------------------------------------------

/**
 * Teikna neðri pendúl.
 */
function lowerPendulum()
{
    let lowerPend = scalem(LOWER_PENDULUM_WIDTH, LOWER_PENDULUM_HEIGHT, LOWER_PENDULUM_WIDTH);
    let instanceMatrix = mult(translate( 0.0, 0.5 * LOWER_PENDULUM_HEIGHT, 0.0 ), lowerPend);
    lowerPend = mult(modelViewMatrix, instanceMatrix);

    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(lowerPend) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------

/**
 * Teikna efri pendúl.
 */
function upperPendulum()
{
    let upperPend = mult(modelViewMatrix, scalem(UPPER_PENDULUM_WIDTH, UPPER_PENDULUM_HEIGHT, UPPER_PENDULUM_WIDTH));
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(upperPend) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------


let render = function() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    // Athuga hvort hámarks (lágmarks) horni er náð.
    if(theta[UPPER_PENDULUM] > lowerArmMaxAngle || theta[UPPER_PENDULUM] < -lowerArmMaxAngle)
    {
        lowerArmMovement *= -1; // Ef svo er, hreyfa pendúl í öfuga átt.
    }
    if(theta[LOWER_PENDULUM] > upperArmMaxAngle || theta[LOWER_PENDULUM] < -upperArmMaxAngle)
    {
        upperArmMovement *= -1;
    }

    // Snúa pendúl.
    theta[UPPER_PENDULUM] += lowerArmMovement;
    theta[LOWER_PENDULUM] += upperArmMovement;

    // Staðsetja áhorfanda og meðhöndla músarhreyfingu
    let mv = lookAt( vec3(0.0, 2.0, zDist), vec3(0.0, 2.0, 0.0), vec3(0.0, 1.0, 0.0) );
    mv = mult( mv, rotateX( spinX ) );
    mv = mult( mv, rotateY( spinY ) );

    // Búa til vörpunarfylki fyrir efri hluta.
    modelViewMatrix = mult(mv, translate(0.0, UPPER_PENDULUM_HEIGHT, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotateZ( theta[UPPER_PENDULUM] ));
    modelViewMatrix = mult(modelViewMatrix, translate(0.0, -(UPPER_PENDULUM_HEIGHT * 0.5), 0.0));
    upperPendulum();

    // Búa til vörpunarfylki fyrir neðri hluta.
    modelViewMatrix  = mult(modelViewMatrix, translate(0.0, -(UPPER_PENDULUM_HEIGHT * 0.5), 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotateZ( theta[LOWER_PENDULUM] ) );
    modelViewMatrix  = mult(modelViewMatrix, translate(0.0, -UPPER_PENDULUM_HEIGHT, 0.0));
    lowerPendulum();

    requestAnimFrame(render);
}



