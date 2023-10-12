class Cube
{
    constructor(size = 1, sideColours = [vec4(1.0, 1.0, 1.0, 1.0)], lineColour = vec4(1.0, 1.0, 1.0, 1.0))
    {
        this.cubePoints = [];
        this.cubeCol = [];
        this.sideColours = [];
        this.lineCol = lineColour;

        this.bounds = size;

        this.vertices = [
            vec4(-size, -size,  size, 1),
            vec4(-size,  size,  size, 1),
            vec4( size,  size,  size, 1),
            vec4( size, -size,  size, 1),
            vec4(-size, -size, -size, 1),
            vec4(-size,  size, -size, 1),
            vec4( size,  size, -size, 1),
            vec4( size, -size, -size, 1)
        ]

        if (sideColours.length === 1)
        {
            for(let i = 0; i < 6; i++)
            {
                this.sideColours.push(sideColours[0]);
            }
        }
        else
        {
            this.sideColours = sideColours;
        }

        this.#quad(1, 0, 3, 2, size, this.sideColours[0]);
        this.#quad(2, 3, 7, 6, size, this.sideColours[1]);
        this.#quad(3, 0, 4, 7, size, this.sideColours[2]);
        this.#quad(6, 5, 1, 2, size, this.sideColours[3]);
        this.#quad(4, 5, 6, 7, size, this.sideColours[4]);
        this.#quad(5, 4, 0, 1, size, this.sideColours[5]);

        this.outlines = [this.vertices[0], this.vertices[1], this.vertices[1], this.vertices[2],
                               this.vertices[2], this.vertices[3], this.vertices[3], this.vertices[0],
                               this.vertices[4], this.vertices[5], this.vertices[5], this.vertices[6],
                               this.vertices[6], this.vertices[7], this.vertices[7], this.vertices[4],
                               this.vertices[0], this.vertices[4], this.vertices[1], this.vertices[5],
                               this.vertices[2], this.vertices[6], this.vertices[3], this.vertices[7]];
    }

    #quad(a, b, c, d, size, sideColour)
    {
        let indices = [ a, b, c, a, c, d];

        for (let i = 0; i < indices.length; ++i)
        {
            this.cubePoints.push(this.vertices[indices[i]]);
            this.cubeCol.push(sideColour);
        }
    }

    get points()
    {
        return this.cubePoints.concat(this.outlines);
    }

    get sidePoints()
    {
        return this.cubePoints.slice();
    }

    get linePoints()
    {
        return this.outlines.slice();
    }

    get cubeColours()
    {
        return this.cubeCol.slice();
    }

    get lineColour()
    {
        return this.lineCol.slice();
    }

    get cubeBounds()
    {
        return this.bounds;
    }
}

