/*
Copyright 2018-2020 David A. Weilert

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


function buildClusterTab() {
    let html = clusterTabTable();
    $("#clusterDetail").html(html);
}


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
	if (typeof k8cData['0000-clusterLevel'] !== 'undefined'){
		nsHtml = divSection;
		keys = Object.keys(k8cData['0000-clusterLevel']);
		keys.sort();

		for (k = 0; k < keys.length; k++) {
			key = keys[k];
			if (key === 'display' || key === 'CRB' ) {
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
				nArray.push(parts[d].name+'#@@#'+parts[d].fnum+'#@@#'+parts[d].api);
			}
			nArray.sort();
			parts = []
			for (d = 0; d < hl; d++) {
				let bits = nArray[d].split('#@@#');
				parts.push({'name': bits[0], 'fnum': bits[1], 'api': bits[2]});
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