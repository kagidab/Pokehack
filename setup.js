GDIM = {y:11, x:19};
//Grid sizes, currently the actual grid doesn't adjust size automatically
//keeptheseodd

WALKMODE = 0; TALKMODE = 1; BATTLEMODE = 2; EATMODE = 3;
MAXDIM = 30;  //biggest dimensions of maps
MAXEXITS = 1000; //max total exits, need to change map structre if it needs to be bigger

LEFT = {y:0, x:-1}; RIGHT = {y:0, x:1}; UP = {y:-1, x:0};
DOWN = {y:1, x:0}; ZENITH = {y:0, x:0}; NOTADIR = {}; 
DIRS = [LEFT, RIGHT, UP, DOWN, ZENITH, NOTADIR]
KEY = {A:97, B:98, C:99, D:100, E:101, F:102, G:103,
	H:104, I:105, J:106, K:107, L:108, M:109, N:110,
	O:111, P:112, Q:113, R:114, S:115, T:116, U:117,
	V:118, W:119, X:120, Y:121, Z:122, PERIOD: 46, COMMA: 44,
		LESSTHAN: 60, GREATERTHAN: 62};

alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

at = new Array(MAXDIM); // holds current tiles for speedup
for(i=0; i < MAXDIM; i++){
	at[i] = new Array(MAXDIM);
}

function listinit(list, type){
	list.forEach(function(element, index){
		element.id = index;
		element.type = type; 
		element.fn = IMGDIR + element.fn;
	});
}

PLAYA = 0; NPC = 1; POKEMON = 2; ITEM = 3; TILE = 4;
ROOM = 5;
IMGDIR = "img/"
CURSORFN = IMGDIR + "cursor.png";
listinit(peeps, NPC);
listinit(pokemon, POKEMON);
listinit(items, ITEM);
listinit(tiles, TILE);
listinit(rooms, ROOM);

//I need to learn how JS OOP works...
function makeitem(type, map, position){
	newitem = {
		type: type.type, name : type.name, fn : type.fn,
		pos: position, nutrition: type.nutrition,
		itemtype: type.itemtype
	};
	map.items.push(newitem);
	return newitem;
}

exitrs = new Array(MAXEXITS); //Which room is each exit 
exitps = new Array(MAXEXITS); //xandy of each exit
rooms.forEach( function(room, roomid) {
	room.dim = {y: room.map.length, x: room.map[0].length};
	if(room.npcs == undefined) room.npcs=[];
	if(room.defitems == undefined) room.items=[];
	else {
		room.items = [];
		room.defitems.forEach(function(element, index){
			newitem = makeitem(element.itemtype, room, element.pos);
			if(element.name != undefined) newitem.name = element.name;
			if(element.contains != undefined){
				newitem.contains = element.contains;
			  newitem.lev = element.lev;
				newitem.newpok = true;
			}
		});
	}
	room.map.forEach( function(row, rid) {
		row.forEach( function(element, cid) {
			if(room.map[rid][cid] > 1e6){ //awful exithack 
				id1 = Math.floor((element % 1e6) / 1000);
				exitrs[id1] = roomid;
				exitps[id1] = {y : rid, x : cid};
			}
		});
	});
});

RED.type = PLAYA; 

tiles.forEach(function(element){ //default constructor ??
	if(element.walk == undefined) element.walk = false;
	if(element.exit == undefined) element.exit = false;
	if(element.hide == undefined) element.hide = false;
	if(element.blink == undefined) element.blink = false;
	if(element.danger == undefined) element.danger = false;
	if(element.jumpd == undefined) element.jumpd =-1;
});

bigstring="";
grids = new Array(GDIM.y);
gridimgs= new Array(GDIM.y);
for(i=0;i<GDIM.y;i++){
	grids[i] = new Array(GDIM.x);
	gridimgs[i] = new Array(GDIM.x);
	for(j=0;j<GDIM.x;j++){ //dothisproperly
		grids[i][j] = "ge"+i+"x"+j;
		bigstring +=	"<div class='ge' id='"+grids[i][j]+"'> </div>";
		grids[i][j] = '#' + grids[i][j];
		gridimgs[i][j] = grids[i][j]+" img"; //to avoid a bunch of strcatslater
	}
}

$("#grid").html(bigstring);
$(".ge").append("<img src='dot.png'></img>");

//zero some other stuff 
turns = 0; 
mode = WALKMODE; //movingmode
itemnum = 0;
hunger = 300;
p1.inventory=[];