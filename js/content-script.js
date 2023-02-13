
const root = document.getElementById("__next")

rxjs.fromMutationObserver(root, {childList: true})
  .pipe(
    rxjs.concatMap(records => rxjs.from(records)),
    rxjs.concatMap(record => rxjs.from(record.addedNodes)),
    rxjs.startWith(root),
    rxjs.concatMap(node => {
      const chatLog = node.querySelector(".items-center.text-sm")
      if (chatLog) return rxjs.of(chatLog)
      console.error("Chat log node not found under", node)
      return rxjs.EMPTY
    }),
    rxjs.switchMap(node => rxjs.fromMutationObserver(node, {childList: true})),
    rxjs.concatMap(records => rxjs.from(records)),
    rxjs.concatMap(record => rxjs.from(record.addedNodes)),
  )
  .subscribe(node => console.log("Chat entry node added", node))
