var cubePoints = [];
var cubeColours = [];

function createCube(size, colours)
{
    let sideColours = [];

    if (colours.length === 1)
    {
        for(let i = 0; i < 6; i++)
        {
            sideColours.push(colours);
        }
    }
    else
    {
        sideColours = colours;
    }

    quad(1, 0, 3, 2, size, sideColours[0]);
    quad(2, 3, 7, 6, size, sideColours[1]);
    quad(3, 0, 4, 7, size, sideColours[2]);
    quad(6, 5, 1, 2, size, sideColours[3]);
    quad(4, 5, 6, 7, size, sideColours[4]);
    quad(5, 4, 0, 1, size, sideColours[5]);
}

function quad(a, b, c, d, size, sideColour)
{
    var vertices = [
        vec3(-size, -size,  size),
        vec3(-size,  size,  size),
        vec3( size,  size,  size),
        vec3( size, -size,  size),
        vec3(-size, -size, -size),
        vec3(-size,  size,  size),
        vec3( size,  size,  size),
        vec3( size, -size,  size)
    ]

    var indices = [ a, b, c, a, c, d];

    for (var i = 0; i < indices.length; ++i)
    {
        cubePoints.push(vertices[indices[i]]);
        cubeColours.push(sideColour);
    }
}