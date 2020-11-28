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

//----------------------------------------------------------
// document ready
//----------------------------------------------------------
$(document).ready(function() {

    // get version from server
    getVersion();

    $("#instructions").addClass("active");
    $("#instructions").addClass("show");
    $("#searchR").removeClass("active");
    $("#searchR").removeClass("show");
    $("#graphic").removeClass("active");
    $("#graphic").removeClass("show");
    $("#schematic").removeClass("active");
    $("#schematic").removeClass("show");
    $("#security").removeClass("active");
    $("#security").removeClass("show");

    // get the name of selected tab and process
    $( 'a[data-toggle="tab"]' ).on( 'shown.bs.tab', function( evt ) {
        currentTab = $( evt.target ).attr( 'href' );
        // take action based on what tab was shown
        if(currentTab === "#instructions") {
            checkIfDataLoaded();
            $('#svgResults').hide();
            $('#charts').hide();
            $('#schematic').hide();
            $('#security').hide();
        } else if (currentTab === "#searchR") {
            checkIfDataLoaded();
            $('#svgResults').show();
            $('#charts').hide();
            $('#schematic').hide();
            $('#security').hide();
        } else if (currentTab === "#schematic") {
            checkIfDataLoaded();
            $('#svgResults').hide();
            $('#charts').hide();
            $('#schematic').show();
            $('#security').hide();
        } else if (currentTab === "#graphic") {
            checkIfDataLoaded();
            $('#svgResults').hide();
            $('#charts').show();
            $('#schematic').hide();
            $('#security').hide();
        } else if (currentTab === "#security") {
            checkIfDataLoaded();
            $('#svgResults').hide();
            $('#charts').hide();
            $('#schematic').hide();
            $('#security').show();
        }
    });

    $("#tableL").on("click-cell.bs.table", function (field, value, row, $el) {
        selectedDef = $el.src + '::' + $el.part + '::' + $el.value;
        getDef(selectedDef);
     });


    $('#pickDataSource').select2({
        dropdownCssClass: "vpkfont-md",
        containerCssClass: "vpkfont-md",
        placeholder: "Select data source"
    });

    $('#pickDataSource').on('select2:select', function (e) { 
        var selected = $('#pickDataSource option:selected').val();
        pickData(selected);
        $('#pickDataSource').val(null)
    });

    $('#label-filter').select2({
        dropdownCssClass: "vpkfont-md",
        containerCssClass: "vpkfont-md"
    }); 

    $('#anno-filter').select2({
        dropdownCssClass: "vpkfont-md",
        containerCssClass: "vpkfont-md"
    });  

    $('#dsInstances').select2({
        dropdownCssClass: "vpkfont-md",
        containerCssClass: "vpkfont-md",
        placeholder: "select instance"
    }); 

    $('#graphic-ns-filter').select2({
        dropdownCssClass: "vpkfont-md",
        containerCssClass: "vpkfont-md",
        placeholder: "select namespace(s)"
    }); 

    $("#searchBtn").click(function(e) {
        e.preventDefault();
        searchObj();
    });

    // $("#validateBtn").click(function(e) {
    //     e.preventDefault();
    //     reload();
    // });

	// 
	$("#clusterType").change(function(){
		var selected = $('#clusterType option:selected').val();
        buildClusterUI(selected);
	});

    editor = ace.edit("editor");

	// switch edit theme
	$("#eTheme").change(function(){
		var selected = $('#eTheme option:selected').val();
        editor.setTheme("ace/theme/" + selected );
	});

    //  
	// switch font size in editor
	$("#eFont").change(function(){
		var selected = $('#eFont option:selected').val();
        var size = parseInt(selected, 10);
        editor.setFontSize(size)
	});

    $('[data-toggle="popover"]').popover();

    $('[data-toggle="tooltip"]').tooltip();

    //clearDisplay();
    getSelectLists();
    getConfig();

});

function printObject(o) {
    var out = '';
    for (var p in o) {
      out += p + ': ' + o[p] + '\n';
    }
    alert(out);
  }


//----------------------------------------------------------
// socket io definitions for incoming 
//----------------------------------------------------------
// socket.on('colorsResult', function(data) {
//     colors = data;
// });

socket.on('connect', function(data) {
    socket.emit('join', 'Session connected');
});

socket.on('dirStatsResult', function(data) {
    dsCounts = data;
    if (dsToggle === 'kind' || dsToggle === '') {
        buildKindStats();
    } else {
        buildNamespaceStats();
    }
});

socket.on('dynamicResults', function(data) {
    //$("#clusterStatus").empty();
    //$("#clusterStatus").html('');
    if (typeof data === 'undefined') {
        data = {'status': 'unknown', 'message': 'Status unknown'}
    } else {
        if (typeof data.status === 'undefined') {
            data.status = 'unknown';
        }  
        if (typeof data.message === 'undefined') {
            data.status = 'Status unknown';
        } 
    }
    var resp = '';
    if (data.status === 'PASS') {
        showMessage('Datasource connection completed', 'pass')
        $("#clusterModal").modal('hide');
        $("#clusterModalFooter").show();
        $("#clusterRunning").hide();
    } else {
        var message = data.message;
        resp = '<br><div>&nbsp;&nbsp;&nbsp;&nbsp;'  + message + '</div>';
        //$("#clusterModalFooter").show();
        $("#clusterRunning").hide();
        $("#clusterStatus").html(resp);
    }
});

