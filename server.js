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

//------------------------------------------------------------------------------
// Main server 
//------------------------------------------------------------------------------
var softwareVersion = '5.0.0';

//------------------------------------------------------------------------------
// Require statements
//------------------------------------------------------------------------------
var vpk = require('./lib/vpk');
var utl = require('./lib/utl');
var vpkReset = require('./lib/vpkReset');
var fileio = require('./lib/fileio');
var search = require('./lib/search');
var kube = require('./lib/kube');
var hier = require('./lib/hierarchy');
var schematic = require('./lib/svgSchematic');
var xref = require('./lib/xreference');
var docm = require('./lib/documentation');
var owner = require('./lib/ownerRef');
var storage = require('./lib/storage');

var fs = require('fs-extra');
var bodyParser = require('body-parser');
var YAML = require('js-yaml');
var commandLineArgs = require('command-line-args');
var commandLineUsage = require('command-line-usage');
var chalk = require('chalk');
var http = require('http');
var express = require('express');
var socketio = require('socket.io');
var app = express();
var server = http.createServer(app);
var io = socketio(server);
var partials = require('express-partials');
var compression = require('compression');
var cors = require('cors');
const { storageInfo } = require('./lib/vpk');

//------------------------------------------------------------------------------
// Define express routes / urls
//------------------------------------------------------------------------------
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(compression());
app.use(cors());
// Partials 
app.use(partials());
// Express 
app.use(express.urlencoded({ extended: true }));
// Routes
app.use('/', require('./public/routes/index.js'));
// Views location and processing engine
app.set('views', __dirname + '/public/views');
app.set('view engine', 'ejs');



//------------------------------------------------------------------------------
// Application variables
//------------------------------------------------------------------------------
//var colors = '';
var resetReq = false;
var statMessages;
var dashline = '----------------------------------------------------------------------';
var validDir = true;
var port = 4200;
var options;
var optionDefinitions = [{
        name: 'directory',
        alias: 'd',
        type: String
    },
    {
        name: 'port',
        alias: 'p',
        type: Number,
        defaultOption: 4200
    },
    {
        name: 'help',
        alias: 'h'
    }
];

//------------------------------------------------------------------------------
// process start parameters if provided
//------------------------------------------------------------------------------
options = commandLineArgs(optionDefinitions)

// -help used
if (typeof options.help !== 'undefined') {
    help();
    process.exit(0);
}

// -d used
if (typeof options.directory !== 'undefined' && options.directory !== null) {
    var val = options.directory;
    if (fs.existsSync(val)) {
        utl.logMsg('vpkMNL001 - Process directory defined at start: ' + val );
        vpk.dirFS.push(val);
        vpk.startDir = val;
        validDir = true;
    } else {
        utl.logMsg('vpkMNL002 - Not valid directory: ' + val );
        validDir = false;
    }
}

// -p used
if (typeof options.port !== 'undefined' && options.port !== null) {
    port = options.port;
    if (port < 1 || port > 65535) {
        utl.logMsg('vpkMNL099 - Invalid port number defined.  Valid range is 1 - 65535' );
        process.exit(-1);
    }
}

var bb = chalk.green;
var VPK_TITLE = chalk.bold.underline('Visual parsed Kubernetes' );
var VPK_VERSION = chalk.bold('Version: ' + softwareVersion );
var VPK_PORT = chalk.bold('Server Port: ' + port)

// Do not change the spacing of the following VPK_HEADER, and 
// do not delete the single tick mark
var VPK_HEADER = `
  ${bb('------------------------------------------------------------------')}
  | ${''}                                                               |              
  |  ${bb('\\˜˜\\')}        ${bb('/˜˜/')}        ${bb('|˜˜|  /˜˜/')}   ${bb(VPK_TITLE)} |
  |   ${bb('\\  \\')}      ${bb('/  /')}         ${bb('|  | /  /')}    ${bb(VPK_VERSION)}           |                  
  |    ${bb('\\  \\')}    ${bb('/  /')}          ${bb('|  |/  /')}     ${bb(VPK_PORT)}        | 
  |     ${bb('\\  \\')}  ${bb('/  /')}           ${bb('|      \\')}                              |
  |      ${bb('\\  \\')}${bb('/  /')}   ${bb('||˜˜˜\\\\')}  ${bb('|  |˜\\  \\')}                             |
  |       ${bb('\\')}${bb('    /')}    ${bb('||   ||')}  ${bb('|  |  \\  \\')}                            | 
  |        ${bb('\\')}${bb('__/')}     ${bb('||___//')}  ${bb('|__|   \\__\\')}                           |
  |                 ${bb('||')}                                             |
  |                 ${bb('||')}                                             |
  ${bb('------------------------------------------------------------------')}              
  `
//Do not delete the single tick mark above


// reset all vars that are used for parsing
vpkReset.resetAll();

// if not defined create the 'cluster' and 'usage' directories 
makedir('cluster');
makedir('usage');

