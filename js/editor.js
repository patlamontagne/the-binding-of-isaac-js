function getEl(id){ return document.getElementById(id);}
var editorMode = true;
var bossroom = false;
var enemycount = 0;
var normalroom = false;
var reward = false;
var Testing = false;
var testisReady = false;
var Select = "  ";
var items = ["HB","HC","HD","HE","HF","HG","HH","HI","HJ","HK","HL","HM","HN","HO","HP","HA","Bl","00","01","02","03","CC","RC","Fl","Af","Pf","Sp","Sb","Ma","Cl","To","Zo","Tg","Ts","Tf","Th","Tn","Oo","XY","X1","X3","X2"];
var grid = [
	["!!","!!","!!","!!","!!","!!","!!","+U","!!","!!","!!","!!","!!","!!","!!"],
	["!!","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","!!"],
	["!!","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","!!"],
	["!!","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","!!"],
	["+L","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","+R"],
	["!!","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","!!"],
	["!!","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","!!"],
	["!!","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","  ","!!"],
	["!!","!!","!!","!!","!!","!!","!!","+D","!!","!!","!!","!!","!!","!!","!!"]
];

function initEditor(){ 
	getEl("game").style.visibility = "hidden";
    var editor = getEl("editor"); // use HTML Span
    var holeselector = getEl("holeselector"); // use HTML Span
	var selector = getEl("selector"); // use HTML Span
	var br = document.createElement("br"); // creates br attribute
		//MAP
		for (var y = 0; y < 9; y++) { 
			for (var x = 0; x < 15; x++) { 
				var cell = document.createElement("div"); // nouveau div
					cell.setAttribute("id", y+"x"+x); // Assigne l'ID
					if(y==0 || y==8 ||	x==0 || x==14 || (y==1 && x==7) ||	(y==7 && x==7) || (y==4 && x==1) ||	(y==4 && x==13)	) cell.setAttribute("class", "wall"); //Si contour, cell Wall
					else cell.setAttribute("class", "cell"); //Sinon cell
					cell.setAttribute("width", 64); 
					cell.setAttribute("height", 64);
					if(y!=0 && y!=8 &&	x!=0 && x!=14){
						if((y==1 && x==7) ||	(y==7 && x==7) || (y==4 && x==1) ||	(y==4 && x==13)){}
						else {
							cell.setAttribute("style","background:url(icon/0.png);");}
					}
					if(y!=0 && y!=8 &&	x!=0 && x!=14){
						if((y==1 && x==7) ||	(y==7 && x==7) || (y==4 && x==1) ||	(y==4 && x==13)){}
						else {
							cell.setAttribute("onClick", "javascript:assign(Select," + y + "," + x + ");");
							cell.setAttribute("onContextmenu", "javascript:clearCell(" +y+ "," +x+ ");");}
					}
				editor.appendChild(cell); // HTML recoit l'élément
			}
		editor.appendChild(br); // HTML recoit br
		}
		//SELECTION
		for (var s = 0; s < items.length; s++) { 
			var selection = document.createElement("div"); // nouveau div
				selection.setAttribute("id", "choice"+s); // Assigne l'ID
				selection.setAttribute("class", "selection"); //Sinon cell
				selection.setAttribute("width", 64); 
				selection.setAttribute("height", 64);
				selection.setAttribute("style","background-image:url(icon/"+items[s]+".png);");
				selection.setAttribute("onClick", "javascript:choose("+s+");");
				selector.appendChild(selection); // HTML recoit l'élément
		}
		/*alert("                        Bienvenue dans l'outil créateur de salle !\n\n\n"+
			"COMMANDES : \n - Clic GAUCHE sur la liste pour choisir l'élément \n - Clic GAUCHE sur la grille pour poser l'élément \n - Clic DROIT sur la grille pour effacer la case \n\n\n"+
			"BOUTONS : \n - Appuyez sur TEST pour visualiser et essayer votre création \n - Appuyez sur EDIT pour revenir dans l'outil créateur \n - Appuyez sur RESET pour réinitialiser la grille \n\n\n"+
			"EXPORTER : \n - SAVE télécharge votre création sous forme de fichier texte \n - La zone de texte de droite détermine le nom du fichier \n\n\n"+
			"IMPORTER : \n - Copiez-collez le CODE COMPLET d'une sauvegarde dans la zone de texte de gauche \n et appuyez sur READ pour importer le code dans l'éditeur \n - Appuyez sur CLEAR pour vider la zone de texte");
	*/
	//print();
}

//Click gauche
function assign(code,y,x){
	if(!Testing){
		if((code == "X1" || code == "X3" || code == "X2") && (normalroom || bossroom)) alert("La salle ne peut contenir qu'un boss.");
		else if(code == "XY" &&  reward) alert("Il ne peut qu'avoir une seule récompense par salle");
		else if((
				code== "Fl" || code== "Af" ||
				code== "Pf" || code== "Sp" ||
				code== "Sb" || code== "Ma" ||
				code== "Cl" || code== "To" ||
				code== "Zo") && bossroom) alert("Aucun ennemi autre que le boss ne peut être présent dans cette salle");
		else {
			grid[y][x]=code;
			var getId = y+"x"+x;
			getEl(getId).style.backgroundImage = "url('icon/"+code+".png')";}
		scan();}
	//print();
}

