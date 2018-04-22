/*jshint esnext: true */
/*
*** CHANGEMENTS À FAIRE ***

    * Game *
    - ( En cours ) Suppression de la méthode Checkcollide sur les ennemis
    - ( En cours ) Nouvel UI
    - Mettre un délai avant d'activer les monstres et boss à l'entrée d'une nouvelle salle
    - intégrer les nouvelles méthodes
    - vérification de .alive AVANT d'appeler les méthodes et se débarasser des conditions .alive à l'intérieur des objets et les laisser dans l'update approprié
    - Implémenter gameState et un switch ( loading, menu, create map, playing, changing level, endgame, pause)
    - Ajouter un menu principal et une fonction pour reset le jeu au complet sans recharger la page

    * Projectiles *
    - Projectiles joueur : envoyer range X et Y  positif ou négatif selon la touche enfoncée / compter le range avec un timer et éviter de la répétition
    - Refaire une fonction de tir joueur
    - fusionner tous les types de balles dans le même array et gèrer les dégats avec l'attribut .faction
    - utiliser hitDetection pour les collisions
    - mettre à jour la fonction de déplacement
    
    * Items *
    - Changer l'attribution des sprites ainsi que leur utilisation ( possibilité de supprimer les répétitions et d'assigner l'affichage dans un le main loop)

    * Divers *
    - Loading : barre de chargement des assets
    - Optimiser le code
    - Vérifier les variables initialisées plus d'une fois et supprimmer les variables non utilisées


*** BUGS CONNUS ***
    - Reset des monstres visible lors du changement de salle
    - Les coffres ouverts ne sont pas tous clearés au changement de pièce
    - Baisse de performances - Trop de sprites de sang à rafraîchir. Mettre un max ( 20 ou 30 ), ne pas en rajouter à la mort du boss, seulemement aux petits ennemis
    - Décalage d'un des projectiles pendant le Triple Shot
    - Mauvais alignement des projectiles secondaire pendant le Triple Shot + Wiggle


*** CHANGE LOG ***
    - L'overlay Hitbox ne fait plus crasher le jeu lorsque des bombes sont utilisées pendant les combats de boss
    - L'overlay Hitbox est maintenant proprement aligné pendant les combats de boss
    - La trappe de salle de boss devient interactive 2.5 secondes après la mort de tous les ennemis dans la salle
    - La boutique fonctionne de nouveau
    - Tous les monstres se prennent maintenant correctement les dégats des projectiles
    - Implémentation globale de la méthode .use()
    - Les objets firePlace, glue, tnt et Poop se détruisent et s'affichent maintenant correctement
    - Les portes vérouillées s'utilisent maintenant correctement
    - Les bombes et les items ne traversent plus les portes ouvertes
    - Les sprites des blocs détruits ne réaparaissent plus lors d'un changement de salle
    - Correction de l'utilisation et de la collision des objets item, chest et bomb avec le joueur, les explosions et les projectiles du joueur
    - Supression de la méthode Checkcollide de l'objet Item, chest et bomb.
    - Le contournement des coins des murs par le joueur ne se produit plus sur les murs extérieurs
    - Ajout de la fonction flagCollision qui détecte les murs adjacents et détermine quels côtés du mur doit vérifier les collisions (évite bug de collision)
    - Les déplacements des monstres de type Clotty et Maggot ont été ajustés
    - Nouvelle gestion de position et de collision des autres monstres
    - Nouvelle gestion de position et de collision du boss Duke, et suppression de sa méthode checkCollide
    - Player.update() a été déplacé de mainloop vers Game.update()
    - Implémentation de la fonction hitDetection sur les objets, ainsi que de la méthode .use()
    - Implémentation d'une fonction de projectile joueur antérieure
    - Implémentation d'une nouvelle fonction de collision de tuile
    - Fusion de tout les éléments de décors dans l'array Game.wallMaps
    - Fusion de tous les ennemis (sauf boss) dans l'array Game.enemies
    - La hitbox et la taille de certains objets ont été ajustés
    - Création de  l'overlay développeur et du mode Hitbox
    - Désactivation de l'UI
    - Nouvelle fonction de préchargement des images
    - L'array de projectile joueur a été déplacé vers l'objet Game afin de supprimer les projectiles existants au changement de pièce
    - Inscription et lecture de cookie afin de garder en mémoire le mode de clavier
    - Ajout des modes de clavier AZERTY et QWERTY


*/
/*******************************************************************************************************************************************************************************************
********************************************************************************************************************************************************************************************
GLOBAL
*******************************************************************************************************************************************************************************************
*******************************************************************************************************************************************************************************************/
// CANVAS
var canvas, context, uicanvas, uicontext, bgcanvas, bgcontext;

// FPSCOUNTER
var filterStrength = 20;
var frameTime = 0;
var lastLoop = new Date();
var thisLoop;

// GAME
var game;
var floorStructure;
var floorname;
var currentFloor;
var possibleRooms;
var rockIsDropped = false;

var hitBox = false;
var isChanging = false;
var lastChange = Date.now();
var isPaused = false;
var lastPaused = Date.now();
var hitboxToggleDate = Date.now();
var gameOver = false;
var gameOverOpac = 0;
var gameOverTime = 0;
var gameStats = { bullet: 0, hit: 0, kill: 0, rooms: 0 };

// ROOM CHANGE
var transitionStage = 2;
var timeCounter = 0;
var roomChangeOpac = 1;
var changeRoomSide = "";

// FLOOR CHANGE
var floorCount = 0;
var loadingIconPos = 0;
var loadingAnimation = "";

// BULLETS : Changer pour le mettre dans les attributs du niveau
var playerBullets = [];

// animations & images
var Animations = [];
var tempAnimations = [];
var numImages = 0;
var numLoaded = 0;

/*******************************************************************************************************************************************************************************************
********************************************************************************************************************************************************************************************
ENGINE
*******************************************************************************************************************************************************************************************
*******************************************************************************************************************************************************************************************/

// compatibilité browser
var animFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || null;

// loop animation           
var recursiveAnim = function () {
    mainloop();
    animFrame(recursiveAnim);
};

// initialisation
function gameInit() {
    console.log('gameInit');
    generateFloor();
    playerAnimations();
    keyboardEvent();
    animFrame(recursiveAnim);
    game.updateBackground();
}

function loading(state) {
    // déclaration des canvas
    canvas = getEl("canvas");
    context = canvas.getContext('2d');
    uicanvas = getEl("uicanvas");
    uicontext = uicanvas.getContext('2d');
    bgcanvas = getEl("bgcanvas");
    bgcontext = bgcanvas.getContext('2d');

    if (state) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(imageTool.loading, 0, 0, canvas.width, canvas.height);
        var percentLeft = (numLoaded / numImages) * 100;
        context.fillStyle = '#c12613';
        context.fillRect(0, canvas.height - 20, percentLeft * 9.6, 20);
        context.fillStyle = 'black';
    } else if (!state) {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }
}

// loop du jeu
function mainloop() {
    // activation du Mode HitBox
    if (keyQ) toggleHitbox();

    if (Date.now() - lastChange <= 500) {
        isChanging = true;
    } else isChanging = false;
    if (!gameOver && !gameIsPaused()) {

        if (Date.now() - lastChange > 1000) {
            game.update();
            game.clear();
        }

        if (Date.now() - lastChange > 900 && Date.now() - lastChange < 1100) game.updateBackground();

        showAdjacentRooms();

        if (keyW || keyS) {
            Animations[0].update(Player.x, Player.y);
        }
        if (keyD) {
            Animations[1].update(Player.x, Player.y);
        }
        if (keyA) {
            Animations[2].update(Player.x, Player.y);
        }

        // sang
        for (var s = 0; s < tempAnimations.length; s++) {
            tempAnimations[s].playOnce();
            if (tempAnimations[s].isOver) tempAnimations.splice(s, 1);
        }
    }
    game.draw();

    if (transitionStage !== 0) {
        transition();
        uicontext.drawImage(imageTool.blackScreen, 0, 0, uicanvas.width, uicanvas.height);
    }
    // fps calcul
    var thisFrameTime = (thisLoop = new Date()) - lastLoop;
    frameTime += (thisFrameTime - frameTime) / filterStrength;
    lastLoop = thisLoop;
}

// génération des étages
function generateFloor() {
    floorCount++;
    var newfloor = eval("floor" + floorCount);
    var floorrand = getRand(newfloor.length, 0);
    floorStructure = newfloor[floorrand];
    possibleRooms = eval("rooms" + floorCount);
    currentFloor = new Array(floorStructure.length);

    // peuple les rooms
    for (var y = 0; y < floorStructure.length; y++) {
        currentFloor[y] = new Array(floorStructure[y].length);
        for (var x = 0; x < floorStructure[y].length; x++) {
            // initialiser toutes les rooms, même celles qui n'existent pas
            currentFloor[y][x] = new nothing();

            // BASIC ROOMS
            // si emplacement de room de base présente dans la structure
            if (floorStructure[y][x] == "0") {
                // choisir une room random parmis celle disponibles
                var randRoom = getRand(possibleRooms.length, 0);
                // l'assigner à l'étage
                currentFloor[y][x] = new Room("Room", possibleRooms[randRoom], y, x, floorrand + 1);
                // enleve la room des rooms disponibles
                possibleRooms.splice(randRoom, 1);
            }

            // BOSS
            if (floorStructure[y][x] == "B") {
                // assigner la Boss room
                currentFloor[y][x] = new Room("Boss", bossRooms[floorCount - 1], y, x, "Boss room");
            }


        }
    }

    // ROOMS SPÉCIALES //
    var ry = getRand(floorStructure.length, 0);
    var rx = getRand(floorStructure[ry].length, 0);


    // TREASURE ROOM
    while (floorStructure[ry][rx] != "1") {
        ry = getRand(floorStructure.length, 0);
        rx = getRand(floorStructure[ry].length, 0);
    }
    floorStructure[ry][rx] = "2";
    // assigner la Treasure room
    currentFloor[ry][rx] = new Room("Treasure", treasureRooms[0], ry, rx, "Treasure room");


    // SHOP ROOM
    while (floorStructure[ry][rx] != "1") {
        ry = getRand(floorStructure.length, 0);
        rx = getRand(floorStructure[ry].length, 0);
    }
    floorStructure[ry][rx] = "2";
    var randShop = getRand(shopRooms.length, 0);
    // assigner la Shop room
    currentFloor[ry][rx] = new Room("Shop", shopRooms[randShop], ry, rx, "Shop room");


    // SACRIFICE ROOM
    var failCount = 0;
    while (floorStructure[ry][rx] != "1" || failCount < 50) {
        failCount++;
        ry = getRand(floorStructure.length, 0);
        rx = getRand(floorStructure[ry].length, 0);
    }
    floorStructure[ry][rx] = "2";
    var sacriRand = getRand(2, 1);
    // assigner la Sacrifice room
    if (sacriRand == 2) currentFloor[ry][rx] = new Room("Sacrifice", sacrificeRooms[0], ry, rx, "Sacrifice room");


    // CURSED ROOM
    failCount = 0;
    while (floorStructure[ry][rx] != "1" || failCount < 50) {
        failCount++;
        ry = getRand(floorStructure.length, 0);
        rx = getRand(floorStructure[ry].length, 0);
    }
    floorStructure[ry][rx] = "2";
    var randCursed = getRand(cursedRooms.length, 0);
    // assigner la curse room
    currentFloor[ry][rx] = new Room("Cursed", cursedRooms[randCursed], ry, rx, "Cursed room");

    // SECRET ROOM
    while (floorStructure[ry][rx] != "S") {
        ry = getRand(floorStructure.length, 0);
        rx = getRand(floorStructure[ry].length, 0);
    }
    var randSecret = getRand(secretRooms.length, 0);
    // assigner la Treasure room
    currentFloor[ry][rx] = new Room("Secret", secretRooms[randSecret], ry, rx, "Secret room");
    secretRooms.splice(randSecret, 1);

    // STARTING ROOM    
    for (var y2 = 0; y2 < floorStructure.length; y2++) {
        for (var x2 = 0; x2 < floorStructure[y2].length; x2++) {
            while (floorStructure[ry][rx] != "0") {
                ry = getRand(floorStructure.length, 0);
                rx = getRand(floorStructure[ry].length, 0);
            }
            // assigner la starting room
            currentFloor[ry][rx] = new Room("Room", startingRoom[0], ry, rx, floorrand + 1);
            game = currentFloor[ry][rx];
            currentFloor[ry][rx].isVisited = true;
            currentFloor[ry][rx].isCurrent = true;
        }
    }
    // créer le niveau
    for (var i = 0; i < currentFloor.length; i++) {
        for (var j = 0; j < currentFloor[i].length; j++) {
            // console.log("i = "+i+"... j = "+j);
            if (currentFloor[i][j].exists) {
                currentFloor[i][j].create();
                currentFloor[i][j].shopCreate();
            }
        }
    }
    // animation de chargement
    loadingAnimation = new Animation(7, 280, 356, 100, 80, 75, imageTool.bodyAnim, -7, 13, 1);
}

// Pause
function gameIsPaused() {
    if (keyPause && (Date.now() - lastPaused > 200)) {
        if (isPaused) isPaused = false;
        else isPaused = true;
        lastPaused = Date.now();
    }
    return isPaused;
}

// Mode Hitbox / debug
function toggleHitbox() {
    if (Date.now() - hitboxToggleDate > 300) {
        if (hitBox) hitBox = false;
        else hitBox = true;
        game.updateBackground();
        hitboxToggleDate = Date.now();
    }
}

// Image de fond
var Background = {
    x: 0,
    y: 0,
    height: 576,
    width: 960,
    draw: function (context) {
        //BG
        if (game.type == "Secret" || game.type == "Cursed") context.drawImage(imageTool.bgsecret, this.x, this.y, this.width, this.height);
        else context.drawImage(imageTool["bg" + floorCount], this.x, this.y, this.width, this.height);

        //OVERLAY 
        if (game.type == "Boss" || game.type == "Sacrifice") {
            context.drawImage(imageTool.bloodRoom, this.x, this.y, this.width, this.height);
            context.drawImage(imageTool.overlayboss, this.x, this.y, this.width, this.height);
        } else if (game.overlayRand == 3 && floorCount < 3 && game.type == "Room") context.drawImage(imageTool["overlay" + floorCount], this.x, this.y, this.width, this.height);
    }
};

//Vide
function nothing() {
    this.exists = false;
}

function changeRoom(side) {
    lastChange = Date.now();
    Player.accelx = 0;
    Player.accely = 0;
    transitionStage = 5;
    game.isCurrent = false;
    game.reset();
    changeRoomSide = side;
    for (var i = 0; i < game.Items.length; i++) {
        if (game.Items[i].type == "Chest" || game.Items[i].type == "Redchest") {
            if (!game.Items[i].canBeUsed) game.Items.splice(i, 1);
        }
    }
    game.doorReset();
}

function newRoom() {
    if (changeRoomSide == "left") {
        game = currentFloor[game.locy][game.locx - 1];
        Player.x = canvas.width - 100;
    } else if (changeRoomSide == "right") {
        game = currentFloor[game.locy][game.locx + 1];
        Player.x = 74;
    } else if (changeRoomSide == "up") {
        game = currentFloor[game.locy - 1][game.locx];
        Player.y = canvas.height - 120;
    } else if (changeRoomSide == "down") {
        game = currentFloor[game.locy + 1][game.locx];
        Player.y = 74;
    }

    if (!game.isVisited) {
        game.isVisited = true;
        gameStats.rooms++;
    }
    game.isCurrent = true;
    game.updateBackground();
}

function transition() {
    //CHANGEMENT D'ÉTAGE
    if (transitionStage < 5) {
        context.save();
        if (roomChangeOpac < 1 && transitionStage == 1) roomChangeOpac += 0.03;
        if (roomChangeOpac >= 1 && transitionStage == 1) {
            transitionStage = 2;
            generateFloor();
            game.updateBackground();
        }
        if (transitionStage == 2 && timeCounter < 120) {
            Player.accelx = 0;
            Player.accely = 0;
            timeCounter++;
            loadingIconPos++;
            if (timeCounter > 119) {
                transitionStage = 3;
                timeCounter = 0;
            }
        }
        if (roomChangeOpac > 0 && transitionStage == 3) roomChangeOpac -= 0.03;
        if (roomChangeOpac <= 0 && transitionStage == 3) {
            transitionStage = 0;
            roomChangeOpac = 0;
            timeCounter = 0;
        }
        context.globalAlpha = roomChangeOpac;
        context.drawImage(imageTool.loading, 0, 0, canvas.width, canvas.height);

        context.font = "12pt wendy";
        context.fillStyle = 'white';
        var floornames = ["Basement", "Caves", "The Depths"];
        var flooricons = [imageTool.duke, imageTool.duke2, imageTool.project];
        context.textAlign = 'center';

        //BG
        for (var i = 0; i < floornames.length; i++) {
            context.drawImage(imageTool.uibar, 0, i * 120 + 90, 400, 70);
        }

        //ISAAC ANIMATION
        if (transitionStage == 2) {
            loadingAnimation.update(360, loadingIconPos - 37);
            loadingAnimation.draw(context);
        } else context.drawImage(imageTool.bodyIdle, 357, loadingIconPos - 23, 40, 40);
        context.drawImage(imageTool.playerDown, 345, loadingIconPos - 58, 64, 55);

        //FLOOR NAMES & BOSS ICONS
        for (var i3 = 0; i3 < floornames.length; i3++) {
            context.fillText(floornames[i3], canvas.width / 2 - 250, i3 * 120 + 120);
            context.drawImage(flooricons[i3], 20, i3 * 120 + 60, 110, 110);
        }


        context.restore();
        isChanging = true;
    }
    //CHANGEMENT DE PIECE
    else if (transitionStage > 4) {
        //context.clearRect(0,0,canvas.width,canvas.height);
        context.save();
        if (roomChangeOpac < 1 && transitionStage == 5) roomChangeOpac += 0.04;
        if (roomChangeOpac >= 1 && transitionStage == 5) {
            transitionStage = 6;
            newRoom();
            game.updateBackground();
        }
        if (roomChangeOpac > 0 && transitionStage == 6) roomChangeOpac -= 0.05;
        if (roomChangeOpac <= 0 && transitionStage == 6) {
            transitionStage = 0;
            roomChangeOpac = 0;
        }
        context.globalAlpha = roomChangeOpac;
        context.drawImage(imageTool.blackScreen, 0, 0, canvas.width, canvas.height);
        context.restore();
        isChanging = true;

        playerBullets = [];
    }

    game.updateBackground();
}

function changeFloor() {
    lastChange = Date.now();
    game.isCurrent = false;
    game.reset();
    Player.accelx = 0;
    Player.accely = 0;
    transitionStage = 1;

    game.updateBackground();
}

function showAdjacentRooms() {
    //Découvrir les pièces adjacentes
    if (game.locx > 0 && currentFloor[game.locy][game.locx - 1].exists && currentFloor[game.locy][game.locx - 1].type != "Secret") {
        currentFloor[game.locy][game.locx - 1].isVisible = true;
        currentFloor[game.locy][game.locx - 1].iconVisible = true;
    }
    if (game.locx < currentFloor[game.locy].length - 1 && currentFloor[game.locy][game.locx + 1].exists && currentFloor[game.locy][game.locx + 1].type != "Secret") {
        currentFloor[game.locy][game.locx + 1].isVisible = true;
        currentFloor[game.locy][game.locx + 1].iconVisible = true;
    }
    if (game.locy > 0 && currentFloor[game.locy - 1][game.locx].exists && currentFloor[game.locy - 1][game.locx].type != "Secret") {
        currentFloor[game.locy - 1][game.locx].isVisible = true;
        currentFloor[game.locy - 1][game.locx].iconVisible = true;
    }
    if (game.locy < currentFloor.length - 1 && currentFloor[game.locy + 1][game.locx].exists && currentFloor[game.locy + 1][game.locx].type != "Secret") {
        currentFloor[game.locy + 1][game.locx].isVisible = true;
        currentFloor[game.locy + 1][game.locx].iconVisible = true;
    }
}

function showMap(item) {
    if (item == "Treasure Map") {
        for (var i = 0; i < currentFloor.length; i++) {
            for (var j = 0; j < currentFloor[i].length; j++) {
                if (currentFloor[i][j].exists) currentFloor[i][j].isVisible = true;
            }
        }
    } else if (item == "The Compass") {
        for (var i2 = 0; i2 < currentFloor.length; i2++) {
            for (var j2 = 0; j2 < currentFloor[i2].length; j2++) {
                if (currentFloor[i2][j2].exists) currentFloor[i2][j2].iconVisible = true;
            }
        }
    }
}

/*******************************************************************************************************************************************************************************************
********************************************************************************************************************************************************************************************
OBJET PRINCIPAL / MAIN OBJECT
*******************************************************************************************************************************************************************************************
*******************************************************************************************************************************************************************************************/

