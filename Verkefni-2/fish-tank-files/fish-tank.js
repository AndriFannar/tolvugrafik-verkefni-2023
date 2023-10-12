class FishTank
{
    constructor(fish, cube, flockingRadius = 1, flockingAngle= 1, separation= 1, alignment = 1, cohesion = 1)
    {
        this.fish = fish;
        this.tank = cube;

        this.flockingRadius = flockingRadius;
        this.flockingAngle = flockingAngle;

        this.seperation = separation;
        this.alignment = alignment;
        this.cohesion = cohesion;
    }


    checkBounds(fish)
    {
        let boundingBox = fish.projectedBoundingBox.slice();

        for(let i = 0; i < 3; i++)
        {
            if(boundingBox[0][i] >= this.tank.cubeBounds)
            {
                console.log(boundingBox);
                let newPos = fish.currentPosition.slice();
                newPos[i] = -this.tank.cubeBounds - boundingBox[1][i];
                fish.currentPosition = newPos;

                console.log("Fish has instersected bounds on coordinate ", i, ", where the calculated position is ", boundingBox[0][i], ", with cube bounds ", this.tank.cubeBounds, ". New position is calculated as ", newPos);


            }
            else if (boundingBox[1][i] <= -this.tank.cubeBounds)
            {
                let newPos = fish.currentPosition.slice();
                newPos[i] = this.tank.cubeBounds + boundingBox[1][i];
                fish.currentPosition = newPos;

                console.log("Fish has instersected bounds on coordinate ", i, ", where the calculated position is ", boundingBox[0][i], ", with cube bounds ", -this.tank.cubeBounds, ". New position is calculated as ", newPos);
            }
        }
    }

    #angleBetweenVectors(vec1, vec2)
    {
        return Math.acos((dot(vec1,  vec2) / (length(vec1) * length(vec2))));
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
                    (this.#angleBetweenVectors(referenceFish.currentDirection, distToFish) <= this.flockingAngle))
                {
                    neighborhood.push(fish);
                }
            }
        }

        return neighborhood.slice();
    }

    calculateFlocking()
    {
        let neighborhood = [];

        let fishDist;

        let fishSeparation;
        let fishAlignment;
        let fishCohesion;

        let newDirection;

        for (const referenceFish of this.fish)
        {
            neighborhood = this.#findNeighbors(referenceFish);

            fishSeparation = vec3(this.flockingRadius, this.flockingRadius, this.flockingRadius);
            fishAlignment = vec3(0, 0, 0);
            fishCohesion = vec3(0, 0, 0);

            //console.log("Fish ", referenceFish, " has ", neighborhood.length, " neighbors: ", neighborhood);

            if (neighborhood.length > 0)
            {
                for (const fish of neighborhood)
                {
                    fishDist = this.#distanceToFish(referenceFish, fish);

                    if (length(fishDist) < length(fishSeparation)) fishSeparation = fishDist;

                    fishAlignment = add(fishAlignment, fish.currentDirection);

                    fishCohesion = add(fishCohesion, fish.currentPosition);
                }

                for (let i = 0; i < 3; i++)
                {
                    fishAlignment[i] = fishAlignment[i] / neighborhood.length;
                    fishCohesion[i] = fishCohesion[i] / neighborhood.length;
                }

                newDirection = vec3(0, 0, 0);

                for (let i = 0; i < 3; i++)
                {
                    newDirection[i] = (fishSeparation[i] * this.seperation) + (fishAlignment[i] * this.alignment) + (fishCohesion[i] * this.cohesion);
                }

                referenceFish.currentDirection = normalize(newDirection.slice());
            }
        }
    }
}