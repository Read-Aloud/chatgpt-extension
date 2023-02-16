
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

const textObservable = paraObservable
  .pipe(
    rxjs.switchMap(para => {
      return rxjs.fromMutationObserver(para, {subtree: true, characterData: true})
        .pipe(
          rxjs.map(() => para.textContent),
          rxjs.startWith(para.textContent)
        )
    }),
    rxjs.distinctUntilChanged(),
    rxjs.tap(text => console.log("Text changed", text))
  )

textObservable.subscribe()