function Room(type, map, locy, locx, title) {
    this.type = type;
    this.title = title;
    this.locy = locy; //Position Y dans l'array d'étage
    this.locx = locx; // Position X dans l'array d'étage
    this.grid = [];
    this.map = map; //Tileset
    this.overlayRand = getRand(3, 1);

    // ennemi
    this.enemyBullets = [];
    this.boss = [];
    this.enemies = []; //Monstres errants
    this.enemyCount = 0; //Total d'ennemies présents
    this.combatMode = 1; // mode de combat

    // objets obstacles ou interactifs
    this.wallMaps = []; // murs invisibles

    // items et shop
    this.currentPickupPool = [];
    this.currentShopPool = [];
    this.shop = [];
    this.Items = []; // drops, gold, boosts, hp, tout objets


    // gestion des sprites statiques, effets, bombes
    this.overSprites = []; // image fixes flottantes
    this.sprites = []; // images fixes, sang, taches, etc
    this.Bombs = [];
    this.Explosions = [];

    // gestion de la minimap
    this.lootx = 0; // positionx du loot de room
    this.looty = 0; // positiony du loot de room
    this.canSpawnLoot = false; // détermine si la room peut donner du loot ou pas
    this.exists = true; // propriété pour filtrer l'array des salles existantes et des emplacements vides
    this.isVisited = false; // minimap, la salle a été visité
    this.isCurrent = false; // minimap, la salle actuelle
    this.isVisible = false; // minimap, la salle est visible (adjacente à une salle visitée, ou le joueur possède une carte)
    this.iconVisible = false; // minimap, l'icone de la salle est visible (adjacente à une salle visitée, ou le joueur possède une boussole)
    this.coinPresent = false;
    this.keyPresent = false;
    this.chestPresent = false;
    this.bombPresent = false;
    this.hpPresent = false;

    this.shopCreate = function () {
        if (this.type == "Shop") {
            this.currentPickupPool = ["Key", "Bomb", "Heart", "Soul Heart", "Half Heart"];
            this.currentShopPool = shopPool;

            // console.log('this.currentPickupPool.length = ' + this.currentPickupPool.length);
            // console.log('this.currentShopPool.length = ' + this.currentShopPool.length);

            this.shop = [];

            for (var i = 0, y = 0; i < this.map.length; i++, y += 64) {
                for (var j = 0, x = 0; j < this.map[i].length; j++, x += 64) {
                    if (this.map[i][j] == "Sh") this.shop.push(new shopItem(x, y));
                }
            }
            //for(var p = 0; p< this.shop.length; p++){
            //  this.shop[p].create();}
        }
    };
    this.create = function () {
        for (var i = 0, y = 0; i < this.map.length; i++, y += 64) {
            this.grid[i] = new Array(this.map[i].length);
            for (var j = 0, x = 0; j < this.map[i].length; j++, x += 64) {
                var locked = false;

                // espaces libres
                // this.wallMaps.push(new freeCell(x, y));
                this.grid[i][j] = 1;

                // position du joueur
                if (this.map[i][j] == "Pl") {
                    Player.x = x + 15;
                    Player.y = y;
                    if (floorCount == 1) this.sprites.push(new Sprite(imageTool.tutorial, 130, 100, 700, 238));
                }
                /* PORTES */
                // porte gauche
                else if (this.map[i][j] == "+L") {
                    if (this.locx > 0) {
                        if (currentFloor[this.locy][this.locx - 1].exists) {
                            if ((currentFloor[this.locy][this.locx - 1].type == "Treasure" && floorCount > 1) ||
                                currentFloor[this.locy][this.locx - 1].type == "Shop") locked = true;
                            else locked = false;
                            this.wallMaps.push(new Door(x, y, "left", currentFloor[this.locy][this.locx - 1].type, locked));
                        } else this.wallMaps.push(new Wall(x, y));
                    } else this.wallMaps.push(new Wall(x, y));

                    this.grid[i][j] = 0;
                }

                // porte droite
                else if (this.map[i][j] == "+R") {
                    if (this.locx < currentFloor[this.locy].length - 1) {
                        if (currentFloor[this.locy][this.locx + 1].exists) {
                            if ((currentFloor[this.locy][this.locx + 1].type == "Treasure" && floorCount > 1) ||
                                currentFloor[this.locy][this.locx + 1].type == "Shop") locked = true;
                            else locked = false;
                            this.wallMaps.push(new Door(x, y, "right", currentFloor[this.locy][this.locx + 1].type, locked));
                        } else this.wallMaps.push(new Wall(x, y));
                    } else this.wallMaps.push(new Wall(x, y));

                    this.grid[i][j] = 0;
                }

                // porte du haut
                else if (this.map[i][j] == "+U") {
                    if (this.locy > 0) {
                        if (currentFloor[this.locy - 1][this.locx].exists) {
                            if ((currentFloor[this.locy - 1][this.locx].type == "Treasure" && floorCount > 1) ||
                                currentFloor[this.locy - 1][this.locx].type == "Shop") locked = true;
                            else locked = false;
                            this.wallMaps.push(new Door(x, y, "up", currentFloor[this.locy - 1][this.locx].type, locked));
                        } else this.wallMaps.push(new Wall(x, y));
                    } else this.wallMaps.push(new Wall(x, y));

                    this.grid[i][j] = 0;
                }

                // porte du bas
                else if (this.map[i][j] == "+D") {
                    if (this.locy < currentFloor.length - 1) {
                        if (currentFloor[this.locy + 1][this.locx].exists) {
                            if ((currentFloor[this.locy + 1][this.locx].type == "Treasure" && floorCount > 1) ||
                                currentFloor[this.locy + 1][this.locx].type == "Shop") locked = true;
                            else locked = false;
                            this.wallMaps.push(new Door(x, y, "down", currentFloor[this.locy + 1][this.locx].type, locked));
                        } else this.wallMaps.push(new Wall(x, y));
                    } else this.wallMaps.push(new Wall(x, y));

                    this.grid[i][j] = 0;
                }

                // obstacles
               // else if (this.map[i][j] == "  ") {
               //    this.wallMaps.push(new freeCell(x, y));
               // } 
                else if (this.map[i][j] == "Tg") {
                    this.wallMaps.push(new Glue(x, y));
                } else if (this.map[i][j] == "Ts") {
                    this.wallMaps.push(new Spikes(x, y));
                } else if (this.map[i][j] == "!!") {
                    this.wallMaps.push(new Wall(x, y));
                    this.grid[i][j] = 0;
                } else if (this.map[i][j] == "Bl") {
                    this.wallMaps.push(new Block(x, y));
                    this.grid[i][j] = 0;
                } else if (this.map[i][j] == "Oo") {
                    this.wallMaps.push(new Poop(x, y));
                    this.grid[i][j] = 0;
                } else if (this.map[i][j] == "Tn") {
                    this.wallMaps.push(new Tnt(x, y));
                    this.grid[i][j] = 0;
                } else if (this.map[i][j] == "Tf") {
                    this.wallMaps.push(new Fireplace(x, y, "fireplace"));
                    this.grid[i][j] = 0;
                } else if (this.map[i][j] == "Th") {
                    this.wallMaps.push(new Fireplace(x, y, "hellfireplace"));
                    this.grid[i][j] = 0;
                } else if (this.map[i][j] == "HA" || this.map[i][j] == "HB" || this.map[i][j] == "HC" || this.map[i][j] == "HD" ||
                    this.map[i][j] == "HE" || this.map[i][j] == "HF" || this.map[i][j] == "HG" || this.map[i][j] == "HH" ||
                    this.map[i][j] == "HI" || this.map[i][j] == "HJ" || this.map[i][j] == "HK" || this.map[i][j] == "HL" ||
                    this.map[i][j] == "HM" || this.map[i][j] == "HN" || this.map[i][j] == "HO" || this.map[i][j] == "HP") {
                    this.wallMaps.push(new Hole(x, y, this.map[i][j]));
                    this.grid[i][j] = 0;
                }

                // enemis
                else if (this.map[i][j] == "Sp") {
                    this.enemies.push(new Spider(x + 15, y + 25, 1 + floorCount * 2 / 3, "spider", true));
                } else if (this.map[i][j] == "Sb") {
                    this.enemies.push(new Spider(x + 15, y + 25, 3 + floorCount * 2 / 3, "buttspider", true));
                } else if (this.map[i][j] == "Zo") {
                    this.enemies.push(new Zombie(x + 10, y + 20, 3 + floorCount * 2 / 3));
                } else if (this.map[i][j] == "Cl") {
                    this.enemies.push(new Clotty(i, j, x + 10, y + 20, 5 + floorCount * 2 / 3));
                } else if (this.map[i][j] == "Ma") {
                    this.enemies.push(new Maggot(i, j, x + 10, y + 20, 3 + floorCount * 2 / 3));
                } else if (this.map[i][j] == "Fl") {
                    this.enemies.push(new Fly(x, y, 1 + floorCount * 2 / 3, "Black", true));
                } else if (this.map[i][j] == "Af") {
                    this.enemies.push(new Fly(x, y, 1 + floorCount * 2 / 3, "Attack", true));
                } else if (this.map[i][j] == "Pf") {
                    this.enemies.push(new Fly(x, y, 2 + floorCount * 2 / 3, "Pooter", true));
                } else if (this.map[i][j] == "To") {
                    this.enemies.push(new Tower(x, y, 4 + floorCount * 2 / 3, true));
                }

                // bosses
                else if (this.map[i][j] == "X1") {
                    this.boss.push(new Duke(x, y, 100, 1));
                } else if (this.map[i][j] == "X2") {
                    this.boss.push(new Duke(x, y, 200, 2));
                } else if (this.map[i][j] == "X3") {
                    this.boss.push(new Project(422, 230, 300));
                } else if (this.map[i][j] == "ZZ") {
                    this.Items.push(new TrapDoor(x, y));
                }

                // shopkeeper
                else if (this.map[i][j] == "Sk") {
                    var skimg = "shopkeeper" + getRand(9, 1);
                    this.overSprites.push(new Shopkeeper(imageTool[skimg], x, y, 60, 20));
                }

                // items
                else if (this.map[i][j] == "CC") {
                    this.Items.push(new Chest(x, y, "Chest"));
                } else if (this.map[i][j] == "RC") {
                    this.Items.push(new Chest(x, y, "Redchest"));
                } else if (this.map[i][j] == "XY") {
                    this.lootx = x + 10;
                    this.looty = y + 10;
                    this.canSpawnLoot = true;
                } else if (this.map[i][j] == "00") {
                    loot("Health", x + 10, y + 10, this);
                } else if (this.map[i][j] == "01") {
                    loot("Money", x + 10, y + 10, this);
                } else if (this.map[i][j] == "02") {
                    this.Items.push(new Item(x + 16, y + 16, "Bomb"));
                } else if (this.map[i][j] == "03") {
                    this.Items.push(new Item(x + 16, y + 16, "Key"));
                } else if (this.map[i][j] == "04") {
                    this.Items.push(new Item(x + 16, y + 16, "Number One"));
                } else if (this.map[i][j] == "05") {
                    this.Items.push(new Item(x + 16, y + 16, "Wiggle Worm"));
                } else if (this.map[i][j] == "06") {
                    this.Items.push(new Item(x + 16, y + 16, "The Halo"));
                } else if (this.map[i][j] == "07") {
                    this.Items.push(new Item(x + 16, y + 16, "Pyro"));
                } else if (this.map[i][j] == "08") {
                    this.Items.push(new Item(x + 16, y + 16, "Jesus Juice"));
                } else if (this.map[i][j] == "09") {
                    this.Items.push(new Item(x + 16, y + 16, "Wire Coat Hanger"));
                } else if (this.map[i][j] == "10") {
                    this.Items.push(new Item(x + 16, y + 16, "Speed Ball"));
                } else if (this.map[i][j] == "11") {
                    this.Items.push(new Item(x + 16, y + 16, "The Small Rock"));
                } else if (this.map[i][j] == "12") {
                    this.Items.push(new Item(x + 16, y + 16, "Mom's Lipstick"));
                } else if (this.map[i][j] == "13") {
                    this.Items.push(new Item(x + 16, y + 16, "The Inner Eye"));
                } else if (this.map[i][j] == "14") {
                    this.Items.push(new Item(x + 16, y + 16, "Tooth Picks"));
                } else if (this.map[i][j] == "15") {
                    this.Items.push(new Item(x + 16, y + 16, "Growth Hormones"));
                } else if (this.map[i][j] == "16") {
                    this.Items.push(new Item(x + 16, y + 16, "<3"));
                } else if (this.map[i][j] == "17") {
                    this.Items.push(new Item(x + 16, y + 16, "Skeleton Key"));
                } else if (this.map[i][j] == "18") {
                    this.Items.push(new Item(x + 16, y + 16, "The Belt"));
                }
                this.doorReset();
            }
        }
    };
    this.update = function () {
        Player.update();

        //Détection items laissés dans les salles
        this.coinPresent = false;
        this.keyPresent = false;
        this.chestPresent = false;
        this.bombPresent = false;
        this.hpPresent = false;

        for (var i = 0; i < this.Items.length; i++) {
            if (this.Items[i].type == "Half Heart" || this.Items[i].type == "Heart" || this.Items[i].type == "Soul Heart") this.hpPresent = true;
            else if (this.Items[i].type == "Nickel" || this.Items[i].type == "Coin" || this.Items[i].type == "Dime") this.coinPresent = true;
            else if (this.Items[i].type == "Chest" || this.Items[i].type == "Redchest")
                if (this.Items[i].canBeUsed) this.chestPresent = true;
            else if (this.Items[i].type == "Key") this.keyPresent = true;
            else if (this.Items[i].type == "Bomb") this.bombPresent = true;
        }

        // maximum de sprites
        if (this.sprites.length > 300) this.sprites.splice(10, 1);

        for (var k = 0; k < this.sprites.length; k++) {
            this.sprites[k].update();
        }

        for (var l = 0; l < this.overSprites.length; l++) {
            this.overSprites[l].update();
        }

        for( var wi = 0; wi < this.wallMaps; wi++){
            if(!this.wallMaps[wi].alive) {
                console.log(wi);
                this.wallMaps.splice(wi, 1);
            }
        }

        for (var u = 0; u < this.Items.length; u++) {
            this.Items[u].update();
            if (!this.Items[u].alive) this.Items.splice(u, 1);
        }

        for (var s = 0; s < this.shop.length; s++) {
            this.shop[s].update();
            if (!this.shop[s].alive) this.shop.splice(s, 1);
        }

        for (var h = 0; h < this.Bombs.length; h++) {
            this.Bombs[h].update();
            if (!this.Bombs[h].alive) this.Bombs.splice(h, 1);
        }

        for (var v = 0; v < this.Explosions.length; v++) {
            this.Explosions[v].update();
            if (!this.Explosions[v].alive) this.Explosions.splice(v, 1);
        }

        for (var xb = 0; xb < this.boss.length; xb++) {
            this.boss[xb].update();
            if (!this.boss[xb].alive) {
                this.boss.splice(xb, 1);
                gameStats.kill++;
            }
        }

        for (var t = 0; t < this.enemies.length; t++) {
            this.enemies[t].update();
            if (!this.enemies[t].alive) {
                this.enemies.splice(t, 1);
                gameStats.kill++;
            }
        }

        for (var j = 0; j < playerBullets.length; j++) {
            playerBullets[j].update();
            if (!playerBullets[j].alive) {
                bulletImpact("player", playerBullets[j].x, playerBullets[j].y, -50, -50);
                playerBullets.splice(j, 1);
            }
        }

        for (var tb = 0; tb < this.enemyBullets.length; tb++) {
            this.enemyBullets[tb].update();
        }

        for (var p = 0; p < this.wallMaps.length; p++) {
            if (this.wallMaps[p].type == "Chest" || this.wallMaps[p].type == "Redchest") this.wallMaps[p].update();
        }

       

        this.enemyCount = this.enemies.length + this.boss.length;
        if (this.enemyCount <= 0) {
            if (this.canSpawnLoot) {
                createItem(this.lootx, this.looty, this.type, false);
                this.canSpawnLoot = false;
            }
            this.combatMode = 0;
        } else if (this.boss.length !== 0) this.combatMode = 2;
        else this.combatMode = 1;
    };
    // afficher le background
    this.updateBackground = function () {
        bgcontext.clearRect(0, 0, bgcanvas.width, canvas.height);
        Background.draw(bgcontext);
        this.flagCollision();

        // sprites
        for (var k = 0; k < this.sprites.length; k++) {
            this.sprites[k].draw(bgcontext);
        }

        // decors
        for (var cc = 0 ; cc < this.wallMaps.length; cc++) {
            if (this.wallMaps[cc].type != "fireplace" && this.wallMaps[cc].type != "hellfireplace") {
                this.wallMaps[cc].draw(bgcontext);
                if (hitBox && this.wallMaps[cc].obstacle) this.drawHitBox(bgcontext, this.wallMaps[cc], true, null);
            }
        }

        bgcontext.drawImage(imageTool.uinote, -60, canvas.height - 30, 300, 40);
        bgcontext.font = "12pt wendy";
        bgcontext.fillStyle = 'white';
        if (this.type == "Room") {
            if (floorCount == 1) floorname = "Basement " + this.title;
            else if (floorCount == 2) floorname = "Caves " + this.title;
            else if (floorCount == 3) floorname = "The Depths " + this.title;
        } else floorname = this.title;
        bgcontext.fillText(floorname, 8, canvas.height - 8);
        // console.log("background updated!");
    };
    this.draw = function () {
        //Definition contexte canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.globalAlpha = 1;

        /**
         *
         * Affichage des objets
         *
         **/

        // feux
        for (var c = 0; c < this.wallMaps.length; c++) {
            if (this.wallMaps[c].type == "fireplace" || this.wallMaps[c].type == "hellfireplace") {
                this.wallMaps[c].draw(context);
                if (hitBox) this.drawHitBox(context, this.wallMaps[c], true, null);
            }
        }

        for (var u = 0; u < this.Items.length; u++) {
            this.Items[u].draw(context);
            if (hitBox) this.drawHitBox(context, this.Items[u], true, null);
        }

        for (var s = 0; s < this.shop.length; s++) {
            this.shop[s].draw(context);
            if (!this.shop[s].alive) this.shop.splice(s, 1);
        }

        for (var v = 0; v < this.Bombs.length; v++) {
            this.Bombs[v].draw(context);
            if (hitBox) this.drawHitBox(context, this.Bombs[v], true, null);
        }

        // contours de collisions
        if(hitBox){
            for (var cc = 0; cc < this.wallMaps.length; cc++) {
                var obj = this.wallMaps[cc];

                if (obj.colUp) {
                    context.strokeStyle = "blue";
                    context.beginPath();
                    context.moveTo(obj.x + obj.width, obj.y);
                    context.lineTo(obj.x, obj.y);
                    context.lineWidth = 2;
                    context.stroke();
                    context.lineWidth = 1;
                }
                if (obj.colDown) {
                    context.strokeStyle = "blue";
                    context.beginPath();
                    context.moveTo(obj.x + obj.width, obj.y + obj.height);
                    context.lineTo(obj.x, obj.y + obj.height);
                    context.lineWidth = 2;
                    context.stroke();
                    context.lineWidth = 1;
                }
                if (obj.colRight) {
                    context.strokeStyle = "blue";
                    context.beginPath();
                    context.moveTo(obj.x + obj.width, obj.y);
                    context.lineTo(obj.x + obj.width, obj.y + obj.height);
                    context.lineWidth = 2;
                    context.stroke();
                    context.lineWidth = 1;
                }
                if (obj.colLeft) {
                    context.strokeStyle = "blue";
                    context.beginPath();
                    context.moveTo(obj.x, obj.y);
                    context.lineTo(obj.x, obj.y + obj.height);
                    context.lineWidth = 2;
                    context.stroke();
                    context.lineWidth = 1;
                }
            }
        }
        





        // texte de loot
        if (Player.textShowing) {
            context.save();
            context.fillStyle = 'white';
            context.textAlign = 'center';
            context.font = "20pt wendy";
            context.drawImage(imageTool.uibar, 0, 0, 960, 60);
            context.fillText(Player.itemHoldingName, canvas.width / 2, 35);
            if (Player.itemHoldingDesc != " ") {
                context.font = "12pt wendy";
                context.textAlign = 'right';
                context.drawImage(imageTool.uinote, canvas.width - 240, canvas.height - 30, 300, 40);
                context.fillText(Player.itemHoldingDesc, canvas.width - 8, canvas.height - 8);
            }
            context.restore();
        }



        /*
         *
         * joueur
         *
         */

        // sprites flottants, sous le joueur
        var os = 0;
        var y_gap = 32;
        var overSpritesLength = this.overSprites.length;
        for (; os < overSpritesLength; os++){
            if(this.overSprites[os].y < Player.y + y_gap) this.overSprites[os].draw(context);
        }

        Player.drawBody(context);
        Player.drawHead(context);

        // sprites flottants, par dessus le joueur
        os = 0;
        for (; os < overSpritesLength; os++){
            if(this.overSprites[os].y >= Player.y + y_gap) this.overSprites[os].draw(context);
        }

        if (hitBox) this.drawHitBox(context, Player, true, true);

        // ennemis et elements ennemis
        if (!gameOver) {

            // ennemis de base
            for (var i = 0; i < this.enemies.length; i++) {
                this.enemies[i].draw(context);
                // affichage de la hitBox
                if (hitBox) this.drawHitBox(context, this.enemies[i], true, true);
            }

            // boss
            for (var xb = 0; xb < this.boss.length; xb++) {
                this.boss[xb].draw(context);

                // affichage de la hitBox
                if (hitBox) this.drawHitBox(context, this.boss[xb], true, true);
            }

            // explosions
            for (var w = 0; w < this.Explosions.length; w++) {
                this.Explosions[w].draw(context);

                // affichage de la hitBox
                if (hitBox) this.drawHitBox(context, this.Explosions[w], null, true);
            }

            // projectiles ennemis
            for (var tb = 0; tb < this.enemyBullets.length; tb++) {
                this.enemyBullets[tb].draw(context);

                // affichage de la hitBox
                if (hitBox) this.drawHitBox(context, this.enemyBullets[tb], null, true);
            }

            // projectiles joueurs
            for (var j = 0; j < playerBullets.length; j++) {
                playerBullets[j].draw(context);

                // affichage de la hitBox
                if (hitBox) this.drawHitBox(context, playerBullets[j], null, true);
            }

            // animations (sang, explosion etc)
            for (var f = 0; f < tempAnimations.length; f++) tempAnimations[f].drawOnce(context);
        }


        //game Over Screen
        if (gameOver) {
            context.save();
            if (gameOverOpac < 0.5) gameOverOpac += 0.03;
            context.globalAlpha = gameOverOpac;
            context.drawImage(imageTool.blackScreen, 0, 0, canvas.width, canvas.height);
            context.drawImage(imageTool.deathlight, Player.x - 60, Player.y - 430, 150, 500);
            context.restore();

            if (Date.now() - gameOverTime > 1000) {
                context.drawImage(imageTool.gameover, 260, 40, 670, 500);
                context.save();
                context.font = "14pt danielbk";
                context.textAlign = 'left';
                context.fillStyle = 'black';
                context.rotate(6 * Math.PI / 180);
                context.globalAlpha = 0.65;
                context.fillText(gameStats.rooms - 1, 500, 162);
                context.fillText(gameStats.kill, 405, 203);
                context.fillText(gameStats.bullet, 452, 242);
                var hitpercent = (gameStats.hit / gameStats.bullet) * 100;
                if (isNaN(hitpercent)) hitpercent = 0;
                context.fillText(hitpercent.toFixed(), 402, 281);
                context.restore();
            }
        }
        //UI
        Player.drawUI(uicontext);

        //Debug
        if (hitBox) {
            var boss = this.boss.length;
            var info1 = boss;
            var info2 = boss > 0 ? this.boss[0].phase : null;
            var info3 = this.enemies.length;
            var info4 = this.combatMode;
            var info5 = this.sprites.length;

            var data = [
                [true, 'Level', this.title],
                [true, 'Boss', info1],
                [true, 'Phase', info2],
                [true, "Minions", info3],
                [true, "Cbt mode", info4],
                [true, "Sprites", info5],
                [true, "Health", Player.hp],
                [true, "Bombs", Player.bombs],
                [true, "Keys", Player.keys],
                [true, "Gold", Player.gold]
            ];

            if (boss === 0) {
                data[2][0] = false;
            }

            // bg
            context.save();
            context.globalAlpha = 0.7;
            context.fillStyle = 'black';
            context.fillRect(0, 0, 180, 220);
            context.restore();

            // text
            context.font = "12pt Arial";
            context.fillStyle = 'white';

            var h = 0;
            var marginLeft = 20;
            var marginLeft2 = 130;
            for (var d = 0, datalgt = data.length; d < datalgt; d++) {
                if (data[d][0]) {
                    context.fillText(data[d][1], marginLeft, h * 20 + 20);
                    context.fillText(data[d][2], marginLeft2, h * 20 + 20);
                    h++;
                }
            }

        }

        //Pause
        if (isPaused) {
            context.save();
            context.globalAlpha = 0.7;
            context.drawImage(imageTool.blackScreen, 0, 0, canvas.width, canvas.height);
            context.restore();
            context.drawImage(imageTool.pauseScreen, 0, 0, canvas.width, canvas.height);
        }
    };
    this.drawHitBox = function (cxt, obj, square, circle) {

        cxt.save();
        cxt.globalAlpha = 0.5;

        if (square !== null) {
            cxt.beginPath();
            cxt.strokeStyle = 'white';
            cxt.rect(obj.x, obj.y, obj.width, obj.height);
            cxt.stroke();
            cxt.closePath();
        }

        if (circle !== null) {
            cxt.beginPath();
            cxt.arc(obj.x + obj.width / 2, obj.y + obj.height / 2, obj.width / 2, 0, 2 * Math.PI, false);
            cxt.fillStyle = 'red';
            cxt.fill();
        }
        cxt.restore();

        // point central
        cxt.beginPath();
        cxt.arc(obj.x + obj.width / 2, obj.y + obj.height / 2, 4, 0, 2 * Math.PI, false);
        cxt.fillStyle = 'white';
        cxt.fill();

        // cxt.drawImage(imageTool.hitBox, obj.x, obj.y, obj.width, obj.height);
    };
    this.reset = function () {
        for (var i = 0; i < this.enemies.length; i++) {
            this.enemies[i].reset();
        }
        for (var xb = 0; xb < this.boss.length; xb++) {
            this.boss[xb].reset();
        }
        this.enemyBullets = [];
        this.Bombs = [];
        playerBullets = [];
    };
    this.clear = function () {
        for (var i = 0; i < this.enemyBullets.length; i++) {
            if (!this.enemyBullets[i].alive) {
                bulletImpact("enemy", this.enemyBullets[i].x, this.enemyBullets[i].y, -50, -50);
                this.enemyBullets.splice(i, 1);
            }
        }
    };
    this.doorReset = function(){
        // reset les portes
        for (var d = 0; d < this.wallMaps.length; d++) {
            if(this.wallMaps[d].name == "Door") this.wallMaps[d].alive = true;
            /*if (this.wallMaps[d].type == "Cursed" || this.type == "Cursed") {
                this.wallMaps[d].type = "Cursed";
                this.wallMaps[d].locked = true;
                this.wallMaps[d].obstacle = true;
            }*/
        }      
    };
    this.flagCollision = function () {
        for (var col = 0; col < this.wallMaps.length; col++) {

            var bloc = this.wallMaps[col];
            for (var col2 = 0; col2 < this.wallMaps.length; col2++) {

                // si bloc est un obstacle et bloc 2 est une case libre
                var bloc2 = this.wallMaps[col2];
                if ( (bloc.type == "wall" || ( bloc.name == "Door" && bloc.obstacle) ) && ( bloc2.type == "wall" || (bloc2.name == "Door" && bloc2.obstacle) ) ){
                    // si le bloc2 libre est voisin du bloc 1, permettre les collisions du côté du bloc libre
                    // haut
                    if(bloc2.x == bloc.x && bloc2.y == bloc.y - 64) bloc.colUp = false;
                    // bas
                    else if(bloc2.x == bloc.x && bloc2.y == bloc.y + 64) bloc.colDown = false; 
                    // gauche
                    else if(bloc2.x == bloc.x - 64 && bloc2.y == bloc.y) bloc.colLeft = false;
                    // droite
                    else if(bloc2.x == bloc.x + 64 && bloc2.y == bloc.y) bloc.colRight = false;
                }
            }

        }
    };
}
console.log('main object...');

/*******************************************************************************************************************************************************************************************
********************************************************************************************************************************************************************************************
TUILES / GAME OBJECTS
*******************************************************************************************************************************************************************************************
*******************************************************************************************************************************************************************************************/

function Wall(x, y) {
    this.type = "wall";
    this.x = x;
    this.y = y;
    this.width = 64;
    this.height = 64;
    this.colUp = true;
    this.colDown = true;
    this.colLeft = true;
    this.colRight = true;
    this.obstacle = true;
    this.draw = function () {};
    this.use = function () {};
}
function Block(x, y) {
    this.rand = getRand(100, 1);
    this.type = "block";
    this.x = x;
    this.y = y;
    this.imgRand = getRand(3, 1);
    this.width = 64;
    this.height = 64;
    this.colUp = true;
    this.colDown = true;
    this.colLeft = true;
    this.colRight = true;
    this.canBeDestroyed = true;
    this.alive = true;
    this.canDrop = true;
    this.obstacle = true;
    this.destroy = function () {
        if (this.type == "xblock") {
            if (this.canDrop) {
                createItem(x, y, this.type);
                this.canDrop = false;
            }
        }
        this.canBeDestroyed = false;
        this.alive = false;
        this.obstacle = false;
        game.grid[this.y/64][this.x/64] = 1;
        this.type = "";
        this.colUp = false;
        this.colDown = false;
        this.colLeft = false;
        this.colRight = false;
        game.updateBackground();
    };
    this.draw = function (context) {
        if (this.rand == 1) this.type = "xblock";
        else this.type = "block";
        if (this.alive) {

            if (this.type == "xblock") context.drawImage(imageTool.xblock, this.x, this.y, this.width, this.height);
            else {
                switch (this.imgRand) {
                case 1:
                    context.drawImage(imageTool.block, this.x, this.y, this.width, this.height);
                    break;
                case 2:
                    context.drawImage(imageTool.block1, this.x, this.y, this.width, this.height);
                    break;
                case 3:
                    context.drawImage(imageTool.block2, this.x, this.y, this.width, this.height);
                    break;
                default:
                    context.drawImage(imageTool.block, this.x, this.y, this.width, this.height);
                    break;
                }
            }
        }
    };
    this.use = function () {};
}

function Hole(x, y, name) {
    this.type = "hole";
    this.name = name;
    this.x = x;
    this.y = y;
    this.width = 64;
    this.height = 64;
    this.colUp = true;
    this.colDown = true;
    this.colLeft = true;
    this.colRight = true;
    this.canBeDestroyed = false;
    this.obstacle = true;
    this.draw = function (context) {
        context.drawImage(imageTool[this.name], x - 7, y + 8, 74, 74);
    };
    this.use = function () {};
}

function Door(x, y, side, type, locked) {
    this.side = side;
    this.name = "Door";
    this.type = type;
    this.locked = locked;
    this.x = x;
    this.y = y;
    this.width = 64;
    this.height = 64;
    this.colUp = true;
    this.colDown = true;
    this.colLeft = true;
    this.colRight = true;
    this.img = 0;
    this.bgimg = 0;
    this.canBeDestroyed = true;
    this.alive = true;
    this.obstacle = true;
    this.use = function (obj) {
        if (game.combatMode === 0 && obj.type == "Player") {
            if (this.locked && (this.type == "Shop" || this.type == "Treasure") && Player.keys > 0) {
                this.locked = false;
                this.obstacle = false;
                Player.keys--;
                game.updateBackground();
            } else if (this.type == "Cursed" || game.type == "Cursed") {
                //this.locked = false;
                //this.obstacle = false;
                game.updateBackground();
                Player.getDamage(0.5);
            }
        }
    };
    this.destroy = function () {
        if (game.type != "Boss") {
            this.alive = false;
            game.updateBackground();
        }
    };
    this.draw = function (context) {
        if (!this.alive) {
            if (this.type != "Treasure" && this.type != "Shop") this.obstacle = false;
            else this.alive = true;
        } else if (game.combatMode !== 0 || this.locked) this.obstacle = true;
        else this.obstacle = false;
        if (this.side == "left") {
            this.imgwidth = 74;
            this.imgheight = 128;
            this.offsetx = -3;
            this.offsety = -30;
            this.bgwidth = 54;
            this.bgheight = 94;
            this.bgx = 12;
            this.bgy = -12;
            if (game.type == "Secret" && this.type != ("Secret" || "Cursed")) {
                this.img = imageTool.secretL;
                this.bgimg = imageTool.spacer;
            } else if (this.type == "Secret") {
                if (this.alive) {
                    this.obstacle = true;
                    this.img = imageTool.spacer;
                    this.bgimg = imageTool.spacer;
                } else this.img = imageTool.secretL;
                this.bgimg = imageTool.spacer;
            } else {
                if (this.type == "Treasure") {
                    if (this.locked) this.bgimg = imageTool.keyholeL;
                    else this.bgimg = imageTool.doorLopen;
                    this.img = imageTool.TdoorL;
                } else if (this.type == "Cursed" || game.type == "Cursed") {
                    this.img = imageTool.curseddoorL;
                } else if (this.type == "Shop") {
                    if (this.locked) this.bgimg = imageTool.shopKeyholeL;
                    else this.bgimg = imageTool.doorLopen;
                    this.img = imageTool.doorL;
                } else if (this.type == "Boss") this.img = imageTool.BdoorL;

                else this.img = imageTool.doorL;


                if (!this.alive) this.bgimg = imageTool.doorLopen;
                else if (game.combatMode !== 0 && (this.type == "Cursed" || game.type == "Cursed")) this.bgimg = imageTool.doorLclosed;
                else if (game.combatMode !== 0 && !this.locked) this.bgimg = imageTool.doorLclosed;
                else if (!this.locked || this.type == "Cursed" || game.type == "Cursed") this.bgimg = imageTool.doorLopen;
            }
        } else if (this.side == "right") {
            this.imgwidth = 74;
            this.imgheight = 128;
            this.offsetx = -5;
            this.offsety = -30;
            this.bgwidth = 54;
            this.bgheight = 94;
            this.bgx = 0;
            this.bgy = -12;
            if (game.type == "Secret" && this.type != ("Secret" || "Cursed")) {
                this.img = imageTool.secretR;
                this.bgimg = imageTool.spacer;
            } else if (this.type == "Secret") {
                if (this.alive) {
                    this.obstacle = true;
                    this.img = imageTool.spacer;
                    this.bgimg = imageTool.spacer;
                } else this.img = imageTool.secretR;
                this.bgimg = imageTool.spacer;
            } else {
                if (this.type == "Treasure") {
                    if (this.locked) this.bgimg = imageTool.keyholeR;
                    else this.bgimg = imageTool.doorRopen;
                    this.img = imageTool.TdoorR;
                } else if (this.type == "Cursed" || game.type == "Cursed") {
                    this.img = imageTool.curseddoorR;
                } else if (this.type == "Shop") {
                    if (this.locked) this.bgimg = imageTool.shopKeyholeR;
                    else this.bgimg = imageTool.doorRopen;
                    this.img = imageTool.doorR;
                } else if (this.type == "Boss") this.img = imageTool.BdoorR;

                else this.img = imageTool.doorR;

                if (!this.alive) this.bgimg = imageTool.doorRopen;
                else if (game.combatMode !== 0 && (this.type == "Cursed" || game.type == "Cursed")) this.bgimg = imageTool.doorRclosed;
                else if (game.combatMode !== 0 && !this.locked) this.bgimg = imageTool.doorRclosed;
                else if (!this.locked || this.type == "Cursed" || game.type == "Cursed") this.bgimg = imageTool.doorRopen;
            }
        } else if (this.side == "up") {
            this.imgwidth = 138;
            this.imgheight = 84;
            this.offsetx = -35;
            this.offsety = -4;
            this.bgwidth = 94;
            this.bgheight = 54;
            this.bgx = -13;
            this.bgy = 18;
            if (game.type == "Secret" && this.type != ("Secret" || "Cursed")) {
                this.img = imageTool.secretU;
                this.bgimg = imageTool.spacer;
            } else if (this.type == "Secret") {
                if (this.alive) {
                    this.obstacle = true;
                    this.img = imageTool.spacer;
                    this.bgimg = imageTool.spacer;
                } else this.img = imageTool.secretU;
                this.bgimg = imageTool.spacer;
            } else {
                if (this.type == "Treasure") {
                    if (this.locked) this.bgimg = imageTool.keyholeU;
                    else this.bgimg = imageTool.doorUopen;
                    this.img = imageTool.TdoorU;
                } else if (this.type == "Cursed" || game.type == "Cursed") {
                    this.img = imageTool.curseddoorU;
                } else if (this.type == "Shop") {
                    if (this.locked) this.bgimg = imageTool.shopKeyholeU;
                    else this.bgimg = imageTool.doorUopen;
                    this.img = imageTool.doorU;
                } else if (this.type == "Boss") this.img = imageTool.BdoorU;

                else this.img = imageTool.doorU;

                if (!this.alive) this.bgimg = imageTool.doorUopen;
                else if (game.combatMode !== 0 && (this.type == "Cursed" || game.type == "Cursed")) this.bgimg = imageTool.doorUclosed;
                else if (game.combatMode !== 0 && !this.locked) this.bgimg = imageTool.doorUclosed;
                else if (!this.locked || this.type == "Cursed" || game.type == "Cursed") this.bgimg = imageTool.doorUopen;
            }
        } else if (this.side == "down") {
            this.imgwidth = 138;
            this.imgheight = 84;
            this.offsetx = -35;
            this.offsety = -12;
            this.bgwidth = 94;
            this.bgheight = 64;
            this.bgx = -13;
            this.bgy = -8;
            if (game.type == "Secret" && this.type != ("Secret" || "Cursed")) {
                this.img = imageTool.secretD;
                this.bgimg = imageTool.spacer;
            } else if (this.type == "Secret") {
                if (this.alive) {
                    this.obstacle = true;
                    this.img = imageTool.spacer;
                    this.bgimg = imageTool.spacer;
                } else this.img = imageTool.secretD;
                this.bgimg = imageTool.spacer;
            } else {
                if (this.type == "Treasure") {
                    if (this.locked) this.bgimg = imageTool.keyholeD;
                    else this.bgimg = imageTool.doorDopen;
                    this.img = imageTool.TdoorD;
                } else if (this.type == "Cursed" || game.type == "Cursed") {
                    this.img = imageTool.curseddoorD;
                } else if (this.type == "Shop") {
                    if (this.locked) this.bgimg = imageTool.shopKeyholeD;
                    else this.bgimg = imageTool.doorDopen;
                    this.img = imageTool.doorD;
                } else if (this.type == "Boss") this.img = imageTool.BdoorD;

                else this.img = imageTool.doorD;

                if (!this.alive) this.bgimg = imageTool.doorDopen;
                else if (game.combatMode !== 0 && (this.type == "Cursed" || game.type == "Cursed")) this.bgimg = imageTool.doorDclosed;
                else if (game.combatMode !== 0 && !this.locked) this.bgimg = imageTool.doorDclosed;
                else if (!this.locked || this.type == "Cursed" || game.type == "Cursed") this.bgimg = imageTool.doorDopen;
            }
        }


        context.drawImage(this.bgimg, this.x + this.bgx, this.y + this.bgy, this.bgwidth, this.bgheight);
        context.drawImage(this.img, this.x + this.offsetx, this.y + this.offsety, this.imgwidth, this.imgheight);
    };
}

function Poop(x, y) {
    this.type = "poop";
    this.x = x;
    this.y = y;
    this.state = 0; //Étapes de destruction
    this.width = 64;
    this.height = 64;
    this.colUp = true;
    this.colDown = true;
    this.colLeft = true;
    this.colRight = true;
    this.canBeDestroyed = true;
    this.alive = true;
    this.obstacle = true;
    this.canAnim = true;
    this.destroy = function () {
        this.state = 5;
        this.alive = false;
        this.obstacle = false;
        game.grid[this.y/64][this.x/64] = 1;
        this.type = "";
        this.colUp = false;
        this.colDown = false;
        this.colLeft = false;
        this.colRight = false;
        game.updateBackground();
    };
    this.draw = function (context) {
        if (this.state < 1) context.drawImage(imageTool.poop1, this.x-3, this.y - 4, this.width * 1.1, this.height * 1.2);
        else if (this.state < 1.75) context.drawImage(imageTool.poop2, this.x-2, this.y -1, this.width * 1.1, this.height * 1.2);
        else if (this.state < 2.5) context.drawImage(imageTool.poop3, this.x-2, this.y + 4, this.width * 1.1, this.height * 1.2);
        else if (this.state < 3.25) context.drawImage(imageTool.poop4, this.x-2, this.y + 8, this.width * 1.1, this.height * 1.2);
        else {
            context.drawImage(imageTool.poop5, this.x-2, this.y + 8, this.width * 1.1, this.height * 1.2);
            if (this.canAnim) {
                /*sounds.bullet.currentTime = 0;
                sounds.bullet.play();*/
                if (this.alive) createItem(this.x, this.y, "poop");
                tempAnimations.push(new Animation(7, this.x, this.y, 200, 200, 45, imageTool.poopAnim, -58, -90, 1));
                this.canAnim = false;
            }
            this.obstacle = false;
        }
        context.restore();
    };
    this.use = function (obj) {
        if(obj.type == "projectile"){
            this.state += obj.dmg;
            game.updateBackground();
        }
    };
}

function Tnt(x, y) {
    this.type = "tnt";
    this.x = x;
    this.y = y;
    this.state = 0; //Étapes de destruction
    this.width = 64;
    this.height = 64;
    this.colUp = true;
    this.colDown = true;
    this.colLeft = true;
    this.colRight = true;
    this.canBeDestroyed = true;
    this.alive = true;
    this.obstacle = true;
    this.canAnim = true;
    this.destroy = function () {
        this.state = 4;
        this.alive = false;
        this.obstacle = false;
        game.grid[this.y/64][this.x/64] = 1;
        this.type = "";
        this.colUp = false;
        this.colDown = false;
        this.colLeft = false;
        this.colRight = false;
        game.updateBackground();
    };
    this.draw = function (context) {

        if (this.state < 1) context.drawImage(imageTool.barrel1, this.x - 8, this.y - 6, 82, 82);
        else if (this.state < 2) context.drawImage(imageTool.barrel2, this.x - 8, this.y - 6, 82, 82);
        else if (this.state < 3) context.drawImage(imageTool.barrel3, this.x - 8, this.y - 6, 82, 82);
        else {
            context.drawImage(imageTool.barrel4, this.x - 8, this.y - 6, 82, 82);
            if (this.canAnim) {
                game.Explosions.push(new Explosion(this.x + 15, this.y + 15));
                this.canAnim = false;
            }
            this.obstacle = false;
        }
        context.restore();
    };
    this.use = function (obj) {
        if(obj.type == "projectile"){
            this.state += obj.dmg;
            game.updateBackground();
        }
    };
}

