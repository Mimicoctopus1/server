#!/bin/sh
echo "Installing Dependencies..."

echo "Checking for Node.js..."

if which node > /dev/null
then
  echo "Node.js seems to be installed already..."
else
  echo "Installing Node.js"
  curl -fsSL https://fnm.vercel.app/install | bash
  source ~/.bashrc
  fnm use --install-if-missing 22
fi

echo "Checking for unzip..."

if which unzip > /dev/null
then
  echo "unzip seems to be installed already..."
else
  echo "Searching for package manager to install unzip..."

  if which apt-get
  then
    echo "Using apt-get..."
    apt-get install unzip
  elif which dnf
  then
    echo "Using dnf..."
    dnf install unzip
  elif which yum
  then
    echo "Using yum..."
    yum install unzip
  elif which pacman
  then
    echo "Using pacman..."
    pacman -S unzip
  elif which zypper
  then
    echo "Using zypper..."
    zypper install unzip
  else 
    echo "Could not find APT, DNF, Yum, pacman, or zypper. Please install your own unzip utility manually."
    exit 1
  fi
fi

versionFound=""
while [ versionFound == "" ]
do
  echo "Which version do you want to use? Press ENTER to use latest version:"
  read version
  wget --spider -q "https://site.k.vu/installers/installables/server@$version.zip"
  if [ $? -eq 0 ]
  then
    versionFound="https://site.k.vu/installers/installables/server@$version.zip"
  elif [ version == "" ]
  then
    versionFound="https://site.k.vu/installers/installables/server.zip"
  fi
  echo "That version could not be found."
done

echo "Making server directory..."
mkdir server

echo "Entering server directory..."
cd server

echo "Downloading server.zip..."
if wget -qO "server.zip" "https://site.k.vu/installers/installables/server.zip" --timeout=1 --tries=1
then
  echo "Unzipping server.zip..."
  unzip server.zip
  echo "Removing server.zip..."
  rm server.
  echo "Searching for Node package manager..."
  if which npm
  then
    echo "Installing dependencies with NPM..."
    npm install > /dev/null
    echo "Now starting server with NPM. Press Ctrl+C to stop server."
    npm run start
  elif which pnpm
  then
    echo "Install dependencies with PNPM..."
    pnpm install > /dev/null
    echo "Now starting server with PNPM. Press Ctrl+C to stop server."
    pnpm run start
  elif which yarn
  then
    echo "Installing dependencies with Yarn..."
    yarn install > /dev/null
    echo "Now starting server with Yarn. Press Ctrl+C to stop server."
    yarn run start
  else
    echo "Could not find NPM, PNPM, or Yarn. Please install your own package manager manually, then install all dependencies."
    exit 1
  fi
else
  echo "Could not find the server to download from. Perhaps it is offline. Try again later."
  exit 1
fi