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
// build svg data from returned data
//----------------------------------------------------------

let RBAClegend = '<div class="vpkfont-md text-dark ml-2 mb-2 mt-2"><span class="pr-1">Legend:</span>'
+ '<span class="text-light bg-rbn pl-1 pr-1">RoleBinding name</span>'
+ '&nbsp;&nbsp;'
+ '<span class="text-light bg-success pl-1 pr-1">Role name</span>'
+ '<span class="pl-4 pr-1 text-dark">Subject kind:</span>'
+ '<span style="width: 80px;" class="text-light bg-info pl-1 pr-1">ServiceAccount</span>'
+ '&nbsp;&nbsp;'
+ '<span style="width: 80px;" class="bg-warning pl-1 pr-1">Group</span>'
+ '&nbsp;&nbsp;'
+ '<span style="width: 80px;" class="text-light bg-danger pl-1 pr-1">User</span>'
+ '&nbsp;&nbsp;'
+ '<span style="width: 80px;" class="text-light bg-primary pl-1 pr-1">SystemGroup</span>'
+ '&nbsp;&nbsp;'
+ '<span style="width: 80px;" class="text-light bg-secondary pl-1 pr-1">SystemUser</span>'
+ '<span class="pl-4 vpkfont-md">(click on color bar in following table to view additional information)</span>'

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

	console.log(JSON.stringify(bindingStatCounts, null, 4));
	
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
	let secType;
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
			secType = 'CRB';
		} else if (breakKey === '0000-@clusterRoles@') {
			breakKey = '&lt;Cluster Level&gt;&nbsp;&nbsp;&nbsp;Roles'
			breakColor = 'btn-secondary'
			secType = 'CRB';
		} else if (breakKey === '0000-@clusterRoleBinding@') {
			breakKey = '&lt;Cluster Level&gt;&nbsp;&nbsp;&nbsp;ClusterRoleBinding'
			breakColor = 'btn-secondary'
			secType = 'CRB';
		} else {
			breakKey = breakKey.substring(5);
			breakColor = 'btn-primary'
			secType = 'RB';
		}

		if (secKey !== oldSecNS) {
			oldSecNS = secKey;
			secBreakID++;
			if (secFirst) {
				secFirst = false;
				rdata = rdata + '<span class="breakBar vpkcolor"><hr>' 
				+ '&nbsp;&nbsp;Press the buttons below to view the RBAC information for listed namespaces or cluster level' 
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

			let nsWide = secNSChange(oldSecNS,secType);

			rdata = rdata + breakData + nsWide;
		}
	}
	rdata = rdata + '</div>'
	return rdata
}

function secNSChange(ns, secType) {
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

	let subsData = buildSubjects(ns, secType);
	if (typeof subsData !== 'undefined') {
		rtn = rtn + subsData;
		subsData = null;
	}
		
	return rtn;
}

//Build the RoleBinding Subjects information
function parseRBSubject(data, both, fnum) {
	if (typeof both === 'undefined' || both === null) {
		both = false;
	}
	nData = '';
	if (typeof data === 'undefined' || data === '') {
		return nData;
	}
	let hl = data.length;

	let line1Color;
	let line2; 
	let line3; 
	let linkValue;
	let lineHR;
	let fParts;
	let fname;
	for (let i = 0; i < hl; i++) {
		line1Color = '';
		line2 = ''; 
		line3 = ''; 
		linkValue = '@';
		lineHR = false;
		if (typeof data[i].name !== 'undefined' ) {
			linkValue = linkValue + data[i].name + '@';
			if (typeof data[i].kind !== 'undefined' ) {
				if (data[i].kind === 'ServiceAccount' ) {
					line1Color = 'text-light bg-info';
				} else if (data[i].kind === 'Group' ) {
					line1Color = 'bg-warning';
				} else if (data[i].kind === 'User' ) {
					line1Color = 'text-light bg-danger';
				} else if (data[i].kind === 'SystemGroup' ) {
					line1Color = 'text-light bg-primary';
				} else if (data[i].kind === 'SystemUser' ) {
					line1Color = 'text-light bg-secondary';
				} else {
					line1Color = '';
					console.log('Unmanaged kind for Subject: ' + data[i].kind)
				}
			} else {
				line1Color = '';
			}
		}
		if (both === true) {
			if (typeof data[i].kind !== 'undefined' ) {
				linkValue = linkValue + data[i].kind + '@';
				line2 = 'Kind: ' + data[i].kind + '<br>';
			} else {
				linkValue = linkValue + '<blank>:';
			}
		
			if (typeof data[i].namespace !== 'undefined' ) {
				linkValue = linkValue + data[i].namespace + '@';
				line3 = 'Namespace: ' + data[i].namespace + '<br>';
			} else {
				linkValue = linkValue + '<blank>:';
			}

			if (hl === 1 || i === (hl - 1) ) {
				lineHR = false;
			} else {
				lineHR = true;
			}
		}

		// build html output
		if (typeof fnum !== 'undefined') {
		fParts = fnum.split('.');
		fname = baseDir + '/config' + fParts[0] + '.yaml';
		fname = fname + '::' + fParts[1] + '::' + name;
		} else {
			fname = 'missing::missing::missing';
		}

		nData = nData + 'Name: <span class="' + line1Color + '" onclick="getDef(\'' + fname + '\')">' + data[i].name + '</span><br>';
		if (line2 !== '') {
			nData = nData + line2;
		}
		if (line3 !== '') {
			nData = nData + line3;
		}		

	}
	return nData;
}