function Glue(x, y) {
    this.type = "glue";
    this.x = x;
    this.y = y;
    this.width = 64;
    this.height = 64;
    this.colUp = false;
    this.colDown = false;
    this.colLeft = false;
    this.colRight = false;
    this.canBeDestroyed = true;
    this.alive = true;
    this.obstacle = false;
    this.use = function (obj) {
        if (obj == Player) obj.isSlowed = Date.now();
    };
    this.destroy = function () {
        this.alive = false;
        this.type = "";
        game.updateBackground();
    };
    this.draw = function (context) {
        if (this.alive) context.drawImage(imageTool.glue, x - 5, y - 5, 74, 74);
    };
}

function Spikes(x, y) {
    this.type = "spikes";
    this.x = x;
    this.y = y;
    this.dmg = 1;
    this.width = 64;
    this.height = 64;
    this.colUp = false;
    this.colDown = false;
    this.colLeft = false;
    this.colRight = false;
    this.useTimer = 0;
    this.hasLooted = false;
    this.canBeDestroyed = true;
    this.alive = true;
    this.obstacle = false;
    this.use = function (obj) {
        obj.getDamage(this.dmg);
        if (game.type == "Sacrifice" && (Date.now() - this.useTimer > 1000)) {

            if (!this.hasLooted) {
                var rand = getRand(5, 1);
                if (rand == 1) {
                    var subrand = getRand(4, 1);
                    if (subrand == 1) loot("Health", x, x + 100, game, true);
                    else if (subrand == 2) {
                        var subsubrand = getRand(10, 1);
                        if (subsubrand == 1) game.Items.push(new Chest(this.x, this.y + 100, "Redchest"));
                        else game.Items.push(new Chest(this.x, this.y + 100, "Chest"));
                    }
                }
                if (rand == 2) {
                    this.hasLooted = true;
                    createItem(this.x + 10, this.y + 100, "Sacrifice");
                }
            }
            this.useTimer = Date.now();
        }
    };
    this.destroy = function () {};
    this.draw = function (context) {
        if (this.alive) context.drawImage(imageTool.spikes, x - 8, y - 3, 78, 78);
    };
}

function Fireplace(x, y, type) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.state = 0; //Étapes de destruction
    this.rand = getRand(50, 1);
    this.fireAnim = new Animation(4, this.x, this.y, 130, 160, 70, imageTool.fireplace, 0, 0, 1);
    this.hellfireAnim = new Animation(4, this.x, this.y, 130, 160, 70, imageTool.hellfireplace, 0, 0, 1);
    this.img = imageTool.fireon;
    this.dmg = 0.5;
    this.attackSpeed = 3;
    this.lastFire = Date.now();
    this.fireRate = 4000;
    this.range = 1500;
    this.width = 64;
    this.height = 64;
    this.colUp = true;
    this.colDown = true;
    this.colLeft = true;
    this.colRight = true;
    this.canLoot = true;
    this.canBeDestroyed = true;
    this.alive = true;
    this.obstacle = true;
    this.use = function (obj) {
        if(this.obstacle){
            if(obj.type == "Player") obj.getDamage(this.dmg);
            else if(obj.type == "projectile") this.state += obj.dmg;
        }
    };
    this.destroy = function () {
        this.state = 5;
        this.alive = false;
        this.obstacle = false;
        game.grid[this.y/64][this.x/64] = 1;
        this.type = "";
        this.colUp = false;
        this.colDown = false;
        this.colLeft = false;
        this.colRight = false;
        game.updateBackground();
    };
    this.draw = function (context) {
        if (this.type == "fireplace" && this.rand == 1) this.type = "hellfireplace";
        if (this.type == "fireplace") this.fireAnim.update(this.x - 4, this.y - 36); //Animation fire
        else {
            this.hellfireAnim.update(this.x - 4, this.y - 36); //Animation hellfire
            if (this.state < 4) {
                this.dirx = (Player.x + Player.width / 2) - (this.x + this.width / 2);
                this.diry = (Player.y + Player.height / 2) - (this.y + this.height / 2);
                this.hyp = Math.sqrt(this.dirx * this.dirx + this.diry * this.diry);
                this.dirx = this.dirx / this.hyp;
                this.diry = this.diry / this.hyp;
                if (this.hyp <= 350) this.attack();
            }
        }

        context.drawImage(this.img, this.x, this.y + 16, this.width - 4, this.height - 8);
        if (this.state < 4) {
            if (this.type == "fireplace") this.fireAnim.draw(context);
            else this.hellfireAnim.draw(context);
        } else {
            this.img = imageTool.fireoff;
            if (this.canLoot) {
                /*sounds.bullet.currentTime = 0;
                sounds.bullet.play();*/
                if (this.alive) createItem(this.x, this.y, "fire");
                this.canLoot = false;
                this.obstacle = false;
            }
        }
        context.restore();
    };
    this.attack = function () {
        if (Date.now() - this.lastFire > this.fireRate) { //compare le temps actuel avec le temps de la derniere attaque
            var bulletSize = 24;
            game.enemyBullets.push(new enemyBullet(this.attackSpeed, this.range, this.x + (this.width / 2) - (bulletSize / 2), this.y + 14, this.dirx, this.diry, this.dmg, bulletSize));
            this.lastFire = Date.now();
        }
    };
}

function TrapDoor(x, y) {
    this.x = x + 7;
    this.y = y + 2;
    this.width = 50;
    this.height = 30;
    this.canBeUsed = false;
    this.isSpawned = false;
    this.spawnTime = "";
    this.timer = 1000 * 2.5;
    this.opacity = 0;
    this.alive = true;
    this.update = function () {
        if( game.combatMode === 0) { if(hitDetection(this, Player)) this.use(Player); }

        if (!this.isSpawned && game.combatMode === 0) {
            this.isSpawned = true;
            this.spawnTime = Date.now();
        }
        if (this.isSpawned && ( Date.now() - this.spawnTime > this.timer )) this.canBeUsed = true;

    };
    this.use = function (obj) {
        if (floorCount > 2) this.canBeUsed = false;

        if (this.canBeUsed) {
            this.canBeUsed = false;
            changeFloor();
        }
    };
    this.draw = function (context) {
        if (floorCount <= 2 && this.isSpawned) {
            if(this.opacity < 1) this.opacity += 0.016;
            else if (this.opacity > 1) this.opacity = 1;

            context.save();
            context.globalAlpha = this.opacity;
            context.drawImage(imageTool.trapdoor, this.x - 7, this.y, 64, 64);
            context.restore();
        }
    };
}

function Shopkeeper(img, x, y, width, height) {
    this.x = x;
    this.y = y + 65;
    this.type = "Shopkeeper";
    this.width = width;
    this.height = height;
    this.img = img;
    this.obstacle = true;
    this.use = function () {};
    this.update = function () {};
    this.draw = function (context) {
        context.drawImage(this.img, this.x - 6, this.y - 300, 75, 325);
    };
}

function Sprite(img, x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.img = img;
    this.update = function () {
        this.x = this.x;
        this.y = this.y;
    };
    this.draw = function (context) {
        context.drawImage(this.img, this.x, this.y, this.width, this.height);
    };
}

function Blood(x, y, tary, bossroom) {
    this.x = x;
    this.y = y;
    this.tary = tary;
    this.speed = 6;
    this.width = 40;
    this.height = 30;
    this.rand = getRand(3, 1);
    this.dir = getRand(4, 1);
    this.update = function () {
        if (!bossroom) {
            if (this.y < this.tary) {
                game.updateBackground();
                this.y += this.speed;
                switch (this.dir) {
                case 1:
                    this.x++;
                    break;
                case 2:
                    this.x--;
                    break;
                case 3:
                    this.x -= 2;
                    break;
                case 4:
                    this.x += 2;
                    break;
                }
            }
        }
    };
    this.draw = function (context) {
        if (bossroom) {
            context.drawImage(imageTool.bloodRoom, this.x + 25, this.y + 50, canvas.width - 50, canvas.height - 100);
        } else {
            switch (this.rand) {
            case 1:
                context.drawImage(imageTool.blood1, this.x, this.y, this.width, this.height);
                break;
            case 2:
                context.drawImage(imageTool.blood2, this.x, this.y, this.width, this.height);
                break;
            case 3:
                context.drawImage(imageTool.blood3, this.x, this.y, this.width, this.height);
                break;
            default:
                context.drawImage(imageTool.blood1, this.x, this.y, this.width, this.height);
                break;
            }
        }
    };
}

function bleed(nb, x, y, tary, ox, oy, scale) {
    for (var l = 0; l < nb; l++) {
        var randx = getRand(ox, -ox / 2);
        var randy = getRand(oy, -oy / 2);
        game.sprites.push(new Blood(x - randx, y, tary - randy, false));
    }
    tempAnimations.push(new Animation(7, x, y, 200, 200, 30, imageTool.bloodAnim, ox, oy, scale));
}

function bulletImpact(obj, x, y, ox, oy) {
    if (obj == "player") {
        if (Player.isNumberOne) {
            tempAnimations.push(new Animation(14, x, y, 200, 200, 16, imageTool.animNumberOne, ox, oy, 2 / 3));
        } else if (Player.isToothPicks) tempAnimations.push(new Animation(14, x, y, 200, 200, 16, imageTool.eBulletAnim, ox, oy, 2 / 3));
        else tempAnimations.push(new Animation(14, x, y, 200, 200, 16, imageTool.pBulletAnim, ox, oy, 2 / 3));
    } else if (obj == "enemy") tempAnimations.push(new Animation(14, x, y, 200, 200, 16, imageTool.eBulletAnim, ox, oy, 2 / 3));
}

function Bomb(type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.dirx = 0;
    this.diry = 0;
    this.speed = 0;
    this.PlayerSliding = false;
    this.ExploSliding = false;
    this.projectileSliding = false;
    this.contact = "";
    this.slidingTimer = Date.now();
    this.width = 32;
    this.height = 32;
    this.explosionTimer = 2100;
    this.currentTimer = Date.now();
    this.alive = true;
    this.blink = 0;
    this.update = function () {
        if (Date.now() - this.currentTimer > this.explosionTimer) {
            game.Explosions.push(new Explosion(this.x, this.y));
            this.alive = false;
        }
        // detection poussée du joueur
        if (Date.now() - this.currentTimer > 700) { 
            if( hitDetection(this, Player)) {
                this.sliding = true;
            }
        }
        // detection poussée d'explosion
        for (var i = 0; i < game.Explosions.length; i++) {
            if( hitDetection(this, game.Explosions[i])) this.sliding = true;
        }
        // detection poussée projectiles
        for (var j = 0; j < playerBullets.length; j++) {
            if( hitDetection(this, playerBullets[j]))  {
                this.sliding = true;
            }
        }

        // poussée du joueur
        if (this.sliding ) {
            this.sliding = false;
            if (Date.now() - this.slidingTimer > 100) {
                this.dirx = (this.contact.x + this.contact.width / 2) - (this.x + this.width / 2);
                this.diry = (this.contact.y + this.contact.height / 2) - (this.y + this.height / 2);
                this.hyp = Math.sqrt(this.dirx * this.dirx + this.diry * this.diry);
                this.dirx = Math.round(this.dirx / this.hyp);
                this.diry = Math.round(this.diry / this.hyp);
                this.slidingTimer = Date.now();
            }

            // bonus de vitesse à la poussée de la bombe selon l'objet qui la touche
            var speedModif = 0;
            if(this.contact.type == 'player') speedModif = 5;
            else if(this.contact.type == 'projectile') speedModif =  -4;
            
            this.speed = this.contact.speed + speedModif;
        }
        else if (this.speed > 0) this.speed -= this.speed / 35;

        this.x -= this.dirx * (this.speed*2);
        this.y -= this.diry * (this.speed*2);

        for(var l = 0, length = game.wallMaps.length; l < length; l++) {
            var bloc = game.wallMaps[l];
            if (collisionDetection(this, bloc) == "x") this.dirx = -this.dirx;
            if (collisionDetection(this, bloc) == "y") this.dirxy = -this.diry;
        }

    };
    this.draw = function (context) {

        context.save();
        context.globalAlpha = 0.15;
        context.drawImage(imageTool.shadow, this.x - 7, this.y, this.width + 14, this.height);
        context.restore();
        if (this.blink > 15) this.blink = 0;
        else if (this.blink > 0 && this.blink <= 7) {
            context.save();
            context.globalAlpha = 0;
        }
        this.blink++;
        context.drawImage(imageTool.bomb, this.x - 18, this.y - 40, 70, 70);
        context.restore();
    };
    this.use = function () {};
}

function Explosion(x, y) {
    this.width = 228;
    this.height = 164;
    this.x = (x - this.width / 2) + 20;
    this.y = y - this.height / 2;
    this.hasHit = false;
    this.alive = true;
    this.speed = 5;
    this.currentTimer = Date.now();
    this.timer = 80;
    this.canAnim = true;
    this.update = function () {
        if (!this.hasHit) {
            // s'assure que l'explosion ne fasse des dégats que pendant 1 frame
            this.hasHit = true;
            
            var wallMaps = game.wallMaps;
            for (var i = 0, wallMaps_lgt = wallMaps.length; i < wallMaps_lgt; i++) { if ( hitDetection( this, wallMaps[i] ) ) this.use( wallMaps[i] ); }
            var enemies = game.enemies;
            for (var j = 0, enemies_lgt = enemies.length; j < enemies_lgt; j++) { if ( hitDetection( this, enemies[j] ) ) this.use( enemies[j] ); }
            var boss = game.boss;
            for (var h = 0, boss_lgt = boss.length; h < boss_lgt; h++) { if ( hitDetection( this, boss[h] ) ) this.use( boss[h] ); }

            if( hitDetection(this, Player)) this.use(Player);

            game.updateBackground();
        }
        if (Date.now() - this.currentTimer > this.timer) {
            this.alive = false;
        }
    };
    this.draw = function () {
        if (this.canAnim) {
            tempAnimations.push(new Animation(19, this.x, this.y - 15, 200, 150, 16, imageTool.explosion, 0, 0, 1));
            game.sprites.push(new Sprite(imageTool.explosionmark, this.x + 10, this.y + 50, 188, 100));
            game.updateBackground();
            this.canAnim = false;
        }
    };
    this.use = function (obj) {
        if(obj.type == "Player") obj.getDamage(1, this.x, this.y);
        else if (obj.canBeDestroyed) obj.destroy();
        else if (obj.faction == "enemy" ) obj.getDamage(Player.bombDmg);
    };
}

function shopItem(x, y) {
    this.x = x + 12;
    this.y = y + 12;
    this.width = 32;
    this.height = 32;
    this.name = "";
    this.type = "";
    this.price = 0;
    this.desc = " ";
    this.img = "";
    this.priceImg = "";
    this.isCreated = false;
    this.alive = true;
    this.create = function () {
        if (!this.isCreated) {
            var rand = getRand(2, 1); //Choix entre pickup et item
            //Items
            if (rand < 2 && game.currentShopPool.length > 0) {
                console.log('currentShopPool.length ' + game.currentShopPool.length);
                rand = getRand(game.currentShopPool.length, 0);
                console.log('Tentative de création dun item');
                this.name = game.currentShopPool[rand];
                console.log('nom: ' + this.name);
                game.currentShopPool.splice(rand, 1);
                if (this.name == "The Compass") {
                    this.desc = "Reveal rooms";
                    this.price = 15;
                    this.priceImg = imageTool.price15;
                    this.img = imageTool.thecompass;
                } else if (this.name == "Treasure Map") {
                    this.desc = "Reveal floor";
                    this.price = 15;
                    this.priceImg = imageTool.price15;
                    this.img = imageTool.treasuremap;
                }
            }
            //PickUps
            else {
                rand = getRand(game.currentPickupPool.length, 0);
                this.name = game.currentPickupPool[rand];
                game.currentPickupPool.splice(rand, 1);
                if (this.name == "Heart") {
                    this.price = 3;
                    this.priceImg = imageTool.price3;
                    this.img = imageTool.health;
                }
                if (this.name == "Soul Heart") {
                    this.price = 5;
                    this.priceImg = imageTool.price5;
                    this.img = imageTool.armor;
                }
                if (this.name == "Half Heart") {
                    this.price = 3;
                    this.priceImg = imageTool.price3;
                    this.img = imageTool.halfhealth;
                }
                if (this.name == "Bomb") {
                    this.price = 5;
                    this.priceImg = imageTool.price5;
                    this.img = imageTool.bomb;
                }
                if (this.name == "Key") {
                    this.price = 5;
                    this.priceImg = imageTool.price5;
                    this.img = imageTool.key;
                }
            }
            this.isCreated = true;

            this.type = this.name;
            console.log('4 item ' + this.name + ' created');
        }
    };
    this.update = function () {
        if( hitDetection(this, Player)){
           this.use();
        } 
    };
    this.buy = function () {
        Player.gold -= this.price;
        Player.playLoot(this);
        this.alive = false;
    };
    this.use = function () {
        if (Player.gold >= this.price) {
            if (this.name == "Heart") {
                if (Player.hp < 12) {
                    if (Player.maxhp - Player.hp == 0.5) {
                        Player.hp += 0.5;
                    } else if (Player.maxhp - Player.hp >= 1) {
                        Player.hp++;
                    }
                    this.buy();
                }
            }
            if (this.name == "Half Heart") {
                if (Player.hp < 12) {
                    if (Player.maxhp - Player.hp >= 0.5) {
                        Player.hp += 0.5;
                    }
                    this.buy();
                }
            }
            if (this.name == "Soul Heart") {
                Player.soul++;
                this.buy();
            }
            if (this.name == "Bomb") {
                if (Player.bombs < 99) {
                    Player.bombs++;
                    this.buy();
                }
            }
            if (this.name == "Key") {
                if (Player.keys < 99) {
                    Player.keys++;
                    this.buy();
                }
            }
            var a = "";
            //Items
            if (this.name == "The Compass") {
                Player.TheCompass = true;
                this.buy();
                a = shopPool.indexOf("The Compass");
                shopPool.splice(a, 1);
            }
            if (this.name == "Treasure Map") {
                Player.TreasureMap = true;
                this.buy();
                a = shopPool.indexOf("Treasure Map");
                shopPool.splice(a, 1);
            }
        }
    };
    this.draw = function (context) {
        this.create();
        context.save();
        context.globalAlpha = 0.15;
        context.drawImage(imageTool.shadow, this.x - 4, this.y, 40, 40);
        context.restore();
        context.drawImage(this.img, this.x - 18, this.y - 34, 70, 70);
        context.drawImage(this.priceImg, this.x - 12, this.y + 45, 60, 36);
    };
}

function Chest(x, y, type) {
    this.type = type;
    this.name = "Chest";
    this.x = x + 10;
    this.y = y + 20;
    this.dirx = 0;
    this.diry = 0;
    this.speed = 0;
    this.width = 40;
    this.height = 40;
    this.redRand = getRand(10, 1);
    this.redLoot = getRand(3, 1);
    this.moneyRand = getRand(3, 3);
    this.pickupRand = getRand(2, 1);
    this.bonusRand = getRand(4, 1);
    this.slidingTimer = 0;
    this.sliding = false;
    this.contact = "";
    this.canBeUsed = true; //Fermé ou ouvert
    this.alive = true;
    this.obstacle = false;
    this.update = function () {
        // detection poussée du joueur
        if( hitDetection(this, Player)){
            this.use(Player);
            // if(!this.use(Player)) this.sliding = true;
        }

        // detection poussée d'explosion
        for (var i = 0; i < game.Explosions.length; i++) {
            if( hitDetection(this, game.Explosions[i])) this.sliding = true;
        }

        // poussée du joueur
        if (this.sliding ) {
            this.sliding = false;
            if (Date.now() - this.slidingTimer > 100) {
                this.dirx = (this.contact.x + this.contact.width / 2) - (this.x + this.width / 2);
                this.diry = (this.contact.y + this.contact.height / 2) - (this.y + this.height / 2);
                this.hyp = Math.sqrt(this.dirx * this.dirx + this.diry * this.diry);
                this.dirx = Math.round(this.dirx / this.hyp);
                this.diry = Math.round(this.diry / this.hyp);
                this.slidingTimer = Date.now();
            }
            this.speed = this.contact.speed;
        }
        else if (this.speed > 0) this.speed -= this.speed / 10;

        this.x -= this.dirx * this.speed;
        this.y -= this.diry * this.speed;

        for(var j = 0, length = game.wallMaps.length; j < length; j++) {
            var bloc = game.wallMaps[j];
            if (collisionDetection(this, bloc) == "x") this.dirx = -this.dirx;
            if (collisionDetection(this, bloc) == "y") this.dirxy = -this.diry;
        }
    };
    this.use = function (obj) {
        if (this.canBeUsed && obj.type == "Player") {
            this.canBeUsed = false;

            if (this.type == "Chest") {
                for (var i = 0; i < this.moneyRand; i++) {
                    loot("Money", this.x + (4 * i), this.y + (4 * i), game, true);
                }
                if (this.pickupRand == 1) game.Items.push(new Item(x + 12, y + 12, "Bomb", true));
                else if (this.pickupRand == 2) game.Items.push(new Item(x, y, "Key", true));

                //this.alive = false;
            } else if (this.type == "Redchest") {
                if (this.redLoot == 1 && chestPool.length > 0) {
                    // items
                    var redItem = getRand(chestPool.length, 0);
                    console.log(chestPool[redItem]);
                    game.Items.push(new Item(this.x + 20, this.y - 50, chestPool[redItem], true));
                    chestPool.splice(redItem, 1);
                } else if (this.redLoot == 2) {
                    // spiders ou bombs
                    var badRand = getRand(2, 1);

                    for (var b = 0; b < 2; b++) {
                        if (badRand == 1) {
                            game.combatMode = 1;
                            game.enemies.push(new Spider(this.x + 10 + (30 * b), this.y + 80, 1 + floorCount / 2, "spider", true));
                        } else if (badRand == 2) game.Bombs.push(new Bomb("Bomb", this.x - 20 + (60 * b), this.y + 15));
                    }
                } else { 
                    // soul heart
                    var soulRand = getRand(2, 1);
                    for (var z = 0; z < soulRand; z++) {
                        game.Items.push(new Item(this.x + 10 + (30 * z), this.y - 50, "Soul Heart", true));
                    }
                }
            }
        }
    };
    this.draw = function (context) {
        if (this.type == "Chest") {
            if (this.redRand == 1) this.type = "Redchest";
            else this.type = "Chest";
        }
        if (this.type == "Chest") {
            if (this.canBeUsed) context.drawImage(imageTool.chest, this.x - 12, this.y - 6, 62, 62);
            else context.drawImage(imageTool.chestopen, this.x - 12, this.y - 6, 62, 62);
        } else if (this.type == "Redchest") {
            if (this.canBeUsed) context.drawImage(imageTool.redchest, this.x - 12, this.y - 6, 62, 62);
            else context.drawImage(imageTool.redchestopen, this.x - 12, this.y - 6, 62, 62);
        }
    };
}

// création d'items

function Item(x, y, type, slide) {
    this.x = x;
    this.y = y;
    this.name = "Item";
    this.type = type;
    this.dirx = 0;
    this.diry = 0;
    this.speed = 0;
    this.sliding = slide;
    this.contact = Player;
    this.slidingTimer = 0;
    this.height = 32;
    this.width = 32;
    this.img = "";
    this.spawnTime = Date.now();
    this.desc = " ";
    this.alive = true;
    this.update = function () {
        // detection poussée du joueur
        if( hitDetection(this, Player)){
           if(!this.use(Player)) this.sliding = true;
        }     

        // detection poussée d'explosion
        for (var i = 0; i < game.Explosions.length; i++) {
            if( hitDetection(this, game.Explosions[i])) this.sliding = true;
        }

        // poussée du joueur
        if (this.sliding ) {
            this.sliding = false;
            if (Date.now() - this.slidingTimer > 100) {
                this.dirx = (this.contact.x + this.contact.width / 2) - (this.x + this.width / 2);
                this.diry = (this.contact.y + this.contact.height / 2) - (this.y + this.height / 2);
                this.hyp = Math.sqrt(this.dirx * this.dirx + this.diry * this.diry);
                this.dirx = Math.round(this.dirx / this.hyp);
                this.diry = Math.round(this.diry / this.hyp);
                this.slidingTimer = Date.now();
            }
            this.speed = this.contact.speed;
        }
        else if (this.speed > 0) this.speed -= this.speed / 15;

        this.x -= this.dirx * this.speed;
        this.y -= this.diry * this.speed;

        for(var j = 0, length = game.wallMaps.length; j < length; j++) {
            var bloc = game.wallMaps[j];
            if (collisionDetection(this, bloc) == "x") this.dirx = -this.dirx;
            if (collisionDetection(this, bloc) == "y") this.dirxy = -this.diry;
        }
    };
    this.draw = function (context) {
        if (this.alive) {
            if (this.type == "Coin") {
                this.img = imageTool.coin;
            } else if (this.type == "Nickel") {
                this.img = imageTool.nickel;
            } else if (this.type == "Dime") {
                this.img = imageTool.dime;
            } else if (this.type == "Heart") {
                this.img = imageTool.health;
            } else if (this.type == "Half Heart") {
                this.img = imageTool.halfhealth;
            } else if (this.type == "Soul Heart") {
                this.img = imageTool.armor;
            } else if (this.type == "Key") {
                this.img = imageTool.key;
            } else if (this.type == "Bomb") {
                this.img = imageTool.bomb;
            } else if (this.type == "Boom!") {
                this.img = imageTool.boom;
                this.desc = "Bombs!";
            } else if (this.type == "<3") {
                this.img = imageTool.redheart;
                this.desc = "HP up!";
            } else if (this.type == "Breakfast") {
                this.img = imageTool.breakfast;
                this.desc = "HP up!";
            } else if (this.type == "Dessert") {
                this.img = imageTool.dessert;
                this.desc = "HP up!";
            } else if (this.type == "Dinner") {
                this.img = imageTool.dinner;
                this.desc = "HP up!";
            } else if (this.type == "Lunch") {
                this.img = imageTool.lunch;
                this.desc = "HP up!";
            } else if (this.type == "Rotten Meat") {
                this.img = imageTool.rottenmeat;
                this.desc = "HP up!";
            } else if (this.type == "MEAT!") {
                this.img = imageTool.meat;
                this.desc = "DMG & HP up!";
            } else if (this.type == "Bucket of Lard") {
                this.img = imageTool.bucketoflard;
                this.desc = "SPEED & HP up!";
            } else if (this.type == "The Belt") {
                this.img = imageTool.thebelt;
                this.desc = "SPEED up!";
            } else if (this.type == "Roid Rage") {
                this.img = imageTool.roidrage;
                this.desc = "SPEED up!";
            } else if (this.type == "Mini Mushroom") {
                this.img = imageTool.minimushroom;
                this.desc = "SPEED & RANGE up!";
            } else if (this.type == "Mom's Heels") {
                this.img = imageTool.momsheels;
                this.desc = "RANGE up!";
            } else if (this.type == "Mom's Lipstick") {
                this.img = imageTool.momslipstick;
                this.desc = "RANGE up!";
            } else if (this.type == "Mom's Underwear") {
                this.img = imageTool.momsunderwear;
                this.desc = "RANGE up!";
            } else if (this.type == "The Inner Eye") {
                this.img = imageTool.theinnereye;
                this.desc = "Triple Shot";
            } else if (this.type == "The Sad Onion") {
                this.img = imageTool.thesadonion;
                this.desc = "TEARS up!";
            } else if (this.type == "The Small Rock") {
                this.img = imageTool.thesmallrock;
                this.desc = "TEARS up & SPEED down!";
            } else if (this.type == "Wooden Spoon") {
                this.img = imageTool.woodenspoon;
                this.desc = "SPEED up!";
            } else if (this.type == "Speed Ball") {
                this.img = imageTool.speedball;
                this.desc = "SPEED up!";
            } else if (this.type == "Tooth Picks") {
                this.img = imageTool.toothpicks;
                this.desc = "TEAR SPEED up!";
            } else if (this.type == "Skeleton Key") {
                this.img = imageTool.skeletonkey;
                this.desc = "Keys!";
            } else if (this.type == "Pyro") {
                this.img = imageTool.pyro;
                this.desc = "BOMBS!!!";
            } else if (this.type == "Raw Liver") {
                this.img = imageTool.rawliver;
                this.desc = "HP up!";
            } else if (this.type == "Growth Hormones") {
                this.img = imageTool.growthhormones;
                this.desc = "DMG & SPEED up!";
            } else if (this.type == "The Halo") {
                this.img = imageTool.thehalo;
                this.desc = "ALL STATS up!";
            } else if (this.type == "Magic Mushroom") {
                this.img = imageTool.magicmushroom;
                this.desc = "ALL STATS up!";
            } else if (this.type == "Max's Head") {
                this.img = imageTool.maxshead;
                this.desc = "DMG up!";
            } else if (this.type == "Number One") {
                this.img = imageTool.numberone;
                this.desc = "TEARS up & RANGE down!";
            } else if (this.type == "Wire Coat Hanger") {
                this.img = imageTool.wirecoathanger;
                this.desc = "TEARS up!";
            } else if (this.type == "Jesus Juice") {
                this.img = imageTool.jesusjuice;
                this.desc = "DMG & RANGE up!";
            } else if (this.type == "Wiggle Worm") {
                this.img = imageTool.wiggleworm;
                this.desc = "Ssssss!";
            }

            context.save();
            context.globalAlpha = 0.15;
            context.drawImage(imageTool.shadow, this.x - 7, this.y, this.width + 14, this.height);
            context.restore();
            context.drawImage(this.img, this.x - 18, this.y - 40, 70, 70);
        }
    };
    this.use = function (obj) {
        if (obj.type == 'Player' && Date.now() - this.spawnTime > 400) {
            //PICKUPS
            if (this.type == "Coin") {
                Player.gold++;
                sounds.gold.currentTime = 0;
                sounds.gold.play();
                this.clear();
            } else if (this.type == "Nickel") {
                Player.gold += 5;
                sounds.gold.currentTime = 0;
                sounds.gold.play();
                this.clear();
            } else if (this.type == "Dime") {
                Player.gold += 10;
                sounds.gold.currentTime = 0;
                sounds.gold.play();
                this.clear();
            } else if (this.type == "Heart") {
                if (Player.hp < 12) {
                    if (Player.maxhp - Player.hp == 0.5) {
                        Player.hp += 0.5;
                        this.clear();
                    } else if (Player.maxhp - Player.hp >= 1) {
                        Player.hp++;
                        this.clear();
                    } else return false;
                }
            } else if (this.type == "Half Heart") {
                if (Player.hp < 12) {
                    if (Player.maxhp - Player.hp >= 0.5) {
                        Player.hp += 0.5;
                        this.clear();
                    } else return false;
                } else return false;
            } else if (this.type == "Soul Heart") {
                Player.soul++;
                this.clear();
            } else if (this.type == "Key") {
                if (Player.keys < 99) {
                    Player.keys++;
                    this.clear();
                } else return false;
            } else if (this.type == "Bomb") {
                if (Player.bombs < 99) {
                    Player.bombs++;
                    this.clear();
                } else return false;
            }
            //BOSS
            else if ((this.type == "Breakfast") || (this.type == "Dessert") || (this.type == "Dinner") || (this.type == "Lunch") || (this.type == "Rotten Meat")) {
                Player.maxhp++;
                Player.hp++;
                Player.playLoot(this);
                this.clear();
            } else if (this.type == "MEAT!") {
                Player.maxhp++;
                Player.hp++;
                Player.dmgBoost += 0.5;
                Player.playLoot(this);
                this.clear();
            } else if (this.type == "The Belt") {
                Player.speedBoost += 0.4;
                Player.belt = true;
                Player.playLoot(this);
                this.clear();
            } else if (this.type == "The Inner Eye") {
                Player.fireRateBoost -= 370;
                Player.bulletSpeedBoost -= 0.3;
                Player.innerEye = true;
                Player.playLoot(this);
                this.clear();
            } else if (this.type == "Mom's Heels" || this.type == "Mom's Underwear") {
                Player.rangeBoost += 160;
                Player.playLoot(this);
                this.clear();
            } else if (this.type == "Mom's Lipstick") {
                Player.rangeBoost += 160;
                Player.playLoot(this);
                Player.lipstick = true;
                this.clear();
            } else if (this.type == "Wire Coat Hanger") {
                Player.fireRateBoost += 105;
                Player.playLoot(this);
                Player.wireCoatHanger = true;
                this.clear();
            } else if (this.type == "Jesus Juice") {
                Player.rangeBoost += 90;
                Player.dmgBoost += 0.35;
                Player.playLoot(this);
                Player.jesusJuice = true;
                this.clear();
            }
            //TREASURE
            else if (this.type == "Skeleton Key") {
                Player.keys = 99;
                Player.skeletonKey = true;
                Player.playLoot(this);
                this.clear();
            } else if (this.type == "Boom!") {
                if (Player.bombs < 99) {
                    Player.bombs += 10;
                    Player.playLoot(this);
                    this.clear();
                }
            } else if (this.type == "<3") {
                Player.maxhp++;
                Player.hp = Player.maxhp;
                Player.lessThanThree = true;
                Player.playLoot(this);
                this.clear();
            } else if (this.type == "Bucket of Lard") {
                Player.maxhp += 2;
                Player.hp += 0.5;
                Player.speedBoost -= 0.2;
                Player.playLoot(this);
                this.clear();
            } else if (this.type == "Growth Hormones") {
                Player.dmgBoost += 0.35;
                Player.speedBoost += 0.2;
                Player.Growth = true;
                Player.playLoot(this);
                this.clear();
            } else if (this.type == "Roid Rage") {
                Player.speedBoost += 0.2;
                Player.playLoot(this);
                this.clear();
            } else if (this.type == "The Halo") {
                Player.dmgBoost += 0.3;
                Player.speedBoost += 0.2;
                Player.rangeBoost += 90;
                Player.fireRateBoost += 35;
                Player.maxhp++;
                Player.hp++;
                Player.Halo = true;
                Player.playLoot(this);
                this.clear();
            } else if (this.type == "Magic Mushroom") {
                Player.dmgBoost += 0.3;
                Player.speedBoost += 0.2;
                Player.rangeBoost += 90;
                Player.dmgMult += 0.5;
                Player.maxhp++;
                Player.hp = Player.maxhp;
                Player.playLoot(this);
                this.clear();
            } else if (this.type == "Mini Mushroom") {
                Player.speedBoost += 0.2;
                Player.rangeBoost += 90;
                Player.playLoot(this);
                this.clear();
            } else if (this.type == "Max's Head") {
                Player.dmgBoost += 0.3;
                Player.dmgMult += 0.3;
                Player.playLoot(this);
                this.clear();
            } else if (this.type == "Wiggle Worm") {
                Player.fireRateBoost += 35;
                Player.isWiggle = true;
                Player.playLoot(this);
                this.clear();
            } else if (this.type == "Number One") {
                Player.rangeBoost -= 220;
                Player.fireRateBoost += 180;
                Player.isNumberOne = true;
                Player.playLoot(this);
                this.clear();
            } else if (this.type == "Speed Ball") {
                Player.speedBoost += 0.4;
                Player.bulletSpeedBoost += 1.2;
                Player.playLoot(this);
                Player.isSpeedBall = true;
                this.clear();
            } else if (this.type == "Tooth Picks") {
                Player.bulletSpeedBoost += 0.2;
                Player.isToothPicks = true;
                Player.playLoot(this);
                this.clear();
            }
            //SECRET
            else if (this.type == "Pyro") {
                Player.bombs = 99;
                Player.playLoot(this);
                this.clear();
            } else if (this.type == "Raw Liver") {
                Player.maxhp += 2;
                if (Player.maxhp <= 12) Player.hp = Player.maxhp;
                Player.playLoot(this);
                this.clear();
            }
            //GOLDEN CHESTS
            else if (this.type == "The Sad Onion") {
                Player.fireRateBoost += 70;
                Player.playLoot(this);
                this.clear();
            } else if (this.type == "Wooden Spoon") {
                Player.speedBoost += 0.4;
                Player.playLoot(this);
                this.clear();
            }
            //OTHER
            else if (this.type == "The Small Rock") {
                Player.dmgBoost += 0.4;
                Player.fireRateBoost += 35;
                Player.speedBoost -= 0.2;
                Player.playLoot(this);
                Player.smallRock = true;
                this.clear();
            }
        }
    };
    this.clear = function () {
        this.alive = false;
    };
}

