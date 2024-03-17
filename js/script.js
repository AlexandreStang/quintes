document.addEventListener('DOMContentLoaded', function () {



});


// VARIABLES GLOBALES -----------------------------


let timer = 0;
let score = 0;
let maxChoixReponse = 4;


// MÉTHODES DE JEU -----------------------------


function playJeu() {
    const cycleDesQuintes = getCycleDesQuintes();
    score = 0;

    let index = Math.floor(Math.random() * (cycleDesQuintes.length));
    console.log(index);

    let question = genQuestionNbAlterations(cycleDesQuintes, index);
    console.log(question);
    let question2 = genQuestionTonalite(cycleDesQuintes, index);
    console.log(question2);

    $("#jeuContenu").empty().append("<h1>" + question.question + "</h1>");

}


function validerReponse() {
    let reponse = "reponse2";
    let choix = $('[name="questionnaire"]');

    for (let i = 0; i < choix.length; i++) {
        if (choix[i].checked) {
            console.log(choix[i]);
            if (choix[i].id === reponse) {
                console.log("You win!!");
                score++;
                $("#score").empty().append(score);
            }
        }
    }
}


function startTimer() {

}


// MÉTHODES DE GÉNÉRATION DE QUESTIONS -----------------------------


// Générer une question qui demande à l'utilisateur le nombre de bémols/dièses associés à une gamme (à l'index donné)
function genQuestionNbAlterations(cycleDesQuintes, index) {
    let quinte = cycleDesQuintes[index];

    if (quinte.nbAlterations() === 0) {
        return null; // TODO: Write a generic question instead
    }

    // Assembler la question: "Combien de (dièses/bémols) y a t-il dans la gamme de (nom de gamme)?"
    let question = "Combien de " + getNomSymbole(quinte.alteration(), true) +
        " y a t-il dans la gamme de " + quinte.getRandomMode() + "?";
    let reponse = quinte.nbAlterations();

    // Générer les choix de réponses
    let maxNbAlterations = cycleDesQuintes[0].nbAlterations();
    let choixReponse = [reponse];

    while (choixReponse.length < maxChoixReponse) {
        let random = Math.floor(Math.random() * maxNbAlterations+1);
        let isValid = true;

        for (let j = 0; j < choixReponse.length; j++) {
            if (choixReponse[j] === random) {
                isValid = false;
                break;
            }
        }

        if (isValid) {
            choixReponse.push(random);
        }
    }

    return new Question(question, reponse, choixReponse);
}

// Générer une question qui demande à l'utilisateur la tonalité associée à un nombre de bémols/dièses
function genQuestionTonalite(cycleDesQuintes, index) {
    let quinte = cycleDesQuintes[index];
    let gamme = quinte.getRandomMode().split(" ");

    // Obtenir l'écriture au féminin de la tonalitée mineure/majeure pour l'écriture de la question
    let gammeAuFeminin = "";
    switch (gamme[1]) {
        case "mineur":
            gammeAuFeminin = "mineure";
            break;
        case "majeur":
            gammeAuFeminin = "majeure";
            break;
        default:
            return null;
    }

    // Assembler la question: "Quelle est la tonalitée (majeure/mineure) qui contient (int) (dièses/bémols)?"
    let question = "Quelle est la tonalitée " + gammeAuFeminin + " qui contient " + quinte.tonaliteToTexte() + "?"
    let reponse = gamme[0];

    // Générer les choix de réponses
    let choixReponse = [reponse];

    while (choixReponse.length < maxChoixReponse) {
        let random = Math.floor(Math.random() * cycleDesQuintes.length);
        let randomReponse = cycleDesQuintes[random].getRandomMode().split(" ")[0];
        let isValid = true;

        for (let j = 0; j < choixReponse.length; j++) {
            if (choixReponse[j] === randomReponse) { // TODO: Remove obvious wrong answers
                isValid = false;
                break;
            }
        }

        if (isValid) {
            choixReponse.push(randomReponse);
        }
    }

    return new Question(question, reponse, choixReponse);
}


// MÉTHODES GÉNÉRALES -----------------------------


// Générer le cycle des quintes à partir des informations présentes sur la page HTML
function getCycleDesQuintes() {
    // Obtenir l'information présente à l'intérieur du HTML sous forme de tableaux
    const tabTonalite = $("#Tonalite ~ td").map(function () {return this.innerText});
    const tabModeMajeur = $("#modeMajeur ~ td").map(function () {return this.innerText});
    const tabModeMineur = $("#modeMineur ~ td").map(function () {return this.innerText});

    // Créer toutes les quintes et les placer à l'intérieur du cycle des quintes
    let cycleDesQuintes = [];
    for (let i = 0; i < tabTonalite.length; i++) {
        if (tabModeMajeur[i] != null && tabModeMineur[i] != null) {
            cycleDesQuintes.push(new Quinte(tabTonalite[i], tabModeMajeur[i], tabModeMineur[i]));
        }
    }

    return cycleDesQuintes;
}

// Obtenir le nom d'un symbole au singulier ou au pluriel
function getNomSymbole(symbole, isPluriel) {
    switch (symbole) {
        case "♭":
            if (!isPluriel) {
                return "bémol";
            } else {
                return "bémols";
            }
        case "♯":
            if (!isPluriel) {
                return "dièse";
            } else {
                return "dièses";
            }
        default:
            return null;
    }
}


// CLASSES -----------------------------


// Classe représentant une quinte du cycle des quintes
class Quinte {
    constructor(tonalite, modeMajeur, modeMineur) {
        this.tonalite = tonalite;
        this.modeMajeur = modeMajeur;
        this.modeMineur = modeMineur;
    }

    // Convertir la tonalité sous forme textuelle
    tonaliteToTexte() {
        let nbAlterations = this.nbAlterations();
        let isPluriel = false;

        if (nbAlterations === "0") {
            return "aucune alteration";
        } else if (nbAlterations > 1) {
            isPluriel = true;
        }

        return nbAlterations + " " + getNomSymbole(this.alteration(), isPluriel);
    }

    // Obtenir l'altération présente à l'intérieur de la tonalité (dièse ou bémol)
    alteration() {
        return this.tonalite.split(" ")[1];
    }

    // Obtenir le nombre d'altérations (dièses/bémols) présentes à l'intérieur de la tonalité
    nbAlterations() {
        return Number(this.tonalite.split(" ")[0]);
    }

    // Obtenir au hasard la gamme majeure ou la gamme mineure
    getRandomMode() {
        switch(Math.floor(Math.random() * 2)) {
            case 0:
                return this.modeMineur;
            case 1:
                return this.modeMajeur;
            default:
                return null;
        }
    }
}

// Classe représentant une question
class Question {
    constructor(question, reponse, choixReponse) {
        this.question = question;
        this.reponse = reponse;
        this.choixReponse = choixReponse;
    }
}



