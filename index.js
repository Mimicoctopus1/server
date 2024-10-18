var express = require("express")
var fs = require("fs")
var http = require("node:http")
var Server = require("socket.io").Server
var nodemailer = require("nodemailer")
var exec = require("child_process").exec


/*Declare useful functions.*/

var runString = function(stringToRun, parametersArray) {
  let functionToRun = new Function(stringToRun); /*Make a function from the string.*/
  if(parametersArray != undefined) {
    functionToRun.apply(parametersArray); /*Run the function with the parameters given.*/
  }
};

/*Make functions to read and write JSON*/
var readJSON = function(jsonFileName) {
	try {
    let JSONFile = fs.readFileSync(jsonFileName)
		let returnData = JSON.parse(JSONFile);
    fs.close(JSONFile, function(error) {
      throw(error);
    });
		return returnData;
    
	} catch (error) {
		throw error; /*Send an error to the terminal*/
	}
};

var writeJSON = function(jsonFileName, dataToSave) {
	try {
		var JSONFile = fs.writeFileSync(jsonFileName, JSON.stringify(dataToSave));
    fs.close(JSONFile, function(error) {
      throw(error);
    });
		return true; /*Return that the data save was successful.*/
	} catch (error) {
		throw error;
	}
};

var emailer = nodemailer.createTransport({/*Setup the account recovery emailer in case you forget your password or something.*/
  service: 'gmail',
  auth: {
    user: process.env.emailUsername,
    pass: process.env.emailPassword
  }
});

var app = express()
var server = http.createServer(app);

app.use(express.static("public"))/*Allow the user to access the public folder.*/
app.get('/', (req, res) => {/*When the user requests the domain root...*/
  res.render("./public/index.html")/*Send the index.html file.*/
})

var portToHostOn = parseInt(process.env.PORT) || process.argv[3] || 8080/*If it is in the environment variables, or given as a param after npm run start, use that port. Otherwise, use 8080.*/
server.listen(portToHostOn, () => {
  console.log("Listening on http://localhost:" + portToHostOn)
})

var rootServer = new Server(server, {
  path: "/socket.io"
})/*This is the default namespace for root, so .of is unnecessary*/

