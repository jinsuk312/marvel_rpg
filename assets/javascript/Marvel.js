// When Document Object Model has loaded, run this function
$(document).ready(function () {
    // Creating an object to hold our characters.
    var characters = {
        "Thor": {
            name: "Thor",
            health: 150,
            attack: 15,
            imageUrl: "assets/images/thor.jpg",
            enemyAttackBack: 15
        },
        "Ironman": {
            name: "Ironman",
            health: 100,
            attack: 10,
            imageUrl: "assets/images/ironman.jpg",
            enemyAttackBack: 5
        },
        "Captain America": {
            name: "Captain America",
            health: 150,
            attack: 10,
            imageUrl: "assets/images/captain.jpg",
            enemyAttackBack: 20
        },
        "Spiderman": {
            name: "Spiderman",
            health: 120,
            attack: 7,
            imageUrl: "assets/images/spiderman.jpg",
            enemyAttackBack: 25
        }
    };

    // VARIABLES

    // User chooses attacker.
    var attacker;
    // Whoever was not selected to be attacker.
    var combatants = [];
    // User chooses opponent.
    var defender;
    // Will keep track of turns during combat.
    var turnCounter = 1;
    // Tracks number of kills.
    var killCount = 0;


    // FUNCTIONS

    // This function renders a character to the page.
    // The character rendered, the area they are rendered to, and their status is determined by the arguments passed in.
    var renderCharacter = function (character, renderArea) {
        // Builds the character card, and renders it to the page.
        var charDiv = $("<div class='character' data-name='" + character.name + "'>");
        var charName = $("<div class='character-name'>").text(character.name);
        var charImage = $("<img alt='image' class='character-image'>").attr("src", character.imageUrl);
        var charHealth = $("<div class='character-health'>").text(character.health);
        charDiv.append(charName).append(charImage).append(charHealth);
        $(renderArea).append(charDiv);
    };

    // this function will load all the characters for the use to select
    var initializeGame = function () {
        // Loop through the characters object and call the renderCharacter function on each character to render their card.
        for (var key in characters) {
            renderCharacter(characters[key], "#characters-section");
        }
    };

    // Initialize the Game
    initializeGame();


    // Handles where the selected characters will go, but empties the specified location first
    var updateCharacter = function (charObj, areaRender) {
        // First we empty the area so that we can re-render the new object
        $(areaRender).empty();
        renderCharacter(charObj, areaRender);
    };

    // This function will render the available-to-attack enemies. This should be run once after a character has been selected
    var renderEnemies = function (enemyArr) {
        for (var i = 0; i < enemyArr.length; i++) {
            renderCharacter(enemyArr[i], "#available-to-attack-section");
        }
    };

    // Function to handle rendering game messages.
    var renderMessage = function (message) {
        // Builds the message and appends it to the page.
        var gameMessageSet = $("#game-message");
        var newMessage = $("<div>").text(message);
        gameMessageSet.append(newMessage);
    };


    // Function which handles restarting the game after victory or defeat.
    var restartGame = function (resultMessage) {

        // When the 'Restart' button is clicked, reload the page.
        var restart = $("<button>Restart</button>").click(function () {
            location.reload();
        });

        // Build div that will display the victory/defeat message.
        var gameState = $("<div>").text(resultMessage);

        // Render the restart button and victory/defeat message to the page.
        $("body").append(gameState);
        $("body").append(restart);
    };

    // Function to clear the game message section
    var clearMessage = function () {

        var gameMessage = $("#game-message");

        gameMessage.text("");
    };


    // ===================================================================

    // On click event for selecting our character.
    $("#characters-section").on("click", ".character", function () {

        // Saving the clicked character's name.
        var name = $(this).attr("data-name");

        // If a player character has not yet been chosen...
        if (!attacker) {
            // We populate attacker with the selected character's information.
            attacker = characters[name];
            // We then loop through the remaining characters and push them to the combatants array.
            for (var key in characters) {
                if (key !== name) {
                    combatants.push(characters[key]);
                }
            }

            // Hide the character select div.
            $("#characters-section").hide();

            // Then render our selected character and our combatants.
            updateCharacter(attacker, "#selected-character");
            renderEnemies(combatants);
        }
    });

    // Creates an on click event for each enemy.
    $("#available-to-attack-section").on("click", ".character", function () {

        // Saving the opponent's name.
        var name = ($(this).attr("data-name"));

        // If there is no defender, the clicked enemy will become the defender.
        if ($("#defender").children().length === 0) {
            defender = characters[name];
            updateCharacter(defender, "#defender");

            // remove element as it will now be a new defender
            $(this).remove();
            clearMessage();
        }
    });

    // When you click the attack button, run the following game logic...
    $("#attack-button").on("click", function () {

        // If there is a defender, combat will occur.
        if ($("#defender").children().length !== 0) {

            // Creates messages for our attack and our opponents counter attack.
            var attackMessage = "You attacked " + defender.name + " for " + (attacker.attack * turnCounter) + " damage.";
            var counterAttackMessage = defender.name + " attacked you back for " + defender.enemyAttackBack + " damage.";
            clearMessage();

            // Reduce defender's health by your attack value.
            defender.health -= (attacker.attack * turnCounter);

            // If the enemy still has health..
            if (defender.health > 0) {

                // Render the enemy's updated character card.
                updateCharacter(defender, "#defender");

                // Render the combat messages.
                renderMessage(attackMessage);
                renderMessage(counterAttackMessage);

                // Reduce your health by the opponent's attack value.
                attacker.health -= defender.enemyAttackBack;

                // Render the player's updated character card.
                updateCharacter(attacker, "#selected-character");

                // If you have less than zero health the game ends.
                // We call the restartGame function to allow the user to restart the game and play again.
                if (attacker.health <= 0) {
                    clearMessage();
                    restartGame("You have been defeated...GAME OVER!!!");
                    $("#attack-button").unbind("click");
                }
            }
            // If the enemy has less than zero health they are defeated.
            else {
                // Remove your opponent's character card.
                $("#defender").empty();

                var gameStateMessage = "You have defeated " + defender.name + ", you can choose to fight another enemy.";
                renderMessage(gameStateMessage);

                // Increment your kill count.
                killCount++;

                // If you have killed all of your opponents you win.
                // Call the restartGame function to allow the user to restart the game and play again.
                if (killCount >= combatants.length) {
                    clearMessage();
                    restartGame("You Won!!!! GAME OVER!!!");
                }
            }
            // Increment turn counter. This is used for determining how much damage the player does.
            turnCounter++;
        }
        // If there is no defender, render an error message.
        else {
            clearMessage();
            renderMessage("No enemy here.");
        }
    });

});
