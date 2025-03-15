var verbose = (message) => {/*Log ONLY if --verbose or -v is in Node execution..*/
  if(process.argv.includes("--verbose") || process.argv.includes("-v")) {
    console.log(message + "...")
  }
}

verbose("Loading dependencies...")
verbose("|express")
var express = require("express")
verbose("|fs")
var fs = require("fs")
verbose("|node:http")
var http = require("node:http")
verbose("|socket.io")
var Server = require("socket.io").Server
verbose("|nodemailer")
var nodemailer = require("nodemailer")
verbose("|crypto")
var crypto = require("crypto")
verbose("|bestzip")
var zip = require("bestzip")

verbose("Setting up nodemailer")
var emailer = nodemailer.createTransport({/*Setup the account recovery emailer in case you forget your password or something.*/
  service: 'gmail',
  auth: {
    user: process.env.emailUsername,
    pass: process.env.emailPassword
  }
})

verbose("Initializing express.js")
var app = express()
verbose("Creating server with node:http and express")
var server = http.createServer(app)

verbose("Making public folder public.")
app.use(express.static("public"))/*Allow the user to access the public folder.*/
app.get('/', (request, response) => {/*When the user requests the domain root...*/
  response.render("./public/index.html")/*Send the index.html file.*/
})

verbose("Start listening")
try {
  if(process.argv.includes("--port")) {
    var port = process.argv.indexOf("--port") + 1
    port = process.argv[port]
    port = parseInt(port)
  } else {
    var port = process.env.PORT || 80
  }

  server.listen(port, () => {
    console.log("Live at localhost:" + port + "...")
  })
} catch(error) {
  console.log("Error CODE: " + error.code)
  console.log("Error: " + error)
}

/*Functions to be called from JSON files.*/

let security = {
  "password": (password) => {
    if(!messageWords[2]) {
      return("After your username you need to put your password.")
    }
    if(messageWords[2] != password) {
      return("Incorrect Password.")
    }
    return(messageWords[2] == password)
  }
}

var moves = {

}

/*Start up servers.*/

verbose("Starting server: /")
var rootServer = new Server(server, {
  path: "/socket.io"
})/*This is the default namespace for root, so .of is unnecessary*/

