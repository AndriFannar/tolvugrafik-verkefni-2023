class Cube
{
    constructor(size, colours)
    {
        this.cubePoints = [];
        this.cubeColours = [];
        this.sideColours = [];

        if (colours.length === 1)
        {
            for(let i = 0; i < 6; i++)
            {
                this.sideColours.push(colours[0]);
            }
        }
        else
        {
            this.sideColours = colours;
        }

        this.#quad(1, 0, 3, 2, size, this.sideColours[0]);
        this.#quad(2, 3, 7, 6, size, this.sideColours[1]);
        this.#quad(3, 0, 4, 7, size, this.sideColours[2]);
        this.#quad(6, 5, 1, 2, size, this.sideColours[3]);
        this.#quad(4, 5, 6, 7, size, this.sideColours[4]);
        this.#quad(5, 4, 0, 1, size, this.sideColours[5]);
    }

    #quad(a, b, c, d, size, sideColour)
    {
        let vertices = [
            vec4(-size, -size,  size, 1),
            vec4(-size,  size,  size, 1),
            vec4( size,  size,  size, 1),
            vec4( size, -size,  size, 1),
            vec4(-size, -size, -size, 1),
            vec4(-size,  size, -size, 1),
            vec4( size,  size, -size, 1),
            vec4( size, -size, -size, 1)
        ]

        let indices = [ a, b, c, a, c, d];

        for (let i = 0; i < indices.length; ++i)
        {
            this.cubePoints.push(vertices[indices[i]]);
            this.cubeColours.push(sideColour);
        }
    }

    get points()
    {
        return this.cubePoints;
    }

    get colours()
    {
        return this.cubeColours;
    }
}

