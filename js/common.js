
function registerMessageListener(name, handlers) {
  brapi.runtime.onMessage.addListener(
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
