let workspaces = []
let activeSpaceId = 0

document.addEventListener('DOMContentLoaded', () => {

    // document.addEventListener('touchstart', event => {
    //     alert("Touch Started")
    // })
    // document.addEventListener('touchmove', event => {
    //     alert("Touch Moving")
    // })
    // document.addEventListener('touchend', event => {
    //     alert("Touch Ended")
    // })

    document.addEventListener('mousemove', event => {
        let x = event.pageX, y = event.pageY
        let cursor = document.querySelector("#outer")
        cursor.style.left = x-15
        cursor.style.top = y-15


    })

    let index = 0;
    Array.from(document.querySelectorAll(".workspaces")).forEach(workspace => {
        workspaces.push({id: workspaces.length, space: workspace, files: []})
    })

    document.querySelector("#add-workspace").addEventListener('click', (event) => {
        createWorkspace(workspaces)
    })

    document.querySelector(".input-commands").addEventListener("keydown", event => {
        if(event.key === "Enter") {
            event.target.setAttribute("readonly", "true")
            document.getElementById("commands").appendChild(createCommandSession())
        }
    })

    //--------------------------------------------------------------------------------------------------------------------------------

    let thetree = document.getElementById("the-tree")
    let html = document.querySelector("#innerhtml")

    getInnerHtml(html)
    thetree.appendChild(buildTree(getInnerHtml(html), 0))

    updateCode(html)

    html.addEventListener('input', e => {
        thetree.appendChild(buildTree(getInnerHtml(html, e.target.value), 0))
        updateCode(e.target)
        syncScroll(e.target);
    })

    document.querySelector(".clone").addEventListener('click', event => {
        activeSpaceId = update(event)
        
        document.querySelector("#hidden-form").style.display = "block"
    })

    document.querySelector(".run-code").addEventListener('click', event => {
        let term = document.querySelector("#terminal0")
        term.style.display = "block"
        term.scrollIntoView(true)
    })


    //Handling clone repository submision request
    document.querySelector("#repo-form").addEventListener('submit', event => {
        event.preventDefault()

        populateWorkSpace(event.target.username.value, event.target.reponame.value)

        //Hide form after fetching data from github
        document.querySelector("#hidden-form").style.display = "none"
        event.target.reset()
    })

    document.querySelector("#dark-mode").addEventListener('click', event => {
        toggleMode(0)
    })

    document.querySelector("#bright-mode").addEventListener('click', event => {
        toggleMode(1)
    })

    initTerminalDimensions(document.querySelector("#commands"))

    // document.body.addEventListener('drop', terminalDragDropHandler)
    // document.body.addEventListener('dropover', terminalDragOverHandler)


    //Adding drag event listener to the resize button
    let resizebtn = document.querySelector(".resizebtn")
    resizebtn.addEventListener('dragstart', resizeDragStart)
    resizebtn.addEventListener('drag', resizeDrag)
    resizebtn.addEventListener('dragend', resizeDragEnd)
    resizebtn.addEventListener('touchmove', resizeDrag)
})

document.querySelector("#cancel").addEventListener('click', event => {
    document.querySelector("#hidden-form").style.display = "none"
})


//Dragstart handler to resize the workspace window
function resizeDragStart(event) {
    let workspace = event.target.parentElement.parentElement

}

function resizeDragEnd(event) {
    // let workspace = event.target.parentElement.parentElement
    // let boundingrect = workspace.getBoundingClientRect()
    // let {top, left, right, bottom, width, height} = boundingrect
    // let X = event.clientX,Y = event.clientY
    
    // //Check resize limit before resizing
    // if(X-left > 300 || Y-top > 300) {
    //     //Specifically alter the width if lower limit of 300px is not exceeded
    //     if(X-left > 300) {
    //         workspace.style.width = (X-left)+"px"
    //     }
        
    //     //Specifically alter the height if lower limit of 300px is not exceeded
    //     if(Y-top > 300) {
    //         workspace.style.height = (Y-top)+"px"
    //     }
    // }
}

