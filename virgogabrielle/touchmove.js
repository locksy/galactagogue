document.addEventListener("touchstart", e => {
    ;[...e.changedTouches].forEach(touch => {
        const cursor =document.createElement("div")
        cursor.classList.add("cursor")
        cursor.style.top = '${touch.pageY}px'
        cursor.style.top = '${touch.pageY}px'
        cursor.id = touch.identifier
        document.body.append(curosr)
    })
})

document.addEventListener("touchmove", e => {
    ;[...e.changedTouches].forEach(touch => {
        const cursor = document.getElementById(touch.identifier)
        cursor.style.top = '${touch.pageY}px'
        cursor.style.top = '${touch.pageY}px'
    })
})

document.addEventListener("touchend", e => {
    ;[...e.changedTouches].forEach(touch => {
        const cursor = document.getElementById(touch.identifier)
        cursor.remove()
    })
})

document.addEventListener("touchcancel", e => {
    ;[...e.changedTouches].forEach(touch => {
        const cursor = document.getElementById(touch.identifier)
        cursor.remove()
    })
})

