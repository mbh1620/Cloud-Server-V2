`
    import os
    startingDirectory = os.path.abspath('${testFolder}/${user.name}' + '${userStartingUrl}')

    for (root, dirs, files) in os.walk(startingDirectory, topdown=True):

        ${userElementCustomisation}

`