/////////////////////////////////////////////////////////////////
//    Heimadæmi 4-4 í Tölvugrafík.
//     Sólkerfi, þar sem hægt er að auka/minnka hraða snúnings jarðar
//     og fjarlægð frá sólu.
//
//    Andri Fannar Kristjánsson, 26. september 2023.
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

// Fjöldi hnúta
var numVertices  = 36;

// Fylki fyrir hnúta og liti.
var points = [];
var colors = [];

// Er notandinn að snúa hlutnum.
var movement = false;

// Upphafsstaða snúnings.
var spinX = -30;
var spinY = 40;

// Staðsetning bendils.
var origX;
var origY;

// Snúningur jarðarinnar um sólina.
var rotYear = 0.0;
var rotYearSpeed = 1.0;

// Fjarlægð jarðar frá sólinni.
var sunDistance = 1.8;

// Snúningur jarðarinnar um sig sjálfa.
var rotDay = 0.0;

// Halli jarðar.
var earthTilt = 23.5;

// Uniform breyta í hnútalitarann.
var matrixLoc;


window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    colorCube();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    // Hlaða inn liturum.
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    matrixLoc = gl.getUniformLocation( program, "rotation" );

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

    canvas.addEventListener("mousemove", function(e){
        // Ef músin hreyfist og músarhnappur er niðri snýst hluturinn.
        if(movement) {
    	    spinY = ( spinY + (origX - e.offsetX) ) % 360;
            spinX = ( spinX + (origY - e.offsetY) ) % 360;
            origX = e.offsetX;
            origY = e.offsetY;
        }
    } );

    window.addEventListener("keydown", function(e){
        switch (e.key) 
        {
        case "ArrowUp":
            // Ef ýtt er á upp örvahnappinn hraðast á snúning jarðar um sólina.
            rotYearSpeed += 0.01;       
            break;


        case "ArrowDown":
            // Ef ýtt er á niður örvahnappinn hægist á snúning jarðar um sólina.
            rotYearSpeed -= 0.01;       
            break;


        case "ArrowLeft":
            // Ef ýtt er á vinstri örvahnappinn færist jörðin nær sólinni.
            sunDistance -= 0.005;
            break;


        case "ArrowRight":
            // Ef ýtt er á hægri örvahnappinn færist jörðin fjær sólinni.
            sunDistance += 0.005;
            break;
        }  
    } );

    render();
}

/**
 * Býr til tening.
 */
function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

/**
 * Býr til eina hlið á ferhyrning.
 * 
 * @param {*} a Einn hnútur ferhyrningsins
 * @param {*} b Einn hnútur ferhyrningsins
 * @param {*} c Einn hnútur ferhyrningsins
 * @param {*} d Einn hnútur ferhyrningsins
 */
function quad(a, b, c, d) 
{
    var vertices = [
        vec3( -0.5, -0.5,  0.5 ),
        vec3( -0.5,  0.5,  0.5 ),
        vec3(  0.5,  0.5,  0.5 ),
        vec3(  0.5, -0.5,  0.5 ),
        vec3( -0.5, -0.5, -0.5 ),
        vec3( -0.5,  0.5, -0.5 ),
        vec3(  0.5,  0.5, -0.5 ),
        vec3(  0.5, -0.5, -0.5 )
    ];

    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
        [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
        [ 1.0, 1.0, 1.0, 1.0 ]   // white
    ];

    //vertex color assigned by the index of the vertex
    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        colors.push(vertexColors[a]);
        
    }
}

/**
 * Teikna á teikniborðið.
 */
function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    rotDay += 10.0;
    rotYear += 0.5 * rotYearSpeed;

    var mv = mat4();
    mv = mult( mv, rotateX(spinX) );
    mv = mult( mv, rotateY(spinY) );

    // teikna "sólina"
    mv = mult( mv, scalem( 0.5, 0.5, 0.5 ) );
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv));
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );

    // teikna "jörðina"
    mv = mult( mv, rotateY( rotYear ) );
    mv = mult( mv, translate( sunDistance, 0.0, 0.0 ) );
    mv = mult( mv, rotateZ( earthTilt ) );
    mv = mult( mv, rotateY( rotDay ) );

    mv = mult( mv, scalem( 0.2, 0.2, 0.2 ) );
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv));
    gl.drawArrays( gl.TRIANGLES, 0, numVertices );

    requestAnimFrame( render );
}