// read vpk configuration file
var vf = 'vpkconfig.json';
var gcstatus = utl.readConfig(vf);
if (gcstatus === 'OK') {
    // get userconfig.json data
    vf = 'userconfig.json';
    utl.readConfig(vf);
} else {
    utl.logMsg('vpkMNL095 - Terminating application unable to find configuration file: ' + vf);
    process.exit(-1);
}


//------------------------------------------------------------------------------
// Define express routes / urls
//------------------------------------------------------------------------------

app.get('/hier', function(req, res) {
    let data = vpk.hierarchy;
    res.end(JSON.stringify(data,null,4));
    utl.logMsg('vpkMNL787 - GET hier event received');
});

app.get('/dumpall',function(req,res){
    res.end(JSON.stringify(vpk,null,2));
    utl.logMsg('vpkMNL791 - GET dumpall event received');
});

app.get('/dumpcore',function(req,res){
    let data = vpk;
    res.end(JSON.stringify(data,null,2));
    utl.logMsg('vpkMNL787 - GET dumpcore event received');
});

// dump something from vpk 
app.get('/dump/:what', function(req, res) {
    let data = req.params.what;
    res.end(JSON.stringify(vpk[data],null,2));
    utl.logMsg('vpkMNL787 - GET dump/<what> event received');
});

// dump something from vpk 
app.get('/dumpobj/:p1', function(req, res) {
    let p1 = req.params.p1;
    let obj = vpk[p1];
    let objName = 'vpk.' + p1;
    let result = utl.showProps(obj,objName)
    res.end(result);
    utl.logMsg('vpkMNL792 - GET dumpobj/<name> event received');
});

app.get('/dumpobj/:p1/:p2', function(req, res) {
    let p1 = req.params.p1;
    let p2 = req.params.p2;
    p2 = chgP2(p2);
    p2.replace("@", "/")
    let obj = vpk[p1][p2];
    let objName = 'vpk.' + p1 + '/' + p2;
    let result = utl.showProps(obj,objName)
    res.end(result);
});

app.get('/dumpobj/:p1/:p2/:p3', function(req, res) {
    let p1 = req.params.p1;
    let p2 = req.params.p2;
    p2 = chgP2(p2);
    p2.replace("@", "/")
    let p3 = req.params.p3;
    let obj = vpk[p1][p2][p3];
    let objName = 'vpk.' + p1 + '/' + p2 + '/' + p3;
    let result = utl.showProps(obj,objName)
    res.end(result);
});

app.get('/dumpobj/:p1/:p2/:p3/:p4', function(req, res) {
    let p1 = req.params.p1;
    let p2 = req.params.p2;
    p2 = chgP2(p2);
    p2.replace("@", "/")
    let p3 = req.params.p3;
    let p4 = req.params.p4;
    let obj = vpk[p1][p2][p3][p4];
    let objName = 'vpk.' + p1 + '/' + p2 + '/' + p3 + '/' + p4;
    let result = utl.showProps(obj,objName)
    res.end(result);
});

app.get('/dumpobj/:p1/:p2/:p3/:p4/:p5', function(req, res) {
    let p1 = req.params.p1;
    let p2 = req.params.p2;
    p2 = chgP2(p2);
    p2.replace("@", "/")
    let p3 = req.params.p3;
    let p4 = req.params.p4;
    let p5 = req.params.p5;
    let obj = vpk[p1][p2][p3][p4][p5];
    let objName = 'vpk.' + p1 + '/' + p2 + '/' + p3 + '/' + p4 + '/' + p5;
    let result = utl.showProps(obj,objName)
    res.end(result);
});

app.get('/dumpobj/:p1/:p2/:p3/:p4/:p5/:p6', function(req, res) {
    let p1 = req.params.p1;
    let p2 = req.params.p2;
    p2 = chgP2(p2);
    p2.replace("@", "/")
    let p3 = req.params.p3;
    let p4 = req.params.p4;
    let p5 = req.params.p5;
    let p6 = req.params.p6;
    let obj = vpk[p1][p2][p3][p4][p5][p6];
    let objName = 'vpk.' + p1 + '/' + p2 + '/' + p3 + '/' + p4 + '/' + p5 + '/' + p6;
    let result = utl.showProps(obj,objName)
    res.end(result);
});

app.get('/dumpobj/:p1/:p2/:p3/:p4/:p5/:p6/:p7', function(req, res) {
    let p1 = req.params.p1;
    let p2 = req.params.p2;
    p2 = chgP2(p2);
    p2.replace("@", "/")
    let p3 = req.params.p3;
    let p4 = req.params.p4;
    let p5 = req.params.p5;
    let p6 = req.params.p6;
    let p7 = req.params.p7;
    let obj = vpk[p1][p2][p3][p4][p5][p6][p7];
    let objName = 'vpk.' + p1 + '/' + p2 + '/' + p3 + '/' + p4 + '/' + p5 + '/' + p6 + '/' + p7;
    let result = utl.showProps(obj,objName)
    res.end(result);
});

