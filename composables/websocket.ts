let ws: WebSocket

export const useWebsocket = () => {

  // Don't do anything on server 
  if(import.meta.server) return

  // If websocket didnt initlized before
  if(!ws) {
    // Find websocket protocol from user location 
    const protocol = location.protocol === 'https:' ? 'wss' : 'ws'

    // Lnitilize websocket client
    ws = new WebSocket(`${protocol}://${location.host}/_ws`)
  }

  // Return websocket and ready promise
  return {
    ws, ready: new Promise((resolve) => {
      ws.addEventListener("open", resolve)
    })
  }
}
