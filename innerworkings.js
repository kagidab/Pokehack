// To implement: 
// mostly just need to fix move learning for RC
// saving makes things too easy, activate singlesave
// put in endzone
// flesh out typechart
//
// battles
// 	-droppings?
// story
// items doing stuff
// more OOP!
// trainer battles
// mapmaking could be better
//
// TOFIX: 
// hiding is a bit awkward, don't want NPCs appearing on rooftops
// 	currently not actually relevant... OK fix is to make HIDEALL and HIDESOME tags
// animations unsync =/
// Can walk through Reds house from top side, can't think of a easy/good way to fix
// exits are funky... everything is tho
//

newgame("Welcome!");
function newgame(message){
	resetthings(Math.floor(1e7*Math.random()));
	charout = p1; 
	changeroom(STARTINGROOM, STARTINGPOS); 
	output("#bug0", message);
}

$("body").keydown(function(event){
	bugspray();
	//console.log(event);
	key = event.key;
	keyn = event.keyCode;
	dir = keytodir(keyn, key);
	console.log(dir)
	//console.log(key);
	if(mode == WALKMODE){ walking(keyn, key, dir); } 
	else if(mode == EATMODE){ eat(keyn, key); } 
	else if(mode == TALKMODE){ chat(dir); mode = WALKMODE;
	} else if(mode == BATTLEMODE){
		if(anykey) {
			$("#grid").removeClass("blinkonceforyes"); 
			anykey = false;
			update();
			fightmenu = NORMALMENU;
			fightingmessage(true);
		} else demsbefightinkeys(keyn);
	} else if(mode == GETMODE) getzeitems(keyn, key); 
	else if(mode == DROPMODE); //dropitem(key); 
	else if(mode == USEMODE);// useitem(key); 
	else if(mode == POKEMODE);//checkpoke(key); 
});

function walking(key, keyc, dir){
	bugspray();
	if(dir != NOTADIR){ movebutt(dir); } 
	else if(keyc == "<" || keyc == ">"){ exit(); } 
	else if(key == KEY.T){ mode = TALKMODE; output("#bug0", "Talk to whom?");
	} else if(keyc == ","){ getitems(); }
	else if(key == KEY.E){ changetomode(EATMODE); }
	else if(key == KEY.P);//{ changetomode(POKEMODE); }
	else if(key == KEY.I);//{ changetomode(USEMODE); }
	else if(key == KEY.D);//{ changetomode(DROPMODE); }
	else if(key == KEY.S){ savegame();}
	else if(key == KEY.R){ restoregame();}
	else if(key == KEY.W){ passtime(10);}
	else if(key == KEY.Q){ passtime(100);}
}

function listonseverallines(list){
	string = "";
	list.forEach(function(element, index){
		string += "("+alphabet[index] + ") " + element + "<br>";
	});
	return string;
}

function pagebypage(list, page){
	output("#bug1", "");
	for(i = 0; i < ITEMSPERPAGE; i++){
		if(i + page * ITEMSPERPAGE >= list.length) break;
		if(i > 0) output("#bug1", "<br>", 1);
		output("#bug1", "(" + alphabet[i] + ")" + list[page*ITEMSPERPAGE + i], 1);
	}
	output("#bug2", "");
	if(page != 0) output("#bug2", "(<) Prev ")
		if((page + 1) * ITEMSPERPAGE < list.length) output("#bug2", "(>) Next")
}

function listpokemon(){
	listofpoke = listpoke();
	if(listofpoke.length != 0){
		output("#bug0", "Check out which Pokemon?");
		output("#bug1", listonseverallines(listofpoke));
	} else {
		output("#bug0", "No Pokemon");
		mode = WALKMODE;
	}
}

function savegame(){
	output("#bug0", "Game saved... jk");
	$.jStorage.set("playerroom", curroom.id);
	$.jStorage.set("seedy", originalseed);
	$.jStorage.set("saveexists", true);
	$.jStorage.set("turnnumber", turns);
	deflatepokemon(p1.inv.balls);
	roomitems = [];
	rooms.forEach( function(element){
		deflatepokemon(element.items);
		roomitems.push(element.items);
		//console.log(element.items);
	});
	$.jStorage.set("playersave", p1);
	$.jStorage.set("roomitems", roomitems);
	inflatepokemon(p1.inv.balls);
	rooms.forEach( function(element){
		inflatepokemon(element.items);
	});
}