app.get('/dumpobj/:p1/:p2/:p3/:p4/:p5/:p6/:p7/:p8', function(req, res) {
    let p1 = req.params.p1;
    let p2 = req.params.p2;
    p2 = chgP2(p2);
    p2.replace("@", "/")
    let p3 = req.params.p3;
    let p4 = req.params.p4;
    let p5 = req.params.p5;
    let p6 = req.params.p6;
    let p7 = req.params.p7;
    let p8 = req.params.p8;
    let obj = vpk[p1][p2][p3][p4][p5][p6][p7][p8];
    let objName = 'vpk.' + p1 + '/' + p2 + '/' + p3 + '/' + p4 + '/' + p5 + '/' + p6 + '/' + p7 + '/' + p8;
    let result = utl.showProps(obj,objName)
    res.end(result);
});

app.get('/dumpobj/:p1/:p2/:p3/:p4/:p5/:p6/:p7/:p8/:p9', function(req, res) {
    let p1 = req.params.p1;
    let p2 = req.params.p2;
    p2 = chgP2(p2);
    p2.replace("@", "/")
    let p3 = req.params.p3;
    let p4 = req.params.p4;
    let p5 = req.params.p5;
    let p6 = req.params.p6;
    let p7 = req.params.p7;
    let p8 = req.params.p8;
    let p9 = req.params.p9;
    let obj = vpk[p1][p2][p3][p4][p5][p6][p7][p8][p9];
    let objName = 'vpk.' + p1 + '/' + p2 + '/' + p3 + '/' + p4 + '/' + p5 + '/' + p6 + '/' + p7 + '/' + p8 + '/' + p9;
    let result = utl.showProps(obj,objName)
    res.end(result);
});

app.get('/dumpobj/:p1/:p2/:p3/:p4/:p5/:p6/:p7/:p8/:p9/:p10', function(req, res) {
    let p1 = req.params.p1;
    let p2 = req.params.p2;
    p2 = chgP2(p2);
    p2.replace("@", "/")
    let p3 = req.params.p3;
    let p4 = req.params.p4;
    let p5 = req.params.p5;
    let p6 = req.params.p6;
    let p7 = req.params.p7;
    let p8 = req.params.p8;
    let p9 = req.params.p9;
    let p10 = req.params.p10;
    let obj = vpk[p1][p2][p3][p4][p5][p6][p7][p8][p9][p10];
    let objName = 'vpk.' + p1 + '/' + p2 + '/' + p3 + '/' + p4 + '/' + p5 + '/' + p6 + '/' + p7 + '/' + p8 + '/' + p9 + '/' + p10;
    let result = utl.showProps(obj,objName)
    res.end(result);
});

app.get('/dumpobj/:p1/:p2/:p3/:p4/:p5/:p6/:p7/:p8/:p9/:p10/:p11', function(req, res) {
    let p1 = req.params.p1;
    let p2 = req.params.p2;
    p2 = chgP2(p2);
    p2.replace("@", "/")
    let p3 = req.params.p3;
    let p4 = req.params.p4;
    let p5 = req.params.p5;
    let p6 = req.params.p6;
    let p7 = req.params.p7;
    let p8 = req.params.p8;
    let p9 = req.params.p9;
    let p10 = req.params.p10;
    let p11 = req.params.p11;
    let obj = vpk[p1][p2][p3][p4][p5][p6][p7][p8][p9][p10][p11];
    let objName = 'vpk.' + p1 + '/' + p2 + '/' + p3 + '/' + p4 + '/' + p5 + '/' + p6 + '/' + p7 + '/' + p8 + '/' + p9 + '/' + p10 + '/' + p11;
    let result = utl.showProps(obj,objName)
    res.end(result);
});

app.get('/dumpobj/:p1/:p2/:p3/:p4/:p5/:p6/:p7/:p8/:p9/:p10/:p11/:p12', function(req, res) {
    let p1 = req.params.p1;
    let p2 = req.params.p2;
    p2 = chgP2(p2);
    p2.replace("@", "/")
    let p3 = req.params.p3;
    let p4 = req.params.p4;
    let p5 = req.params.p5;
    let p6 = req.params.p6;
    let p7 = req.params.p7;
    let p8 = req.params.p8;
    let p9 = req.params.p9;
    let p10 = req.params.p10;
    let p11 = req.params.p11;
    let p12 = req.params.p12;
    let obj = vpk[p1][p2][p3][p4][p5][p6][p7][p8][p9][p10][p11][p12];
    let objName = 'vpk.' + p1 + '/' + p2 + '/' + p3 + '/' + p4 + '/' + p5 + '/' + p6 + '/' + p7 + '/' + p8 + '/' + p9 + '/' + p10 + '/' + p11 + '/' + p12;
    let result = utl.showProps(obj,objName)
    res.end(result);
});

