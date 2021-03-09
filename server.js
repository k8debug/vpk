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
const softwareVersion = '5.0.0';

//------------------------------------------------------------------------------
// Require statements
//------------------------------------------------------------------------------
const utl = require('./lib/utl');
const vpkReset = require('./lib/vpkReset');
const docm = require('./lib/documentation');
const appRoutes = require('./lib/appRoutes')
const splash = require('./lib/splash')

// third-party requires and configuration
const bodyParser = require('body-parser');
const commandLineArgs = require('command-line-args');
const http = require('http');
let express = require('express');
let socketio = require('socket.io');
const partials = require('express-partials');
const compression = require('compression');
const cors = require('cors');

// server and socketio configuration
let app = express();
let server = http.createServer(app);
let io = socketio(server);
const clientIO = require('./lib/clientIO');

//------------------------------------------------------------------------------
// Application start parms
//------------------------------------------------------------------------------
let port = 4200;
let optionDefinitions = [{
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
// Process start parameters if provided
//------------------------------------------------------------------------------
let options = commandLineArgs(optionDefinitions);

// -help used
if (typeof options.help !== 'undefined') {
    splash.help();
    process.exit(0);
}

// -p used
if (typeof options.port !== 'undefined' && options.port !== null) {
    port = options.port;
    if (port < 1 || port > 65535) {
        utl.logMsg('vpkMNL099 - Invalid port number defined.  Valid range is 1 - 65535' );
        process.exit(-1);
    }
}

//------------------------------------------------------------------------------
// splash screen
//------------------------------------------------------------------------------
splash.pop(softwareVersion, port);
 

//------------------------------------------------------------------------------
// read vpk configuration file
//------------------------------------------------------------------------------
let gcstatus = utl.readConfig('vpkconfig.json');
if (gcstatus === 'OK') {
    // get userconfig.json data
    vf = 'userconfig.json';
    utl.readConfig(vf);
} else {
    utl.logMsg('vpkMNL095 - Terminating application unable to find configuration file: ' + vf);
    process.exit(-1);
}


//------------------------------------------------------------------------------
// Define configuration for app
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
// Define app routes / urls
//------------------------------------------------------------------------------
appRoutes.init(app);


//------------------------------------------------------------------------------
// Define Client SocketIO 
//------------------------------------------------------------------------------
clientIO.init(io, softwareVersion);


//------------------------------------------------------------------------------
// Reset all vars in global vpk
//------------------------------------------------------------------------------
vpkReset.resetAll();


//------------------------------------------------------------------------------
// start server
//------------------------------------------------------------------------------
function startServer() {
    try {
        server.listen(port);              // start server
        utl.readLicenseFile();            // read license text into global vpk
        utl.makedir('cluster');           // create the cluster directory if it does not exist
        utl.makedir('usage');             // create the usage directory if it does not exist
        docm.buildDocumentation();        // read, parse, and load documentation markdown file into global vpk
    } catch (err) {
        console.log(err.stack)
    }
}


//------------------------------------------------------------------------------
// Begin processing
//------------------------------------------------------------------------------
startServer();
