class Fish
{
    constructor(scale = 1, colours = [vec4(1, 0, 0, 1), vec4(0, 1, 0, 1), vec4(0, 0, 1, 1)],
                initDirection = vec3(0.01, 0, 0), initPos = vec3(0, 0, 0), maxSpeed = 1, maxTurn = 3,
                tailIncrement = 2.0, maxTailRotation = 35, finIncrement = 1.0, maxFinRotation = 25)
    {
        this.fishBodyPoints = [
            vec4(-0.50 * scale,  0.0         ,  0.0, 1.0),
            vec4( 0.20 * scale,  0.20 * scale,  0.0, 1.0),
            vec4( 0.50 * scale,  0.0         ,  0.0, 1.0),
            vec4( 0.50 * scale,  0.0         ,  0.0, 1.0),
            vec4( 0.20 * scale, -0.15 * scale,  0.0, 1.0),
            vec4(-0.50 * scale,  0.0         ,  0.0, 1.0)
        ];

        this.fishTailPoints = [
            vec4(-0.50 * scale,  0.0         ,  0.0, 1.0),
            vec4(-0.65 * scale,  0.15 * scale,  0.0, 1.0),
            vec4(-0.65 * scale, -0.15 * scale,  0.0, 1.0)
        ];

        this.fishFinPoints = [
            vec4( 0.15 * scale,  0.0          ,  0.0        , 1.0 ),
            vec4( 0.15 * scale,  0.0          , -0.2 * scale, 1.0 ),
            vec4( 0.0         ,  0.0          ,  0.0        , 1.0 ),

            vec4( 0.15 * scale,  0.0          ,  0.0        , 1.0 ),
            vec4( 0.0         ,  0.0          ,  0.0        , 1.0 ),
            vec4( 0.15 * scale,  0.0          ,  0.2 * scale, 1.0 )
        ];

        this.fishColours = colours;

        this.bounds =  [vec3(this.fishBodyPoints[2][0], this.fishBodyPoints[1][0], this.fishFinPoints[5][2]),
                        vec3(this.fishTailPoints[1][0], this.fishTailPoints[2][1], this.fishFinPoints[1][2])];

        this.tailRot = 0;
        this.tailIncrement = tailIncrement;
        this.maxTailRotation = maxTailRotation;

        this.finRot = 0;
        this.finIncrement = finIncrement;
        this.maxFinRotation = maxFinRotation;

        this.currentDir = initDirection;
        this.currentPos = initPos;
        this.maxSpeed = maxSpeed;

        this.maxChange = Math.sin((maxTurn * (Math.PI / 180)));

        console.log(this.bounds);
    }

    get points()
    {
        return this.fishBodyPoints.concat(this.fishTailPoints.concat(this.fishFinPoints));
    }

    get bodyPoints()
    {
        return this.fishBodyPoints;
    }

    get tailPoints()
    {
        return this.fishTailPoints;
    }

    get finPoints()
    {
        return this.fishFinPoints;
    }

    get colours()
    {
        return this.fishColours;
    }

    get tailRotation()
    {
        this.tailRot += this.tailIncrement;

        if( this.tailRot > this.maxTailRotation  || this.tailRot < -this.maxTailRotation )
        {
            this.tailIncrement *= -1;
        }

        return this.tailRot;
    }


    get finRotation()
    {
        this.finRot += this.finIncrement;

        if( this.finRot > this.maxFinRotation  || this.finRot < -this.maxFinRotation )
        {
            this.finIncrement *= -1;
        }

        return this.finRot;
    }


    get currentDirection()
    {
        return this.currentDir.slice();
    }


    set currentDirection(newDirection)
    {
        /*let dotProduct = 0;
        let magnitudeOld = 0;
        let magnitudeNew = 0;

        for (let i = 0; i < 3; i++) {
            dotProduct += this.currentDir[i] * newDirection[i];
            magnitudeOld += this.currentDir[i] * this.currentDir[i];
            magnitudeNew += newDirection[i] * newDirection[i];
        }

        magnitudeOld = Math.sqrt(magnitudeOld);
        magnitudeNew = Math.sqrt(magnitudeNew);

        if (magnitudeOld === 0 || magnitudeNew === 0) {
            return;
        }

        const cosAngle = dotProduct / (magnitudeOld * magnitudeNew);
        const angle = Math.acos(cosAngle) * (180 / Math.PI);

        console.log(angle);*/

        /*for(let i = 0; i < 3; i++)
        {
            if((this.currentDir[i] * newDirection[i]) < 0)
            {

            }
        }*/

        let maxChangeIndiv = this.maxChange / 3;

        for (let i = 0; i < 3; i++)
        {
            if((newDirection[i] - this.currentDir[i]) > maxChangeIndiv)
            {
                console.log("New larger.");
                this.currentDir[i] += maxChangeIndiv;
            }
            else if ((this.currentDir[i] - newDirection[i]) > maxChangeIndiv)
            {
                console.log("New less than.");
                this.currentDir[i] -= maxChangeIndiv;
            }
            else
            {
                console.log("New inside margin.");
                this.currentDir[i] = newDirection[i];
            }
        }

        if (length(this.currentDir) > this.maxSpeed)
        {
            this.currentDir = normalize(this.currentDir);

            for (let i = 0; i < 3; i++)
            {
                this.currentDir[i] = this.currentDir[i] * this.maxSpeed;
            }
        }

    }


    get currentPosition()
    {
        return this.currentPos.slice();
    }


    set currentPosition(newPosition)
    {
        this.currentPos = newPosition.slice();
    }


    get move()
    {
        for (let i = 0; i < 3; i++)
        {
            this.currentPos[i] += this.currentDir[i];
        }

        return this.currentPos.slice();
    }


    get boundingBox()
    {
        return this.bounds.slice();
    }


}