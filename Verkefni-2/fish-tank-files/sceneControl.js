let movement = false;
let spinX = 0;
let spinY = 0;
let origX;
let origY;
let zDist;
let noFish = 10;

let fishArray, cube, fishTank;

let cubeSize = 1;
let drawSides = true;
let drawOutlines = true;

let fishSize = 0.3;
let fishMaxSpeed = 0.005;

let flockingRadius = 1;
let flockingAngle = 30;
let separation = 1;
let alignment = 1;
let cohesion = 1;
let freeWill = 1;
let alignToCentre = 0.0001;

let anaglyph = false;
let eyesep = 0.2;

function initScene()
{
    fishArray = [];

    cube = new Cube(cubeSize, [vec4(0.4, 0.97, 0.83, 0.1)]);

    let randomColours;

    for (let i = 0; i < noFish; i++)
    {
        randomColours = [randomVec4(1,0,true), randomVec4(1,0,true), randomVec4(1,0,true)]

        fishArray.push(new Fish(fishSize, randomColours,
            randomVec3(fishMaxSpeed, -fishMaxSpeed), randomVec3((cubeSize - fishSize), -(cubeSize - fishSize)), fishMaxSpeed, 0.001));
    }

    fishTank = new FishTank(fishArray, cube, flockingRadius, flockingAngle, separation, alignment, cohesion, freeWill, alignToCentre);

    resetBuffer(cube.points, fishArray[0].points);
}

function mouseMovement(zDistOrigin)
{
    zDist = zDistOrigin;

    canvas.addEventListener("mousedown", function (e){
        movement = true;
        origX = e.offsetX;
        origY = e.offsetY;
        e.preventDefault();
    });

    canvas.addEventListener("mouseup", function (){
        movement = false;
    });

    canvas.addEventListener("mousemove", function (e){
        if(movement)
        {
            spinY = ( spinY + (origX - e.offsetX)) % 360;
            spinX = ( spinX + (e.offsetY - origY)) % 360;
            origX = e.offsetX;
            origY = e.offsetY;
        }
    });

    canvas.addEventListener("wheel", function (e){
        e.preventDefault();
        if(e.deltaY > 0.0)
        {
            zDist += 0.2;
        }
        else
        {
            zDist -= 0.2;
        }
    })
}


/**
 * Breytir stillingum leiksins.
 */
function changeParams()
{
    document.getElementById("changeParams").onclick = function()
    {
        let newCubeSize = document.getElementById("tankSize").value;
        let newFishSize = (document.getElementById("fishSize").value * 0.1);

        if (newCubeSize > 0)
        {
            cubeSize = newCubeSize;
            if (newFishSize > cubeSize)
            {
                fishSize = randomBetw(cubeSize, 0.1);
            }
        }

        if ((newFishSize < cubeSize) && (newFishSize > 0)) fishSize = newFishSize;

        let newNoFish = document.getElementById("noFish").value;
        if (newNoFish >= 1) noFish = newNoFish;

        fishMaxSpeed = (document.getElementById("maxSpeed").value * 0.001);

        drawOutlines = document.getElementById("drawOutlines").checked;
        drawSides = document.getElementById("drawSides").checked;

        flockingRadius = document.getElementById("flockingRadius").value;
        flockingAngle = document.getElementById("flockingAngle").value;
        separation = document.getElementById("separation").value;
        alignment = document.getElementById("alignment").value;
        cohesion = document.getElementById("cohesion").value;
        freeWill = document.getElementById("freeWill").value;
        alignToCentre = document.getElementById("centerAlignment").value;

        anaglyph = document.getElementById("anaglyph").checked;

        initScene();
    };

}
