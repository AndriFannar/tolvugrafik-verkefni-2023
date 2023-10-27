/**
 * Heimadæmi 6.5 í TÖL105M Tölvugrafík.
 * Forrit með veggi, gólf og himni.
 *
 * @author Andri Fannar Kristjánsson, afk6@hi.is
 */
// WebGL breytur.
let program;
let canvas, gl;

// Fjöldi hnúta í ferhyrningi.
const numVertices = 6;

// Breytur fyrir mynstur.
let texture;
let texWall;
let texFloor;
let texSky;

// Snúningur myndavélar.
let movement = false;
let spinX = 0;
let spinY = 0;
let origX;
let origY;

// Fjarlægð myndavélar.
let zDist = -5.0;

// Uniform breytur.
let proLoc;
let mvLoc;

// Vörpunarfylki.
let mv;

// Staðsetning áreksturs.
let collisionPointRoom = 4.7;
let collisionPointHallway = 0.8;

// Hnútar umhverfis.
const vertices = [
    // Hnútar veggja.
    vec4(-5.0, 0.0, 0.0, 1.0),
    vec4( 5.0, 0.0, 0.0, 1.0),
    vec4( 5.0, 1.0, 0.0, 1.0),
    vec4( 5.0, 1.0, 0.0, 1.0),
    vec4(-5.0, 1.0, 0.0, 1.0),
    vec4(-5.0, 0.0, 0.0, 1.0),
    // Hnútar gólfs og himins.
    vec4( -5.0,  0.0,  5.0, 1.0 ),
    vec4(  5.0,  0.0,  5.0, 1.0 ),
    vec4(  5.0,  0.0, -5.0, 1.0 ),
    vec4(  5.0,  0.0, -5.0, 1.0 ),
    vec4( -5.0,  0.0, -5.0, 1.0 ),
    vec4( -5.0,  0.0,  5.0, 1.0 )
];

// Mynsturhnit fyrir umhverfi.
const texCoords = [
    // Veggir.
    vec2(0.0, 0.0),
    vec2(40.0, 0.0),
    vec2(40.0, 4.0),
    vec2(40.0, 4.0),
    vec2(0.0, 4.0),
    vec2(0.0, 0.0),
    // Gólf og himinn.
    vec2(0.0, 0.0),
    vec2(40.0, 0.0),
    vec2(40.0, 40.0),
    vec2(40.0, 40.0),
    vec2(0.0, 40.0),
    vec2(0.0, 0.0),
];

window.onload = function init()
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

    // Búa til minnissvæði fyrir hnúta.
    const vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Sækja minnissvæði hnútanna fyrir hnútalitarann.
    const vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // Búa til minnissvæði fyrir mynstur.
    const tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoords), gl.STATIC_DRAW );

    // Sækja minnissvæði mynsturs fyrir hnútalitarann.
    const vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );

    // Uniform breyta fyrir mynstur í bútalitara.
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);

    // Búa til mynstur fyrir veggi.
    let wall = new Image();
    wall.src = "./the_doom_room_files/Bricks.jpg";
    wall.onload = function () {
        texWall = gl.createTexture();
        initTexture(texWall, wall);
    }

    // Búa til mynstur fyrir gólf.
    let floor = new Image();
    floor.src = "./the_doom_room_files/Plank.jpg";
    floor.onload = function () {
        texFloor = gl.createTexture();
        initTexture(texFloor, floor);
    }

    // Búa til mynstur fyrir himinn.
    let sky = new Image();
    sky.src = "./the_doom_room_files/Sky.jpg";
    sky.onload = function ()
    {
        texSky = gl.createTexture();
        initTexture(texSky, sky);
    }

    // Uniform breytur fyrir vörpunarfylki og sjónvörpun.
    proLoc = gl.getUniformLocation( program, "projection" );
    mvLoc = gl.getUniformLocation( program, "modelview" );

    // Búa til sjónvörpun.
    const proj = perspective(50.0, 1.0, 0.2, 100.0);
    gl.uniformMatrix4fv(proLoc, false, flatten(proj));


    // Hlusta eftir hvort músarhnappi er ýtt niður
    canvas.addEventListener("mousedown", function(e)
    {
        // Ef hnappi er ýtt niður er hreyfing hlutar leyfð.
        movement = true;
        origX = e.clientX;
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
            mv = mouseLook(null, (origX - e.clientX));
            origX = e.clientX;
        }
    } );

    // Hlusta eftir áslætti á lyklaborð.
    window.addEventListener("keydown", function(e)
    {
        mv = mouseLook(e.key);
    }  );

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

    // Upphafsstilla vörpunarfylkið frá mouseLook.
    mv = mouseLook();

    render();
}


