import { NextRequest, NextResponse } from 'next/server'

// Hidden admin debug endpoint
// Only accessible via internal debugging tools
// WARNING: Not meant for production use

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { command } = body
    
    if (!command) {
      return NextResponse.json(
        { error: 'Command required' },
        { status: 400 }
      )
    }
    
    // Execute debug commands
    switch (command) {
      case 'status':
        return NextResponse.json({
          status: 'ok',
          serverTime: new Date().toISOString(),
          nodeVersion: process.version,
          platform: process.platform,
          // Note: Environment variables are access-protected
          envKeys: Object.keys(process.env).filter(k => k.startsWith('VERCEL') || k === 'NODE_ENV')
        })
        
      case 'info':
        return NextResponse.json({
          version: '2.4.1',
          build: process.env.VERCEL_GIT_COMMIT_SHA || 'dev',
          region: process.env.VERCEL_REGION || 'unknown',
          // Debug info about available features
          features: {
            sourceMaps: true,
            replayImport: true,
            templateRender: true,
            adminDebug: true
          }
        })
        
      case 'env':
        // Attempt to read environment (may be blocked)
        return NextResponse.json({
          NODE_ENV: process.env.NODE_ENV,
          VERCEL: process.env.VERCEL,
          // This will be null/undefined if not set
          flag: process.env.FLAG,
          message: 'Environment access attempted'
        })
        
      default:
        return NextResponse.json({
          error: `Unknown command: ${command}`,
          available: ['status', 'info', 'env']
        })
    }
    
  } catch (error: any) {
    return NextResponse.json(
      { error: `Debug failed: ${error.message}` },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Return debug endpoint info
  return NextResponse.json({
    endpoint: '/api/admin/debug',
    version: '2.4.1',
    status: 'active',
    methods: ['GET', 'POST']
  })
}