function loot(name, x, y, obj, slide) {
    var rand = getRand(100, 0); // 0 -99
    if (name == "Health") {
        if (rand >= 0 && rand <= 9) obj.Items.push(new Item(x + getRand(10, 0), y + getRand(10, 0), "Soul Heart", slide)); // 0 - 9 (10%)
        else if (rand >= 10 && rand <= 49) obj.Items.push(new Item(x + getRand(10, 0), y + getRand(10, 0), "Heart", slide)); // 10 - 49 (40%)
        else if (rand >= 50 && rand <= 99) obj.Items.push(new Item(x + getRand(10, 0), y + getRand(10, 0), "Half Heart", slide));
    } // 50 - 99 (50%)
    else if (name == "Money") {
        if (rand === 0) obj.Items.push(new Item(x + 5, y + 5, "Dime", slide)); // 0 (1%(
        else if (rand >= 1 && rand <= 5) obj.Items.push(new Item(x + 5, y + 5, "Nickel", slide)); // 1 - 5 (5%)
        else obj.Items.push(new Item(x + 5, y + 5, "Coin", slide));
    } // 6 - 99 (94%)
    else if (name == "Bomb") {
        obj.Items.push(new Item(x + 5, y + 5, "Bomb", slide));
    } else if (name == "Key") {
        obj.Items.push(new Item(x + 5, y + 5, "Key", slide));
    } else if (name == "Rock") {
        if (rand === 0) { // 1%
            for (var i = 0; i < 4; i++) {
                obj.Items.push(new Item(x + getRand(10, 0), y + getRand(10, 0), "Bomb", slide));
            }
            obj.Items.push(new Item(x + getRand(10, 0), y + getRand(10, 0), "Key", slide));
        } else if (rand == 1) { // 2%
            for (var i2 = 0; i2 < 2; i2++) {
                obj.Items.push(new Item(x + getRand(10, 0), y + getRand(10, 0), "Bomb", slide));
            }
            for (var i3 = 0; i3 < 2; i3++) {
                obj.Items.push(new Item(x + getRand(10, 0), y + getRand(10, 0), "Soul Heart", slide));
            }
        } else if (rand >= 3 && rand <= 7) { // 5%
            for (var i4 = 0; i4 < 2; i4++) {
                obj.Items.push(new Item(x + getRand(10, 0), y + getRand(10, 0), "Bomb", slide));
            }
            obj.Items.push(new Item(x + getRand(10, 0), y + getRand(10, 0), "Soul Heart", slide));
        } else if (rand >= 8 && rand <= 12) { // 5%
            obj.Items.push(new Item(x + getRand(10, 0), y + getRand(10, 0), "Bomb", slide));
            for (var i5 = 0; i5 < 2; i5++) {
                obj.Items.push(new Item(x + getRand(10, 0), y + getRand(10, 0), "Soul Heart", slide));
            }
        } else if (rand == 2) { // 1%
            for (var i6 = 0; i6 < 3; i6++) {
                obj.Items.push(new Item(x + getRand(10, 0), y + getRand(10, 0), "Soul Heart", slide));
            }
        } else if (rand >= 18 && rand <= 24) { // 7%
            for (var i7 = 0; i7 < 2; i7++) {
                obj.Items.push(new Item(x + getRand(10, 0), y + getRand(10, 0), "Soul Heart", slide));
            }
        } else if (rand >= 25 && rand <= 31) { // 7%
            if (!rockIsDropped) {
                obj.Items.push(new Item(x + getRand(10, 0), y + getRand(10, 0), "The Small Rock", slide));
                rockIsDropped = true;
            }
            obj.Items.push(new Item(x + getRand(10, 0), y + getRand(10, 0), "Soul Heart", slide));
        } else if (rand >= 31 && rand <= 37) { // 7%
            if (!rockIsDropped) {
                obj.Items.push(new Item(x + getRand(10, 0), y + getRand(10, 0), "The Small Rock", slide));
                rockIsDropped = true;
            }
            obj.Items.push(new Item(x + getRand(10, 0), y + getRand(10, 0), "Key", slide));
        } else if (rand >= 38 && rand <= 47) { // 10%
            if (!rockIsDropped) {
                obj.Items.push(new Item(x + getRand(10, 0), y + getRand(10, 0), "The Small Rock", slide));
                rockIsDropped = true;
            }
        } else if (rand >= 48 && rand <= 57) { // 10%
            obj.Items.push(new Item(x + getRand(10, 0), y + getRand(10, 0), "Key", slide));
            obj.Items.push(new Item(x + getRand(10, 0), y + getRand(10, 0), "Soul Heart", slide));
        } else if (rand >= 58 && rand <= 67) { // 10%
            for (var i8 = 0; i8 < 2; i8++) {
                obj.Items.push(new Item(x + getRand(10, 0), y + getRand(10, 0), "Key", slide));
            }
        } else if (rand >= 68 && rand <= 77) { // 10%
            obj.Items.push(new Item(x + getRand(10, 0), y + getRand(10, 0), "Key", slide));
            obj.Items.push(new Item(x + getRand(10, 0), y + getRand(10, 0), "Bomb", slide));
        } else if (rand >= 78 && rand <= 87) { // 10%
            obj.Items.push(new Item(x + getRand(10, 0), y + getRand(10, 0), "Key", slide));
        } else obj.Items.push(new Item(x + getRand(10, 0), y + getRand(10, 0), "Soul Heart", slide));
    }
}

function createItem(x, y, type, slide) {
    // 1/1000 .. 0.1%
    //BASIC DROPS 
    var rand = 0;
    // MONSTRE DE BASE, 5% de chance de drop. Coins ou Coeurs
    if (type == "basic") {
        rand = getRand(20, 1);
        if (rand == 1) {
            rand = getRand(2, 1);
            if (rand == 1) loot("Health", x, y, game, slide);
            if (rand == 2) loot("Money", x, y, game, slide);
        }
    }


    //ROCK BRISABLE, TABLE DE LOOT SPÉCIFIQUE
    else if (type == "xblock") loot("Rock", x, y, game, slide);

    //POOP, 10% de chance de drop. Coins ou Coeurs
    else if (type == "poop" || type == "fire") {
        rand = getRand(8, 1);
        if (rand == 1) {
            rand = getRand(2, 1);
            if (rand == 1) loot("Health", x, y, game, slide);
            if (rand == 2) loot("Money", x, y, game, slide);
        }
    }


    //BOSS KILL
    else if (type == "boss") {
        loot("Health", x, y, game, slide);
        loot("Health", x, y, game, slide);
    }

    //NORMAL ROOMS
    else if (type == "Room") {
        rand = getRand(2, 1);
        if (rand == 1) {
            rand = getRand(4, 1);
            if (rand == 1) loot("Health", x, y, game, slide);
            if (rand == 2) loot("Money", x, y, game, slide);
            if (rand == 3) loot("Bomb", x, y, game, slide);
            if (rand == 4) loot("Key", x, y, game, slide);
        }
    }

    //BOSS ROOMS 
    else if (type == "Boss") {
        rand = getRand(bossPool.length, 0);
        var bossloot = bossPool[rand];
        game.Items.push(new Item(x + getRand(10, 0), y + getRand(10, 0), bossloot, slide));
        bossPool.splice(rand, 1);
    }
    //TREASURE ROOMS 
    else if (type == "Treasure") {
        rand = getRand(treasurePool.length, 0);
        var treasureloot = treasurePool[rand];
        game.Items.push(new Item(x + getRand(10, 0), y + getRand(10, 0), treasureloot, slide));
        treasurePool.splice(rand, 1);
    }
    //SACRIFICE ROOMS 
    else if (type == "Sacrifice") {
        rand = getRand(sacriPool.length, 0);
        var sacriloot = sacriPool[rand];
        game.Items.push(new Item(x + getRand(10, 0), y + getRand(10, 0), sacriloot, slide));
        sacriPool.splice(rand, 1);
    }
    //SECRET ROOMS 
    else if (type == "Secret") {
        var srand = getRand(secretPool.length, 0);
        var secretloot = secretPool[srand];
        game.Items.push(new Item(x + 5, y + 5, secretloot, slide));
        secretPool.splice(1, 1);

    }
}

var treasurePool = ["Boom!", "<3", "Speed Ball", "Magic Mushroom", "The Halo", "Max's Head", "Number One", "Tooth Picks", "Wiggle Worm", "The Inner Eye"];
var bossPool = ["Wooden Spoon", "The Belt", "Wire Coat Hanger", "MEAT!", "Dessert", "Dinner", "Lunch", "Jesus Juice", "Mom's Underwear"];
var secretPool = ["Pyro", "Skeleton Key", "Raw Liver", "Mini Mushroom", "Bucket of Lard"];
var sacriPool = ["The Sad Onion", "Rotten Meat", "Breakfast", "Mom's Heels"];
var chestPool = ["Mom's Lipstick", "Roid Rage", "Growth Hormones"];
var shopPool = ["The Compass", "Treasure Map"];
var pickupPool = ["Key", "Bomb", "Heart", "Soul Heart", "Half Heart"];

console.log('items ...');

/*******************************************************************************************************************************************************************************************
********************************************************************************************************************************************************************************************
SPRITES & ANIMATIONS
*******************************************************************************************************************************************************************************************
*******************************************************************************************************************************************************************************************/

//Object de sons
var sounds = {
    impact: new Audio("sound/impact.wav"),
    bullet: new Audio("sound/playerattack.wav"),
    gold: new Audio("sound/gold.wav"),
    enemyDeath: new Audio("sound/enemydeath.wav"),
    playerDmg: new Audio("sound/playerdmg.wav")
};

function Animation(maxframe, x, y, width, height, updatetime, spritesheet, offsetx, offsety, scale) {
    this.frame = 0;
    this.maxFrame = maxframe;
    this.currentFrameTime = Date.now();
    this.lastFrameTime = Date.now();
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.updateTime = updatetime;
    this.isOver = false;
    this.reset = function () {
        this.frame = 0;
    };
    this.update = function (ux, uy) {
        this.currentFrameTime = Date.now();
        if (this.currentFrameTime - this.lastFrameTime > this.updateTime) {
            this.frame++;
            if (this.frame > this.maxFrame) this.frame = 0;
            this.lastFrameTime = Date.now();
        }
        this.x = ux;
        this.y = uy;
    };
    this.draw = function (context) {

        context.drawImage(spritesheet, this.frame * this.width, 0, this.width, this.height, this.x + offsetx, this.y + offsety, this.width / 2 * scale, this.height / 2 * scale);
    };
    this.playOnce = function () {
        this.currentFrameTime = Date.now();
        if (this.currentFrameTime - this.lastFrameTime > this.updateTime) {
            this.frame++;
            if (this.frame > this.maxFrame) this.isOver = true;
            this.lastFrameTime = Date.now();
        }
        this.x = x;
        this.y = y;
    };
    this.drawOnce = function (context) {
        context.drawImage(spritesheet, this.frame * this.width, 0, this.width, this.height, this.x + offsetx, this.y + offsety, this.width * scale, this.height * scale);
    };
}
console.log('sprites ...');

/*******************************************************************************************************************************************************************************************
********************************************************************************************************************************************************************************************
 JOUEUR
*******************************************************************************************************************************************************************************************
*******************************************************************************************************************************************************************************************/

var Player = {
    type: 'Player',
    x: 100,
    y: 100,
    posx: 0,
    posy: 0,
    height: 42,
    width: 36,
    accelx: 0,
    accely: 0,
    friction: 0.4,
    speed: 2.8,
    speedBoost: 0,
    range: 400,
    rangeBoost: 0,
    fireRate: 350,
    fireRateBoost: 0,
    attackSpeed: 8,
    bulletSpeedBoost: 1,
    damage: 1,
    dmgBoost: 0,
    dmgMult: 1,
    bombDmg: 15,
    bombMult: 1,
    // hp: 3,
    // maxhp: 3, //HP : Vie restante, MAXHP : Vie totale
    // soul: 0, //"Armure"
    // gold: 5,
    // keys: 1,
    // bombs: 1, //Pickups
    hp: 10,
    maxhp: 6, //HP : Vie restante, MAXHP : Vie totale
    soul: 4, //"Armure"
    gold: 50,
    keys: 99,
    bombs: 99, //Pickups

    bombPosed: Date.now(),
    head: imageTool.playerDown,
    orientation: "down", //Orientation de la tête
    blink: 0, //Clignotement quand damagé
    isShooting: false, //Animation de tir
    isLooting: false, //Animation de loot
    textShowing: false, //Description d'item
    itemHolding: "", //L'item qui est looté
    itemHoldingName: "", //Le nom de l'item qui est looté
    itemHoldingDesc: "", //La description de l'item qui est looté
    lootTimer: 0, //Timer de l'animation
    currentMoving: "", //Direction selon WASD
    alive: true,
    canGetDamage: true,
    isBumped: false,
    isSlowed: Date.now(),
    uiUpdated: Date.now(),
    lastDamaged: Date.now(),
    damagedNow: Date.now(),
    lastFire: Date.now(),
    eyeSwitch: 1,
    isNumberOne: false,
    isToothPicks: false,
    isWiggle: false,
    Halo: false,
    smallRock: false,
    wireCoatHanger: false,
    isSpeedBall: false,
    jesusJuice: false,
    lipstick: false,
    innerEye: false,
    Growth: false,
    lessThanThree: false,
    skeletonKey: false,
    belt: false,
    TreasureMap: false,
    TheCompass: false,
    update: function () {
        //Gestion de vie
        if (this.hp <= 0 && this.soul === 0) this.alive = false; //Si plus d'HP, le joueur n'est plus vivant
        else if (this.hp > 12) this.hp = 12; //Maximum de 12 HP pleines, peut avoir plus de maxhp pour les sacrifier
        if (!this.alive) gameOver = true; //Détection de fin de jeu

        //Gestion de minimap
        if (this.TreasureMap) showMap("Treasure Map"); //Montre les pièces
        if (this.TheCompass) showMap("The Compass"); //Montre les icones de pièces spéciales
        game.isVisited = true;
        game.isVisible = true;

        //Positionnement bidimensionnel (X: 0-14, Y: 0-8)
        this.posx = Math.round((this.x + this.width) / 64);
        this.posy = Math.round((this.y + this.height) / 64);

        //Déplacement
        this.lastx = this.x;
        this.lasty = this.y;

        //State de Ralentissement (spider web, glue shots)
        if (Date.now() - this.isSlowed < 300) {
            this.accelx = this.accelx * 2 / 3;
            this.accely = this.accely * 2 / 3;
        }

        //State pour l'animation de loot
        if (Date.now() - this.lootTimer > 600) {
            this.isLooting = false;
        }
        if (this.isLooting) this.textShowing = true;
        if (Date.now() - this.lootTimer > 3000) {
            this.textShowing = false;
        }


        //State pour l'animation de tir
        if (Date.now() - this.lastFire < this.fireRate / 2) {
            Player.isShooting = true;
        } else Player.isShooting = false;

        //State pour l'invulnérabilité temporaire
        if (Date.now() - this.lastDamaged > 700) {
            this.canGetDamage = true;
        } //compare le temps actuel avec le temps du dernier dégat
        else this.canGetDamage = false;

        //BOMBE
        if (Date.now() - this.bombPosed > 250) {
            if ((keyShift || keyE) && this.bombs > 0) {
                this.bombs--;
                game.Bombs.push(new Bomb("Bomb", this.x, this.y + 5));
                this.bombPosed = Date.now();
            }
        }

        //Calcul des boosts
        this.speed = 2.8 + this.speedBoost;
        if (this.speed > 6) this.speed = 6; //Speed cap
        this.damage = (1 + this.dmgBoost) * this.dmgMult;
        if (this.damage > 3.25) this.damage = 3.25; //Dmg cap
        this.bombDmg = 15 * this.bombMult;
        if (this.bombDmg > 20) this.bombDmg = 20; //Dmg cap
        this.range = 400 + this.rangeBoost;
        this.fireRate = 350 - this.fireRateBoost;
        if (this.fireRate < 100) this.fireRate = 100; //Firerate cap
        this.attackSpeed = 8 * this.bulletSpeedBoost; //bonus max de 3
        if (this.attackSpeed > 11) this.attackSpeed = 11; //Bulletspeed cap

        //this.attackSpeed = 1.5; //DEBUG

        //Vitesse diagonale fix 
        if ((keyW || keyS) && (keyA || keyD)) this.speed = this.speed * 2 / 3;

        //Orientation du mouvement
        this.currentMoving = "";
        if (!this.isLooting && !isPaused && !gameOver) {
            if (keyW) {
                if (this.accely > 0 - this.speed) {
                    this.accely -= this.friction;
                } else if (this.accely < 0 - this.speed) {
                    this.accely += this.friction;
                }
                this.currentMoving = "up";
            } else if (keyS) {
                if (this.accely < this.speed) {
                    this.accely += this.friction;
                } else if (this.accely > this.speed) {
                    this.accely -= this.friction;
                }
                this.currentMoving = "down";
            }
            if (keyA) {
                if (this.accelx > 0 - this.speed) {
                    this.accelx -= this.friction;
                } else if (this.accelx < 0 - this.speed) {
                    this.accelx += this.friction;
                }
                this.currentMoving = "left";
            } else if (keyD) {
                if (this.accelx < this.speed) {
                    this.accelx += this.friction;
                } else if (this.accelx > this.speed) {
                    this.accelx -= this.friction;
                }
                this.currentMoving = "right";
            }
        }

        //Décélération, si les deux touches d'une meme dimension sont relachées ou enfoncées(elles s'annulent)
        if (this.isLooting) {
            if (this.accely !== 0) { this.accely -= this.accely / 7; }
            if (this.accelx !== 0) { this.accelx -= this.accelx / 7; }
        }

        if (!keyS && !keyW) { if (this.accely !== 0) this.accely -= this.accely / 7; }
        if (keyS && keyW) { if (this.accely !== 0) this.accely -= this.accely / 7; }
        if (!keyD && !keyA) { if (this.accelx !== 0) this.accelx -= this.accelx / 7; }
        if (keyA && keyD) { if (this.accelx !== 0) this.accelx -= this.accelx / 7; }

        //Accélération X
        this.x += this.accelx * 2;
        //Accélération Y
        this.y += this.accely * 2;

        // collisions décors
        for (var i = 0; i < game.wallMaps.length; i++) {
            collisionDetection(this, game.wallMaps[i], false);
        }

        this.diffx = this.x - this.lastx;
        this.diffy = this.y - this.lasty;

        //PORTES 
        if (this.x <= 32) {
            changeRoom("left");
        } // Salle gauche
        if (this.x >= canvas.width - (32 + this.width / 2)) {
            changeRoom("right");
        } //Salle droite
        if (this.y <= 32) {
            changeRoom("up");
        } // Salle haut
        if (this.y >= canvas.height - (32 + this.height / 2)) {
            changeRoom("down");
        } //Salle bas


        // dégats ennemis
        for(var e_index = 0; e_index < game.enemies.length; e_index++){
            if(hitDetection(this, game.enemies[e_index])) this.getDamage(game.enemies[e_index].dmg, 0, 0);
        }

        // dégats boss
        for(var b_index = 0; b_index < game.boss.length; b_index++){
            if(hitDetection(this, game.boss[b_index])) this.getDamage(game.boss[b_index].dmg, 0, 0);
        }
    },
    drawBody: function (context) {
        context.save();
        context.globalAlpha = 0.15;
        context.drawImage(imageTool.shadow, this.x - 8, this.y + 16, this.width + 16, this.height);
        context.restore();

        if (this.alive && !isPaused && !isChanging) {
            if (!this.canGetDamage) { // Joueur invincible
                if (this.blink >= 15) this.blink = 0;
                else if (this.blink > 0 && this.blink <= 7) {
                    context.save();
                    context.globalAlpha = 0;
                }
            }

            //Joueur LOOT
            if (this.isLooting) {
                Animations[3].update(Player.x - 10, Player.y - 32);
                Animations[3].draw(context);
                context.drawImage(this.itemHolding, this.x - 21, this.y - 84, 80, 80);
            }

            //Animations déplacement
            else if (keyD) {
                Animations[1].draw(context);
            } else if (keyA) {
                Animations[2].draw(context);
            } else if (keyW || keyS) {
                Animations[0].draw(context);
            }
            //Corps idle
            else context.drawImage(imageTool.bodyIdle, this.x - 2, this.y + 12, 40, 40);
            context.restore();
        } else context.drawImage(imageTool.bodyIdle, this.x - 2, this.y + 12, 40, 40);

        if (this.lessThanThree) {
            if (keyA) Animations[4].update(Player.x + 3, Player.y + 10);
            else if (keyD) Animations[4].update(Player.x + 9, Player.y + 10);
            else Animations[4].update(Player.x + 6, Player.y + 10);
            Animations[4].draw(context);
        } else if (this.belt) {
            context.drawImage(imageTool.belt, this.x + 3, this.y + 32, 28, 17);
        }
    },
    drawHead: function (context) {
        if (!this.isLooting) {
            //Joueur invulnérable (a recu du damage)
            if (this.alive && !this.canGetDamage) {
                if (this.blink > 15) this.blink = 0;
                else if (this.blink > 0 && this.blink <= 7) {
                    context.save();
                    context.globalAlpha = 0;
                }
                this.blink++;
            }

            //Direction attaque
            if (!gameOver) {
                if (keyLeft) {
                    this.orientation = "left";
                    this.playerFire();
                } else if (keyUp) {
                    this.orientation = "up";
                    this.playerFire();
                } else if (keyRight) {
                    this.orientation = "right";
                    this.playerFire();
                } else if (keyDown) {
                    this.orientation = "down";
                    this.playerFire();
                }
            }

            if ((keyUp || keyDown || keyLeft || keyRight) && this.isNumberOne && !this.innerEye) this.isShooting = true;

            //SMALLROCK     
            if (this.smallRock && this.orientation == "left") {
                if (this.isShooting) context.drawImage(imageTool.smallrockback, this.x - 14, this.y - 22, 62, 55);
                else context.drawImage(imageTool.smallrockback, this.x - 14, this.y - 25, 62, 55);
            } else if (this.smallRock && this.orientation == "up") {
                if (this.isShooting) context.drawImage(imageTool.smallrockright, this.x - 14, this.y - 22, 62, 55);
                else context.drawImage(imageTool.smallrockright, this.x - 14, this.y - 25, 62, 55);
            }

            //Tete
            context.drawImage(this.head, this.x - 14, this.y - 22, 64, 55);

            //De face
            if (this.orientation == "down") {
                if (this.innerEye) {
                    if (this.isShooting) this.head = imageTool.innerfronts;
                    else this.head = imageTool.innerfront;
                } else if (this.isNumberOne) {
                    if (this.isShooting) this.head = imageTool.nofronts;
                    else this.head = imageTool.nofront;
                } else if (this.isSpeedBall) {
                    if (this.isShooting) this.head = imageTool.speedfronts;
                    else this.head = imageTool.speedfront;
                } else {
                    if (this.isShooting) this.head = imageTool.playerDownS;
                    else this.head = imageTool.playerDown;
                }
                //GROWTH HORMONES
                if (this.Growth) {
                    if (this.isShooting) context.drawImage(imageTool.ghormonesfront, this.x - 14, this.y - 20, 62, 55);
                    else context.drawImage(imageTool.ghormonesfront, this.x - 14, this.y - 26, 62, 60);
                }
                //JESUS JUICE
                if (this.jesusJuice && !this.isNumberOne) {
                    if (this.isShooting) context.drawImage(imageTool.jesusjuicefront, this.x - 14, this.y - 13, 62, 45);
                    else context.drawImage(imageTool.jesusjuicefront, this.x - 14, this.y - 22, 62, 55);
                }
                //MOMS LIPSTICK
                if (this.lipstick && !this.isNumberOne) {
                    if (this.isShooting) context.drawImage(imageTool.lipstickfront, this.x - 14, this.y - 13, 62, 45);
                    else context.drawImage(imageTool.lipstickfront, this.x - 14, this.y - 22, 62, 55);
                }
                //WIRE COAT HANGER
                if (this.wireCoatHanger) {
                    if (this.isShooting) context.drawImage(imageTool.wirefront, this.x - 20, this.y - 36, 70, 60);
                    else context.drawImage(imageTool.wirefront, this.x - 20, this.y - 41, 70, 60);
                }
                //SMALLROCK
                if (this.smallRock) {
                    if (this.isShooting) context.drawImage(imageTool.smallrockfront, this.x - 14, this.y - 25, 62, 55);
                    else context.drawImage(imageTool.smallrockfront, this.x - 14, this.y - 29, 62, 55);
                }
                //TOOTHPICKS
                if (this.isToothPicks) {
                    if (this.isShooting) context.drawImage(imageTool.toothpicksfront, this.x - 16, this.y - 12, 68, 42);
                    else context.drawImage(imageTool.toothpicksfront, this.x - 14, this.y - 22, 64, 55);
                }
                if (this.skeletonKey) {
                    if (this.isShooting) context.drawImage(imageTool.skeyfront, this.x + 10, this.y - 9, 16, 14);
                    else context.drawImage(imageTool.skeyfront, this.x + 10, this.y - 16, 16, 16);
                }
            }

            //De dos
            else if (this.orientation == "up") {
                if (this.isShooting) this.head = imageTool.playerUpS;
                else this.head = imageTool.playerUp;
                //GROWTH HORMONES
                if (this.Growth) {
                    if (this.isShooting) context.drawImage(imageTool.ghormonesback, this.x - 14, this.y - 22, 62, 55);
                    else context.drawImage(imageTool.ghormonesback, this.x - 14, this.y - 28, 62, 60);
                }
                //WIRE COAT HANGER
                if (this.wireCoatHanger) {
                    if (this.isShooting) context.drawImage(imageTool.wireback, this.x - 16, this.y - 36, 70, 60);
                    else context.drawImage(imageTool.wireback, this.x - 16, this.y - 41, 70, 60);
                }
                if (this.isSpeedBall) {
                    if (this.isShooting) context.drawImage(imageTool.speedballback, this.x - 16, this.y - 24, 70, 60);
                    else context.drawImage(imageTool.speedballback, this.x - 16, this.y - 27, 70, 60);
                }
            }

            //Gauche    
            else if (this.orientation == "left") {
                if (this.innerEye) {
                    if (this.isShooting) this.head = imageTool.innerlefts;
                    else this.head = imageTool.innerleft;
                } else if (this.isNumberOne) {
                    if (this.isShooting) this.head = imageTool.nolefts;
                    else this.head = imageTool.noleft;
                } else if (this.isSpeedBall) {
                    if (this.isShooting) this.head = imageTool.speedlefts;
                    else this.head = imageTool.speedleft;
                } else {
                    if (this.isShooting) this.head = imageTool.playerLeftS;
                    else this.head = imageTool.playerLeft;
                }

                //GROWTH HORMONES
                if (this.Growth) {
                    if (this.isShooting) context.drawImage(imageTool.ghormonesleft, this.x - 14, this.y - 22, 62, 55);
                    else context.drawImage(imageTool.ghormonesleft, this.x - 14, this.y - 28, 62, 60);
                }
                //JESUS JUICE
                if (this.jesusJuice && !this.isNumberOne) {
                    if (this.isShooting) context.drawImage(imageTool.jesusjuiceleft, this.x - 14, this.y - 13, 62, 45);
                    else context.drawImage(imageTool.jesusjuiceleft, this.x - 14, this.y - 22, 62, 55);
                }
                //MOMS LIPSTICK
                if (this.lipstick && !this.isNumberOne) {
                    if (this.isShooting) context.drawImage(imageTool.lipstickleft, this.x - 16, this.y - 13, 62, 45);
                    else context.drawImage(imageTool.lipstickleft, this.x - 16, this.y - 22, 62, 55);
                }
                //WIRE COAT HANGER
                if (this.wireCoatHanger) {
                    if (this.isShooting) context.drawImage(imageTool.wireleft, this.x - 17, this.y - 36, 70, 60);
                    else context.drawImage(imageTool.wireleft, this.x - 17, this.y - 41, 70, 60);
                }
                //TOOTHPICKS
                if (this.isToothPicks) {
                    if (this.isShooting) context.drawImage(imageTool.toothpicksside, this.x - 2, this.y - 12, 30, 45);
                    else context.drawImage(imageTool.toothpicksside, this.x - 2, this.y - 20, 25, 55);
                }
            }



            //Droite
            else if (this.orientation == "right") {
                if (this.innerEye) {
                    if (this.isShooting) this.head = imageTool.innerrights;
                    else this.head = imageTool.innerright;
                } else if (this.isNumberOne) {
                    if (this.isShooting) this.head = imageTool.norights;
                    else this.head = imageTool.noright;
                } else if (this.isSpeedBall) {
                    if (this.isShooting) this.head = imageTool.speedrights;
                    else this.head = imageTool.speedright;
                } else {
                    if (this.isShooting) this.head = imageTool.playerRightS;
                    else this.head = imageTool.playerRight;
                }

                //GROWTH HORMONES
                if (this.Growth) {
                    if (this.isShooting) context.drawImage(imageTool.ghormonesright, this.x - 14, this.y - 22, 62, 55);
                    else context.drawImage(imageTool.ghormonesright, this.x - 14, this.y - 28, 62, 60);
                }
                //JESUS JUICE
                if (this.jesusJuice && !this.isNumberOne) {
                    if (this.isShooting) context.drawImage(imageTool.jesusjuiceright, this.x - 10, this.y - 13, 62, 45);
                    else context.drawImage(imageTool.jesusjuiceright, this.x - 10, this.y - 22, 62, 55);
                }
                //MOMSLIPSTICK
                if (this.lipstick && !this.isNumberOne) {
                    if (this.isShooting) context.drawImage(imageTool.lipstickright, this.x - 10, this.y - 13, 62, 45);
                    else context.drawImage(imageTool.lipstickright, this.x - 10, this.y - 22, 62, 55);
                }
                //WIRE COAT HANGER
                if (this.wireCoatHanger) {
                    if (this.isShooting) context.drawImage(imageTool.wireright, this.x - 16, this.y - 36, 70, 60);
                    else context.drawImage(imageTool.wireright, this.x - 16, this.y - 41, 70, 60);
                }
                //SMALLROCK
                if (this.smallRock) {
                    if (this.isShooting) context.drawImage(imageTool.smallrockright, this.x - 10, this.y - 21, 62, 55);
                    else context.drawImage(imageTool.smallrockright, this.x - 10, this.y - 24, 62, 55);
                }
                //TOOTHPICKS
                if (this.isToothPicks) {
                    if (this.isShooting) context.drawImage(imageTool.toothpicksside, this.x + 12, this.y - 12, 30, 45);
                    else context.drawImage(imageTool.toothpicksside, this.x + 12, this.y - 20, 25, 55);
                }
            }

            //Remettre la tête de face après un timer
            if (Date.now() - this.lastFire > 700) this.orientation = "down";

            //Détail fixe
            if (this.Halo) {
                if (this.isShooting) context.drawImage(imageTool.thehalo, this.x - 21, this.y - 77, 80, 80);
                else context.drawImage(imageTool.thehalo, this.x - 21, this.y - 80, 80, 80);
            } //Objet flottant #2
            context.restore();
        }
    },
    drawUI: function (uicontext) {
        //Interface
        if (Date.now() - this.uiUpdated > 200) { // Draw à toutes les x millisecondes
            uicontext.clearRect(0, 0, uicanvas.width, canvas.height);
            // ui background
            // life bar
            // items
            // minimap

            // update timer
            this.uiUpdated = Date.now();
        }
    },
    playLoot: function (item) {
        this.itemHolding = item.img;
        this.itemHoldingName = item.type;
        this.itemHoldingDesc = item.desc;
        this.isLooting = true;
        this.lootTimer = Date.now();
    },
    getDamage: function (dmg, enemyx, enemyy) {
        this.enemyx = enemyx;
        this.enemyy = enemyy;
        if (this.alive) { //Si vivant

            if (dmg > 0) {

                this.damagedNow = Date.now(); //Moment ou le dégat est pris
                if (this.damagedNow - this.lastDamaged > 1000) { //Si le dernier dégat date d'une seconde
                    if (this.soul > 0) {
                        this.soul -= 0.5;
                    } //retirer l'armure (soul hearts)
                    else {
                        this.hp -= dmg;
                    } //retirer les points de vie
                    //GAMEOVER
                    if (this.hp <= 0 && this.soul === 0) {
                        this.alive = false;
                        gameOverTime = Date.now();
                    }
                    //else {sounds.playerDmg.currentTime = 0;sounds.playerDmg.play();}
                    this.lastDamaged = Date.now();
                }
            }
        }
    },
    playerFire: function () {
        var bulx = 0;
        var buly = 0;
        var gapSwitch = 6;
        var numberOneY = 0;
        var brange = 0;
        var bspeed = 0;
        if (Date.now() - this.lastFire > this.fireRate) {

            //Si le joueur tire dans la direction qu'il avance, la vitesse et la portée des projectiles est décuplée
            if (this.orientation == this.currentMoving) {
                brange = this.range * (1.2);
                bspeed = this.attackSpeed + this.speed / 2;
            }
            //Sinon par défault
            else {
                brange = this.range;
                bspeed = this.attackSpeed;
            }
            gameStats.bullet++;
            if (this.isNumberOne) {
                gapSwitch = 4;
                numberOneY = 25;
            }
            if (this.innerEye) this.eyeSwitch = 0;

            switch (this.orientation) {
            case "left":
                bulx = this.x - 12;
                buly = this.y - 6 + numberOneY + (gapSwitch * this.eyeSwitch);

                if (this.innerEye) {
                    if (this.isWiggle) {
                        playerBullets.push(new Bullet(this.orientation, bspeed, brange, bulx + 5, buly + 6, this.accelx, this.accely, this.damage, -1));
                        playerBullets.push(new Bullet(this.orientation, bspeed, brange, bulx - 12, buly - 2, this.accelx, this.accely, this.damage, 0));
                        playerBullets.push(new Bullet(this.orientation, bspeed, brange, bulx, buly + 14, this.accelx, this.accely, this.damage, 1));
                    } else {
                        playerBullets.push(new Bullet(this.orientation, bspeed, brange, bulx + 5, buly - 10, this.accelx, this.accely, this.damage, -1));
                        playerBullets.push(new Bullet(this.orientation, bspeed, brange, bulx, buly, this.accelx, this.accely, this.damage, 1));
                        playerBullets.push(new Bullet(this.orientation, bspeed, brange, bulx - 12, buly - 5, this.accelx, this.accely, this.damage, 0));
                    }
                } else {
                    if (this.eyeSwitch == -1) playerBullets.push(new Bullet(this.orientation, bspeed, brange, bulx, buly, this.accelx, this.accely, this.damage));
                    else playerBullets.push(new Bullet(this.orientation, bspeed, brange, bulx, buly, this.accelx, this.accely, this.damage));
                }
                break;

                ////////////    

            case "right":
                bulx = this.x + 23;
                buly = this.y - 6 + numberOneY + (gapSwitch * this.eyeSwitch);

                if (this.innerEye) {
                    if (this.isWiggle) {
                        playerBullets.push(new Bullet(this.orientation, bspeed, brange, bulx - 5, buly + 6, this.accelx, this.accely, this.damage, -1));
                        playerBullets.push(new Bullet(this.orientation, bspeed, brange, bulx + 12, buly - 2, this.accelx, this.accely, this.damage, 0));
                        playerBullets.push(new Bullet(this.orientation, bspeed, brange, bulx, buly + 14, this.accelx, this.accely, this.damage, 1));

                    } else {
                        playerBullets.push(new Bullet(this.orientation, bspeed, brange, bulx - 5, buly - 10, this.accelx, this.accely, this.damage, -1));
                        playerBullets.push(new Bullet(this.orientation, bspeed, brange, bulx, buly, this.accelx, this.accely, this.damage, 1));
                        playerBullets.push(new Bullet(this.orientation, bspeed, brange, bulx + 12, buly - 5, this.accelx, this.accely, this.damage, 0));
                    }
                } else {
                    if (this.eyeSwitch == -1) playerBullets.push(new Bullet(this.orientation, bspeed, brange, bulx, buly, this.accelx, this.accely, this.damage));
                    else playerBullets.push(new Bullet(this.orientation, bspeed, brange, bulx, buly, this.accelx, this.accely, this.damage));
                }
                break;

                ////////////    

            case "up":
                bulx = this.x + 4 + (gapSwitch * this.eyeSwitch);
                buly = this.y - 22 + numberOneY;

                if (this.innerEye) {
                    bulx += 6;
                    if (this.isWiggle) {
                        playerBullets.push(new Bullet(this.orientation, bspeed, brange, bulx - 6, buly, this.accelx, this.accely, this.damage, -1));
                        playerBullets.push(new Bullet(this.orientation, bspeed, brange, bulx - 2, buly, this.accelx, this.accely, this.damage, 1));
                        playerBullets.push(new Bullet(this.orientation, bspeed, brange, bulx - 8, buly - 12, this.accelx, this.accely, this.damage, 0));
                    } else {
                        playerBullets.push(new Bullet(this.orientation, bspeed, brange, bulx - 18, buly, this.accelx, this.accely, this.damage, -1));
                        playerBullets.push(new Bullet(this.orientation, bspeed, brange, bulx + 6, buly, this.accelx, this.accely, this.damage, 1));
                        playerBullets.push(new Bullet(this.orientation, bspeed, brange, bulx - 6, buly - 12, this.accelx, this.accely, this.damage, 0));
                    }
                } else playerBullets.push(new Bullet(this.orientation, bspeed, brange, bulx, buly, this.accelx, this.accely, this.damage));
                break;

                ////////////    

            case "down":
                bulx = this.x + 4 + (gapSwitch * this.eyeSwitch);
                buly = this.y + 3 + numberOneY;

                if (this.innerEye) {
                    bulx += 6;
                    if (this.isWiggle) {
                        playerBullets.push(new Bullet(this.orientation, bspeed, brange, bulx - 6, buly, this.accelx, this.accely, this.damage, -1));
                        playerBullets.push(new Bullet(this.orientation, bspeed, brange, bulx - 2, buly, this.accelx, this.accely, this.damage, 1));
                        playerBullets.push(new Bullet(this.orientation, bspeed, brange, bulx - 8, buly + 12, this.accelx, this.accely, this.damage, 0));
                    } else {
                        playerBullets.push(new Bullet(this.orientation, bspeed, brange, bulx - 18, buly, this.accelx, this.accely, this.damage, -1));
                        playerBullets.push(new Bullet(this.orientation, bspeed, brange, bulx + 6, buly, this.accelx, this.accely, this.damage, 1));
                        playerBullets.push(new Bullet(this.orientation, bspeed, brange, bulx - 6, buly + 12, this.accelx, this.accely, this.damage, 0));
                    }
                } else playerBullets.push(new Bullet(this.orientation, bspeed, brange, bulx, buly, this.accelx, this.accely, this.damage));
                break;
            }
            //Quel oeil tire
            if (!this.innerEye) {
                if (this.eyeSwitch == 1) this.eyeSwitch = -1;
                else this.eyeSwitch = 1;
            }
            this.lastFire = Date.now();
            this.isShooting = false;
        }
    }
};

