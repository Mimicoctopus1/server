var socket = io(document.location.origin + "/buzz/admin", {/*The domain location of our client.*/
  path: "/buzz/admin/socket.io"/*Specify that we are not at root*/
})

var buzzer = document.querySelectorAll(".buzzer")[0]
var timer = document.querySelectorAll(".timer")[0]
var instructions = document.querySelectorAll(".instructions")[0]
var serverStatus = document.querySelectorAll(".serverStatus")[0]
var buzzes = document.querySelectorAll(".buzzes")[0]/*The tbody element of the buzz table*/
var username = prompt("Enter a username to be identified by.")
instructions.style.lineHeight = window.innerHeight * 0.10 + "px"

socket.on("updateBuzzes", (buzzList) => {
  buzzes.innerHTML = "";
  buzzList.forEach((buzz) => {
    buzzes.innerHTML += "<tr><td>" + buzz.username + "</td><td>" + buzz.timestamp + "</td></tr>"
  })
})

socket.on("timer", (time) => {
  let seconds = time
  let minutes = Math.floor(seconds / 60)
  let hours = Math.floor(minutes / 60)

  /*Convert to the remainder of division by 60. Example: 65 to 5*/
  seconds %= 60
  minutes %= 60

  /*Convert to string. Example: 5 to "5"*/
  seconds += ""
  minutes += ""
  /*Add zeros to the start to make the number at least two digits long. Example 5 to 05*/
  seconds = seconds.padStart(2, "0")
  minutes = minutes.padStart(2, "0")
  timer.innerHTML = hours + ":" + minutes + ":" + seconds;
})

socket.on("connect", () => {
  serverStatus.style.display = "none";
})

buzzer.onclick = (event) => {
  socket.emit("buzz", username)
}

var timers = {
  "KeyY": 0,
  "KeyU": 1,
  "KeyI": 5,
  "KeyO": 30,
  "KeyP": 45,
  "KeyJ": 60,
  "KeyK": 120,
  "KeyL": 180,
  "Semicolon": -10
}
document.onkeydown = (event) => {
  if(event.code == "Space") {
    socket.emit("buzz", username)
  }

  if(event.code in timers) {
    socket.emit("timer", timers[event.code])
  }
  
  if(event.code == "KeyH") {
    socket.emit("clearBuzzes")
  }
}