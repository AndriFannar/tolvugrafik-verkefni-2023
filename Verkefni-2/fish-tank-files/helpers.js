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

function randomVec3(maxValue = 1, minValue = 0)
{
    return vec3(randomBetw(maxValue, minValue), randomBetw(maxValue, minValue), randomBetw(maxValue, minValue));
}

function randomBetw(maxValue, minValue)
{
    return (Math.random() * (maxValue - minValue)) + minValue
}

function angleBetweenVectors(vec1, vec2)
{
    return Math.acos((dot(vec1,  vec2) / (length(vec1) * length(vec2))));
}