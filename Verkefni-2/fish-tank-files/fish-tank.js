class FishTank
{
    constructor(fish, cube, flockingRadius = 1, flockingAngle= 1, separation= 1, alignment = 1, cohesion = 1, freeWill = 1, alignToCentre = 0.1)
    {
        this.fish = fish;
        this.tank = cube;

        this.flockingRadius = flockingRadius;
        this.flockingAngle = flockingAngle * (Math.PI / 180);

        this.seperation = separation;
        this.alignment = alignment;
        this.cohesion = cohesion;
        this.freeWill = freeWill;
        this.alignToCentre = alignToCentre;
    }


    checkBounds(fish)
    {
        if(fish.currentBoundTimeout > 100)
        {
            fish.currentPosition = vec3(0.0, 0.0, 0.0);
            fish.currentBoundTimeout = -fish.currentBoundTimeout;
            return;
        }

        fish.currentBoundTimeout = -1;

        let fishBoundingBox = fish.boundingBox.slice();
        let fishPosition = fish.currentPosition.slice();

        let tankBounds = this.tank.cubeBounds;

        let normDirection = normalize(fish.currentDirection);

        let outermostPoint = vec3(
            fishPosition[0] + fishBoundingBox[0][0] * normDirection[0],
            fishPosition[1] + fishBoundingBox[0][0] * normDirection[1],
            fishPosition[2] + fishBoundingBox[0][0] * normDirection[2]
        );

        if (((outermostPoint[0] >= tankBounds) || (outermostPoint[0] <= -tankBounds)) ||
            ((outermostPoint[1] >= tankBounds) || (outermostPoint[1] <= -tankBounds)) ||
            ((outermostPoint[2] >= tankBounds) || (outermostPoint[2] <= -tankBounds)))
        {
            fish.currentPosition = vec3(
                -1 * fishPosition[0],
                -1 * fishPosition[1],
                -1 * fishPosition[2]
            );

            fish.currentBoundTimeout = 50;
        }

    }

    #distanceToFish(referenceFish, fish)
    {
        return vec3(fish.currentPosition[0] - referenceFish.currentPosition[0],
                    fish.currentPosition[1] - referenceFish.currentPosition[1],
                    fish.currentPosition[2] - referenceFish.currentPosition[2]);
    }

    #findNeighbors(referenceFish)
    {
        let neighborhood = [];
        let distToFish;

        for(const fish of this.fish)
        {
            if (fish !== referenceFish)
            {
                distToFish = this.#distanceToFish(referenceFish, fish);

                if ((length(distToFish) <= this.flockingRadius) &&
                    (angleBetweenVectors(referenceFish.currentDirection, distToFish) <= this.flockingAngle))
                {
                    neighborhood.push(fish);
                }
            }
        }

        return neighborhood.slice();
    }

    calculateMovement()
    {
        for (const referenceFish of this.fish)
        {
            let neighborhood = [];

            let fishSeparation;
            let fishAlignment;
            let fishCohesion;

            let newDirection;

            neighborhood = this.#findNeighbors(referenceFish);

            fishSeparation = vec3(0, 0, 0);
            fishAlignment = vec3(0, 0, 0);
            fishCohesion = vec3(0, 0, 0);

            newDirection = vec3(0, 0, 0);

            let freeWillDir = referenceFish.currentDirection;
            let maxDirSpeed = referenceFish.maximumSpeed / 3.0;
            let randomDev = randomVec3(maxDirSpeed, -maxDirSpeed);
            let toCentre = vec3(0, 0, 0);

            if (length(referenceFish.currentPosition) > 0)
            {
                toCentre = normalize(negate(referenceFish.currentPosition));
            }

            for(let i = 0; i < 3; i++)
            {
                freeWillDir[i] = (freeWillDir[i] + randomDev[i] + (toCentre[i] * this.alignToCentre)) * this.freeWill;
            }

            if (neighborhood.length > 0)
            {
                //console.log("Number of Neighbors: ", neighborhood.length);
                for (const fish of neighborhood)
                {
                    fishSeparation = add(fishSeparation, negate(this.#distanceToFish(referenceFish, fish)));

                    fishAlignment = add(fishAlignment, fish.currentDirection);

                    fishCohesion = add(fishCohesion, fish.currentPosition);
                }

                console.log("Sep: ", fishSeparation);

                for (let i = 0; i < 3; i++)
                {
                    fishSeparation[i] = fishSeparation[i] / neighborhood.length;
                    fishAlignment[i] = fishAlignment[i] / neighborhood.length;
                    fishCohesion[i] = fishCohesion[i] / neighborhood.length;

                    newDirection[i] = (fishSeparation[i] * this.seperation) + (fishAlignment[i] * this.alignment) + (fishCohesion[i] * this.cohesion) + freeWillDir[i];
                }
            }
            else
            {
                newDirection = freeWillDir;
            }

            if (length(newDirection) > 0)
            {
                referenceFish.currentDirection = newDirection.slice();
            }
        }
    }
}