function playerAnimations() {
    // (maxframe,x,y,width,height,updatetime,spritesheet,offsetx,offsety,scale)
    Animations = [];
    Animations[0] = new Animation(7, Player.x, Player.y, 100, 80, 55, imageTool.bodyAnim, -7, 13, 1);
    Animations[1] = new Animation(9, Player.x, Player.y, 100, 80, 50, imageTool.bodyRight, -9, 13, 1);
    Animations[2] = new Animation(9, Player.x, Player.y, 100, 80, 50, imageTool.bodyLeft, -5, 13, 1);
    Animations[3] = new Animation(6, Player.x, Player.y, 140, 140, 70, imageTool.playerloot, -7, 13, 1);
    Animations[4] = new Animation(4, Player.x, Player.y, 63, 52, 125, imageTool.heartanim, -7, 13, 1.1);
}

console.log('player ...');

/*******************************************************************************************************************************************************************************************
********************************************************************************************************************************************************************************************
ENNEMIS
*******************************************************************************************************************************************************************************************
*******************************************************************************************************************************************************************************************/

function Spider(x, y, hp, type, sleeping) {
    this.type = type;
    this.faction = 'enemy';
    this.x = x;
    this.y = y;
    this.dirx = 0;
    this.diry = 0;
    this.posx = Math.round((this.x) / 64);
    this.posy = Math.round((this.y) / 64);
    this.height = 22 * 1.1;
    this.width = 33 * 1.1;
    this.speed = 6;
    this.accel = 0;
    this.maxHp = hp;
    this.hp = hp;
    this.dmg = 0.5;
    this.direction = getRand(360, 0);
    this.alive = true;
    this.now = Date.now();
    this.lastDamaged = Date.now();
    this.lastAng = Date.now();
    this.lastFrameTime = Date.now();
    this.updateTime = 45;
    this.frame = 0;
    this.maxFrame = 0;
    this.isHit = false;
    this.isMoving = true;
    this.isSleeping = sleeping;
    this.wasSleeping = this.isSleeping;
    this.sx = x;
    this.sy = y;
    this.reset = function () {
        this.x = this.sx;
        this.y = this.sy;
        this.hp = this.maxHp;
        this.isHit = false;
        this.isSleeping = this.wasSleeping;
    };
    this.move = function () {
        // Mode "bump" (a été touché)
        if (this.isHit) {
            this.dirx = (Player.x + Player.width / 2) - (this.x + this.width / 2);
            this.diry = (Player.y + Player.height / 2) - (this.y + this.height / 2);
            this.hyp = Math.sqrt(this.dirx * this.dirx + this.diry * this.diry);
            this.dirx = this.dirx / this.hyp;
            this.diry = this.diry / this.hyp;

            this.x -= this.dirx * (this.accel + Player.attackSpeed / 4);
            this.y -= this.diry * (this.accel + Player.attackSpeed / 4);

            for (var index = 0; index < game.wallMaps.length; index++) {
                collisionDetection(this, game.wallMaps[index]);
            }
        } else {
            this.x += this.dirx * this.accel;
            this.y += this.diry * this.accel;

            for (var index2 = 0; index2 < game.wallMaps.length; index2++) {
                collisionDetection(this, game.wallMaps[index2]);
            }
        }
    };
    this.update = function () { //Calcul
        this.checkDamage();
        //Animations mouvement
        this.maxFrame = 3;
        if (Date.now() - this.lastFrameTime > this.updateTime) {
            this.frame++;
            if (this.frame > this.maxFrame) this.frame = 0;
            this.lastFrameTime = Date.now();
        }

        if (Date.now() - this.lastAng > getRand(500, 800)) {
            this.lastAng = Date.now();
            this.dirx = (Player.x + Player.width / 2) - (this.x + this.width / 2);
            this.diry = (Player.y + Player.height / 2) - (this.y + this.height / 2);
            this.hyp = Math.sqrt(this.dirx * this.dirx + this.diry * this.diry);

            if (this.hyp <= 300) {
                this.isSleeping = false;
                this.dirx = this.dirx / this.hyp;
                this.diry = this.diry / this.hyp;
            } else {
                var angle = getRand(360, 0);
                this.diry = Math.sin(angle);
                this.dirx = Math.cos(angle);
            }
        }

        if (!this.isSleeping && !this.isHit && (Date.now() - this.lastAng < 600)) this.isMoving = true;
        else this.isMoving = false;

        if (this.isMoving) {
            if (this.accel < this.speed) this.accel += 0.5;
        } else if (this.isHit) {

            if (this.accel > 0) this.accel -= this.accel / 10;
        } else if (!this.isMoving) {
            if (this.accel > 0) this.accel -= this.accel / 10;
        }

        this.move();
    };
    this.draw = function (context) { //Affichage
        if (this.alive) {
            context.save();
            context.globalAlpha = 0.15;
            context.drawImage(imageTool.shadow, this.x, this.y + 5, this.width, this.height);
            context.restore();

            if (this.type == "spider") {
                if (this.isHit) {
                    context.drawImage(imageTool.spiderHit, this.x - 5, this.y - 5, this.width * 1.3, this.height * 1.3);
                } else if (this.isMoving) {
                    context.drawImage(imageTool.spiderMoveAnim, this.frame * 75, 0, 75, 50, this.x - 5, this.y - 5, this.width * 1.3, this.height * 1.3);
                } else if (!this.isMoving) {
                    context.drawImage(imageTool.spiderIdleAnim, this.frame * 75, 0, 75, 50, this.x - 5, this.y - 5, this.width * 1.3, this.height * 1.3);
                }
            } else if (this.type == "buttspider") {
                if (this.isHit) {
                    context.drawImage(imageTool.spiderButtHit, this.x, this.y - 9,  this.width * 1,  this.height * 1.3);
                    context.drawImage(imageTool.spiderHit, this.x - 5, this.y - 5, this.width * 1.3, this.height * 1.3);
                } else if (this.isMoving) {
                    context.drawImage(imageTool.spiderButt, this.x, this.y - 10,  this.width * 1,  this.height * 1.3);
                    context.drawImage(imageTool.spiderMoveAnim, this.frame * 75, 0, 75, 50, this.x - 6, this.y - 3, this.width * 1.3, this.height * 1.3);
                } else if (!this.isMoving) {
                    context.drawImage(imageTool.spiderButt, this.x, this.y - 9,  this.width * 1,  this.height * 1.3);
                    context.drawImage(imageTool.spiderIdleAnim, this.frame * 75, 0, 75, 50, this.x - 5, this.y - 5, this.width * 1.3, this.height * 1.3);
                }
            }
        }
    };
    this.clear = function () {
        this.x = 0;
        this.y = 0;
        this.speed = 0;
        this.alive = false;
    };
    this.getDamage = function (dmg) {
        if (this.alive && this.hp > 0) {
            this.isSleeping = false;
            this.hp -= dmg;
            this.lastDamaged = Date.now();
            if (this.hp <= 0) {
                if (this.type == "buttspider") {
                    for (var s = 0; s < 2; s++) {
                        bleed(2, this.x, this.y - 10, this.y + 20, -50, -50, 2 / 3);
                        game.enemies.push(new Spider(this.x + getRand(20, 0), this.y + getRand(20, 0), 1 + floorCount * 3 / 2, "spider", false));
                    }
                }
                bleed(2, this.x, this.y - 10, this.y + 20, -50, -50, 2 / 3);
                sounds.enemyDeath.currentTime = 0;
                sounds.enemyDeath.play();
                createItem(this.x + 5, this.y + 5, "basic");
                this.alive = false;
            }
        }
    };
    this.checkDamage = function () { //calcul d'invulnérabilité temporaire
        if (Date.now() - this.lastDamaged < 150) { //compare le temps actuel avec le temps du dernier dégat
            this.isHit = true;
        } else this.isHit = false;
    };
    this.checkCollide = function (obj, pos) {
        for (var i = 0; i < obj.length; i++) {
            if (this.y < obj[i].y + obj[i].height &&
                this.y + this.height > obj[i].y &&
                this.x + this.width > obj[i].x &&
                this.x < obj[i].x + obj[i].width) {
                if (obj[i].type == "spikes" || obj[i].type == "fireplace" || obj[i].type == "hellfireplace") {
                    this.getDamage(obj[i].dmg);
                }
                if (obj[i].obstacle) {
                    if (pos == "up") {
                        this.y = obj[i].y + obj[i].height;
                        return true;
                    } else if (pos == "down") {
                        this.y = obj[i].y - this.height;
                        return true;
                    } else if (pos == "left") {
                        this.x = obj[i].x + obj[i].width;
                        return true;
                    } else if (pos == "right") {
                        this.x = obj[i].x - this.width;
                        return true;
                    }
                }
            }
        }
    };
}

function Fly(x, y, hp, type, immune, bossfollow, swarmAngle) {
    this.type = type; //Black Fly, Attack Fly, Pooter
    this.faction = 'enemy';
    this.x = x;
    this.y = y;
    this.anim = new Animation(3, this.x, this.y, 50, 50, 30, imageTool.flyAnim, 0, 0, 1.5);
    this.swarmAnim = new Animation(3, this.x, this.y, 50, 50, 30, imageTool.flyAnim, 0, 0, 1.2);
    this.pooterL = new Animation(1, this.x, this.y, 80, 80, 30, imageTool.pooterLeft, -4, -4, 1.2);
    this.pooterR = new Animation(1, this.x, this.y, 80, 80, 30, imageTool.pooterRight, -4, -4, 1.2);
    this.dirx = 0;
    this.diry = 0;
    this.lastdirx = this.dirx;
    this.lastdiry = this.diry;
    this.swarmAngle = swarmAngle;
    this.height = 27;
    this.width = 27;
    this.speed = 2;
    this.maxHp = hp;
    this.hp = hp;
    this.dmg = 0.5;
    this.fireRate = 1500;
    this.attackSpeed = 3;
    this.lastFire = Date.now();
    this.range = 2000;
    this.angle = getRad(swarmAngle);
    this.angleVar = 0;
    this.alive = true;
    this.rand = getRand(2000, 250);
    this.spawn = Date.now();
    this.lastAng = Date.now() - 3000;
    this.lastDamaged = Date.now();
    this.animNow = Date.now();
    this.damagedNow = this.lastDamaged - 2000;
    this.sprite = imageTool.fly;
    this.bossfollow = bossfollow;
    this.isReleasing = false;
    this.isImmune = immune;
    this.isHit = false;
    this.radius = 96;
    this.sx = x;
    this.sy = y;
    this.hyp = 0;
    this.reset = function () {
        this.x = this.sx;
        this.y = this.sy;
        this.hp = this.maxHp;
        this.isHit = false;
    };
    this.update = function () { //Calcul
        this.anim.update(this.x, this.y);
        this.swarmAnim.update(this.x, this.y);
        //Si le fly est vivant
        if (this.alive) {
            if (Date.now() - this.spawn > 300) this.isImmune = false;
            this.checkDamage();
            var speedRand = 0;


            // POOTER
            if (this.type == "Pooter") {
                this.height = 34;
                this.width = 34;
                this.speed = 0.5;

                this.dirx = (Player.x + Player.width / 2) - (this.x + this.width / 2);
                this.diry = (Player.y + Player.height / 2) - (this.y + this.height / 2);
                this.hyp = Math.sqrt(this.dirx * this.dirx + this.diry * this.diry);
                this.dirx = this.dirx / this.hyp;
                this.diry = this.diry / this.hyp;

                this.pooterL.update(this.x, this.y);
                this.pooterR.update(this.x, this.y);

                if (this.hyp <= 400) this.attack();

                if (!this.bossfollow) {
                    if (!this.isReleasing && this.now - this.lastAng > 500) {
                        this.angle = getRand(360, 0);
                        this.lastAng = Date.now();
                    }
                    this.diry = Math.sin(this.angle);
                    this.dirx = Math.cos(this.angle);
                }


                if (this.isReleasing && this.now - this.lastAng > 75) {
                    this.isReleasing = false;
                }
            }
            //BLACK FLY 
            else if (this.type == "Black") {
                this.height = 28;
                this.width = 28;
                this.dmg = 0;
                this.speed = 1;
                speedRand = getRand(3, -1);
                if (this.angle < 360) this.angle += 0.03;
                else this.angle = 0;
                this.diry = Math.sin(this.angle);
                this.dirx = Math.cos(this.angle);
            }
            //ATTACK FLY
            else if (this.type == "Attack") {
                this.height = 40;
                this.width = 40;
                this.speed = 2.5;
                this.dmg = 0.5;
                speedRand = getRand(3, -1);
            } else if (this.type == "Swarm") {
                this.height = 34;
                this.width = 34;
                this.speed = 1.5;
                this.dmg = 0.5;
                speedRand = getRand(3, -1);
                if (this.isReleasing && this.now - this.lastAng > 75) {
                    this.isReleasing = false;
                }
            }

            if ((this.type == "Swarm" || this.type == "Attack") && !this.isReleasing && this.now - this.lastAng > this.rand) {
                this.dirx = (Player.x) - (this.x - this.width / 2);
                this.diry = (Player.y) - (this.y - this.height / 2);
                this.hyp = Math.sqrt(this.dirx * this.dirx + this.diry * this.diry);
                this.dirx = this.dirx / this.hyp;
                this.diry = this.diry / this.hyp;
                this.rand = getRand(2000, 250);
                this.speed = getRand(2, 2);
                this.lastAng = Date.now();
            }

            if (this.bossfollow) {
                if (this.angle < 360) this.angle += (3 / 200);
                else this.angle = 0;

                this.x = (game.boss[0].x + game.boss[0].width / 2 - 18) + Math.sin(this.angle) * this.radius;
                this.y = (game.boss[0].y + game.boss[0].height / 2 - 6) + Math.cos(this.angle) * this.radius;
            } else {
                // Mode déplacement
                // Mode "bump" (a été touché)
                if (this.isHit) {
                    this.dirx = (Player.x + Player.width / 2) - (this.x + this.width / 2);
                    this.diry = (Player.y + Player.height / 2) - (this.y + this.height / 2);
                    this.hyp = Math.sqrt(this.dirx * this.dirx + this.diry * this.diry);
                    this.dirx = this.dirx / this.hyp;
                    this.diry = this.diry / this.hyp;
                    this.speed = 3;

                    this.x -= this.dirx * this.speed + speedRand;
                    this.y -= this.diry * this.speed + speedRand;
                } 
                else {
                    this.x += this.dirx * this.speed + speedRand;
                    this.y += this.diry * this.speed + speedRand;
                }

                for (var index = 0; index < game.wallMaps.length; index++) {

                    if(this.type == "Pooter") collisionDetection(this, game.wallMaps[index]);
                    else if(game.wallMaps[index].type == "wall" || game.wallMaps[index].name == "Door") collisionDetection(this, game.wallMaps[index]);
                }
            }
        }
    };
    this.draw = function (context) { //Affichage

        //Si vivant
        if (this.alive) {
            context.save();
            context.globalAlpha = 0.15;
            context.drawImage(imageTool.shadow, this.x, this.y + 30, this.width, this.height);
            context.restore();

            if (Date.now() - this.animNow > 20) {
                if (this.sprite == imageTool.fly) this.sprite = imageTool.fly1;
                else this.sprite = imageTool.fly;
                this.animNow = Date.now();
            }


            if (!this.isHit) {
                if (this.type == "Attack") this.anim.draw(context);
                else if (this.type == "Swarm") this.swarmAnim.draw(context);
                else if (this.type == "Black") context.drawImage(this.sprite, this.x, this.y, this.width, this.height);
                else if (this.type == "Pooter") {
                    if (this.x <= Player.x) this.pooterR.draw(context);
                    else if (this.x > Player.x) this.pooterL.draw(context);
                }
            }

            if (this.isHit) {
                context.drawImage(imageTool.flyHit, this.x, this.y, this.width, this.height);
            }
        }
    };
    this.clear = function () { //Supprimer
        this.x = 0;
        this.y = 0;
        this.speed = 0;
        this.alive = false;
    };
    this.attack = function () {
        if (Date.now() - this.lastFire > this.fireRate) { //compare le temps actuel avec le temps de la derniere attaque
            game.enemyBullets.push(new enemyBullet(this.attackSpeed, this.range, this.x + 5, this.y + 22, this.dirx, this.diry, 0.5, 26));
            bleed(2, this.x + 18, this.y + 18, this.y + 20, -50, -50, 1 / 2);
            this.lastFire = Date.now();
        }
    };
    this.getDamage = function (dmg) {
        if (!this.isImmune && this.alive && this.hp > 0) {
            this.hp -= dmg;
            this.lastDamaged = Date.now();
            if (this.hp <= 0) {


                if (this.bossfollow) {
                    // gestion du swarm
                    var spot = game.boss[0].swarm.indexOf(swarmAngle);

                    game.boss[0].swarm.splice(spot, 1);
                    game.boss[0].swarmSpots.push(swarmAngle);
                }
                bleed(1, this.x, this.y - 10, this.y + 30, -40, -40, 1 / 2);
                sounds.enemyDeath.currentTime = 0;
                sounds.enemyDeath.play();
                this.alive = false;
            }
        }
    };
    this.checkDamage = function () { //calcul d'invulnérabilité temporaire
        this.now = Date.now();
        if (this.now - this.lastDamaged < 120) { //compare le temps actuel avec le temps du dernier dégat
            this.isHit = true;
        } else this.isHit = false;
    };
    this.checkCollide = function (obj, pos) {
        for (var i = 0; i < obj.length; i++) {
            if (this.y < obj[i].y + obj[i].height &&
                this.y + this.height > obj[i].y &&
                this.x + this.width > obj[i].x &&
                this.x < obj[i].x + obj[i].width) {
                if (obj[i].obstacle) {
                    if (pos == "up") {
                        this.y = obj[i].y + obj[i].height;
                        return true;
                    } else if (pos == "down") {
                        this.y = obj[i].y - this.height;
                        return true;
                    } else if (pos == "left") {
                        this.x = obj[i].x + obj[i].width;
                        return true;
                    } else if (pos == "right") {
                        this.x = obj[i].x - this.width;
                        return true;
                    }
                }
            }
        }
    };
    this.dukeRelease = function () {
        this.bossfollow = false;
        this.isReleasing = true;
        game.boss[0].swarm = [];
        game.boss[0].swarmSpots = [0, 60, 120, 180, 240, 300];

        this.dirx = (Player.x + getRand(150, -75)) - (this.x - this.width / 2);
        this.diry = (Player.y + getRand(150, -75)) - (this.y - this.height / 2);
        this.hyp = Math.sqrt(this.dirx * this.dirx + this.diry * this.diry);
        this.dirx = this.dirx / this.hyp;
        this.diry = this.diry / this.hyp;
        this.speed = 3;
        this.lastAng = Date.now();
    };
}

