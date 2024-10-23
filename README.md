# Server
This is a server for a browser game that can be 2D or 3D, as well as text-based.

<a href="https://idx.google.com/import?url=https%3A%2F%2Fgithub.com%2FMimicoctopus1%2Fserver">
  <img
    height="32"
    alt="Open in IDX"
    src="https://cdn.idx.dev/btn/open_light_32@2x.png">
</a>

# Server Installation
You will need Node.js to run this program. If you don't have Node.js installed, get it [here](https://nodejs.org/en/download/package-manager). When you have it, follow the instructions for your OS below.

## Any OS
Go get a release from [the GitHub release page](https://github.com/Mimicoctopus1/server/releases). Get the .zip file, unzip it, and run
```
npm install
npm run start
```

## Linux
Go get a release from [the GitHub release page](https://github.com/Mimicoctopus1/server/releases). Get the .zip file, unzip it, and run
```
sudo npm install
sudo npm run start
```

## Windows
Go get a release from [the GitHub release page](https://github.com/Mimicoctopus1/server/releases). Get the .zip file, unzip it, and run
```
npm install
npm run start
```

## MacOS
Go get a release from [the GitHub release page](https://github.com/Mimicoctopus1/server/releases). Get the .zip file, unzip it, and run
```
npm install
npm run start
```

## Android
Install Termux from the Play Store. Then, scroll up to the Linux instructions and run that.

# Client Installation
In case you didn't read the description, this is a browser game, so use a browser. Check out the [compatability table](compatability.md) if you really must know.

# Developing
## IDE
You can use whatever you want, but please know that this was mostly tested in (Google's Project IDX)[https://idx.google.com]. You can make your own copy now.<br>
<a href="https://idx.google.com/import?url=https%3A%2F%2Fgithub.com%2FMimicoctopus1%2Fserver">
  <img
    height="32"
    alt="Open in IDX"
    src="https://cdn.idx.dev/btn/open_light_32@2x.png">
</a>

## Pull Requests
Feel free to make a pull request on GitHub. It will take an undeterminably long amount of time to be accepted, as it will have to be tested as well as checked for compatability with the style guide.

## Style Guide
* Don't use semicolons.
* Use tab for indentation. Tab is the length of two spaces.

# Changelog
23/10/2024: Added full buzzer support, additionally for admins. Admins can set timers and clear the buzzlist.

18/10/2024: Added support for buzzers! Just go to localhost:8080/buzz.
Partial support added for admins, at localhost:8080/buzz/admin. Admins will be identical to the regular buzzers, so don't even bother.

16/10/2024: Removed practically every single semicolon in JavaScript because it is easier to code now 