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
// format server returned object definition file and edit
//----------------------------------------------------------
function editDef(data) {
    //console.log(JSON.stringify(data, null, 4));
    var part = data.filePart;
    var defkey = data.defkey;
    var rtn = data.lines;
    data = null;
    // create array of file lines
    var newData = rtn.split('\n');
    var hl = newData.length;
    var outData = [];
    for (var d = 0; d < hl; d++) {
        outData.push(newData[d].substring(0) + '\n');
    } 
    newData = null;
    rtn = outData.join('');
    $("#editTitle").html(defkey);

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
