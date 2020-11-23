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
var colors;
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

    // dynamically change height of Ace edit 
    //cHeight=  document.body.clientHeight;
    //if (cHeight > 600) {
    //    cHeight = cHeight - 250;
    //}
    //$("#editor").css('height', cHeight );

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

    // get the name of selected tab and process
    $( 'a[data-toggle="tab"]' ).on( 'shown.bs.tab', function( evt ) {
        currentTab = $( evt.target ).attr( 'href' );
        // take action based on what tab was shown
        if(currentTab === "#instructions") {
            $('#svgResults').hide();
            $('#chartInfo').hide();
            $('#charts').hide();
            $('#schematic').hide();
        } else if (currentTab === "#searchR") {
            $('#svgResults').show();
            $('#chartInfo').hide();
            $('#charts').hide();
            $('#schematic').hide();
        } else if (currentTab === "#schematic") {
            $('#svgResults').hide();
            $('#chartInfo').hide();
            $('#charts').hide();
            $('#schematic').show();
        } else if (currentTab === "#graphic") {
            $('#svgResults').hide();
            $('#chartInfo').hide();
            $('#charts').show();
            $('#schematic').hide();
        } else {
            $('#svgResults').show();
            $('#chartInfo').show();
            $('#charts').show();
            $('#schematic').show();
        }
    });

    // $("#clusterModal").on("hidden.bs.modal", function () {
    //     console.log('clusterModal hidden')
    //     //$('#pickDataSource').val(null).trigger('change');
    // });

    // $("#chgDirModal").on("hidden.bs.modal", function () {
    //     console.log('chgDirModal hidden')
    //     //$('#pickDataSource').val(null).trigger('change');
    // });  
    
    // $("#fileModal").on("hidden.bs.modal", function () {
    //     $('#pickDataSource').val(null).trigger('change');
    // })

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
    $("#searchBtn").click(function(e) {
        e.preventDefault();
        searchObj();
    });

    $("#validateBtn").click(function(e) {
        e.preventDefault();
        reload();
    });

    // $("#fileDirBtn").click(function(e) {
    //     e.preventDefault();
    //     uploadDir();
    // });

	// 
	$("#clusterType").change(function(){
		var selected = $('#clusterType option:selected').val();
        buildClusterUI(selected);
	});

    // 

	// $("#pickDataSource").change(function(){
    //     var selected = $('#pickDataSource option:selected').val();
    //     pickData(selected);
	// });

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

    // $(function() {
    //     Dropzone.options.fileUploadDropzone = {
    //         maxFilesize: 1,
    //         maxFiles: 500,
    //         addRemoveLinks: true,
    //         dictResponseError: 'Server not Configured',
    //         url: '/upload',
    //         uploadMultiple: true,
    //         parallelUploads: 5,
    //         addRemoveLinks: true,
    //         dictRemoveFile: 'Delete',
    //         init: function() {

    //             var cd;
    //             this.on("success", function(file, response) {
    //                 $('.dz-progress').hide();
    //                 $('.dz-size').hide();
    //                 $('.dz-error-mark').hide();
    //                 cd = response;
    //             });
    //             this.on("addedfile", function(file) {
    //                 var removeButton = Dropzone.createElement("<a href=\"#\">Remove file</a>");
    //                 var _this = this;
    //                 removeButton.addEventListener("click", function(e) {
    //                     e.preventDefault();
    //                     e.stopPropagation();
    //                     _this.removeFile(file);
    //                     var name = "largeFileName=" + cd.pi.largePicPath + "&smallFileName=" + cd.pi.smallPicPath;
    //                     $.ajax({
    //                         type: 'POST',
    //                         url: 'DeleteImage',
    //                         data: name,
    //                         dataType: 'json'
    //                     });
    //                 });
    //                 file.previewElement.appendChild(removeButton);
    //             });
    //         }
    //     };
    // })

    clearDisplay();
    getSelectLists();
    getColors();

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
socket.on('colorsResult', function(data) {
    colors = data;
});

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
    $("#clusterStatus").empty();
    $("#clusterStatus").html('');
    var resp = '';
    if (data.status === 'PASS') {
        resp = '<br><div><img style="float: left;" src="images/checkMarkGreen.png" height="40" width="40">' +
            '&nbsp;&nbsp;&nbsp;&nbsp;Cluster processed.</div>';
        $("#clusterStatus").html(resp);
    } else {
        //resp = '<br><div><img style="float: left;" src="images/checkMarkRed.png" height="40" width="40">' +
        //    '&nbsp;&nbsp;&nbsp;&nbsp;'  + data.message + '</div>';
        resp = '<br><div>&nbsp;&nbsp;&nbsp;&nbsp;'  + data.message + '</div>';

        $("#clusterStatus").html(resp);
    }
});