function deflatepokemon(list){
	for(i=0; i < list.length; i++){
		if(list[i].contains != undefined){
		//console.log(list[i].contains);
			next = list[i].contains;
			shortform = {id: next.id, xp: next.xp, level: next.level, hp: next.curhp, moves: []};
			for(j = 0; j < next.moves.length; j++){
				shortform.moves.push(next.moves[j].id);
			}
			list[i].contains = shortform;
			//console.log(shortform.moves);
		}
	}
}

function inflatepokemon(list){
	for(i = 0; i < list.length; i++){
		infl = items[list[i].id].copy(list[i].pos, list[i].room);
		infl.name = list[i].name;
		infl.contains = list[i].contains;
		infl.pos = list[i].pos;
		if(infl.contains != undefined){
			nextt = infl.contains;
			inflated = pokemon[nextt.id].copy({}, nextt.level);
			inflated.xp = nextt.xp; inflated.curhp = nextt.hp;
			inflated.moves = new Array(nextt.moves.length);
			for(j=0; j< nextt.moves.length; j++){
				inflated.moves[j] = moves[nextt.moves[j]];
			}
			inflated.ballref = infl;
			infl.contains = inflated;
		}
		list[i] = infl;
		//console.log(infl);
	}
}

function restoregame(){
	output("#bug0", "Game restored... jk");
	restp1 = $.jStorage.get("playersave");
	//console.log(restp1.inv.balls[0].contains.moves);
	restroom = $.jStorage.get("playerroom");
	roomitems = $.jStorage.get("roomitems");
	//rooms = $.jStorage.get("rooms");
	//restrooms = $.jStorage.get("rooms");
	p1 = RED.copy({x: 3, y:4}, restp1.level);
	p1.type = PLAYA;
	p1.dpos = {x: 3, y: 4};
	p1.hunger = restp1.hunger;
	p1.phrases = ["I'm so alone"];
	p1.inv = restp1.inv;
	p1.doge = restp1.doge;
	p1.seentotal = restp1.seentotal;
	p1.ownedtotal = restp1.ownedtotal;
	p1.pos = restp1.pos;
	p1.xp = restp1.xp;
	p1.seen = restp1.seen;
	p1.owned = restp1.owned;
	inflatepokemon(p1.inv.usable);
	inflatepokemon(p1.inv.food);
	inflatepokemon(p1.inv.balls);
	rooms.forEach( function(element, index){
		element.items = roomitems[index];
		inflatepokemon(element.items);
		//console.log(element.items);
	});
	charout = p1;
	//for(i = 0; i < pokemon.length; i++){
	//	p1.seen[i] = restp1.seen[i];
	//	p1.owned[i] = restp1.owned[i];
	//}
	curroom = rooms[restroom];
	savegame();//fixes weird problems with storage..

	update();
}

