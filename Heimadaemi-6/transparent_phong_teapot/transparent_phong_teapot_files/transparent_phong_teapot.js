/**
 * Heimadæmi 6.2 í TÖL105M Tölvugrafík.
 * Forrit sem sýnir Utah Teppotinn
 * Hægt er að skipta á milli endurskinslíkans Phong og Blinn-Phong
 *
 * @author Andri Fannar Kristjánsson, afk6@hi.is
 */

var normalMatrix, normalMatrixLoc;

let movement = false;     // Do we rotate?
let spinX = 0;
let spinY = 0;
let origX;
let origY;

let zDist = -5.0;

const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

const fovy = 50.0;
const near = 0.2;
const far = 100.0;
const vc = vec4(-0.816497, -0.471405, 0.333333, 1);

// Skilgreina staðsetningu uniform breytunnar fyrir ljósgjafann.
let lightLoc;
let blinnPhongLoc;
let blinnPhong = 0.0;

// Skilgreina breytur fyrir minnissvæðin
let vBuffer;
let nBuffer;

const lightPosition = vec4(1.0, 1.0, 1.0, 0.0);
const lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
const lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
const lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

const materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
const materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
const materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
const materialShininess = 150.0;
let program;
let canvas, gl;

let points = [];
let normals = [];


onload = function init()  {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );

    gl.clearColor( 0.9, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Búa til minnissvæði fyrir hnúta og þvervigra.
    vBuffer = gl.createBuffer();
    nBuffer = gl.createBuffer();

    // Búa til tepottinn.
    makeTeapot(3);

    // Sækja minnissvæði hnútanna fyrir hnútalitarann.
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    const vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // Sækja minnissvæði þvervigra fyrir hnútalitarann.
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    const vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    let projectionMatrix = perspective(fovy, 1.0, near, far);
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );

    blinnPhongLoc = gl.getUniformLocation(program, "blinnPhong");
    gl.uniform1f(blinnPhongLoc, blinnPhong);

    let ambientProduct = mult(lightAmbient, materialAmbient);
    let diffuseProduct = mult(lightDiffuse, materialDiffuse);
    let specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv( gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct) );	
    lightLoc = gl.getUniformLocation(program, "lightPosition");
    gl.uniform1f( gl.getUniformLocation(program, "shininess"), materialShininess );


    //event listeners for mouse
    canvas.addEventListener("mousedown", function(e)
    {
        movement = true;
        origX = e.clientX;
        origY = e.clientY;
        e.preventDefault();
    } );

    canvas.addEventListener("mouseup", function(e)
    {
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e)
    {
        if(movement) {
    	    spinY = ( spinY + (e.clientX - origX) ) % 360;
            spinX = ( spinX + (origY - e.clientY) ) % 360;
            origX = e.clientX;
            origY = e.clientY;
        }
    } );
    
    // Event listener for mousewheel
     window.addEventListener("wheel", function(e)
     {
         if( e.deltaY > 0.0 ) {
             zDist += 0.2;
         } else {
             zDist -= 0.2;
         }
     }  );

    // Hlusta eftir áslætti á lyklaborð.
    window.addEventListener("keydown", function (e)
    {
        switch (e.key)
        {
            case "ArrowUp":
                lightPosition[1] += 0.1; // Færa ljós jákvætt um Y-ás
                break;


            case "ArrowDown":
                lightPosition[1] -= 0.1; // Færa ljós neikvætt um Y-ás
                break;


            case "ArrowLeft":
                lightPosition[0] -= 0.1; // Færa ljós neikvætt um X-ás
                break;


            case "ArrowRight":
                lightPosition[0] += 0.1; // Færa ljós jákvætt um X-ás
                break;

            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
            case "8":
            case "9":
                makeTeapot(e.key); // Ef slegið er á talnalyklana er búinn til nýr tepottur í völdum gæðum.
                break;
        }

        e.preventDefault()
    });

    changeParams();
    render();
}


/**
 * Breytir stillingum forritsins.
 */
function changeParams()
{
    document.getElementById("changeShading").onclick = function()
    {
        blinnPhong = (blinnPhong + 1.0) % 2;

        if (blinnPhong === 1.0) document.querySelector('#changeShading').innerHTML = 'Phong';
        else document.querySelector('#changeShading').innerHTML = 'Blinn-Phong';

        gl.uniform1f(blinnPhongLoc, blinnPhong);
    };
}


/**
 * Býr til nýjan tepott í völdum gæðum og setur í rétt minnissvæði.
 *
 * @param detail Gæði tepottarins sem á að búa til.
 */
function makeTeapot(detail)
{
    // Búa til tepott með völdum gæðum.
    let myTeapot = teapot(detail);

    myTeapot.scale(0.5, 0.5, 0.5);

    // Ná í hnúta og þvervigra.
    points = myTeapot.TriangleVertices;
    normals = myTeapot.Normals;

    // Setja nýju hnútana í minnissvæði hnúta.
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Setja nýju þvervigrana í minnissvæði þvervigra.
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );
}


let render = function()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let mv = lookAt(vec3(0.0, 0.0, zDist), at, up);
    mv = mult( mv, rotateX( spinX ) );
    mv = mult( mv, rotateY( spinY ) );

    // Senda staðsetningu ljóssins á hnútalitarann.
    gl.uniform4fv(lightLoc, flatten(lightPosition) );

    gl.uniformMatrix4fv( gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(mv) );
    normalMatrix = [
        vec3(mv[0][0], mv[0][1], mv[0][2]),
        vec3(mv[1][0], mv[1][1], mv[1][2]),
        vec3(mv[2][0], mv[2][1], mv[2][2])
    ];

    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix) );

    // Sækja minnissvæði hnúta og teikna.
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.drawArrays( gl.TRIANGLES, 0, points.length);
    requestAnimFrame(render);
  }
