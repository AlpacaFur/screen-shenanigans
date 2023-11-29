import './style.css'

const SVG_NAMESPACE = "http://www.w3.org/2000/svg"

const ICON_VIEWBOX = "-20 -20 340 340"

const ICON = [
  "m132.53,10.09l-33.27,57.62h101.48l-33.27-57.62c-7.76-13.45-27.17-13.45-34.94,0Z",
  "m289.91,167.47l-57.62,33.27v-101.48l57.62,33.27c13.45,7.76,13.45,27.17,0,34.94Z",
  "m132.53,289.91l-33.27-57.62h101.48l-33.27,57.62c-7.76,13.45-27.17,13.45-34.94,0Z",
  "m10.09,132.53l57.62-33.27v101.48l-57.62-33.27c-13.45-7.76-13.45-27.17,0-34.94Z",
]

const contactFunctions: Record<string, () => boolean > = {
  // @ts-expect-error availTop is defined in most browsers
  "top": () => (screen.availTop ?? 0) === window.screenTop,
  // @ts-expect-error availLeft is defined in most browsers
  "right": () => window.screenLeft - (screen.availLeft ?? 0) + window.outerWidth === screen.availWidth,
  // @ts-expect-error availTop is defined in most browsers
  "bottom": () => window.screenTop - (screen.availTop ?? 0) + window.outerHeight === screen.availHeight,
  // @ts-expect-error availLeft is defined in most browsers
  "left": () => (screen.availLeft ?? 0) === window.screenLeft,
}

document.getElementById("hint-button")?.addEventListener("click", ()=>{
  document.getElementById("hint-modal")?.classList.toggle("show")
})

let hints = [
  {type: "hint", text: "I don't deal in ciphers. No language is required."},
  {type: "hint", text: "I can feel the edges of my home."},
  {type: "hint", text: "Sometimes I prefer to touch a wall, other times I don't."},
  {type: "hint", text: "Who am I? I'm this page."},
  {type: "hint", text: "I'm a shapeshifter at heart. I change size and shape all the time."},
  {type: "big hint", text: "Try moving me to touch the edges of the screen or move me away."},
  {type: "answer", text: "This page knows when it's touching the edge of the screen. Each of the four-pointed glyphs represents a combination of the page touching edges of the screen. The glyphs are completed in order."},
]

let hintIndex = 0

const nextHint = document.getElementById("next-hint")

nextHint?.addEventListener("click", () => {
  if (hintIndex < hints.length) {
    const hint = hints[hintIndex]
    const hintElem = document.createElement("p")
    hintElem.textContent = `${toTitleCase(hint.type)}: ${hint.text}`
    nextHint.parentElement?.insertBefore(hintElem, nextHint)
    hintIndex += 1

    if (hintIndex < hints.length) {
      nextHint.textContent = `Get ${toTitleCase(hints[hintIndex].type)}`
    } else {
      nextHint.remove()
    }
  }
})

function toTitleCase(str: string) {
  return str.split(" ").map(s => s.slice(0,1).toUpperCase() + s.slice(1)).join(" ")
}

const challenges: number[] = [...genChallenges(8)]
const initialData = getScreenData()
let pageOpened = Date.now()
let windowMoved = -1
let firstCompleted = -1
// let challengeFinished = -1


interface ScreenData  {
  screenTop: number,
  screenLeft: number,
  outerWidth: number,
  outerHeight: number
}

function getScreenData() {
  return {
    screenTop: window.screenTop,
    screenLeft: window.screenLeft,
    outerWidth: window.outerWidth,
    outerHeight: window.outerHeight
  }
}

type Entries<T> = [keyof T, T[keyof T]][]

function screenDataDiffers(a: ScreenData, b: ScreenData): boolean {
  const entries = Object.entries(a) as Entries<ScreenData>
  return !entries.every(([key, val]) => b[key] === val)
}



let challengeIndex = 0



challenges
  .map(genChallengeIcon)
  .forEach(elem => document.getElementById("challenge-icons")!.append(elem))

