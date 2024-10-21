var socket = io(document.location.origin + "/buzz", {/*The domain location of our client.*/
  path: "/buzz/socket.io"/*Specify that we are not at root*/
})

var buzzer = document.querySelectorAll(".buzzer")[0]
var instructions = document.querySelectorAll(".instructions")[0]
var serverStatus = document.querySelectorAll(".serverStatus")[0]
var buzzes = document.querySelectorAll(".buzzes")[0]
var username = prompt("Enter a username to be identified by.") + "*"
instructions.style.lineHeight = window.innerHeight * 0.10 + "px"

socket.on("updateBuzzes", (buzzList) => {
  buzzes.innerHTML = "";
  buzzList.forEach((buzz) => {
    buzzes.innerHTML += "<tr><td>" + buzz.username + "</td><td>" + buzz.timestamp + "</td></tr>"
  })
})

socket.on("connect", () => {
  serverStatus.style.display = "none";
})

document.onkeydown = (event) => {
  socket.emit("buzz", username)
}

buzzer.onclick = () => {
  socket.emit("buzz", username)
}