function resizeDrag(event) {
    event.preventDefault()
    let workspace = event.target.parentElement.parentElement
    let boundingrect = workspace.getBoundingClientRect()
    let {top, left, right, bottom, width, height} = boundingrect
    let X = event.clientX,Y = event.clientY
    
    //Check resize limit before resizing
    if(X-left > 400 || Y-top > 400) {
        //Specifically alter the width if lower limit of 300px is not exceeded
        if(X-left > 400) {
            workspace.style.width = (X-left)+"px"
        }
        
        //Specifically alter the height if lower limit of 300px is not exceeded
        if(Y-top > 400) {
            workspace.style.height = (Y-top)+"px"
        }

        maximizeWindow(event, boundingrect)
    }
}

function getInnerHtml(target, html='<div id="box">\n<h1>Box Model</h1>\n<p>The Box model determines how elements are positioned within the browser window. With the Box Model, a developer can control the dimensions, margins, padding, and borders of an HTML element.</p>\n</div>') {

    const tree = document.getElementById("the-tree")
    tree.textContent = ""

    target.value = html
    let div = document.createElement("div")
    div.innerHTML = target.value

    //Validating html
    if(div.innerHTML === html) {
        tree.style.color = "white"
        return div
    }
    tree.style.color = "red"
}

function initTerminalDimensions(terminal){
    terminal.style.height = (innerHeight * 0.8)+"px"

    terminal.closest("section").addEventListener("dragstart", terminalDragStartHandler)
}

//Maximize terminal call back
function maximizeTerminal(event) {
    let terminal = event.target.closest("section")//document.getElementById("terminal0")
    terminal.style.left = "0.5em"
    terminal.style.right = "0.5em"
    terminal.style.top = "0.5em"
    terminal.style.bottom = "0.5em"
}

//Minimize terminal call back
function minimizeTerminal(event) {
    let terminal = event.target.closest("section")//document.getElementById("terminal0")
    terminal.style.left = "10em"
    terminal.style.right = "10em"
    terminal.style.top = "8em"
    terminal.style.bottom = "8em"
}

//Maximize workspace call back
function maximizeWindow(event, newdimensions) {
    event.preventDefault()
    let terminal = event.target.closest("section") //Obtain the outer most section element
    
    //Check if the function is invoked with a second argument
    if(!Boolean(newdimensions)) {
        terminal.style.height = (innerHeight*0.97)+"px"
        terminal.style.width = ((innerWidth*0.97)+"px")
    }

    //Get the pre/code element
    let codeSection = document.querySelector(`#${terminal.id} :nth-child(1)`).nextElementSibling.lastElementChild
    
    //Height of the top bar
    let height_up = codeSection.parentElement.previousElementSibling.offsetHeight
    //Remaining height under topbar within the workspace
    let height_Down = terminal.offsetHeight - height_up
    
    //Resetting the height of the pre element
    codeSection.style.height = height_Down+"px"
    //Readjusting the section[.workspace] to expand to wrapp its content
    terminal.style.height = "max-content"
}

//Minimize workspace call back
function minimizeWindow(event) {
    let terminal = event.target.closest("section")
    terminal.style.height = "400px"
    terminal.style.width = "400px"

    //Get the pre/code element
    let codeSection = document.querySelector(`#${terminal.id} :nth-child(1)`).nextElementSibling.lastElementChild

    //Height of the top bar
    let height_up = codeSection.parentElement.previousElementSibling.offsetHeight
    //Remaining height under topbar within the workspace
    let height_Down = terminal.offsetHeight - height_up
    
    codeSection.style.height = height_Down+"px"
    terminal.style.height = "max-content"
}

const closeWindow = function(event) {
    event.target.closest("div").closest("div").closest("section").remove()
}

function terminalDragStartHandler(event) {
    event.preventDefault()
    console.log(event.target)

    // let dragImage = new Image()
    // dragImage.src = '../assets/icons/tabcontrols/sun-2-32.png'
    // event.dataTransfer.setDragImage(dragImage, 10,10)

    // event.target.style.borderColor = "white"
}

function terminalDragOverHandler(event) {
    event.preventDefault()
}

