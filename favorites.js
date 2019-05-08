/* globals Tree */
'use strict';

var oWin, et;
var	structure=[{"name":"file 1","URL":"Test URL"},{"name":"file 2"},{"name":"Dossier","open":false,"type":"folder","selected":true,"children":[{"name":"file 1/1"},{"name":"file 1/2"},{"name":"folder 1/1","type":"folder","children":[{"name":"file 1/1"},{"name":"folder 1/1/1","type":"folder","children":[{"name":"folder 1/1/1/1","type":"folder","children":[{"name":"Test2","URL":""},{"name":"file 1/1/1/1/1"},{"name":"file 1/1/1/1/2"}]}]}]}]}]

var listItem = localStorage.getItem("pokeFavorites");
if (listItem)
	structure = JSON.parse(listItem);

class editTree{
	constructor(oTree, jsonTree){
	this.tree = new Tree(oTree, {
				  navigate: true // allow navigate with ArrowUp and ArrowDown
				});
	this.tree.on('created', (e, node) => {
	  e.node = node;
	});
	this.tree.json(jsonTree);
	}
   active(){
	   return this.tree.active();
   }
   removeItem(aNode){
	var aNode = this.tree.active();
	this.tree.removeNode(aNode);
	this.tree.removeItem();
	checkMenu();
   }
   editItem(action, fileFolder){
	var editItem = document.getElementById('editItem');
	var fi = document.getElementById('FeditItem');
	var URLzone = document.getElementById('URLzone');

	var el = this.tree.active();

	fi.txtCaption.value = (action == 1) ? el.node.name:"";
	fi.upd.value = (action == 1) ? 1:0;
	fi.type.value = 0;
	if (!this.tree.isFolder(el)){
		URLzone.style.display = "inherit";
		fi.txtURL.value = (action == 1) ? el.node.URL:"";
	}else{
		URLzone.style.display = "none";
	}
	if (fileFolder){	// New item
		if (fileFolder === 2){	//New file
			URLzone.style.display = "inherit";
			fi.txtURL.value = "";	
		}else{
			URLzone.style.display = "none";
		}
		fi.type.value = fileFolder;
	}
	var xy = getOffset(el);
	editItem.style.top = xy.top + "px";
	editItem.style.left = (xy.left) + "px";
	editItem.style.display = "inherit";
	fi.txtCaption.select();
	fi.txtCaption.focus();
	checkMenu();
	contextMenu();
   }
   moveItem(up){
	var itemToMove = this.tree.active();
	var n = itemToMove.node;
	this.tree.removeNode(itemToMove);
	var folderItem = this.tree.isFolder(itemToMove);
	if (folderItem){
		folderItem = itemToMove;
		itemToMove = itemToMove.parentNode;
	}
	if (up){this.tree.navigate('backward', true);	
	}else{this.tree.navigate('forward', true);
		this.tree.navigate('forward', true);}
	var before = this.tree.active();
	if (this.tree.isFolder(before))
		before = before.parentElement;
	before.parentElement.insertBefore(itemToMove, before); 
	//before.parentElement.after(itemToMove);
	var pos = Array.from(before.parentNode.children).indexOf(itemToMove);
	//console.log('  ADD pos = ' + pos );
	this.tree.addNode(before.parentNode, pos, n);
	if (folderItem)
		this.tree.focus(folderItem);
	else
		this.tree.focus(itemToMove);
   }
   addChildrens(oCh){
	var strJson = [];
	for (var i = 0; i < oCh.length ; i++){
		if (this.tree.isFolder(oCh[i])){
			if (oCh[i].node){
				strJson[strJson.length] = oCh[i].node;
	}}}
	return strJson;
   }
   readTree(){
	var strJson = [];
	if (this.tree.parent.children){
		var oCh = this.tree.parent.children;
		for (var i = 0; i < oCh.length ; i++){
			if (oCh[i].nodeName == "A")
				strJson[strJson.length] = oCh[i].node;
			if (this.tree.isFolder(oCh[i])){
				if (oCh[i].node){
					strJson[strJson.length] = oCh[i].node;
				}
			}
			if (oCh[i].nodeName == "DETAILS"){
				var d = this.addChildrens(oCh[i].children);
				strJson[strJson.length] = d[0];
			}	
		}
	}
	return strJson;
   }
   saveItem(name, url, type, upd, children){
	var it = {"name": name};
	if (type == 2)
		it.URL = url;

	if (upd == 1){	// Update
		var el = this.tree.active();
		el.node.name = name;
		if (!this.tree.isFolder(el))
			el.node.URL = url;
		el.innerHTML = name;
	}else{	// New item
		if (type == 1)	// New folder
			it.type = Tree.FOLDER;
			
			var aNode = this.tree.active();
			if (this.tree.isFolder(aNode)){
				aNode = aNode.parentNode;
				console.log('OPEN=' + aNode.open );
			}
			this.tree.navigate('forward');
			var nNode = this.tree.active();
			if (this.tree.isFolder(nNode))
				nNode = nNode.parentNode;
			var pos = Array.from(nNode.parentNode.children).indexOf(nNode);
			//199  details.open
			if ( (aNode.open && aNode.children.length == 1 ) || (aNode.parentElement.childNodes[aNode.parentElement.childNodes.length-1] == aNode ) || aNode == nNode){ //&& aNode == nNode
				pos = aNode.parentElement.childNodes.length+1;
				if (type == 2)
				var item = this.tree.file(it, aNode);
				else
				var item = this.tree.folder(it, aNode);
			}else{
				if (Array.from(aNode.parentNode.children).indexOf(nNode) != -1)
					aNode=aNode.parentElement;
				if (type == 2)			
				var item = this.tree.file(it, aNode, nNode);
				else
				var item = this.tree.folder(it, aNode, nNode);		
			}
			this.tree.addNode(aNode, pos, it);
			this.tree.focus(item);
	}
   }
}
// END class editTree


