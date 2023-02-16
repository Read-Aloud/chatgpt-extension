
let promise = Promise.resolve()

registerMessageListener("player", {
  playNext(sentence) {
    promise = promise.then(() => read(sentence))
  }
})

function read(sentence) {
  return new Promise((fulfill, reject) => {
    chrome.tts.speak(sentence, {
      onEvent(event) {
        if (["end", "interrupted", "cancelled"].includes(event.type)) fulfill()
        else if (event.type == "error") reject(new Error(event.errorMessage))
      }
    })
  })
}