function terminalDragDropHandler(event) {
    event.preventDefault()
    
    event.target.style.borderColor = "rgba(255, 0, 0, 0.507)"
}

function dragTerminal(event) {

}

function hideTerminal(event) {
    let terminal = document.getElementById("terminal0")
    terminal.style.display = "none"
    
}

function randomColor() {
    return `rgba(3,0,0,.9)` //`rgba(${(Math.random()*100)%255},${(Math.random()*100)%255},${(Math.random()*100)%255}, .5`
}
function toggleMode(mode) {
    if(mode) {
        document.querySelector("html").style.backgroundColor = "white"
        document.querySelectorAll(".notes p").forEach(p => {
            p.style.color = "black"
        })

        document.querySelector("#add-workspace").style.color = "black"
    
        document.querySelectorAll(".workspaces").forEach(space => {
            space.style.backgroundColor = "rgb(245, 231, 231)"
            space.style.boxShadow = "0.4em 0.4em 0em #310613"
            space.style.border = "solid 1px #310613"
        })

        document.querySelectorAll("#nav-bar div h2").forEach(h2 => {
            h2.style.color = "#310613"
        })

        document.querySelector("hr").style.borderColor = "#310613"

        document.querySelectorAll(".open-files").forEach(open_file => {
            open_file.style.backgroundColor = "#310613"
            open_file.style.color = "white"
        })

        document.querySelectorAll(".clicked-tab").forEach(clicked => {
            clicked.style.backgroundColor = "transparent"
            clicked.style.color = "black"
        })
        document.querySelectorAll(".unclicked-tab").forEach(unclicked => {
            unclicked.style.backgroundColor = "#310613"
            unclicked.style.color = "black"
        })

        document.querySelectorAll(".heading").forEach(heading => {
            heading.style.color = "rgb(247, 206, 206)"
            heading.style.textShadow = " 0.05em 0.05em 0em black"
        })

        document.querySelectorAll("textarea").forEach(textarea => {
            textarea.style.color = "black"
            textarea.style.backgroundColor = "transparent"
        })
    } else {
        document.querySelector("html").style.backgroundColor = "#0c0a0b"

        document.querySelectorAll(".notes p").forEach(p => {
            p.style.color = "white"
        })

        document.querySelector("#add-workspace").style.color = "white"
    
        document.querySelectorAll(".workspaces").forEach(space => {
            space.style.backgroundColor = "transparent"
            space.style.boxShadow = "0.4em 0.4em 0em #695e62"
            space.style.border = "solid 1px #695e62"
        })

        document.querySelectorAll("#nav-bar div h2").forEach(h2 => {
            h2.style.color = "white"
        })

        document.querySelector("hr").style.borderColor = "#695e62"

        document.querySelectorAll(".open-files").forEach(open_file => {
            open_file.style.color = "white"
        })

        document.querySelectorAll(".clicked-tab").forEach(clicked => {
            clicked.style.backgroundColor = "transparent"
            clicked.style.color = "black"
        })
        document.querySelectorAll(".unclicked-tab").forEach(unclicked => {
            unclicked.style.backgroundColor = "transparent"
            unclicked.style.color = "black"
        })

        document.querySelectorAll(".heading").forEach(heading => {
            heading.style.color = "rgb(247, 206, 206)"
            heading.style.textShadow = " 0.05em 0.05em 0em black"
        })

        document.querySelectorAll("textarea").forEach(textarea => {
            textarea.style.color = "#f5aac6"
            textarea.style.backgroundColor = "transparent"
        })
    }
}

function createCommandSession() {
    let enterCommands = document.createElement("div")
    enterCommands.classList.add("enter-commands")
    let span = document.createElement("span")
    span.textContent = "$ >"
    let inputCommand = document.createElement("input")
    inputCommand.setAttribute("type", "text")
    inputCommand.setAttribute("class", "input-commands")

    inputCommand.addEventListener("keydown", event => {
        if(event.key === "Enter") {
            event.target.setAttribute("readonly", "true")
            document.getElementById("commands").appendChild(createCommandSession())
        }
    })

    enterCommands.append(span, inputCommand)

    return enterCommands
}

