var fs = require("fs")
var flags = []
var input = ""
var output = []
var format = []

var inputArgs = process.argv.slice(2)
while(inputArgs.length) {
  let inputArg = inputArgs.shift()

  if(inputArg.startsWith("--")) {
    if(inputArg == "--verbose") {
      flags.push("v")
    }
    if(["--amd64nasm", "--x86-64nasm", "--x86_64nasm", "--x86nasm", "--x64nasm"].includes(inputArg)) {
      format.push("amd64asm")
      output.push(inputArgs.shift())
    }
    if(["--c"].includes(inputArg)) {
      format.push("c")
      output.push(inputArgs.shift())
    }
  } else if(inputArg.startsWith("-")) {
    inputArg.split("").forEach((flag) => {
      flags.push(flag)
    })
  } else {
    input = inputArg
  }
}


if(flags.includes("v")) {
  verbose = console.log
} else {
  verbose = () => {}
}

if(!input) {
  console.log("Please specify an input file.")
  process.exit(1)
}

verbose("Extracting data from file: " + input + ".")
fs.readFile(input, "utf8", (error, data) => {
  if(error) {
    if(error.code == "ENOENT") {
      console.log("Error: ENOENT: Does that file exist?")
    } else {
      console.log("Error finding " + process.argv[2] + ":\n" + error)
    }
    process.exit(1)
  }

  verbose("Simplifing all brackets.")
  var data = data.replaceAll("[", "(")
                 .replaceAll("]", ")")
                 .replaceAll("{", "(")
                 .replaceAll("}", ")")

  verbose("Adding whitespace around brackets.")
  data = data.replaceAll("(", " ( ")
             .replaceAll(")", " ) ")

  verbose("Simplifing all whitespace.")
  data = data.replaceAll("\n", " ")
             .replaceAll("\t", " ")

  verbose("Removing unecessary whitespace.")
  verbose("|Removing double whitespaces.")
  while(data.includes("  ")) {/*A loop is necessary because 4 spaces can become 2, and another repeat is needed to get 1.*/
    data = data.replaceAll("  ", " ")
  }/*There is no need for two spaces in a row.*/
  verbose("|Trimming whitespace on ends.")
  data = data.trim()

  var bracketize = (code) => {
    let tokens = code.split(" ")
    let output = []
    let opener = undefined
    let closer = undefined
    let depth = 0

    let tokensChecked = 0
    while(tokensChecked < tokens.length) {
      let token = tokens[tokensChecked]
      if(token == "(") {
        if(opener == undefined) {
          opener = tokensChecked
        }
        depth += 1
      }
      if(token == ")") {
        depth -= 1
        if(depth == 0) {
          closer = tokensChecked
          
          let beforeBrackets = tokens.slice(0         , opener)
          let inBrackets     = tokens.slice(opener + 1, closer)
          let afterBrackets  = tokens.slice(closer + 1        )
          
          if(beforeBrackets.length > 0) {
            output = output.concat(bracketize(beforeBrackets.join(" ")))
          }
          
          if(inBrackets.length > 0) {
            output = output.concat([bracketize(inBrackets.join(" "))])
          }
          
          if(afterBrackets.length > 0) {
            output = output.concat(bracketize(afterBrackets.join(" ")))
          }

          return(output)
        }
      }
      tokensChecked += 1
    }/*End check for brackets while loop.*/
    return(code.split(" "))
  }

  let argumentUsers = ["exit", "+", "-", "*", "/", ":", "terminal"]

  var whitespace = (string) => {
    return([" ", "\n", "\r", "\t"].includes(string))
  }

  var translate = (language, code) => {
    code = bracketize(code)

    let imports = {
      "amd64asm": "",
      "c": ""
    }[language]
    let opening = {
      "amd64asm": "section .text\nglobal _start\n_start:\n",
      "c": "int main() {\n"
    }[language]
    let main = {
      "amd64asm": "",
      "c": ""
    }[language]
    let closing = {
      "amd64asm": "",
      "c": "}"
    }[language]

    let tokensTranslated = 0
    while(tokensTranslated < code.length) {
      let token = code[tokensTranslated]
      let argument = code[tokensTranslated + 1]
      let dictionary = {
        "amd64asm": {
          "exit": () => {
            return("mov eax, 1\nmov ebx, " + argument + "\nint 0x80")
          }
        },
        "c": {
          "+": () => {
            return(argument.join(" + "))
          },
          "-": () => {
            return(argument.join(" - "))
          },
          "*": () => {
            return(argument.join(" * "))
          },
          "/": () => {
            return(argument.join(" / "))
          },
          ":": () => {
            let argumentsSet = 0;
            while(argumentsSet < argument.length - 1) {
              main += argument[argumentSet] + " = " + argument[argumentSet + 1] + "\n"
            }
          },
          "terminal": () => {
            if(argument == ".") {
              if(!imports.includes("#include <stdio.h>")) {
                imports += "#include <stdio.h>\n"
              }
              let output = "printf(\"" + code[tokensTranslated + 2].join(" ") + "\");"
              
              tokensTranslated += 1
              
              return(output)
            } else {
              
            }
          },
          "exit": () => {
            return("return " + argument + ";")
          }
        }
      }[language]

      if(dictionary[token]) {
        main += "\t" + dictionary[token]() + "\n"
      }

      if(argumentUsers.includes(token)) {
        tokensTranslated += 2
      } else {
        tokensTranslated += 1
      }
    }

    return(imports + opening + main + closing)
  }

  while(format.length > 0) {
    verbose("Translating to " + format[0] + ".")
    fs.writeFile(output[0], translate(format[0], data), (error) => {
      if(error) {
        console.log("Error writing to file: " + output[0])
      }
    })

    format.shift()
    output.shift()
  }
})/*End fs.readFile*/