export const handler = async (event, context) => {
  console.log(event)
  const name = event.body
  return `Hello, ${name}!`
}
