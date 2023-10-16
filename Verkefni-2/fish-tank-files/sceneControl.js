/**
 * Verkefni 2 í TÖL105M Tölvugrafík.
 * Skrá sem stjórnar senunni.
 *
 * @author Andri Fannar Kristjánsson, afk6@hi.is
 */

// Breytur fyrir myndavél.
let movement = false;
let spinX = 0;
let spinY = 0;
let origX;
let origY;
let zDist;

// Breytur tengdar fiskabúri.
let fishArray, cube, fishTank;

// Breytur fyrir tening.
let cubeSize = 1;
let drawSides = true;
let drawOutlines = true;

// Breytur fyrir fiska.
let noFish = 10;
let fishSize = 0.3;
let fishMaxSpeed = 0.003;

// Breytur fyrir hegðun fiska.
let flockingRadius = 1.5;
let flockingAngle = 90;
let separation = 10;
let alignment = 20;
let cohesion = 5;
let freeWill = 0.3;
let alignToCentre = 1;

// Breytur fyrir þrívídd.
let anaglyph = false;
let eyesep = 0.2;


/**
 * Upphafsstillir senuna.
 */
function initScene()
{
    // Tæma fiskafylkið
    fishArray = [];

    // Búa til nýtt fiskabúr.
    cube = new Cube(cubeSize, [vec4(0.4, 0.97, 0.83, 0.1)]);

    let randomColours;

    // Búa til fiska með völdum stillingum og handahófskenndum lit.
    for (let i = 0; i < noFish; i++)
    {
        randomColours = [randomVec4(1,0,true), randomVec4(1,0,true), randomVec4(1,0,true)]

        fishArray.push(new Fish(fishSize, randomColours,
            randomVec3(fishMaxSpeed, -fishMaxSpeed), randomVec3((cubeSize - fishSize), -(cubeSize - fishSize)), fishMaxSpeed, 0.001));
    }

    // Búa til fiskabúrið.
    fishTank = new FishTank(fishArray, cube, flockingRadius, flockingAngle, separation, alignment, cohesion, freeWill, alignToCentre);

    // Endurstilla minnissvæði grafíkkorts.
    resetBuffer(cube.points, fishArray[0].points);
}


/**
 * Hreyfing hlutar með mús.
 *
 * @param zDistOrigin Fjarlægð myndavélar á Z-ás.
 */
function mouseMovement(zDistOrigin)
{
    // Setja fjarlægð myndavélar frá núllpunkti.
    zDist = zDistOrigin;

    // Hlusta eftir hvort músarhnappi er ýtt niður
    canvas.addEventListener("mousedown", function (e)
    {
        // Ef hnappi er ýtt niður er hreyfing hlutar leyfð.
        movement = true;

        // Núverandi staðsetning bendils.
        origX = e.offsetX;
        origY = e.offsetY;
        e.preventDefault();
    });

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
    })
}


/**
 * Breytir stillingum senunar frá HTML skjali.
 */
function changeParams()
{
    document.getElementById("changeParams").onclick = function()
    {
        // Passa að stærð fiska sé ekki stærri en búrið.
        let newCubeSize = document.getElementById("tankSize").value;
        let newFishSize = (document.getElementById("fishSize").value * 0.1);

        if (newCubeSize > 0)
        {
            cubeSize = newCubeSize;
            if (newFishSize > cubeSize)
            {
                // Ef stærð fiska er stærri á að velja stærð að handahófi.
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
        freeWill = (document.getElementById("freeWill").value * 0.1);
        alignToCentre = document.getElementById("centerAlignment").value;

        anaglyph = document.getElementById("anaglyph").checked;

        // Upphafsstilla senuna.
        initScene();
    };

}
