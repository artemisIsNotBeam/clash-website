import { data, names } from './data.js';
// A simple snippet to ensure your code runs once the page is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    
    // You can start adding your own JavaScript here!
    getCard("Fireball")
    getCard("Knight")
    getCard("Pekka")
    fillSelect("spells_characters", ".card-select-spells_characters")
    fillSelect("spells_other", ".card-select-spells_other")
    fillTowers(".card-select-towers")
    let card = getCard("Archers")
    console.log(scaleByLvl(card.summonCharacterData.hitpoints, 11))
});

let spelltocard = document.getElementById("spell-to-card");
let spelltocardBtn = spelltocard.querySelector("button");

let chartochar = document.getElementById("char-to-char");
let chartocharBtn = chartochar.querySelector("button");

chartocharBtn.addEventListener("click",()=>{
    let charSelect = chartochar.querySelector("#char1").value;
    let char2Select = chartochar.querySelector("#char2").value;
    let charLvl = chartochar.querySelector("#charLvl").value;
    let char2Lvl = chartochar.querySelector("#char2Lvl").value;

    let king = chartochar.querySelector("#KingUp");
    let kingLvl = chartochar.querySelector("#kingLvl").value;
    let princess = chartochar.querySelector(".card-select-towers").value;
    let princessCount = chartochar.querySelector("#princesses").value;
    let princessLvl = chartochar.querySelector("#princessLvl").value;
    
    let char1 = getCard(charSelect);
    let char2 = getCard(char2Select);

    //let kingSet = king.checked && kingLvl.value >= 1;
    let sides={
        1:[],
        2:[],
        support1:[]
    }

    addCharacters(sides[1],char1,charLvl)
    addCharacters(sides[2],char2,char2Lvl)

    //validation
    if (king.checked) {
        if (kingLvl >= 1){
            let obj = {}
            obj["hitSpeed"] =2200/ 1000;
            obj["damage"] = scaleByLvl(125, kingLvl);
            obj["name"] = "king tower";
            obj["wincon"] = false;
            sides.support1.push(obj);
        } else {
            alert('King tower seleccted, no levels');
            return
        }
    }
    
    if (Number(princessCount) > 0) {
        if (princessLvl >0) {
            for (let i=0;i<princessCount;i++){
                let card = getCard(princess);
                let obj={}
                obj["hitSpeed"] = card.statCharacterData.hitSpeed/1000;
                obj["damage"] = scaleByLvl(card.statCharacterData.projectileData.damage,princessLvl);
                obj["wincon"] = false;
                obj["name"] = princess;
                sides.support1.push(obj)
            }
        } else {
            alert('Princess tower seleccted, no levels');
            return;
        }
    }
    
    if ((charLvl < 1) || (char2Lvl < 1)) {
        alert("please provide character levels");
        return;
    }
    
    //alert(JSON.stringify(sides.support1,null,2))
    let timeMs = 0;
    let tick = 100;

    while (sides[1].length > 0 && sides[2].length > 0 && timeMs < 30 * 1000) {
        timeMs += tick;

        performAttacks(sides[1], sides[2], timeMs);
        
        performAttacks(sides[2], sides[1], timeMs);

        performAttacks(sides.support1, sides[2], timeMs);

        if (sides[2].length > 0 && sides[2][0].hp <= 0) {
            sides[2].shift();
        }

        if (sides[1].length > 0 && sides[1][0].hp <= 0) {
            sides[1].shift(); 
        }
    }

    let out = chartochar.querySelector("#out")
    let result = {
        winner: "",
        timeLeft:timeMs,
        remaining: [],
        message: ""
    };

    if (sides[1].length === 0 && sides[2].length === 0) {
        result.winner = "Draw";
        result.message = "Mutual Destruction! Both sides are wiped out.";
    } else if (sides[1].length === 0) {
        result.winner = "Side 2";
        result.remaining = sides[2];
        result.message = "Side 2 Wins!";
    } else if (sides[2].length === 0) {
        result.winner = "Side 1";
        result.remaining = sides[1];
        result.message = "Side 1 Wins!";
    } else {
        result.winner = "Timeout";
        result.remaining = { side1: sides[1], side2: sides[2] };
        result.message = "Battle Timed Out! No winner.";
    }
    out.innerHTML=result.message +" " +JSON.stringify(result.remaining,null,2);
    out.innerHTML+=" time elpased(secs)"+result.timeLeft / 1000; 
    
});

function performAttacks(attackers, defenders, currentTimeMs) {
    if (defenders.length === 0) {
        return;
    }

    const target = defenders[0]; 

    for (const attacker of attackers) {
        if (currentTimeMs % (attacker.hitSpeed * 1000) === 0) {
            if (attacker.wincon == false){
                target.hp -= attacker.damage;
            }
        }
    }
}