app.get('/dumpobj/:p1/:p2/:p3/:p4/:p5/:p6/:p7/:p8/:p9/:p10/:p11/:p12/:p13', function(req, res) {
    let p1 = req.params.p1;
    let p2 = req.params.p2;
    p2 = chgP2(p2);
    p2.replace("@", "/")
    let p3 = req.params.p3;
    let p4 = req.params.p4;
    let p5 = req.params.p5;
    let p6 = req.params.p6;
    let p7 = req.params.p7;
    let p8 = req.params.p8;
    let p9 = req.params.p9;
    let p10 = req.params.p10;
    let p11 = req.params.p11;
    let p12 = req.params.p12;
    let p13 = req.params.p13;
    let obj = vpk[p1][p2][p3][p4][p5][p6][p7][p8][p9][p10][p11][p12][p13];
    let objName = 'vpk.' + p1 + '/' + p2 + '/' + p3 + '/' + p4 + '/' + p5 + '/' + p6 + '/' + p7 + '/' + p8 + '/' + p9 + '/' + p10 + '/' + p11 + '/' + p12 + '/' + p13;
    let result = utl.showProps(obj,objName)
    res.end(result);
});

app.get('/dumpobj/:p1/:p2/:p3/:p4/:p5/:p6/:p7/:p8/:p9/:p10/:p11/:p12/:p13/:p14', function(req, res) {
    let p1 = req.params.p1;
    let p2 = req.params.p2;
    p2 = chgP2(p2);
    p2.replace("@", "/")
    let p3 = req.params.p3;
    let p4 = req.params.p4;
    let p5 = req.params.p5;
    let p6 = req.params.p6;
    let p7 = req.params.p7;
    let p8 = req.params.p8;
    let p9 = req.params.p9;
    let p10 = req.params.p10;
    let p11 = req.params.p11;
    let p12 = req.params.p12;
    let p13 = req.params.p13;
    let p14 = req.params.p14;
    let obj = vpk[p1][p2][p3][p4][p5][p6][p7][p8][p9][p10][p11][p12][p13][p14];
    let objName = 'vpk.' + p1 + '/' + p2 + '/' + p3 + '/' + p4 + '/' + p5 + '/' + p6 + '/' + p7 + '/' + p8 + '/' + p9 + '/' + p10 + '/' + p11 + '/' + p12 + '/' + p13 + '/' + p14;
    let result = utl.showProps(obj,objName)
    res.end(result);
});


app.get('/ping', function(req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/plain'
    });
    utl.logMsg('vpkMNL788 - Pinged');
    res.end('VpK server is OK\n');
});



function chgP2(data) {
    let cp = data.lastIndexOf('@');
    let result = '';
    if (cp > -1) {
        result = data.substring(0,cp) + '/' + data.substring(cp + 1);
    } else {
        result = data;
    }
    return result;
}

function cidNameLookup(data) {
    let parts;
    if (typeof data === 'undefined') {
        return 'nf';
    }
    if (typeof data[1] !== 'undefined') {
        parts = data[1].split('::')
    } else {  
        parts = data.split('::');
    }
    let ns = '';
    let kind = '';
    let name = '';
    let key = '';
    if (parts.length > 3) {
        ns = parts[2];
        if (typeof parts[3] !== 'undefined') {
            kind = parts[3];
        }
        if (typeof parts[4] !== 'undefined') {
            name = parts[4];
        }
    } else if (parts.length === 3) {
        ns = 'cluster-level';
        kind = 'Namespace';
        name = parts[2]
    } else {
        return 'nf';
    }

    //check for file    
    if (typeof vpk[kind] !== 'undefined') {
        key = ns+'.'+kind+'.'+name;
        if (typeof vpk[kind][key] !== 'undefined') {
            if (typeof vpk[kind][key][0] !== 'undefined') {
                if (typeof vpk[kind][key][0].sourceFile !== 'undefined') {
                    return vpk[kind][key][0].sourceFile;
                }
            }
        }
    }
    return 'nf';
}

