const fs = require('fs').promises
const path = require('path')

async function trainAI() {
  try {
    console.log('🤖 STARTING AI TRAINING FROM PDFs...\n')
    
    const pdfsDir = path.join(process.cwd(), 'data', 'pdfs')
    const files = await fs.readdir(pdfsDir)
    const pdfFiles = files.filter(f => f.endsWith('.pdf')).slice(0, 5) // Process 5 at a time
    
    console.log(`📚 Training AI with ${pdfFiles.length} PDFs...\n`)
    
    for (let i = 0; i < pdfFiles.length; i++) {
      const file = pdfFiles[i]
      console.log(`[${i+1}/${pdfFiles.length}] 🔄 Processing: ${file}`)
      
      try {
        // Create form data for the API
        const filePath = path.join(pdfsDir, file)
        const fileBuffer = await fs.readFile(filePath)
        
        // Determine category based on filename
        let category = 'manufacturer'
        let manufacturer = ''
        
        if (file.includes('viega')) {
          manufacturer = 'Viega'
        } else if (file.includes('RIDGID')) {
          manufacturer = 'RIDGID'
        } else if (file.includes('NPC') || file.includes('National_Plumbing_Code')) {
          category = 'code'
          manufacturer = 'National Research Council Canada'
        } else if (file.includes('FLEX')) {
          manufacturer = 'FLEX'
        } else if (file.includes('copper')) {
          manufacturer = 'Copper Development Association'
        }
        
        console.log(`   📂 Category: ${category}`)
        console.log(`   🏭 Manufacturer: ${manufacturer || 'Unknown'}`)
        console.log(`   💾 Size: ${(fileBuffer.length / (1024*1024)).toFixed(2)} MB`)
        
        // Call the processing API
        const response = await fetch('http://localhost:3000/api/pdf/upload', {
          method: 'POST',
          body: createFormData(file, fileBuffer, category, manufacturer)
        })
        
        if (response.ok) {
          const result = await response.json()
          console.log(`   ✅ SUCCESS: Generated ${result.results?.[0]?.data?.trainingData || 0} training items`)
        } else {
          const error = await response.text()
          console.log(`   ❌ FAILED: ${error}`)
        }
        
      } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`)
      }
      
      console.log('') // Empty line
      
      // Wait 2 seconds between files to prevent overload
      if (i < pdfFiles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
    
    console.log('🎉 AI TRAINING COMPLETED!')
    console.log('\n💡 Your AI now knows about:')
    console.log('   - Viega PEX installation procedures')
    console.log('   - RIDGID tool specifications')  
    console.log('   - National Plumbing Code requirements')
    console.log('   - Various plumbing components and fittings')
    
  } catch (error) {
    console.error('❌ Training failed:', error.message)
  }
}

function createFormData(filename, buffer, category, manufacturer) {
  const boundary = '----WebKitFormBoundary' + Math.random().toString(16)
  let body = ''
  
  // Add files
  body += `--${boundary}\r\n`
  body += `Content-Disposition: form-data; name="files"; filename="${filename}"\r\n`
  body += `Content-Type: application/pdf\r\n\r\n`
  body += buffer.toString('binary')
  body += `\r\n`
  
  // Add category
  body += `--${boundary}\r\n`
  body += `Content-Disposition: form-data; name="category"\r\n\r\n`
  body += category
  body += `\r\n`
  
  // Add manufacturer
  if (manufacturer) {
    body += `--${boundary}\r\n`
    body += `Content-Disposition: form-data; name="manufacturer"\r\n\r\n`
    body += manufacturer
    body += `\r\n`
  }
  
  body += `--${boundary}--\r\n`
  
  return body
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/pdf/upload', { method: 'GET' })
    return true
  } catch {
    return false
  }
}

// Main execution
checkServer().then(isRunning => {
  if (isRunning) {
    trainAI()
  } else {
    console.log('❌ Server not running on port 3000')
    console.log('💡 Start server first: npm run dev')
  }
})