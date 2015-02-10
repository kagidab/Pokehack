// To implement: 
// owning pokemon
// 	-levelling
// 	-evolve
// pokemon types
// proper battles
// 	-implement moves 
// 	-better droppings
// stats
// hunger actually doing stuff
// story
// soo much data entry
// items doing stuff
// feeling the need for some OOP, making instances would be nice 
// I can probably get away with just copying the things in data
// trainer battles
// idk how much data you can actually save...
// it might actually be an issue
// Also, I should try to be clear which things actually change
// E.g. I'm keeping Red's stats in the variable from the data file
//
//Split into more files maybe
//
//
// TOFIX: 
// hiding is a bit awkward, don't want NPCs appearing on rooftops
// animations unsync =/
// Can walk through Reds house from top side, can't think of a easy/good way to fix
// More than 26 items is an issue

changeroom(BEDROOM, {y:4, x:3}); //in newgame()... rename STARTINGROOM, STARTINGPOS

$("body").keypress(function(event){
	bugspray();
	key = event.which;
	//console.log(key);
	//console.log(mode);
	dir = keytodir(key);
	if(mode == WALKMODE){ walking(key); } 
	else if(mode == EATMODE){ eat(key); } 
	else if(mode == TALKMODE){
		chat(dir);
		mode = WALKMODE;
	} else if(mode == BATTLEMODE){
		if(anykey) {
			$("#grid").removeClass("blinkonceforyes"); 
			anykey = false;
			startfight();
		} else demsbefightinkeys(key);
	}
});

function walking(key){
	bugspray();
	if(dir != NOTADIR){ movebutt(dir); } 
	else if(key == KEY.LESSTHAN || key == KEY.GREATERTHAN){ exit() } 
	else if(key == KEY.T){
		mode = TALKMODE; output("#bug0", "Talk to whom?");
	} else if(key == KEY.COMMA){ getitems(); }
	else if(key == KEY.E){ listedibles(); }
	else if(key == KEY.P){ listpokemon(); }
	else if(key == KEY.I){ listitems(); }
	else if(key == KEY.S){ savegame();}
}

function listitems(){
}

function listpokemon(){
	items.forEach(function(item){
	});
}
function savegame(){
	output("#bug0", "Game saved... jk");
}


function getitems(){ 
	string = "You get: "; count = 0;
	for(i = curroom.items.length - 1; i >= 0; i--){
		if(equpos(curroom.items[i].pos, p1.pos)){
			nextitem = curroom.items.splice(i,1)[0];
			if(count > 0) string += ", ";
			string += "A " + nextitem.name;
			p1.inventory.push(nextitem);
			count++;
		}
	}
	if(count == 0) string = "Nothing here";
	output("#bug0", string);
	update();
}

function listedibles(){
	mode = EATMODE;
	count=0;
	string = "Eat what?";
	p1.inventory.forEach(function(element, index){
		if(element.itemtype == FOOD){
			string += "<br>("+alphabet[count]+") " + element.name;
			count++;
		}
	});
	if(count==0) {
		string = "You have nothing to eat";
		mode = WALKMODE;
	}
	output("#bug0", string);
}

function eat(key){
	index = key - KEY.A;
	count=0;
	output("#bug0", "You can't eat that");
	p1.inventory.forEach(function(element, ind){
		if(element.itemtype == FOOD){
			if(count == index){
				itemtoeat = p1.inventory.splice(ind, 1)[0];
				output("#bug0", "You eat a " + itemtoeat.name + ". Nom nom");
				hunger += itemtoeat.nutrition;
			}
			count++;
		}
	});
	mode = WALKMODE;
	update();
}

function keytodir(keyn){
	if(keyn == KEY.H) return LEFT;
	if(keyn == KEY.J) return DOWN;
	if(keyn == KEY.K) return UP;
	if(keyn == KEY.L) return RIGHT;
	if(keyn == KEY.PERIOD) return ZENITH;
	return NOTADIR;
}

//for accessing all those 2d arrays
function ap(array, pos){
	return array[pos.y][pos.x];
}

//uncertain how function if GXGY even
//Used for finding the placement of the top left square
function findtl(pxorpy, max, len){
	if(max < len) return Math.floor((max-len+1)/2);
	if(pxorpy<(len-1)/2) return 0;
	if(pxorpy > max-(len+1)/2) return max-len;
	return pxorpy - (len-1)/2;
}

function startpos(post){
	val={
		y: findtl(post.y, curroom.dim.y, GDIM.y),
		x: findtl(post.x, curroom.dim.x, GDIM.x)};
	return val;
}

function update(){
	statusupdate();
	hunt = thingsat(curroom.items, p1.pos);
	if(hunt.length > 0){
		string = "You see here: ";
		hunt.forEach(function(element, index){
			if(index > 0) string += ", ";
			string += "A " + element.name;
		});
		output("#bug1", string);
	}
	drawmap();
}

function drawmap(){
	$("#cursor").remove();
	for(ii=0;ii<GDIM.y;ii++){
		for(jj=0;jj<GDIM.x;jj++){
			drawsquare({y:ii, x:jj});
		}
	}
}

function statusupdate(){
	output("#status11", "Red, Pokemon Trainer");
	output("#status12", "St:" + p1.str + " Df:" + p1.def);
	output("#status2", curroom.name + " &ETH:" + p1.doge + " HP:"+p1.curhp +
			"("+ p1.maxhp + ") Exp:"+p1.exp+ " T:"+turns+ " Hunger:" + hunger);
}

function exitdest(pos){
	return Math.floor(ap(curroom.map,pos) % 1e3);
}

