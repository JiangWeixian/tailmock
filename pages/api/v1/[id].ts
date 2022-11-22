// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { cors, runMiddleware } from '@/libs/middleware'

import { faker } from '@faker-js/faker/locale/en'

type Data = {
  '#schema'?: string
  data?: any
}

type Config = {
  delay: number
}

const delay = async (ms = 1000) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, ms)
  })
}

const PRESERVED_TOKENS = {
  delay: 'delay',
  user: 'user',
}
const PREFIX = '/api/v1/'

const parse = (tokens: string[]) => {
  const data: Record<string, unknown> = {}
  const config: Partial<Config> = {}
  for (const token of tokens) {
    const [key, value] = token.split('-')
    if (key === PRESERVED_TOKENS.user) {
      data[key] = value ? Array.from({ length: Number(10) }).fill(0).map(() => faker.internet.userName()) : faker.internet.userName()
    }
    if (key === PRESERVED_TOKENS.delay) {
      config.delay = Number(value)
    }
  }
  return { data, config }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const url = req.url
  // Run the middleware
  await runMiddleware(req, res, cors)
  const tokens = req.url?.replace(PREFIX, '')?.split('$') ?? []
  const { data, config } = parse(tokens)
  if (config.delay) {
    console.log('[v1]', `delay ${config.delay}`)
    await delay(config.delay)
  }
  console.log('[v1]', req.url)
  res.status(200).json({ '#schema': url, data })
}
