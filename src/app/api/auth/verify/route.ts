import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
    
    if (password !== adminPassword) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Create JWT token
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'your-secret-key-min-32-characters'
    )
    
    const token = await new SignJWT({ admin: true })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret)

    // Set cookie
    const response = NextResponse.json({ success: true })
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