socket.on('getKStatus', function(data) {
    $("#clusterModalFooter").hide();
    $("#clusterStatus").empty();
    $("#clusterStatus").html('');
    var resp;
    resp = '<br><div class="vpkfont vpkcolor">' + data + '</div>';
    $("#clusterStatus").html(resp); 

});

socket.on('saveFileResults', function(data) {
    $("#saveeStatus").empty();
    $("#saveStatus").html('');
    var resp = '<div class="ml-2 mt-0 pt-0 mb-0 pb-0">' + data.message + '</div>';
    $("#saveStatus").html(resp); 
});

socket.on('dynstat', function(data) {
    console.log('socket: dynstat');
    //console.log(JSON.stringify(data, null, 4));
});

socket.on('hierarchyResult', function(data) {
    $("#charts").empty();
    $("#charts").html('<svg width="50" height="50"></svg>');
    //$("#chartInfo").empty();
    $("#chartInfo").html('Click blue dot to expand or collapse.  Red dot is final point of branch.');

    if (chartType === 'hierarchy') {
        $("#charts").empty();
        $("#charts").html('<svg width="50" height="50"></svg>');
        chartHierarchy(data);
    } else if (chartType === 'collapsible') {
        $("#charts").empty();
        $("#charts").html('<svg></svg>');
        chartCollapsible(data);
    } else if (chartType === 'circlePack') {
        $("#charts").empty();
        $("#charts").html('<svg></svg>');
        chartCirclePack(data);
    } else if (chartType === 'tree') {
        $("#charts").empty();
        $("#charts").html('<svg></svg>');
        chartTree(data);
    }
});

// retrieve object definition
socket.on('objectDef', function(data) {
    // always edit, no longer provide browse 
    editDef(data);
});

// decoded secret
socket.on('decodeDef', function(data) {
    $("#decodeName").empty();
    $("#decodeName").html('&nbsp;' + data.secret + '&nbsp;');
    $("#decode").empty();
    $("#decode").html(JSON.stringify(data.value, null, 4));
    $('#decodeModal').modal('show');
});

socket.on('resetResults', function(data) {
    if (data.validDir === false) {
        setBaseDir(data.baseDir);
        $("#chgDirModal").modal('hide');
        var resultMsg = 'Failed to connect to datasource';
        var resultStatus = 'fail';
        showMessage(resultMsg, resultStatus);
    } else {
        setBaseDir(data.baseDir);
        rootDir = data.baseDir;
        baseDir = data.baseDir;
        $("#loadStatus").hide();
        $("#chgDirFooter").show();
        $("#chgDirModal").modal('hide');
        showMessage('Existing datasource connected', 'pass');
        getSelectLists('y');
    }
});
              
socket.on('schematicResult', function(data) {
    k8cData = data.data;
    hideMessage();
    schematic();       
});

socket.on('securityResult', function(data) {
    k8cData = data.data;
    hideMessage();
    security();       
});

socket.on('selectListsResult', function(data) {
    clusterProviders = data.providers;
    populateSelectLists(data);
});

socket.on('searchResult', function(data) {
    //console.log(JSON.stringify(data, null, 4))
    buildSearchResults(data);
});

socket.on('svgResult', function(data) {
    svgResult(data);
});

socket.on('usageResult', function(data) {
    console.log(JSON.stringify(data, null,2 ))
    let content = formatUsage(data);

    $("#usageRunning").hide();
    $("#usageResult").empty();
    $("#usageResult").html(content);
    $("#usageResult").show();
});


socket.on('version', function(data) {
    version = data.version;
});

socket.on('saveConfigResult', function(data) {
    $("#configModal").modal('hide'); 
    if (data.result.status === 'PASS') {
        showMessage(data.result.message, 'pass')
    } else {
        showMessage(data.result.message, 'fail')
    }
});

socket.on('getConfigResult', function(data) {
    
    if (data.config.managedFields === true) {
        $('#mgmFlds').bootstrapToggle('on');
    } else {
        $('#mgmFlds').bootstrapToggle('off');
    }

    if (data.config.statusSection === true) {
        $('#statusFlds').bootstrapToggle('on');
    } else {
        $('#statusFlds').bootstrapToggle('off');
    }
    $("#configModal").modal('show');    
});
    

socket.on('clusterDirResult', function(data) {
    //build the drop down of existing directories, hide messages, open modal
    var items = bldClusterDir(data.dirs);
    hideMessage();
    $('#dsInstances').html(items);
    $("#chgDirModal").modal('show');

});


//----------------------------------------------------------
// socket io definitions for out-bound
//----------------------------------------------------------
function saveConfig() {
    let sFlds = document.getElementById('statusFlds').checked;
    let mFlds = document.getElementById('mgmFlds').checked;

    if (typeof sFlds === 'undefined') {
        sFlds = false;
    }
    if (typeof mFlds === 'undefined') {
        mFlds = false;
    }
    socket.emit('saveConfig', { "managedFields": mFlds, "statusSection": sFlds} );
}


function showConfig() {
    socket.emit('getConfig');
}

