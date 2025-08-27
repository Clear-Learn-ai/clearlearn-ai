const fs = require('fs').promises
const path = require('path')

// Simple script to process PDFs directly from the pdfs folder
async function processPDFsDirectly() {
  try {
    console.log('🔍 Looking for PDFs to process...')
    
    const pdfsDir = path.join(process.cwd(), 'data', 'pdfs')
    const files = await fs.readdir(pdfsDir)
    const pdfFiles = files.filter(f => f.endsWith('.pdf'))
    
    console.log(`📄 Found ${pdfFiles.length} PDF files:`)
    pdfFiles.forEach(file => console.log(`  - ${file}`))
    
    console.log('\n🚀 Processing PDFs...')
    
    // Call the API for each PDF
    for (const file of pdfFiles) {
      try {
        console.log(`\n📝 Processing: ${file}`)
        
        const filePath = path.join(pdfsDir, file)
        const stats = await fs.stat(filePath)
        
        console.log(`   Size: ${(stats.size / (1024*1024)).toFixed(2)} MB`)
        console.log(`   Status: Ready for processing`)
        
        // You can add actual processing logic here if needed
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`)
      }
    }
    
    console.log('\n✅ All PDFs scanned successfully!')
    console.log('\n💡 To process these files:')
    console.log('   1. Go to http://localhost:3000/pdf')
    console.log('   2. Or run: node scripts/process-pdfs.js')
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

processPDFsDirectly()