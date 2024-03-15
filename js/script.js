document.addEventListener('DOMContentLoaded', function () {

    playJeuAlterations();

    // Combien de di`eses y a t-il dans la gamme de r´ e majeur? (4)
    // La gamme de si mineur a t-elle 2 ou 3 di`eses? (2)
    // Les alt´ erations de la gamme de fa mineur sont elles des b´emols ou des di` eses (b´ emol)

    // Quelle est la tonalit´e majeure qui contient 3 di`eses? (la),
    // quelles sont les tonalit´es sans alt´eration `a la cl´e?

});


// MÉTHODES DE JEU -----------------------------


function playJeuAlterations() {
    const cycleDesQuintes = getCycleDesQuintes();

    let index = Math.floor(Math.random() * (cycleDesQuintes.length));
    console.log(index);

    console.log(genQuestionNbSymb(cycleDesQuintes, index));
    console.log(genQuestionTonalite(cycleDesQuintes, index));

}


// MÉTHODES DE GÉNÉRATION DE QUESTIONS -----------------------------


// Générer une question qui demande à l'utilisateur le nombre de bémols/dièses associés à une gamme (à l'index donné)
function genQuestionNbSymb(cycleDesQuintes, index) {
    let quinte = cycleDesQuintes[index];

    // Assembler la question
    let question = "Combien de " + getNomSymbole(quinte.symbTonalite(), true) + 
        " y a t-il dans la gamme de " + getRandomMode(quinte) + "?";
    let reponse = quinte.nbSymbTonalite();

    return new Question(question, reponse, null);
}

// Générer une question qui demande à l'utilisateur la tonalité associée à un nombre de bémols/dièses
function genQuestionTonalite(cycleDesQuintes, index) {
    let quinte = cycleDesQuintes[index];

    let gamme = getRandomMode(quinte);
    let tabGamme = gamme.split(" ");

    let gammeFeminin = " ";

    switch (tabGamme[1]) {
        case "mineur":
            gammeFeminin = "mineure";
            break;
        case "majeur":
            gammeFeminin = "majeure";
            break;
        default:
            return null;
    }

    let reponse = tabGamme[0];
    let question = "Quelle est la tonalitée " + gammeFeminin + " qui contient " + quinte.tonaliteTexte() + "?"
    return new Question(question, reponse, null);
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

// Obtenir au hasard la gamme majeure ou la gamme mineure d'une quinte
function getRandomMode(quinte) {
    switch(Math.floor(Math.random() * 2)) {
        case 0:
            return quinte.modeMineur;
        case 1:
            return quinte.modeMajeur;
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

    tonaliteTexte() {
        let nbSymboles = this.nbSymbTonalite();
        let isPluriel = false;

        if (nbSymboles > 1) {
            isPluriel = true;
        }

        return nbSymboles + " " + getNomSymbole(this.symbTonalite(), isPluriel);
    }

    symbTonalite() {
        return this.tonalite.split(" ")[1];
    }

    nbSymbTonalite() {
        return this.tonalite.split(" ")[0];
    }

}

// Classe représentant une question
class Question {
    constructor(question, reponse, mauvaisesReponses) {
        this.question = question;
        this.reponse = reponse;
        this.mauvaisesReponses = mauvaisesReponses;
    }
}