function closeChgDir() {
    $("#chgDirModal").modal('hide')
}

function barAction(act) {
    alert(act);
}

function showMessage(msg, type) {
    if (typeof msg === 'undefined') {
        msg = 'No message provided'
    }
    var msgClass = 'alert-secondary'

        if (type === 'pass') { 
            msgClass = 'alert-success'
        } else if (type === 'warn') {
            msgClass = 'alert-warning'
        }  else if (type === 'fail') {
            msgClass = 'alert-danger'
        } else {
            msgClass = 'alert-secondary'
        }

    $("#messageText").html(msg)
    $("#messageDiv").removeClass("hide");
    $("#messageType").removeClass("alert-warning alert-success alert-danger alert-secondary");

    $("#messageDiv").addClass(msgClass);
    $("#messageDiv").addClass("show");
    $("#messageDiv").addClass("vpkfont-md");
}

function hideMessage() {
    $("#messageDiv").removeClass("show");
    $("#messageDiv").addClass("hide");
}

// pass data to relations 
function bldSchematic() {
    hideMessage();
    socket.emit('schematic');
}

// pass data to relations 
function bldSecurity() {
    hideMessage();
    socket.emit('security');
}

// request to clear directory stats
function clearStats() {
    $("#statsData").empty();
    $("#statsData").html('');
}

function saveFile() {
    $("#saveStatus").empty();
    $("#saveStatus").html('');
    var document = editor.getValue();
    data = {"filename": currentEditFile, "content": document}
    socket.emit('saveFile', data);
}

function saveFileAs() {
    var resp = '<div class="col-md-12 pb-2">' 
    + '<label for="saveAsName">&nbsp;New file name:&nbsp;</label>'
    + '<input id="saveAsName" class="form-control-sm col-6">' 
    + '<button id="saProcess" class="btn btn-sm btn-outline-primary ml-4" onclick="processSA()">&nbsp;Process</button>'
    + '<button id="saCancel" class="btn btn-sm btn-outline-primary ml-4" onclick="cancelSA()">&nbsp;Cancel</button>'
    + '</div>'

    $("#saveStatus").empty();
    $("#saveStatus").html('');
    $("#saveStatus").html(resp);
    resp = '';
    // hide the footer
    $("#saFooter").hide();
}

function cancelSA() {
    $("#saveStatus").empty();
    $("#saveStatus").html('');
    $("#saFooter").show();
}

function showEvents(what) {
    what = '#' + what;
    // (\'events-' + evtCnt +'\')
    if($(what).is('.collapse:not(.show)')) {
        $(what).collapse("show");
    } else {
        $(what).collapse("hide");
    }
}

function toggleFilterPanel() {
    if($('#filterdata').is('.collapse:not(.show)')) {
        // not open, open it
        $("#filterButton").html('Close filter panel');
        $("#filterdata").collapse("show");
    } else {
        $("#filterButton").html('Open filter panel');
        $("#filterdata").collapse("hide");
    }
}

function closeGetCluster() {
    //clearDisplay();
    getSelectLists();
    $("#clusterModal").modal('hide');
}

function processSA() {
    var nfn = '';
    nfn = $("#saveAsName").val();
    if (typeof nfn !== 'undefined') {
        if (nfn.length > 0 ) {
            currentEditFile = nfn;
            $("#saveStatus").empty();
            $("#saveStatus").html('');
            $("#saFooter").show();
            currentEditFile = nfn;
            saveFile();
        } else {
            alert("Error processing save as, file name field is required and cannot be empty.")
        }
    } else {
        alert("Error processing save as request.");
    }
}

// send request to server to get config info
function getConfig() {
    socket.emit('getConfigData');
}

// send request to server to get object definition
function getDef(def) {
    selectedDef = def;
    editObj();
}

// send request to server to get object definition
function getDef3(def) {
    $("#multiModal").modal('hide');
    selectedDef = def;
    if (selectedDef.indexOf('undefined') > -1) {
        showMessage('Unable to locate data source yaml.','fail');
    } else {
        editObj();
    }
}

function getDef4(def, secret) {
    $("#multiModal").modal('hide');
    selectedDef = def;
    if (selectedDef.indexOf('undefined') > -1) {
        showMessage('Unable to locate data source yaml.','fail');
    } else {
        data = {"file": selectedDef, "secret": secret}
        socket.emit('decode', data);
    }
}


function getDef2(def) {
    let parts = def.split('@');
    let data;
    let type;
    let fParts;
    let src;
    if (parts.length === 2) {
        data = k8cData[parts[1]];
        if (typeof data !== 'undefined') {
            if (typeof data.src === 'undefined') {
                showMessage('Unable to locate data source yaml...','fail');
                return;
            }
        } 
        type = parts[0];
        fParts = parts[1].split('.');
        src = rootDir + '/config' + fParts[0] + '.yaml';
        selectedDef = src + '::' + fParts[1] + '::editfile';
    } else {
        return;
    }

    if (type === 'workload') {
        //selectedDef = data.src + '::' + data.part + '::' + data.name;
        editObj();
    } else if (type === 'ControllerRevision' || type === 'PersistentVolume' || type === 'StorageClass' || type === 'CRD') {
        // fParts = parts[1].split('.');
        // src = rootDir + '/config' + fParts[0] + '.yaml';
        // selectedDef = src + '::' + fParts[1] + '::ControllerRevision';
        editObj();
    } else if (type === 'level1' || type === 'level2') {
        partChain(type, data.creationChain)
    } else if (type === 'EndPoint' || type === 'EndPointSlice' || type === 'Service') {
        partServices(type, data.Services)
    } else if (type === 'Secret') {
        partArray(type, data.Secret)
    } else if (type === 'ConfigMap') {
        partArray(type, data.ConfigMap)
    } else if (type === 'PVC') {
        partPVC(type, data.PersistentVolumeClaim)
    } else if (type === 'ServiceAccount') {
        partArray(type, data.ServiceAccount)
    } else if (type === 'UnKn') {
        // ToDo consider adding a message that informs user about this
        return;
    } 
}

