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

    const ws = useWebsocket()

    // Send new state changes to server
    const syncState = async (newState: T) => {
      await ws?.ready

      console.log("ready");
      

      ws?.ws.send(JSON.stringify({id, value: newState}))

      // await $fetch(`/api/state/${id}`, {
      //   method: "PUT",
      //   body: newState
      // })
    }

    ws?.ws.addEventListener("message", event => {
      const data = JSON.parse(event.data)

      console.log(data);
      

      if(data.id === id) {
        const newSnapshot = hash(data.value)

        if(newSnapshot !== snapshot) {
          snapshot = newSnapshot

          state.value = data.value
        }
      }
    })
    
    watch(state, syncState, {deep: true, flush: "post"})
  }

  return state
}
