import { NextResponse } from 'next/server'
import { createClient } from '@deepgram/sdk'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const apiKey = process.env.DEEPGRAM_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing DEEPGRAM_API_KEY' },
        { status: 500 },
      )
    }

    const serverClient = createClient(apiKey)
    const { result, error } = await serverClient.auth.grantToken()
    if (error || !result?.access_token) {
      return NextResponse.json(
        { error: error ?? 'grantToken failed' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      accessToken: result.access_token,
      expiresIn: result.expires_in ?? 30,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'internal error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
