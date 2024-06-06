import { hash } from "ohash"

export const useSharedState = <T extends Record<string, any>>(id = "state") => {
  const state = useState(() => ({}) as T)

  // populate on server
  if(import.meta.server) {
    // Prefetch state before data send to client
    onServerPrefetch(async () => {
      // Fetch state
      const data = await $fetch(`/api/state/${id}`, {
        responseType: 'json'
      })

      // Set server fetch data or empty state
      state.value = data as T || {}
    })
  }

  // Send back to client
  if(import.meta.client) {
    let snapshot = hash(state.value)

    // Initilize websocket client
    const ws = useWebsocket()

    // Send new state changes to server
    const syncState = async (newState: T) => {
      // Check if websocket ready
      await ws?.ready

      // Send new state to all subscribers and server using websocket
      ws?.ws.send(JSON.stringify({id, value: newState}))

      // Send new state to server
      // await $fetch(`/api/state/${id}`, {
      //   method: "PUT",
      //   body: newState
      // })
    }

    // On recieve any message
    ws?.ws.addEventListener("message", event => {
      const data = JSON.parse(event.data)

      // Check the cache id
      if(data.id === id) {
        const newSnapshot = hash(data.value)

        // Chech if data hash is as the same as previous data (Avoid duplication)
        if(newSnapshot !== snapshot) {
          // Set a new data hash
          snapshot = newSnapshot

          // Update state
          state.value = data.value
        }
      }
    })
    
    // Watch deeply if state changes
    watch(state, syncState, {deep: true, flush: "post"})
  }

  return state
}