/*
tree.on('open', e => console.log('open', e));
tree.on('select', e => selectItem(e));
tree.on('action', e => doAction(e));
*/

//[{"name":"file 1","URL":"Test URL"},{"name":"file 2"},[{"name":"Dossier","open":false,"type":"folder","selected":true,"children":[{"name":"file 1/1"},{"name":"file 1/2"},{"name":"folder 1/1","type":"folder","children":[{"name":"folder 1/1/1","type":"folder","children":[{"name":"folder 1/1/1/1","type":"folder","children":[{"name":"file 1/1/1/1/1"},{"name":"file 1/1/1/1/2"}]}]}]}]},{"name":"file 1/1"},{"name":"file 1/2"},[{"name":"folder 1/1","type":"folder","children":[{"name":"folder 1/1/1","type":"folder","children":[{"name":"folder 1/1/1/1","type":"folder","children":[{"name":"file 1/1/1/1/1"},{"name":"file 1/1/1/1/2"}]}]}]},[{"name":"folder 1/1/1","type":"folder","children":[{"name":"folder 1/1/1/1","type":"folder","children":[{"name":"file 1/1/1/1/1"},{"name":"file 1/1/1/1/2"}]}]},[{"name":"folder 1/1/1/1","type":"folder","children":[{"name":"file 1/1/1/1/1"},{"name":"file 1/1/1/1/2"}]},{"name":"file 1/1/1/1/1"},{"name":"file 1/1/1/1/2"}]]]],[{"name":"folder 2 (asynced)","type":"folder","asynced":true}]]

function initTree(divTree){
	et = new editTree(divTree, structure);
	contextMenu(true);
}
//var et = new editTree(document.getElementById('tree'), structure);

function doAction(e){
	if (!window.opener){
		oWin = window.open("", "pokeNewWin", "location=0");
		//setTimeout(showPoke(), 3000);
	}
	oWin.location.href = e.node.URL;
	var x=5;
}

function selectItem(e){
//if (!tree.isFolder(e))

console.log('select', e);
}

function editItem(action, fileFolder){
	et.editItem(action, fileFolder)
}

function saveTree(){
	var strJson = et.readTree();
	checkMenu();
	console.log(JSON.stringify(strJson) );
	localStorage.setItem("pokeFavorites", JSON.stringify(strJson));
}

function moveItem(up){
	et.moveItem(up);
}

function saveFile(oF){
	et.saveItem(oF.txtCaption.value, oF.txtURL.value, oF.type.value, oF.upd.value);
	closeEdit();
}

function removeItem(aNode){
	et.removeItem();
}

function closeEdit(){
var editItem = document.getElementById('editItem');
editItem.style.display = "none";
contextMenu(true);
}

function checkMenu(){
var cMenu = document.getElementById('cMenu');
	if (cMenu.style.display == "inherit")
		cMenu.style.display = "none";
}

function onEdit(){
var editItem = document.getElementById('editItem');
	return (editItem.style.display == "inherit") ? true:false;
}

function contextMenu(on){
if (on){
	document.addEventListener("contextmenu", contextMenuFct);
}else{
	document.removeEventListener("contextmenu", contextMenuFct);
}
}

function contextMenuFct(ev){
var cMenu = document.getElementById('cMenu');
ev.preventDefault();
var el = et.active();
if (el){
	var xy = getOffset(el);
	cMenu.style.top = xy.top + "px";
	cMenu.style.left = (xy.left + el.offsetWidth) + "px";
	cMenu.style.display = "inherit";	
}
    return false	
}

//contextMenu(true);



