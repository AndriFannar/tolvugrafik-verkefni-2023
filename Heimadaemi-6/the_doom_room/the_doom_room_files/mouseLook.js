let UAngle = 270;
let angleIncrement = 0.5;

let xPos = 0;
let zPos = 0;
let movementIncrement = 0.1;

function mouseLook(key, mdelta)
{
    let look = mat4();

    // Finna átt myndavélar.
    if(mdelta != null)
    {
        UAngle += (angleIncrement * mdelta) % 360;
    }

    // Reikna X- og Z- hluta.
    let currentXDir = Math.cos(radians(UAngle));
    let currentZDir = Math.sin(radians(UAngle));

    let oldXPos = xPos;
    let oldZPos = zPos;

    switch (key)
    {
        case "w": // Færa myndavél áfram í þá átt sem myndavél snýr.
            xPos += movementIncrement * currentXDir;
            zPos += movementIncrement * currentZDir;
            break;

        case "s": // Færa myndavél afturábak miðað við áttina sem myndavél snýr.
            xPos -= movementIncrement * currentXDir;
            zPos -= movementIncrement * currentZDir;
            break;

        case "a": // Færa myndavél til vinstri miðað við átt myndavélar.
            xPos += movementIncrement * currentZDir;
            zPos -= movementIncrement * currentXDir;
            break;

        case "d": // Færa myndavél til hægri miðað við átt myndavélar.
            xPos -= movementIncrement * currentZDir;
            zPos += movementIncrement * currentXDir;
            break;
    }

    let coll = collision(xPos, zPos);

    if (coll[0]) xPos = oldXPos;
    if (coll[1]) zPos = oldZPos;

    collision(xPos, zPos);

    // Búa til vigra fyrir lookAt.
    let eye = vec3(xPos, 0.5, zPos);
    let at = vec3(xPos + currentXDir, 0.5, zPos + currentZDir);
    let up = vec3(0.0, 1.0, 0.0);

    // -- Hægst að skipta út fyrir kall á lookAt(eye, at up) --

    let v = normalize( subtract(at, eye) );
    let n = normalize( cross(v, up) );
    let u = normalize( cross(n, v) );

    v = negate( v );

    look = mat4(
        vec4( n, -dot(n, eye) ),
        vec4( u, -dot(u, eye) ),
        vec4( v, -dot(v, eye) ),
        vec4()
    );

    // --

    return look;
}