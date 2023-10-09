var movement = false;
var spinX = 0;
var spinY = 0;
var origX;
var origY;
var zDist;

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