function partArray(type, data) {
    try {
        if (data.length > 1) {
            multiList(type, data)
        } else {
            if (typeof data[0].source !== 'undefined') {
                selectedDef = data[0].source
                if (typeof data[0].part !== 'undefined') {
                    selectedDef = selectedDef + '::' + data[0].part + '::' + data[0].name;
                } else {
                    selectedDef = selectedDef + '::0::name';
                }     
            }
            editObj();
        }
    } catch (err) {
        console.log('Error processing request, message: ' + err)
    }
}

function partPVC(type, data) {
    let fnum;
    let fn;
    if (data.length > 1) {
        multiList(type, data)
    }
    try {
        fnum = data[0].claimFnum;
        fn = fnum.split('.');
        if (fn.length === 2) {
            selectedDef = rootDir + '/config' + fn[0] + '.yaml::' + fn[1] + '::' + data[0].name;
            editObj();
        }
    } catch (err) {
        console.log('Error processing request, message: ' + err)
    }
}

function partChain(type, data) {
    let fnum;
    let fn;
    try {
        if (type === 'level1') {
            fnum = data.level1Fnum
            if (fnum === 'missing') {
                $("#yamlModal").modal('show');
                return;
            }
            fn = fnum.split('.');
            if (fn.length === 2) {
                selectedDef = rootDir + '/config' + fn[0] + '.yaml::' + fn[1] + '::' + data.level1Kind;
                editObj();
            }
        }
        if (type === 'level2') {
            fnum = data.level2Fnum
            if (fnum === 'missing') {
                $("#yamlModal").modal('show');
                return;
            }
            fn = fnum.split('.');
            if (fn.length === 2) {
                selectedDef = rootDir + '/config' + fn[0] + '.yaml::' + fn[1] + '::' + data.level2Kind;
                editObj();
            }
        }
    } catch (err) {
        console.log('Error processing request, message: ' + err)
    }
}

function partServices(type, data) {
    data = data[0];
    try {
        if (type === 'Service') {
            let fnum = data.fnum;
            let fn = fnum.split('.');
            if (fn.length === 2) {
                selectedDef = rootDir + '/config' + fn[0] + '.yaml::' + fn[1] + '::' + data.name;
                editObj();
            }
        }
        if (type === 'EndPoint') {
            let fnum;
            if (data.ep !== '') {
                fnum = data.ep;
            }
            if (data.eps !== '') {
                fnum = data.eps;
            }
            let fn = fnum.split('.');
            if (fn.length === 2) {
                selectedDef = rootDir + '/config' + fn[0] + '.yaml::' + fn[1] + '::' + data.name;
                editObj();
            }
        }
        if (type === 'EndPointSlice') {
            let fnum;
            if (data.ep !== '') {
                fnum = data.ep;
            }
            if (data.eps !== '') {
                fnum = data.eps;
            }
            let fn = fnum.split('.');
            if (fn.length === 2) {
                selectedDef = rootDir + '/config' + fn[0] + '.yaml::' + fn[1] + '::' + data.name;
                editObj();
            }
        }


    } catch (err) {
        console.log('Error processing request, message: ' + err)
    }
}

function multiList(type, data) {
    $("#multiContents").empty();
    $("#multiContents").html('')
    let html = '';
    let ref;
    let use;
    for (let i = 0; i < data.length; i++) {
        ref = data[i].source + '::' + data[i].part + '::' + data[i].name;
        if (typeof data[i].use !== 'undefined') {
            use = ' (' + data[i].use + ')';
        } else {
            use = '';
        }
        html = html 
        + '<div class="multiList">'
        + '<button type="button" class="btn btn-sm btn-outline-primary vpkfont-md ml-1"'
        + 'onclick="getDef3(\'' + ref + '\')">' + type + '</button>';

        if (type === 'Secret') {
            html = html 
            + '&nbsp;&nbsp<button type="button" class="btn btn-sm btn-outline-primary vpkfont-md ml-1"'
            + 'onclick="getDef4(\'' + ref + '\', \'' +  data[i].name + use + '\')">Decode</button>';
        }
        html = html 
        + '&nbsp;&nbsp;' + data[i].name + use + '</div>'
    }

    $("#multiContents").html(html)

    $("#multiModal").modal('show');
}


