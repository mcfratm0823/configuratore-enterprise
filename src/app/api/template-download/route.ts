import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    // Path al file ZIP template in src/assets
    const zipPath = path.join(process.cwd(), 'src', 'assets', 'Testi_template.zip')
    
    // Verifica che il file esista
    if (!fs.existsSync(zipPath)) {
      console.error('❌ Template ZIP not found at:', zipPath)
      return NextResponse.json(
        { error: 'Template file not found' },
        { status: 404 }
      )
    }
    
    // Leggi il file
    const fileBuffer = fs.readFileSync(zipPath)
    
    // Ritorna il file con headers corretti
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="white-label-templates.zip"',
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache per 1 ora
      },
    })
    
  } catch (error) {
    console.error('❌ Error serving template ZIP:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}