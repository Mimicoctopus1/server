# Server
This is a server for a web game that can be played in many different forms.

[Server Installation](#server-installation)  
[Language](#language)  
[Changelog](#changelog)  

<a href="https://idx.google.com/import?url=https%3A%2F%2Fgithub.com%2FMimicoctopus1%2Fserver">
  <img
    height="32"
    alt="Open in IDX"
    src="https://cdn.idx.dev/btn/open_light_32@2x.png">
</a>

# Server Installation
To install, you need an installation script or a server.zip. Both can be found at the [website](https://site.k.vu/install). If you have server.zip, simply install [Node.js](https://nodejs.org/en/download/package-manager), extract the zip file into a folder, and run 
```bash
sudo npm install
```
inside the folder. To actually start the server, run
```bash
npm start
```
(Also inside the folder). If you have an installation script, you can just double-click it and everything should suddenly be installed in a folder called server. To run the server for reals, you need to open up a terminal, navigate to that folder, and run:
```bash
npm start
```
Don't be afraid to use the terminal. It gives you motivation and an odd feeling that you know what you're doing.

# Client Installation
In case you didn't read the description, this is a browser game, so use a browser. Check out the [compatability table](compatability.md) if you really must know.

# Developing
## Language
This is an in-the-works programming language that is optimized for intuitivity and similarity to math. It is also supposed to be similar to assembly language.

### AST

start<br>
|code<br>

code<br>
|functionCall<br>
|code code<br>

functionCall
|ID<br>
|ID expression

expression<br>
|value<br>
|functionCall

list<br>
|(element ...)<br>

element<br>
|expression<br>
|:(name expression)<br>

value<br>
|number<br>
|string<br>
|list<br>

### Unique Properties
The most prominent feature of this language is probably the highly noticable lack of syntax. Everything is a function, essentially. However, you do not need parenthesis to contain the arguments unless there are multiple.
Unlike in many languages, all the brackets do the same thing. Also, the brackets do not need to match although it's more readable if they do. For example, ``. { string ( Hello, World! ] )`` is valid. 
There is also only one data type which is **binary data**. However, you can use the converting utilities like so:
```js
. string ( Hello World! )
```

## Repositories
[Codeberg](https://codeberg.org/Mimicoctopus1/server)
[GitHub](https://github.co,/Mimicoctopus1/server)

## Assets
Make your assets any way you'd like. However, there are some un-enforced standards that you may appreciate:

### Moves
For move icons, the image is basically whatever you'd like. However, the background color helps determine the use of the move. Red is offence, blue is defence, and green is healing. I used the three colors that human eyes can detect, but its more important that they have easy hex numbers.

* (Offence) Red is the color of blood: #FF0000.
* (Defence) Blue is the color of the sky. The sky protects us from ultraviolet rays: #00FF00.
* (Healing) Grass is green and helps cows regain energy: #0000FF.

If the move does a combination of the above, just add different amounts of color until something looks right.

# Changelog
28/1/2025
Plan to change program so that it does no pre-processing such as surrounding brackets with whitespace and converting all tabs and newlines to spaces.

24/1/2025
Finished program that should be able to add, subtract, multiply, divide, print, and exit.

9/1/2025
Finished bracketizer to take Common code and convert, for example:  
``
!(+(1 2 3))
``
to an array
``
[!, +, [1, 2, 3]]
``

13/12/2024
Previously added a maintenance feature. Use
```
node index.js --maintenance
# or
node index.js -m
```
to do maintenance. Maintenance includes creating a zip file in public/installers/installables with all the code. Version number is extracted from package.json.

8/12/2024
Introducing plans for a new programming language. The compiler will run in Node.js, but the successors to the original compiler will be written in common itself, resulting in a bootstrapped compiler that comiples newer versions of itself.

23/10/2024
Added full buzzer support, additionally for admins. Admins can set timers and clear the buzzlist.

18/10/2024
Added support for buzzers! Just go to localhost:8080/buzz.
Partial support added for admins, at localhost:8080/buzz/admin. Admins will be identical to the regular buzzers, so don't even bother.

16/10/2024
Removed practically every single semicolon in JavaScript because it is easier to code now.