//------------------------------------------------------------------------------
// Define SocketIO 
//------------------------------------------------------------------------------
io.on('connection', client => {

    client.on('saveConfig', (data) => {
        utl.logMsg('vpkMNL149 - Save config file request' );
        let result = utl.saveConfigFile(data);
        client.emit('saveConfigResult', {'result': result });
    });
    
    client.on('getConfig', () => {
        utl.logMsg('vpkMNL159 - Get config data request' );
        client.emit('getConfigResult', {'config': vpk.defaultSettings});
    });

    client.on('getDocumentation', data => {
        utl.logMsg('vpkMNL359 - Get documentation request: ' + data.doc );
        let result = {'content': 'No documentation located'}
        if (typeof data.doc !== 'undefined') {
            if (typeof vpk.documentation[data.doc] !== 'undefined') {
                result = vpk.documentation[data.doc];
            }
        }
        client.emit('getDocumentationResult', result);
    });    
    
    client.on('getOwnerRefLinks', () => {
        utl.logMsg('vpkMNL359 - Get owner ref links request');
        let links = owner.getLinks();
        client.emit('getOwnerRefLinksResult', {'links': links});
    }); 

    client.on('getFileByCid', data => {
        utl.logMsg('vpkMNL091 - Get getFileByCid request ' );
        let key = cidNameLookup(data)
        let result = '';
        let fKey = '';
        // key format = fileName::part
        if (key !== 'nf') {
            fKey = key + '::0::file';
            //result = getFileContents(fKey);
            client.emit('getFileByCidResults', fKey);
        }
    });
    
    client.on('getStorage', () => {
        utl.logMsg('vpkMNL359 - Get storage request');
        storage.buildStorage();
        client.emit('getStorageResult', {'info': vpk.storageInfo});
    }); 

    client.on('clusterDir', () => {
        utl.logMsg('vpkMNL676 - Get cluster directory request' );
        var result = {
            'dirs': utl.getClusterDir()
        };
        utl.logMsg('vpkMNL021 - Emit cluster directory' );
        client.emit('clusterDirResult', result);

    });

    client.on('connectK8', (data) => {
        utl.logMsg('vpkMNL699 - Connect to K8 request' );
        var dynDir = process.cwd();
        var tmpDir = '';
        var dTmp;
        var fsps;
        var kga;           // Kubernetes Get Array
        var ca;
        var msg;
        var slp;
        // set the new directory name
        if (typeof data.snapshot_prefix !== 'undefined') {
            dTmp = data.snapshot_prefix;
            dTmp.trim();
            // check for spaces and only use what is before the first space
            fsps = dTmp.indexOf(' ');
            if (fsps > -1 ){
                dTmp = dTmp.substring(0,fsps);
            }
            tmpDir = dTmp;
        } else {
            tmpDir = 'kube';
        }
        tmpDir = tmpDir + '-' + utl.dirDate();

        kga;       // Kubernetes Get Array
        slp = tmpDir.lastIndexOf('/');

        if (slp > -1) {
            slp++;
            tmpDir = tmpDir.substring(slp);
        }

        dynDir = dynDir + '/cluster/' + tmpDir;
        vpk.clusterDirectory = dynDir;

        //TODO: check, should this be async
        ca = kube.getAuth(data);
        if (ca === 'PASS') {
            
            msg = 'Authentication completed successfully';
            client.emit('getKStatus', msg);

            // Using kubectl or other CLI get list of api resources in the cluster
            kga = kube.getAPIs(data);
            if (kga === 'FAIL') {
                msg = 'Failed to retrieve api resource data, check log messages';
                utl.logMsg('vpkMNL697 - ' + msg );
                client.emit('getKStatus', msg);
                // kube.logout(data);
            } else {
                // reset and clear the old kinds and counts in the vpk object
                utl.resetVpkObject();
                getK(data, kga, client, dynDir);
            }
        } else {
            msg = 'Failed Authentication';
            client.emit('getKStatus', msg);
        }
    });

    client.on('getCmds', () => {
        utl.logMsg('vpkMNL019 - Get command history' );
        var result = {
            'logs': vpk.cmdHist
        };
        utl.logMsg('vpkMNL021 - Emit cmdResult' );
        client.emit('cmdResult', result);
    });

    client.on('getDecode', parm => {
        // save the key for use when results are returned
        var def = parm.file;
        var secret = parm.secret;
        var parts = def.split('::');
        var fn = parts[0] + '::' + parts[1];
        var data;
        var tmp;
        var vArray = {};
        var text = '';
        var buff;

        utl.logMsg('vpkMNL173 - Decode secret from file: ' + fn );
            
        // decode base64 data in secret
        try {
            tmp = utl.readResourceFile(fn);
            if (typeof tmp.data !== 'undefined') {
                data = tmp.data;
                if (typeof data === 'object') {
                    let keys = Object.keys(data);
                    let key;
                    for (let d = 0; d < keys.length; d++) {
                        key = keys[d];
                        buff = new Buffer.from(data[key], 'base64');
                        text = buff.toString('ascii');
                        if (text.startsWith('{')) {
                            text = JSON.parse(text)
                            vArray[key] = {
                                'value': text,
                                'type': 'JSON'
                            }
                        } else {
                            vArray[key] = {
                                'value': text,
                                'type': 'TEXT'
                            }
                        }
                    }
                }
            } else {
                vArray[key] = {
                    'value': 'Unable to process request to decode value',
                    'type': 'TEXT'
                }
            }
            var result = {
                'result': vArray,
                'secret': secret
            };
            utl.logMsg('vpkMNL005 - Emit decodeDef' );
            client.emit('getDecodeResult', result);
        } catch (err) {
            utl.logMsg('vpkMNL174 - Error processing decode, message: ' + err );
        }
    });

    client.on('getDef', data => {
        var parts = data.split('::');
        data = parts[0] + '::' + parts[1];
        utl.logMsg('vpkMNL003 - Get file: ' + parts[0] );
        var result = getFileContents(data);
        client.emit('objectDef', result);
    });

    client.on('getHierarchy', data => { 
        utl.logMsg('vpkMNL077 - GetHierarchy request' );
        var result = hier.filterHierarchy(data);
        utl.logMsg('vpkMNL178 - Emit hierarchyResults' );
        client.emit('hierarchyResult', result);
    });    

    client.on('getUsage', () => { 
        utl.logMsg('vpkMNL477 - GetUsage request' );
        var result = '{"empty": true}';
        var dumpFile = process.cwd() + '/usage/usageInfo.json';
        var getRpt = true;
        var readRpt = true;

        try {
            fs.unlinkSync(dumpFile)
            utl.logMsg('vpkMNL474 - Old usage file removed'); 
        } catch(e0) {
            if (!e0.msssage === 'dumpfile is not defined') {
                client.emit('usageResult', result);
                getRpt = false;
            } else {
                utl.logMsg('vpkMNL475 - Usage file did not exist'); 
            }
        }

        if (getRpt === true) {
            if (readRpt === true) {
                try {
                    process.report.writeReport(dumpFile);
                } catch (err) {
                    utl.logMsg('vpkMNL477 - Error obtaining node.js process report, message: ' + err); 
                    utl.logMsg('vpkMNL476 - Stack: ' + err.stack); 
                    result = '{"empty": true, "message": "Unable to obtain usage information"}';
                }
            }

            setTimeout( () => {
                try {
                    result = fs.readFileSync(dumpFile, "utf8");
                } catch (e) {
                    utl.logMsg('vpkMNL473 - Unabale to read usage file, message: ' + e);
                    result = '{"empty": true, "message": "Unable to read usage file" }';
                }

                result = JSON.parse(result)
                result.LICENSE = vpk.LICENSE;
                utl.logMsg('vpkMNL478 - Emit usageResults' );
                client.emit('usageResult', result);
            }, 400); 
        }
    });

    client.on('getDirStats', () => {
        utl.logMsg('vpkMNL006 - DirStats request' );
        utl.logMsg('vpkMNL007 - Emit dirStatsResults' );
        var result = {'kind': vpk.fileCnt, 'ns': vpk.namespaceCnt}
        //client.emit('dirStatsResult', statMessages);
        client.emit('dirStatsResult', result);
    });

    client.on('getSelectLists', () => {
        utl.logMsg('vpkMNL008 - Get select lists request' );
        var labels = Object.keys(vpk.labelKeys);
        let explains = ''
        if (vpk.explains !== '') {
            explains = vpk.explains;
        }
        var result = {
            'kinds': vpk.kinds,
            'namespaces': vpk.definedNamespaces,
            'baseDir': vpk.startDir,
            'validDir': validDir,
            'providers': vpk.providers,
            'labels': labels,
            'xRefs': vpk.configFile.xrefNames,
            'explains': explains
        };
        utl.logMsg('vpkMNL047 - Emit selectListsResult' );
        client.emit('selectListsResult', result);
    });

    client.on('getVersion', () => {
        utl.logMsg('vpkMNL091 - Get software version request ' );
        var result = {'version': softwareVersion};
        utl.logMsg('vpkMNL049 - Emit version' );
        client.emit('version', result);
    });

    client.on('reload', data => {
        utl.logMsg('vpkMNL009 - Snapshot directory: ' + data );
        vpk.clusterDirectory = data;
        let explains = ''
        if (vpk.explains !== '') {
            explains = vpk.explains;
        }
        var labels = Object.keys(vpk.labelKeys);
        reload(data);
        // setTimeout( () => {
            var result = {
                'kinds': vpk.kinds,
                'namespaces': vpk.definedNamespaces,
                'baseDir': vpk.startDir,
                'validDir': validDir,
                'providers': vpk.providers,
                'labels': labels,
                'xRefs': vpk.configFile.xrefNames,
                'explains': explains 
            };
            utl.logMsg('vpkMNL010 - Emit selectListsResult' );
            client.emit('selectListsResult', result);

            result = {
                'baseDir': vpk.startDir,
                'validDir': validDir
            };
            utl.logMsg('vpkMNL011 - Emit resetResults' );
            client.emit('resetResults', result);

        //     resetReq = false;
        // }, 2000);
    });

//TODO verify if this is dead code
    client.on('saveFile', data => {
        utl.logMsg('vpkMNL076 - SaveFile request for file: ' + data.filename );
        var status = utl.saveEditFile(data.filename, data.content);
        client.emit('saveFileResults', status);
    });


    client.on('schematic', data => {
        utl.logMsg('vpkMNL091 - Get schematic request ' );
        schematic.parse(data);
        client.emit('schematicResult', {'data': vpk.containers, 'messages': vpk.svgMsg} );
    });

    client.on('security', () => {
        utl.logMsg('vpkMNL091 - Get security request ' );
        schematic.parse();  //no data will be passed
        client.emit('securityResult', {'data': vpk.containers, 'messages': vpk.svgMsg} );
    });

    client.on('securityUsage', () => {
        utl.logMsg('vpkMNL091 - Get securityUsage request ' );
        schematic.parse(); //no
        client.emit('securityUsageResult', {'data': vpk.containers, 'messages': vpk.svgMsg} );
    });

    client.on('search', data => {
        var msg = 'Search for ' + data.kindFilter + ' in ' + data.namespaceFilter;
        if (data.kindnameValue > '') {
            msg = msg + ' with name of kind containing: ' + data.searchValue
        }
        if (data.labelFilter > '::') {
            msg = msg + ' and labels: ' + data.labelFilter
        }        
        utl.logMsg('vpkMNL037 - ' + msg);
        var result = search.process(data);
        utl.logMsg('vpkMNL036 - Emit searchResult' );
        client.emit('searchResult', result);
    });

    client.on('xreference', data => {
        utl.logMsg('vpkMNL067 - Get xreference request ' );
        let result = '{"empty": true}';
        if (typeof data.xref !== 'undefined') {
            result = xref.getXrefs(data)
        } 
        client.emit('xrefResult', result );
    });

    client.on('getXrefRules', () => {
        utl.logMsg('vpkMNL067 - Get xref rules request ' );
        let result = '{"empty": true}';
        result = xref.getXrefRules()
        client.emit('getXrefRulesResult', result );
    });
});

