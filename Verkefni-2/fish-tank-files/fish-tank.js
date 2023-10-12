class FishTank
{
    constructor(fish, cube)
    {
        this.fish = fish;
        this.tank = cube;
    }


    #boundsCheck(fish)
    {
        let currentPos = fish.currentPosition.slice();
        let boundingBox = fish.boundingBox.slice();

        for(let i = 0; i < 3; i++)
        {
            if ((currentPos[i] + boundingBox[0][i]) >= this.tank.cubeBounds)
            {
                let newPos = fish.currentPosition.slice();
                newPos[i] = (-1 * newPos[i]) - (boundingBox[1][i] + boundingBox[0][i]);
                fish.currentPosition = newPos.slice();

            }
            else if ((currentPos[i] + boundingBox[1][i]) <= -this.tank.cubeBounds)
            {
                let newPos = fish.currentPosition.slice();
                newPos[i] = (-1 * newPos[i]) - (boundingBox[0][i] + boundingBox[1][i]);
                fish.currentPosition = newPos.slice();
            }
        }
    }

    checkBounds()
    {
        this.fish.forEach(fish => this.#boundsCheck(fish));
    }
}