/**
 * Verkefni 2 í TÖL105M Tölvugrafík.
 * Fiskabúr sem heldur utan um fiska og búrið sem þeir eru í.
 *
 * @author Andri Fannar Kristjánsson, afk6@hi.is
 */

class FishTank
{
    /**
     * Búa til nýtt fiskabúr.
     *
     * @param fish           Fiskar sem eiga að vera í búrinu.
     * @param cube           Búrið sem fiskarnir eiga að vera í.
     * @param flockingRadius Radíusinn sem fiskur þarf að vera innan til að teljast nágranni.
     * @param flockingAngle  Horn frá stefnuvigri fisksins sem fiskur þarf að vera innan til að teljast nágranni.
     * @param separation     Vægi aðskilnaðar í hjarðhegðun.
     * @param alignment      Vægi uppröðunar í hjarðhegðun.
     * @param cohesion       Vægi samloðunar í hjarðhegðun.
     * @param freeWill       Vægi frjálsar vilja í nýjum stefnuvigri fiska.
     * @param alignToCentre  Vægi viljans til að fara að miðju í nýjum stefnuvigri fiska.
     */
    constructor(fish, cube, flockingRadius = 1, flockingAngle= 1, separation= 1, alignment = 1, cohesion = 1, freeWill = 1, alignToCentre = 0.1)
    {
        this.fish = fish;
        this.tank = cube;

        this.flockingRadius = flockingRadius;

        // Breyta gráðum í radíana.
        this.flockingAngle = flockingAngle * (Math.PI / 180);

        this.seperation = separation;
        this.alignment = alignment;
        this.cohesion = cohesion;
        this.freeWill = freeWill;
        this.alignToCentre = alignToCentre;
    }


    /**
     * Athuga hvort fiskur sé kominn að mörkum fiskabúrsins.
     *
     * @param fish Fiskur til skoðunar.
     */
    checkBounds(fish)
    {
        // Athuga hvort fiskur sé búinn að skipta oft um hliðar á stuttu tímabili.
        if(fish.currentBoundTimeout > 100)
        {
            // Ef svo er er fiskurinn fluttur í miðju teningsins.
            fish.currentPosition = vec3(0.0, 0.0, 0.0);
            fish.currentBoundTimeout = -fish.currentBoundTimeout;
            return;
        }

        // Minnka teljara fyrir hverja hreyfingu fisks.
        fish.currentBoundTimeout = -1;

        let fishBoundingBox = fish.boundingBox.slice();
        let fishPosition = fish.currentPosition.slice();

        let tankBounds = this.tank.cubeBounds;

        let normDirection = normalize(fish.currentDirection);

        // Reikna ysta punkt fisksins.
        let outermostPoint = vec3(
            fishPosition[0] + fishBoundingBox[0][0] * normDirection[0],
            fishPosition[1] + fishBoundingBox[0][0] * normDirection[1],
            fishPosition[2] + fishBoundingBox[0][0] * normDirection[2]
        );

        // Athuga hvort fiskur sé kominn á enda fiskabúrsins.
        if (((outermostPoint[0] >= tankBounds) || (outermostPoint[0] <= -tankBounds)) ||
            ((outermostPoint[1] >= tankBounds) || (outermostPoint[1] <= -tankBounds)) ||
            ((outermostPoint[2] >= tankBounds) || (outermostPoint[2] <= -tankBounds)))
        {
            // Færa fisk á hinn enda búrsins.
            fish.currentPosition = vec3(
                -1 * fishPosition[0],
                -1 * fishPosition[1],
                -1 * fishPosition[2]
            );

            // Þar sem fiskur skiptir um staðsetningu er gildi bætt við boundTimeout til að koma í veg fyrir að fiskur
            // festist í að fara oft á milli hliða.
            fish.currentBoundTimeout = 50;
        }

    }


    /**
     * Reiknar vigurinn á milli tveggja fiska.
     *
     * @param referenceFish Fiskur sem á að athuga vegalengd frá.
     * @param fish          Fiskur sem á að reikna vegalend til.
     * @returns {*}         Nýr þriggja staka vigur sem er á milli fiskana tveggja.
     */
    #distanceToFish(referenceFish, fish)
    {
        return vec3(fish.currentPosition[0] - referenceFish.currentPosition[0],
                    fish.currentPosition[1] - referenceFish.currentPosition[1],
                    fish.currentPosition[2] - referenceFish.currentPosition[2]);
    }