function getCurrentChallengeNum(): number {
  let challengeNum = 0
  Object.entries(contactFunctions).forEach(([_, valFunc], index) => {
    const isContacted = valFunc()
    if (isContacted) challengeNum += 1 << index
  })
  return challengeNum
}

function pageAnimationLoop() {
  displaySize()
  requestAnimationFrame(pageAnimationLoop)
}

function displaySize() {
  const icon = document.getElementById("primary-icon")
  let challengeNum = 0

  if (windowMoved === -1 && screenDataDiffers(initialData, getScreenData())) {
    windowMoved = Date.now()
  }

  Object.entries(contactFunctions).forEach(([id, valFunc], index) => {
    const isContacted = valFunc()
    if (isContacted) challengeNum += 1 << index
    // const elem = document.getElementById(`contact-${id}`)
    // elem!.textContent = `contact-${id}: ${isContacted}`
    if (isContacted) {
      icon!.classList.add(id)
    } else {
      icon!.classList.remove(id)
    }
  })

  if (challengeIndex < challenges.length) {
    const currentChallenge = challenges[challengeIndex]
    if (challengeNum === currentChallenge) {
      if (firstCompleted === -1) {
        firstCompleted = Date.now()
      }
      document.getElementById("challenge-icons")!.children[challengeIndex].classList.add("active")
      challengeIndex += 1
      if (challengeIndex === challenges.length) {
        winGame() 
      }
    }
  }
}

function formatTimeDifference(timestampA: number, timestampB: number) {
  const diff = timestampA - timestampB
  const seconds = Math.floor(diff / 1000)
  // const secondsPlural = seconds !== 1 ? "s" : ""
  const minutes = Math.floor(seconds / 60)
  // const minutesPlural = minutes !== 1 ? "s" : ""

  if (minutes >= 1) {
    return `${minutes}m${seconds % 60}s`
  } else {
    return `${seconds}s`
  }

}

function winGame() {
  const messageElem = document.getElementById("message")
  messageElem!.textContent = "Challenge Complete."
  messageElem?.classList.add("show")
  Array.from(document.getElementById("challenge-icons")!.children)
    .forEach((child, index) => {
      setTimeout(()=> child.classList.add("party"), index * 100)
    })
  const now = Date.now()
  const pageOpenTime = formatTimeDifference(now, pageOpened)
  const pageMoveTime = windowMoved === - 1 ? "never >:(" : formatTimeDifference(windowMoved, pageOpened)
  const firstMatchTime = formatTimeDifference(firstCompleted, pageOpened)
  const times = document.getElementById("times")!
  times.textContent = `Total Time: ${pageOpenTime}\nWindow First Moved: after ${pageMoveTime}\nFirst Match: after ${firstMatchTime}`
  times.classList.add("show")
  
}

pageAnimationLoop()

function genSVG(viewBox: string, paths: string[]): SVGElement {
  const container = document.createElementNS(SVG_NAMESPACE, "svg")
  container.setAttribute("viewBox", viewBox)
  // container.setAttributeNS(null, "xmlns", SVG_NAMESPACE)
  container.classList.add("contact-icon")
  // container.setAttributeNS(SVG_NAMESPACE, "xmlns", SVG_NAMESPACE)

  paths.forEach(pathData => {
    const path = document.createElementNS(SVG_NAMESPACE, "path")
    path.setAttribute("d", pathData)
    container.appendChild(path)
  })

  return container
}

function genChallenges(challengeCount: number): number[] {
  return Array(challengeCount)
    .fill(null)
    .map((_, index) => {
      const candidate = Math.floor(16 * Math.random())
      if (index === 0 && getCurrentChallengeNum() === candidate) {
        return (candidate + 1) % 15
      } else {
        return candidate
      }
      
    })
}

function genChallengeIcon(num: number): SVGElement {
  const svg = genSVG(ICON_VIEWBOX, ICON)
  if ((num & 1) > 0) svg.classList.add("top")
  if ((num & 2) > 0) svg.classList.add("right")
  if ((num & 4) > 0) svg.classList.add("bottom")
  if ((num & 8) > 0) svg.classList.add("left")
  return svg
}