rootServer.on("connection", (socket) => {/*When the user connects, save the user as "socket".*/
  verbose("User #" + socket.id + "connected")

  socket.on("getCurrentTerms", () => {
    /*When the client requests to know the current Terms of Service...*/
    socket.emit("currentTerms", fs.readFileSync("./public/terms/index.html").toString())/*Send it to the client.*/
  });

  socket.on('message', (msg) => {/*When the user types something in...*/
		messageWords = msg.split(' ') /*Split the string by spaces.*/
		let cmnd = messageWords[0] /*cmnd is the first word of the message*/
    /*Do the same thing in lowercase.*/
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
		} else if(["token"].includes(cmnd)) {
      fs.readFile(process.env.load || "game.json", "utf8", (error, data) => {
        if(error) {
          console.log("There was an error reading game.json: \n" + error)
        } else {
          let game = JSON.parse(data)
          if(game["users"][messageWords[1]] && game["users"][messageWords[1]]["token"] && game["users"][messageWords[1]]["token"] == messageWords[2]) {
            socket.emit("signInGranted", false, messageWords[1], game["users"][messageWords[1]]["token"])
          }
        }
      })
    } else if(["signin"].includes(cmnd)) {
      fs.readFile(process.env.load || "game.json", "utf8", (error, data) => {
        if(error) {
          console.log("User attempted to signin, error reading game.json: " + error)
        } else {
          let game = JSON.parse(data)
          if(!messageWords[1]) {
            socket.emit("puzzleFailed", "After `signin` you need to put your username.")
          } else if(!game["users"][messageWords[1]]) {
            socket.emit("puzzleFailed", "That username could not be found.")
          } else {
            let puzzles = game["users"][messageWords[1]]["security"]
            let puzzleNum = parseFloat(messageWords[3]) || 0
            if(puzzleNum >= puzzles.length || puzzleNum < 0) {
              puzzleNum = 0
            }
            let puzzle = security[puzzles[puzzleNum]["type"]]
            let puzzleArguments = puzzles[puzzleNum]["arguments"]
            let puzzleOutput = puzzle.apply(undefined, puzzleArguments)

            if(typeof(puzzleOutput) == "string") {
              socket.emit("puzzleFailed", puzzleOutput, puzzleNum)
            } else {
              crypto.randomBytes(16, function(error, buffer) {
                if(error) {
                  console.log("Error generating token: " + error)
                } else {
                  let token = buffer.toString("hex")/*Convert to hexadecimal.*/
                  game["users"][messageWords[1]]["token"] = token
                  fs.writeFile(process.env.load || "game.json", JSON.stringify(game), (error) => {
                    if(error) {
                      console.log("There was an error writing to game.json: \n" + error)
                    }
                  })
                  socket.emit("signInGranted", true, messageWords[1], token)
                }
              })
            }
          }
        }
      })
    } else if(['signup'].includes(cmnd)) { 
      fs.readFile(process.env.load || "game.json", "utf8", (error, data) => {
        if(error) {
          console.log("There was an error finding game.json: \n" + error)
        } else {
          let game = JSON.parse(data)
          if(!messageWords[1]) {
            socket.emit("signupFail", "Please enter a username after the word `signup`")
          } else if(game["users"][messageWords[1]]) {
            socket.emit("signupFail", "That username is already taken. Please choose a different one.")
          } else if(["undefined", "null", "test", "admin"].includes(messageWords[1])) {
            socket.emit("signupFail", "Sorry, that username is reserved.")
          } else if(!messageWords[2]) {
            socket.emit("signupFail", "Please enter a password after your username.")
          } else {
            game["users"][messageWords[1]] = {
              "security": [
                {
                  "type": "password",
                  "arguments": [messageWords[2]]
                }
              ]
            }
            fs.writeFile(process.env.load || "game.json", JSON.stringify(game), (error) => {
              if(error) {
                console.log("There was an error writing to game.json: \n" + error)
              }
            })
            socket.emit("signupGranted")
          }
        }
      })
    } else if(["deleteaccount"].includes(cmnd)) {
      fs.readFile(process.env.load || "game.json", "utf8", (error, data) => {
        if(error) {
          console.log("User attempted to delete account, error reading game.json: " + error)
        } else {
          let game = JSON.parse(data)
          if(!messageWords[1]) {
            socket.emit("accountDeletionFailed", "After `deleteaccount` you need to put your username.")
          } else if(!game["users"][messageWords[1]]) {
            socket.emit("accountDeletionFailed", "That username could not be found.")
          } else {
            let puzzles = game["users"][messageWords[1]]["security"]
            let puzzleNum = parseFloat(messageWords[3]) || 0
            if(puzzleNum >= puzzles.length || puzzleNum < 0) {
              puzzleNum = 0
            }
            let puzzle = security[puzzles[puzzleNum]["type"]]
            let puzzleArguments = puzzles[puzzleNum]["arguments"]
            let puzzleOutput = puzzle.apply(undefined, puzzleArguments)

            if(typeof(puzzleOutput) == "string") {
              socket.emit("accountDeletionFailed", puzzleOutput, puzzleNum)
            } else {
              delete(game["users"][messageWords[1]])
              fs.writeFile(process.env.load || "game.json", JSON.stringify(game), (error) => {
                if(error) {
                  console.log("There was an error writing to game.json: \n" + error)
                  socket.emit("accountDeletionFailed", "The server is not working properly right now.")
                } else {
                  socket.emit("accountDeleted", messageWords[1])
                }
              })
            }
          }
        }
      })
    } else if(["account"].includes(cmnd)) {
      if(messageWords[1] == "links") {
        socket.emit("showSigninLinks")
      } else {
        socket.emit("displayAccountInfo")
      }
    } else if(["download"].includes(cmnd)) {
      if(["app"].includes(messageWords[1])){
        socket.emit("presentAppDownload")
      }
		} else if(["signout"].includes(cmnd)) {
      if(!messageWords[1]) {
        socket.emit("signout", true)
      } else {
        fs.readFile(process.env.load || "game.json", "utf8", (error, data) => {
          if(error) {
            console.log("There was an error reading game.json: \n" + error)
          } else {
            let game = JSON.parse(data)
            if(!game["users"][messageWords[1]]) {
              socket.emit("signoutFail", "The user you are signed into doesn't exist.")
            } else if(!game["users"][messageWords[1]]["token"]) {
              socket.emit("signoutFail", "The user you are signed into is not registered as \"signed in\" in our server. Sign in and try again.")
            } else if(!messageWords[2]) {
              socket.emit("signoutFail", "You seem like you aren't signed in.")
            } else if(messageWords[2] != game["users"][messageWords[1]]["token"]) {
              socket.emit("signoutFail", "Your device couldn't prove it was signed in. Please sign in again.")
            } else {
              game["users"][messageWords[1]]["token"] = undefined
              fs.writeFile(process.env.load || "game.json", JSON.stringify(game), (error) => {
                if(error) {
                  console.log("There was an error writing to game.json: \n" + error)
                  socket.emit("signoutFail", "The server couldn't find a file. Please try again later.")
                } else {
                  socket.emit("signout")
                }
              })
            }
          }
        })
      }      
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
      socket.emit("changeMode", messageWords[1])
    } else if(["usemove"].includes(cmnd)) {
      if(!messageWords[1] || !messsageWords[2] || messageWords[1] == "undefined" || messageWords[2] == "undefined") {
        socket.emit("moveFail", messageWords[3], "You device is missing some account data. Please signin and retry.")
      } else {
        fs.readFile(process.env.load || "game.json", "utf8", (error, data) => {
          if(error) {
            socket.emit("moveFail", messageWords[3], "The server had trouble finding a file. Try again.")
            console.log("There was an error reading game.json:\n" + error)
          } else {
            let game = JSON.parse(data)
            if(!game["users"][messageWords[1]]) {
              socket.emit("moveFail", messageWords[3], "That user doesn't exist.")
            } else if(!game["users"][messageWords[1]]["token"] || game["users"][messageWords[1]]["token"] != messageWords[2]) {
              socket.emit("moveFail", messageWords[3], "Your device could not prove it was signed into that account.")
            } else if(!game["users"][messageWords[1]]["moves"][messageWords[3]]) {
              socket.emit("moveFail", messageWords[3], "You can't do that.")
            } else {
              let move = moves[game["users"][messageWords[1]]["moves"][messageWords[3]]]["move"]
              let moveArguments = messageWords.slice(4)
              move(moveArguments, {
                "user": socket,
                "public": rootServer
              })
            }
          }
        })
      }
    } else { /*Catch for if the command given is not in the list above*/
      fs.readFile(process.env.load || "game.json", "utf8", (error, data) => {
        if(error) {
          console.log("There was an error reading game.json")
          socket.emit("unknownCommand")
        } else {
          let game = JSON.parse(data)
          if(!messageWords[2]) {
            socket.emit("useMove", messageWords[1])
          } else if(!game["users"][messageWords[2]]) {
            /*That user doesn't exist.*/
          } else if(!game["users"][messageWords[2]["moves"][messageWords[1]]]) {
            /*That move doesn't exist.*/
          } else {
            let move = moves[game["users"][messageWords[2]]["moves"][messageWords[1]]["type"]]
            let moveArguments = game["users"][messageWords[2]]["moves"][messageWords[1]]["arguments"]
            
            move.apply(undefined, moveArguments)
          }
        }
      })
    }
	})
})

