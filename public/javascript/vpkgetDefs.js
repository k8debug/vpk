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
// functions to handle get files from server
//----------------------------------------------------------


// send request to server to get object definition
function getDef(def) {
    selectedDef = def;
    editObj();
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
                showMessage('Unable to locate source yaml...','fail');
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

// send request to server to get object definition
function getDef3(def) {
    //$("#multiModal").modal('hide');
    selectedDef = def;
    if (selectedDef.indexOf('undefined') > -1) {
        showMessage('Unable to locate source yaml.','fail');
    } else {
        editObj();
    }
}

// getDef4 is in vpkMain.js


function getDef5(data) {
    let items = data.split('::');
    let nData = []
    let src;
    if (items.length === 3) {
        if (items[2] === 'file') {
            items[2] = 'Secret';
        }
        nData.push({
            'source': items[0], 
            'part': items[1], 
            'name': items[2]
        }); 
        multiList('Secret', nData);
    } else {
        items = data.split('.');
        src = rootDir + '/config' + items[0] + '.yaml';

        nData.push({
            'source': src, 
            'part': '0', 
            'name': 'secret'
        }); 
        multiList('Secret', nData);
    }
}

function getDef7(data) {

    if (data === 'missing') {
        $("#yamlModal").modal('show');
        return;
    }

    let items = data.split('.');
    let src = rootDir + '/config' + items[0] + '.yaml';
    selectedDef = src + '::' + items[1] + '::edit';
    editObj();
}

// send request to server to get object definition
function getDef8(def) {
    selectedDef = def;
    editObj();
}

function partArray(type, data) {
    try {
        if (type === 'Secret') {
            multiList(type, data)
        }
        if (data.length > 1)  {
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

//----------------------------------------------------------
console.log('loaded vpkgetDefs.js');