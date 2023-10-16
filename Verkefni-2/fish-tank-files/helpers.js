/**
 * Verkefni 2 í TÖL105M Tölvugrafík.
 * Skrá sem inniheldur hjálparföll til að gera handahófskennda vigra.
 *
 * @author Andri Fannar Kristjánsson, afk6@hi.is
 */


/**
 * Búa til handahófskenndan 4-staka vigur.
 *
 * @param maxValue             Hámarksgildi.
 * @param minValue             Lágmarksgildi.
 * @param excludeLastComponent Sleppa síðasta stakinu.
 * @returns {*}                Nýr 4-staka vigur sem inniheldur gildi af handahófi á milli maxValue og minValue.
 */
function randomVec4(maxValue = 1, minValue = 0, excludeLastComponent)
{
    if (excludeLastComponent)
    {
        return vec4(randomBetw(maxValue, minValue), randomBetw(maxValue, minValue),
            randomBetw(maxValue, minValue), 1);
    }
    else
    {
        return vec4(randomBetw(maxValue, minValue), randomBetw(maxValue, minValue),
            randomBetw(maxValue, minValue), randomBetw(maxValue, minValue));
    }
}


/**
 * Búa til handahófskenndan 3-staka vigur.
 *
 * @param maxValue             Hámarksgildi.
 * @param minValue             Lágmarksgildi.
 * @returns {*}                Nýr 3-staka vigur sem inniheldur gildi af handahófi á milli maxValue og minValue.
 */
function randomVec3(maxValue = 1, minValue = 0)
{
    return vec3(randomBetw(maxValue, minValue), randomBetw(maxValue, minValue), randomBetw(maxValue, minValue));
}


/**
 * Búa til handahófskenndan tölu.
 *
 * @param maxValue             Hámarksgildi.
 * @param minValue             Lágmarksgildi.
 * @returns {*}                Ný tala af handahófi sem er á milli maxValue og minValue.
 */
function randomBetw(maxValue, minValue) {
    return (Math.random() * (maxValue - minValue)) + minValue
}