// send request to server to get hierarchy data
function getChart(type) {

    var processingChart = '<div class="row">'
        + '<div class="col mt-1 ml-1">'
        + '<img style="float:left" src="images/loading.gif"/>'
        + '<div class="vpkfont-md vpkcolor mt-2"><span>&nbsp;&nbsp;Processing chart request</span></div>'
        + '</div>'
        + '</div>'

    hideMessage();
    chartType = type;
    $("#charts").empty();
    $("#charts").html('<svg width="950" height="5000"></svg>');
    $("#chartInfo").empty();
    $("#chartInfo").html(processingChart);

    var namespaces = '';
    var tmp;
    var options = $('#graphic-ns-filter').select2('data');
    for (var i = 0; i < options.length; i++) {
        tmp = options[i].text;
        tmp = tmp.trim();
        if (tmp.length === 0) {
            namespaces = namespaces + ':all-namespaces:';
        } else {
            namespaces = namespaces + ':' + tmp + ':';
        }
    };

    if (namespaces === '') {
        namespaces = ':all-namespaces:';
    }

    socket.emit('getHierarchy', {"namespaceFilter": namespaces });
}


function editObj() {
    $("#viewTypeModal").modal('hide');
    selectedAction = 'edit';
    //console.log(selectedDef)
    socket.emit('getDef', selectedDef);
}

function browseObj() {
    $("#viewTypeModal").modal('hide');
    selectedAction = 'browse';
    socket.emit('getDef', selectedDef);
}

// send request to server to get directory stats
function getDirStats() {
    socket.emit('getDirStats');
}
 
// send request to server to get drop down list data
function getSelectLists() {
    socket.emit('getSelectLists');
}

// send request to server to get software version
function getVersion() {
    socket.emit('getVersion');
}

// send request to server to get SVG data for ojbect
function getSvg(obj) {
    var gArray = [];
    gArray.push(obj);
    socket.emit('getSvg', gArray);
}


// send request to load new directory
function reload() {
    $("#validateBtn").hide();
    $("#chgDirFooter").hide();

    $("#loadStatus").show();

    var newDir = $('#dsInstances').select2('data');
    newDir = newDir[0].text;

    $("#charts").empty();
    $("#charts").html('<svg width="950" height="5000"></svg>');

    $("#svgResults").empty();
    $("#svgResults").html('');

    $("#schematicDetail").empty();
    $("#schematicDetail").html('');

    socket.emit('reload', newDir);
}


function getPdf() {
    //Get svg markup as string
    var svg = document.getElementById('charts').innerHTML;
  
    if (svg)
      svg = svg.replace(/\r?\n|\r/g, '').trim();
  
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
  
  
    context.clearRect(0, 0, canvas.width, canvas.height);
    canvg(canvas, svg);
  
    var imgData = canvas.toDataURL('image/png');
  
    // Generate PDF
    var doc = new jsPDF('p', 'pt', 'a4');
    doc.addImage(imgData, 'PNG', 40, 40, 200, 400);
    doc.save('test.pdf');
  
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
    } //else if (tmp === 'Upload K8 files') {
    //    fileUpload();
    //}
}


// send request to server to search for data
function searchObj() {

    hideMessage();

    var namespaces = '::';
    var kinds = '::'; 
    var labels = '::'; 
    var kindnameValue = '';
    var skipU = true;

    var nsKey = false;
    var kindKey = false;
    var kindnameKey = false;
    var labelKey = false;

    var options = $('#ns-filter').select2('data');
    for (var i = 0; i < options.length; i++) {
        var tmp = options[i].text;
        tmp.trim();
        if (tmp.length === 0) {
            namespaces = namespaces + '-blank-' + '::';
        } else {
            namespaces = namespaces + tmp + '::';
            nsKey = true;
        }
    };

    options = $('#kind-filter').select2('data');
    for (var i = 0; i < options.length; i++) {
        var tmp = options[i].text;
        tmp.trim();
        if (skipU === true) {
            if (tmp.indexOf('(U)') === -1 ) {
                kinds = kinds + tmp + '::';
                kindKey = true;
            }
        } else {
            kinds = kinds + tmp + '::';
            kindKey = true;
        }
    };

    options = $('#label-filter').select2('data');
    for (var i = 0; i < options.length; i++) {
        var tmp = options[i].text;
        tmp.trim();
        labels = labels + tmp + '::';
        labelKey = true;
    };    

    kindnameValue = $("#kind-name").val();
    if (typeof kindnameValue === 'undefined' || kindnameValue.length === 0) {
        kindnameValue = '';
    } else {
        kindnameKey = true;
    }

    if (namespaces === '::') {
        namespaces = '::all-namespaces::'
    }
    if (kinds === '::') {
        kinds = '::all-kinds::'
    }


    if (!nsKey && !kindKey && !kindnameKey && !labelKey) {
        namespaces = '::all-namespaces::'
        kinds = '::all-kinds::'
    }

    if (namespaces === '::') {
        namespaces = '::all-namespaces::'
    }
    if (kinds === '::') {
        kinds = '::all-kinds::'
    }    

    var data = {
        "kindnameValue": kindnameValue,
        "namespaceFilter": namespaces,
        "kindFilter": kinds,
        "skipU": skipU,
        "labelFilter": labels
    }
    socket.emit('search', data);
}




//----------------------------------------------------------
// navigation functions
//----------------------------------------------------------