function Zombie(x, y, hp) {
    this.faction = 'enemy';
    this.x = x;
    this.y = y;
    this.posx = Math.round((this.x) / 64);
    this.posy = Math.round((this.y) / 64);
    this.lastx = this.x;
    this.lasty = this.y;
    this.suicideCount = 0;
    this.animR = new Animation(9, this.x, this.y, 100, 80, 50, imageTool.eBodyRight, -9, 3, 1);
    this.animL = new Animation(9, this.x, this.y, 100, 80, 50, imageTool.eBodyLeft, -5, 3, 1);
    this.dirx = 0;
    this.diry = 0;
    this.lastdirx = this.dirx;
    this.lastdiry = this.diry;
    this.height = 40;
    this.width = 40;
    this.speed = 1.5;
    this.accel = 0;
    this.maxHp = hp;
    this.hp = hp;
    this.dmg = 0;
    this.attackSpeed = 5;
    this.range = 500;
    this.angle = getRand(360, 0);
    this.angle2 = this.angle;
    this.wasRandom = false;
    this.alive = true;
    this.rand = getRand(2000, 250);
    this.hyp = 0;
    this.lastAng = Date.now() - 3000;
    this.lastDamaged = Date.now();
    this.animNow = Date.now();
    this.damagedNow = this.lastDamaged - 2000;
    this.sprite = imageTool.fly;
    this.isHit = false;
    this.isMoving = false;
    this.canSuicide = true;
    this.sx = x;
    this.sy = y;
    this.reset = function () {
        this.x = this.sx;
        this.y = this.sy;
        this.hp = this.maxHp;
        this.isHit = false;
    };
    this.move = function () {
        if (this.isHit) {
            this.dirx = (Player.x + Player.width / 2) - (this.x + this.width / 2);
            this.diry = (Player.y + Player.height / 2) - (this.y + this.height / 2);
            this.hyp = Math.sqrt(this.dirx * this.dirx + this.diry * this.diry);
            this.dirx = this.dirx / this.hyp;
            this.diry = this.diry / this.hyp;
            this.x -= this.dirx * (Player.attackSpeed / 2);
            this.y -= this.diry * (Player.attackSpeed);
            for (var index = 0; index < game.wallMaps.length; index++) {
                collisionDetection(this, game.wallMaps[index]);
            }
        } else {
            this.x -= this.dirx * this.accel;
            this.y -= this.diry * this.accel;
            for (var index2 = 0; index2 < game.wallMaps.length; index2++) {
                collisionDetection(this, game.wallMaps[index2]);
            }
        }

    };
    this.update = function () {

        if (Math.abs(this.lastx - this.x) < 0.02 && Math.abs(this.lasty - this.y) < 0.02) this.suicideCount++;
        if (this.suicideCount > 1000) this.suicide();

        this.checkDamage();
        this.animR.update(this.x, this.y);
        this.animL.update(this.x, this.y);

        this.posx = Math.round((this.x) / 64);
        this.posy = Math.round((this.y) / 64);

        this.dirx = (Player.x + Player.width / 2) - (this.x + this.width / 2);
        this.diry = (Player.y + Player.height / 2) - (this.y + this.height / 2);
        this.hyp = Math.sqrt(this.dirx * this.dirx + this.diry * this.diry);
        this.dirx = this.dirx / this.hyp;
        this.diry = this.diry / this.hyp;

        if (Date.now() - this.lastAng > 1500) {
            this.angle = getRand(360, 0);
            this.lastAng = Date.now();
        }

        if (this.hyp <= 320 && Date.now() - this.lastAng < 1250) {
            this.speed = 2;
            if (this.accel < this.speed) this.accel += 0.2;
            this.wasRandom = false;
            this.isMoving = true;
        } else if (this.hyp > 320 && Date.now() - this.lastAng > 750) {
            this.speed = 1.5;
            if (this.accel < this.speed) this.accel += 0.2;
            this.angle2 = this.angle;
            this.diry = Math.sin(this.angle2);
            this.dirx = Math.cos(this.angle2);
            this.wasRandom = true;
            this.isMoving = true;
        } else {
            if (this.accel > 0) this.accel -= this.accel / 15;
            if (this.wasRandom) {
                this.diry = Math.sin(this.angle2);
                this.dirx = Math.cos(this.angle2);
            }
            this.isMoving = false;
        }

        this.move();

        this.lastx = this.x;
        this.lasty = this.y;

    };
    this.draw = function (context) { //Affichage
        //Si vivant
        if (this.alive) {
            context.save();
            context.globalAlpha = 0.15;
            context.drawImage(imageTool.shadow, this.x - 2, this.y + 6, this.width, this.height);
            context.restore();

            if (this.isMoving) {
                if (this.dirx < 0) this.animR.draw(context);
                else if (this.dirx > 0) this.animL.draw(context);
            } else context.drawImage(imageTool.eBodyIdle, this.x - 2, this.y + 5, this.width, this.height - 5);

            if (this.isHit) context.drawImage(imageTool.mulliganheadhit, this.x - 16, this.y - 38, 76, 70);
            else context.drawImage(imageTool.mulliganhead, this.x - 16, this.y - 38, 76, 70);

        }
    };
    this.clear = function () { //Supprimer
        this.x = 0;
        this.y = 0;
        this.speed = 0;
        this.alive = false;
    };
    this.suicide = function () {
        if (this.canSuicide) {
            this.canSuicide = false;
            game.Explosions.push(new Explosion(this.x + 15, this.y + 15));
        }
    };
    this.getDamage = function (dmg) {
        if (this.alive && this.hp > 0 && !this.isHit) {
            this.hp -= dmg;
            this.lastDamaged = Date.now();
            if (this.hp <= 0) {
                for (var a = 1; a < 5; a++) {
                    var atty = Math.sin((a * 3.14) / 2);
                    var attx = Math.cos((a * 3.14) / 2);
                    game.enemyBullets.push(new enemyBullet(this.attackSpeed * 1.33, this.range, this.x + 12, this.y - 12, attx, atty, 0.5, 26));
                }

                var rand = getRand(2, 2);
                for (var s = 0; s < rand; s++) {
                    var flyrand = getRand(3, 1);

                    var sy = this.posy + getRand(3, -1);
                    var sx = this.posx + getRand(3, -1);
                    while (game.grid[sy][sx] != 1) {
                        sy = this.posy + getRand(3, -1);
                        sx = this.posx + getRand(3, -1);
                    }

                    if (flyrand == 1) game.enemies.push(new Fly(sx * 64, sy * 64, 1 + floorCount * 3 / 2, "Black", true));
                    else if (flyrand == 2) game.enemies.push(new Fly(sx * 64, sy * 64, 1 + floorCount * 3 / 2, "Attack", true));
                    else if (flyrand == 3) game.enemies.push(new Fly(sx * 64, sy * 64, 2 + floorCount * 3 / 2, "Pooter", true));
                }
                bleed(1, this.x, this.y - 10, this.y + 30, -40, -40, 1 / 2);
                sounds.enemyDeath.currentTime = 0;
                sounds.enemyDeath.play();
                createItem(this.x, this.y + 5, "basic");
                this.alive = false;
            }
        }
    };
    this.checkDamage = function () { //calcul d'invulnérabilité temporaire
        this.now = Date.now();
        if (this.now - this.lastDamaged < 160) { //compare le temps actuel avec le temps du dernier dégat
            this.isHit = true;
        } else this.isHit = false;
    };
    this.checkCollide = function (obj, pos) {
        for (var i = 0; i < obj.length; i++) {
            if (this.y < obj[i].y + obj[i].height &&
                this.y + this.height > obj[i].y &&
                this.x + this.width > obj[i].x &&
                this.x < obj[i].x + obj[i].width) {
                if (obj[i].type == "spikes" || obj[i].type == "fireplace" || obj[i].type == "hellfireplace") {
                    this.getDamage(obj[i].dmg);
                }
                if (obj[i].obstacle) {
                    if (pos == "up") {
                        this.y = obj[i].y + obj[i].height;
                        this.diry = -this.diry;
                        if (this.hyp <= 320) {
                            if (this.dirx < 0) this.dirx = -1;
                            else if (this.dirx > 0) this.dirx = 1;
                        }
                        return true;
                    } else if (pos == "down") {
                        this.y = obj[i].y - this.height;
                        this.diry = -this.diry;
                        if (this.hyp <= 320) {
                            if (this.dirx < 0) this.dirx = -1;
                            else if (this.dirx > 0) this.dirx = 1;
                        }
                        return true;
                    } else if (pos == "left") {
                        this.x = obj[i].x + obj[i].width;
                        this.dirx = -this.dirx;
                        if (this.hyp <= 320) {
                            if (this.diry < 0) this.diry = -1;
                            else if (this.diry > 0) this.diry = 1;
                        }
                        return true;
                    } else if (pos == "right") {
                        this.x = obj[i].x - this.width;
                        this.dirx = -this.dirx;
                        if (this.hyp <= 320) {
                            if (this.diry < 0) this.diry = -1;
                            else if (this.diry > 0) this.diry = 1;
                        }
                        return true;
                    }
                }
            }
        }
    };
}

function Clotty(posy, posx, x, y, hp) {
    this.faction = 'enemy';
    this.height = 42;
    this.width = 42;
    this.x = x;
    this.y = y;
    this.posx = posx;
    this.posy = posy;
    this.ry = posy;
    this.rx = posx;
    this.tarx = 0;
    this.tary = 0;
    this.dirx = 0;
    this.diry = 0;
    this.isArrived = false;
    this.arrivalTime = Date.now();
    this.speed = 1.5;
    this.accel = 0;
    this.animF = new Animation(6, this.x, this.y, 180, 150, 60, imageTool.clottyfront, -23, -21, 1);
    this.animR = new Animation(8, this.x, this.y, 180, 150, 60, imageTool.clottyright, -23, -21, 1);
    this.animL = new Animation(8, this.x, this.y, 180, 150, 60, imageTool.clottyleft, -23, -21, 1);
    this.animS = new Animation(5, this.x, this.y, 180, 150, 40, imageTool.clottyattack, -23, -21, 1);
    this.maxHp = hp;
    this.hp = hp;
    this.alive = true;
    this.now = Date.now();
    this.lastDamaged = Date.now();
    this.lastAng = Date.now();
    this.lastFrameTime = Date.now();
    this.updateTime = 45;
    this.frame = 0;
    this.maxFrame = 0;
    this.fireRate = 3000;
    this.dmg = 0.5;
    this.attackSpeed = 5;
    this.range = 800;
    this.lastFire = Date.now();
    this.isAttacking = false;
    this.canAttack = true;
    this.isHit = false;
    this.isMoving = true;
    this.sx = x; //Position Initiale
    this.sy = y; //Position initiale
    this.reset = function () {
        this.x = this.sx;
        this.y = this.sy;
        this.hp = this.maxHp;
        this.isHit = false;
    };
    this.move = function () {
        //Calcul mouvement  
        this.tary = this.ry * 64 + 32;
        this.tarx = this.rx * 64 + 32;
        this.dirx = this.tarx - (this.x + this.width / 2);
        this.diry = this.tary - (this.y + this.height / 2);
        this.hyp = Math.sqrt(this.dirx * this.dirx + this.diry * this.diry);
        this.dirx = this.dirx / this.hyp;
        this.diry = this.diry / this.hyp;


        // Mode "bump" (a été touché)
        if (this.isHit) {
            this.dirx = (Player.x + Player.width / 2) - (this.x + this.width / 2);
            this.diry = (Player.y + Player.height / 2) - (this.y + this.height / 2);
            this.hyp = Math.sqrt(this.dirx * this.dirx + this.diry * this.diry);
            this.dirx = -this.dirx / this.hyp;
            this.diry = -this.diry / this.hyp;
        }

        this.x += this.dirx * this.accel;
        this.y += this.diry * this.accel;
        for (var index = 0, wallMaps = game.wallMaps.length; index < wallMaps; index++) {
            collisionDetection(this, game.wallMaps[index]);
        }
    };
    this.update = function () { //Calcul
        this.checkDamage();
        this.attack();
        this.posx = Math.round((this.x) / 64);
        this.posy = Math.round((this.y) / 64);
        this.animF.update(this.x, this.y);
        this.animR.update(this.x, this.y);
        this.animL.update(this.x, this.y);
        if (this.isAttacking) this.animS.update(this.x, this.y);

        // si arrivé a la position
        if (this.posy == this.ry && this.posx == this.rx)
            this.isArrived = true;
        // sinon timer puis reset
        else if (!this.isArrived && Date.now() - this.lastAng > 2000)
            this.isArrived = true;
        else this.isArrived = false;

        if (!this.isAttacking) {
            if (this.isArrived && Date.now() - this.lastAng > 400) {
                this.ry = this.posy + getRand(3, -1);
                this.rx = this.posx + getRand(3, -1);
                while (game.grid[this.ry][this.rx] != 1) {
                    this.ry = this.posy + getRand(3, -1);
                    this.rx = this.posx + getRand(3, -1);
                }
                this.lastAng = Date.now();
            }

            if (!this.isArrived) {
                this.isMoving = true;
                if (this.accel < this.speed) this.accel += 0.2;
            } else if (this.isHit) {
                if (this.accel > 0) this.accel -= this.accel / 20;
                this.isMoving = false;
            } else {
                if (this.accel > 0) this.accel -= this.accel / 20;
                this.isMoving = false;
            }
        }

        if (!this.isAttacking) this.move();
    };
    this.draw = function (context) { //Affichage
        if (this.alive) {
            context.save();
            context.globalAlpha = 0.15;
            context.drawImage(imageTool.shadow, this.x - 15, this.y, this.width + 34, this.height + 20);
            context.restore();

            if (!this.isHit) {
                if (this.isAttacking) this.animS.draw(context);
                else if (this.isMoving) {
                    if (this.dirx > 0.1) this.animR.draw(context);
                    else if (this.dirx < -0.1) this.animL.draw(context);
                    else this.animF.draw(context);
                } else context.drawImage(imageTool.clotty, this.x - 23, this.y - 21, 90, 75);
            }

            if (this.isHit) {
                if (this.dirx >= 0) context.drawImage(imageTool.clottyhitright, this.x - 23, this.y - 21, 90, 75);
                else if (this.dirx < 0) context.drawImage(imageTool.clottyhitleft, this.x - 23, this.y - 21, 90, 75);
            }

            if (hitBox) {
                context.strokeStyle = "white";
                context.beginPath();
                context.moveTo(this.tarx, this.tary);
                context.lineTo(this.x + this.width / 2, this.y + this.height / 2);
                context.lineWidth = 8;
                context.stroke();
                context.lineWidth = 1;
            }
        }
    };
    this.clear = function () {
        this.x = 0;
        this.y = 0;
        this.speed = 0;
        this.alive = false;
    };
    this.getDamage = function (dmg) {
        if (this.alive && this.hp > 0 && !this.isHit) {
            this.isSleeping = false;
            this.hp -= dmg;
            this.lastDamaged = Date.now();
            if (this.hp <= 0) {
                bleed(2, this.x, this.y - 10, this.y + 20, -50, -50, 2 / 3);
                sounds.enemyDeath.currentTime = 0;
                sounds.enemyDeath.play();
                createItem(this.x + 5, this.y + 5, "basic");
                this.alive = false;
            }
        }
    };
    this.checkDamage = function () { //calcul d'invulnérabilité temporaire
        this.now = Date.now();
        if (this.now - this.lastDamaged < 150) { //compare le temps actuel avec le temps du dernier dégat
            this.isHit = true;
        } else this.isHit = false;
    };
    this.checkCollide = function (obj, pos) {
        for (var i = 0; i < obj.length; i++) {
            if (this.y < obj[i].y + obj[i].height &&
                this.y + this.height > obj[i].y &&
                this.x + this.width > obj[i].x &&
                this.x < obj[i].x + obj[i].width) {
                if (obj[i].type == "spikes" || obj[i].type == "fireplace" || obj[i].type == "hellfireplace") {
                    this.getDamage(obj[i].dmg);
                }
                if (obj[i].obstacle) {
                    if (pos == "up") {
                        this.y = obj[i].y + obj[i].height;
                        return true;
                    } else if (pos == "down") {
                        this.y = obj[i].y - this.height;
                        return true;
                    } else if (pos == "left") {
                        this.x = obj[i].x + obj[i].width;
                        return true;
                    } else if (pos == "right") {
                        this.x = obj[i].x - this.width;
                        return true;
                    }
                }
            }
        }
    };
    this.attack = function () {

        if (Date.now() - this.lastFire > this.fireRate) {
            for (var a = 1; a < 5; a++) {
                var atty = Math.sin((a * 3.14) / 2);
                var attx = Math.cos((a * 3.14) / 2);
                game.enemyBullets.push(new enemyBullet(this.attackSpeed * 1.33, this.range, this.x + 12, this.y - 12, attx, atty, this.dmg, 26));
            }
            this.fireRate = getRand(2300, 700);
            bleed(2, this.x - 5, this.y - 30, this.y + 20, -50, -50, 3 / 4);
            this.lastFire = Date.now();
        } else if (Date.now() - this.lastFire > (this.fireRate - 260)) {
            this.isAttacking = true;
            this.isMoving = false;
        } else this.isAttacking = false;
    };
}

function Maggot(posy, posx, x, y, hp) {
    this.faction = 'enemy';
    this.height = 36;
    this.width = 36;
    this.x = x;
    this.y = y;
    this.posx = posx;
    this.posy = posy;
    this.ry = posy;
    this.rx = posx;
    this.tarx = 0;
    this.tary = 0;
    this.dirx = 0;
    this.diry = 0;
    this.isArrived = false;
    this.arrivalTime = Date.now();
    this.speed = 2;
    this.accel = 0;
    this.animF = new Animation(5, this.x, this.y, 100, 100, 60, imageTool.maggotfront, -8, -2, 1);
    this.animD = new Animation(5, this.x, this.y, 100, 100, 60, imageTool.maggotdown, -8, -2, 1);
    this.animR = new Animation(7, this.x, this.y, 150, 100, 60, imageTool.maggotright, -18, -12, 1);
    this.animL = new Animation(7, this.x, this.y, 150, 100, 60, imageTool.maggotleft, -18, -12, 1);
    this.maxHp = hp;
    this.hp = hp;
    this.alive = true;
    this.now = Date.now();
    this.lastDamaged = Date.now();
    this.lastAng = Date.now();
    this.orientation = 1;
    this.lastFrameTime = Date.now();
    this.updateTime = 45;
    this.frame = 0;
    this.maxFrame = 0;
    this.fireRate = 3000;
    this.dmg = 0.5;
    this.attackSpeed = 5;
    this.range = 800;
    this.lastFire = Date.now();
    this.isAttacking = false;
    this.canAttack = true;
    this.isHit = false;
    this.isMoving = true;
    this.sx = x; //Position Initiale
    this.sy = y; //Position initiale
    this.reset = function () {
        this.x = this.sx;
        this.y = this.sy;
        this.hp = this.maxHp;
        this.isHit = false;
    };
    this.move = function () {
        //Calcul mouvement  
        this.tary = this.ry * 64 + 32;
        this.tarx = this.rx * 64 + 32;
        this.dirx = this.tarx - (this.x + this.width / 2);
        this.diry = this.tary - (this.y + this.height / 2);
        this.hyp = Math.sqrt(this.dirx * this.dirx + this.diry * this.diry);
        this.dirx = this.dirx / this.hyp;
        this.diry = this.diry / this.hyp;

        // Mode "bump" (a été touché)
        if (this.isHit) {
            this.dirx = (Player.x + Player.width / 2) - (this.x + this.width / 2);
            this.diry = (Player.y + Player.height / 2) - (this.y + this.height / 2);
            this.hyp = Math.sqrt(this.dirx * this.dirx + this.diry * this.diry);
            this.dirx = -this.dirx / this.hyp;
            this.diry = -this.diry / this.hyp;
        }

        this.x += this.dirx * this.accel;
        this.y += this.diry * this.accel;
        for (var index = 0, wallMaps = game.wallMaps.length; index < wallMaps; index++) {
            collisionDetection(this, game.wallMaps[index]);
        }
    };
    this.update = function () {
        this.checkDamage();
        //this.attack();
        this.posx = Math.round((this.x) / 64);
        this.posy = Math.round((this.y) / 64);
        // si arrivé a la position
        if (this.posy == this.ry && this.posx == this.rx) {
            this.isArrived = true;
        }
        // sinon timer et reset
        else if (!this.isArrived && Date.now() - this.lastAng > 1000) {
            this.isArrived = true;
        } else this.isArrived = false;


        if (this.isArrived && Date.now() - this.lastAng > 300) {
            do {
                this.orientation = getRand(4, 1);
                if (this.orientation == 1) { //BAS
                    this.ry = this.posy + 1;
                    this.rx = this.posx;
                } else if (this.orientation == 2) { //HAUT
                    this.ry = this.posy - 1;
                    this.rx = this.posx;
                } else if (this.orientation == 3) { //DROITE
                    this.ry = this.posy;
                    this.rx = this.posx + 1;
                } else if (this.orientation == 4) { //GAUCHE
                    this.ry = this.posy;
                    this.rx = this.posx - 1;
                }

                if (this.rx > 14) this.rx = 14;
                if (this.rx < 1) this.rx = 1;
                if (this.ry > 8) this.ry = 8;
                if (this.ry < 1) this.ry = 1;
            } while (game.grid[this.ry][this.rx] != 1);

            this.lastAng = Date.now();
        }

        if (!this.isArrived) {
            this.isMoving = true;
            if (this.accel < this.speed) this.accel += 0.2;
        } else if (this.isHit) {
            if (this.accel > 0) this.accel -= this.accel / 20;
            this.isMoving = false;
        } else {
            if (this.accel > 0) this.accel -= this.accel / 20;
            this.isMoving = false;
        }



        this.move();
    };
    this.draw = function (context) { //Affichage
        if (this.alive) {
            context.save();
            context.globalAlpha = 0.15;
            context.drawImage(imageTool.shadow, this.x - 10, this.y - 12, this.width + 20, this.height + 20);
            context.restore();

            if (!this.isHit) {
                if (this.orientation == 1) { //BAS
                    this.animD.update(this.x, this.y);
                    this.animD.draw(context);
                } else if (this.orientation == 2) { //HAUT
                    this.animF.update(this.x, this.y);
                    this.animF.draw(context);
                } else if (this.orientation == 3) { //DROITE
                    this.animR.update(this.x, this.y);
                    this.animR.draw(context);
                } else if (this.orientation == 4) { //GAUCHE
                    this.animL.update(this.x, this.y);
                    this.animL.draw(context);
                }
            }

            if (this.isHit) {
                if ((this.orientation == 1) || (this.orientation == 2)) context.drawImage(imageTool.maggothitfront, this.x - 8, this.y - 2, 50, 50);
                else if ((this.orientation == 3) || (this.orientation == 4)) context.drawImage(imageTool.maggothitside, this.x - 18, this.y - 12, 75, 50);
            }

            if (hitBox) {
                context.strokeStyle = "white";
                context.beginPath();
                context.moveTo(this.tarx, this.tary);
                context.lineTo(this.x + this.width / 2, this.y + this.height / 2);
                context.lineWidth = 8;
                context.stroke();
                context.lineWidth = 1;
            }
        }
    };
    this.clear = function () {
        this.x = 0;
        this.y = 0;
        this.speed = 0;
        this.alive = false;
    };
    this.getDamage = function (dmg) {
        if (this.alive && this.hp > 0 && !this.isHit) {
            this.isSleeping = false;
            this.hp -= dmg;
            this.lastDamaged = Date.now();
            if (this.hp <= 0) {
                bleed(2, this.x, this.y - 10, this.y + 20, -50, -50, 2 / 3);
                sounds.enemyDeath.currentTime = 0;
                sounds.enemyDeath.play();
                createItem(this.x + 5, this.y + 5, "basic");
                this.alive = false;
            }
        }
    };
    this.checkDamage = function () { //calcul d'invulnérabilité temporaire
        this.now = Date.now();
        if (this.now - this.lastDamaged < 150) { //compare le temps actuel avec le temps du dernier dégat
            this.isHit = true;
        } else this.isHit = false;
    };
    this.checkCollide = function (obj, pos) {
        for (var i = 0; i < obj.length; i++) {
            if (this.y < obj[i].y + obj[i].height &&
                this.y + this.height > obj[i].y &&
                this.x + this.width > obj[i].x &&
                this.x < obj[i].x + obj[i].width) {
                if (obj[i].type == "spikes" || obj[i].type == "fireplace" || obj[i].type == "hellfireplace") {
                    this.getDamage(obj[i].dmg);
                }
                if (obj[i].obstacle) {
                    if (pos == "up") {
                        this.y = obj[i].y + obj[i].height;
                        return true;
                    } else if (pos == "down") {
                        this.y = obj[i].y - this.height;
                        return true;
                    } else if (pos == "left") {
                        this.x = obj[i].x + obj[i].width;
                        return true;
                    } else if (pos == "right") {
                        this.x = obj[i].x - this.width;
                        return true;
                    }
                }
            }
        }
    };
    this.attack = function () {
        if (Date.now() - this.lastFire > this.fireRate) {
            for (var a = 1; a < 5; a++) {
                var atty = Math.sin((a * 3.14) / 2);
                var attx = Math.cos((a * 3.14) / 2);
                game.enemyBullets.push(new enemyBullet(this.attackSpeed * 1.33, this.range, this.x + 12, this.y - 12, attx, atty, this.dmg, 26));
            }
            this.fireRate = getRand(2300, 700);
            this.lastFire = Date.now();
        } else if (Date.now() - this.lastFire > (this.fireRate - 260)) {
            this.isAttacking = true;
            this.isMoving = false;
        } else this.isAttacking = false;
    };
}

function Tower(x, y, hp, sleeping) {
    this.faction = 'enemy';
    this.x = x;
    this.y = y;
    this.dirx = 0;
    this.diry = 0;
    this.height = 55;
    this.width = 64;
    this.maxHp = hp;
    this.hp = hp;
    this.dmg = 0.5;
    this.fireRate = getRand(200, 800);
    this.attackSpeed = 5;
    this.lastFire = Date.now();
    this.range = 2000;
    this.alive = true;
    this.animNow = Date.now();
    this.animTime = 40;
    this.animX = 0;
    this.maxspeed = 2;
    this.speed = 0;
    this.friction = 0.4;
    this.now = Date.now();
    this.lastDamaged = Date.now();
    this.damagedNow = this.lastDamaged - 2000;
    this.isHit = false;
    this.isSleeping = sleeping;
    this.wasSleeping = this.isSleeping;
    this.sx = x;
    this.sy = y;
    this.reset = function () {
        this.x = this.sx;
        this.y = this.sy;
        this.hp = this.maxHp;
        this.isHit = false;
        this.isSleeping = this.wasSleeping;
    };
    this.update = function () { //Calcul
            //Si le minion est vivant
            if (this.alive) {
                this.checkDamage();
                this.dirx = (Player.x + Player.width / 2) - (this.x + this.width / 2);
                this.diry = (Player.y + Player.height / 2) - (this.y + this.height / 2);
                this.hyp = Math.sqrt(this.dirx * this.dirx + this.diry * this.diry);
                this.dirx = this.dirx / this.hyp;
                this.diry = this.diry / this.hyp;

                if (this.isHit) {
                    if (this.speed < this.maxspeed) this.speed += this.friction;


                    this.x -= this.dirx * this.speed;
                    if (this.dirx < 0) {
                        this.checkCollide(game.wallMaps, "right");
                    }
                    if (this.dirx > 0) {
                        this.checkCollide(game.wallMaps, "left");
                    }
                    this.y -= this.diry * this.speed;
                    if (this.diry < 0) {
                        this.checkCollide(game.wallMaps, "down");
                    }
                    if (this.diry > 0) {
                        this.checkCollide(game.wallMaps, "up");
                    }
                } else if (this.speed > 0) this.speed -= this.speed / 5;

                if (this.hyp <= 330) {
                    this.isSleeping = false;
                    this.attack();
                }
            }

        };
        // affichage
    this.draw = function (context) {
        if (this.isSleeping) this.animX = 0;
        else {
            if (Date.now() - this.animNow > this.animTime) {
                if (this.animX == 2) this.animX = -2;
                else this.animX = 2;
                this.animNow = Date.now();
            }
        }
        // si vivant
        if (this.alive) {
            context.save();
            context.globalAlpha = 0.15;
            context.drawImage(imageTool.shadow, this.x + 6, this.y + 40, this.width - 14, this.height - 14);
            context.restore();
            if (!this.isHit) {
                context.drawImage(imageTool.tower, this.x + this.animX, this.y, this.width, this.height);
            }
            if (this.isHit) {
                // var opac = (this.maxHp-this.hp)/this.maxHp; Calcul d'opacité par %age d'HP
                context.drawImage(imageTool.towerHit, this.x, this.y, this.width, this.height);
            }
            if (this.hyp <= 330) {
                if (hitBox) {
                    context.strokeStyle = "white";
                    context.beginPath();
                    context.moveTo((Player.x + Player.width / 2), (Player.y + Player.height / 2));
                    context.lineTo(this.x + this.width / 2, this.y + this.height / 2);
                    context.lineWidth = 8;
                    context.stroke();
                    context.lineWidth = 1;
                }
            }
        }
    };
    this.clear = function () { // supprimer
        this.x = 0;
        this.y = 0;
        this.speed = 0;
        this.alive = false;
    };
    this.getDamage = function (dmg) {
        if (this.alive && this.hp > 0) {
            this.hp -= dmg;
            this.lastDamaged = Date.now();
            if (this.hp <= 0) {
                bleed(3, this.x, this.y - 10, this.y + 20, -50, -50, 4 / 5);
                createItem(this.x, this.y, "basic");
                sounds.enemyDeath.currentTime = 0;
                sounds.enemyDeath.play();
                this.alive = false;
            }
        }
    };
    this.checkDamage = function () { // calcul d'invulnérabilité temporaire
        this.now = Date.now();
        if (this.now - this.lastDamaged < 150) { // compare le temps actuel avec le temps du dernier dégat
            this.isHit = true;
        } else this.isHit = false;
    };
    this.attack = function () {
        this.now = Date.now();
        if (this.now - this.lastFire > this.fireRate) { // compare le temps actuel avec le temps de la derniere attaque
            bleed(2, this.x + 20, this.y, this.y + 70, -50, -50, 2 / 3);
            game.enemyBullets.push(new enemyBullet(this.attackSpeed, this.range, this.x + 18, this.y + 20, this.dirx, this.diry, 0.5, 26));
            this.lastFire = Date.now();
        }
    };
    this.checkCollide = function (obj, pos) {
        for (var i = 0; i < obj.length; i++) {
            if (this.y < obj[i].y + obj[i].height &&
                this.y + this.height > obj[i].y &&
                this.x + this.width > obj[i].x &&
                this.x < obj[i].x + obj[i].width) {
                if (obj[i].obstacle) {
                    if (pos == "up") {
                        this.y = obj[i].y + obj[i].height;
                        return true;
                    } else if (pos == "down") {
                        this.y = obj[i].y - this.height;
                        return true;
                    } else if (pos == "left") {
                        this.x = obj[i].x + obj[i].width;
                        return true;
                    } else if (pos == "right") {
                        this.x = obj[i].x - this.width;
                        return true;
                    }
                }
            }
        }
    };
}

