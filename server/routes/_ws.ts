const storage = useStorage("cache:state")

export default defineWebSocketHandler({
  close(peer, details) {
    peer.unsubscribe("state-updates")
  },
  error(peer, error) {
      
  },

  open(peer) {
    peer.subscribe("state-updates")
  },
  async message(peer, message) {
    console.log(`Websocket message:`, message);
    
    const blob = message.text()
    const data = JSON.parse(blob)

    await storage.setItem(data.id, data.value)
    // const data = await readBody(event)
    // event.waitUntil(storage.setItem(id, data))
    peer.publish("state-updates", data)
  },
})