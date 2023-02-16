
let promise = Promise.resolve()

registerMessageListener("player", {
  playNext(sentence) {
    promise = promise.then(() => read(sentence))
  }
})

async function read(sentence) {
  const settings = await chrome.storage.local.get()
  if (settings.voiceName == "[off]") return;
  await new Promise((fulfill, reject) => {
    chrome.tts.speak(sentence, {
      voiceName: settings.voiceName || undefined,
      onEvent(event) {
        if (["end", "interrupted", "cancelled"].includes(event.type)) fulfill()
        else if (event.type == "error") reject(new Error(event.errorMessage))
      }
    })
  })
}