function populateWorkSpace(username, reponame) {
    
    let url  = `https://api.github.com/repos/${username}/${reponame}/contents`
    fetch(url, {
        "Accept": "application/vnd.github+json"
    })
    .then(response => response.json())
    .then(data => {
        if(data.message === "Not Found") {
            displayErrorMessage(data.message)
        }
        else{
            document.querySelector(`#workspace${activeSpaceId} .top-bar .title-bar .heading`).innerHTML = `${reponame} <b style="color: green;">[${username}]</b>`
            let filesDiv = document.querySelector(`#workspace${activeSpaceId} .files`)
        
            let index = 0
            for(let file of data) {
                if(file.name[0] !== '.' && file.type === "file"){
                    
                    let span = document.createElement("span")
                    span.classList.add("open-files")
                    span.textContent = file.name
                    span.addEventListener('click', toggleFile)
                    
                    filesDiv.appendChild(span)

                    fetchData(file.git_url, activeSpaceId, index, span)
                    index = index+1
                }
            }
        }
    })
    .catch(error => {
        displayErrorMessage(error)
    })

}

function displayErrorMessage(message) {
    let errorDiv = document.querySelector("#error-wrapper")
    let span = document.querySelector("#error-message span")
    span.textContent = message

    errorDiv.style.display = "block"

    setTimeout(() => {
        errorDiv.style.display = "none"
    }, 2000)
}

function fetchData(url, activeSpaceId, index, span) {
    return fetch(url)
    .then(response => response.json())
    .then(data => {
        let fileObject = {}
        fileObject[`workspace${activeSpaceId}_files_${index}`] = atob(data.content)
        workspaces[activeSpaceId].files[index] = fileObject
        span.id = `workspace${activeSpaceId}_files_${index}`

    })
}

function update(event) {
    return workspaces.find(space => {
        if(space.space === event.target.closest("section")){
            return true
        }
    }).id
}

