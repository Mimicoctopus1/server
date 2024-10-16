var gameMode = 'text'

/*
gameMode values.
text: Text adventure game.
2D: Flat, top-down view.
3D: 3D mode
audio: Text adventure, only text-to-speech reads out output and voice recognition reads input.
*/

/*Initializing imports.

// import unimono3d from "https://mimicoctopus1.github.io/3.js" /*My in-the-works 3D engine.*/
const socket = io();

/*Establish HTML elements.*/

var messages = document.querySelector('#messages')
var form = document.querySelector('#form')
var input = document.querySelectorAll('.commandInput')[0]
var arrowSymbol = document.querySelectorAll(".arrowSymbol")[0]
var rcmenu = document.querySelectorAll('.rcmenu')[0]
var ToS = document.querySelectorAll('.ToS')[0]
var ToSCheckbox = document.querySelectorAll('.ToSCheckbox')[0]
var continueFromToS = document.querySelectorAll('.continueFromToS')[0]
var clearBuzzesButton = document.querySelectorAll('.clearBuzzesButton')[0]
var pausePanels = document.querySelectorAll('.pausePanels')[0]
var mediaPanel = document.querySelectorAll('.mediaPanel')[0]
var mediaPreview = document.querySelectorAll('.mediaPreview')[0]
var mediaPreviewDownload = document.querySelectorAll('.mediaPreviewDownload')[0]
var mediaPreviewStart = document.querySelectorAll('.mediaPreviewStart')[0]
var mediaPreviewStop = document.querySelectorAll('.mediaPreviewStop')[0]
var renderer2 = document.querySelectorAll('.renderer2')[0]
var renderer3 = document.querySelectorAll('.renderer3')[0]
var threeDVideo = document.querySelectorAll('.threeDVideo')[0]
var leftThreeDVideo = document.querySelectorAll('.leftThreeDVideo')[0]
var rightThreeDVideo = document.querySelectorAll('.rightThreeDVideo')[0]

/*Miscellaneous Setup*/
if (localStorage.signedIntoGame == 'true') {/*If you are currently signed in*/
	socket.emit('message', 'signin ' + localStorage.username + ' ' + localStorage.password + " nomessage") /*Automatically sign in, only without the Successful sign in message.*/
	messages.innerHTML += '<li>Welcome! You are currently signed in as:<br>' + localStorage.username + '</li>'
} else {/*If you aren't already signed into the game...*/
	messages.innerHTML += "<li>Welcome to the this game! To sign in, type <code>signin</code>. For help, type <code>help</code>. You can type right after the <code>&gt</code> symbol</li>"
}

input.style.display = 'none' /*Hide the text-mode input So the user can't run commands yet.*/
ToS.style.display = 'block'  /*Prompt the client to accept the Terms of Service.*/

socket.on("currentToS", function(currentToS) { /*When the server sends data with the current Terms of Sevice...*/
  if(localStorage.acceptedToS == currentToS) { /*If the client has already accepted the current VERSION of the ToS...*/
    input.style.display = 'inline'  /*Re-show the input.*/
    ToS.style.display = "none"      /*Hide the Terms of Service.*/
    input.focus()                   /*Put the typing cursor in the text input.*/
  }
  continueFromToS.addEventListener('click', function(e) {/*When the continue button is pressed...*/
    if(ToSCheckbox.checked) {                            /*If the client checked off the "I agree" checkbox...*/
  		localStorage.acceptedToS = currentToS              /*Save the HTML string from the server in localStorage.*/
  		input.style.display = 'inline'                     /*Re-show the input.*/
  		ToS.style.display = 'none'                         /*Hide the Terms of Service.*/
      input.focus()                                      /*Put the typing cursor in the text input.*/
  	} else {
  	  /*If the checkbox isn't checked...*/
  		alert("You haven't clicked the checkbox yet.")
  	}
  })
})

socket.emit("getCurrentToS") /*Request the current ToS from the server, which will then send a message back to run the currentToS event above.*/

var updateGameMode = function() {
  arrowSymbol.style.display = "none"
  renderer2.style.display = "none"
  renderer3.style.display = "none"
  
  if(gameMode == "text") {
    arrowSymbol.style.display = "inline"
    input.style.display = "inline"
	document.body.style.font = "Micro-5"
  }
  if(gameMode == "2D") {
    renderer2.style.display = "block"
  }
  
  if(gameMode == "3D") {
    renderer3.style.display = "block"
  }
}

updateGameMode()

/*Define functions.*/

var print = (msgToPrint) => {
	let printItem = document.createElement('li')
	printItem.innerHTML = msgToPrint
	messages.appendChild(printItem)
}

