/**
 * Heimadæmi 6.2 í TÖL105M Tölvugrafík.
 * Forrit sem sýnir Utah Teppotinn
 * Hægt er að skipta á milli endurskinslíkans Phong og Blinn-Phong
 *
 * @author Andri Fannar Kristjánsson, afk6@hi.is
 */

// WebGL breytur.
let program;
let canvas, gl;

// Snúningur hlutar.
let movement = false;
let spinX = 0;
let spinY = 0;
let origX;
let origY;

// Fjarlægð myndavélar.
let zDist = -5.0;

// Vigrar fyrir lookAt.
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

// Vigrar fyrir sjónvörpun.
const fovy = 50.0;
const near = 0.2;
const far = 100.0;
const vc = vec4(-0.816497, -0.471405, 0.333333, 1);

// Setja búta- og hnútalitaranum hvort nota eigi Phong eða Blinn-Phong.
let blinnPhongLoc;
let blinnPhong = 0.0;

// Minnissvæði hnúta og þvervigra.
let vBuffer;
let nBuffer;

// Uniform breytur fyrir ljósgjafa.
let lightLoc;

// Stillingar fyrir ljósvigur.
const lightPosition = vec4(1.0, 1.0, 1.0, 0.0);
const lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
const lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
const lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

// Stillingar fyrir lýsingu á tepottinum.
const materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
const materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
const materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
const materialShininess = 150.0;

// Fylki fyrir hnúta og þvervigra.
let points = [];
let normals = [];

// Uniform breyta og fylki fyrir þvervigra.
var normalMatrix, normalMatrixLoc;

/**
 * Keyrt þegar vefsíða er sótt.
 */
onload = function init()
{
    // Hlaða inn canvas hlutanum.
    canvas = document.getElementById("gl-canvas");

    // Setja upp WebGL.
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl)
    {
        alert("WebGL isn't available");
    }

    //  Stilla teiknisvæðið.
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor( 0.9, 1.0, 1.0, 1.0 );

    // Stilla WebGL
    gl.enable( gl.DEPTH_TEST );

    //  Hlaða inn liturunum.
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

    // Búa til sjónvörpun.
    let projectionMatrix = perspective(fovy, 1.0, near, far);
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));

    // Ná í uniform-breytuna fyrir þvervigra.
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );

    // Ná í uniform-breytu til að stilla hvort endurskinslíkanið á að nota.
    blinnPhongLoc = gl.getUniformLocation(program, "blinnPhong");
    gl.uniform1f(blinnPhongLoc, blinnPhong);

    // Margfalda eiginleika ljóssins og hlutarins.
    let ambientProduct = mult(lightAmbient, materialAmbient);
    let diffuseProduct = mult(lightDiffuse, materialDiffuse);
    let specularProduct = mult(lightSpecular, materialSpecular);

    // Senda eiginleikana yfir, með staðsetningu ljóssins.
    gl.uniform4fv( gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct) );	
    lightLoc = gl.getUniformLocation(program, "lightPosition");
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


/**
 * Teiknifall.
 */
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