    /**
     * Finnur horn á milli tveggja vigra.
     *
     * @param vec1       Vigur 1
     * @param vec2       Vigur 2
     * @returns {number} Horn á milli tveggja vigra.
     */
    #angleBetweenVectors(vec1, vec2)
    {
        return Math.acos((dot(vec1,  vec2) / (length(vec1) * length(vec2))));
    }


    /**
     * Finnur nágranna fisks sem er innan flockingRadius og flockingAngle.
     *
     * @param referenceFish Fiskur sem á að finna nágranna fyrir.
     * @returns {*[]}       Lista af nágrönnum (ef einhverjir).
     */
    #findNeighbors(referenceFish)
    {
        let neighborhood = [];
        let distToFish;

        // Ýtra í gegn um alla fiskana í búrinu.
        for(const fish of this.fish)
        {
            if (fish !== referenceFish)
            {
                // Vigur á milli fisksins sem á að finna nágranna fyrir og fisk sem er til skoðunar.
                distToFish = this.#distanceToFish(referenceFish, fish);

                // Ef fiskurinn er innan gefins radíus og horns þá er hann settur á listann.
                if ((length(distToFish) <= this.flockingRadius) &&
                    (this.#angleBetweenVectors(referenceFish.currentDirection, distToFish) <= this.flockingAngle))
                {
                    neighborhood.push(fish);
                }
            }
        }

        return neighborhood.slice();
    }


    /**
     * Reiknar nýjan stefnuvigur fyrir fisk.
     *
     * @param referenceFish Fiskur sem á að reikna nýjan stefnuvigur fyrir.
     */
    calculateMovement(referenceFish)
    {
        let neighborhood = [];

        let newDirection;

        // Finna nágranna fisks.
        neighborhood = this.#findNeighbors(referenceFish);

        newDirection = vec3(0, 0, 0);

        // Búa til nýjan stefnuvigur út frá núverandi stefnuvigri.
        let freeWillDir = referenceFish.currentDirection;

        // Búa til vigur að handahófi til að herma "sjálfstæða hugsun" fisks.
        let maxDirSpeed = referenceFish.maximumSpeed / 3.0;
        let randomDev = randomVec3(maxDirSpeed, -maxDirSpeed);

        let toCentre = vec3(0, 0, 0);

        // Finna vigur frá fisk að miðju.
        if (length(referenceFish.currentPosition) > 0)
        {
            toCentre = normalize(negate(referenceFish.currentPosition));
        }

        // Búa til stefnuvigur fyrir "frjálsa hreyfingu" fisks.
        for(let i = 0; i < 3; i++)
        {
            freeWillDir[i] = (freeWillDir[i] + randomDev[i] + (toCentre[i] * this.alignToCentre)) * this.freeWill;
        }

        if (neighborhood.length > 0)
        {
            let fishSeparation = vec3(0, 0, 0);
            let fishAlignment = vec3(0, 0, 0);
            let fishCohesion = vec3(0, 0, 0);

            for (const fish of neighborhood)
            {
                // Aðskilnaður er samlagning af andstæðum vigrum af vigrunum að fiskum í nágreninu.
                fishSeparation = add(fishSeparation, negate(this.#distanceToFish(referenceFish, fish)));

                // Uppröðun er samlagning núverandi stefnuvigra fiska í nágreninu
                fishAlignment = add(fishAlignment, fish.currentDirection);

                // Samloðun er samlagning núverandi staðsetninga fiska í nágreninu.
                fishCohesion = add(fishCohesion, fish.currentPosition);
            }

            for (let i = 0; i < 3; i++)
            {
                // Deila stærð vigranna með fjölda fiska í nágreninu.
                fishSeparation[i] = fishSeparation[i] / neighborhood.length;
                fishAlignment[i] = fishAlignment[i] / neighborhood.length;
                fishCohesion[i] = fishCohesion[i] / neighborhood.length;

                // Búa til nýjan stefnuvigur með vigtum.
                newDirection[i] = (fishSeparation[i] * this.seperation) + (fishAlignment[i] * this.alignment) + (fishCohesion[i] * this.cohesion) + freeWillDir[i];
            }
        }
        else
        {
            // Ef það eru engir nágranar er stefnuvigurinn eingöngu "frjáls hreyfing".
            newDirection = freeWillDir;
        }

        // Ef vigurinn er stærri en 0 fær fiskurinn nýja vigurinn.
        if (length(newDirection) > 0)
        {
            referenceFish.currentDirection = newDirection.slice();
        }
    }
}