// show change directory modal 
function changeDir() {
    socket.emit('clusterDir');
    $("#validateBtn").show();
    $("#loadStatus").hide();
    $("#chgDirFooter").show();
}

// show server parse statistics
function dirStats() {
    socket.emit('getDirStats');
}

// get Cluster information 
function getCluster() {
    hideMessage();
    // generate the UI base on selected cluster
    $('#clusterType').val('none');
    $("#clusterInfo").hide();
    $("#clusterInfo").html('');
    $("#clusterButton").show();
    $("#clusterModal").modal({
        backdrop: 'static',
        keyboard: false        
    }); 
    $("#clusterRunning").hide();
    console.log('4-5')
    $("#clusterModalFooter").show();
    $("#clusterModal").modal('show');
    $("#clusterStatus").empty();
    $("#clusterStatus").html('&nbsp');
}

function buildClusterUI(selected) {
    $("#clusterInfo").empty();
	$("#clusterInfo").html('');
    
    var bttn = '<div id="clusterButton">'
        + '<div style="padding-top: 20px;">'
        + '<button id="clusterBtn" type="button" class="btn btn-outline-primary btn-sm" onclick="dynamic()" style="margin: 5px;">'
        + 'Connect'
        + '</button>'
        + '</div></div>';
    // values to be used in building the UI    
    var tmp00 = '<dir class="form-row">';
    var tmp01 = '<label class="col-sm-4 col-form-label vpkcolor" for="';       //add name part 1
    var tmp02 = '" style="padding-top: 15px;">';                               //add name part 2
    var tmp03 = '</label>';
    var tmp04 = '<input id="'                                                  //add ???
    var tmp05t = '" type="text" class="form-control col-sm-8" ';               //plain text input 
    var tmp05p = '" type="password" class="form-control col-sm-8" ';           //password input
    var tmp06a = 'value="';                                                    //if default value is provided add the value
    var tmp06b = '"';
    var tmp07 = ' style="margin-bottom: 5px;"></div>';
    var fields = [];
    var prov = getProvider(selected);
    var parms = prov.parms;
    var html = tmp00;
    for (var f = 0; f < parms.length; f++) {
        if (typeof parms[f].value !== 'undefined') {
            var flds = parms[f].value.split('{{');
            var defs = [];
            var d = 0;
            if (typeof parms[f].default !== 'undefined') {
                defs = parms[f].default.split(',')
            }
            if (flds.length > 0) {
                for (var g = 0; g < flds.length; g++) {
                    var fn = flds[g];
                    var lp = fn.indexOf('}');
                    if (lp !== -1 ) {
                        fn = fn.substr(0, lp);
                    }
                    if (fn.length > 0) {
                        fields.push(fn);
                        var inf = tmp01 + fn + tmp02 + fn + tmp03 + tmp04 + fn; 
                        var cfn = fn.toUpperCase();
                        if (cfn === 'PASSWORD') {
                            inf = inf + tmp05p;
                        } else {
                            inf = inf + tmp05t;
                        }                        
                        if (typeof defs[d] !== 'undefined') { 
                            inf = inf + tmp06a + defs[d] + tmp06b + tmp07
                            d++;
                        } else {                        
                            inf = inf + tmp07;
                        }
                        html = html + inf;
                    } 
                }
            }
        }
    }
    html = html + bttn;
    inputFlds = fields;
    $("#clusterInfo").html(html);
    $("#clusterInfo").show();
    $("#clusterStatus").empty();
    $("#clusterStatus").html('&nbsp');

}


function getProvider(selected) {
    for (var p = 0; p < clusterProviders.length; p++) {
        if (clusterProviders[p].name === selected) {
            return clusterProviders[p].fields;
        }
    }
}


// process cluster info input and pass to server 
function dynamic() {
    $("#clusterButton").hide();
    $("#clusterRunning").show();
    $("#clusterModalFooter").hide();

    var kinfo = {};
    var kStr = '';
    if (inputFlds.length > 0) {
        for (var f = 0; f < inputFlds.length; f++) {
            var fld = inputFlds[f];
            fld = fld.trim();
            var content = document.getElementById(fld).value;
            content = content.trim();
            if (f === 0 ) {
                kStr = kStr + '"' + fld + '":"' + content + '" '
            } else {
                kStr = kStr + ', "' + fld + '":"' + content + '" '
            }
        }
        kStr = '{' + kStr + '}';
    }

    kinfo = JSON.parse(kStr);
    kinfo.ctype = $("#clusterType option:selected").val();
    socket.emit('connectK8', kinfo);
    $("#clusterStatus").empty();
    var resp = '<br><div><span class="vkpfont vpkcolor" style="vertical-align: middle;">Request will take several seconds to complete</span></div>';
    $("#clusterStatus").html(resp);
}



//----------------------------------------------------------
// common functions
//----------------------------------------------------------
// populate drop down selections with server provided data
//----------------------------------------------------------

