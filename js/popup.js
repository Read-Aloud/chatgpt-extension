
document.addEventListener("DOMContentLoaded", onDomReady)


async function onDomReady() {
  const settings = await chrome.storage.local.get()

  //voice select
  const selVoice = document.getElementById("selVoice")

  const voices = await chrome.tts.getVoices()
  for (const voice of voices) {
    const opt = document.createElement("option")
    opt.value = voice.voiceName
    opt.innerText = voice.voiceName
    selVoice.appendChild(opt)
  }

  selVoice.value = settings.voiceName || ""

  selVoice.addEventListener("change", () => {
    chrome.storage.local.set({voiceName: selVoice.value})
  })
}
