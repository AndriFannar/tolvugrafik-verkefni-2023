# Heimadæmi 5

## Háþróaður vélmennaarmur
* Byggja á sýnisforritinu robotArmHH.
  * Bæta við þriðju einingunni, staðsett fremst á arminum.
  * Setja skorður á snúning.
    * Hver eining getur aðeins snúist fram á við um 90°.
    * Heildarsnúningur ekki meiri en 180°.

## Fallið mouseLook
* Sýnisforrit sem sýnir virkni mouseLook fallsins.
* Fallið mouseLook tekur inn tvær viðfangsbreytur, key og mdelta.
  * key inniheldur þann takka sem notandi ýtti á til að hreyfa sig.
    * 'W' fer áfram.
    * 'A' fer til vinstri.
    * 'S' fer til baka.
    * 'D' fer fer til hægri.
  * mdelta er hreyfing músarinnar.
* Fallið tekur þessar viðfangsbreytur og gefur til baka fylki sem hægt er að nota í stað lookAt fallsins fyrir hreyfingu myndavélar.
  
## Phong Tepotturinn
* Byggja á sýnisforritinu PhongTeapot
  * Láta örvalyklana færa ljósgjafann í xy-sléttunni.
  * Leyfa notanda að breyta nákvæmni tepottsins með því að slá á talnalyklana.