function populateSelectLists(data) {
    popCnt++;
    var options;

    // populate providers always
    options = bldProviders(data.providers, 'P', 'no');
    $("#clusterType").html(options);

    // populate only if valid datasource
    if (data.validDir === false) {
        setBaseDir(data.baseDir);
    } else {
        setBaseDir(data.baseDir);
        rootDir = data.baseDir;
        baseDir = data.baseDir;

        // filter bar1 (namespaces)
        options = bldOptions(data.namespaces, 'N', 'select2');
        $("#ns-filter").empty();
        $("#ns-filter").select2({ 
            data: options,
            dropdownCssClass: "vpkfont-md",
            containerCssClass: "vpkfont-md"
        });

        $("#graphic-ns-filter").empty();
        $("#graphic-ns-filter").select2({ 
            data: options,
            dropdownCssClass: "vpkfont-md",
            containerCssClass: "vpkfont-md"
        });        

        // filter bar2 (resource kinds)
        options = bldOptions(data.kinds, 'K', 'select2');
        $("#kind-filter").empty();
        $("#kind-filter").select2({ 
            data: options,
            dropdownCssClass: "vpkfont-md",
            containerCssClass: "vpkfont-md"
         });

        // filter bar3 (resource kinds)
        if (typeof data.labels !== 'undefined') {
            options = bldOptions(data.labels, 'L', 'select2');
            $("#label-filter").empty();
            $("#label-filter").select2({ 
                data: options,
                dropdownCssClass: "vpkfont-md",
                containerCssClass: "vpkfont-md"
            });
        }
    }
}
function buildStatsToggle() {
    if (dsToggle === 'kind') {
        buildNamespaceStats();
        dsToggle = 'ns'
    } else {
        buildKindStats(); 
        dsToggle = 'kind'   
    }
}

function buildKindStats() {
    dsToggle = 'kind';
    if (typeof dsCounts === 'undefined') {
        return;
    }
    if (typeof dsCounts.kind === 'undefined') {
        return;
    }
    data = dsCounts.kind;

    if (typeof data._total === 'undefined') {
        return;
    }

    let keys = Object.keys(data);
    keys.sort();

    let total = data._total._cnt;
    let cKeys;
    let nsText = '';
    let htm = '<table class="vpkfont-md"><thead><tr class="statsHeader" style="text-align:center">' 
        + '<th>-Kind-</th><th class="pl-2">-Count-</th><th class="pl-2">-Namespace-</th>'
        + '</tr></thead><tbody>';
    // add overall total line
    htm = htm + '<tr style="text-align:center"><td width="150">All</td><td width="75" class="pd-4">' + total + '</td><td width="300" class="pl-2">All</td></tr>'


    for (let i = 0; i < keys.length; i++) {
        if ( keys[i].startsWith('_') ) {
            continue;
        }
        htm = htm + '<tr><td><hr></td><td><hr></td><td><hr></td></tr>'
        
        htm = htm + '<tr><td  class="statsBreak">' + keys[i] + '</td><td>&nbsp;</td><td>&nbsp;</td></tr>'

        cKeys = Object.keys(data[keys[i]]);
        cKeys.sort();
        for (let c = 0; c < cKeys.length; c++) {
            if (cKeys[c].startsWith('_') ) {
                continue;
            } else {
                nsText = cKeys[c];
                if (nsText === 'cluster-level' ) {
                    nsText = '< Cluster Level >'
                }
                htm = htm + '<tr><td>&nbsp;</td><td class="pl-4">' + data[keys[i]][cKeys[c]] + '</td><td class="pl-2">' + nsText + '</td></tr>'
            }
        }
    };

    htm = htm + '</tbody></table>';

    $("#statContents").empty();
    $("#statContents").html('');
    $("#statContents").html(htm);
    $("#statsModal").modal();
}

function buildNamespaceStats(stats) {
    if (typeof dsCounts === 'undefined') {
        return;
    }
    if (typeof dsCounts.ns === 'undefined') {
        return;
    }
    dsToggle = 'ns';
    data = dsCounts.ns;
    let keys = Object.keys(data);
    keys.sort();
    let total = dsCounts.kind._total._cnt;  // get overall total from the kinds stats
    let cKeys;
    let nsText = '';
    let htm = '<table class="vpkfont-md"><thead><tr class="statsHeader" style="text-align:center">' 
        + '<th>-Namespace-</th><th class="pl-2">-Count-</th><th class="pl-2">-Kind-</th>'
        + '</tr></thead><tbody>';
    // add overall total line
    htm = htm + '<tr style="text-align:center"><td width="150">All</td><td width="75" class="pd-4">' + total + '</td><td width="300" class="pl-2">All</td></tr>'


    for (let i = 0; i < keys.length; i++) {
        if ( keys[i].startsWith('_') ) {
            continue;
        }
        htm = htm + '<tr><td><hr></td><td><hr></td><td><hr></td></tr>'
        nsText = keys[i];
        if (nsText === 'cluster-level' ) {
            nsText = '< Cluster Level >'
        }
        
        htm = htm + '<tr><td class="statsBreak">' + nsText + '</td><td>&nbsp;</td><td>&nbsp;</td></tr>'

        cKeys = Object.keys(data[keys[i]]);
        cKeys.sort();
        for (let c = 0; c < cKeys.length; c++) {
            if (cKeys[c].startsWith('_') ) {
                continue;
            } else {
                htm = htm + '<tr><td>&nbsp;</td><td class="pl-4">' + data[keys[i]][cKeys[c]] + '</td><td class="pl-2">' + cKeys[c] + '</td></tr>'
            }
        }
    };

    htm = htm + '</tbody></table>';

    $("#statContents").empty();
    $("#statContents").html('');
    $("#statContents").html(htm);
    $("#statsModal").modal();
}

