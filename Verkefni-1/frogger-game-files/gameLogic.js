/* ------- Stillingar Leiksins ------- */

// Fjöldi akgreina (með gangstétt).
var LANES = 7;

var CARS_PER_LANE = 2;

// Líf leikmanns.
var MAX_LIVES = 3;

// Stig sem þarf að ná til að vinna
var MAX_POINTS = 10;

/* ----------------------------------- */

// WebGL breytur
var canvas;
var gl;


// Almennar breytur.
var points = 0;     // Stigafjöldi leikmanns.
var laneSize;       // Stærð einnar akgreinar.
var gameBoard = []; // Staðsetning hnúta sem á að teikna.
var gameBounds;     // Ysta akgrein sem leikmaður getur verið á.

var GAME_COLOURS = { // Litir notaðir í forritinu.
  gray:   vec4(0.671, 0.671, 0.671, 1.0),
  yellow: vec4(0.929, 0.812, 0.078, 1.0),
  green:  vec4(0.039, 0.639, 0.004, 1.0),
  red:    vec4(1.000, 0.200, 0.200, 1.0)
};


// Breytur fyrir leikmann
var currentPlayerLane = [];      // Núverandi akgrein leikmanns.
var frogSinCos = vec2(0.0, 1.0); // Sínus og Kósínus gildin fyrir átt frosksins.

var goingUp = true;              // Þarf leikmaður að fara upp til að fá næsta stig.
var livesLeft = MAX_LIVES;       // Líf sem leikmaður á eftir.

var evenLanes;                   // Ef fjöldi akgreina er slétt tala.
var playerOffset = 0;            // Hliðrun leikmanns.


// Breytur fyrir bíla
var CAR_SPEED = [];  // Hraði bílanna.
var carsX = [];      // Staðsetning bílanna.
var carColours = []; // Litir bílanna.


/**
 * Upphafsstillir leikinn.
 */
function initGame()
{
  // Reikna stærð akgreinar miðað við fjölda.
  laneSize = parseFloat(( 2.0 / LANES).toFixed(4));

  // Reikna staðsetningu gangstéttar.
  let sidewalkHeight = (-1 + laneSize);

  // Upphafsstaðsetningar leikhluta á leikborði fyrir breytingar.
  gameBoard = [
    // Gangstétt
    vec2(-1.0, sidewalkHeight),
    vec2(-1.0, -1),
    vec2( 1.0, sidewalkHeight),
    vec2(-1.0, -1),
    vec2( 1.0, sidewalkHeight),
    vec2( 1.0, -1),

    // Vegmerkingar
    vec2(-1.0, (sidewalkHeight + 0.01)),
    vec2(-1.0, (sidewalkHeight - 0.01)),
    vec2( 1.0, (sidewalkHeight + 0.01)),
    vec2(-1.0, (sidewalkHeight - 0.01)),
    vec2( 1.0, (sidewalkHeight + 0.01)),
    vec2( 1.0, (sidewalkHeight - 0.01)),

    //Froskur
    vec2( 0.0,                      ((laneSize * 0.5) - 0.03)),
    vec2(-((laneSize / 2) - 0.03), -((laneSize * 0.5) - 0.03)),
    vec2( ((laneSize / 2) - 0.03), -((laneSize * 0.5) - 0.03)),

    // Bíll
    vec2(-(0.75 * laneSize), ((sidewalkHeight + laneSize) - 0.03)),
    vec2(-(0.75 * laneSize),  (sidewalkHeight + 0.03)),
    vec2( (0.75 * laneSize), ((sidewalkHeight + laneSize) - 0.03)),
    vec2(-(0.75 * laneSize),  (sidewalkHeight + 0.03)),
    vec2( (0.75 * laneSize), ((sidewalkHeight + laneSize) - 0.03)),
    vec2( (0.75 * laneSize),  (sidewalkHeight + 0.03)),

    // Stig
    vec2(-0.99, 0.99),
    vec2(-0.99, 0.92),
    vec2(-0.97, 0.99),
    vec2(-0.99, 0.92),
    vec2(-0.97, 0.99),
    vec2(-0.97, 0.92),

    // Líf
    vec2(0.95, 0.91),
    vec2(0.91, 0.97),
    vec2(0.99, 0.97),
    vec2(0.91, 0.97),
    vec2(0.93, 0.99),
    vec2(0.95, 0.97),
    vec2(0.95, 0.97),
    vec2(0.97, 0.99),
    vec2(0.99, 0.97)
  ];

  // Reikna ystu akgrein sem leikmaður má vera á, þar sem akgrein 0 er í miðju leikborðsins.
  gameBounds = Math.floor(LANES / 2);

  // Ef fjöldi akgreina er slétt tala þarf að hliðra leikmanni.
  evenLanes = (LANES % 2 === 0); 
  if (evenLanes) playerOffset = laneSize * 0.5;

  // Upphafsstilla bíla.
  initCars();

  // Byrja leik.
  restart();

  // Setja gögnin í bufferinn.
  resetBuffer();
}


/**
 * Upphafsstillir bílana fyrir leikinn.
 */
