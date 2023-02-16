
embedTtsPlayer()


/* observe ChatGPT replies and send to player */

const mainObservable = rxjs.fromMutationObserver(document.getElementById("__next"), {childList: true})
  .pipe(
    rxjs.concatMap(records => rxjs.from(records)),
    rxjs.concatMap(record => rxjs.from(record.addedNodes)),
    rxjs.filter(node => node.nodeType == 1),
    rxjs.startWith(document),
    rxjs.concatMap(el => rxjs.from(el.getElementsByTagName("main")).pipe(rxjs.take(1))),
    rxjs.distinctUntilChanged(),
    rxjs.debounceTime(3*1000),
    rxjs.tap(main => console.debug("Main changed", main))
  )

const paraObservable = mainObservable
  .pipe(
    rxjs.switchMap(main => rxjs.fromMutationObserver(main, {subtree: true, childList: true})),
    rxjs.concatMap(records => rxjs.from(records)),
    rxjs.concatMap(record => rxjs.from(record.addedNodes)),
    rxjs.filter(node => node.nodeType == 1),
    rxjs.concatMap(el => el.tagName == "P" ? rxjs.of(el) : rxjs.from(el.getElementsByTagName("p"))),
    rxjs.tap(para => console.debug("Para changed", para))
  )

const sentenceObservable = paraObservable
  .pipe(
    rxjs.switchMap(para =>
      rxjs.fromMutationObserver(para, {subtree: true, characterData: true})
        .pipe(
          rxjs.map(() => para),
          rxjs.startWith(para)
        )
    ),
    rxjs.scan(({currentPara, currentSentenceIndex}, para) => {
      if (currentPara) {
        const sentences = getCompleteSentences(currentPara.textContent)
        return {
          currentPara: para,
          currentSentenceIndex: para == currentPara ? sentences.length : 0,
          newSentences: sentences.slice(currentSentenceIndex)
        }
      }
      else {
        return {
          currentPara: para,
          currentSentenceIndex: 0,
          newSentences: []
        }
      }
    }, {}),
    rxjs.concatMap(({newSentences}) => rxjs.from(newSentences))
  )

sentenceObservable.subscribe(sentence => {
  console.debug(sentence)
  sendToPlayer({method: "playNext", args: [sentence]})
    .catch(console.error)
})




/* helpers */

function getCompleteSentences(text) {
  const sentences = recombine(text.split(/((?:[.!?:]"?)+[\s\u200b]+)/), /\b(\w|[A-Z][a-z]|Assn|Ave|Capt|Col|Comdr|Corp|Cpl|Gen|Gov|Hon|Inc|Lieut|Ltd|Rev|Univ|Jan|Feb|Mar|Apr|Aug|Sept|Oct|Nov|Dec|dept|ed|est|vol|vs)\.\s+$/)
  if (sentences.length && !/(?:[.!?:]"?)+[\s\u200b]*$/.test(sentences[sentences.length-1])) sentences.pop()
  return sentences

  function recombine(tokens, nonPunc) {
    const result = []
    for (let i=0; i<tokens.length; i+=2) {
      const part = (i+1 < tokens.length) ? (tokens[i] + tokens[i+1]) : tokens[i]
      if (part) {
        if (nonPunc && result.length && nonPunc.test(result[result.length-1])) result[result.length-1] += part
        else result.push(part)
      }
    }
    return result
  }
}

function embedTtsPlayer() {
  const frame = document.createElement("iframe")
  frame.src = chrome.runtime.getURL("player.html")
  frame.style.position = "absolute"
  frame.style.height = "0"
  frame.style.borderWidth = "0"
  document.body.appendChild(frame)
}

async function sendToPlayer(message) {
  message.dest = "player"
  const result = await chrome.runtime.sendMessage(message)
  if (result && result.error) throw result.error
  else return result
}
