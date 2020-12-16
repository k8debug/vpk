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
// build common vars and functions
//----------------------------------------------------------

// Global vars 
var version = 'Get from server';
var socket = io.connect();
var dix;
var dixArray = [];
var svgE = 0; 
var baseDir;
var validDir;
var newDir;
//var colors;
var clusterProviders;
var files;
var inputFlds;
//var stable;
var dCnt = 0;
var editor;
var currentEditFile;
var selectedDef;
var selectedAction;
var popCnt = 0;
var cHeight;
var chartType;
var selectCnt = 0;
var currentTab = "instructions"
var newData = [];
var rootDir;
var k8cData;
var dsCounts;
var dsToggle = 'kind';
var bootstrapModalCounter = 0;
var documentationTabTopic = 'toc';



// objects that contain html sections that are dnynamically shown
let svgInfo = {};            			// tool tip pop-ups
let workloadEventsInfo = {};			// workload events
let nsResourceInfo = {};				// namespace resource lists

// security arrays
let securityRoleInfo = {};				// roles
let securityRoleBindingInfo = {};		// role bindings
let securitySubjectInfo = {};			// subjects
let securityArraysLoaded = false;       // indicate if data loaded in security arrays

let iCnt = 1;
let oldNS = '@';
let first = true;
let evtCnt = 0;
let partsCnt = 0;
let rdata = '';
let breakData = '';
let breakID = 0;
let height = 0;
let fnum;
let genS;
let cfgS;
let iamS;
let podS;
let netS;
let pvcS;
let genH;
let cfgH;
let iamH;
let podH;
let netH;
let pvcH;
let allH;
let outterName = '';
let cBar = false;
let wCnt = 0;
let cLevel = '';
let countContainer = 0;
let countInitContainer = 0;
let countUnkImage = 0;
let collapseIDs = [];

//vpksecurity based vars
let oldSecNS = '@';
let secFirst = true;
let secBreakID = 100;
let secBldCnt = 0;
let secRData = '';

//vpksecUsage based vars
let whereRoleBound = {};
let whereSubjects = {};
let whereRoleRefs = {};

let roleBindingCnt = 0;
let clusterRoleBindingCnt = 0;
let roleRefRoleCnt = 0;
let	roleRefClusterRoleCnt = 0;
let	unknownKindCnt = 0;
let bindingStatCounts = [];

let crdRefCnt = 0;

let hrLow = '<hr class="mb-0 mt-0>"';

// browser details
let usageBrowserName;
let usageFullVersion;
let usageMajorVersion;
let usageNavigatorAppName;
let usageNavigatorUserAgent;
let usageJSHeapSizeLimit = 0;
let usageJSHeapTotal = 0;
let usageJSHeapUsed = 0;

let xrefData = '';				// JSON struc of xref rules and names
let xrefSelectedRule = '';
let xrefSelectedRuleKey = '';
let xrefRuleCountFound = 0;

// color legend for security 
let RBAClegend = '<div class="vpkfont-md mb-2 mt-2">'
+ '<span class="pr-1 text-dark">Binding:</span>'
+ '<span class="bg-roleBinding pl-1 pr-1">RoleBinding</span>'
+ '<span class="bg-clusterRoleBinding pl-1 pr-1">ClusterRoleBinding</span>'

+ '<span class="pl-3 pr-1 text-dark">Roles:</span>'
+ '<span class="bg-role pl-1 pr-1">Role</span>'
+ '<span class="bg-clusterRole pl-1 pr-1">ClusterRole</span>'

+ '<span class="pl-3 pr-1 text-dark">Subjects:</span>'
+ '<span class="bg-subjectServiceAccount pl-1 pr-1">ServiceAccount</span>'
+ '<span class="bg-subjectUser pl-1 pr-1">User</span>'
+ '<span class="bg-subjectGroup pl-1 pr-1">Group</span>'
+ '<span class="bg-subjectSystemUser pl-1 pr-1">System User</span>'
+ '<span class="bg-subjectSystemGroup pl-1 pr-1">System Group</span>'

+ '<span class="pl-1 vpkfont-md">(click colors in table for additional info)</span>';


function openAll(type) {
	collapseAction('O', type)
}

function closeAll(type) {
	collapseAction('C', type)
}

function collapseAction(act, type) {
	let id;
	
	for (let c = 0; c < collapseIDs.length; c++) {
		id = '#' + type + collapseIDs[c];
		if (act === 'O') {
			$(id).collapse("show");
		} else {
			$(id).collapse("hide");
		}
	}
}