function getFileContents(data) {
    var result;
    var part
    var fn;
    var fileData;
    try {
        if (data.indexOf('::')) {
            part = data.split('::');
            fn = part[0];
        } else {
            fn = data
        }
        fileData = utl.readResourceFile(fn);
        // check if managed fields should be removed;
        if (typeof vpk.defaultSettings.managedFields !== 'undefined') {
            if (vpk.defaultSettings.managedFields === false) {
                if (typeof fileData.metadata.managedFields !== 'undefined') {
                    delete fileData.metadata.managedFields;
                }
            }   
        }
        // check if status section should be removed;
        if (typeof vpk.defaultSettings.statusSection !== 'undefined') {
            if (vpk.defaultSettings.statusSection === false) {
                if (typeof fileData.status !== 'undefined') {
                    delete fileData.status;
                }                    
            }   
        }
        fileData = YAML.safeDump(fileData);
        result = {
            'filePart': part[1],
            'lines': fileData,
            'defkey': part[0]
        };
        return result;
    } catch (err) {
        utl.logMsg('vpkMNL057 - Error processing getDef, message: ' + err );
        utl.logMsg(err.stack );
    }
}


// Get the K8 resource type and emit message after processing
async function getK(data, kga, client, dynDir) {
    var kind;
    var tmp;
    var msg;
    var hl;
    hl = kga.length;
    var curK = 0; 
    var rtn = '';

    // initialize global storage to be empty
    vpk.rtn = {'items': []};
    kga.sort();
    for (var k = 0; k < kga.length; k++) {
        await kube.getKubeInfo(data, kga[k], client)
        tmp = kga[k];
        kind = tmp.substring(0, tmp.length - 2);
        curK++;
        msg = 'Processed count ' + curK + ' of ' + hl + ' - Resource kind: <span class="vpkcolor">' + kind + '</span>';
        rtn = {'msg': msg, 'current': curK, 'max': hl}
        client.emit('getKStatus', rtn);
    }
    //logout of current K8s environment
    //kube.logout(data);
    returnData(client, dynDir);

}

