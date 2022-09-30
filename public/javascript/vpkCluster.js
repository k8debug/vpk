/*
Copyright (c) 2018-2022 K8Debug

Permission is hereby granted, free of charge, to any person obtaining a copy of this software 
and associated documentation files (the "Software"), to deal in the Software without restriction, 
including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, 
and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, 
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial 
portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT 
LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, 
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

//----------------------------------------------------------
// build data for cluster tab
//----------------------------------------------------------


function buildClusterTable() {
	//$('#c3DFilter').prop('disabled',true);
	$('#cluster3DView').hide();
	$("#clusterDetail").show();
	$("#renderCanvas").html('');
	let html = clusterTabTable();
	$("#resourceProps").html('');
	$("#clusterDetail").html(html);
}

//----------------------------------------------------------
// build 3D data for cluster tab
//----------------------------------------------------------

function buildCluster3D() {
	//$('#c3DFilter').prop('disabled',false); 
	build3DJSON();
	$('#cluster3DView').show();
	build3DView();
	$("#resourceProps").html('')
}

function close3DFilter() {
	document.getElementById("clicker").checked = false;
	document.getElementById("filterPanel").style.width = "0px";
	document.getElementById("banner").style.marginLeft = "0px";
	document.getElementById("viewarea").style.marginLeft = "0px";

}

function filter3DView() {
	let boxChecked = $('#clicker').prop('checked');
	if (boxChecked) {
		document.getElementById("filterPanel").style.width = "0px";
		document.getElementById("banner").style.marginLeft = "0px";
		document.getElementById("viewarea").style.marginLeft = "0px";
		document.getElementById("clicker").checked = false;
	} else {
		document.getElementById("filterPanel").style.width = "340px";
		document.getElementById("banner").style.marginLeft = "340px";
		document.getElementById("viewarea").style.marginLeft = "340px";
		document.getElementById("clicker").checked = true;
	}
}

async function showSchematic(ns, fnum) {
	console.log(ns)
	console.log(fnum)
	let myPromise = new Promise(function (resolve, reject) {
		resolve(openNamespace(ns))
	});

	let cont = await myPromise;

	let tab = 'schematic';
	$('.nav-tabs a[href="#' + tab + '"]').tab('show');

	let element = document.getElementById("fnum-" + fnum);
	element.scrollIntoView();

}

//----------------------------------------------------------
// build table list data for cluster tab
//----------------------------------------------------------
function clusterTabTable() {
	let divSection = '<div class="events"><table style="width:100%">';
	let header1 = '<tr class="partsList"><th class="pt-1 pb-1 pr-1 pl-1">';
	let headerImg;
	let header2 = 'API Version</th><th>Kind</th><th>Resource Name</th></tr>';
	let nsHtml = '';
	let keys;
	let key;
	let k;
	let d;
	let hl;
	let item;
	let rtn = '';
	let name;
	let fnum;
	let parts;

	let api;
	let getDefFnum = 'getDefFnum';
	let getDefSec = 'getDefSec';
	let getD;
	let api4Hdr;
	let hdrImage;
	if (typeof k8cData['0000-clusterLevel'] !== 'undefined') {
		nsHtml = divSection;
		keys = Object.keys(k8cData['0000-clusterLevel']);
		keys.sort();

		for (k = 0; k < keys.length; k++) {
			key = keys[k];
			if (key === 'display' || key === 'CRB') {
				continue;
			}
			parts = k8cData['0000-clusterLevel'][key];
			api4Hdr = parts[0].api

			hdrImage = checkImage(key, api4Hdr);
			headerImg = '<img style="vertical-align:middle;" src="images/' + hdrImage + '" width="35" height="35" '
				+ ' onclick="getExplain(\'' + key + '\',\'' + api4Hdr + '\')">&nbsp;'

			nsHtml = nsHtml + header1 + headerImg + header2;

			let nArray = [];

			hl = parts.length;
			for (d = 0; d < hl; d++) {
				nArray.push(parts[d].name + '#@@#' + parts[d].fnum + '#@@#' + parts[d].api);
			}
			nArray.sort();
			parts = []
			for (d = 0; d < hl; d++) {
				let bits = nArray[d].split('#@@#');
				parts.push({ 'name': bits[0], 'fnum': bits[1], 'api': bits[2] });
			}

			for (d = 0; d < hl; d++) {
				name = parts[d].name;
				api = parts[d].api;
				fnum = parts[d].fnum;
				if (key === 'Secret') {
					getD = getDefSec;
				} else {
					getD = getDefFnum;
				}
				item = '<tr>'
					+ '<td width="25%"><span onclick="' + getD + '(\'' + fnum + '\')">' + api + '</td>'
					+ '<td width="25%"><span onclick="' + getD + '(\'' + fnum + '\')">' + key + '</td>'
					+ '<td width="50%"><span onclick="' + getD + '(\'' + fnum + '\')">' + name + '</td>'
					+ '</tr>';
				nsHtml = nsHtml + item
			}
		}
		rtn = nsHtml + '</table><hr></div>';

	}
	return rtn;
}



//----------------------------------------------------------
console.log('loaded vpkCluster.js');