function Duke(x, y, hp, version) {
    this.faction = 'enemy';
    this.version = version;
    this.name = "Duke of Flies";
    this.x = x;
    this.y = y;
    this.angNow = Date.now();
    this.lastAng = Date.now();
    this.angle = 150;
    this.dirx = Math.sin(this.angle);
    this.diry = Math.cos(this.angle);
    this.swarmAnim = new Animation(6, this.x, this.y, 250, 250, 100, imageTool.dukeSwarmAnim, -22, -22, 1.1 * 1.2);
    this.flyAnim = new Animation(6, this.x, this.y, 250, 250, 100, imageTool.dukeFlyAnim, -22, -22, 1.1 * 1.2);
    this.swarmAnim2 = new Animation(6, this.x, this.y, 250, 250, 100, imageTool.dukeSwarmAnim2, -22, -22, 1.1 * 1.2);
    this.flyAnim2 = new Animation(6, this.x, this.y, 250, 250, 100, imageTool.dukeFlyAnim2, -22, -22, 1.1 * 1.2);
    this.height = 96 * 1.2;
    this.width = 96 * 1.2;
    this.speed = 3;
    this.fireRate = 700;
    this.attackSpeed = 4;
    this.range = 1000;
    this.maxHp = hp;
    this.hp = this.maxHp;
    this.dmg = 0.5;
    this.alive = true;
    this.now = Date.now();
    this.lastFire = Date.now();
    this.lastDamaged = Date.now();
    //this.canGetDamage = true;
    this.isHit = false;
    this.canBePushed = true;
    this.lastPushed = Date.now();
    this.phase = 1;
    this.isBerserk = false;
    this.canSpawn = false;
    this.killTimer = Date.now();
    this.killCount = 0;
    this.patternCounter = 1;
    this.shootPattern = 0;
    this.spawningSwarm = false;
    this.spawningFly = false;
    this.spawnTimer = 2000;
    this.swarm = [];
    this.swarmSpots = [0, 60, 120, 180, 240, 300];
    this.sx = x;
    this.sy = y;
    this.reset = function () {
        this.x = this.sx;
        this.y = this.sy;
        this.hp = this.maxHp;
        this.isHit = false;
        this.isSleeping = this.wasSleeping;
        this.isHit = false;
        this.hitCount = 0;
        this.isBerserk = false;
    };
    this.update = function () {
        if (this.alive) {
            if (this.version == 2) this.speed = 5;
            if (this.phase == 1) {
                this.checkDamage();
                this.flySpawn();

                /*
            if( this.now - this.lastDamaged > 80){
                this.canGetDamage = true;}  //compare le temps actuel avec le temps du dernier dégat
            else this.canGetDamage = false;
            */

                if ((this.spawningSwarm || this.spawningFly) && Date.now() - this.lastFire > 700) {
                    this.flyAnim.reset();
                    this.swarmAnim.reset();
                    this.flyAnim2.reset();
                    this.swarmAnim2.reset();
                    this.spawningSwarm = false;
                    this.spawningFly = false;
                }

                if (this.version == 1 && Date.now() - this.lastPushed < 50) {
                    this.dirx = (Player.x + Player.width / 2) - (this.x + this.width / 2);
                    this.diry = (Player.y + Player.height / 2) - (this.y + this.height / 2);
                    this.hyp = Math.sqrt(this.dirx * this.dirx + this.diry * this.diry);
                    this.dirx = -this.dirx / this.hyp;
                    this.diry = -this.diry / this.hyp;
                } else if (Date.now() - this.lastPushed > 1000 && Date.now() - this.lastPushed < 1050) {
                    this.dirx = (Player.x + Player.width / 2) - (this.x + this.width / 2);
                    this.diry = (Player.y + Player.height / 2) - (this.y + this.height / 2);
                    this.hyp = Math.sqrt(this.dirx * this.dirx + this.diry * this.diry);
                    this.dirx = this.dirx / this.hyp;
                    this.diry = this.diry / this.hyp;
                }

                // appliquer le mouvement
                this.x += this.dirx * this.speed; // X
                this.y += this.diry * this.speed; // Y

                // collision et changement de direction
                for (var index = 0, wallMaps = game.wallMaps.length; index < wallMaps; index++) {
                    switch (collisionDetection(this, game.wallMaps[index])) {
                    case 'y':
                        this.diry = -this.diry;
                        break;
                    case 'x':
                        this.dirx = -this.dirx;
                        break;
                    }
                }
            } else if (this.phase === 0) {

                this.spawningSwarm = false;
                this.spawningFly = false;
                this.x += getRand(5, -2);
                this.y += getRand(5, -2);

                if (Date.now() - this.killTimer > 220) {
                    this.dmg = 0;
                    this.killCount++;
                    if (this.killCount % 3 === 0) bleed(6, this.x + getRand(150, -50), this.y + getRand(150, -50), this.y + 60, -80, -80, 1.2);
                    sounds.enemyDeath.currentTime = 0;
                    sounds.enemyDeath.play();
                    if (this.killCount >= 15) {
                        tempAnimations.push(new Animation(19, this.x - 40, this.y - 20, 200, 150, 16, imageTool.explosion, 0, 0, 1));
                        createItem(this.x + this.width / 2, this.y + this.height / 2, "boss", true);
                        this.alive = false;
                    }
                    this.killTimer = Date.now();
                }
            }
        }
    };
    // affichage
    this.draw = function (context) {
        // si le minion est vivant
        if (this.alive) {
            context.save();
            context.globalAlpha = 0.15;
            context.drawImage(imageTool.shadow, this.x - 10, this.y + 60, this.width + 20, this.height - 20);
            context.restore();

            if (this.spawningSwarm) {
                if (this.version == 2) {
                    this.swarmAnim2.update(this.x, this.y);
                    this.swarmAnim2.draw(context);
                } else {
                    this.swarmAnim.update(this.x, this.y);
                    this.swarmAnim.draw(context);
                }
            } else if (this.spawningFly) {
                if (this.version == 2) {
                    this.flyAnim2.update(this.x, this.y);
                    this.flyAnim2.draw(context);
                } else {
                    this.flyAnim.update(this.x, this.y);
                    this.flyAnim.draw(context);
                }
            } else if (this.isHit) context.drawImage(imageTool.dukehit, this.x - 22, this.y - 22, this.width + 42, this.height + 42);
            else if (this.version == 2) context.drawImage(imageTool.duke2, this.x - 22, this.y - 22, this.width + 42, this.height + 42);
            else context.drawImage(imageTool.duke, this.x - 22, this.y - 22, this.width + 42, this.height + 42);

            //HP BAR
            
            if (this.hp >= 0) {
                var percentLeft = (this.hp / this.maxHp) * 100;
                context.drawImage(imageTool.bossBg, 280, 0, 410, 43);
                if (this.isHit) context.drawImage(imageTool.bossHpHit, 316, 10, (367 / 100) * percentLeft, 27);
                else context.drawImage(imageTool.bossHp, 316, 10, (367 / 100) * percentLeft, 27);

                context.drawImage(imageTool.bossBar, 280, 0, 410, 43);
                
                // boss name

                context.font = "12pt wendy";
                context.textAlign = 'right';
                context.fillStyle = 'white';
                context.drawImage(imageTool.uinote, canvas.width - 240, canvas.height - 30, 300, 40);
                var nameShow = "";
                if (floorCount == 3) nameShow = this.name + " II";
                else nameShow = this.name + " I";
                context.fillText(nameShow, canvas.width - 8, canvas.height - 8);
                context.textAlign = 'left';
            }
        }
    };
    this.clear = function () { //Supprimer
        this.x = 0;
        this.y = 0;
        this.speed = 0;
        this.alive = false;
    };
    this.getDamage = function (dmg) {
        if (this.alive && this.hp > 0) {

            this.hp -= dmg;
            if (!this.isHit) {
                this.lastDamaged = Date.now();

                if (this.canBePushed) {
                    this.lastPushed = Date.now();
                }
            }

            if (this.hp <= 0) {
                this.swarm = 0;
                for (var m = 0; m < game.enemies.length; m++) {
                    if (game.enemies[m].bossfollow) game.enemies[m].bossfollow = false;
                }
                this.phase = 0;
            }
        }
    };
    this.checkDamage = function () {
        // calcul d'invulnérabilité temporaire
        this.now = Date.now();
        if (this.now - this.lastDamaged < 50) {
            this.isHit = true;
        } else this.isHit = false;

        if (this.now - this.lastPushed < 3000) {
            this.canBePushed = false;
        } else this.canBePushed = true;

    };
    this.flySpawn = function () {

        if (Date.now() - this.lastFire > this.spawnTimer) {

            // spawner une mouche d'attaque (fly) ou des mouches défensives (swarm) selon le pattern
            if (this.patternCounter == 1)
                this.spawningFly = true;

            else if (this.patternCounter > 1)
                this.spawningSwarm = true;

            // gestion du pattern
            // patternCounter 1 => pattern 1 (mouche d'attaque)
            // patternCounter 2 => pattern 1 (release swarm)
            // patternCounter 3 => pattern 2 (spawn du swarm)
            this.patternCounter = this.patternCounter == 3 ? 1 : this.patternCounter++;

            this.canSpawn = true;
            this.lastFire = Date.now();
        } else if (this.canSpawn && Date.now() - this.lastFire > 500) {
            this.canSpawn = false;

            // spawn mouche d'Attaque       
            if (this.patternCounter == 1 && game.enemies.length < 10) {

                // Boss lvl 1 : spawn 1 mouche
                if (this.version == 1) game.enemies.push(new Fly(this.x + getRand(20, 1), this.y + getRand(20, 1), 0 + floorCount * 3 / 2, "Attack", true, false));

                // Boss lvl 2
                else {

                    // Sous 50 % hp : spawn un pooter + 1 mouche forte si possible
                    if (this.hp <= this.maxHp / 2) {

                        game.enemies.push(new Fly(this.x + getRand(20, 1), this.y + getRand(20, 1), 1 + floorCount * 3 / 2, "Pooter", true, false));
                        if (game.enemies.length < 10) game.enemies.push(new Fly(this.x + getRand(20, 1), this.y + getRand(20, 1), 1 + floorCount * 3 / 2, "Attack", true, false));
                    }
                    // sinon spawn 1 mouche forte
                    else game.enemies.push(new Fly(this.x + getRand(20, 1), this.y + getRand(20, 1), 1 + floorCount * 3 / 2, "Attack", true, false));
                }
            }
            // release le swarm
            else if (this.patternCounter == 2 && game.enemies.length < 10) {
                // si aucun swarm, spawn mouche d'attaque
                if (this.swarm.length === 0)
                    game.enemies.push(new Fly(this.x + getRand(20, 1), this.y + getRand(20, 1), 0 + floorCount * 3 / 2, "Attack", true, false));
                // sinon release
                for (var i = 0; i < game.enemies.length; i++) {
                    if (game.enemies[i].bossfollow) {
                        game.enemies[i].dukeRelease();
                    }
                }
            }
            // spawn le swarm
            else if (this.patternCounter == 3) {
                while (this.swarm.length < 6 && game.enemies.length < 10) {
                    // l'angle de la prochaine mouche = la derniere disponible dans l'array swarmSpots
                    var swarmAngle = this.swarmSpots[this.swarmSpots.length - 1];
                    // retirer l'angle de l'array swarmSpots
                    this.swarmSpots.splice(this.swarmSpots.length - 1, 1);
                    // mettre l'angle dans l'array swarm
                    this.swarm.push(swarmAngle);
                    // spawn la nouvelle mouche avec son angle
                    game.enemies.push(new Fly(this.x + getRand(20, 1), this.y + getRand(20, 1), 0 + floorCount, "Swarm", true, true, swarmAngle));

                }
            }

            // attaque circulaire
            if (this.version == 2) {
                // une fois sur 2, l'attaque prend un angle différent
                var offset = this.shootPattern * 45;
                this.shootPattern = this.shootPattern == 1 ? 0 : 1;

                for (var j = 0; j < 4; j++) {
                    var dir = 90 * j + offset;
                    var bdirx = Math.sin(getRad(dir));
                    var bdiry = Math.cos(getRad(dir));
                    game.enemyBullets.push(new enemyBullet(5, this.range, this.x + this.width / 2 - 20, this.y + this.height / 2, bdirx, bdiry, 0.5, 28));
                }
            }
        }
    };
}

function Project(x, y, hp) {
    this.name = "Meatspin";
    this.faction = 'enemy';
    this.x = x;
    this.y = y;
    this.sx = x;
    this.sy = y;
    this.height = 108;
    this.width = 108;
    this.speed = 6;
    this.accel = 0;
    this.isMoving = false;
    this.fireRate = 1200;
    this.attackSpeed = 4;
    this.range = 2000;
    this.maxHp = hp;
    this.hp = this.maxHp;
    this.dmg = 0.5;
    this.created = 0;
    this.alive = true;
    // this.canGetDamage = true;
    this.isHit = false;
    this.canSpawnArm = true;
    this.canSpawnTail = true;
    this.phase = 1;
    this.killTimer = Date.now();
    this.killCount = 0;
    this.pattern = 1;
    this.patternTimer = 2000;
    this.patternChange = Date.now();
    this.lastAttack = 0;
    this.attackCounter = 0;
    this.angle = 150;
    this.armslength = 30;
    this.armCounter = 0;
    this.directionSet = false;
    this.dirx = Math.sin(120);
    this.diry = Math.cos(120);
    this.attx = 0;
    this.atty = 0;
    this.angNow = Date.now();
    this.lastAng = Date.now();
    this.lastEye = Date.now();
    this.lastDamaged = Date.now();
    this.hardmode = false;
    this.arm1 = [];
    this.arm1.destroyed = false;
    this.arm2 = [];
    this.arm1.destroyed = false;
    this.tail = [];
    this.tail.destroyed = false;
    this.state = 0;
    // METHODS
    this.reset = function () {
        this.x = this.sx;
        this.y = this.sy;
        this.hp = this.maxHp;
        this.isHit = false;
        this.isSleeping = this.wasSleeping;
        this.isHit = false;
        this.hitCount = 0;
        this.isBerserk = false;
    };
    this.update = function () {
        // heure de la création du boss
        if (this.created === 0) this.created = Date.now();

        this.checkDamage();
        // Calcul state damage
        if (Date.now() - this.lastDamaged < 120) {
            this.isHit = true;
        } else this.isHit = false;

        this.armslength = this.arm1.length + this.arm2.length;
        if (this.hp <= 0) {
            if (this.phase == 1) this.hardmode = true;
            this.phase = 3;
        } else if (this.armslength === 0) {
            this.phase = 2;
        } else this.phase = 1;

        // Phase 1: Tentacules
        if (this.phase == 1) {
            // Attaque basique
            if (Date.now() - this.lastAttack > this.patternTimer) {
                if (Date.now() - this.created > 4000) {
                    this.attackCounter = this.attackCounter > 4 ? this.attack(2) : this.attack(3);
                    this.attackCounter = this.attackCounter > 4 ? 0 : this.attackCounter++;
                }
                this.lastAttack = Date.now();

            }

            // changement de pattern
            if (Date.now() - this.patternChange > this.patternTimer * 3) {
                if (this.pattern == 1) this.pattern = 2;
                else this.pattern = 1;
                this.patternChange = Date.now();
                console.log('Pattern ' + this.pattern);
            }
        }
        // Phase 2: Mouvement et projectiles
        else if (this.phase == 2 && this.hp != this.maxHp) {
            // Kill les yeux
            if (Date.now() - this.killTimer > 500) {
                //Nombre de yeux
                if (game.enemies.length > 0) {
                    if (game.enemies[game.enemies.length - 1].type == "Eye") {
                        game.enemies[game.enemies.length - 1].kill();
                        this.killTimer = Date.now();
                    }
                }
            }
            // Spawn la tail
            if (this.canSpawnTail) {
                var taillength = 9;
                this.state = 3;
                for (var o = 0; o < taillength; o++) {
                    if (o > 2) this.state = 1;
                    else if (o > 1) this.state = 2;
                    this.tail.push(new this.Tail(40, 40, this.state, o));

                }
                this.canSpawnTail = false;
                console.log('tail spawned');
            }
            // Lance des projectiles
            if (Date.now() - this.patternChange > this.patternTimer) {
                this.attack(getRand(2, 1));
                this.patternChange = Date.now();
                console.log('Pattern ' + this.pattern);
            }
            // Détermine direction de départ
            if (!this.directionSet) {
                this.directionSet = true;
                this.dirx = Math.sin(getRad(150));
                this.diry = Math.cos(getRad(150));
            }
            this.move();
        }
        // Phase 3: animation de mort
        else if (this.phase == 3) {
            this.x += getRand(5, -2);
            this.y += getRand(5, -2);

            if (Date.now() - this.killTimer > 250) {
                // Nombre de yeux
                if (game.enemies.length > 0) {
                    if (game.enemies[game.enemies.length - 1].type == "Eye") game.enemies[game.enemies.length - 1].kill();
                }
                if (this.arm1.length > 0) this.arm1[this.arm1.length - 1].kill();
                if (this.arm2.length > 0) this.arm2[this.arm2.length - 1].kill();
                if (this.tail.length > 0) this.tail[this.tail.length - 1].kill();

                this.dmg = 0;
                this.killCount++;
                bleed(6, this.x + getRand(150, -50), this.y + getRand(150, -50), this.y + 60, -80, -80, 1.2);
                sounds.enemyDeath.currentTime = 0;
                sounds.enemyDeath.play();
                if (this.killCount >= 20) {
                    tempAnimations.push(new Animation(19, this.x - 40, this.y - 20, 200, 150, 16, imageTool.explosion, 0, 0, 1));
                    createItem(this.x + this.width / 2, this.y + this.height / 2, "boss", true);
                    if (this.hardmode) {
                        for (var i = 0; i < 3; i++) {
                            var randbonus = getRand(bossPool.length - 1, 0);
                            var randloot = bossPool[randbonus];
                            game.Items.push(new Item((5 + (i * 2)) * 64, this.y + this.height / 2, randloot, true));
                            bossPool.splice(randbonus, 1);
                        }
                    }
                    this.alive = false;
                }
                this.killTimer = Date.now();
            }
        }

        // Création tentacules
        if (this.canSpawnArm) {
            this.canSpawnArm = false;
            var distance = 80;
            var armlength = 12;
            var offset = 23;
            // ARM1
            for (var m = 0; m < armlength; m++) {
                this.state = 1;
                if (m <= 2) this.state = 3;
                else if (m < armlength - 3) this.state = 2;
                this.arm1.push(new this.Limb(40, 40, 120, distance + (m * offset), this.state, m));
            }
            // ARM2
            for (var v = 0; v < armlength; v++) {
                this.state = 1;
                if (v <= 2) this.state = 3;
                else if (v < armlength - 3) this.state = 2;
                this.arm2.push(new this.Limb(40, 40, 300, distance + (v * offset), this.state, v));
            }

            this.lastEye = Date.now();
        }

        // EYE
        if (this.phase < 3 && game.enemies.length < 3 && Date.now() - this.lastEye > (10000)) {
            game.enemies.push(new this.Eye(this.x + this.width / 2 - 26, this.y + this.height / 2 + 18));
            this.lastEye = Date.now();
            console.log('new Eye');
        }

        // ARM1
        for (var a = 0; a < this.arm1.length; a++) {
            if (!this.arm1[a].alive) {
                this.arm1.splice(a, 1);

                if (this.arm1.length === 0 && !this.arm1.destroyed) {
                    this.arm1.destroyed = true;
                    this.hp -= this.maxHp / 4;
                    this.isHit = true;
                    this.lastDamaged = Date.now();
                }
            } else {
                this.arm1[a].position = a;
                this.arm1[a].update();
            }
        }

        // ARM2
        for (var c = 0; c < this.arm2.length; c++) {
            if (!this.arm2[c].alive) {
                // Morceau mort
                this.arm2.splice(c, 1);
                // Bras mort
                if (this.arm2.length === 0 && !this.arm2.destroyed) {
                    this.arm2.destroyed = true;
                    this.hp -= this.maxHp / 4;
                    this.isHit = true;
                    this.lastDamaged = Date.now();
                }
            } else {
                this.arm2[c].position = c;
                this.arm2[c].update();
            }
        }

        // tail
        for (var d = 0; d < this.tail.length; d++) {

            if (!this.tail[d].alive) {
                // morceau mort
                this.tail.splice(d, 1);
                // tail mort
                if (this.tail.length === 0 && !this.tail.destroyed) {
                    this.tail.destroyed = true;
                    this.hp -= this.maxHp / 3;
                    this.isHit = true;
                    this.lastDamaged = Date.now();
                }
            } else {
                // this.tail[d].position = d;
                if (d === 0) this.tail[d].update(this.x, this.y, this.width, this.height);
                else this.tail[d].update(this.tail[d - 1].x, this.tail[d - 1].y, this.tail[d - 1].width, this.tail[d - 1].height);
            }
        }


    };
    this.move = function () {
        // appliquer le mouvement
        this.x += this.dirx * this.speed; // X
        this.y += this.diry * this.speed; // Y

        // collision et changement de direction
        for (var index = 0, wallMaps = game.wallMaps.length; index < wallMaps; index++) {
            switch (collisionDetection(this, game.wallMaps[index])) {
            case 'up':
            case 'down':
                this.diry = -this.diry;
                break;
            case 'left':
            case 'right':
                this.dirx = -this.dirx;
                break;
            }
        }
    };
    this.draw = function (context) { // affichage
        // si le minion est vivant
        if (this.alive) {
            // OMBRE
            context.save();
            context.globalAlpha = 0.25;
            context.drawImage(imageTool.shadow, this.x - 10, this.y - 10, this.width + 20, this.height + 40);
            context.restore();

            // BRAS
            // 1
            for (var a = 0; a < this.arm1.length; a++) {
                this.arm1[this.arm1.length - 1 - a].draw(context);
            }
            // 2
            for (var b = 0; b < this.arm2.length; b++) {
                this.arm2[this.arm2.length - 1 - b].draw(context);
            }

            // TAIL
            for (var c = 0; c < this.tail.length; c++) {
                this.tail[this.tail.length - 1 - c].draw(context);
            }

            //BODY
            if (this.isHit) context.drawImage(imageTool.projecthit, this.x - 32, this.y - 22, this.width + 52, this.height + 42);
            else context.drawImage(imageTool.project, this.x - 32, this.y - 22, this.width + 52, this.height + 42);
            //HP BAR
            if (this.hp >= 0) {
                var percentLeft = (this.hp / this.maxHp) * 100;
                context.drawImage(imageTool.bossBg, 280, 0, 410, 43);
                if (this.isHit) context.drawImage(imageTool.bossHpHit, 316, 10, (367 / 100) * percentLeft, 27);
                else context.drawImage(imageTool.bossHp, 316, 10, (367 / 100) * percentLeft, 27);
                context.drawImage(imageTool.bossBar, 280, 0, 410, 43);

                // boss name
                context.font = "12pt wendy";
                context.textAlign = 'right';
                context.fillStyle = 'white';
                context.drawImage(imageTool.uinote, canvas.width - 240, canvas.height - 30, 300, 40);
                var nameShow = "";
                if (floorCount == 3) nameShow = this.name + " II";
                else nameShow = this.name;
                context.fillText(nameShow, canvas.width - 8, canvas.height - 8);
            }
        }
    };
    this.clear = function () { //Supprimer
        this.x = 0;
        this.y = 0;
        this.speed = 0;
        this.alive = false;
    };
    this.attack = function (type) {
        if (type == 1) {
            // attaque random
            this.attx = (Player.x + Player.width / 2) - (this.x + this.width / 2);
            this.atty = (Player.y + Player.height / 2) - (this.y + this.height / 2);
            this.hyp = Math.sqrt(this.attx * this.attx + this.atty * this.atty);
            this.attx = this.attx / this.hyp;
            this.atty = this.atty / this.hyp;
            for (var i = 0; i < 6; i++) {
                var speedsize = getRand(3, 2);
                game.enemyBullets.push(new enemyBullet(speedsize, this.range, this.x + 50, this.y + 15, this.attx + (getRand(3, -1)) / 4, this.atty + (getRand(3, -1)) / 4, 0.5, 44 - (speedsize * 4)));
            }
        } else if (type == 2) {
            // attaque circulaire
            for (var j = 0; j < 6; j++) {
                var dir = 60 * j;
                var bdirx = Math.sin(getRad(dir));
                var bdiry = Math.cos(getRad(dir));
                game.enemyBullets.push(new enemyBullet(4, this.range, this.x + 50, this.y + 15, bdirx, bdiry, 0.5, 32));
            }
        } else if (type == 3) {
            // attaque targettée
            this.attx = (Player.x + Player.width / 2) - (this.x + this.width / 2);
            this.atty = (Player.y + Player.height / 2) - (this.y + this.height / 2);
            this.hyp = Math.sqrt(this.attx * this.attx + this.atty * this.atty);
            this.attx = this.attx / this.hyp;
            this.atty = this.atty / this.hyp;
            game.enemyBullets.push(new enemyBullet(5, this.range, this.x + 50, this.y + 15, this.attx, this.atty, 0.5, 32));
        }
    };
    this.getDamage = function (dmg) {
        if (this.alive && this.hp > 0) {
            if (this.phase == 1) this.hp -= dmg / 5;
            else if (this.phase == 2) this.hp -= dmg;
            this.lastDamaged = Date.now();
        }
    };
    this.checkCollide = function (obj, pos) {
        for (var m = 0; m < obj.length; m++) {
            if (this.y < obj[m].y + obj[m].height &&
                this.y + this.height > obj[m].y &&
                this.x + this.width > obj[m].x &&
                this.x < obj[m].x + obj[m].width) {
                if (obj[m].obstacle) {
                    if (pos == "up") {
                        this.y = obj[m].y + obj[m].height;
                        return true;
                    } else if (pos == "down") {
                        this.y = obj[m].y - this.height;
                        return true;
                    } else if (pos == "left") {
                        this.x = obj[m].x + obj[m].width;
                        return true;
                    } else if (pos == "right") {
                        this.x = obj[m].x - this.width;
                        return true;
                    }
                }
            }
        }
    };
    this.checkDamage = function () { //calcul d'invulnérabilité temporaire
        if (Date.now() - this.lastDamaged < 50) {
            this.isHit = true;
        } else this.isHit = false;
    };
    //
    //LIMB
    this.Limb = function (width, height, angle, radius, state, position) {
        this.faction = 'enemy';
        this.x = 0;
        this.y = 0;
        this.width = width;
        this.height = height;
        this.position = position;
        this.damage = 0.5;
        this.state = state;
        this.maxhp = this.state * 3;
        this.hp = this.maxhp;
        this.angle = angle;
        this.speed = 0;
        this.tarspeed = 0;
        this.radius = 23;
        this.tarradius = 80 + (this.position * 23);
        this.variation = 0;
        this.tarvariation = this.position * 5;
        this.lastDamaged = 0;
        //this.canGetDamage = true;
        this.isHit = false;
        this.alive = true;
        this.update = function () {
            if (game.boss[0].phase == 3) this.damage = 0;

            //Vitesse selon pattern (direction) et nombre de "morceaux" de bras
            if (game.boss[0].pattern == 1) this.tarspeed = 4 - game.boss[0].armslength / 8;
            else if (game.boss[0].pattern == 2) this.tarspeed = -4 + game.boss[0].armslength / 8;

            //Calcul de vitesse
            if (this.speed != this.tarspeed) this.speed -= (this.speed - this.tarspeed) / 100;

            //Switch de position
            this.tarradius = 80 + (this.position * 23);
            this.tarvariation = this.position * (this.tarspeed * 2.5);

            //Calcul de la courbure du bras
            if (this.variation != this.tarvariation) this.variation -= (this.variation - this.tarvariation) / 200;
            if (this.radius != this.tarradius) this.radius -= (this.radius - this.tarradius) / 10;

            //Rotation
            if (this.angle > 0) this.angle -= this.speed;
            else this.angle = 360;

            //Calcul state damage
            if (Date.now() - this.lastDamaged < 50) {
                this.isHit = true;
            } else this.isHit = false;

            //Calcul d'étape des parties du bras. 
            if (this.hp <= 3) this.state = 1;
            else if (this.hp <= 6) {
                //  if(this.state ==3) game.enemies.push(new Fly(this.x+getRand(20,1),this.y+getRand(20,1),1+floorCount*3/2,"Attack",true,false));
                this.state = 2;
            }

            this.x = ((game.boss[0].x + game.boss[0].width / 2) + (Math.sin(getRad(this.angle + this.variation)) * this.radius) - this.width / 2);
            this.y = ((game.boss[0].y + game.boss[0].height / 2) + (Math.cos(getRad(this.angle + this.variation)) * this.radius) - this.height / 2);

            // Player collision
            if (this.y < Player.y + Player.height &&
                this.y + this.height > Player.y &&
                this.x + this.width > Player.x &&
                this.x < Player.x + Player.width) {
                Player.getDamage(this.damage);
            }

            this.checkCollide(playerBullets);
            this.checkCollide(game.Explosions);
        };
        this.draw = function (context) {
            context.save();
            context.globalAlpha = 0.15;
            context.drawImage(imageTool.shadow, this.x + 7, this.y + 24, this.width - 15, this.height - 15);
            context.restore();

            if (this.state == 1) {
                this.width = 30;
                this.height = 30;
                if (this.isHit) context.drawImage(imageTool.projectLimb1hit, this.x - 6, this.y - 6, this.width * 1.3, this.height * 1.3);
                else context.drawImage(imageTool.projectLimb1, this.x - 6, this.y - 6, this.width * 1.3, this.height * 1.3);
            } else if (this.state == 2) {
                this.width = 45;
                this.height = 45;
                if (this.isHit) context.drawImage(imageTool.projectLimb2hit, this.x - 4, this.y - 15, this.width * 1.3, this.height * 1.4);
                else context.drawImage(imageTool.projectLimb2, this.x - 4, this.y - 15, this.width * 1.3, this.height * 1.4);
            } else if (this.state == 3) {
                this.width = 60;
                this.height = 60;
                if (this.isHit) context.drawImage(imageTool.projectLimb3hit, this.x - 14, this.y - 14, this.width * 1.3, this.height * 1.3);
                else context.drawImage(imageTool.projectLimb3, this.x - 14, this.y - 14, this.width * 1.3, this.height * 1.3);
            }
        };
        this.getDamage = function (dmg) {
            if (this.alive && this.hp > 0) {
                this.hp -= dmg;
                this.lastDamaged = Date.now();
                if (this.hp <= 0) {
                    bleed(6, this.x, this.y - 20, this.y + 40, -80, -80, 1.2);
                    sounds.enemyDeath.currentTime = 0;
                    sounds.enemyDeath.play();
                    this.alive = false;
                }
            }
        };
        this.kill = function () {
            bleed(2, this.x, this.y - 10, this.y + 20, -50, -50, 2 / 3);
            this.alive = false;
        };
        this.checkCollide = function (obj) { //calcul de collision hitbox ronde
            for (var i = 0; i < obj.length; i++) {
                var diffx = (this.x + this.width / 2) - (obj[i].x + obj[i].width / 2);
                var diffy = (this.y + this.height / 2) - (obj[i].y + obj[i].height / 2);
                this.hyp = Math.sqrt(diffx * diffx + diffy * diffy);

                if (this.hyp <= (this.width / 2 + obj[i].width / 2)) {

                    if (obj == game.Explosions) this.getDamage(Player.bombDmg / 3);
                    else {
                        this.getDamage(obj[i].dmg);
                        obj[i].clear();
                    }
                }
            }
        };
    };
    //FIN LIMB
    //

    //
    //TAIL
    this.Tail = function (width, height, state, pos) {
        this.faction = 'enemy';
        this.width = width;
        this.height = height;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height / 2 - this.height / 2;
        this.dirx = 0;
        this.diry = 0;
        this.position = pos;
        this.leaderpos = pos - 1;
        this.damage = 0.5;
        this.state = state;
        this.maxhp = this.state * 3;
        this.hp = this.maxhp;
        this.speed = 0;
        this.accel = 1;
        this.lastDamaged = 0;
        //this.canGetDamage = true;
        this.isHit = false;
        this.alive = true;
        this.hyp = 0;
        //leader coords
        this.lx = 0;
        this.ly = 0;
        this.lw = 0;
        this.lh = 0;
        this.update = function (lx, ly, lw, lh) {

            if (game.boss[0].phase == 3) this.damage = 0;

            this.lx = lx;
            this.ly = ly;
            this.lw = lw;
            this.lh = lh;

            //Calcul de direction
            this.dirx = (this.lx + this.lw / 2) - (this.x + this.width / 2);
            this.diry = (this.ly + this.lh / 2) - (this.y + this.height / 2);
            this.hyp = Math.sqrt(this.dirx * this.dirx + this.diry * this.diry);
            this.dirx = this.dirx / this.hyp;
            this.diry = this.diry / this.hyp;

            //Calcul de vitesse
            if (this.hyp > (58 - pos * 7)) this.speed = 6;
            else this.speed = 1;
            if (this.accel != this.speed) this.accel -= (this.accel - this.speed) / 10;

            //Mouvement
            this.x += this.dirx * this.accel;
            this.y += this.diry * this.accel;



            //Calcul state damage
            if (Date.now() - this.lastDamaged < 120) {
                this.isHit = true;
            } else this.isHit = false;

            //Calcul d'étape des parties du bras. Si un morceau de "niveau 3" est brisée, une mouche spawn
            if (this.hp <= 3) this.state = 1;
            else if (this.hp <= 6) {
                // if(this.state ==3) game.enemies.push(new Fly(this.x+getRand(20,1),this.y+getRand(20,1),1+floorCount*3/2,"Attack",true,false));
                this.state = 2;
            }

            // Player collision
            if (this.y < Player.y + Player.height &&
                this.y + this.height > Player.y &&
                this.x + this.width > Player.x &&
                this.x < Player.x + Player.width) {
                Player.getDamage(this.damage);
            }

            this.checkCollide(playerBullets);
            this.checkCollide(game.Explosions);
        };
        this.draw = function (context) {
            context.save();
            context.globalAlpha = 0.15;
            context.drawImage(imageTool.shadow, this.x + 7, this.y + 24, this.width - 15, this.height - 15);
            context.restore();



            if (this.state == 1) {
                this.width = 30;
                this.height = 30;
                if (this.isHit) context.drawImage(imageTool.projectLimb1hit, this.x - 6, this.y - 6, this.width * 1.3, this.height * 1.3);
                else context.drawImage(imageTool.projectLimb1, this.x - 6, this.y - 6, this.width * 1.3, this.height * 1.3);
            } else if (this.state == 2) {
                this.width = 45;
                this.height = 45;
                if (this.isHit) context.drawImage(imageTool.projectLimb2hit, this.x - 4, this.y - 15, this.width * 1.3, this.height * 1.4);
                else context.drawImage(imageTool.projectLimb2, this.x - 4, this.y - 15, this.width * 1.3, this.height * 1.4);
            } else if (this.state == 3) {
                this.width = 60;
                this.height = 60;
                if (this.isHit) context.drawImage(imageTool.projectLimb3hit, this.x - 14, this.y - 14, this.width * 1.3, this.height * 1.3);
                else context.drawImage(imageTool.projectLimb3, this.x - 14, this.y - 14, this.width * 1.3, this.height * 1.3);
            }

            if (hitBox) {
                context.strokeStyle = "white";
                context.beginPath();
                context.moveTo(this.lx + this.lw / 2, this.ly + this.lh / 2);
                context.lineTo(this.x + this.width / 2, this.y + this.height / 2);
                context.lineWidth = 8;
                context.stroke();
                context.lineWidth = 1;
            }
        };
        this.getDamage = function (dmg) {
            if (this.alive && this.hp > 0) {
                if (!this.isHit) this.hp -= dmg;
                this.lastDamaged = Date.now();

                if (this.hp <= 0) {
                    bleed(6, this.x, this.y - 20, this.y + 40, -80, -80, 1.2);
                    sounds.enemyDeath.currentTime = 0;
                    sounds.enemyDeath.play();
                    this.alive = false;
                }
            }
        };
        this.kill = function () {
            bleed(2, this.x, this.y - 10, this.y + 20, -50, -50, 2 / 3);
            this.alive = false;
        };
        this.checkCollide = function (obj) { //calcul de collision hitbox ronde
            for (var i = 0; i < obj.length; i++) {
                var diffx = (this.x + this.width / 2) - (obj[i].x + obj[i].width / 2);
                var diffy = (this.y + this.height / 2) - (obj[i].y + obj[i].height / 2);
                this.hyp = Math.sqrt(diffx * diffx + diffy * diffy);

                if ( this.hyp <= (this.width / 2 + obj[i].width / 2)) {

                    if (obj == game.Explosions) {
                        this.getDamage(Player.bombDmg / 3);
                    } else {
                        this.getDamage(obj[i].dmg);
                        obj[i].clear();
                    }
                }
            }
        };
    };
    //*********************************************************************************************************************************************************************/
    // FIN TAIL
    // 
    //*********************************************************************************************************************************************************************/
    //
    // EYE
    //*********************************************************************************************************************************************************************/
    this.Eye = function (x, y) {
        this.type = "Eye";
        this.faction = 'enemy';
        this.x = x;
        this.y = y;
        this.width = 28;
        this.height = 28;
        this.dirx = 0;
        this.diry = 0;
        this.speed = 1;
        this.accel = 0;
        this.dmg = 0.5;
        this.alive = true;
        this.isHit = false;
        this.isMoving = false;
        this.rand = getRand(2000, 250);
        this.angle = getRand(360, 0);
        this.lastAng = Date.now();
        this.lastDamaged = Date.now();
        this.update = function () {
            if (game.boss[0].phase == 3) this.damage = 0;

            if (Date.now() - this.lastDamaged < 350) {
                this.isHit = true;
            } else this.isHit = false;
            if (this.accel != this.speed) this.accel -= (this.accel - this.speed) / 100;

            this.move();
        };
        this.move = function () {

            // Mode "bump" (a été touché)
            if (this.isHit) {
                this.dirx = (Player.x + Player.width / 2) - (this.x + this.width / 2);
                this.diry = (Player.y + Player.height / 2) - (this.y + this.height / 2);
                this.hyp = Math.sqrt(this.dirx * this.dirx + this.diry * this.diry);
                this.dirx = -this.dirx / this.hyp;
                this.diry = -this.diry / this.hyp;
                this.speed = 5;
            } else this.speed = 2;

            this.x += this.dirx * this.accel;
            this.y += this.diry * this.accel;
            for (var index = 0, wallMaps = game.wallMaps.length; index < wallMaps; index++) {
                switch (collisionDetection(this, game.wallMaps[index])) {
                case 'up':
                case 'down':
                    this.diry = -this.diry;
                    break;
                case 'left':
                case 'right':
                    this.dirx = -this.dirx;
                    break;
                }
            }
        };
        this.kill = function () {
            bleed(2, this.x, this.y - 10, this.y + 20, -50, -50, 2 / 3);
            this.alive = false;
        };
        this.getDamage = function (dmg) {
            if (dmg >= 10) this.kill();
            if (!this.isHit) {
                this.lastDamaged = Date.now();
            }
        };
        this.draw = function (context) {
            context.save();
            context.globalAlpha = 0.15;
            context.drawImage(imageTool.shadow, this.x + 3, this.y + 34, this.width - 6, this.height - 6);
            context.restore();
            context.drawImage(imageTool.projectEye, this.x - 2, this.y - 2, this.width + 4, this.height + 4);
        };
        this.checkCollide = function (obj, pos) {
            for (var i = 0; i < obj.length; i++) {
                if (this.y < obj[i].y + obj[i].height &&
                    this.y + this.height > obj[i].y &&
                    this.x + this.width > obj[i].x &&
                    this.x < obj[i].x + obj[i].width) {
                    if (obj[i].obstacle) {
                        if (pos == "up") {
                            this.y = obj[i].y + obj[i].height;
                            return true;
                        } else if (pos == "down") {
                            this.y = obj[i].y - this.height;
                            return true;
                        } else if (pos == "left") {
                            this.x = obj[i].x + obj[i].width;
                            return true;
                        } else if (pos == "right") {
                            this.x = obj[i].x - this.width;
                            return true;
                        }
                    }
                }
            }
        };
    };
    //FIN EYE
}

