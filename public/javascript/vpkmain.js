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
// document ready
//----------------------------------------------------------
$(document).ready(function() {

    // get version from server
    getVersion();


    document.addEventListener("keypress", function onPress(event) {
        if (event.key === "p" && event.ctrlKey) {
            // Do something awesome
            console.log('got it, ctrl Z')
        }
    });

    // $(document).bind("keyup keydown", function(e) {
    //     if (e.ctrlKey && e.keyCode === 80) {
    //         console.log('kp false');
    //     }
    //     console.log('kp true');
        
    // }); 


    $('.carousel-item', '.multi-item-carousel').each(function(){
        var next = $(this).next();
        if (! next.length) {
          next = $(this).siblings(':first');
        }
        next.children(':first-child').clone().appendTo($(this));
      }).each(function(){
        var prev = $(this).prev();
        if (! prev.length) {
          prev = $(this).siblings(':last');
        }
        prev.children(':nth-last-child(2)').clone().prependTo($(this));
      });


 
    $('.modal').on("hidden.bs.modal", function (e) {
        --bootstrapModalCounter;
        if (bootstrapModalCounter > 0) {
        //don't need to recalculate backdrop z-index; already handled by css
        //$('.modal-backdrop').first().css('z-index', parseInt($('.modal:visible').last().css('z-index')) - 10);
        $('body').addClass('modal-open');
        }
    }).on("show.bs.modal", function (e) {
        ++bootstrapModalCounter;
        //don't need to recalculate backdrop z-index; already handled by css
    });

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
    $("#xreference").removeClass("active");
    $("#xreference").removeClass("show");

    // get the name of selected tab and process
    $( 'a[data-toggle="tab"]' ).on( 'shown.bs.tab', function( evt ) {
        currentTab = $( evt.target ).attr( 'href' );
        // take action based on what tab was shown
        if(currentTab === "#instructions") {
            checkIfDataLoaded();
            documentationTabTopic = 'toc';
            $('#svgResults').hide();
            $('#graphicCharts').hide();
            $('#schematic').hide();
            $('#security').hide();
            $('#xreference').hide();
        } else if (currentTab === "#searchR") {
            checkIfDataLoaded();
            documentationTabTopic = 'tableview';
            $('#svgResults').show();
            $('#graphicCharts').hide();
            $('#schematic').hide();
            $('#security').hide();
            $('#xreference').hide();
        } else if (currentTab === "#schematic") {
            checkIfDataLoaded();
            documentationTabTopic = 'schematics';
            $('#svgResults').hide();
            $('#graphicCharts').hide();
            $('#schematic').show();
            $('#security').hide();
            $('#xreference').hide();
        } else if (currentTab === "#graphic") {
            checkIfDataLoaded();
            documentationTabTopic = 'graphicview';
            $('#svgResults').hide();
            $('#graphicCharts').show();
            $('#schematic').hide();
            $('#security').hide();
            // ensure the loading icon is not shown
            $("#graphicChartInfo").empty();
            $("#graphicChartInfo").html('');
            $('#xreference').hide();
        } else if (currentTab === "#security") {
            checkIfDataLoaded();
            documentationTabTopic = 'security';
            $('#svgResults').hide();
            $('#graphicCharts').hide();
            $('#schematic').hide();
            $('#security').show();
            $("#usage-filter").prop("disabled", true);
            $('#xreference').hide();
        } else if (currentTab === "#xreference") {
            checkIfDataLoaded();
            documentationTabTopic = 'xreference';
            $('#svgResults').hide();
            $('#graphicCharts').hide();
            $('#schematic').hide();
            $('#security').hide();
            $('#xreference').show();
            $("#xref-filter").prop("disabled", true);
        } else {
            documentationTabTopic = 'toc';
        }
    });

    $("#tableL").on("click-cell.bs.table", function (field, value, row, $el) {
        selectedDef = $el.src + '::' + $el.part + '::' + $el.value;
        if ( $el.kind === 'Secret') {
            getDef5(selectedDef);   // secret modal with decode option
        } else {
            getDef(selectedDef);
        }
     });

    $('#pickDataSource').select2({
        dropdownCssClass: "vpkfont-md",
        containerCssClass: "vpkfont-md",
        placeholder: "Select snapshot"
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

    $('#usage-filter').select2({
        dropdownCssClass: "vpkfont-md",
        containerCssClass: "vpkfont-md",
        placeholder: "select filter values"
    }); 

    $('#usage-type').select2({
        dropdownCssClass: "vpkfont-md",
        containerCssClass: "vpkfont-md",
        placeholder: "select type"
    }); 

    $('#usage-type').on('select2:select', function (e) { 
        var selected = $('#usage-type option:selected').val();
        $("#usage-filter").prop("disabled", false);
        $('#usage-type').val(null)
    });

    $('#xref-filter').select2({
        dropdownCssClass: "vpkfont-md",
        containerCssClass: "vpkfont-md",
        placeholder: "select xref filter values"
    }); 

    $('#xref-type').select2({
        dropdownCssClass: "vpkfont-md",
        containerCssClass: "vpkfont-md",
        placeholder: "select xref"
    }); 

    $('#xrefEdit-type').select2({
        dropdownCssClass: "vpkfont-md",
        containerCssClass: "vpkfont-md",
        placeholder: "select xref"
    });

    $('#xrefEdit-type').on('select2:select', function (e) { 
        var selected = $('#xrefEdit-type option:selected').val();
        pickXref(selected);
        $('#xrefEdit-type').val(null)
    });    

    $("#searchBtn").click(function(e) {
        e.preventDefault();
        searchObj();
    });

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



// socket.on('dynamicResults', function(data) {
//     if (typeof data === 'undefined') {
//         data = {'status': 'unknown', 'message': 'Status unknown'}
//     } else {
//         if (typeof data.status === 'undefined') {
//             data.status = 'unknown';
//         }  
//         if (typeof data.message === 'undefined') {
//             data.status = 'Status unknown';
//         } 
//     }
//     var resp = '';
//     if (data.status === 'PASS') {
//         showMessage('Datasource connection completed', 'pass')
//         $("#clusterModal").modal('hide');
//         $("#clusterModalFooter").show();
//         $("#clusterRunning").hide();
//     } else {
//         var message = data.message;
//         resp = '<br><div>&nbsp;&nbsp;&nbsp;&nbsp;'  + message + '</div>';
//         $("#clusterRunning").hide();
//         $("#clusterStatus").html(resp);
//     }
// });



//----------------------------------------------------------
//----------------------------------------------------------
// socket io definitions for incoming and out-bound 
//----------------------------------------------------------
//----------------------------------------------------------
function saveConfig(what) {
    if (typeof what === 'undefined') {
        let sFlds = document.getElementById('statusFlds').checked;
        let mFlds = document.getElementById('mgmFlds').checked;

        if (typeof sFlds === 'undefined') {
            sFlds = false;
        }
        if (typeof mFlds === 'undefined') {
            mFlds = false;
        }
        socket.emit('saveConfig', { "managedFields": mFlds, "statusSection": sFlds} );
    } else {
        socket.emit('saveConfig', { "xrefData": xrefData} );
    }
}
//...
socket.on('saveConfigResult', function(data) {
    $("#configModal").modal('hide'); 
    if (data.result.status === 'PASS') {
        //showMessage(data.result.message, 'pass')
    } else {
        showMessage(data.result.message, 'fail')
    }
});
//==========================================================


//----------------------------------------------------------
function showConfig() {
    socket.emit('getConfig');
}
//...
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
//==========================================================


//----------------------------------------------------------
function getDocumentation(data) {
    let what;
    if (typeof data === 'undefined') {
        if (documentationTabTopic !== '') {  
            // question mark in top pressed, select the appropriate topic          
            what = {'doc': documentationTabTopic};
        }
    } else {
        // inside documentation modal, navigate to desired topic
        what = {'doc': data};
    }
    socket.emit('getDocumentation', what);
}
//...
socket.on('getDocumentationResult', function(data) {
    let content = data.content;
    $('#docsBody').html(content)
    $("#docsModal").modal('show');
});
//... using functions
function docNextTopic(link) {
    let next;
    if (typeof link === 'undefined') {
        next = $("#topicNext").attr("link")
    } else {
        next = link;
    }
    getDocumentation(next)
}
function docPrevTopic() {
    let prev = $("#topicBack").attr("link")
    getDocumentation(prev)
}
//==========================================================


//----------------------------------------------------------
// show change directory modal 
function changeDir() {
    socket.emit('clusterDir');
    $("#validateBtn").show();
    $("#loadStatus").hide();
    $("#chgDirFooter").show();
}
//...
socket.on('clusterDirResult', function(data) {
    //build the drop down of existing directories, hide messages, open modal
    var items = bldClusterDir(data.dirs);
    hideMessage();
    $('#dsInstances').html(items);
    $("#chgDirModal").modal('show');

});
//==========================================================


//----------------------------------------------------------
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
//...
socket.on('getKStatus', function(data) {
    $("#clusterModalFooter").hide();
    $("#clusterStatus").empty();
    $("#clusterStatus").html('');
    var resp;
    resp = '<br><div class="vpkfont vpkcolor">' + data + '</div>';
    $("#clusterStatus").html(resp); 

});
//==========================================================


//----------------------------------------------------------
// send request to decode object
function getDef4(def, secret) {
    //$("#multiModal").modal('hide');
    selectedDef = def;
    if (selectedDef.indexOf('undefined') > -1) {
        showMessage('Unable to locate source yaml.','fail');
    } else {
        data = {"file": selectedDef, "secret": secret}
        socket.emit('getDecode', data);
    }
}
//...
socket.on('getDecodeResult', function(data) {
    var content = data.result;
    var keys = Object.keys(content);
    var key;
    var html = '';
    var item = '';

    for (var k = 0; k < keys.length; k++) {
        key = keys[k];
        item = content[key];
        if (item.type === 'JSON') {
            value = JSON.stringify(item.value, null, 4);
        } else {
            value = item.value;
        }
        html = html + '\nKEY: ' + key + '\n' + '\n' + value + '\n' + '\n';
    }

    $("#decodeName").empty();
    $("#decodeName").html('<span class="vpkcolor">&nbsp;' + data.secret + '&nbsp;</span>');
    $("#decode").empty();
    $("#decode").html(html);
    $('#decodeModal').modal('show');
});
//==========================================================


//----------------------------------------------------------
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
function getFileByCid(data) {
    socket.emit('getFileByCid', data);
} 
//...
socket.on('objectDef', function(data) {
    // always edit, no longer provide browse 
    editDef(data);
});
//==========================================================


//----------------------------------------------------------
// send request to server to get hierarchy data
function getChart(type) {
    var processingChart = '<div class="row">'
        + '<div class="col mt-1 ml-1">'
        + '<img style="float:left" src="images/loading.gif" width="50" height="50"/>'
        + '<div class="vpkfont-md vpkcolor mt-2"><span>&nbsp;&nbsp;Processing chart request</span></div>'
        + '</div>'
        + '</div>'

    hideMessage();
    chartType = type;
    $("#graphicCharts").empty();
    $("#graphicChartInfo").empty();
    $("#graphicChartInfo").html(processingChart);

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
//...
socket.on('hierarchyResult', function(data) {
    $("#graphicCharts2").empty();
    $("#graphicCharts2").html('');
    if (chartType === 'hierarchy') {
        $("#graphicCharts2").removeAttr("viewBox");
        chartHierarchy(data, 'g');
    } else if (chartType === 'collapsible') {
        $("#graphicCharts2").removeAttr("height");
        $("#graphicCharts2").removeAttr("width");
        chartCollapsible(data, 'g');
    } else if (chartType === 'circlePack') {
        $("#graphicCharts2").removeAttr("height");
        $("#graphicCharts2").removeAttr("width");
        chartCirclePack(data, 'g');
    } 
});
//==========================================================


//----------------------------------------------------------
function about() {
    socket.emit('getUsage');
    $("#version").empty();
    $("#version").html('');
    $("#version").html('VERSION&nbsp;' + version  );
    $("#usageResult").hide();
    $("#aboutModal").modal();
}
//...
socket.on('usageResult', function(data) {
    let content = '';
    if (typeof data.empty !== 'undefined') {
        content = '<div class="text-center align-middle font-weight-bold vpkfont-lg">' + data.message + '</div>';
    } else {
        content = formatUsage(data);
    }
    $("#usageRunning").hide();
    $("#usageResult").empty();
    $("#usageResult").html(content);
    $("#usageResult").show();
});
//==========================================================


//----------------------------------------------------------
// show server statistics
function dirStats() {
    socket.emit('getDirStats');
}
//...
socket.on('dirStatsResult', function(data) {
    dsCounts = data;
    if (dsToggle === 'kind' || dsToggle === '') {
        buildKindStats();
    } else {
        buildNamespaceStats();
    }
});
//... supporting functions
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
//==========================================================


//----------------------------------------------------------
function getSelectLists() {
    socket.emit('getSelectLists');
}
function closeGetCluster() {
    getSelectLists();
    $("#clusterModal").modal('hide');
}
//$$
//$$ Also invoked in  $(document).ready(function() $$
//...
socket.on('selectListsResult', function(data) {
    clusterProviders = data.providers;
    populateSelectLists(data);
});
//==========================================================


//----------------------------------------------------------
// send request to server to get software version
function getVersion() {
    socket.emit('getVersion');
}
//...
socket.on('version', function(data) {
    version = data.version;
});
//==========================================================


//----------------------------------------------------------
// send request to load new directory
function reload() {
    $("#validateBtn").hide();
    $("#chgDirFooter").hide();
    $("#loadStatus").show();
    var newDir = $('#dsInstances').select2('data');
    newDir = newDir[0].text;
    $("#graphicCharts").empty();
    $("#graphicCharts").html('<svg width="950" height="5000"></svg>');
    $("#svgResults").empty();
    $("#svgResults").html('');
    $("#schematicDetail").empty();
    $("#schematicDetail").html('');

    //TODO consider handling other tabs

    socket.emit('reload', newDir);
}
//$$ also client.emit('selectListsResult', result) when reload is sent to server
//...
socket.on('resetResults', function(data) {
    if (data.validDir === false) {
        setBaseDir(data.baseDir);
        $("#chgDirModal").modal('hide');
        showMessage('Failed to connect to datasource', 'fail');
    } else {
        setBaseDir(data.baseDir);
        rootDir = data.baseDir;
        baseDir = data.baseDir;
        $("#loadStatus").hide();
        $("#chgDirFooter").show();
        $("#chgDirModal").modal('hide');
        showMessage('Datasource connected', 'pass');
        getSelectLists('y');
    }
});
//==========================================================


//----------------------------------------------------------
function bldSchematic() {
    hideMessage();
    socket.emit('schematic');
}
//...
socket.on('schematicResult', function(data) {
    k8cData = data.data;
    hideMessage();
    schematic();       
});
//==========================================================


//----------------------------------------------------------
function bldSecurity() {
    hideMessage();
    socket.emit('security');
}
//...
socket.on('securityResult', function(data) {
    k8cData = data.data;
    hideMessage();
    buildSecArrays();
    securityDefinitions();      
});
//==========================================================


//----------------------------------------------------------
function bldSecurityUsage() {
    hideMessage();
    socket.emit('securityUsage');
}
//...
socket.on('securityUsageResult', function(data) {
    k8cData = data.data;
    hideMessage();
    buildSecArrays();
    securityUsage();       
});
//==========================================================


//----------------------------------------------------------
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
    // reuse options var
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
    // reuse options var
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
//...
socket.on('searchResult', function(data) {
    //console.log(JSON.stringify(data, null, 4))
    buildSearchResults(data);
});
//...
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
    $("#tableL").bootstrapTable('load', newData)
    $("#tableL").bootstrapTable('hideColumn', 'src');
    $("#tableL").bootstrapTable('hideColumn', 'part');
}

//==========================================================


//----------------------------------------------------------
function bldXrefChart(type) {
    hideMessage();
    chartType = type;
    let filter = '';
    let tmp;
    let data;
    let processingChart = '<div class="row">'
        + '<div class="col mt-1 ml-1">'
        + '<img style="float:left" src="images/loading.gif" width="50" height="50"/>'
        + '<div class="vpkfont-md vpkcolor mt-2"><span>&nbsp;&nbsp;Processing xref request</span></div>'
        + '</div>'
        + '</div>';
    let xref = $('#xref-type').select2('data');
    let options = $('#xref-type').select2('data');
    for (var i = 0; i < options.length; i++) {
        tmp = options[i].text;
        tmp = tmp.split(' : ');
        if (tmp[0] !== '') {
            xref = tmp[0];
        } else {
            showMessage('No xref type selected');
            return;
        }
    };
    $("#xrefCharts").empty();
    $("#xrefInfo").empty();
    $("#xrefInfo").html(processingChart);
    if (filter === '') {
        filter = ':all:-xref:';
    }
    data = {'xref': xref, 'filter': filter};
    socket.emit('xreference', data); 
}
//...
socket.on('xrefResult', function(data) {
    $("#xrefCharts2").empty();
    $("#xrefCharts2").html('');
    if (chartType === 'hierarchy') {
        $("#xrefCharts2").removeAttr("viewBox");
        chartHierarchy(data, 'x');
    } else if (chartType === 'collapsible') {
        $("#xrefCharts2").removeAttr("height");
        $("#xrefCharts2").removeAttr("width");
        chartCollapsible(data, 'x');
    } else if (chartType === 'circlePack') {
        $("#xrefCharts2").removeAttr("height");
        $("#xrefCharts2").removeAttr("width");
        chartCirclePack(data, 'x');
    } 
});
//==========================================================


//----------------------------------------------------------
function xrefGetData(tmp) {
    hideMessage();
    socket.emit('getXrefRules');
}
//...
socket.on('getXrefRulesResult', function(data) {
    xrefData = data; 
    xrefEditModalDialog();
}); 
//==========================================================


//----------------------------------------------------------
// send request to server to get xref list
function getXrefFilter(data) {
    socket.emit('getXrefFilter', data);
}
//...
socket.on('getXrefFilterResults', function(data) {
    console.log(JSON.stringify(data, null, 4))
});
//==========================================================




//----------------------------------------------------------
function getConfig() {
    socket.emit('getConfigData');
}
//...
//==========================================================

//----------------------------------------------------------
//...
//==========================================================


//----------------------------------------------------------
// item was selected from xref edit dialog
function pickXref(tmp) {
    tmp = tmp.split(':');
    tmp = tmp[0].trim();
    xrefData.picked = tmp;
    xrefHhandleSelection();
}

//==========================================================



//----------------------------------------------------------
// used by search section of main UI
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

//----------------------------------------------------------
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

//----------------------------------------------------------
// build UI for the get Cluster  
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


//----------------------------------------------------------
console.log('loaded vpkmain.js');