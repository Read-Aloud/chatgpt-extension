
const mainObservable = rxjs.fromMutationObserver(document.getElementById("__next"), {childList: true})
  .pipe(
    rxjs.concatMap(records => rxjs.from(records)),
    rxjs.concatMap(record => rxjs.from(record.addedNodes)),
    rxjs.filter(node => node.nodeType == 1),
    rxjs.startWith(document),
    rxjs.concatMap(el => rxjs.from(el.getElementsByTagName("main")).pipe(rxjs.take(1))),
    rxjs.distinctUntilChanged(),
    rxjs.tap(main => console.debug("Main changed", main))
  )

const newestParagraphObservable = mainObservable
  .pipe(
    rxjs.debounceTime(3*1000),
    rxjs.switchMap(main => rxjs.fromMutationObserver(main, {subtree: true, childList: true})),
    rxjs.concatMap(records => rxjs.from(records)),
    rxjs.concatMap(record => rxjs.from(record.addedNodes)),
    rxjs.filter(node => node.nodeType == 1),
    rxjs.concatMap(el => rxjs.from(el.getElementsByTagName("p")).pipe(rxjs.takeLast(1))),
    rxjs.distinctUntilChanged(),
    rxjs.tap(para => console.debug("Newest paragraph", para))
  )

newestParagraphObservable.subscribe()
