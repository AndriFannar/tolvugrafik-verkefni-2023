var fishPoints = [];
var fishColours = [];

function createFish(scale, bodyColour, tailColour, finColour)
{
    fishPoints = [
        vec4( -0.50 * scale,  0.0,          0.0,          1.0 ),
        vec4(  0.20 * scale,  0.20 * scale, 0.0,          1.0 ),
        vec4(  0.50 * scale,  0.0,          0.0,          1.0 ),
        vec4(  0.50 * scale,  0.0,          0.0,          1.0 ),
        vec4(  0.20 * scale, -0.15 * scale, 0.0,          1.0 ),
        vec4( -0.50 * scale,  0.0,          0.0,          1.0 ),

        vec4( -0.50 * scale,  0.0,          0.0,          1.0 ),
        vec4( -0.65 * scale,  0.15 * scale, 0.0,          1.0 ),
        vec4( -0.65 * scale, -0.15 * scale, 0.0,          1.0 ),

        /*vec4(  0.0,           0.0,          0.0         , 1.0 ),
        vec4(  0.0,           0.0,          0.15 * scale, 1.0 ),
        vec4(  0.10 * scale,  0.0,          0.70 * scale, 1.0 )*/
    ];

    for(let i = 0; i < fishPoints.length; i++)
    {
        if      (i < 6) fishColours.push(bodyColour);
        else if (i < 9) fishColours.push(tailColour);
        //else            fishColours.push(finColour);
    }
}