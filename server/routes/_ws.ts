const storage = useStorage("cache:state")

export default defineWebSocketHandler({
  close(peer) {
    peer.unsubscribe("state-updates")
  },
  open(peer) {
    peer.subscribe("state-updates")
  },
  async message(peer, message) {
    console.log(`Websocket message:`, message);
    
    // Read data from message
    const blob = message.text()
    const data = JSON.parse(blob)

    // Save data from message to storage
    await storage.setItem(data.id, data.value)

    // const data = await readBody(event)
    // event.waitUntil(storage.setItem(id, data))

    // Publish data to all subscribers
    peer.publish("state-updates", data)
  },
})