function createWorkspace(workspaces){
    /*------------------Creating Workspace--------------*/
    let section = document.createElement("section")
    section.classList.add("workspaces")

    /*------------------Top Bar-------------------------*/
    let topBar = document.createElement("div")
    topBar.classList.add("top-bar")

    let titleBar = document.createElement("div")
    titleBar.classList.add("title-bar")

    let heading = document.createElement("span")
    heading.textContent = "Code Challenge"
    heading.classList.add("heading")

    //Clone Button
    let clone = document.createElement("button")
    clone.classList.add("clone")
    clone.textContent = "Clone Repo"
    clone.addEventListener('click', event => {
        activeSpaceId = update(event)
        
        document.querySelector("#hidden-form").style.display = "block"
    })

    //Commit button
    let commit = document.createElement("button")
    commit.classList.add("commit")
    commit.textContent = "Commit Changes"

    //Run code
    let run = document.createElement("button")
    run.classList.add("run-code")
    run.textContent = "Run"
    run.addEventListener('click', event => {
        document.querySelector("#terminal0").style.display = "block"
    })

    //Add code controls
    titleBar.append(heading, clone, commit, run)

    let files = document.createElement("div")
    files.classList.add("files")

    let manageworspace = document.createElement("div")
    manageworspace.classList.add("manage-workspace")

    //Control Buttons
    let minimize = document.createElement("button")
    let maximize = document.createElement("button")
    let close = document.createElement("button")

    close.addEventListener('click', closeWindow)
    maximize.addEventListener('click', maximizeWindow)
    minimize.addEventListener('click', minimizeWindow)

    //Add each button to a class
    let buttons = [minimize, maximize, close]
    buttons.forEach(button => {
        button.classList.add("controls")
    })


    //Control icons
    let minimizeIcon = document.createElement("img")
    let maximizeIcon = document.createElement("img")
    let closeIcon = document.createElement("img")

    //Setting the src attributes for the control icons
    minimizeIcon.src = "./assets/icons/tabcontrols/icons8-macos-minimize-30.png"
    maximizeIcon.src = "./assets/icons/tabcontrols/icons8-macos-maximize-30.png"
    closeIcon.src = "./assets/icons/tabcontrols/icons8-macos-close-30.png"
    

    //Appending each immage to buttons
    minimize.appendChild(minimizeIcon)
    maximize.appendChild(maximizeIcon)
    close.appendChild(closeIcon)

/*--------------------Create the code-wrapper-------------------------*/
    let code = document.createElement("div")
    code.classList.add("code")
    //Creating a pre element
    let pre = document.createElement("pre")
    pre.classList.add("highlighting")
    pre.setAttribute("aria-hidden","true")
    //Creating the code element
    let codeElement = document.createElement("code")
    codeElement.classList.add("language-javascript", "highlighting-content")
    //Append the code element to the pre element
    pre.appendChild(codeElement)
    //Create a TextArea
    let textarea = document.createElement("textarea")
    textarea.classList.add("space", "editing")
    textarea.setAttribute("spellcheck", "false")
    textarea.id = `textarea${workspaces.length}`
    //Adding event Listeners to the textarea
    textarea.addEventListener('keydown', event => {
        checkTab(event.target, event)
    })
    textarea.addEventListener('input', (event) => {
        updateCode(event.target)
        syncScroll(event.target)
    })
    textarea.addEventListener('scroll', (event) => {
        syncScroll(event.target)
    })
    //Wrapping the pre and the textarea in the div element
    code.append(pre, textarea)

    //Create the resize button
    let resizeBtn = document.createElement("div")
    resizeBtn.classList.add("resizebtn")
    //Adding the drag event listeners to the resize btn
    resizeBtn.addEventListener('dragstart', resizeDragStart)
    resizeBtn.addEventListener('drag', resizeDrag)
    resizeBtn.addEventListener('dragend', resizeDragEnd)
    //Create resize icon
    let resizeIcon = document.createElement('img')
    resizeIcon.setAttribute("src", "../assets/icons/tabcontrols/resize-6-64.png")
    resizeBtn.appendChild(resizeIcon)

    resizeBtn.addEventListener('drag', resizeWorkSpace)

    //Create a div to wrap the files bar and the code div
    let leftSidebar_codeArea = document.createElement("div")

    //Create resizer
    let resizer = document.createElement("div")
    resizer.classList.add("resizer")
    //Make resizer draggable
    resizer.setAttribute("draggable", "true")
    //Ading drag event listeners to the resizer
    resizer.addEventListener("dragstart", expandOrContractSideBarDragStart)
    resizer.addEventListener("drag", expandOrContractSideBarDrag)
    resizer.addEventListener("dragend", expandOrContractSideBarDragEnd)

    leftSidebar_codeArea.append(files,resizer, code)
    leftSidebar_codeArea.classList.add("left-sidebar_code-area")

    manageworspace.append(close, maximize, minimize)
    topBar.append(titleBar, manageworspace)
    section.append(topBar, leftSidebar_codeArea, resizeBtn)

    document.querySelector("#main").appendChild(section)
    section.id = `workspace${workspaces.length}`
    workspaces.push({id: workspaces.length, space: section, files : []})
}

function expandOrContractSideBarDragStart(event) {
}
function expandOrContractSideBarDrag(event) {
    event.preventDefault()
    
    event.target.previousElementSibling.style.width = (event.clientX  - event.target.previousElementSibling.getBoundingClientRect().left)+"px"
    
}
function expandOrContractSideBarDragEnd(event) {
    event.preventDefault()
}


