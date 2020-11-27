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
// format server returned object definition file and edit
//----------------------------------------------------------
function editDef(data) {
    //console.log(JSON.stringify(data, null, 4));
    var part = data.filePart;
    var defkey = data.defkey;
    // defkey = defkey.trim();
    // if (defkey.indexOf('::') > -1 ){
    //     var parts = defkey.split('::');
    //     defkey = parts[0].trim();
    // }
    
    // if (defkey.indexOf(' --') > -1 ){
    //     var parts = defkey.split(' ');
    //     defkey = parts[0].trim();
    // }
    
    // // get file part and convert to integer
    // part = parseInt(part);
    // part++;
    
    var rtn = data.lines;
    data = null;
    var newData = rtn.split('\n');
    var hl = newData.length;
    var outData = [];
//    var sp;
//    var chkline;

    // if (typeof newData[3] !== 'undefined') {
    //     chkline = newData[3];
    //     if (chkline.indexOf('apiVersion') > -1) {
    //         sp = 2;
    //     } else {
    //         sp = 3;
    //     }
    // }

    for (var d = 0; d < hl; d++) {
        outData.push(newData[d].substring(0) + '\n');
    } 

    rtn = outData.join('');

    $("#editTitle").html(defkey);


    // for (var h = 0; h < hl; h++) {
    //     // if first entry set the header
    //     if (h === 0) {
    //         $("#editTitle").empty();
    //         $("#editTitle").html('');
            // var hdr = newData[h];
            // if (hdr.startsWith('- sourceFile: >-') ) {
            //     h++; 
            //     hdr = 'SourceFile: ' + newData[h];
            //     var sp = hdr.lastIndexOf(' ');
            //     var fn = hdr.substring(sp);
            //     fn = fn.trim();
            //     currentEditFile = fn;  
            //     hdr = fn;          
            // }           
            // if (hdr.startsWith('- s') ) {
            //     //hdr = 'S' + hdr.substr(3);
            //     var sp = hdr.lastIndexOf(' ');
            //     var fn = hdr.substring(sp);
            //     fn = fn.trim();
            //     currentEditFile = fn;
            //     hdr = fn;
            // }
            // hdr = hdr.trim();
            // $("#editTitle").html(hdr);
            // if (part > 1) {
            //     $("#editPart").empty();
            //     $("#editPart").html('');
            //     $("#editPart").html('Multi-definition file, part: ' + part);
            // } else {
            //     $("#editPart").empty();
            //     $("#editPart").html('');
            // }
            // h = h + 3;
    //     }
    // }

    initAceEditor(rtn);
    $("#editorModal").modal({
        backdrop: 'static',
        keyboard: false        
    });

    $('#editorModal').modal('show');

}

function initAceEditor(rtn) {
    editor = ace.edit("editor");
    editor.setValue(rtn);
    editor.setTheme("ace/theme/sqlserver");         // theme for editing
    editor.getSession().setMode("ace/mode/yaml");   // type of file high lighting
    editor.setOptions(
        {
            cursorStyle: "wide",
            fontSize: 11,
            printMargin: false,
            tabSize: 2,
            scrollPastEnd: 0.10,
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true
        }
    )  
    editor.commands.addCommand({
        name: 'saveFile',
        bindKey: {
            win: 'Ctrl-S',
            mac: 'Command-S',
            sender: 'editor|cli'
        },
        exec: function(env, args, request) {
            alert("Use the Save button to save the file");
            // call function to save the file
            // saveFile(currentEditFile);
        }
    });
    editor.focus();
    editor.gotoLine(1,0, true);
    editor.renderer.scrollToRow(1);  
    //editor.execCommand("find");  
}

//----------------------------------------------------------
console.log('loaded vpkedit.js');
