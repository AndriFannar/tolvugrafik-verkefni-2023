let movement = false;
let spinX = 0;
let spinY = 0;
let origX;
let origY;
let zDist;
let noFish = 20;

let fishArray = [];
let cube;
let fishTank;

let cubeSize = 3;

function initScene()
{
    cube = new Cube(cubeSize, [vec4(0.4, 0.97, 0.83, 0.1)]);

    for (let i = 0; i < noFish; i++)
    {
        fishArray.push(new Fish(/*randomBetw(0.1, 0.05)*/0.3, [randomVec4(1,0,true), randomVec4(1,0,true), randomVec4(1,0,true)],
            randomVec3(0.01, -0.01), randomVec3(cubeSize, -cubeSize), 0.005, 0.01));
    }

    fishTank = new FishTank(fishArray, cube, 1, 30, 1, 20, 5, 0, 0.001);

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
        let newFish = document.getElementById("noFish").value;
        if (newFish >= 1) noFish = newFish;
        initScene();
    };

}