function tileat(pos){
	if(ap(curroom.map, pos) > 1e6) 
		return tiles[Math.floor(ap(curroom.map,pos)/1e6)];
	return tiles[ap(curroom.map,pos)];
}

function drawsquare(pos){
	ijda = addpos(startpos(p1.pos), pos);// pos is position on grid, ijda is on map
	if(inbounds(ijda)){ 
		$(ap(gridimgs,pos)).show();
		newtile = tileat(ijda);

		peepat = checkforthings(ijda); 
		hunt = thingsat(curroom.items, ijda);
		hideme = peepat == p1 && newtile.hide && hunt.length == 0;
		if(peepat != null && !hideme) newtile = peepat;

		if(newtile.type == TILE && newtile.blink) $(ap(gridimgs,pos)).addClass("blinking");
		else $(ap(gridimgs, pos)).removeClass("blinking");

		if(ap(at, pos) != newtile){
			$(ap(gridimgs,pos)).attr("src", newtile.fn);
			at[pos.y][pos.x] = newtile;
		}
		if(hideme) blinky(pos);
	} else $(ap(gridimgs,pos)).hide(); //OOB
}


//may be able to do withoutthis
//currently only needed for blinky
function blinky(pos){ 
	$(ap(grids, pos)).append("<img id='cursor' class='blinking' src='"+CURSORFN+"'></img>");
}

//moves around npcs
function dancenpcdance(){
	curroom.npcs.forEach(function(element){
		if(!element.stat && randI(0,4)==0){
			move(element, DIRS[randI(0, 3)]);
		}
	})
}

//no longer strictly necessary
//it resets npc positions, which is maybe useful 
function placenpcs(){
	curroom.npcs.forEach(function(element){ element.pos = element.dpos; })
}

//use exit
function exit(){
	if(tileat(p1.pos).exit){ 
		exitid = exitdest(p1.pos);
		changeroom(rooms[exitrs[exitid]], exitps[exitid]);
	}
}

function changeroom(newroom, newpos){
	curroom = newroom;
	p1.pos = newpos;
	placenpcs();
	update();
}

function randI(lo, hi){ //random int [lo, hi]
	return lo + Math.floor(Math.random()*(1+hi-lo));
}


//check if two positions are the same
function equpos(pos1, pos2){
	return pos1.y==pos2.y && pos1.x==pos2.x;
}

function addpos(pos1, pos2){
	return {y: pos1.y + pos2.y, x: pos1.x + pos2.x};
}

function thingsat(list, pos){
	rlist = [];
	list.forEach(function(element){
		if(equpos(element.pos, pos)) rlist.push(element);
	});
	return rlist;
}

function checkforthings(pos){
	if(equpos(p1.pos, pos)) return p1; 

	if(mode == BATTLEMODE && equpos(pos, encpok.pos)) return encpok;

	npccheck = thingsat(curroom.npcs, pos);
	if(npccheck.length > 0) return npccheck[0];

	itemcheck = thingsat(curroom.items, pos);
	if(itemcheck.length > 0) return itemcheck[0];

	return null;
}


function newmon(type, level, position){
	newpoke = {
		type : type.type, name: type.name, fn: type.fn,
		level: level, curhp: type.hp*level, maxhp: type.hp*level,
		att: type.att*level, def:type.def*level, spc:type.spc*level,
		spd:type.spd*level, pos: position
	};
	return newpoke;
}

function checktile(nexttile, pos, dir){
	if(nexttile.danger){
		if(randI(0, 5) == 0){ //encounter chance
			wildmon(pos);
			return true;
		}
	} else if(nexttile.exit){
		p1.pos = pos; exit(); return true;
	} else if(nexttile.jumpd != -1 && equpos(DIRS[nexttile.jumpd], dir)){ 
		tryjump(nexttile, dir, pos);
	}
	return false; //nothing to stop movement
}

function tryjump(nexttile, dir, pos){
	newpos = addpos(pos, dir);
	things = checkforthings(newpos);
	if(things == null || things.type == ITEM){
		p1.pos = newpos;
	}
}

function move(peep, dir){ 
	np = addpos(peep.pos, dir);

	if(!inbounds(np)) return; 
	nexttile = tileat(np);
	things = checkforthings(np); 

	if(peep == p1){
		//could use object instead of direction
		if(things != null && things.type == NPC) chat(dir); 
		else if(checktile(nexttile, np, dir)) return; //dontmove
	}  

	if((things == null || things.type == ITEM) && nexttile.walk) {
		peep.pos = np; 
	}
}

//checks if pos is within bounds of current room
function inbounds(pos){ 
	topl = {y : 0, x : 0};
	botr = {y : curroom.dim.y, x : curroom.dim.x};
	if(pos.y < topl.y || pos.x < topl.x || pos.y >= botr.y || pos.x >= botr.x) return false;
	return true;
}

function movebutt(dir){
	if(dir != ZENITH) //not moving might cause problems
		move(p1, dir);
	passtime(1);
}

function passtime(timetopass){
	for(i = 0; i < timetopass; i++) {
		turns++;
		hunger--;
		dancenpcdance();
	}
	update();
}

function justanyol(thing){
	return thing[randI(0, thing.length-1)];
}

//This is actually longer than just typing it out each time...
//I guess I might need to modify it
function output(divname, message){ 
	$(divname).html(message);
}

function chat(dir){
	chkp = addpos(p1.pos, dir);
	thing = checkforthings(chkp);
	if(thing != null && (thing.type == NPC || thing.type == PLAYA)){
		output("#bug0", thing.name +": "+ justanyol(thing.phrases));
	}
}

function bugspray(){//removes bugs
	$(".bugs").html("");
}