function addCharacters(side,char, level) {
    let count1 = char.summonNumber ? char.summonNumber : 1;
    for (let i=0;i<count1;i++) {
        let obj={}
        obj["hp"] = scaleByLvl(char.summonCharacterData.hitpoints,level);
        obj["wincon"] = char.summonCharacterData.tidTarget == "TID_TARGETS_BUILDINGS";
        obj["hitSpeed"] = char.summonCharacterData.hitSpeed / 1000;
        obj["name"] = char.englishName + " "+(i+1);
        
        if (char.summonCharacterData.damage){
            obj["damage"] = char.summonCharacterData.damage;
        } else if (char.summonCharacterData.projectileData.damage) {
            obj["damage"] =char.summonCharacterData.projectileData.damage;
        }
        obj["damage"] = scaleByLvl(obj["damage"], level)
        side.push(obj);
    }

    if (char.summonCharacterSecondCount){
        //alert("has two character types")
        let count2 = char.summonCharacterSecondCount;
        for (let i=0;i<count2;i++) {
            let obj={}
            obj["hp"] = scaleByLvl(char.summonCharacterSecondData.hitpoints,level);
            obj["hitSpeed"] = char.summonCharacterSecondData.hitSpeed / 1000;
            obj["name"] = char.summonCharacterSecondData.name + " "+(i+1);

            obj["wincon"] = char.summonCharacterSecondData.tidTarget == "TID_TARGETS_BUILDINGS";

            if (char.summonCharacterSecondData.damage){
                obj["damage"] = scaleByLvl(char.summonCharacterSecondData.damage,level);
            } else if (char.summonCharacterSecondData.projectileData.damage) {
                obj["damage"] = scaleByLvl(char.summonCharacterSecondData.projectileData.damage,level);
            }
            side.push(obj);
        }
    }
}

spelltocardBtn.addEventListener("click", () => {
    let charSelect = spelltocard.querySelector(".card-select-spells_characters");
    let charLvl = spelltocard.querySelector("#charLvl").value;
    let spellSelect = spelltocard.querySelector(".card-select-spells_other");
    let spellLvl = spelltocard.querySelector("#spellLvl").value;
    let charCard = getCard(charSelect.value);
    let spellCard = getCard(spellSelect.value);
    
    let output = spelltocard.querySelector("#out");
    output.innerHTML = "";
    console.log(charCard);
    console.log(spellCard);

    if (charCard === null || spellCard === null || charLvl < 1 || spellLvl < 1) {
        alert("invalid input");
    } else {
        let targethp = scaleByLvl(charCard.summonCharacterData.hitpoints, charLvl);
        console.log(targethp)

        let spelldmg=0;
        if ("projectileData" in spellCard) {
            if ("damage" in spellCard.projectileData) {
                if ("projectileWaves" in spellCard) {
                    spelldmg = spellCard.projectileWaves * scaleByLvl(spellCard.projectileData.damage, spellLvl);
                } else {
                    spelldmg = scaleByLvl(spellCard.projectileData.damage, spellLvl);
                }
            } else if ("spawnProjectileData" in spellCard.projectileData) {
                if ("damage" in spellCard.projectileData.spawnProjectileData) {
                    spelldmg = scaleByLvl(spellCard.projectileData.spawnProjectileData.damage, spellLvl);                  
                }
            }
        } else if ("areaEffectObjectData" in spellCard) {
            if ("lifeDuration" in spellCard.areaEffectObjectData) {
                if ("buffData" in spellCard.areaEffectObjectData) {
                    if ("damagePerSecond" in spellCard.areaEffectObjectData.buffData) {
                        //life duration is in miliseconds
                        let duration = spellCard.areaEffectObjectData.lifeDuration/1000;
                        //alert("hey bozos");
                        spelldmg = duration * scaleByLvl(spellCard.areaEffectObjectData.buffData.damagePerSecond, spellLvl);
                    }
                } else if ("damagePerSecond" in spellCard.areaEffectObjectData) {
                    let duration = spellCard.areaEffectObjectData.lifeDuration/1000;
                    spelldmg = duration * scaleByLvl(spellCard.areaEffectObjectData.damagePerSecond, spellLvl);
                }
            }
        } else if ("")

        if (spelldmg == 0) {
            spelldmg = "not found";
        }
        output.innerHTML = targethp + " HP\n" + spelldmg + " DMG " ;
        //output.innerHTML += JSON.stringify(spellCard);

    }
});


function getCard(name) {
    for (const element of data["spells"]) {
        if (element.name === name || element.englishName === name) {
            //console.log(element);
            return element;
        }
    };
    return null;
}

function fillSelect(type, selector) {
    const selects = document.querySelectorAll(selector);
    if (!selects || selects.length === 0) return;

    names.sort();

    for (const select of selects) {
        // clear existing options
        select.innerHTML = '';

        for (const name of names) {
            const card = getCard(name);
            if (!card) continue; // skip if card not found

            if (type === 'all' || card.source === type) {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                select.appendChild(option);
            }
        }
    }
}

function fillTowers(selector) {
    let selects = document.querySelectorAll(selector);

    for (let select of selects){   
        for (const element of data["spells"]) {
            
            if (element["source"] ==="support_cards") {
                
                const option = document.createElement('option');
                option.value = element.englishName;
                option.textContent = element.englishName;
                select.appendChild(option);
                
            }
        }
    }
}

function scaleByLvl(val, lvl) {
    return Math.round(val*1.1**(lvl - 1));
}