document.addEventListener('DOMContentLoaded', function () {

cycleDesQuintes = getCycleDesQuintes();

// Ajuster la visibilité des éléments liés au jeu (au cas où.)
$("#jeuSetUp").show();
$("#boutonJouer").show();
$("#jeuContenu").hide();

// Mettre à jour les textes indiquant la personnalisation de la partie du joueur
updateNbQuestionsVal($("#optionNbQuestions").val());
updateTempsQuestionVal($("#optionsTemps").val());

});


// VARIABLES GLOBALES -----------------------------


// Cycle des quintes
let cycleDesQuintes = null;

// Propriétés du questionnaire en général
const nbReponses = 4; // Nombre de choix de réponse donné à chaque question
let nbQuestions = 10; // Nombre de questions à poser
const tempsPause = 3; // Temps de pause entre chaque question (en secondes)
let tempsMax = 10; // Temps maximum pour répondre à une question (en secondes)

// Propriétés de la partie actuelle
let timer = null;
let score = 0; // Score du joueur
let questionCourante = null; // Question en cours
let nbQuestionsGen = 0; // Nombre de questions générées jusqu'à présent


// MÉTHODES DE PERSONNALISATION -----------------------------


// Mettre à jour le texte indiquant le nombre de questions à répondre.
function updateNbQuestionsVal(value) {
    $("#optionNbQuestionsVal").empty().append(value + " questions")
}

// Mettre à jour le texte indiquant le temps alloué pour répondre à chaque question.
function updateTempsQuestionVal(value) {
    $("#optionsTempsVal").empty().append(value + " secondes par question")
}


// MÉTHODES DE JEU -----------------------------


// Commencer une nouvelle série de questions.
function startJeu() {
    // Mettre à jour la visibilité des boutons et des éléments de jeu
    toggleJeu();

    // Personnaliser les propriétés selon ce que le joueur a sélectionné
    nbQuestions = parseInt($("#optionNbQuestions").val());
    tempsMax = parseInt($("#optionsTemps").val());

    // Réinitialiser les propriétés du jeu
    $("#message").empty();
    nbQuestionsGen = 0;
    resetScore();
    loadProchaineQuestion();
}

// Commencer une nouvelle série de questions.
function endJeu() {
    // Annoncer au joueur le nombre de points reçus
    let pointTexte = "points";
    if (score < 2) {
        pointTexte = "point";
    }
    $("#message").empty().append("La partie est terminée! Vous avez obtenu un score de " + score
        + " " + pointTexte + "!");

    // Mettre à jour la visibilité des boutons et des éléments de jeu
    toggleJeu();
}

// Valider la réponse sélectionnée par le joueur.
function validReponse() {
    // Ne rien faire s'il n'y a pas de question à valider.
    if (!(questionCourante instanceof Question)) {
        return null;
    }

    let reponse = questionCourante.reponse;
    let choix = $('[name="questionnaire"]:checked + label');

    // Désactiver le bouton de validation jusqu'à ce que la prochaine question soit générée.
    $("#boutonValidation").attr('disabled', true);

    // Vérifier si la réponse est bonne
    if (String(reponse) === choix.text()) {
        $("#solution").append("C'est bien ça! Bravo!");
        modifyScore(1);
    } else {
        $("#solution").append("Désolé! La réponse attendu était " + reponse + "!");
    }

    stopTimer();
    setTimeout(loadProchaineQuestion, tempsPause*1000);
}

// Générer une nouvelle question et mettre à jour le HTML en conséquence.
function loadProchaineQuestion() {
    // Terminer la partie si le nombre de questions à générer a été dépassé.
    nbQuestionsGen++;
    if (nbQuestionsGen > nbQuestions) {
        endJeu();
        return null;
    }

    // Générer une nouvelle question. Recommencer si la question reçue n'est pas valide.
    let question = null;
    while (question === null) {
        question = genRandomQuestion();
    }
    questionCourante = question;
    //console.log(questionCourante);

    // Mettre à jour le HTML pour inclure toutes les informations nécessaires pour pouvoir répondre à la question
    $("#question").empty().append("Question " + nbQuestionsGen + ": " + questionCourante.question);
    $("#solution").empty();

    let questionnaire = $("#questionnaire");
    questionnaire.empty();
    for (let i = 0; i < questionCourante.choixReponse.length; i++) {
        let reponseID = "reponse" + i;
        questionnaire.append("<div class=\"d-flex justify-content-center\"><input class=\"me-2\" type=\"radio\" name=\"questionnaire\" id=\"" + reponseID + "\"><label for=\""
            + reponseID + "\">" + questionCourante.choixReponse[i] + "</label></div>");
    }

    // Réactiver le bouton de validation pour la prochaine question
    $("#boutonValidation").attr('disabled', false);

    stopTimer();
    startTimer(tempsMax);
}