function parseArray(data) {
	nData = '';
	if (typeof data === 'undefined' || data === '') {
		return nData;
	}
	if (data === null) {
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

function formatDate(data) {
	if (typeof data === 'undefined' || data === null) {
		return 'Unknown date';
	}
	let mydate = new Date(data);
	let fDate = mydate.toDateString();
	let tPart = data.split('T')
	if (typeof tPart[1] !== 'undefined') {
		fDate = fDate + ' ' + tPart[1]
		if (fDate.endsWith('Z')) {
			fDate = fDate.substring(0, fDate.length - 1) + ' GMT'
		}	
	}
	return fDate;
}

function formatJSON(content) {
	let cData = JSON.stringify(content, null, 2);
	cData = cData.split('\n');
	let nLine = '';
	let rtn = '';
	let pttrn = /^\s*/;
	let spc = 0;
	for (let i = 0; i < cData.length; i++) {
		nLine = '';
		spc = cData[i].match(pttrn)[0].length;
		if (spc > 0) {
			for (let s = 0; s < spc; s++) {
				nLine = nLine + '&nbsp;'
			}
		}
		rtn = rtn + nLine + cData[i].substring(spc) + '<br>';
	}
	return rtn;
} 


// print Div 
function printDiv(id) {  
    id = '#' + id;
    //ToDo replace this with parsing of public/views/partials/head.ejs
    let = html = '<html><head><meta charset="UTF-8" />'
    + '<meta name="viewport" content="width=device-width, initial-scale=1.0" />'
    + '<meta http-equiv="X-UA-Compatible" content="ie=edge" />'
    + '<link rel="icon" type="image/png" href="images/vpk.png">'
    + '<title>VpK Print</title>'
    + '<link rel="stylesheet" href="stylesheets/bootstrap.min.css">'
    + '<link rel="stylesheet" href="stylesheets/bootstrap-toggle.min.css">'
    + '<link rel="stylesheet" href="stylesheets/all.min.css">'
    + '<link rel="stylesheet" href="stylesheets/bootstrap-table.min.css" >'
    + '<link rel="stylesheet" href="stylesheets/select2.css"> '
    + '<link rel="stylesheet" href="stylesheets/vpk.css">'
    + '<script src="javascript/jquery-3.4.1.min.js"></script>'
    + '<script src="javascript/popper.min.js"></script>'
    + '<script src="javascript/bootstrap.min.js"></script>'
    + '<script src="javascript/bootstrap-toggle.min.js"></script>'
    + '<script src="javascript/bootstrap-table.min.js"></script>'
    + '<script src="javascript/select2.full.min.js"></script>'
    + '<script src="javascript/f62fcc73b5.js" crossorigin="anonymous"></script>';

    // how to from:
    // https://www.aspsnippets.com/Articles/Print-DIV-contents-with-CSS-using-JavaScript-and-jQuery.aspx
    /* a dynamic IFRAME is created and the extracted contents of the HTML DIV are written to the IFRAME 
       along with the link to the external CSS file and finally the IFRAME document is printed using the 
       JavaScript Window Print command and the IFRAME is removed from the pag
    */
    var contents = $(id).html();
    var frame1 = $('<iframe />');
    frame1[0].name = "frame1";
    frame1.css({
        "position": "absolute",
        "top": "-1000000px"
    });

    $("body").append(frame1);
    var frameDoc = frame1[0].contentWindow ? frame1[0].contentWindow : frame1[0].contentDocument.document ? frame1[0].contentDocument.document : frame1[0].contentDocument;
    frameDoc.document.open();
    //Create a new HTML document.
    frameDoc.document.write('<html><head><title>VpK Print</title>');
	frameDoc.document.write(html);   //added this to ensure iframe has needed css and scripts
	frameDoc.document.write('<style> body { background-color:white !important; }' 
	+ ' @page { size: 14.0in 8.5in; margin: 1cm 2cm 1cm 1cm; } ' 
	+ ' @page :left :footer { content: "Page " decimal(pageno); } '
	+ ' @page :right :footer { content: "Page " decimal(pageno); } '
	+ '</style>');
    frameDoc.document.write('</head><body>');
    // Append the contents.
    // frameDoc.document.write('<div class="m-3">' + contents + '</div>');
    frameDoc.document.write(contents);
    frameDoc.document.write('</body></html>');
    frameDoc.document.close();
    setTimeout(function() {
        window.frames["frame1"].focus();
        window.frames["frame1"].print();
        frame1.remove();
    }, 500);

}



function checkImage(kind, api) {
	let image;
	if (kind === 'k8') {
		image = 'k8'
	} else if (kind === 'API' || kind === 'Api' || kind === 'APIService') {
		image = 'k8/api';
	} else if (kind === 'Alertmanager') {
		image = 'other/ocp';
	} else if (kind === 'CatalogSource') {
		image = 'other/ocp';
	} else if (kind === 'CephCluster') {
		image = 'other/rook';
	} else if (kind === 'CertificateSigningRequest') {
		image = 'k8/k8';
	} else if (kind === 'ClusterRole') {
		image = 'k8/c-role';
	} else if (kind === 'ClusterRoleBinding') {
		image = 'k8/crb';
	} else if (kind === 'ComponentStatus') {
		image = 'k8/k8';
	} else if (kind === 'ConfigMap') {
		image = 'k8/cm';
	} else if (kind === 'ControllerRevision') {
		image = 'k8/c-rev';
	} else if (kind === 'CronJob') {
		image = 'k8/cronjob';
	} else if (kind === 'CSIDriver') {
		image = 'k8/k8';
	} else if (kind === 'CSINode') {
		image = 'k8/k8';
	} else if (kind === 'CustomResourceDefinition' || kind === 'CRD') {
		image = 'k8/crd';
	} else if (kind === 'DaemonSet') {
		image = 'k8/ds';
	} else if (kind === 'Deployment') {
		image = 'k8/deploy';
	} else if (kind === 'DeploymentConfig') {
		image = 'other/ocp';
	} else if (kind === 'DNS') {
		image = 'other/ocp';
	} else if (kind === 'Endpoints') {
		image = 'k8/ep';
	} else if (kind === 'EndpointSlice') {
		image = 'k8/eps';
	} else if (kind === 'Etcd') {
		image = 'k8/etcd';
	} else if (kind === 'Event') {
		image = 'k8/evt';
	} else if (kind === 'FlowSchema') {
		image = 'k8/k8';
	} else if (kind === 'HorizontalPodAutoscaler') {
		image = 'k8/hpa';
	} else if (kind === 'Ingress') {
		image = 'k8/ing';
	} else if (kind === 'Job') {
		image = 'k8/job';
	} else if (kind === 'Lease') {
		image = 'k8/k8';
	} else if (kind === 'LimitRange') {
		image = 'k8/limits';
	} else if (kind === 'MutatingWebhookConfiguration') {
		image = 'k8/k8';
	} else if (kind === 'Namespace') {
		image = 'k8/ns';
	} else if (kind === 'Network') {
		image = 'other/ocp';
	} else if (kind === 'NetworkPolicy') {
		image = 'k8/netpol';
	} else if (kind === 'NooBaa' ) {
		image = 'other/redhat';
	} else if (kind === 'Node') {
		image = 'k8/node';
	} else if (kind === 'OCP-CRD') {
		image = 'other/ocp';
	} else if (kind === 'PersistentVolumeClaim') {
		image = 'k8/pvc';
	} else if (kind === 'PersistentVolume') {
		image = 'k8/pv';
	} else if (kind === 'Pod') {
		image = 'k8/pod';
	} else if (kind === 'PodDisruptionBudget') {
		image = 'k8/k8';
	} else if (kind === 'PodSecurityPolicy') {
		image = 'k8/psp';
	} else if (kind === 'PodTemplate') {
		image = 'k8/k8';
	} else if (kind === 'Prometheus') {
		image = 'other/ocp';
	} else if (kind === 'PriorityClass') {
		image = 'k8/k8';
	} else if (kind === 'ReplicaSet') {
		image = 'k8/rs';
	} else if (kind === 'ReplicationController') {
		image = 'k8/rc';
	} else if (kind === 'ResourceQuota') {
		image = 'k8/quota';
	} else if (kind === 'Role') {
		image = 'k8/role';		
	} else if (kind === 'RoleBinding') {
		image = 'k8/rb';		
	} else if (kind === 'RuntimeClass') {
		image = 'k8/k8';		
	} else if (kind === 'Secret') {
		image = 'k8/secret';		
	} else if (kind === 'Service') {
		image = 'k8/svc';		
	} else if (kind === 'ServiceAccount') {
		image = 'k8/sa';			
	} else if (kind === 'StatefulSet') {
		image = 'k8/sts';
	} else if (kind === 'StorageClass') {
		image = 'k8/sc';
	} else if (kind === 'ValidatingWebhookConfiguration') {
		image = 'k8/k8';
	} else if (kind === 'VolumeAttachment') {
		image = 'k8/k8';
	} else if (kind === 'Unknown') {
		image = 'other/unk';
	} else {
		image = 'other/unk';
	}

	// if unknown use the apiGroup to determine image to display
	if (image === 'other/unk') {
		if (typeof api !== 'undefined') {
			if (api.indexOf('openshift') > -1 ) {
				image = 'other/ocp';
			} else if (api.indexOf('.coreos') > -1 ) {
				image = 'other/ocp';
			} else if (api.indexOf('k8s.io') > -1) {
				image = 'k8/k8';
			} else if (api.indexOf('.ibm.') > -1) {
				image = 'other/ibm';
			} else if (api.indexOf('.open-cluster-management.') > -1) {
				image = 'other/ibm';
			} else if (api.indexOf('.ansible.com') > -1) {
				image = 'other/redhat';
			} else if (api.indexOf('core.hybridapp.io') > -1) {
				image = 'other/ibm';
			} else if (api.indexOf('tools.hybridapp.io') > -1) {
				image = 'other/ibm';
			} else if (api.indexOf('deploy.hybridapp.io') > -1) {
				image = 'other/ibm';
			} else if (api.indexOf('noobaa.io') > -1) {
				image = 'other/redhat';
			} else if (api.indexOf('.rook.') > -1) {
				image = 'other/rook';
			} else if (api.indexOf('.konghq.com') > -1) {
				image = 'other/kong';
			} else if (api.indexOf('.cattle.') > -1) {
				image = 'other/rancher';
			} else if (api.indexOf('.volcano.') > -1) {
				image = 'other/volcano';
			}
		}  
	}

	if (image === 'other/unk') {
		console.log('Kind: ' + kind + ' API: ' + api)
	}

	return image;
	
}

function buildSvgInfo(data, fnum, type) {
	let id = fnum+'.'+type;
	let tName = type;
	if (typeof svgInfo[id] === 'undefined') {
		svgInfo[id] = [];
	}
	let content = buildTipContent(data, type, fnum)
	if (type === 'Phase') {
		tName = 'Pod Phase / IPs'
	}
	if (type === 'CRD') {
		tName = 'CustomResourceDefinition'
	}
	// check if an entry already exists, if so skip
	if (typeof svgInfo[id][0] === 'undefined') {
		svgInfo[id].push('<span style="font-size: 0.80rem; text-decoration: underline;">' + tName + '</span><br><span style="font-size: 0.70rem;">' + content + '</span>');
	}
	return id;
}


function buildTipContent(data, type, fnum) {
	let cnt = 0;
	let content = '';

	if (typeof data === 'undefined') {
		content =  'No info available';
		content = '<div class="vpkfont-xsm">' + content + '</div>'
		return content;
	}

	if (type === 'Unknown') {
		content = 'No resource type located or failed to properly be created.';

	} else if (type === 'Cluster') {
		content = 'Name: ' + data + '<br>';  

	} else if (type === 'ClusterRole') {
		if (typeof data !== 'undefined' ) {
			cnt = 0;			
			content = content + 'Name: ' + data.roleRefName;  
		}

	} else if (type === 'ClusterRoleBinding') {
		if (typeof data !== 'undefined' ) {
			cnt = 0;			
			content = content + 'Name: ' + data.crbName;  
		}

	} else if (type === 'Conditions') {
		if (typeof data.conditions !== 'undefined') {
			if (typeof data.conditions[0] !== 'undefined' ) {
				cnt = 0;			
				for (let k = 0; k < data.conditions.length; k++) {
					cnt++;
					content = content + '- &nbsp;&nbsp;<b>Type:</b> ' + data.conditions[k].type + '<br>'
					       + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Status:</b> ' + data.conditions[k].status + '<br>';
					if (typeof data.conditions[k].message !== 'undefined') {
						content = content + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Message:</b> ' + data.conditions[k].message + '<br>'
					}
					if (typeof data.conditions[k].reason !== 'undefined') {
						content = content + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Reason:</b> ' + data.conditions[k].reason + '<br>'
					}					
					content = content + '<br>'
				}
			}	
		}

	} else if (type === 'ConfigMap') {
		if (typeof data[0] !== 'undefined' ) {
			cnt = 0;			
			for (let k = 0; k < data.length; k++) {
				cnt++;
				content = content + '(' + cnt + ') Name: ' + data[k].name + ' (Used by: '+ data[k].use +')<br>';
			}
		} else {
			if (typeof data.name !== 'undefined') {
				content = 'Name: ' + data.name;
			}
		}

	} else if (type === 'Container') {
		content = '' 
		if (typeof data.containerNames !== 'undefined' ) {
			for (let k = 0; k < data.containerNames.length; k++) {
				content = content 
				+ '- &nbsp;&nbsp;<b>Name:</b> ' + data.containerNames[k].c_name + '<br>'
				+ '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Image:</b> ' + data.containerNames[k].c_image + '<br>';
			}
		}	

	} else if (type === 'ContainerStatus' || type === 'InitContainerStatus') {    // container status
		if (typeof data !== 'undefined' ) {
			cnt = 0;			
			content = '';
			//content = formatJSON(data) + '<br>' 
			content = content 
				+ 'Name: ' + data.name + '<br>' 
				+ 'Restart Count: ' + data.restartCount + '<br>' 
			
		} else {
			content = 'No statuses located'
		}

	} else if (type === 'ControllerRevision') {
		if (typeof data[0] !== 'undefined' ) {
			cnt = 0;			
			content = content + 'Name: ' + data[0].name;  
		}	

	} else if (type === 'CRD') {  //CustomResourceDefinition
		content = 'Name: ' + data;  

		
	} else if ( type === 'DaemonSet' || 
				type === 'Deployment' || 
				type === 'DeploymentConfig' || 
				type === 'ReplicaSet' || 
				type === 'ReplicationController' ||
				type === 'StatefulSet' ) {
		content = 'Name: ' + data.name ; 

	} else if (type === 'EndPoint') {
		if (typeof data[0] !== 'undefined' ) {
			cnt = 0;			
			for (let k = 0; k < data.length; k++) {
				content = content + 'Name: ' + data[k].name ;  
			}
		}

	} else if (type === 'EndPointSlice') {
		if (typeof data[0] !== 'undefined' ) {
			cnt = 0;			
			for (let k = 0; k < data.length; k++) {
				content = content + 'Name: ' + data[k].name ;  
			}
		}

	} else if (type === 'HorizontalPodAutoscaler') {
		content = formatJSON(data);  

	} else if (type === 'Namespace') {
		content = 'Name: ' + data + '<br>';  

	} else if (type === 'PersistentVolumeClaim') {
		if (typeof data[0] !== 'undefined' ) {
			cnt = 0;			
			for (let k = 0; k < data.length; k++) {
				content = content + 'Name: ' + data[k].pvcName;
				if (typeof data[k].pcvStorageClass !== 'undefined') {
					if (data[k].pcvStorageClass !== '') {
						content = content + 'Storage class: ' + data[k].pcvStorageClass + '<br>';  
					}
				}
				if (typeof data[k].pcvVolumeName !== 'undefined') {
					if (data[k].pcvVolumeName !== '') {
						content = content + 'Volume name: ' + data[k].pcvVolumeName + '<br>';  
					}
				}
				if (typeof data[k].pcvSelectorLabel !== 'undefined') {
					if (data[k].pcvSelectorLabel !== '') {
						content = content + 'Selector label: ' + data[k].pcvSelectorLabel + '<br>';  
					}
				}
			}
		}	

	} else if (type === 'PersistentVolume') {
		if (typeof data[0] !== 'undefined' ) {
			cnt = 0;			
			for (let k = 0; k < data.length; k++) {
				content = content + 'Name: ' + data[k].pvName + '<br>';
				if (data[k].pvLocalPath !== '') {
					content = content + 'Local path: ' + data[k].pvLocalPath + '<br>';
				}  
				if (data[k].pvHostPath !== '') {
					content = content + 'Host path: ' + data[k].pvHostPath + '<br>';
				}  
				if (data[k].pvNFSPath !== '') {
					content = content + 'NFS path: ' + data[k].pvNFSPath + '<br>';
				}			}
		}	

	} else if (type === 'Phase') {  //Pod Phase
		content = 'None located';
		if (typeof data.status !== 'undefined') {
			content = '';
			if (typeof data.status.hostIP !== 'undefined') {
				content = content + 'HostIP: ' + data.status.hostIP + '<br>';
			}
			if (typeof data.status.podIP !== 'undefined') {
				content = content + 'PodIP: ' + data.status.podIP + '<br>';
			}
			if (typeof data.status.podIPs !== 'undefined') {
				if (typeof data.status.podIPs.length > 1 !== 'undefined') {
					content = content + 'PodIPs: <br>' + formatJSON(data.status.podIPs) + '<br>';
				}
			}			
		}

	} else if (type === 'Pod') {
		content = '';
		if (typeof data.name !== 'undefined' ) {
			content = content + 'Name: ' + data.name + '<br>';
			if (typeof data.Volume !== 'undefined' ) {
				content = content + 'Volume(s):' + '<br>'
				cnt = 0;			
				for (let k = 0; k < data.Volume.length; k++) {
					cnt++;
					content = content + '(' + cnt + ') ' + data.Volume[k].name + '<br>';  
				}			
			}
		}	
	} else if (type === 'Node') {
		content = 'Name: ' + data.name + '<br>';
	
	} else if (type === 'Ref') {
		content = '';
		content = content + data;  
	
	} else if (type === 'Secret') {
		if (typeof data[0] !== 'undefined' ) {
			cnt = 0;			
			for (let k = 0; k < data.length; k++) {
				cnt++;
				content = content + '(' + cnt + ') Name:' + data[k].name + ' (Used by:'+ data[k].use +')<br>';
			}
		}	

	}  else if (type === 'Service') {
		content = fnum + '<br>' 
		if (typeof data[0] !== 'undefined' ) {
			cnt = 0;			
			for (let k = 0; k < data.length; k++) {
				cnt++;
                content = 'Name: ' + data[k].name+ '<br>';
                if (typeof data[k].type !== 'undefined') {
                    content = content + 'Type: ' + data[k].type;
                }
			}
		}	
	} else 	if (type === 'ServiceAccount') {
		if (typeof data[0] !== 'undefined' ) {
			cnt = 0;			
			for (let k = 0; k < data.length; k++) {
				cnt++;
				content = content + '(' + cnt + ') Name: ' + data[k].name + '<br>';
			}
		}

	} else if (type === 'StorageClass') {
		if (typeof data[0] !== 'undefined' ) {
			cnt = 0;			
			for (let k = 0; k < data.length; k++) {
				content = content + 'Name: ' + data[k].storageClassName ;  
			}
		}	

	} else {
		content = 'Name: ' + data.name  + '<br>' + 'Type: ' + type;
	}
	content = '<div class="vpkfont-xsm">' + content + '</div>'
	return content;	
}

function buildRBACUsage() {
    whereRoleRefs = {};
	whereRoleBound = {};

	let keys = Object.keys(k8cData);
    let key = '';
    let newKeys = [];
    let newKey;
    let bind;

    // build list of keys and pull out only the 0000- keys
    if (keys.length > 0) {
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
        //clear temp vars
        newKeys = null;
        newKey = null;
    } else {
        // should this return a message that nothing was found
    }

	// build whereBound array 
	for (let k = 0; k < keys.length; k++) {
        key = keys[k];
        //data to show
        if (typeof k8cData[key].RoleBinding !== 'undefined') {
            let bindings = k8cData[key].RoleBinding;
            bindings.sort((a, b) => (a.name > b.name) ? 1 : (a.names === b.name) ? ((a.fnum > b.fnum) ? 1 : -1) : -1 );
            let hl = bindings.length;
            for (r = 0; r < hl; r++) {
                bind = bindings[r];
                populateWhereRoleBound(bind);
                populateWhereRoleRefs(bind);
            }
            updateSecurityBindingCounts(key);
        } else {
            console.log('No RoleBinding located for namespace: ' + key)
        }
    }
}


//For each role binding track where it's bound
function populateWhereRoleRefs(binding) {
    let kind = binding.kind;
    let bindingName = binding.name;
    let bindingNamespace = binding.namespace;
    let roleRefName = binding.roleRef.name;
    let roleRefKind = binding.roleRef.kind;
    let row = '';
    let ns = ''

    if (typeof whereRoleRefs[roleRefName] === 'undefined') {
        whereRoleRefs[roleRefName] = [];
    }

    if (typeof binding.subjects !== 'undefined') {
        for (let b = 0; b < binding.subjects.length; b++) {
            if (typeof binding.subjects[b].namespace === 'undefined') {
                ns = '&lt;clusterLevel&gt;'
            } else {
                ns = binding.subjects[b].namespace;
            }
            row = {
                'kind': kind,
                'bindingName': bindingName,
                'bindingNamespace': bindingNamespace,
                'roleRefKind': roleRefKind,
                'subjectName': binding.subjects[b].name,
                'subjectKind': binding.subjects[b].kind,
                'subjectNamespace': ns,
                'fnum': binding.fnum
            };
            //console.log(JSON.stringify(row))
            whereRoleRefs[roleRefName].push(row);
        }
    }
}


//For each role binding track where it's bound
function populateWhereRoleBound(binding) {
    let roleName = binding.roleRef.name;
    if (roleName === 'default') {
        console.log('k')
    }

	if (typeof whereRoleBound[roleName] === 'undefined') {
		whereRoleBound[roleName] = {
			'ClusterRoleBinding': {'ClusterRole': [],'Role': [] },
			'RoleBinding': {'ClusterRole': [],'Role': [] },
		}
	} 

	if (typeof binding.roleRef.kind === 'undefined') {
		if (binding.kind === 'ClusterRoleBinding') {
			binding.roleRef.kind = 'ClusterRole';
		} else {
			binding.roleRef.kind = 'Role';
		} 
		console.log('No roleRef.kind for fnum: ' + binding.fnum + ' changed to ' + binding.roleRef.kind);
	}

	if (binding.kind === 'RoleBinding') {
		roleBindingCnt++
	} else if (binding.kind === 'ClusterRoleBinding') {
		clusterRoleBindingCnt++
	}
	
	if (binding.roleRef.kind === 'Role') {
		roleRefRoleCnt++;
	} else if (binding.roleRef.kind === 'ClusterRole') {
		roleRefClusterRoleCnt++;
	}

	try {
		if (typeof whereRoleBound[roleName][binding.kind][binding.roleRef.kind] === 'undefined' ) {
			whereRoleBound[roleName][binding.kind][binding.roleRef.kind] = [];
		}

		whereRoleBound[roleName][binding.kind][binding.roleRef.kind].push({
			'fnum': binding.fnum,
			'subjects': binding.subjects
		})
	} catch (e) {
		console.log(e)
	}
	

}


// build the Role information to populate the secInfoModal for Role
function buildSecModalRole(data, key, rColor) {
	let role = data;
	let item;
	let rtn = '';
	let grpInfo = '';
	let resourceNames = '';
	let resources = '';
	let verbs = '';
	let category = '';
	let fnum = '<na>';

	if (typeof role.fnum !== 'undefined') {
		fnum = role.fnum;
	} else {
		fnum = '9999999.0';
	}


	let roleId = 
	  '<div class="d-flex justify-content-between vpkcolor vpkfont-md mb-0">'
//	+ '  <div>Role Name:&nbsp;<span class="text-light bg-success vpkfont-md">' + key + '</span></div>'
	+ '  <div>Role Name:&nbsp;<span class="vpkfont-md ' + rColor + '">' + key + '</span></div>'
	+ '  <div><span class"vpkfont-md vpkcolor">ID#:&nbsp;<span onclick="getDef7(\'' + fnum + '\')">' + fnum + '</span>'
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


// how to do
// https://stackoverflow.com/questions/11219582/how-to-detect-my-browser-version-and-operating-system-using-javascript
function browserUsageDetails () {

	var nVer = navigator.appVersion;
	var nAgt = navigator.userAgent;
	var browserName  = navigator.appName;
	var fullVersion  = ''+parseFloat(navigator.appVersion); 
	var majorVersion = parseInt(navigator.appVersion,10);
	var nameOffset,verOffset,ix;
	
	// In Opera, the true version is after "Opera" or after "Version"
	if ((verOffset=nAgt.indexOf("Opera"))!=-1) {
	 browserName = "Opera";
	 fullVersion = nAgt.substring(verOffset+6);
	 if ((verOffset=nAgt.indexOf("Version"))!=-1) 
	   fullVersion = nAgt.substring(verOffset+8);
	}
	// In MSIE, the true version is after "MSIE" in userAgent
	else if ((verOffset=nAgt.indexOf("MSIE"))!=-1) {
	 browserName = "Microsoft Internet Explorer";
	 fullVersion = nAgt.substring(verOffset+5);
	}
	// In Chrome, the true version is after "Chrome" 
	else if ((verOffset=nAgt.indexOf("Chrome"))!=-1) {
	 browserName = "Chrome";
	 fullVersion = nAgt.substring(verOffset+7);
	}
	// In Safari, the true version is after "Safari" or after "Version" 
	else if ((verOffset=nAgt.indexOf("Safari"))!=-1) {
	 browserName = "Safari";
	 fullVersion = nAgt.substring(verOffset+7);
	 if ((verOffset=nAgt.indexOf("Version"))!=-1) 
	   fullVersion = nAgt.substring(verOffset+8);
	}
	// In Firefox, the true version is after "Firefox" 
	else if ((verOffset=nAgt.indexOf("Firefox"))!=-1) {
	 browserName = "Firefox";
	 fullVersion = nAgt.substring(verOffset+8);
	}
	// In most other browsers, "name/version" is at the end of userAgent 
	else if ( (nameOffset=nAgt.lastIndexOf(' ')+1) < 
			  (verOffset=nAgt.lastIndexOf('/')) ) 
	{
	 browserName = nAgt.substring(nameOffset,verOffset);
	 fullVersion = nAgt.substring(verOffset+1);
	 if (browserName.toLowerCase()==browserName.toUpperCase()) {
	  browserName = navigator.appName;
	 }
	}
	// trim the fullVersion string at semicolon/space if present
	if ((ix=fullVersion.indexOf(";"))!=-1)
	   fullVersion=fullVersion.substring(0,ix);
	if ((ix=fullVersion.indexOf(" "))!=-1)
	   fullVersion=fullVersion.substring(0,ix);
	
	majorVersion = parseInt(''+fullVersion,10);
	if (isNaN(majorVersion)) {
	 fullVersion  = ''+parseFloat(navigator.appVersion); 
	 majorVersion = parseInt(navigator.appVersion,10);
	}


	usageBrowserName = browserName;
	usageFullVersion = fullVersion;
	usageMajorVersion = majorVersion;
	usageNavigatorAppName = navigator.appName;
	usageNavigatorUserAgent = navigator.userAgent;

	// async function run() {
	// 	const result = await performance.measureMemory();
	// 	console.log(result);
	//   }
	// run();
	try {
		let memU = window.performance.memory;
		if (typeof memU!== 'undefined') {
			console.log(typeof memU)
			usageJSHeapSizeLimit = memU.jsHeapSizeLimit;
			usageJSHeapTotal = memU.totalJSHeapSize;
			usageJSHeapUsed = memU.usedJSHeapSize;
		}
	} catch (e) {
		console.log('unable to get browser memeory usage')
	}
}


function formatUsage(data) {
    let rtn = '<div class="events ml-2 mr-2 mb-2 vpkcolor" ><hr><table style="width:100%">'
    rtn = rtn + usageLine('Architecture', data.header.arch);
    rtn = rtn + usageLine('Machine', data.header.osMachine);
    rtn = rtn + usageLine('OS Name', data.header.osName);
    rtn = rtn + usageLine('OS Release', data.header.osRelease);
    
    rtn = rtn + usageLine('Processor', data.header.cpus[0].model);
    rtn = rtn + usageLine('CPU count', data.header.cpus.length);
    rtn = rtn + usageLine('User CPU seconds', data.resourceUsage.userCpuSeconds);
    rtn = rtn + usageLine('Kernel CPU seconds', data.resourceUsage.kernelCpuSeconds);

    rtn = rtn + usageLine('Heap total memory', formatBytes(data.javascriptHeap.totalMemory) );
    rtn = rtn + usageLine('Heap committed memory', formatBytes(data.javascriptHeap.totalCommittedMemory) );
    rtn = rtn + usageLine('Heap used memory', formatBytes(data.javascriptHeap.usedMemory) );
    rtn = rtn + usageLine('Heap available memory', formatBytes(data.javascriptHeap.availableMemory) );
    rtn = rtn + usageLine('Heap memory limit', formatBytes(data.javascriptHeap.memoryLimit) );
    
    rtn = rtn + usageLine('Network host name', data.header.host);
    let nI = data.header.networkInterfaces
    for (let i = 0; i < nI.length; i++) {
        if ( nI[i].internal === false && nI[i].family === 'IPv4') {
            rtn = rtn + usageLine('Network interface name', nI[i].name );
            rtn = rtn + usageLine('Network MAC', nI[i].mac );
            rtn = rtn + usageLine(nI[i].family + ' Address', nI[i].address );
        }
    }
    rtn = rtn + usageLine('Current working directory', data.header.cwd );
    rtn = rtn + usageLine('Node.js version', data.header.nodejsVersion );
    //browser related fields
    browserUsageDetails();
    rtn = rtn + usageLine('Browser name', usageBrowserName );
    rtn = rtn + usageLine('Browser version', usageFullVersion );
    rtn = rtn + usageLine('Browser agent', usageNavigatorUserAgent );
    // at this time only chrome browser provides memory stats
    if (usageJSHeapSizeLimit !== 0) {
        rtn = rtn + usageLine('Browser Heap total memory', formatBytes(usageJSHeapTotal) );
        rtn = rtn + usageLine('Browser Heap used memory', formatBytes(usageJSHeapUsed) );
        rtn = rtn + usageLine('Browser Heap memory limit', formatBytes(usageJSHeapSizeLimit) );
    }
    rtn = rtn + '</table></div>';
    return rtn;
}

function usageLine(v1, v2) {
    let trP1 = '<tr class="vpkcolor">';
    let trP2 = '</tr>';
    let tdR = '<td width="40%" style="text-align: right; padding-right: 30px;" >';
    let tdL = '<td width="60%">';
    let tdP2 = '</td>';
    return trP1 + tdR + '<b>' + v1 + ':</b>' + tdP2 + tdL + v2 + tdP2 + trP2;
}

function formatBytes (bytes, decimals = 2) {
    if (bytes === 0) {
        return '0 Bytes';
    }
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}



function showTooltip(evt, text) {
    let tooltip = document.getElementById("tooltip");
    let info = 'No information available';
    if (typeof svgInfo[text] !== 'undefined') {
        info = svgInfo[text]
    }

    tooltip.innerHTML = info;
    tooltip.style.display = "block";
    tooltip.style.left = evt.pageX + 10 + 'px';
    tooltip.style.top = evt.pageY + 10 + 'px';
}

function hideTooltip() {
    var tooltip = document.getElementById("tooltip");
    tooltip.style.display = "none";
}


function pickData(tmp) {
    tmp.trim();
    if (tmp === 'Running cluster') {
        getCluster();
    } else {
        changeDir();
    } 
}

function showMessage(msg, type) {
    if (typeof msg === 'undefined') {
        msg = 'No message provided'
    }
    var msgClass = 'alert-secondary'
    $("#messageText").html(msg)
    $("#messageDiv").removeClass("hide");
    $("#messageDiv").addClass("msgClass");
    $("#messageDiv").addClass("show");
}

function hideMessage() {
    $("#messageDiv").removeClass("show");
    $("#messageDiv").addClass("hide");
}

// used by vpkBuildSecArray and vpkSecUsage
function getSecRole(key, rColor, ns) {
    let html = key;
    let info = k8cData['0000-@clusterRoles@'].Role;
    if (typeof info !== 'undefined') {
        for (let i = 0; i < info.length; i++) {
            if (info[i].name === key) {
                html = buildSecModalRole(info[i], key, rColor)
            }
        }
    } else {
        html = 'Unable to find information for role: ' + key;
	}
	
	// if equal not found at cluster level, now check namespace level
	if (html === key) {
		let info = k8cData[ns].Role;
		if (typeof info !== 'undefined') {
			for (let i = 0; i < info.length; i++) {
				if (info[i].name === key) {
					html = buildSecModalRole(info[i], key, rColor)
				}
			}
		}
	}

    $("#secInfoContent").html(html)
    $("#secInfoModal").modal('show')
}

function checkIfDataLoaded() {
    if (rootDir === 'No datasource connected' || rootDir === '-none-') {
        showMessage('No datasource has been connected', 'fail');
    } else {
        hideMessage();
    }
}

function setBaseDir(dir) {
    if (dir === '-none-' || dir === '' ) {
        dir = 'No datasource connected';
    }
    rootDir = dir;
    $("#baseDir").empty();
    $("#baseDir").html('');
    $("#baseDir").html(dir);
    $("#tableL").bootstrapTable('removeAll')
}

function bldXrefRulesTable() {
	xrefRuleCountFound = 0;
	let ruleCnt = 0;
	let picked = xrefData.picked;
	let rules;
	let divSection = '<hr><table style="width:100%">';
	let header = '<tr class="rulesList vpkfont"><th class="text-center">K8 Kind</th>' 
	+ '<th class="text-center">Path</th><th class="text-center">Enabled</th></tr>'
	+ '<td width="10%">' + hrLow + '</td>' 
	+ '<td width="80%">' + hrLow + '</td>' 
	+ '<td width="10%">' + hrLow + '</td>'
	+ '</tr>';

	let tbl = divSection + header;
	let ruleKeys = Object.keys(xrefData.rules);
	let rKey;
	let item;
	let nsHtml = '';
	let onOff;
	try {
		for (let r = 0; r < ruleKeys.length; r++) {
			rKey = ruleKeys[r];
			rules = xrefData.rules[rKey];
			for (let x = 0; x < rules.length; x++) {
				if (rules[x].xrk === picked) {
					ruleCnt++;
					if (rules[x].xon === true) {
						onOff = 'true';
					} else {
						onOff = 'false'
					}
					item = '<tr>' 
					+ '<td width="10%" class="pl-5 pr-5 text-center vpkfont">' + rKey + '</td>' 
					+ '<td width="80%" class="ml-4 vpkfont" onclick="xrefEditPathRule(\'' + rKey + ':' + x + '\')">' + rules[x].xrw + '</td>' 
					+ '<td width="10%" class="ml-4 text-center vpkfont">' + onOff + '</td>' 
					+ '</tr>';
					nsHtml = nsHtml + item
	
					item = '<tr>' 
					+ '<td width="10%">' + hrLow + '</td>' 
					+ '<td width="80%">' + hrLow + '</td>' 
					+ '<td width="10%">' + hrLow + '</td>'
					+ '</tr>';
					nsHtml = nsHtml + item
				}
			}
		}
		tbl = tbl + nsHtml + '</table>';

		$("#xrefTable").html(tbl);
		xrefRuleCountFound = ruleCnt;

	} catch (err) {
		console.log('Error building xrefRulesTable: ' + err);
	}
}


//----------------------------------------------------------
console.log('loaded vpkcommon.js');