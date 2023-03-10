
function registerMessageListener(name, handlers) {
  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.dest == name) {
        handle(request)
          .then(sendResponse, err => sendResponse({error: errorToJson(err)}))
        return true
      }
    }
  )
  async function handle(request) {
    const handler = handlers[request.method]
    if (!handler) throw new Error("Bad method " + request.method)
    return handler.apply(null, request.args)
  }
}

function errorToJson(err) {
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      stack: err.stack,
    }
  }
  else {
    return err
  }
}

if (typeof rxjs != "undefined") {
  rxjs.fromMutationObserver = function(node, options) {
    return new rxjs.Observable(subscriber => {
      const observer = new MutationObserver(records => subscriber.next(records))
      observer.observe(node, options)
      return () => observer.disconnect()
    })
  }
}
