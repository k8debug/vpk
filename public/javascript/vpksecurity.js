/*
Copyright 2018 Dave Weilert

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
// build svg data from returned data
//----------------------------------------------------------
let oldSecNS = '@';
let secFirst = true;
let secBreakID = 100;
let secBldCnt = 0;
let secRData = '';

function initVars() {
    oldSecNS = '@';
    secFirst = true;
    secBreakID = 100;
	secBldCnt = 0;
	secRData = '';
}

function security() {
	let cLevel = '';
	//Clear and initialize the variables
	initVars();
	//Clear the browse DOM elements
    $("#securityDetail").hide();
    $("#securityDetail").empty();
    $("#securityDetail").html('');

	//Build the RBAC lists
	let html = buildRBACs();	

	//If no images were built display message to inform user
	if (secBldCnt === 0) {
		html = '<div class="vpkfont"><br><p>No RBAC lists generated for the selected datasource</p></div>'
	}

	//Update the browser DOM
	$("#securityDetail").html(cLevel + html);
    $("#securityDetail").show();
}


//
function buildRBACs() {
	let rdata = '';
	let keys = Object.keys(k8cData);
	let newKeys = [];
	let newKey;
	let breakData;
	let secKey;
	let breakColor;
	let breakKey;
	for (let p = 0; p < keys.length; p++) {
		newKey = keys[p];
		if (newKey.startsWith('0000-') ) {
			newKeys.push({'namespace': k8cData[newKey].namespace, 'fnum': newKey} );
		} 
	}	

    // sort by namespace & kind
    newKeys.sort((a, b) => (a.namespace > b.namespace) ? 1 : (a.namespace === b.namespace) ? ((a.fnum > b.fnum) ? 1 : -1) : -1 );

	// clear the old unsorted keys
	keys = [];  

	// build new sorted array: keys
	for (let t = 0; t < newKeys.length; t++) {
		newKey = newKeys[t].fnum;
		keys.push(newKey);
	}

	// process data 
	for (let k = 0; k < keys.length; k++) {
		secKey = keys[k];
		secBldCnt++  // increment counter
		breakKey = secKey;
		if (breakKey === '0000-clusterLevel') {
			continue;
		}
		if (breakKey === '0000-@subjects@') {
			breakKey = '&lt;Cluster Level&gt;&nbsp;&nbsp;&nbsp;RoleBinding Subjects'
			breakColor = 'btn-secondary'
		} else if (breakKey === '0000-@clusterRoles@') {
			breakKey = '&lt;Cluster Level&gt;&nbsp;&nbsp;&nbsp;Roles'
			breakColor = 'btn-secondary'
		} else if (breakKey === '0000-@clusterRoleBinding@') {
			breakKey = '&lt;Cluster Level&gt;&nbsp;&nbsp;&nbsp;ClusterRoleBinding'
			breakColor = 'btn-secondary'
		} else {
			breakKey = breakKey.substring(5);
			breakColor = 'btn-primary'
		}

		if (secKey !== oldSecNS) {
			oldSecNS = secKey;
			secBreakID++;
			if (secFirst) {
				secFirst = false;
				rdata = rdata + '<span class="breakBar vpkcolor"><hr>' 
				+ '&nbsp;&nbsp;Press the buttons below to show or hide the RBAC information for the listed namespaces or cluster level' 
				+ '<hr><span>';
			} else {
				rdata = rdata + '</div>'
			}
			// output the break bar
			breakData = 
			  '<div class="breakBar"><button type="button" ' 
			+ ' class="btn ' + breakColor + ' btn-sm vpkButtons" data-toggle="collapse" data-target="#collid-' 
			+ secBreakID + '">&nbsp;&nbsp;' + breakKey + '&nbsp;&nbsp;</button>'
			+ '&nbsp;&nbsp;<hr></div>'
			+ '<div id="collid-' + secBreakID + '" class="collapse">';

			let nsWide = secNSChange(oldSecNS);

			rdata = rdata + breakData + nsWide;
		}
	}
	rdata = rdata + '</div>'
	return rdata
}

function secNSChange(ns) {
	let rtn = '';
	let bRoles = buildRoles(ns);
	if (typeof bRoles !== 'undefined') {
		rtn = rtn + bRoles;
		bRoles = null;
	}

	let bBindings = buildRoleBindings(ns);
	if (typeof bBindings !== 'undefined') {
		rtn = rtn + bBindings;
		bBindings = null;
	}

	let subsData = buildSubjects(ns);
	if (typeof subsData !== 'undefined') {
		rtn = rtn + subsData;
		subsData = null;
	}
		
	return rtn;
}

function parseArray(data) {
	nData = '';
	if (typeof data === 'undefined' || data === '' || data === 'null' || data === null) {
		return nData;
	}

	for (let i = 0; i < data.length; i++) {
		if (data[i] === '') {
			nData = nData + '&lt;blank&gt;<br>';
		} else {
			nData = nData + data[i] + '<br>'; 
		}
	}
	return nData;
}




//Build list of ServiceAccounts
// function buildSA(ns) {
	
// 	let nsKey = '0000-' + ns;
// 	// check if there are any role entries to process
// 	if (typeof k8cData[nsKey].ServiceAccount === 'undefined') {
// 		return
// 	}
// 	partsCnt++;
// 	let partsBar = '<div class="partsBar"><button type="button" ' 
// 	+ ' class="btn btn-secondary btn-sm vpkButtons" data-toggle="collapse" data-target="#parts-' 
// 	+ partsCnt + '">&nbsp;&nbsp;Press to toggle viewing the ServiceAccounts&nbsp;&nbsp;</button>'
// 	+ '</div>'
// 	+ '<div id="parts-' + partsCnt + '" class="collapse">';
// 	let bottomButton = '&nbsp;&nbsp;&nbsp;&nbsp;<button type="button" ' 
// 	+ ' class="btn btn-secondary btn-sm vpkButtons" data-toggle="collapse" data-target="#parts-' 
// 	+ partsCnt + '">&nbsp;&nbsp;&nbsp;&nbsp;Close ServiceAccount list&nbsp;&nbsp;</button>';
// 	let divSection = '<div class="events" ><hr><table style="width:100%">';
// 	let header = '<tr class="partsList"><th>Service Account name</th><th>ID # (click to view)</th></tr>';

// 	//data to show
// 	let accounts = k8cData[nsKey].ServiceAccount;
// 	accounts.sort((a, b) => (a.name > b.name) ? 1 : (a.names === b.name) ? ((a.fnum > b.fnum) ? 1 : -1) : -1 );

// 	let account;
// 	let hl = accounts.length;
// 	let nsHtml = '';
// 	let item;
// 	let rtn = '';
// 	let name;
// 	let fnum;
// 	let parm;
// 	let fname;
// 	rtn = partsBar + divSection + header;


// 	for (r = 0; r < hl; r++) {
// 		account = accounts[r];
// 		name = account.name;

// 		fnum = account.fnum;
// 		let fParts = fnum.split('.');
// 		fname = baseDir + '/config' + fParts[0] + '.yaml';
// 		parm = fname + '::' + fParts[1] + '::' + name;

// 		item = '<tr>' 
// 		+ '<td width="50%"  class="align-top"> <span class=" text-light bg-info">' + name + '</span></td>' 
// 		+ '<td width="50%"  class="align-top" ><span onclick="getDef(\'' + parm + '\')">' + fnum + '</span></td>'
// 		+ '</tr>';
// 		nsHtml = nsHtml + item
// 		item = '<tr>' 
// 		+ '<td width="50%"><hr></td>' 
// 		+ '<td width="50%"><hr></td>' 
// 		+ '</tr>';
// 		nsHtml = nsHtml + item		

// 	}
// 	if (nsHtml !== header) {
// 		rtn = rtn + nsHtml;
// 	}
	
	
// 	rtn = rtn + '</table><hr>' + bottomButton + '</div></div>';

// 	if (rtn.indexOf('undefined') > -1) {
// 		console.log(rtn);
// 	}

// 	return rtn;
// }



//Build the RoleBinding Subjects information
function parseRBSubject(data, both) {
	if (typeof both === 'undefined' || both === null) {
		both = false;
	}
	nData = '';
	if (typeof data === 'undefined' || data === '') {
		return nData;
	}
	let hl = data.length;

	for (let i = 0; i < hl; i++) {
		if (typeof data[i].name !== 'undefined' ) {
			if (typeof data[i].kind !== 'undefined' ) {
				if (data[i].kind === 'ServiceAccount' ) {
					nData = nData + 'Name: <span class=" text-light bg-info">' + data[i].name + '</span><br>';
				} else if (data[i].kind === 'Group' ) {
					nData = nData + 'Name: <span class=" bg-warning">' + data[i].name + '</span><br>';
				} else if (data[i].kind === 'User' ) {
					nData = nData + 'Name: <span class=" text-light bg-danger">' + data[i].name + '</span><br>';
				} else if (data[i].kind === 'SystemGroup' ) {
					nData = nData + 'Name: <span class=" text-light bg-primary">' + data[i].name + '</span><br>';
				} else if (data[i].kind === 'SystemUser' ) {
					nData = nData + 'Name: <span class=" text-light bg-secondary">' + data[i].name + '</span><br>';
				} else {
					nData = nData + 'Name: ' + data[i].name + '<br>';
					console.log('Unmanaged kind for Subject: ' + data[i].kind)
				}
			} else {
				nData = nData + 'Name: ' + data[i].name + '<br>';
			}
		}
		if (both === true) {
			if (typeof data[i].kind !== 'undefined' ) {
				nData = nData + 'Kind: ' + data[i].kind + '<br>';
			}
			if (hl === 1 || i === (hl - 1) ) {
				//
			} else {
				nData = nData + '<hr>';
			}
		}
	}
	return nData;
}

//Build Subjects from 0000-@subjects@
function buildSubjects(ns) {
	if (ns === '0000-@clusterRoles@' || ns === '0000-@clusterRoleBinding@' ) {
		return;
	}
	
	let cLevel = false;
	if (ns === '0000-@subjects@') {
		cLevel = true;
	}
	ns = ns.substring(5);

	let used = [];
	let nsKey = '0000-@subjects@';
	// check if there are any role entries to process
	if (typeof k8cData[nsKey] === 'undefined') {
		return
	}
	let subsData = k8cData[nsKey];
	let keys = Object.keys(subsData);
	keys.sort();

	secBldCnt++;
	let partsBar = '<div class="partsBar"><button type="button" ' 
	+ ' class="btn btn-toggle btn-sm vpkButtons" data-toggle="collapse" data-target="#parts-' 
	+ secBldCnt + '">&nbsp;&nbsp;Press to toggle viewing&nbsp;&nbsp;</button>&nbsp;&nbsp;RoleBinding Subjects'
	+ '</div>'
	+ '<div id="parts-' + secBldCnt + '" class="collapse">';
	let bottomButton = '<button type="button" ' 
	+ ' class="btn btn-toggle btn-sm vpkButtons" data-toggle="collapse" data-target="#parts-' 
	+ secBldCnt + '">&nbsp;Close above Subjects list&nbsp;</button>';
	let divSection = '<div class="events" ><hr><table style="width:100%">';
	let header = '<tr class="partsList"><th>Subject Kind</th><th>Subject Name</th><th>RoleRef Kind</th><th>ID # (click to view)</th></tr>';

	let subs;
	let sKeys;
	let nsHtml = '';
	let item;
	let rtn = '';
	let name;
	let fnum;
	let parm;
	let elem;
	let fParts;
	let subject;
	let data;
	let uKey;
	let roleK;

	rtn = partsBar + divSection + header;

	for (let k = 0; k < keys.length; k++) {
		subs = subsData[keys[k]]
		sKeys = Object.keys(subs);
		sKeys.sort();
		sKeys.sort((a, b) => (a.name > b.name) ? 1 : (a.name === b.name) ? ((a.roleKind > b.roleKind) ? 1 : -1) : -1 );


		for (r = 0; r < sKeys.length; r++) {
			elem = subs[sKeys[r]];

			if (ns === '@subjects@') {
				if (elem.namespace === '') {
					elem.namespace = '<cluster>'
				}
			} else {
				if (elem.namespace !== ns) {
					continue;
				}
			}

			uKey = elem.kind+':'+elem.name+':'+elem.roleKind;
			if (typeof used[uKey] === 'undefined') {
				used[uKey] = 1;
			} else {
				continue;
			}


			fParts = elem.fnum.split('.');
			fname = baseDir + '/config' + fParts[0] + '.yaml';
			parm = fname + '::' + fParts[1] + '::' + name;
	
			data = []
			data.push({'name': elem.name, 'kind': elem.kind});
			subject = parseRBSubject(data)

			if (typeof elem.roleKind === 'undefined') {
				roleK = 'Unknown';
			} else {
				roleK = elem.roleKind;
			}



			item = '<tr>' 
			+ '<td width="25%">' + elem.kind + '</td>' 
			+ '<td width="45%">' + subject + '</td>' 
			+ '<td width="15%">' + roleK + '</td>' 
			+ '<td width="15%"><span onclick="getDef(\'' + parm + '\')">' + elem.fnum + '</span></td>'
			+ '</tr>';
			nsHtml = nsHtml + item
			item = '<tr>' 
			+ '<td width="25%"><hr></td>' 
			+ '<td width="45%"><hr></td>' 
			+ '<td width="15%"><hr></td>' 
			+ '<td width="15%"><hr></td>' 
			+ '</tr>';
			nsHtml = nsHtml + item		
		}
	}
	if (nsHtml !== header) {
		rtn = rtn + nsHtml;
	}
	
	
	rtn = rtn + '</table><hr>' + bottomButton + '</div></div>';
	used = null;
	return rtn;
}

//Build RoleBinding information
function buildRoleBindings(ns) {
	if (ns === '0000-@subjects@' || ns === '0000-@clusterRoles@') {
		return;
	}

	if (ns === '0000-@clusterRoleBinding@') {
		console.log('dbg')
	}
	let used = {};
	let nsKey = ns;
	// check if there are any role entries to process
	if (typeof k8cData[nsKey].RoleBinding === 'undefined') {
		return
	}
	secBldCnt++;
	let partsBar = '<div class="partsBar"><button type="button" ' 
	+ ' class="btn btn-toggle btn-sm vpkButtons" data-toggle="collapse" data-target="#parts-' 
	+ secBldCnt + '">&nbsp;&nbsp;Press to toggle viewing&nbsp;&nbsp;</button>&nbsp;&nbspRoleBindings'
	+ '</div>'
	+ '<div id="parts-' + secBldCnt + '" class="collapse">';
	let bottomButton = '<button type="button" ' 
	+ ' class="btn btn-toggle btn-sm vpkButtons" data-toggle="collapse" data-target="#parts-' 
	+ secBldCnt + '">&nbsp;Close above RoleBinding list&nbsp;</button>';
	let divSection = '<div class="events" ><hr><table style="width:100%">';
	let header = '<tr class="partsList"><th>RoleBinding Name</th><th>Role Name</th><th>Subject Name & Kind</th><th>ID # (click to view)</th></tr>';

	//data to show
	let bindings = k8cData[nsKey].RoleBinding;
	bindings.sort((a, b) => (a.name > b.name) ? 1 : (a.names === b.name) ? ((a.fnum > b.fnum) ? 1 : -1) : -1 );

	let bind;
	let hl = bindings.length;
	let nsHtml = '';
	let item;
	let rtn = '';
	let name;
	let fnum;
	let subject;
	let roleName;
	let parm;
	let fname;
	let uKey;
	let bKind;
	rtn = partsBar + divSection + header;


	for (r = 0; r < hl; r++) {
		bind = bindings[r];
		name = bind.name;
		subject = '';
		roleName = '';
		if (typeof bind.roleRef !== 'undefined') {
			if (typeof bind.roleRef.name !== 'undefined') {
				roleName = bind.roleRef.name;
			}
		}

		if (typeof bind.subjects !== 'undefined') {
			if (typeof bind.subjects[0] !== 'undefined') {
				if (typeof bind.subjects[0].kind !== 'undefined') {
					bKind = bind.subjects[0].kind
				} else {
					console.log('RoleBinding ns: ' + ns)
					console.log('Did not find complete subject info skipping roleBinding: ' + JSON.stringify(bind, null, 2))
					bKind = '<blank>';
				}		
			} else {
				console.log('RoleBinding ns: ' + ns)
				console.log('Did not find complete subject info skipping roleBinding: ' + JSON.stringify(bind, null, 2))
				bKind = '<blank>';
			}
		} else {
			console.log('RoleBinding ns: ' + ns)
			console.log('Did not find complete subject info skipping roleBinding: ' + JSON.stringify(bind, null, 2))
			bKind = '<blank>';
		}

		uKey = name+':'+roleName+':'+bKind;
		if (typeof used[uKey] === 'undefined') {
			used[uKey] = 1
		} else {
			continue;
		}


		fnum = bind.fnum;
		let fParts = fnum.split('.');
		fname = baseDir + '/config' + fParts[0] + '.yaml';
		parm = fname + '::' + fParts[1] + '::' + name;

		subject = parseRBSubject(bind.subjects, true);


		item = '<tr>' 
		+ '<td width="27%"  class="align-top" >' + name + '</td>' 
		+ '<td width="30%"  class="align-top"><span class=" text-light bg-success">' + roleName + '<span></td>' 
		+ '<td width="30%"  class="align-top" >' + subject + '</td>' 
		+ '<td width="13%"  class="align-top" ><span onclick="getDef(\'' + parm + '\')">' + fnum + '</span></td>'
		+ '</tr>';
		nsHtml = nsHtml + item
		item = '<tr>' 
		+ '<td width="25%"><hr></td>' 
		+ '<td width="25%"><hr></td>' 
		+ '<td width="25%"><hr></td>' 
		+ '<td width="25%"><hr></td>' 
		+ '</tr>';
		nsHtml = nsHtml + item		

	}
	if (nsHtml !== header) {
		rtn = rtn + nsHtml;
	}
	
	
	rtn = rtn + '</table><hr>' + bottomButton + '</div></div>';

	if (rtn.indexOf('undefined') > -1) {
		console.log(rtn);
	}

	used = null;
	return rtn;
}

//Build the Role information
function buildRoles(ns) {
	
	let nsKey = ns;

	// check if there are any role entries to process
	if (typeof k8cData[nsKey].Role === 'undefined') {
		return
	}

	secBldCnt++;

	let partsBar = '<div class="partsBar"><button type="button" ' 
	+ ' class="btn btn-toggle btn-sm vpkButtons" data-toggle="collapse" data-target="#parts-' 
	+ secBldCnt + '">&nbsp;&nbsp;Press to toggle viewing&nbsp;&nbsp;</button>&nbsp;&nbsp;Roles'
	+ '</div>'
	+ '<div id="parts-' + secBldCnt + '" class="collapse">';

	let bottomButton = '<button type="button" ' 
	+ ' class="btn btn-toggle btn-sm vpkButtons" data-toggle="collapse" data-target="#parts-' 
	+ secBldCnt + '">&nbsp;Close above Role list&nbsp;</button>';
	let divSection = '<div class="events" ><hr><table style="width:100%">';
	let header = '<tr class="partsList"><th>Role Name</th><th>API Groups</th><th>Resource Names</th><th>Resources</th><th>Verbs</th><th>ID # (click to view)</th></tr>';

	//data to show
	if (nsKey === '0000-@clusterRoles@') {
		console.log('d')
	}
	let roles = k8cData[nsKey].Role;
	

	roles.sort((a, b) => (a.name > b.name) ? 1 : (a.names === b.name) ? ((a.fnum > b.fnum) ? 1 : -1) : -1 );

	let role;
	let hl = roles.length;
	let nsHtml = '';
	let item;
	let rtn = '';
	let name;
	let apiG ;
	let fnum;
	let resourceNames;
	let resources;
	let verbs;
	let parm;
	let fname;
	rtn = partsBar + divSection + header;

	for (r = 0; r < hl; r++) {
		apiG = '';
		resourceNames = '';
		resources = '';
		verbs = '';
		role = roles[r];
		name = role.name;

		if (typeof role.fnum === 'undefined') {
			parm = 'x::x::x'
			console.log('ns: ' + ns + ' missing fnum: ' + JSON.stringify(role))
		} else {
			fnum = role.fnum;
			let fParts = fnum.split('.');
			fname = baseDir + '/config' + fParts[0] + '.yaml';
			parm = fname + '::' + fParts[1] + '::' + name;
		}
		item = '<tr>' 
		+ '<td width="20%" class="top"><span class=" text-light bg-success">' + name + '</span></td>' 
		+ '<td width="20%">&nbsp;</td>' 
		+ '<td width="20%">&nbsp;</td>' 
		+ '<td width="20%">&nbsp;</td>' 
		+ '<td width="7%">&nbsp;</td>' 
		+ '<td width="13%"><span onclick="getDef(\'' + parm + '\')">' + fnum + '</span></td>'
		+ '</tr>';
		nsHtml = nsHtml + item
		item = '<tr>' 
		+ '<td width="20%"><hr></td>' 
		+ '<td width="20%"><hr></td>' 
		+ '<td width="20%"><hr></td>' 
		+ '<td width="20%"><hr></td>' 
		+ '<td width="7%"><hr></td>' 
		+ '<td width="13%"><hr></td>'
		+ '</tr>';
		nsHtml = nsHtml + item		

		if (typeof role.rules !== 'undefined' && role.rules !== 'null' && role.rules !== null) {

			for (let c = 0; c < role.rules.length; c++) {
				if (typeof role.rules[c].apiGroups !== 'undefined') {
					apiG = parseArray(role.rules[c].apiGroups);
				}
				if (typeof role.rules[c].resourceNames !== 'undefined') {
					resourceNames = parseArray(role.rules[c].resourceNames);
				}
				if (typeof role.rules[c].resources !== 'undefined') {
					resources = parseArray(role.rules[c].resources);
				}
				if (typeof role.rules[c].verbs !== 'undefined') {
					verbs = parseArray(role.rules[c].verbs);
				}

				item = '<tr>' 
				+ '<td width="20%">&nbsp;</td>' 
				+ '<td width="20%" class="align-top ">' + apiG + '</td>' 
				+ '<td width="20%" class="align-top ">' + resourceNames + '</td>' 
				+ '<td width="20%" class="align-top ">' + resources + '</td>' 
				+ '<td width="10%" class="align-top">' + verbs + '</td>' 
				+ '<td width="10%">&nbsp;</td>'
				+ '</tr>';
				nsHtml = nsHtml + item

				item = '<tr>' 
				+ '<td width="20%"><hr></td>' 
				+ '<td width="20%"><hr></td>' 
				+ '<td width="20%"><hr></td>' 
				+ '<td width="20%"><hr></td>' 
				+ '<td width="10%"><hr></td>' 
				+ '<td width="10%"><hr></td>'
				+ '</tr>';
				nsHtml = nsHtml + item
			} 
		} else {
			console.log('No Role rules located for ns: ' + ns + ' content:' + JSON.stringify(role))
		}

	}
	if (nsHtml !== header) {
		rtn = rtn + nsHtml;
	}
	
	
	rtn = rtn + '</table><hr>' + bottomButton + '</div></div>';
	// build the roleBinding sections
	if (rtn.indexOf('undefined') > -1) {
		console.log(rtn);
	}

	return rtn;
}

//----------------------------------------------------------
console.log('loaded vpksecurity.js');