/*Create these variables so that I can define them again and again and again without using the var keyword later on.*/
var recorder
var stream
var chunks

var startRecording = async function(e) { 
	stream = await navigator.mediaDevices.getDisplayMedia({ /*This built-in function gets permission from the browser */
		video: {mediaSource: 'screen'} /*The user must allow screen recording, not audio or camera or something.*/,
	})
	recorder = new MediaRecorder(stream)

	chunks = [] /*Make a variable to store chunks of video.*/
	recorder.ondataavailable = function(e) {
		chunks.push(e.data)
	}
	recorder.onstop = function(e) { /*Do the following when the recording is stopped by the stopRecording function below*/
		/*Make it so you can't stop it again until you start it again.*/
		mediaPreviewStop.disabled = true
		mediaPreviewStart.disabled = false
		mediaPreview.controls = true /*Show the controls, which couldn't be shown before or they would show for a blank video frame.*/
		
		let mediaBlob = new Blob(chunks, {type: chunks[0].type})/*Make the video into a blob with the same type as the chunks. A blob is just a file without a name or lastModified date object.*/
		mediaPreview.src = URL.createObjectURL(mediaBlob)/*Create a blob URL. A blob URL such as blob:example.com/hash is stored on the browser and can't be opened by anyone else. It dies when you close the document that created it, so you can use the link again.*/
		let mediaFile = new File([mediaBlob], "media.mkv")/*Make a file out of the blob because blobs are sort of ugly and hard to use.  */
		socket.emit('mediaUpload', mediaFile)            /*Tell the server to upload this to my file storing system.                    */
		URL.revokeObjectURL(mediaBlob)                    /*Delete the blob.                                                             */
	};

	recorder.start()

	/*Make it so you can't start it again until you stop it.*/
	mediaPreviewStart.disabled = true
	mediaPreviewStop.disabled = false
}

var stopRecording = function(e) {
	recorder.stop()                  /*Stop the recording, automatically calling recorder.onstop()*/
	stream.getVideoTracks()[0].stop()/*Stop the stream (I think). Go to https://shorturl.at/erzMN to find the real answer. Attempt to let me know if you do.*/
}

var lockPointerRenderer2 = function() {
  renderer2.requestPointerLock()
}

var lockPointerRenderer3 = function() {
  renderer3.requestPointerLock()
}

/*Socket event preperation*/

/*The Socket event currentToS is defined above for orderly reasons. Tip: use Ctrl + F to find text.*/

socket.on("printCommandHelp", () => {
	
})

socket.on('chat', (msg) => {
	print("Somebody said, \"" + msg + "\".")
})

socket.on('run', (callback) => {
	callback()
})

socket.on('log', (messageToLog) => {
	console.log(messageToLog)
})

socket.on('runSignUpProcedure', (usernameAndPassword) => {
	if (usernameAndPassword == undefined) {
		print(
			'To sign up, please enter <code>signup <span class = "argument">username</span> <span class = "argument">password</span></code>.',
		)
	}
})

socket.on('signUpProcedureUsernameTaken', () => {
	print('Uh oh! That username is taken. Please repeat with a different username.')
})

socket.on('usernameAndPasswordAddedToUserdata', (usernameAndPassword) => {
	print('Great! Your username and password have been added to the system.<br>Username: ' + usernameAndPassword[0] +
		  '<br>Password: ' + usernameAndPassword[1],
	)
	print('To sign into your new account, please type in signin ' + usernameAndPassword[0] + ' ' + usernameAndPassword[1])
})

socket.on('signInGranted', function(words) {
  if(words[2] != "nomessage") { /*If the signin wasn't automatically generated with auto sign-in (if so, the auto messager will use nomessage as the 3rd parameter, which index.js will return as the third item in a words array.)...*/
    print("Successful sign in to " + words[0] + "<br>Use the <span style = \"background: rgba(255, 255, 0, 1)\">signout</span> command to sign out.")
  }
	localStorage.username = words[0]
	localStorage.password = words[1]
  sessionStorage.username = words[0]
  sessionStorage.password = words[1]
	localStorage.signedIntoGame = 'true'
})

socket.on('signOut', function() {
	localStorage.username = undefined
	localStorage.password = undefined
  sessionStorage.username = undefined
  sessionStorage.password = undefined
	localStorage.signedIntoGame = 'false'
})

socket.on('incorrectPasswordOrUsername', function(words) {
	print('That password-username combination is incorrect! Please try again.')
  console.log(words)
})

