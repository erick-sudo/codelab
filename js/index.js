let workspaces = []
let activeSpaceId = 0

document.addEventListener('DOMContentLoaded', () => {
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

    document.querySelector(".close").addEventListener('click', event => {
        event.target.closest("div").closest("div").closest("section").remove()
    })

    document.querySelector(".clone").addEventListener('click', event => {
        activeSpaceId = update(event)
        
        document.querySelector("#hidden-form").style.display = "block"
    })

    document.querySelector(".run-code").addEventListener('click', event => {
        document.querySelector("#terminal0").style.display = "block"
    })

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

    
    
})

document.querySelector("#cancel").addEventListener('click', event => {
    document.querySelector("#hidden-form").style.display = "none"
})

function initTerminalDimensions(){
    document.querySelector("#commands").style.height = (innerHeight * 0.8)+"px"
    document.querySelector("#commands").style.width = (innerWidth * 0.5)+"px"
    document.querySelector("#commands").style.left = (innerHeight * 0.8)+"px"
}

function dragTerminal(event) {

}

function hideTerminal(event) {
    let terminal = document.getElementById("terminal0")
    terminal.style.display = "none"
    
}

function randomColor() {
    return `rgba(${(Math.random()*100)%255},${(Math.random()*100)%255},${(Math.random()*100)%255}, .5`
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
            console.log(data.message)
        }
        else{
            document.querySelector(`#workspace${activeSpaceId} .top-bar .title-bar .heading`).textContent = reponame
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
        console.log(error.message)
    })

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

    close.addEventListener('click', event => {
        event.target.closest("div").closest("div").closest("section").remove()
    })

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

    //Create a TextArea
    let textarea = document.createElement("textarea")
    textarea.cols = "60"
    textarea.rows = "20"
    textarea.classList.add("space")
    textarea.autocomplete = "on"
    textarea.id = `textarea${workspaces.length}`

    manageworspace.append(close, maximize, minimize)
    topBar.append(titleBar, manageworspace)
    section.append(topBar, files, textarea)

    document.querySelector("#main").appendChild(section)
    section.id = `workspace${workspaces.length}`
    workspaces.push({id: workspaces.length, space: section, files : []})
}

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

    document.querySelector(`#textarea${event.target.id[9]}`).innerHTML = (Object.values(workspaces[activeSpaceId].files.find(file => Object.keys(file)[0] === event.target.id)))
}