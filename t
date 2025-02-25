#!/bin/sh
clear
node code.js test.code -v --amd64nasm test.asm
nasm test.asm
echo "---------------"
cat test.asm
rm test.asm
echo
echo "---------------"
./a.out
# code=$?
# rm a.out
# echo "---------------"
# exit code