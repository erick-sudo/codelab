function randomColor() {
    return `rgba(${(Math.random()*100)%255},${(Math.random()*100)%255},${(Math.random()*100)%255}, 1`
}

function toRadians(theta){
    return theta*(Math.PI/180)
}

function rotateElements(parent, theta) {
    let radius = parent.offsetWidth/2
    // let w = Math.abs((y + (radius * Math.sin(toRadians(0)))) - (y + (radius * Math.sin(toRadians(360/center)))))*0.8
    Array.from(parent.children).map(element => {

        // element.firstElementChild.style.backgroundColor = randomColor()
        element.firstElementChild.style.transform = `rotate(${theta+45*2}deg)`
        element.firstElementChild.lastElementChild.classList.add("lowerspan")

        element.style.left = (radius + (radius * Math.cos(toRadians(theta))))+"px"
        element.style.top = (radius + (radius * Math.sin(toRadians(theta))))+"px"
        element.style.transform = `translateX(-50%) translateY(-50%)`
        theta+=360/parent.children.length
    })
}

let theta = 0
let interval =  setInterval(() => {
    document.querySelectorAll(".blocks").forEach(block => {
        rotateElements(document.querySelector(".wrapper"), theta+=0.05)
    })
}, 10)

document.querySelector("#power").addEventListener('click', event => {
    clearInterval(interval)

    const mainpage = document.querySelector("#mainpage")
    mainpage.style.display = "block"
    mainpage.style.opacity = 1

    const waitload = document.querySelector("#wait")
    waitload.style.opacity = 0
    setTimeout(() => {
        waitload.style.display = "none"
    },3000)
})