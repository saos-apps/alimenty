# Analizy orzeczeń ws alimentów


## Pola w jsonie

```
{
  "judgmentId" : 18838,
  "tagType" : "ANA_ALIMN",
  "value" : {
    "isAppeal" : false,
    "reason" : "o alimenty",
    "defendantSex" : "male",
    "result" : "ZASĄDZA"
  }
}
```

Pola:

- "isAppeal" Czy to jest apelacja?  Wartości: true/false
- "reason" - O co jest pozew?  Obecnie może to być "o alimenty"/"o podwyższenie alimentów"/"o obniżenie alimentów"
- "defendantSex" płeć pozwanego Wartości "?"/male"/"female"/"both". Ostatnie oznacza, że pozwane są dwie lub więcej osób.
- "result" - Jaki był rezultat?  Wartości: "ODDALA" "PODWYŻSZA" "OBNIŻA" "UCHYLA" "ZASĄDZA" "ZMIENIA" - to w apelacjach, wyrok został zmieniony ale nie potrafię stwierdzić, czy zwiększono/zmiejszono
- "?" - nie udało się stwiedzić