rootServer.on("connection", (socket) => {/*When the user connects, save the user as "socket".*/
  socket.on("getCurrentToS", function() {
    /*When the client requests to know the current Terms of Service...*/
    socket.emit("currentToS", fs.readFileSync("./public/ToS/index.html").toString())/*Send it to the client.*/
  });

  socket.on('message', (msg) => {/*When the user types something in...*/
		/*When an entry is received from the user...*/ let messageWords = msg.split(' '); /*Split the string by whitespaces.*/
		let cmnd = messageWords[0]; /*cmnd is the first word of the message*/
    /*Do the same thing in lowercase.*/
    let lMessageWords = msg.toLowerCase().split(' ');
    let lCmnd = lMessageWords[0];
		if(['help'].includes(cmnd)) {
      socket.emit('printCommandHelp');
    } else if (['chat', 'c', 'say', 'talk'].includes(cmnd)) {
			/*The next few code blocks check if the cmnd is a certain word, then decides what to do after that.*/
			/*Take all the words except the first, join them together by spaces (the opposite of .split), and send to the clients.*/
			rootServer.emit('chat', messageWords.slice(1).join(' '));
		} else if (['whisperto', 'sayto', 'talkto', 'tell', 't'].includes(cmnd)) {
		} else if (['yell', 'y', 'scream', 'shout'].includes(cmnd)) {
		} else if (['settings'].includes(cmnd)) {
			if(['notifications'].includes(messageWords[1])) {
			}
		} else if(['signin'].includes(cmnd)) {
      let user = readJSON(".data/userdata.json")[messageWords[1]];
      
      let getAuthentication = function(authType) {
        
      }
      
      
      socket.emit('signInGranted', [messageWords[1], readJSON(".data/userdata.json")[messageWords[1]]["password"], messageWords[3]]);/*Send the username and PW. messageWords[3] is an optional parameter given. When the user is auto-signed in, it will put "nomessage" in it. This tells the server to, right now, tell the client not to print, "Successful sign in to <username>." since the user never typed sign in.*/
      
      
      if(readJSON(".data/userdata.json")[messageWords[1]]["password"] == messageWords[2]) {/*Open up the hidden userdata file and search through it for the username, AKA the 2nd word in the command given from the client input. Get its password. If it matches the password given by the user...*/
        socket.username = messageWords[1];
        socket.password = readJSON(".data/userdata.json")[messageWords[1]]["password"];
      } else {
        socket.emit('incorrectPasswordOrUsername', messageWords);
      }
    } else if(['signup'].includes(cmnd)) {
      if(messageWords[2] == undefined) {
        socket.emit('runSignUpProcedure'); 
      } else {
        if(readJSON('.data/userdata.json')[messageWords[1]['password']] == undefined) {
          let userdata = readJSON('.data/userdata.json');
          userdata[messageWords[1]['password']] = messageWords[2];/*Add the password to the corresponding username.*/
          writeJSON('.data/userdata.json', userdata);             /*Update userdata.json.*/
          
          /*Repeat for game.json.*/
          let game = readJSON('game.json');
          game[messageWords[1]]
          
          socket.emit('usernameAndPasswordAddedToUserdata', [messageWords[1], readJSON('.data/userdata.json')[messageWords[1]]['password']]);
        } else {
          socket.emit('signUpProcedureUsernameTaken');
        }
      }
    } else if(['get'].includes(cmnd)) {
      if(messageWords[1] == "login") {
        if(messageWords[2] == "link") {
          socket.emit("giveLoginLink", [socket.username, socket.password]);
        }
      }
    } else if(["download"].includes(cmnd)) {
      if(["app"].includes(messageWords[1])){
        socket.emit("presentAppDownload");
      }
		} else if(["signout"].includes(cmnd)) {
      socket.emit("signOut");
      delete(socket.username);
      delete(socket.password);
		} else if(socket.username != undefined && readJSON("game.json")[socket.username]["moves"][cmnd]) {/*If the command is in the user's move property (if the user knows the move) and the user is signed in...*/
      var moveEntryInGameJSON = readJSON("game.json")[socket.username]["moves"][cmnd];
      while(typeof(moveEntryInGameJSON) == "string") {/*While the move is a reference to run a different move instead (so probably never)...*/
        var moveEntryInGameJSON = readJSON("game.json")[socket.username]["moves"][moveEntryInGameJSON];
      }
      runString(moveEntryInGameJSON.effect, [readJSON("game.json")]);/*Run the code for the move, entering game.json in case the move needs the data. game.json is like the "event" parameter you take in an event listener.*/
    } else if(["move", "m"].includes(cmnd)) {
      
    } else if(["3dvideo"].includes(cmnd)) {
      if(messageWords[2]) {
        socket.emit("threeDVideo", [messageWords[1], messageWords[2]]);
      } else if(messageWords[1]) {
        socket.emit("threeDVideo", [messageWords[1] + "/left", messageWords/[2] + "/right"]);
      } else {
        socket.emit("threeDVideo", ["https://mimicoctopus1.github.io/threeDVideo/left", "https://mimicoctopus1.github.io/threeDVideo/right"]);
      }
    } else if(["changemode"].includes(cmnd)) {
      socket.emit("changeMode", messageWords[1]);
    }
    
    
    
    
    else { /*Catch for if the command given is not in the list above*/
      socket.emit("unknownCommand");
    }
	});
})

var buzzServer = new Server(server, {
  path: "/buzz/socket.io"
}).of("/buzz")/*A namespace (subserver?) for organization.*/

var buzzList = []/*An array to keep track of each and every buzz*/

buzzServer.on("connection", (socket) => {
  socket.emit("updateBuzzes", buzzList)/*Update the newbie's list*/
  
  socket.on("buzz", (username) => {
    buzzList[buzzList.length] = {
      username: username,
      timestamp: Date.now() /*A static method.*/
    }

    buzzAdminServer.emit("updateBuzzes", buzzList)/*Update all the admin lists.*/
    buzzServer.emit("updateBuzzes", buzzList)/*Update al the non-admin lists.*/
  })
})

var buzzAdminServer = new Server(server, {
  path: "/buzz/admin/socket.io"
}).of("/buzzAdmin")/*A namespace (subserver?) for organization.*/

buzzAdminServer.on("connection", (socket) => {
  buzzAdminServer.emit("updateBuzzes", buzzList)

  socket.on("clearBuzzes", () => {
    buzzList = []
    buzzAdminServer.emit("updateBuzzes", buzzList)/*Update all the admin lists.*/
    buzzServer.emit("updateBuzzes", buzzList)/*Update all the non-admin lists*/
  })
})