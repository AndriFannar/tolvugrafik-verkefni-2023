class FishTank
{
    constructor(fish, cube)
    {
        this.fish = fish;
        this.tank = cube;
    }


    #boundsCheck(fish)
    {
        let currentPos = fish.currentPosition;

        if ((fish.currentPosition[0] > cube.cubeBounds) || (fish.currentPosition[0] < -cube.cubeBounds))
        {
            fish.currentDirection = negate(fish.currentDirection);

        }
        /*if((fish.currentPosition.x > cube.cubeBounds || fish.currentPosition.x < -cube.cubeBounds) ||
           (fish.currentPosition.y > cube.cubeBounds || fish.currentPosition.y < -cube.cubeBounds) ||
           (fish.currentPosition.z > cube.cubeBounds || fish.currentPosition.z < -cube.cubeBounds))
        {
            fish.currentDirection(negate(fish.currentDirection));
            fish.currentPosition
        }*/
    }

    checkBounds()
    {
        this.fish.forEach(fish => this.#boundsCheck(fish));
    }
}