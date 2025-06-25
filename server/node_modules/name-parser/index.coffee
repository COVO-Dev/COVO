  
module.exports =

  parse: (name) ->
    
    indexOfSpace = name.indexOf ' '

    firstName = ""
    lastName = ""

    if indexOfSpace is -1
      firstName = name
    else
      firstName = name.slice 0, indexOfSpace
      lastName = name.slice indexOfSpace + 1

    return {firstName, lastName}

  components: (name = '') ->
    name.split ' '

