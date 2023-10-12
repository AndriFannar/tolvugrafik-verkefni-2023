var movement = false;
var spinX = 0;
var spinY = 0;
var origX;
var origY;
var zDist;
let noFish = 5;

let fishArray = [];
let cube;
let fishTank;

function initScene()
{
    cube = new Cube(1.5, [vec4(0.4, 0.97, 0.83, 0.1)]);

    for (let i = 0; i < noFish; i++)
    {
        fishArray.push(new Fish(/*randomBetw(0.1, 0.05)*/0.5, [randomVec4(), randomVec4(), randomVec4()],
            randomVec3(0.01, -0.01), randomVec3(1, -1), 0.01));
    }

    fishTank = new FishTank(fishArray, cube, 1, 60, 0.1, 1, 1);

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

    canvas.addEventListener("mouseup", function (e){
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
        let newFish = document.getElementById("noFish").value;
        if (newFish >= 1) noFish = newFish;
        initScene();
    };

}