// Toggling between files -----------------------------------------------------------
function toggleFile(event) {
    //console.log(activeSpaceId, event.target.id)
    Array.from(event.target.closest("div").children).forEach(span => {
        if(span === event.target) {
            span.classList.add("clicked-tab")
            span.classList.remove("unclicked-tab")
        } else{
            span.classList.add("unclicked-tab")
            span.classList.remove("clicked-tab")
        }
    })

    let text = (Object.values(workspaces[activeSpaceId].files.find(file => Object.keys(file)[0] === event.target.id)))
    let textarea = document.querySelector(`#textarea${event.target.id[9]}`)
    textarea.innerHTML = text

    //Toggle Language
    if(event.target.textContent.endsWith(".html")) {
        textarea.previousElementSibling.firstElementChild.classList.remove("language-javascript", "language-css", "language-markdown")
        textarea.previousElementSibling.firstElementChild.classList.add("language-html")
    }
    else if(event.target.textContent.endsWith(".js")) {
        textarea.previousElementSibling.firstElementChild.classList.remove("language-html", "language-css", "language-markdown")
        textarea.previousElementSibling.firstElementChild.classList.add("language-javascript")
    } else if(event.target.textContent.endsWith(".css")) {
        textarea.previousElementSibling.firstElementChild.classList.remove("language-javascript", "language-html", "language-markdown")
        textarea.previousElementSibling.firstElementChild.classList.add("language-css")
    } else if(event.target.textContent.endsWith(".md")) {
        textarea.previousElementSibling.firstElementChild.classList.remove("language-javascript", "language-css", "language-html")
        textarea.previousElementSibling.firstElementChild.classList.add("language-markdown")
    }
    
    //Updating the pre/code tags behind the text area
    updateCode(textarea.previousElementSibling.firstElementChild, text[0])
}


//Building the DOM Tree nodes
function buildTree(element, level, tree) {
    if(!Boolean(element)){
        return document.createTextNode("Invalid HTML")
    }
    
    let parent = createDiv(element, level)

    for(let child of element.children) {
        level+=1
        if(child.children.length>0) {
            parent.appendChild(buildTree(child, level))
        } else {
            //console.log("-".repeat(level)+child.tagName, level,"[", child.className, level.id, "]")
            parent.appendChild(createDiv(child, level))
        }
        level-=1
    }
    level-=1

    return parent
}

//Workspace resizing handler 
function resizeWorkSpace(event) {

}

//Create Node Description
function createDiv(element, level) {
    let div = document.createElement("div")
    div.classList.add(`level${level}`)
    //div.style.backgroundColor = randomColor()
    div.innerHTML = `${element.tagName} <b>Classes</b>=[${element.classList}] ${element.id ? "id = "+element.id : ""}`

    return div
}

function updateCode(element, newText) {
    let code, text
    if(newText) {
        code = element
        text = newText
    } else {
        code = element.previousElementSibling.firstElementChild
        text = element.value
    }

    //Handling the final newlines
    if(text[text.length-1] === '\n') { //Checking if the last character is a newline character
        text+=" "
    }

    //Update code
    //text.replace(new RegExp("&", "g"), "&").replace(new RegExp("<", "g"), "<")
    text = text.split("").map(char => {
        if(char === '<') {
            return "&lt;"
        }
        else if(char === '&') {
            return "&amp;"
        }
        else if(char === '>') {
            return "&gt;"
        } else {
            return char
        }
    }).join("")

    code.innerHTML = text
    //------------------------------------------------------------------------------------------------------------------

    //syntax Highlighting
    Prism.highlightElement(code);
}

function syncScroll(editing) {
    /* Scroll result to scroll coords of event - sync with textarea */
    let highlighting = editing.previousElementSibling
    // Get and set x and y
    highlighting.scrollTop = editing.scrollTop;
    highlighting.scrollLeft = editing.scrollLeft;
}

function checkTab(element, event) {
    let code = element.value

    if(event.key === "Tab") {
        //Tab key has been pressed
        event.preventDefault() //Preventing the normal behaviour

        let beforeTab = code.slice(0, element.selectionStart) //This the text before the tab
        let afterTab = code.slice(element.selectionEnd, element.value.length) //This is the text after the tab

        let cursorPosition = element.selectionEnd +1 //Where the cursor moves after tab - moving gorwar by 1 character to after tab
        element.value = beforeTab + "\t" + afterTab //Adding the tab character

        //Moving the cursor
        element.selectionStart = cursorPosition
        element.selectionEnd = cursorPosition

        updateCode(element.previousElementSibling.firstElementChild, element.value)  //Updating the text to inclide the indent
    }
}