function keytodir(keyn, keyc){
	if(keyn == KEY.H || keyn == KEY.LEFT) return LEFT;
	if(keyn == KEY.J || keyn == KEY.DOWN) return DOWN;
	if(keyn == KEY.K || keyn == KEY.UP) return UP;
	if(keyn == KEY.L || keyn == KEY.RIGHT) return RIGHT;
	if(keyn == KEY.Y || keyn == KEY.HOME) return UPLEFT;
	if(keyn == KEY.U || keyn == KEY.PAGEUP) return UPRIGHT;
	if(keyn == KEY.B || keyn == KEY.END) return DOWNLEFT;
	if(keyn == KEY.N || keyn == KEY.PAGEDOWN) return DOWNRIGHT;
	if(keyc == '.') return ZENITH;
	return NOTADIR;
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

function update(lookatmeimanargument){
	statusupdate();
	if(mode == WALKMODE && !lookatmeimanargument){
		hunt = thingsat(curroom.items, p1.pos);
		if(hunt.length > 0){
			string = "You see here: ";
			hunt.forEach(function(element, index){
				if(index > 0) string += ", ";
				string += "A " + element;
			});
			output("#bug1", string);
		}
	}
	drawmap();
}

function drawmap(){
	$("#cursor").remove();
	for(ii = 0; ii < GDIM.y; ii++){
		for(jj = 0; jj < GDIM.x; jj++){
			drawsquare({y: ii, x: jj});
		}
	}
}

//fixmagicalnumbers
function howhungryami(){
	if(p1.hunger > 1000) return {message: "Satisfied", affectstats: 0};
	if(p1.hunger < 100) return {message: "Weak", affectstats: -4};
	if(p1.hunger < 300) return {message: "Hungry", affectstats: -2};
	else return {message: "", affectstats: 0};
}

function statusupdate(){
	output("#status11",  charout.name); // title?
	output("#status12", "At:" + charout.att + " Df:" + 
			charout.def + " Sp:" + charout.spd + " Sc:" + charout.spc +
			" Own:" + p1.ownedtotal + "(" + p1.seentotal + ")");
	output("#status2", curroom + " &ETH:" + p1.doge + " HP:" + charout.curhp +
			"("+ charout.maxhp + ") Exp:" + charout.level + "(" + xptogo(charout) +
			") T:" + turns + " ");
	output("#status2", howhungryami().message + " ", 1);
	output("#status2", charout.howareyou() + " ", 1);
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
	if(curroom.heightmap != undefined && ap(curroom.heightmap, ijda) > ap(curroom.heightmap, p1.pos)
			&& distance(ijda, p1.pos) > LINEOFSIGHT){
		toohigh = true; //#420blazin
	} else toohigh = false;
	if(inbounds(ijda) && !toohigh){ 
		$(ap(gridimgs,pos)).show();
		newtile = tileat(ijda);

		peepat = checkforthings(ijda); 
		hunt = thingsat(curroom.items, ijda);
		hideme = peepat == p1 && newtile.hide && hunt.length == 0 && mode != BATTLEMODE;
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

function thingsat(list, pos){
	rlist = [];
	list.forEach(function(element){
		if(equpos(element.pos, pos)) rlist.push(element);
	});
	return rlist;
}

function checkforthings(pos){
	if(equpos(p1.pos, pos)) return charout; 

	if(mode == BATTLEMODE && equpos(pos, encpok.pos)) return encpok;

	npccheck = thingsat(curroom.npcs, pos);
	if(npccheck.length > 0) return npccheck[0];

	itemcheck = thingsat(curroom.items, pos);
	if(itemcheck.length > 0) return itemcheck[0];

	return null;
}

function checktile(nexttile, pos, dir){
	if(nexttile.danger){
		if(randI(0, 5) == 0){ //encounter chance
			wildmon(pos);
			encpok.checkifseen(false);
			return true;
		}
	} else if(nexttile.exit){
		p1.pos = pos; exit(); return true;
	} else if(nexttile.jumpd != -1 && equpos(DIRS[nexttile.jumpd], dir)){  //to avoid this, can change data structure to LEFT, RIGHT, etc
		tryjump(nexttile, dir, pos); return true;
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
	op = {y:peep.pos.y, x:peep.pos.x};
	np = addpos(peep.pos, dir);

	if(!inbounds(np)) return false; 
	nexttile = tileat(np);
	things = checkforthings(np); 

	if(peep == p1){
		//could use object instead of direction
		if(things != null && things.type == NPC) chat(dir); 
		else if(checktile(nexttile, np, dir)) return !equpos(peep.pos, op); //special things eg jump
	}  

	if((things == null || things.type == ITEM) && nexttile.walk) {
		peep.pos = np; 
		return true;
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
	if(!equpos(dir, ZENITH)){ //solving invisible bugs
		if(move(p1, dir)) passtime(1);
	} else passtime(1);
}

function passtime(timetopass){
	for(i = 0; i < timetopass; i++) {
		if(p1.hunger < 100 && timetopass > 1){
			output("#bug0", "You are too hungry to just sit around");
			break;
		}
		turns++;
		p1.hunger--;
		hungercheck = howhungryami().affectstats;

		if(hungercheck != hungerstatus){
			p1.att -= hungerstatus - hungercheck; p1.def -= hungerstatus - hungercheck;
			p1.spd -= hungerstatus - hungercheck; p1.spc -= hungerstatus - hungercheck;
			hungerstatus = hungercheck;
		}
		if(turns % REGENTIME == 0) {
			p1.regen();  
			if(p1.curhp <= 0) playerdeath(); 
			listpoke().forEach(function(element){
				element.regen();
				if(element.curhp <= 0) pokedeath(0, element, 2); 
			});
		}
		dancenpcdance();
	}
	update();
	if(p1.hunger <= 0) { // if hunger gets changed anywhere else moveme/copyme
		playerdeath();
	}
}

function playerdeath(){
	bugspray();
	newgame("You dead");
}

//append is an optional flag, appends if true
function output(divname, message, append){ 
	if(append) { $(divname).append(message); }
	else{ $(divname).html(message); }
}

function chat(dir){
	chkp = addpos(p1.pos, dir);
	thing = checkforthings(chkp);
	if(thing != null && (thing.type == NPC || thing.type == PLAYA)){
		output("#bug0", thing +": "+ justanyol(thing.phrases));
	}
}

function bugspray(){//removes bugs
	$(".bugs").html("");
}
