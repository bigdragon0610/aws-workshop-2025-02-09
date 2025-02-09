import { Hono } from 'hono'
import { handle } from 'hono/aws-lambda'

const app = new Hono()

app.all('/:ip', async (c) => {
  const ip = c.req.param('ip')
  const newUrl = new URL(`http://${ip}`)
  const newRequest = new Request(newUrl)
  const response = await fetch(newRequest)
  return response
})

export const handler = handle(app)