function returnData(client, dynDir) {
    var rdata = {};
    if (vpk.rtn === 'FAIL') {
        rdata.status = 'FAIL';
        rdata.message = 'Failed to retrieve data, check log messages';
    } else {
        rdata = write2(vpk.rtn, dynDir);
    }
    utl.logMsg('vpkMNL697 - Emit dynamicResults' );
    //client.emit('dynamicResults', rdata);
}

function write2(yf, dynDir) {
    utl.logMsg('vpkMNL606 - Write files invoked' );
    var rdata  = {};
    rdata.status = 'PASS';
    rdata.message = 'OK';

    try {
        remdir(dynDir);
        var mkresult = makedir(dynDir);
        if (mkresult === 'PASS') {
            var fbase = 'config';
            var fnum = 1000;
            var fn;
            var oldKind = '@startUp';
            var input;
            var cnt = 0;
            for (var i = 0; i < yf.items.length; i++) {
                input = yf.items[i];
                if (typeof input.kind !== 'undefined') {
                    if (oldKind !== input.kind) {
                        utl.logMsg('vpkMNL617 - Kind: ' + oldKind + ' fnum: ' + fnum)
                        oldKind = input.kind;
                    }
                }
                input = JSON.stringify(input, null, 4);
                fnum++;
                fn = dynDir + '/' + fbase + fnum + '.yaml';
                fs.writeFileSync(fn, input);
                cnt++
                utl.saveFileName(fn, fnum)
            }
            utl.logMsg('vpkMNL603 - Created ' + cnt + ' yaml files' );

            // load newly created files
            reload(dynDir);
            
        } else {
            utl.logMsg('vpkMNL605 - Unable to create directory: ' + dynDir );
            rdata.status = 'FAIL';
            rdata.message = 'vpkMNL605 - Unable to create directory: ' + dynDir ;
        }
    } catch (err) {
        utl.logMsg('vpkMNL606 - Error creating directory: ' + dynDir + ' message: ' + err );
        rdata.status = 'FAIL';
        rdata.message = 'vpkMNL606 - Error creating directory: ' + dynDir + ' message: ' + err;
        return rdata;
    }
    return rdata;
}


