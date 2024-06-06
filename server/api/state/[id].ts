const storage = useStorage("cache:state")

export default defineEventHandler(async (event) => {
  // Get state id
  const id = getRouterParam(event, 'id')

  if(!id) throw createError({
    status: 400,
    message: "missing id"
  })

  // If request method is PUT
  if(event.method === "PUT") {
    // Read the state value from request body
    const data = await readBody(event)

    // Wait until promise callback (Don't timeout)
    // Save state to cache storage by id as key
    event.waitUntil(storage.setItem(id, data))

    return 
  }
  
  // Return saved state by id
  const data = storage.getItem(id)

  return data
})