// Toggle la visibilité du jeu et du bouton de jeu
function toggleJeu() {
    $("#jeuSetUp").toggle();
    $("#jeuContenu").toggle();
    $("#tabCycleQuintes").toggleClass("blur");
}

// Modifier le score en y ajoutant la valeur int.
function modifyScore(int) {
    score = score + int;
    $("#score").empty().append(score + "/" + nbQuestions);
}

// Remettre le score à 0.
function resetScore() {
    score = 0;
    $("#score").empty().append(score + "/" + nbQuestions);
}

// Commencer le timer à partir de la valeur time (en secondes.)
function startTimer(time) {
    $("#timer").empty().append(time);

    timer = setInterval(function() {
        time--;
        $("#timer").empty().append(time);

        if(time === 0) {
            validReponse();
        }
    }, 1000);
}

// Arrêter le timer
function stopTimer() {
    clearInterval(timer);
}


// MÉTHODES DE GÉNÉRATION DE QUESTIONS -----------------------------


// Générer une question qui demande à l'utilisateur le nombre de bémols/dièses associés à une gamme (à l'index donné)
function genQuestionNbAlterations() {
    let index = getRandomInt(cycleDesQuintes.length);
    let quinte = cycleDesQuintes[index];

    let alteration = getNomAlteration(quinte.alteration(), true);

    // Demander une altération au hasard si la quinte choisie n'en a pas.
    if (quinte.nbAlterations() === 0) {
        switch(getRandomInt(2)) {
            case 0:
                alteration = getNomAlteration("♭", true);
                break;
            case 1:
                alteration = getNomAlteration("♯", true);
                break;
            default:
                return null;
        }
    }

    // Assembler la question: "Combien de (dièses/bémols) y a t-il dans la gamme de (nom de gamme)?"
    let question = "Combien de " + alteration +
        " y a t-il dans la gamme de " + quinte.getRandomMode() + "?";
    let reponse = quinte.nbAlterations();

    // Générer les choix de réponses
    let maxNbAlterations = cycleDesQuintes[0].nbAlterations();
    let choixReponse = [reponse];

    while (choixReponse.length < nbReponses) {
        let random = getRandomInt(maxNbAlterations+1);

        if(choixReponse.indexOf(random) === -1) {
            choixReponse.push(random);
        }
    }

    return new Question(question, reponse, shuffleTableau(choixReponse));
}

// Générer une question qui demande à l'utilisateur la tonalité associée à un nombre de bémols/dièses
function genQuestionTonalite() {
    let index = getRandomInt(cycleDesQuintes.length);
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

    while (choixReponse.length < nbReponses) {
        let random = getRandomInt(cycleDesQuintes.length);
        let randomReponse = cycleDesQuintes[random].getRandomMode().split(" ")[0];

        if(choixReponse.indexOf(randomReponse) === -1) {
            choixReponse.push(randomReponse);
        }
    }

    return new Question(question, reponse, shuffleTableau(choixReponse));
}

// Générer une question au hasard parmi les différents types de question possibles
function genRandomQuestion() {
    switch(getRandomInt(2)) {
        case 0:
            return genQuestionNbAlterations();
        case 1:
            return genQuestionTonalite();
        default:
            return null;
    }
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

// Obtenir le nom d'une altération au singulier ou au pluriel
function getNomAlteration(alteration, isPluriel) {
    switch (alteration) {
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

// Mélanger les éléments d'un tableau pour qu'ils apparaissent à des index différents
function shuffleTableau(tableau) {
    let shuffle = [];

    while (tableau.length !== 0) {
        let index = getRandomInt(tableau.length);
        shuffle.push(tableau[index]);
        tableau.splice(index, 1);
    }

    return shuffle;
}

// Obtenir un nombre au hasard entre 0 et max (exclusif)
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
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

        if (nbAlterations === 0) {
            return "aucune alteration";
        } else if (nbAlterations > 1) {
            isPluriel = true;
        }

        return nbAlterations + " " + getNomAlteration(this.alteration(), isPluriel);
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
        switch(getRandomInt(2)) {
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