verbose("Starting server: /buzz")
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

var timer = 0
var timerTicker

verbose("Starting server: /buzz/admin")
var buzzAdminServer = new Server(server, {
  path: "/buzz/admin/socket.io"
}).of("/buzz/admin")/*A namespace (subserver?) for organization.*/

buzzAdminServer.on("connection", (socket) => {
  socket.emit("updateBuzzes", buzzList)
  
  socket.on("buzz", (username) => {
    buzzList[buzzList.length] = {
      username: username,
      timestamp: Date.now() /*A static method.*/
    }

    buzzAdminServer.emit("updateBuzzes", buzzList)/*Update all the admin lists.*/
    buzzServer.emit("updateBuzzes", buzzList)/*Update al the non-admin lists.*/
  })

  socket.on("timer", (time) => {
    timer += time
    if(time == 0) {/*No need to add zero.*/
      timer = 0/*Set to zero instead.*/
    }

    if(timerTicker == undefined) {/*If there isn't already a timer...*/
      timerTicker = setInterval(() => {
        if(timer > 0) {/*If there is time left...*/
          timer -= 1/*Eat up some time.*/
        } else {/*When all the time has been consumed...*/
          clearTimeout(timerTicker)/*Self destruct.*/
          timerTicker = undefined
        }

        buzzAdminServer.emit("timer", timer)/*Only update the admins.*/
      }, 1000)
    }
  })

  socket.on("reset", () => {
    buzzList = []
    timer = 0
    if(timerTicker != undefined) {
      clearTimeout(timerTicker)
      timerTicker = undefined/*Clear the timeout ID from the variable*/
    }
    buzzAdminServer.emit("updateBuzzes", buzzList)/*Update all the admin lists.*/
    buzzServer.emit("updateBuzzes", buzzList)/*Update all the non-admin lists*/
  })

  socket.on("clearBuzzes", () => {
    buzzList = []
    buzzAdminServer.emit("updateBuzzes", buzzList)/*Update all the admin lists.*/
    buzzServer.emit("updateBuzzes", buzzList)/*Update all the non-admin lists*/
  })
})

/*Unnecessary Maintenance*/

if(process.argv.find((argument) => {
  return(argument[0] == "-" && argument.includes("m"))
})) {
  verbose("Doing maintenance")
  fs.readFile("package.json", "utf8", (error, data) => {
    if(error) {
      console.log("There was an error reading package.json:\n" + error)
    }

    let version = JSON.parse(data).version
    
    verbose("Zipping up code")

    zip({
      "source": ".",
      "destination": "public/installers/installables/server.zip"
    }).then(() => {
      verbose("Copying server installable to specific version installable")
      fs.copyFile("public/installers/installables/server.zip", "public/installers/installables/server@" + version + ".zip", (error) => {
        if(error) {
          console.log("There was an error making a version-detailed copy of the server installer:\n" + error)
        }
      })
    })
  })
}/*End Maintenance Code.*/