function initCars()
{
  // Dreifa fjölda bíla á akgrein með svæðinu sem er í boði.
  let carSpacing = (3.1 / CARS_PER_LANE);

  CAR_SPEED = new Array(LANES - 2);

  for(let i = 0; i < (LANES - 2); i++)
  {
    carColours.push(new Array(CARS_PER_LANE));
    carsX.push(new Array(CARS_PER_LANE));

    for(let j = 0; j < CARS_PER_LANE; j++)
    {
      // Setja bílanna jafnt á reiknaða staði á akgrein.
      carsX[i][j] = -1.5 + (j * carSpacing); 
    }
  }
}


/**
 * Endurstillir leikinn.
 */
function restart() 
{
  // Endurstillir líf og stig.
  livesLeft = MAX_LIVES;
  points = 0;

  // Færir leikmann á byrjunarreit.
  currentPlayerLane = [0, -gameBounds];

  // Endurstillir snúning leikmannsins.
  frogSinCos = vec2(0.0, 1.0);

  // Býr til lit og setur hraða á bílana af handahófi.
  for (let i = 0; i < (LANES - 2); i++) {
    for (let j = 0; j < CARS_PER_LANE; j++) 
    {
      carColours[i][j] = randomColour();
    }

    CAR_SPEED[i] = ((Math.random() * 0.03) - 0.015);
  }
}


/**
 * Býr til lit af handahófi, sem sést vel á svörtum bakgrunni.
 * @returns Litur á milli [0.3 - 1.0).
 */
function randomColour() {
  return vec4(
    Math.random() / 0.7 + 0.3,
    Math.random() / 0.7 + 0.3,
    Math.random() / 0.7 + 0.3,
    1.0
  );
}


/**
 * Fall sem sér um hreyfingu leikmanns.
 */
function movement() 
{
  window.addEventListener("keydown", function (e) 
  {
    switch (e.key) 
    {
      case "ArrowUp":
        frogSinCos[0] = Math.sin(0); // Snýr leikmanni upp.
        frogSinCos[1] = Math.cos(0);

        // Athuga hvort leikmaður sé kominn út á enda.
        if ((evenLanes && (currentPlayerLane[1] === (gameBounds - 1))) || 
            (!evenLanes && (currentPlayerLane[1] === gameBounds)))
        {
          // Uppfærir stigafjöldann ef leikmaður er kominn á réttan enda.
          break;
        }

  	    currentPlayerLane[1]++; // Færa leikmann áfram um eina akgrein.

        if ((evenLanes && (currentPlayerLane[1] === (gameBounds - 1))) || 
            (!evenLanes && (currentPlayerLane[1] === gameBounds)))
        {
          if (goingUp) updatePoints();
        }
    
        break;


      case "ArrowDown":
        frogSinCos[0] = Math.sin(Math.PI); 
        frogSinCos[1] = Math.cos(Math.PI);

        if (currentPlayerLane[1] === -gameBounds)
        {
          break;
        } 

        currentPlayerLane[1]--;

        if (currentPlayerLane[1] === -gameBounds)
        {
          if (!goingUp) updatePoints();
        } 

        break;


      case "ArrowLeft":
        frogSinCos[0] = Math.sin(Math.PI / 2);
        frogSinCos[1] = Math.cos(Math.PI / 2);

        if (currentPlayerLane[0] === -gameBounds) break;

        currentPlayerLane[0]--;
        break;


      case "ArrowRight":
        frogSinCos[0] = Math.sin((3 * Math.PI) / 2);
        frogSinCos[1] = Math.cos((3 * Math.PI) / 2);

        if ((evenLanes && (currentPlayerLane[0] === (gameBounds - 1))) || 
            (!evenLanes && (currentPlayerLane[0] === gameBounds)))
        {
          break;
        }

        currentPlayerLane[0]++;
        break;
    }
  });
}


/**
 * Uppfærir stigafjölda.
 */
function updatePoints() 
{
  // Auka stigafjölda.
  points++;
  goingUp = !goingUp;

  // Ef leikmaður hefur náð hámarksstigum endurstillist leikurinn.
  if (points >= MAX_POINTS) restart();
}


/**
 * Athugar hvort leikmaður hafi rekist á bíl.
 * 
 * @param {*} car     Staðsetning bíls á x-ás.
 * @param {*} carLane Númer bíls.
 */
function collisionDetection(car, carLane) 
{
  // Athugar hvort leikmaður hafi rekist á bíl.
  if ((currentPlayerLane[1] === (carLane - (gameBounds - 1))) &&               // Sama akgrein.
    (((currentPlayerLane[0] * laneSize) + playerOffset) < (car + laneSize)) && // +X-ás
    (((currentPlayerLane[0] * laneSize) + playerOffset) > (car - laneSize)))   // -X-ás
  {
    if (--livesLeft === 0) restart();                // Ef leikmaður hefur tapað öllum lífum endurstillist leikurinn.
    if (goingUp) currentPlayerLane[1] = -gameBounds; // Ef leikmaður er á leið upp lifnar hann við niðri.
    else currentPlayerLane[1] = gameBounds;          // Ef leikmaður er á leið niður lifnar hann við uppi.
  }
}


function changeParams()
{    
    document.getElementById("changeParams").onclick = function() 
    {
        MAX_LIVES = document.getElementById("lives").value;
        MAX_POINTS = document.getElementById("points").value;
        CARS_PER_LANE = document.getElementById("cars").value;
        LANES = document.getElementById("lanes").value;
        initGame();
    };

}