socket.on('presentAppDownload', function() {
  print("Follow the instructions for your device. If you don't have any of these devices then I can't help you.")
  setTimeout(function(){
    print("Android/ChromeOS/Chromebook: Click the 1st link below. Allow everything and see if it starts downloading. If it doesn't, go to your settings and search up \"developer mode\". Make sure developer mode is on. Go to your files app and open up the file known as OJVJPJGame.apk. If it doesn't work I have no idea why, so make sure to delete the file because it's useless.")
    print("Here are links you may need:<br><ol><li><a href = \"https://filetransfer.io/data-package/HUcbuP3X/download\">https://filetransfer.io/data-package/HUcbuP3X/download</a></li></ol>")
  }, 2000)
})

socket.on("giveLoginLink", function(usAndPw) {
  print("When you go to any of the following links, you will automatically sign in.<br><ul><li>" + usAndPw[0] + ":" + usAndPw[1] + "@glitch.me" + "</li>" + "<li>" + "</li>" + "</ul>")
})

socket.on("changeMode", function(mode) {
  gameMode = mode
  if(mode == "text") {
    print("You already are in text mode!")
  }
  updateGameMode()
})

socket.on("threeDVideo", function(threeDVideoURLS) {
  leftThreeDVideo.src = threeDVideoURLS[0]
  rightThreeDVideo.src = threeDVideoURLS[1]
  leftThreeDVideo.play()
  rightThreeDVideo.play()
})

socket.on("unknownCommand", function() {
  print("Sorry, that command is not valid. Type <code class = 'argument'>help</code> for a list of commands.")
})

/*Event Listeners*/

/*Edit the right click menu*/
var handleContextMenu = function(event) {
	/*Stop the right click menu from working the way it usually does.*/
	event.preventDefault()
  
  /*Display the right-click menu.*/
	rcmenu.style.display = 'block'
	rcmenu.style.position = 'absolute'
	rcmenu.style.left = event.pageX - 50 + 'px'
	rcmenu.style.top = event.pageY - 20 + 'px'
}

var handleClick = function(event) {
	socket.emit('fullscreenCheck') /*Tell the server to check if it's a good idea to fullscreen or not.*/
  
  if(event.buttons === 1) {/*Left click. Most browsers use the which property, but IE and Opera use button.*/
    rcmenu.style.display = "none"
  } else if(event.buttons) {/*Middle mouse button (scroll wheel press).*/
    
  } else if((event.which && event.which === 3) || (event.button && event.button === 4)) {/*Right mouse button.*/
  
  }
}

var handleInputKeyup = function(event) {
	if (event.key === 'Enter' || event.keyCode === 13) {
		/*When enter is pressed...*/
		socket.emit(
			'message',
			input.firstChild.textContent,
		) /*Send a message to the server, index.js. The program seems to always put the message in a div, so I'm selecting the 
    textContent of the firstChild (the div).*/
		let printItem = document.createElement('li')
		printItem.innerHTML = input.firstChild.textContent + '<br>------------------------------------------------NEW------------------------------------------------' /*Print back the user input and add a new messages line.*/
    messages.appendChild(printItem)
		input.innerHTML = '' /*Clear the entry area.*/
	}
}

var keys = []
var keyCodeHandlers = /*While a key is pressed...*/{
  
}
var keyNotPressedHandlers = /*While a key is not pressed...*/{
  
}

var keyDownHandlers = /*When a key is pressed...*/{
  "KeyP": function() {
    if(pausePanels.style.display === "block") {
      pausePanels.style.display = "none"
    } else {
      pausePanels.style.display = "block"
    }
  }
}

var keyUpHandlers = /*When a key is released...*/{
  
}

var keyDown = function(event) {
  if(document.activeElement.className !== "commandInput") {
    keys[event.code] = true
    if(keyDownHandlers[event.code]) {
      keyDownHandlers[event.code]()
    }
    if(keyCodeHandlers[event.code]) {
      while(keys[event.code]) {/*While the key is still presssed...*/
        keyCodeHandlers[event.code]()
      }
    }
  }
}

var keyUp = function(event) {
  keys[event.code] = false
  if(keyUpHandlers[event.code]) {
    keyUpHandlers[event.code]()
  }
}

document.addEventListener('contextmenu', handleContextMenu)
input.addEventListener('keyup', handleInputKeyup)
document.addEventListener('click', handleClick)
mediaPreviewStart.addEventListener('click', startRecording)
mediaPreviewStop.addEventListener('click', stopRecording)
renderer2.addEventListener('click', lockPointerRenderer2)
renderer3.addEventListener('click', lockPointerRenderer3)
document.addEventListener('keydown', keyDown)
document.addEventListener('keyup', keyUp)