//Build Subjects from 0000-@subjects@
function buildSubjects(ns) {
	if (ns === '0000-@clusterRoles@' || ns === '0000-@clusterRoleBinding@' ) {
		return;
	}
	
	//cluster level flag
	let cLevel = false;
	if (ns === '0000-@subjects@') {
		cLevel = true;
	}
	//get namespace by striping the 0000-
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
	let header = '<tr class="partsList"><th>Subject Kind</th><th>Subject Name</th><th>RoleRef Kind</th><th>RoleRef</th></tr>';

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
	let roleRefName;

	rtn = partsBar + divSection + RBAClegend + header;

	for (let k = 0; k < keys.length; k++) {
		subs = subsData[keys[k]]
		sKeys = Object.keys(subs);
		sKeys.sort();
		sKeys.sort((a, b) => (a.name > b.name) ? 1 : (a.name === b.name) ? ((a.roleKind > b.roleKind) ? 1 : -1) : -1 );


		for (r = 0; r < sKeys.length; r++) {
			elem = subs[sKeys[r]];

			if (elem.roleKind === 'Role') {
				continue;
			}

			if (ns === '@subjects@') {
				if (elem.namespace === '') {
					elem.namespace = '<cluster>'
				}
			} else {
				if (elem.namespace !== ns) {
					continue;
				}
			}



			fParts = elem.fnum.split('.');
			fname = baseDir + '/config' + fParts[0] + '.yaml';
			parm = fname + '::' + fParts[1] + '::' + name;
	
			data = []
			data.push({'name': elem.name, 'kind': elem.kind});
			subject = parseRBSubject(data, false, elem.fnum)

			if (typeof elem.roleKind === 'undefined') {
				roleK = 'Unknown';
			} else {
				roleK = elem.roleKind;
			}
			if (typeof elem.roleName === 'undefined') {
				roleRefName = 'Unknown';
			} else {
				roleRefName = elem.roleName;
			}

			item = '<tr>' 
			+ '<td width="10%">' + elem.kind + '</td>' 
			+ '<td width="40%">' + subject + '</td>' 
			+ '<td width="10%">' + roleK + '</td>' 
			+ '<td width="40%"><span class="bg-success text-light" onclick="getSecRole(\'' + roleRefName + '\')">' + roleRefName + '</span></td>' 
			+ '</tr>';
			nsHtml = nsHtml + item
			item = '<tr>' 
			+ '<td width="10%"><hr></td>' 
			+ '<td width="40%"><hr></td>' 
			+ '<td width="10%"><hr></td>' 
			+ '<td width="40%"><hr></td>' 
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
	let header = '<tr class="partsList"><th>RoleBinding Name</th><th>Role Name</th><th>Subject Name & Kind</th></tr>';

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
	rtn = partsBar + divSection + RBAClegend + header;

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
					console.log('No bind.subjects[0].kind, skipping: ' + JSON.stringify(bind, null, 2))
					bKind = '<blank>';
				}		
			} else {
				console.log('RoleBinding ns: ' + ns)
				console.log('No bind.subjects[0], skipping: ' + JSON.stringify(bind, null, 2))
				bKind = '<blank>';
			}
		} else {
			console.log('RoleBinding ns: ' + ns)
			console.log('No bind.subjects, skipping: ' + JSON.stringify(bind, null, 2))
			bKind = '<blank>';
		}

		uKey = name+'@'+roleName+'@'+bKind;
		if (typeof used[uKey] === 'undefined') {
			used[uKey] = 1
		} else {
			continue;
		}

		fnum = bind.fnum;
		let fParts = fnum.split('.');
		fname = baseDir + '/config' + fParts[0] + '.yaml';
		parm = fname + '::' + fParts[1] + '::' + name;

		subject = parseRBSubject(bind.subjects, true, bind.fnum);
		if (subject === '') {
			subject = '<span class="noSubject">&lt;No subjects defined&gt;</span>'
		}

		item = '<tr>' 
		+ '<td width="34%"  class="align-top"><span class="text-light bg-rbn" onclick="getDef(\'' + parm + '\')">' + name + '</td>' 
		+ '<td width="33%"  class="align-top"><span class="text-light bg-success" onclick="getSecRole(\'' + roleName + '\')">' + roleName + '<span></td>' 
		+ '<td width="33%"  class="align-top" >' + subject + '</td>' 
		+ '</tr>';
		nsHtml = nsHtml + item
		item = '<tr>' 
		+ '<td width="34%"><hr></td>' 
		+ '<td width="33%"><hr></td>' 
		+ '<td width="33%"><hr></td>' 
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