console.log('enemies ...');

/*******************************************************************************************************************************************************************************************
********************************************************************************************************************************************************************************************
PROJECTILES
*******************************************************************************************************************************************************************************************
*******************************************************************************************************************************************************************************************/

function enemyBullet(speed, range, bulx, buly, dirx, diry, dmg, size) {
    this.type = 'projectile';
    this.range = range;
    this.defaultrange = range;
    this.inix = bulx;
    this.iniy = buly;
    this.x = this.inix;
    this.y = this.iniy;
    this.dirx = dirx;
    this.diry = diry;
    this.height = size;
    this.width = size;
    this.dmg = dmg;
    this.fireDate = Date.now();
    this.speed = speed;
    this.alive = true;
    this.update = function () {
        if (this.alive) {
            this.x -= this.dirx * -this.speed;
            this.y -= this.diry * -this.speed;
            enemyBulletCollisionPlayer();
            enemyBulletCollisionLevel(game.wallMaps);
            if (Date.now() - this.fireDate > this.range) this.alive = false;
        }
    };
    this.draw = function (context) {
        context.save();
        context.globalAlpha = 0.15;
        context.drawImage(imageTool.shadow, this.x, this.y + 20, this.width, this.height);
        context.restore();
        if (this.alive) context.drawImage(imageTool.enemyBullet, this.x, this.y, this.width, this.height);
    };
}

//projectile
function Bullet(side, speed, range, bulx, buly, accelx, accely, dmg, type) {
    this.type = 'projectile';
    this.side = side;
    this.range = range;
    this.inix = bulx;
    this.iniy = buly;
    this.x = this.inix;
    this.y = this.iniy;
    this.dirx = 0;
    this.diry = 0;
    this.angle = 0;
    this.targetx = 0;
    this.targetx = 0;
    this.height = 27;
    this.width = 27;
    this.dmg = dmg;
    this.speed = speed;
    this.alive = true;
    this.hyp = 0;
    this.update = function () { //Calcul
        if (this.alive) {

            for (var i = 0; i < game.wallMaps.length; i++) {
                if(game.wallMaps[i].obstacle && game.wallMaps[i].type != "hole" ){
                    if( hitDetection( this, game.wallMaps[i] )) {
                        game.wallMaps[i].use(this);
                        this.clear();
                    }
                }
            }

            for (var j = 0; j < game.enemies.length; j++) {
                if( hitDetection( this, game.enemies[j] )) {
                    game.enemies[j].getDamage(this.dmg);
                    this.clear();
                }
            }

            for (var h = 0; h < game.boss.length; h++) {
                if( hitDetection( this, game.boss[h] )) {
                    game.boss[h].getDamage(this.dmg);
                    this.clear();
                }
            }

            if (this.side == "up") {
                //WIGGLE SANS TRIPLE SHOT
                if (Player.isWiggle && !Player.innerEye) {
                    if (this.angle < 90) this.angle += 0.2;
                    else this.angle = 0;
                    this.dirx = Math.cos(this.angle) / 2;
                    this.diry = (Player.y - Player.height / 2) - ((Player.y - Player.width / 2) - this.range);
                    this.targety = this.iniy - this.range;
                    this.hyp = Math.sqrt(this.dirx * this.dirx + this.diry * this.diry);
                    this.diry = this.diry / this.hyp;
                    if (this.y > this.targety) {
                        this.x -= this.dirx * this.speed;
                        this.y -= this.diry * this.speed;
                    } else this.alive = false;
                }

                //WIGGLE AVEC TRIPLE SHOT
                else if (Player.isWiggle && Player.innerEye) {
                    if (type !== 0) {
                        if (type == -1) {
                            if (this.angle < 90) this.angle += 0.15;
                            else this.angle = 0;
                        }
                        if (type == 1) {
                            if (this.angle > 0) this.angle -= 0.15;
                            else this.angle = 90;
                        }
                        this.dirx = Math.cos(this.angle) / 2;
                    } else this.dirx = 0;

                    this.diry = (Player.y - Player.height / 2) - ((Player.y - Player.width / 2) - this.range);
                    this.targety = this.iniy - this.range;
                    this.hyp = Math.sqrt(this.dirx * this.dirx + this.diry * this.diry);
                    this.diry = this.diry / this.hyp;
                    if (this.y > this.targety) {
                        this.x -= this.dirx * this.speed;
                        this.y -= this.diry * this.speed;
                    } else this.alive = false;

                }
                //NORMAL
                else {
                    //TRIPLE SHOT
                    if (Player.innerEye) this.dirx = (Player.x - Player.width / 2) - ((Player.x - Player.width / 2) + accelx * 50 + type * 30);
                    else this.dirx = (Player.x - Player.width / 2) - ((Player.x - Player.width / 2) + accelx * 50);

                    this.diry = (Player.y - Player.height / 2) - ((Player.y - Player.width / 2) - this.range);
                    this.targety = this.iniy - this.range;
                    this.hyp = Math.sqrt(this.dirx * this.dirx + this.diry * this.diry);
                    this.dirx = this.dirx / this.hyp;
                    this.diry = this.diry / this.hyp;
                    if (this.y > this.targety) {
                        this.x -= this.dirx * this.speed;
                        this.y -= this.diry * this.speed;
                    } else this.alive = false;
                }
            } else if (this.side == "down") {
                //WIGGLE SANS TRIPLE SHOT
                if (Player.isWiggle && !Player.innerEye) {
                    if (this.angle < 90) this.angle += 0.2;
                    else this.angle = 0;
                    this.dirx = Math.cos(this.angle) / 2;
                    this.diry = (Player.y - Player.height / 2) - ((Player.y - Player.width / 2) + this.range);
                    this.targety = this.iniy + this.range;
                    this.hyp = Math.sqrt(this.dirx * this.dirx + this.diry * this.diry);
                    this.diry = this.diry / this.hyp;
                    if (this.y < this.targety) {
                        this.x -= this.dirx * this.speed;
                        this.y -= this.diry * this.speed;
                    } else this.alive = false;
                }

                //WIGGLE AVEC TRIPLE SHOT
                else if (Player.isWiggle && Player.innerEye) {
                    if (type !== 0) {
                        if (type == -1) {
                            if (this.angle < 90) this.angle += 0.15;
                            else this.angle = 0;
                        }
                        if (type == 1) {
                            if (this.angle > 0) this.angle -= 0.15;
                            else this.angle = 90;
                        }
                        this.dirx = Math.cos(this.angle) / 2;
                    } else this.dirx = 0;

                    this.diry = (Player.y - Player.height / 2) - ((Player.y - Player.width / 2) + this.range);
                    this.targety = this.iniy + this.range;
                    this.hyp = Math.sqrt(this.dirx * this.dirx + this.diry * this.diry);
                    this.diry = this.diry / this.hyp;
                    if (this.y < this.targety) {
                        this.x -= this.dirx * this.speed;
                        this.y -= this.diry * this.speed;
                    } else this.alive = false;
                }

                //NORMAL
                else {
                    //TRIPLE SHOT
                    if (Player.innerEye) this.dirx = (Player.x - Player.width / 2) - ((Player.x - Player.width / 2) + accelx * 50 + type * 30);
                    else this.dirx = (Player.x - Player.width / 2) - ((Player.x - Player.width / 2) + accelx * 50);

                    this.diry = (Player.y - Player.height / 2) - ((Player.y - Player.width / 2) + this.range);
                    this.targety = this.iniy + this.range;
                    this.hyp = Math.sqrt(this.dirx * this.dirx + this.diry * this.diry);
                    this.dirx = this.dirx / this.hyp;
                    this.diry = this.diry / this.hyp;
                    if (this.y < this.targety) {
                        this.x -= this.dirx * this.speed;
                        this.y -= this.diry * this.speed;
                    } else this.alive = false;
                }
            } else if (this.side == "right") {
                //WIGGLE SANS TRIPLE SHOT
                if (Player.isWiggle && !Player.innerEye) {
                    if (this.angle < 90) this.angle += 0.2;
                    else this.angle = 0;
                    this.diry = Math.sin(this.angle) * 1 / 3;

                    this.dirx = (Player.x - Player.width / 2) - ((Player.x - Player.width / 2) + this.range);
                    this.targetx = this.inix + this.range;
                    this.hyp = Math.sqrt(this.dirx * this.dirx + this.diry * this.diry);
                    this.dirx = this.dirx / this.hyp;

                    if (this.x < this.targetx) {
                        this.x -= this.dirx * this.speed;
                        this.y -= this.diry * this.speed;
                    } else this.alive = false;
                }

                //WIGGLE AVEC TRIPLE SHOT
                else if (Player.isWiggle && Player.innerEye) {
                    if (type !== 0) {
                        if (type == -1) {
                            if (this.angle < 90) this.angle += 0.15;
                            else this.angle = 0;
                        }
                        if (type == 1) {
                            if (this.angle > 90) this.angle -= 0.15;
                            else this.angle = 180;
                        }
                        this.diry = Math.sin(this.angle) / 2;
                    } else this.diry = 0;

                    this.dirx = (Player.x - Player.width / 2) - ((Player.x - Player.width / 2) + this.range);
                    this.targetx = this.inix + this.range;
                    this.hyp = Math.sqrt(this.dirx * this.dirx + this.diry * this.diry);
                    this.dirx = this.dirx / this.hyp;

                    if (this.x < this.targetx) {
                        this.x -= this.dirx * this.speed;
                        this.y -= this.diry * this.speed;
                    } else this.alive = false;
                }

                //NORMAL
                else {
                    this.dirx = (Player.x - Player.width / 2) - ((Player.x - Player.width / 2) + this.range);
                    //TRIPLE SHOT
                    if (Player.innerEye) this.diry = (Player.y - Player.height / 2) - ((Player.y - Player.width / 2) + accely * 50 + type * 30);
                    else this.diry = (Player.y - Player.height / 2) - ((Player.y - Player.width / 2) + accely * 50);

                    this.targetx = this.inix + this.range;
                    this.hyp = Math.sqrt(this.dirx * this.dirx + this.diry * this.diry);
                    this.dirx = this.dirx / this.hyp;
                    this.diry = this.diry / this.hyp;
                    if (this.x < this.targetx) {
                        this.x -= this.dirx * this.speed;
                        this.y -= this.diry * this.speed;
                    } else this.alive = false;
                }

            } else if (this.side == "left") {
                //WIGGLE SANS TRIPLE SHOT
                if (Player.isWiggle && !Player.innerEye) {
                    if (this.angle < 90) this.angle += 0.2;
                    else this.angle = 0;
                    this.diry = Math.sin(this.angle) * 1 / 3;

                    this.dirx = (Player.x - Player.width / 2) - ((Player.x - Player.width / 2) - this.range);
                    this.targetx = this.inix - this.range;
                    this.hyp = Math.sqrt(this.dirx * this.dirx + this.diry * this.diry);
                    this.dirx = this.dirx / this.hyp;

                    if (this.x > this.targetx) {
                        this.x -= this.dirx * this.speed;
                        this.y -= this.diry * this.speed;
                    } else this.alive = false;
                }

                //WIGGLE AVEC TRIPLE SHOT
                else if (Player.isWiggle && Player.innerEye) {
                    if (type !== 0) {
                        if (type == -1) {
                            if (this.angle < 90) this.angle += 0.15;
                            else this.angle = 0;
                        }
                        if (type == 1) {
                            if (this.angle > 90) this.angle -= 0.15;
                            else this.angle = 180;
                        }
                        this.diry = Math.sin(this.angle) / 2;
                    } else this.diry = 0;

                    this.dirx = (Player.x - Player.width / 2) - ((Player.x - Player.width / 2) - this.range);
                    this.targetx = this.inix - this.range;
                    this.hyp = Math.sqrt(this.dirx * this.dirx + this.diry * this.diry);
                    this.dirx = this.dirx / this.hyp;

                    if (this.x > this.targetx) {
                        this.x -= this.dirx * this.speed;
                        this.y -= this.diry * this.speed;
                    } else this.alive = false;
                }

                //NORMAL
                else {
                    this.dirx = (Player.x - Player.width / 2) - ((Player.x - Player.width / 2) - this.range);
                    //TRIPLE SHOT
                    if (Player.innerEye) this.diry = (Player.y - Player.height / 2) - ((Player.y - Player.width / 2) + accely * 50 + type * 30);
                    else this.diry = (Player.y - Player.height / 2) - ((Player.y - Player.width / 2) + accely * 50);

                    this.targetx = this.inix - this.range;
                    this.hyp = Math.sqrt(this.dirx * this.dirx + this.diry * this.diry);
                    this.dirx = this.dirx / this.hyp;
                    this.diry = this.diry / this.hyp;
                    if (this.x > this.targetx) {
                        this.x -= this.dirx * this.speed;
                        this.y -= this.diry * this.speed;
                    } else this.alive = false;
                }
            }
        }
    };
    this.draw = function (context) { //Affichage
        if (hitBox) {
            context.drawImage(imageTool.hitBox, this.x, this.y, this.width, this.height);
        }
        if (this.alive) {

            if (Player.isNumberOne) {
                context.save();
                context.globalAlpha = 0.15;
                context.drawImage(imageTool.shadow, this.x, this.y + 10, this.width, this.height);
                context.restore();
                context.drawImage(imageTool.bulletNumberOne, this.x, this.y, this.width, this.height);
            } else {
                context.save();
                context.globalAlpha = 0.15;
                context.drawImage(imageTool.shadow, this.x, this.y + 30, this.width, this.height);
                context.restore();
                if (Player.isToothPicks) context.drawImage(imageTool.enemyBullet, this.x, this.y, this.width, this.height);
                else context.drawImage(imageTool.playerBullet, this.x, this.y, this.width, this.height);
            }
        }
    };
    this.getDamage = function () {};
    this.clear = function () {
        this.dmg = 0;
        this.alive = false;
    };
}
/*
function projectile() {
    this.type = 'projectile';
    this.side = side;
    this.range = range;
    this.inix = bulx;
    this.iniy = buly;
    this.x = this.inix;
    this.y = this.iniy;
    this.dirx = 0;
    this.diry = 0;
    this.angle = 0;
    this.targetx = 0;
    this.targetx = 0;
    this.height = 27;
    this.width = 27;
    this.dmg = dmg;
    this.speed = speed;
    this.alive = true;
    this.hyp = 0;
    // calcul
    this.update = function () {
        if (this.alive) {
            // faire le ménage...
            bulletCollision(playerBullets, game.boss);
            bulletCollision(playerBullets, game.enemies);
            bulletCollision(playerBullets, game.wallMaps);

            if (this.side == "up") {
                this.dirx = (Player.x - Player.width / 2) - ((Player.x - Player.width / 2) + accelx * 50);
                this.diry = (Player.y - Player.height / 2) - ((Player.y - Player.width / 2) - this.range);

                this.targety = this.iniy - this.range;

                this.hyp = Math.sqrt(this.dirx * this.dirx + this.diry * this.diry);
                this.dirx = this.dirx / this.hyp;
                this.diry = this.diry / this.hyp;

                // en chemin vers la destination ? continuer d'avancer sinon supprimer
                if (this.y > this.targety) {
                    this.x -= this.dirx * this.speed;
                    this.y -= this.diry * this.speed;
                } else this.clear();
            } else if (this.side == "down") {
                this.dirx = (Player.x - Player.width / 2) - ((Player.x - Player.width / 2) + accelx * 50);
                this.diry = (Player.y - Player.height / 2) - ((Player.y - Player.width / 2) + this.range);

                this.targety = this.iniy + this.range;

                this.hyp = Math.sqrt(this.dirx * this.dirx + this.diry * this.diry);
                this.dirx = this.dirx / this.hyp;
                this.diry = this.diry / this.hyp;

                // en chemin vers la destination ? continuer d'avancer sinon supprimer
                if (this.y < this.targety) {
                    this.x -= this.dirx * this.speed;
                    this.y -= this.diry * this.speed;
                } else this.clear();
            } else if (this.side == "right") {
                this.dirx = (Player.x - Player.width / 2) - ((Player.x - Player.width / 2) + this.range);
                this.diry = (Player.y - Player.height / 2) - ((Player.y - Player.width / 2) + accely * 50);

                this.targetx = this.inix + this.range;

                this.hyp = Math.sqrt(this.dirx * this.dirx + this.diry * this.diry);
                this.dirx = this.dirx / this.hyp;
                this.diry = this.diry / this.hyp;

                // en chemin vers la destination ? continuer d'avancer sinon supprimer
                if (this.x < this.targetx) {
                    this.x -= this.dirx * this.speed;
                    this.y -= this.diry * this.speed;
                } else this.clear();
            } else if (this.side == "left") {
                this.dirx = (Player.x - Player.width / 2) - ((Player.x - Player.width / 2) - this.range);
                this.diry = (Player.y - Player.height / 2) - ((Player.y - Player.width / 2) + accely * 50);

                this.targetx = this.inix - this.range;

                this.hyp = Math.sqrt(this.dirx * this.dirx + this.diry * this.diry);
                this.dirx = this.dirx / this.hyp;
                this.diry = this.diry / this.hyp;

                // en chemin vers la destination ? continuer d'avancer sinon supprimer
                if (this.x > this.targetx) {
                    this.x -= this.dirx * this.speed;
                    this.y -= this.diry * this.speed;
                } else this.clear();
            }
        }
    };

    // affichage
    this.draw = function (context) {
        if (this.alive) {
            context.save();
            context.globalAlpha = 0.15;
            context.drawImage(imageTool.shadow, this.x, this.y + 30, this.width, this.height);
            context.restore();
            if (Player.isToothPicks) context.drawImage(imageTool.enemyBullet, this.x, this.y, this.width, this.height);
            else context.drawImage(imageTool.playerBullet, this.x, this.y, this.width, this.height);
        }
    };

    // clear
    this.clear = function () {
        this.dmg = 0;
        this.alive = false;
    };
}*/

/*******************************************************************************************************************************************************************************************
********************************************************************************************************************************************************************************************
CALCULS DE COLLISIONS
*******************************************************************************************************************************************************************************************
*******************************************************************************************************************************************************************************************/

function enemyBulletCollisionPlayer() {
    for (var i = 0; i < game.enemyBullets.length; i++) {
        // Player
        if (game.enemyBullets[i].x < Player.x + Player.width - 6 &&
            game.enemyBullets[i].x + (game.enemyBullets[i].width - 6) > Player.x &&
            game.enemyBullets[i].y < Player.y + Player.height - 6 &&
            game.enemyBullets[i].y + (game.enemyBullets[i].height - 6) > Player.y) {
            Player.getDamage(game.enemyBullets[i].dmg);
            game.enemyBullets[i].alive = false;
        }
    }
}

function enemyBulletCollisionLevel(obj) {
    for (var y = 0; y < game.enemyBullets.length; y++) {
        // Collision map
        for (var m = 0; m < obj.length; m++) {
            if (game.enemyBullets[y].x < obj[m].x + obj[m].width - 7 &&
                game.enemyBullets[y].x + (game.enemyBullets[y].width - 7) > obj[m].x &&
                game.enemyBullets[y].y < obj[m].y + obj[m].height - 7 &&
                game.enemyBullets[y].y + (game.enemyBullets[y].height - 7) > obj[m].y) {
                if (obj[m].type == "fireplace" || obj[m].type == "hellfireplace") {} else if (obj[m].obstacle && obj[m].type != 'hole') {
                    game.enemyBullets[y].alive = false;
                }
            }
        }
    }
}

/*******************************************************************************************************************************************************************************************
********************************************************************************************************************************************************************************************
FONCTIONS GETTER
*******************************************************************************************************************************************************************************************
*******************************************************************************************************************************************************************************************/

// retourne un nombre aléatoire
function getRand(nbPos, nbDep) {
    return Math.floor(Math.random() * nbPos + nbDep);
}

// retourne l'élément html d'un ID
function getEl(id) {
    return document.getElementById(id);
}

// retourne la radiante d'un angle
function getRad(angle) {
    return angle * (Math.PI / 180);
}

// retourne un vecteur entre 2 position
function getVector(start, end, output_dir) {
    var vector = {};

    // trouver l'hypothénuse
    vector.x = (start.x * 1 + start.width / 2) - (end.x * 1 + end.width / 2);
    vector.y = (start.y * 1 + start.height / 2) - (end.y * 1 + end.height / 2);
    vector.hyp = Math.sqrt(vector.x * vector.x + vector.y * vector.y);

    // diviser par l'hypothénuse ou pas
    if (output_dir) {
        vector.x = vector.x / vector.hyp;
        vector.y = vector.y / vector.hyp;
    }
    return vector;
}

// retourne le vecteur d'un pathfinding
function getPathVector(start, end) {
    var vector = {};
    vector.x = (start[0] * 64 + 32) - (end.x + end.width / 2);
    vector.y = (start[1] * 64 + 32) - (end.y + end.height / 2);
    vector.hyp = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    vector.x = vector.x / vector.hyp;
    vector.y = vector.y / vector.hyp;
    return vector;
}

/*******************************************************************************************************************************************************************************************
********************************************************************************************************************************************************************************************
NOUVELLES FONCTIONS
*******************************************************************************************************************************************************************************************
*******************************************************************************************************************************************************************************************/

// detection de collisions avec les obstacles (hitbox carrée)
function collisionDetection(objet1, objet2) {

    var cornerfix = 2;

    // obj1
    var obj1_halfWidth = objet1.width / 2;
    var obj1_halfHeight = objet1.height / 2;
    var obj1_centerX = objet1.x + obj1_halfWidth;
    var obj1_centerY = objet1.y + obj1_halfHeight;

    // obj2
    var obj2_halfWidth = objet2.width / 2;
    var obj2_halfHeight = objet2.height / 2;
    var obj2_centerX = objet2.x + obj2_halfWidth;
    var obj2_centerY = objet2.y + obj2_halfHeight;
    var obj2_top = objet2.y;
    var obj2_left = objet2.x;
    var obj2_bottom = objet2.y + objet2.height;
    var obj2_right = objet2.x + objet2.width;

    // différence absolue entre les centre X et Y des deux objets
    var deltaX = obj1_centerX - obj2_centerX;
    var deltaY = obj1_centerY - obj2_centerY;

    // distance de contact = somme des moitiés des largeurs des deux objets 
    var contactX = obj1_halfWidth + obj2_halfWidth;
    var contactY = obj1_halfHeight + obj2_halfHeight;

    // compare distance avec la distance de contact
    // si contact
    if (Math.abs(deltaX) < contactX && Math.abs(deltaY) < contactY) {
        // distance de chevauchement (contact)
        var overlapX = contactX - Math.abs(deltaX);
        var overlapY = contactY - Math.abs(deltaY);
       
        if(objet1.type=='Player') objet2.use(objet1);
       
        if ((objet2 !== 0 && objet2.obstacle) || ( (objet1.name == "Item" || objet1.type == "Chest" || objet1.type == "Redchest" || objet1.type == "Bomb") && objet2.name == "Door")){

            if(overlapX >= overlapY) {
                // glissement du joueur sur les coins de block
                if (objet1.type == 'Player' && (keyW || keyS) && !keyA && !keyD) {
                    // pousser à droite
                    if (obj1_centerX > obj2_right - obj2_halfWidth / 2 && objet2.colRight) objet1.x += cornerfix;
                    // pousser à gauche
                    else if (obj1_centerX < obj2_left + obj2_halfWidth / 2 && objet2.colLeft) objet1.x -= cornerfix;
                }

                // collision haut
                if (deltaY > 0 && objet2.colUp) {
                    objet1.y += overlapY;
                    //console.log('overlapY: ' + Math.round(overlapY) + ' deltaY: ' + Math.round(deltaY));
                    return 'y';
                }
                // collision bas
                else if (objet2.colDown){
                    objet1.y -= overlapY;
                    // console.log('overlapY: ' + Math.round(overlapY) + ' deltaY: ' + Math.round(deltaY));
                    return 'y';
                }
            }
            else {

                // glissement du joueur sur les coins de block
                if (objet1.type == 'Player' && (keyA || keyD) && !keyS && !keyW) {
                    // pousser en bas
                    if (obj1_centerY > obj2_bottom - obj2_halfHeight / 2 && objet2.colDown) objet1.y += cornerfix;
                    // pousser en haut
                    else if (obj1_centerY < obj2_top + obj2_halfHeight / 2 && objet2.colUp) objet1.y -= cornerfix;
                }

                // collision gauche
                if (deltaX > 0 && objet2.colLeft) {
                    objet1.x += overlapX;
                    return 'x';
                }
                // collision droite
                else if (objet2.colRight){
                    objet1.x -= overlapX;
                    return 'x';
                }
            }
        }
        
    }
}

// détection de collision de dégats ( par rayon )
function hitDetection(objet1, objet2) {
    // créer l'objet vector
    var vector = {};
    // obj1
    var obj1_halfWidth = objet1.width / 2;
    var obj1_halfHeight = objet1.height / 2;
    var obj1_centerX = objet1.x + obj1_halfWidth;
    var obj1_centerY = objet1.y + obj1_halfHeight;

    // obj2
    var obj2_halfWidth = objet2.width / 2;
    var obj2_halfHeight = objet2.height / 2;
    var obj2_centerX = objet2.x + obj2_halfWidth;
    var obj2_centerY = objet2.y + obj2_halfHeight;

    // delta X et Y entre les objets
    vector.x = obj1_centerX - obj2_centerX;
    vector.y = obj1_centerY - obj2_centerY;

    // tracer l'hypothenuse
    vector.hyp = (vector.x * vector.x) + (vector.y * vector.y);
    var radius = (objet1.width + objet2.width) / 2;
    radius *= radius;
    if (vector.hyp <= radius) {
        if(objet1.type=='projectile') objet1.alive = false;
        if(objet2.type=='projectile') objet2.alive = false;
        objet1.contact = objet2;
        return true;
    }
    else return false; 
}

// placer nouvel object dans array et positionner
function createEntity(array, obj, x, y) {
    var o = new obj();

    // si array 2d
    if (typeof array[y] !== 'undefined' && typeof array[y][x] !== 'undefined') {
        array[y][x] = o;
        array[y][x].init(x * 64, y * 64);
    }

    // si array simple
    else {
        array.push(o);
        array[array.length - 1].init(x * 64, y * 64);
    }
}

// loop pour caller des méthodes sur chaque objets d'un array + array 2d
function arrayMethod(array, method, context) {
    for (var i = 0; i < array.length; i++) {
        // si array 2d
        if (typeof array[i] !== 'undefined' && typeof array[i][0] !== 'undefined') {
            for (var j = 0; j < array[i].length; j++) {
                // si draw, mettre context dans les arguments
                if (method == "draw") array[i][j].draw(context);
                else array[i][j][method]();
                if (!array[i][j].alive) array[i][j] = 0;
            }
        }
        // si array simple
        else {
            if (array[i] !== 0 && method == "draw") array[i][method](context);
            else if (array[i] !== 0) array[i][method]();
            if (!array[i].alive) array.splice(i, 1);
        }
    }
}

console.log('game.js LOADED.');
loading(true);