//Click droit
function clearCell(y,x){
	if(grid[y][x] == "X1" || grid[y][x] == "X2" || grid[y][x] == "X3") bossroom = false;
	else if(grid[y][x] == "XY") reward = false;
	else if((
			grid[y][x]== "Fl" || grid[y][x]== "Af" ||
			grid[y][x]== "Pf" || grid[y][x]== "Sp" ||
			grid[y][x]== "Sb" || grid[y][x]== "Ma" ||
			grid[y][x]== "Cl" || grid[y][x]== "To" ||
			grid[y][x]== "Zo")) enemycount--;
			
	grid[y][x]="  ";
	var getId = y+"x"+x;
	getEl(getId).style.backgroundImage = "url('icon/0.png')";
	scan();
}

//Reset la carte
function erase(){
	bossroom = false;
	normalroom = false;
	reward = false;
	for(var y = 1; y < grid.length-1; y++){
		for(var x = 1; x < grid[y].length-1; x++){
			grid[y][x]="  ";
			assign(grid[y][x],y,x);
		}
	}
	bossroom = false;
	enemycount = 0;
	normalroom = false;
	reward = false;
}

//Scanne ce qui est disposé sur la carte
function scan(){
 enemycount = 0;
	for(var y = 1; y < grid.length-1; y++){
		for(var x = 1; x < grid[y].length-1; x++){
			if(grid[y][x]== "Fl" || 
			   grid[y][x]== "Af" ||
			   grid[y][x]== "Pf" ||
			   grid[y][x]== "Sp" ||
			   grid[y][x]== "Sb" ||
			   grid[y][x]== "Ma" ||
			   grid[y][x]== "Cl" ||
			   grid[y][x]== "To" ||
			   grid[y][x]== "Zo") {enemycount++;}
			if (grid[y][x]== "X1" ||
				grid[y][x]== "X2"||
				grid[y][x]== "X3") bossroom = true;
			if (grid[y][x]== "XY") reward = true;
		}
	}
	if(enemycount > 0) normalroom = true;
	else normalroom = false;
}

//Afficher le string sous forme html
function print(){
var gridprint = "";
	for (var y = 0; y < 9; y++) { 
		for (var x = 0; x < 15; x++) {
			if(x != 0 && x != 14 && y != 0 && y!=8)gridprint += '"'+grid[y][x]+'"'+",";
		}
		gridprint+= "<br/>";
	}
	getEl("gridlabel").innerHTML = gridprint;
}

//Crée le string à sauvegarder
function getCode(){
	var gridCode = "";
	gridCode += "[";
	for (var y = 0; y < 9; y++) { 
		gridCode += "[";
		for (var x = 0; x < 15; x++) {
			if(x==14) gridCode += '"'+grid[y][x]+'"';
			else gridCode += '"'+grid[y][x]+'"'+",";
		}
		if(y==8) gridCode+= "]";
		else gridCode+= "],";
	}
	gridCode+="]";
	return gridCode;
}

//Selection de l'élément
function choose(choice){
	Select = items[choice];
	getEl("active").style.backgroundImage = "url('icon/"+Select+".png')";
}

//Gestion du testeur / éditeur de carte
function launchTester(){
	if( !Testing && testisReady){
		Testing = true;
		getEl("active").style.visibility = "hidden";
		getEl("editor").style.visibility = "hidden";
		getEl("selector").style.visibility = "hidden";
		getEl("game").style.visibility = "visible";
		getEl("testbtn").value = "Edit";
		getEl("resetbtn").disabled = true;
		getEl("savebtn").disabled = true;
		getEl("txtfilename").disabled = true;
		getEl("txtinputgrid").disabled = true;
		getEl("clearbtn").disabled = true;
		getEl("readbtn").disabled = true;
		
		gameInit();
		lastChange = Date.now();}
	else if(Testing){
		Testing = false;
		getEl("active").style.visibility = "visible";
		getEl("editor").style.visibility = "visible";
		getEl("selector").style.visibility = "visible";
		getEl("game").style.visibility = "hidden";
		getEl("testbtn").value = "Test";
		getEl("resetbtn").disabled = false;
		getEl("savebtn").disabled = false;
		getEl("txtfilename").disabled = false;
		getEl("txtinputgrid").disabled = false;
		getEl("clearbtn").disabled = false;
		getEl("readbtn").disabled = false;
		testerReset();
		}
}

//Réset du testeur
function testerReset(){
	Player.alive =  true; 
	Player.hp = Player.maxhp;
	Player.soul = 0;
	Player.bombs = 1;
	gameOver = false;
	Player.canGetDamage= true;
}

//Sauvegarde du string sous forme de fichier texte
function save(){
	var filename = getEl("txtfilename").value;
	var stringtosave = getCode();
	var blob = new Blob([stringtosave], {type: "text/plain;charset=utf-8"});
	saveAs(blob, filename+".txt");
}

//Importer et transformer le string en array 2d
function readCode(){
	var result = [];
	var codeToRead = txtinputgrid.value;
	codeToRead = codeToRead.replace(/[\])}[{(]/g,''); //enleve (){}[]
	codeToRead = codeToRead.replace(/"/g,'')
	var subResult = codeToRead.split(","); 
	for(var i=0, t=0; i< 9 ; i++){
		result[i]=[];
		for(var j=0; j< 15 ; j++,t++){
		result[i].push(subResult[t]);
		assign(result[i][j],i,j);
		}
	}	
}

//Vider la boite texte d'importation
function clearTxt(){
	getEl("txtinputgrid").value = "";
	getEl("txtinputgrid").innerHTML = "";
}