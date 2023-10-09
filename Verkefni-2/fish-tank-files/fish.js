class Fish
{
    constructor(scale, bodyColour, tailColour, finColour, tailIncrement = 2.0, maxTailRotation = 35, finIncrement = 1.0, maxFinRotation = 25)
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

        this.fishColours = [];

        for (let i = 0; i < this.fishBodyPoints.length; i++) {
            this.fishColours.push(bodyColour);
        }

        for (let i = 0; i < this.fishTailPoints.length; i++) {
            this.fishColours.push(tailColour);
        }

        for (let i = 0; i < this.fishFinPoints.length; i++) {
            this.fishColours.push(finColour);
        }

        this.tailRot = 0;
        this.tailIncrement = tailIncrement;
        this.maxTailRotation = maxTailRotation;

        this.finRot = 0;
        this.finIncrement = finIncrement;
        this.maxFinRotation = maxFinRotation;
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
}