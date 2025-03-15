#!/bin/sh
cd /home/user
cp server server.tmp -rf
cd server.tmp
rm .git -rf
find . -type f -size +100M -exec echo "This file was too large to import to GitHub. See it at codeberg.org/Mimicoctopus1/server." > {} +
git init
git branch -m main
git add .
git commit -m "Sending files to GitHub from Codeberg."
echo "Enter your GitHub Personal Access Token"
read pat
echo "https://Mimicoctopus1:${pat}@github.com/Mimicoctopus1/server"
git push "https://Mimicoctopus1:${pat}@github.com/Mimicoctopus1/server" --force -u main
cd ..
rm server.tmp -rf