function reload(dir) {

    // if valid directory process
    if (fs.existsSync(dir)) {
        resetReq = true;
        utl.resetVpkObject();
        vpkReset.resetAll();
        vpk.dirFS.push(dir);
        vpk.startDir = dir;
        utl.logMsg('vpkMNL311 - Using snapshot: ' + vpk.startDir );
        validDir = true;
        checkLoop();
    } else {
        vpk.startDir = dir;
        validDir = false;
        statMessages = [];
        statMessages.push('vpkMNL012 - Invalid directory, no stats returned' );
    }
}


function makedir(dir) {
    try {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
            utl.logMsg('vpkMNL158 - Created directory: ' + dir );
        } else {
            //utl.logMsg('vpkMNL157 - Directory already exists: ' + dir );
        }
        return 'PASS';            
    } catch (e) {
        utl.logMsg('vpkMNL160 - Failed to create directory: ' + dir + ' error message: ' + e );
        return 'FAIL';
    }
}


function remdir(dir) {
    try {
        // remove the directory if it already exists;
        fs.removeSync(dir);
        //utl.logMsg('vpkMNL163 - Removed directory: ' + dir );
        // create the directory
        fs.mkdirSync(dir);
        utl.logMsg('vpkMNL164 - Attempting to create directory: ' + dir );
    } catch (err) {
        utl.logMsg('vpkMNL155 - Unable to delete resource: ' + dir + ' error message: ' + err );
    }
}



//------------------------------------------------------------------------------
// check if processing should continue
//------------------------------------------------------------------------------
function checkLoop() {
    statMessages = [];

    if (!validDir) {
        startServer();
        return;
    }

    if (vpk.loop) {
        fileio.checkDir();
        checkAgain();
    } else {

        if (vpk.fCnt > 0) {
            saveStatMsg('dl', ' ');
            saveStatMsg('Dirs read', vpk.dCnt);
            saveStatMsg('Files read', vpk.fCnt);
            saveStatMsg('Valid yaml', vpk.yCnt);
            saveStatMsg('Skipped', vpk.xCnt);
            saveStatMsg('dl', ' ');
        }

        if (vpk.fCnt > 0) {
            if (typeof vpk.configFile.xrefNames !== 'undefined') {
                var keys = Object.keys(vpk.configFile.xrefNames);
                let key;
                for (let i = 0; i < keys.length; i++) {
                    key = 'xRef' + keys[i]
                    if (typeof vpk[key] !== 'undefined') {
                        saveStatMsg('Located xref items for: ' + keys[i], ' ');
                    } else {
                        saveStatMsg('Did not locate xref items for: ' + keys[i], ' ');   
                    }
                }
                saveStatMsg('dl', ' ');
            }
            saveStatMsg('Binding subjects not defined', vpk.subjectMissingCnt);
            saveStatMsg('dl', ' ');
            }
        // After reading and parsing of files start server
        if (resetReq) {
            resetReq = false;
        } else {
            startServer();
        }
        owner.chkUidChain();

        if (typeof vpk.childUids !== 'undefined') {
            saveStatMsg('OwnerRef Single-level', vpk.cLvl)
            saveStatMsg('OwnerRef Double-level', vpk.pLvl)
            saveStatMsg('OwnerRef Triple-level', vpk.gpLvl)
            saveStatMsg('OwnerRef Quad-level', vpk.ggpLvl)
            saveStatMsg('OwnerRef Penta-level', vpk.gggpLvl)
            saveStatMsg('dl', ' ');
        }

        if (typeof vpk.spaceReqSC !== 'undefined') {
            let keys = Object.keys(vpk.spaceReqSC);
            let size;
            for (let i = 0; i < keys.length; i++) {
                size = utl.formatBytes(vpk.spaceReqSC[keys[i]].space);
                saveStatMsg('StorageClass: ' + keys[i], size)
            }
            saveStatMsg('dl', ' ');
        }

    
        utl.processExplains();
        // delete the arrays no longer needed

    }
}



function saveStatMsg(msg, cnt) {
    if (msg === 'dl') {
        utl.logMsg(dashline );
    } else {
        if (cnt === 0) {
            return;
        }
        //           1234567890123456789012345678901234567890123456789012345678901234567890
        msg = msg + '                                                            ';
        msg = msg.substring(0,60)

        utl.logMsg(msg + cnt );
        statMessages.push(msg + '::' + cnt);
    }
}

//------------------------------------------------------------------------------
// check if still processing
//------------------------------------------------------------------------------
function checkAgain() {
    checkLoop();
}

function startServer() {
    try {
        splash();
        server.listen(port);
        docm.buildDocumentation();
        utl.readLicenseFile();
    } catch (err) {
        console.log(err.stack)
    }
}

function help() {
    var usage = commandLineUsage([{
            content: VPK_HEADER,
            raw: true,
        },
        {
            header: 'Options',
            optionList: optionDefinitions
        }
    ]);
    console.log(usage);
}

function splash() {
    var adv = commandLineUsage([{
        content: VPK_HEADER,
        raw: true,
    }]);
    console.log(adv);
}


//begin processing
checkLoop();