function formatUsage(data) {
    let rtn = '<div class="events ml-2 mr-2 mb-2 vpkcolor" ><hr><table style="width:100%">'
    rtn = rtn + usageLine('Architecture', data.header.arch);
    rtn = rtn + usageLine('Machine', data.header.osMachine);
    rtn = rtn + usageLine('OS Name', data.header.osName);
    rtn = rtn + usageLine('OS Release', data.header.osRelease);
    rtn = rtn + usageLine('Processor', data.header.cpus[0].model);

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

function about() {
    socket.emit('getUsage');
    $("#version").empty();
    $("#version").html('');
    $("#version").html('VERSION&nbsp;' + version  );
    $("#usageResult").hide();
    $("#aboutModal").modal();
}


function clearDisplay() {
    $("#svgResults").empty();
    $("#svgResults").html('');
    $("#statsData").empty();
    $("#statsData").html('');
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
    //clearSvg();
    if (dir !== 'No datasource connected') {
        showMessage('Datasource connected', 'pass');
    }
}


//----------------------------------------------------------
// sort and build the selection list option entries
//----------------------------------------------------------
function bldOptions(options, type, style) {
    var items = [];
    var listitems = '';
    var listArrary = [];

    if (Array.isArray(options)) {
        items = options;
    } else {
        for (option in options) {
            items.push(option)
        };
    }

    items.sort();
    var cnt = 0;
    var id = 0;
    for (var i = 0; i < items.length; i++) {
        cnt++;
        if (i === 0 && type === 'K') {
            if (style !== 'select2') {
                listitems = '<option>all-kinds</option>'
            } else {
                id++;
                listArrary.push({id: id, text:'all-kinds'});
            }
        }

        var cki = items[i];
        if (!cki.endsWith(' (U)')) {  
            if (style !== 'select2') {
                if (cki === ": " || cki === "") {
                    listitems += '<option>&lt;cluster-level&gt;</option>';
                } else {
                    listitems += '<option>' + items[i] + '</option>';
                }
            } else {
                if (cki === ": " || cki === "") {
                    id++;
                    listArrary.push({id: id, text: '<cluster-level>'});
                } else {
                    id++;
                    listArrary.push({id: id, text: items[i]});
                }
            }

        } else {
            // drop all user defined kinds
        }
    }
    if (style !== 'select2') {
        return listitems; 
    } else {
        return listArrary;
    }
}


//----------------------------------------------------------
// sort and build the selection list option entries
//----------------------------------------------------------
function bldProviders(options) {
    var listitems = '<option value="none">select cluster type</option>';
    if (options === null) {
        return;
    }
    for (var i = 0; i < options.length; i++) {
        listitems += '<option value="' + options[i].name + '">' + options[i].dropdown + '</option>';
    }
    return listitems;
}

//----------------------------------------------------------
// sort and build the selection list option entries
//----------------------------------------------------------
function bldClusterDir(dirs) {
    var listitems = '<option></option>';
    if (dirs === null) {
        listitems = '<option value="none">no previous instances exist</option>';
        return;
    }
    for (var i = 0; i < dirs.length; i++) {
        listitems += '<option value="' + dirs[i] + '">' + dirs[i] + '</option>';
    }
    return listitems;
}



//----------------------------------------------------------
// build the search results table
//----------------------------------------------------------
function buildSearchResults(data) {
    var part2 = '';
    var newPart;
    var tmp; 
    var a, b, c, d;
    newData = [];
    dix = -1;
    id = 0;
    dixArray = [];

    //Parse data and build JSON object for display table
    for (item in data) {
        tmp = data[item]
        a = tmp.namespace;
        b = tmp.kind;
        c = tmp.name;
        d = tmp.src;
        e = tmp.part;
        dix++;
        dixArray.push(a + '::' + b + '::' + c + '::' + d + '::' + e);
        newData.push({
            namespace: a,
            kind: b,
            value: c,
            src: d,
            part: e
        })
    }

    // build the table
    //$("#tableL").bootstrapTable('refreshOptions', {iconSize: "sm"})
    $("#tableL").bootstrapTable('load', newData)
    $("#tableL").bootstrapTable('hideColumn', 'src');
    $("#tableL").bootstrapTable('hideColumn', 'part');

    // hide the graphics tabs 
    $('#svgResults').hide();
    $('#charts').hide();
    $('#charts').empty();
    
    //show the searchR tab
    $("#searchR").addClass("active");
    $("#searchR").addClass("show");

    $("#instructions").removeClass("active");
    $("#instructions").removeClass("show");
    $("#graphic").removeClass("active");
    $("#graphic").removeClass("show");
    $("#schematic").removeClass("active");
    $("#schematic").removeClass("show");

    // set the proper tab active
    $("#tableTab").addClass("active");
    $("#schematicTab").removeClass("active");
    $("#instTab").removeClass("active");
    $("#graphicTab").removeClass("active");
}

function sleep(milliseconds)  {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

//----------------------------------------------------------
console.log('loaded vpkmain.js');