/**
 * Athugar hvort árekstur hafi átt sér stað.
 *
 * @param xPos          Staðsetning á x-ás.
 * @param zPos          Staðsetning á z-ás.
 * @returns {boolean[]} Fylki sem segir til um hvort árekstur sé á x- eða z-ás.
 */
function collision(xPos, zPos)
{
    let coll = [false, false];
    xPos = Math.abs(xPos);

    // Athuga árekstur innan herbergis.
    if((zPos > -collisionPointRoom) || (xPos >= collisionPointHallway))
    {
        zPos = Math.abs(zPos);
        if (xPos > collisionPointRoom) coll[0] = true;
        if (zPos > collisionPointRoom) coll[1] = true;
    }
    // Athuga árekstur í ganginum.
    else if (zPos > -collisionPointRoom - 10)
    {
        console.log(xPos, " > ", collisionPointHallway - 0.1, " = ", (xPos > collisionPointHallway - 0.1));
        console.log("Before:", coll);
        if (xPos > collisionPointHallway - movementIncrement) coll[0] = true;
        console.log("After:", coll);
    }
    return coll;
}


/**
 * Upphafsstilla mynstur.
 *
 * @param tex   Breyta fyrir mynstrið.
 * @param image Mynstur.
 */
function initTexture(tex, image)
{
    gl.bindTexture( gl.TEXTURE_2D, tex );

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
}


/**
 * Teiknar vegg.
 *
 * @param translation Hvernig á að færa vegginn.
 * @param rotation    Hvernig á að snúa veggnum.
 */
function renderWall(translation, rotation)
{
    gl.bindTexture( gl.TEXTURE_2D, texWall );
    let wallMV = mult(mv, rotateY(rotation));
    wallMV = mult(wallMV, translate(translation));
    gl.uniformMatrix4fv(mvLoc, false, flatten(wallMV));
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );
}


/**
 * Teiknar gólf (þak).
 *
 * @param texture     Mynstur sem á að nota.
 * @param translation Tilfærsla gólfsins.
 */
function renderGround(texture, translation)
{
    gl.bindTexture( gl.TEXTURE_2D, texture );
    let groundMV = mult(mv, translate(translation));
    gl.uniformMatrix4fv(mvLoc, false, flatten(groundMV));
    gl.drawArrays( gl.TRIANGLES, numVertices, numVertices );
}


/**
 * Teikna.
 */
const render = function(){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Teikna veggi.
    renderWall(vec3(0, 0, 5), 0);
    renderWall(vec3(-6, 0, -5), 0);
    renderWall(vec3(6, 0, -5), 0);
    renderWall(vec3(0, 0, -5), 90);
    renderWall(vec3(0, 0, 5), 90);
    renderWall(vec3(10, 0, 1), 90);
    renderWall(vec3(10, 0, -1), 90);

    // Teikna gólf.
    renderGround(texFloor, vec3(0, 0, 0));
    renderGround(texFloor, vec3(0, 0, -10));
    renderGround(texSky, vec3(0, 1, 0));
    renderGround(texSky, vec3(0, 1, -10));

    requestAnimFrame(render);
};