// build the Role information to populate the secInfoModal for Role
function buildSecModalRole(data, key) {
	let role = data;
	let item;
	let rtn = '';
	let grpInfo = '';
	let resourceNames = '';
	let resources = '';
	let verbs = '';
	let category = '';
	let fnum = '<na>';
	let fParts = '';
	let fname = '';
	let parm = '';

	if (typeof role.fnum !== 'undefined') {
		fnum = role.fnum;
		fParts = fnum.split('.');
		fname = baseDir + '/config' + fParts[0] + '.yaml';
		parm = fname + '::' + fParts[1] + '::' + name;
	} else {
		parm = 'missing::missing::missing';
	}


	let roleId = 
	  '<div class="d-flex justify-content-between vpkcolor vpkfont-md mb-0">'
	+ '  <div>Role Name:&nbsp;<span class="text-light bg-success vpkfont-md">' + key + '</span></div>'
	+ '  <div><span class"vpkfont-md vpkcolor">ID#:&nbsp;<span onclick="getDef6(\'' + parm + '\')">' + fnum + '</span>'
	+ '  <span class="vpkfont-sm vpkcolor pl-1">(click # to view)</span></div>'
	+ '</div><hr>';

	let divSection = '<div class="events" ><table style="width:100%">';
	let header = '<tr class="partsList"><th>Category</th><th>Category Values</th><th>Resource Names</th><th>Resources</th><th>Verbs</th></tr>';
	rtn = roleId + divSection + header;

	if (typeof role.rules !== 'undefined' && role.rules !== 'null' && role.rules !== null) {
		for (let c = 0; c < role.rules.length; c++) {
			category = '&nbsp;';
			resourceNames = '&nbsp;'
			resources = '&nbsp;'
			verbs = '&nbsp;'
			grpInfo = '&nbsp';
			if (typeof role.rules[c].apiGroups !== 'undefined') {
				grpInfo = parseArray(role.rules[c].apiGroups);

				if (grpInfo === '' || grpInfo.length < 2) {
					grpInfo = '&lt;blank&gt;'
				}

				category = 'apiGroup';
			}

			if (typeof role.rules[c].nonResourceURLs !== 'undefined') {
				grpInfo = parseArray(role.rules[c].nonResourceURLs);
				category = 'nonResourceURLs'
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

			if (grpInfo === '') {
				grpInfo = '&lt;blank&gt;'
			}

			item = '<tr>' 
			+ '<td width="15%" class="align-top ">' + category+ '</td>' 
			+ '<td width="25%" class="align-top ">' + grpInfo + '</td>' 
			+ '<td width="25%" class="align-top ">' + resourceNames + '</td>' 
			+ '<td width="25%" class="align-top ">' + resources + '</td>' 
			+ '<td width="10%" class="align-top">' + verbs + '</td>' 
			+ '</tr>';
			rtn = rtn + item

			item = '<tr>' 
			+ '<td width="15%"><hr></td>' 
			+ '<td width="25%"><hr></td>' 
			+ '<td width="25%"><hr></td>' 
			+ '<td width="25%"><hr></td>' 
			+ '<td width="10%"><hr></td>' 
			+ '</tr>';
			rtn = rtn + item
		} 
	} else {
		console.log('No Role rules located for role: ' + key)
		item = '<tr>' 
		+ '<td width="15%" class="align-top ">No Rules</td>' 
		+ '<td width="25%" class="align-top ">&nbsp;</td>' 
		+ '<td width="25%" class="align-top ">&nbsp;</td>' 
		+ '<td width="25%" class="align-top ">&nbsp;</td>' 
		+ '<td width="10%" class="align-top">&nbsp;</td>' 
		+ '</tr>';
		rtn = rtn + item
	}

	rtn = rtn + '</table></div>';
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
	let header = '<tr class="partsList"><th>Role Name</th><th>Category</th><th>Category Values</th><th>Resource Names</th><th>Resources</th><th>Verbs</th></tr>';

	//data to show
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
	rtn = partsBar + divSection + RBAClegend + header;

	for (r = 0; r < hl; r++) {
		grpInfo = '';
		category = '';
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
		item = '<tr class="roleRBAC">' 
		+ '<td width="15%" class="top"><span class="text-light bg-success" onclick="getDef(\'' + parm + '\')">' + name + '</span></td>' 
		+ '<td width="15%">&nbsp;</td>' 
		+ '<td width="20%">&nbsp;</td>' 
		+ '<td width="20%">&nbsp;</td>' 
		+ '<td width="20%">&nbsp;</td>' 
		+ '<td width="10%">&nbsp;</td>' 
		+ '</tr>';
		nsHtml = nsHtml + item
		item = '<tr>' 
		+ '<td width="15%"><hr></td>' 
		+ '<td width="15%"><hr></td>' 
		+ '<td width="20%"><hr></td>' 
		+ '<td width="20%"><hr></td>' 
		+ '<td width="20%"><hr></td>' 
		+ '<td width="10%"><hr></td>' 
		+ '</tr>';
		nsHtml = nsHtml + item		

		if (typeof role.rules !== 'undefined' && role.rules !== 'null' && role.rules !== null) {

			for (let c = 0; c < role.rules.length; c++) {
				if (typeof role.rules[c].apiGroups !== 'undefined') {
					grpInfo = parseArray(role.rules[c].apiGroups);
					category = 'apiGroup'
				}

				if (typeof role.rules[c].nonResourceURLs !== 'undefined') {
					grpInfo = parseArray(role.rules[c].nonResourceURLs);
					category = 'nonResourceURLs'
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
				+ '<td width="15%">&nbsp;</td>' 
				+ '<td width="15%" class="align-top ">' + category + '</td>' 
				+ '<td width="20%" class="align-top ">' + grpInfo + '</td>' 
				+ '<td width="20%" class="align-top ">' + resourceNames + '</td>' 
				+ '<td width="20%" class="align-top ">' + resources + '</td>' 
				+ '<td width="10%" class="align-top">' + verbs + '</td>' 
				+ '</tr>';
				nsHtml = nsHtml + item

				item = '<tr>' 
				+ '<td width="15%"><hr></td>' 
				+ '<td width="15%"><hr></td>' 
				+ '<td width="20%"><hr></td>' 
				+ '<td width="20%"><hr></td>' 
				+ '<td width="20%"><hr></td>' 
				+ '<td width="10%"><hr></td>'
				+ '</tr>';
				nsHtml = nsHtml + item
			} 
		} else {
			console.log('No Role rules located for ns: ' + ns + ' content:' + JSON.stringify(role))
			item = '<tr>' 
			+ '<td width="15%">&nbsp;</td>' 
			+ '<td width="15%" class="align-top">&lt;No rules defined&gt;</td>' 
			+ '<td width="20%" class="align-top">&lt;blank&gt;</td>' 
			+ '<td width="20%" class="align-top">&lt;blank&gt;</td>' 
			+ '<td width="20%" class="align-top">&lt;blank&gt;</td>' 
			+ '<td width="10%" class="align-top">&lt;blank&gt;</td>' 
			+ '</tr>';
			nsHtml = nsHtml + item

			item = '<tr>' 
			+ '<td width="20%"><hr></td>' 
			+ '<td width="10%"><hr></td>'
			+ '<td width="20%"><hr></td>' 
			+ '<td width="20%"><hr></td>' 
			+ '<td width="20%"><hr></td>' 
			+ '<td width="10%"><hr></td>' 
			+ '</tr>';
			nsHtml = nsHtml + item
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