socket.on('getKStatus', function(data) {
    $("#clusterStatus").empty();
    $("#clusterStatus").html('');
    var resp;
    resp = '<br><div>' + data + '</div>';
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

socket.on('logResult', function(data) {
    showLogFile(data, 'L');
});

socket.on('hierarchyResult', function(data) {
    //$("#svgResults").empty();
    //$("#svgResults").html('');
    $("#charts").empty();
    $("#charts").html('<svg width="50" height="50"></svg>');
    $(".chartInfo").empty();
    $(".chartInfo").html('Processing chart data');

    if (chartType === 'hierarchy') {
        $("#charts").empty();
        $("#charts").html('<svg width="50" height="50"></svg>');
        chartHierarchy(data);
        $(".chartInfo").html('');
    } else if (chartType === 'collapsible') {
        $("#charts").empty();
        $("#charts").html('<svg></svg>');
        chartCollapsible(data);
        $(".chartInfo").html('Click blue dot to expand or collapse.  Red dot is final point of branch.');
    } else if (chartType === 'circlePack') {
        $("#charts").empty();
        $("#charts").html('<svg></svg>');
        chartCirclePack(data);
        $(".chartInfo").html('');
    } else if (chartType === 'tree') {
        $("#charts").empty();
        $("#charts").html('<svg></svg>');
        chartTree(data);
        $(".chartInfo").html('');
    }
});

socket.on('importResult', function(data) {
    $('#importModal').modal('hide');
    showLogFile(data, 'I');
});

socket.on('cmdResult', function(data) {
    showLogFile(data, 'C');
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
    $("#loadStatus").empty();
    $("#loadStatus").html('');
    var resp;
    if (data.validDir === false) {
        resp = '<br><div><img style="float: left;" src="images/checkMarkRed.png" height="40" width="40">' +
            '&nbsp;&nbsp;&nbsp;&nbsp;Provided directory name does not exist.  Please provide a valid directory to continue.</div>';
        $("#loadStatus").html(resp);
        setBaseDir('Invalid directory: ' + newDir);
    } else {
        resp = '<br><div><img style="float: left;" src="images/checkMarkGreen.png" height="40" width="40">' +
            '&nbsp;&nbsp;&nbsp;&nbsp;Directory parsed and loaded.</div>';
        $("#loadStatus").html(resp);
        setBaseDir(data.baseDir);
        rootDir = data.baseDir;
        baseDir = data.baseDir;
        getSelectLists();
    }
    clearDisplay();
});
              
socket.on('schematicResult', function(data) {
    //console.log(JSON.stringify(data, null, 4))
    k8cData = data.data;
    outputSchematic();
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

// socket.on('uploadDirResult', function(data) {
//     $("#uploadStatus").empty();
//     $("#uploadStatus").html('');
//     $("#uploadStatus").html(data.msg);

//     if (data.status === 'PASS') {
//         $("#uploadDir").val(data.dir);
//         $("div#filedropzone").show();
//     }
// });

socket.on('version', function(data) {
    version = data.version;
});

socket.on('clusterDirResult', function(data) {
    //build the drop down of existing directories
    var items = bldClusterDir(data.dirs);
    $('#dsInstances').html(items);
    $("#chgDirModal").modal('show');

});

//----------------------------------------------------------
// socket io definitions for out-bound
//----------------------------------------------------------
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
        }

    $("#messageText").html(msg)
    $("#messageDiv").removeClass("hide");
    $("#messageType").removeClass("alert-warning alert-success alert-danger alert-secondary");

    $("#messageDiv").addClass(msgClass);
    $("#messageDiv").addClass("show");
}

function hideMessage() {
    $("#messageDiv").removeClass("show");
    $("#messageDiv").addClass("hide");
}


// loop and check for rows with checkbox checked and get SVG data
function showSvg() {
    hideMessage();
    var selected = [];
    var items = $("#tableL").bootstrapTable('getAllSelections');
    // var junk = dixArray;
    if (typeof items[0] !== 'undefined') {
        for (var c = 0; c < items.length; c++) {
            var key = items[c].id;
            var fname = items[c].src;
            var data = dixArray[key];
            selected.push(data);
            if (data.indexOf(fname) < 0) {
                console.log('ERROR Selected: ' + fname + ' Loaded: ' + data);
            }
        }
        if (selected.length > 0) {
            socket.emit('getSvg', selected);
        }
    }
}

// pass data to relations 
function bldSchematic() {
    hideMessage();
    // if (typeof newData === 'undefined' || newData.length === 0) {
    //     showMessage('No data has been retrieved from data source','fail');
    // } else {
    //     socket.emit('schematic', newData);
    // }

    socket.emit('schematic', newData);
}

// data from schematic 
function outputSchematic() {
    hideMessage();
    //clearDisplay();
    schematic(baseDir);       // data used to populate the table in the UI
    //$("#schematic").show();
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


function closeGetCluster() {
    clearDisplay();
    console.log('closeGetCluster request to getSelectLists')
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

// send request to server to get colors
function getColors() {
    socket.emit('getColors');
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
        } //else {
          //  showMessage('Unable to locate data source yaml...','fail');
          //  return;
        //}
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
            fn = fnum.split('.');
            if (fn.length === 2) {
                selectedDef = rootDir + '/config' + fn[0] + '.yaml::' + fn[1] + '::' + data.level1Kind;
                editObj();
            }
        }
        if (type === 'level2') {
            fnum = data.level2Fnum
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
    hideMessage();
    chartType = type;
    $("#charts").empty();
    $("#charts").html('<svg width="950" height="5000"></svg>');
    $("#chartInfo").empty();
    $("#chartInfo").html('Retrieving chart');

    var data = getHierFilter();
    socket.emit('getHierarchy', data);
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

// send request to server to clear data
function clearData() {
    console.log('clearData sent')
    socket.emit('clearData');
}

function clearSvg() {
    hideMessage();
    $("#svgResults").empty();
    $("#svgResults").html('');
    $("#charts").empty();
    $("#charts").html('<svg width="50" height="50"></svg>');
    $("#chartInfo").empty();
    $("#shartInfo").html('');
    $("#schematicDetail").empty();
    $("#schematicDetail").html('');
    $("#loadStatus").empty();
    $("#loadStatus").html('');
}

// send request to load new directory
function reload() {
    //var newDir = $("#newDir").val();
    var newDir = $('#dsInstances').select2('data');
    newDir = newDir[0].text;
    socket.emit('reload', newDir);

    $("#charts").empty();
    $("#charts").html('<svg width="950" height="5000"></svg>');
    $("#chartInfo").empty();
    $("#shartInfo").html('');

    $("#loadStatus").empty();
    $("#loadStatus").html('');
    $("#loadStatus").html('<br><p>Processing request to retrieve datasource.</p>');

    $("#svgResults").empty();
    $("#svgResults").html('');

    $("#schematicDetail").empty();
    $("#schematicDetail").html('');

}


// set hierarchy filters
function getHierFilter() {
    var namespaces = '::';
    var kinds = '::'; 
    var kindnameValue = '';
    var labels = '::';
    var filter;
    var tmp;
    var nsKey = false;
    var kindKey = false;
    var kindnameKey = false;
    var labelKey = false;

    filter = $('#ns-filter').select2('data');
    for (var i = 0; i < filter.length; i++) {
        tmp = filter[i].text;
        tmp.trim();
        namespaces = namespaces + tmp + '::';
        // if (tmp.length === 0) {
        //     namespaces = namespaces + '-blank-' + '::';
        // } else {
        //     namespaces = namespaces + tmp + '::';
        // }
    };

    filter = $('#kind-filter').select2('data');
    for (var i = 0; i < filter.length; i++) {
        tmp = filter[i].text;
        tmp.trim();
        kinds = kinds + tmp + '::';
    };

    filter = $('#label-filter').select2('data');
    for (var i = 0; i < filter.length; i++) {
        tmp = filter[i].text;
        tmp.trim();
        labels = labels + tmp + '::';
    };    

    kindnameValue = $("#kind-name").val();
    if (typeof kindnameValue === 'undefined' || kindnameValue.length === 0) {
        kindnameValue = '';
    } 

    // if all are blank set some defaults
    if (namespaces === '::' && kinds === '::' && labels === '::' && kindnameValue === '') {
        namespaces = '::all-namespaces::';
        kinds = '::all-kinds';
    }

    var data = {
        "namespaceFilter": namespaces,
        "kindsFilter": kinds,
        "kindnameValue": kindnameValue,
        "labelFilter": labels
    }

    return data;
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
    let info = svgInfo[text]
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
    // get the skipU checkbox value
    //var skipU = $('#skipU').prop('checked');    
    //Force skipping of "U" user types

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

function openNav() {
    document.getElementById("sideNavigation").style.width = "250px";
}

function closeNav() {
    //document.getElementById("sideNavigation").style.width = "0";
}


// get cmd history server
function viewCmds() {
    closeNav();
    socket.emit('getCmds');
}

// show color palette
function viewPalette() {
    closeNav();
    buildColorTable();
    $("#colorModal").modal();
}

// show change directory modal 
function changeDir() {
    closeNav();
    socket.emit('clusterDir');
    $("#loadStatus").empty();
    $("#loadStatus").html('&nbsp');
    // results are processing in returning payload
}

// // show file upload modal 
// function fileUpload() {
//     $("div#filedropzone").hide();
//     closeNav();
//     $("#fileModal").modal();
// }

// // show change directory modal 
// function uploadDir() {
//     var upDir = $('#uploadDir').val();
//     socket.emit('uploadDir', upDir);
// }

// show server parse statistics
function dirStats() {
    closeNav();
    socket.emit('getDirStats');
}

// get Cluster information 
function getCluster() {
    closeNav();
    // generate the UI base on selected cluster
    $('#clusterType').val('none');
    $("#clusterInfo").hide();
    $("#clusterInfo").html('');
    $("#clusterButton").show();
    $("#clusterModal").modal({
        backdrop: 'static',
        keyboard: false        
    }); 
    $("#clusterModal").modal('show');
    $("#clusterStatus").empty();
    $("#clusterStatus").html('&nbsp');
   
    //$("#clusterModal").modal();
}

function buildClusterUI(selected) {
    $("#clusterInfo").empty();
	$("#clusterInfo").html('');
    
    var bttn = '<div id="clusterButton">'
        + '<div style="padding-top: 20px;">'
        + '<button id="clusterBtn" type="button" class="btn btn-outline-primary btn-sm" onclick="dynamic()" style="margin: 5px;">'
        + 'Validate/Load'
        + '</button>'
        + '</div></div>';
    // values to be used in building the UI    
    var tmp00 = '<dir class="form-row">';
    var tmp01 = '<label class="col-sm-4 col-form-label" for="';       //add name
    var tmp02 = '" style="padding-top: 15px;">';                      //add name
    var tmp03 = '</label>';
    var tmp04 = '<input id="'                                         //add name
    var tmp05t = '" type="text" class="form-control col-sm-8" ';     //plain text input 
    var tmp05p = '" type="password" class="form-control col-sm-8" '; //password input
    var tmp06a = 'value="';                                           // if default value is provided add the value
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
    socket.emit('dynamic', kinfo);
    // clear the display table
    //stable.clear();
    //stable.draw()
    // show the processing status message
    $("#clusterStatus").empty();
    var resp = '<br><div><span style="vertical-align: middle;">Processing will take several seconds to complete</span></div>';
    $("#clusterStatus").html(resp);
}



//----------------------------------------------------------
// common functions
//----------------------------------------------------------
// populate drop down selections with server provided data
//----------------------------------------------------------

function buildColorTable() {
	var html = '<table>';
	var p1 = '<td width="120px" height="60px" style="background-color:#';
	var p2 = '; border: 4px solid white; color: #';
	var p3 = '; font-family: sans-serif; font-size: 11px; ">&nbsp;';
	var p4 = '</td>';
	var row = 1;
	var item = '';
	var data = colors.colors
	var bg,tc, tx
	for (c in data) {
		if (row === 1) {
			html = html + '<tr>';
		}
		bg = data[c][0].backgroundColor;
		tc = data[c][0].textColor;
		tx = data[c][0].title;
		
		item = p1 + bg + p2 + tc + p3 + c  + '<br>&nbsp' + bg + '<br>&nbsp';
		if (tx !== "") {
			item = item + tx + p4;
		} else {
			item = item + p4;
		}
		html = html + item;
		item = '';
		row++
		if (row === 6) {
			html = html + '</tr>';
			row = 1;
		}
	}
	if (row !== 1) {
		html = html + '</tr></table>';
	} else {
		html = html + '</table>';
	}
	$("#colorContents").empty();
    $("#colorContents").html(html);
    
}

function populateSelectLists(data) {
    popCnt++;
    var options;

    if (data.validDir === false) {
        setBaseDir('Invalid directory: ' + data.baseDir);
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
        
        options = bldProviders(data.providers, 'P', 'no');
        // cluster 
        $("#clusterType").html(options);

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
    data = dsCounts.kind;
    let keys = Object.keys(data);
    keys.sort();
    let total = data._total._cnt;
    let cKeys;
    let nsText = '';
    let htm = '<table class="vpkfont-md"><thead><tr class="bg-secondary text-light">' 
        + '<th>-Kind-</th><th class="pl-2">-Count-</th><th class="pl-2">-Namespace-</th>'
        + '</tr></thead><tbody>';
    // add overall total line
    htm = htm + '<tr><td width="150">All</td><td width="75" class="pd-4">' + total + '</td><td width="300" class="pl-2">All</td></tr>'


    for (let i = 0; i < keys.length; i++) {
        if ( keys[i].startsWith('_') ) {
            continue;
        }
        htm = htm + '<tr><td><hr></td><td><hr></td><td><hr></td></tr>'
        
        htm = htm + '<tr><td  class="bg-primary text-light">' + keys[i] + '</td><td>&nbsp;</td><td>&nbsp;</td></tr>'

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
    dsToggle = 'ns';
    data = dsCounts.ns;
    let keys = Object.keys(data);
    keys.sort();
    let total = dsCounts.kind._total._cnt;  // get overall total from the kinds stats
    let cKeys;
    let nsText = '';
    let htm = '<table class="vpkfont-md"><thead><tr class="bg-secondary text-light">' 
        + '<th>-Namespace-</th><th class="pl-2">-Count-</th><th class="pl-2">-Kind-</th>'
        + '</tr></thead><tbody>';
    // add overall total line
    htm = htm + '<tr><td width="150">All</td><td width="75" class="pd-4">' + total + '</td><td width="300" class="pl-2">All</td></tr>'


    for (let i = 0; i < keys.length; i++) {
        if ( keys[i].startsWith('_') ) {
            continue;
        }
        htm = htm + '<tr><td><hr></td><td><hr></td><td><hr></td></tr>'
        nsText = keys[i];
        if (nsText === 'cluster-level' ) {
            nsText = '< Cluster Level >'
        }
        
        htm = htm + '<tr><td class="bg-primary text-light">' + nsText + '</td><td>&nbsp;</td><td>&nbsp;</td></tr>'

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


function about() {
    $("#version").empty();
    $("#version").html('');
    $("#version").html('VERSION <span style="color: blue;">' + version + '</span>');
    $("#aboutModal").modal();
}


function clearDisplay() {
    $("#svgResults").empty();
    $("#svgResults").html('');
    $("#statsData").empty();
    $("#statsData").html('');

}


function setBaseDir(dir) {
    var htm;
    if (dir === '-none-') {
        dir = 'No data loaded';
    }
    //htm = '<input type="text" class="form-control" placeholder="' + dir + '"  disabled="true">';
    htm = dir;
    rootDir = dir;
    $("#baseDir").empty();
    $("#baseDir").html('');
    $("#baseDir").html(htm);
    $("#tableL").bootstrapTable('removeAll')
    clearSvg();
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
            id: id++,
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
    $("#tableL").bootstrapTable('hideColumn', 'id');

    // hide the graphics tabs 
    $('#svgResults').hide();
    $('#chartInfo').hide();
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