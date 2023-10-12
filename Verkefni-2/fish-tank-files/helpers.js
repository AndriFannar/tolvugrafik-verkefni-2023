function randomVec4(maxValue = 1, minValue = 0)
{
    return vec4(randomBetw(maxValue, minValue), randomBetw(maxValue, minValue),
                randomBetw(maxValue, minValue), randomBetw(maxValue, minValue));
}

function randomVec3(maxValue = 1, minValue = 0)
{
    return vec3(randomBetw(maxValue, minValue), randomBetw(maxValue, minValue), randomBetw(maxValue, minValue));
}

function randomBetw(maxValue, minValue)
{
    return (Math.random() * (maxValue - minValue)) + minValue
}