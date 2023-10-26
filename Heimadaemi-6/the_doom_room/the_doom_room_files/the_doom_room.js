/**
 * Heimadæmi 6.5 í TÖL105M Tölvugrafík.
 * Forrit með veggi, gólf og himinn.
 *
 * @author Andri Fannar Kristjánsson, afk6@hi.is
 */
let canvas;
let gl;

const numVertices = 6;

let program;

let texture;
let texWall;
let texFloor;
let texSky;

let movement = false;
const spinX = 0;
const spinY = 0;
let origX;
let origY;

let zDist = -5.0;

let proLoc;
let mvLoc;

let mv;

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

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    const vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    const vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    const tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoords), gl.STATIC_DRAW );

    const vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );

    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);

    let wall = new Image();
    wall.src = "./the_doom_room_files/Bricks.jpg";
    wall.onload = function () {
        texWall = gl.createTexture();
        initTexture(texWall, wall);
    }

    let floor = new Image();
    floor.src = "./the_doom_room_files/Plank.jpg";
    floor.onload = function () {
        texFloor = gl.createTexture();
        initTexture(texFloor, floor);
    }

    let sky = new Image();
    sky.src = "./the_doom_room_files/Sky.jpg";
    sky.onload = function ()
    {
        texSky = gl.createTexture();
        initTexture(texSky, sky);
    }


    proLoc = gl.getUniformLocation( program, "projection" );
    mvLoc = gl.getUniformLocation( program, "modelview" );

    const proj = perspective(50.0, 1.0, 0.2, 100.0);
    gl.uniformMatrix4fv(proLoc, false, flatten(proj));


    //event listeners for mouse
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.clientX;
    } );

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
            mv = mouseLook(null, (origX - e.clientX));
            origX = e.clientX;
        }
    } );

    // Event listener for keyboard
    window.addEventListener("keydown", function(e)
    {
        mv = mouseLook(e.key);
    }  );

    // Event listener for mousewheel
    window.addEventListener("wheel", function(e){
        if( e.deltaY > 0.0 ) {
            zDist += 0.2;
        } else {
            zDist -= 0.2;
        }
    }  );


    mv = mouseLook();

    render();
}


function collision(xPos, zPos)
{
    let coll = [false, false];
    xPos = Math.abs(xPos);

    if((zPos > -collisionPointRoom) || (xPos >= collisionPointHallway))
    {
        zPos = Math.abs(zPos);
        if (xPos > collisionPointRoom) coll[0] = true;
        if (zPos > collisionPointRoom) coll[1] = true;
    }
    else if (zPos > -collisionPointRoom - 10)
    {
        console.log(xPos, " > ", collisionPointHallway - 0.1, " = ", (xPos > collisionPointHallway - 0.1));
        console.log("Before:", coll);
        if (xPos > collisionPointHallway - movementIncrement) coll[0] = true;
        console.log("After:", coll);
    }
    return coll;
}


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


function renderWall(translation, rotation)
{
    gl.bindTexture( gl.TEXTURE_2D, texWall );
    let wallMV = mult(mv, rotateY(rotation));
    wallMV = mult(wallMV, translate(translation));
    gl.uniformMatrix4fv(mvLoc, false, flatten(wallMV));
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );
}

function renderGround(texture, translation)
{
    gl.bindTexture( gl.TEXTURE_2D, texture );
    let groundMV = mult(mv, translate(translation));
    gl.uniformMatrix4fv(mvLoc, false, flatten(groundMV));
    gl.drawArrays( gl.TRIANGLES, numVertices, numVertices );
}


const render = function(){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    renderWall(vec3(0, 0, 5), 0);
    renderWall(vec3(-6, 0, -5), 0);
    renderWall(vec3(6, 0, -5), 0);
    renderWall(vec3(0, 0, -5), 90);
    renderWall(vec3(0, 0, 5), 90);
    renderWall(vec3(10, 0, 1), 90);
    renderWall(vec3(10, 0, -1), 90);

    renderGround(texFloor, vec3(0, 0, 0));
    renderGround(texFloor, vec3(0, 0, -10));
    renderGround(texSky, vec3(0, 1, 0));
    renderGround(texSky, vec3(0, 1, -10));

    requestAnimFrame(render);
};