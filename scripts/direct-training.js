// Import required modules
const fs = require('fs').promises
const path = require('path')

// We'll use the server's PDF processor directly
const { PDFProcessor } = require('../lib/pdf/pdfProcessor')
const { ContentIntegrator } = require('../lib/pdf/contentIntegrator')

async function trainAIDirect() {
  console.log('🤖 TRAINING AI DIRECTLY FROM PDFs...\n')
  
  try {
    const pdfsDir = path.join(process.cwd(), 'data', 'pdfs')
    const files = await fs.readdir(pdfsDir)
    const pdfFiles = files.filter(f => f.endsWith('.pdf')).slice(0, 3) // Start with 3 files
    
    console.log(`📚 Processing ${pdfFiles.length} PDFs for AI training...\n`)
    
    const pdfProcessor = new PDFProcessor()
    const contentIntegrator = new ContentIntegrator()
    const processedPDFs = []
    
    for (let i = 0; i < pdfFiles.length; i++) {
      const file = pdfFiles[i]
      const filePath = path.join(pdfsDir, file)
      
      console.log(`[${i+1}/${pdfFiles.length}] 🔄 Processing: ${file}`)
      
      try {
        // Determine category and manufacturer
        let category = 'manufacturer'
        let manufacturer = ''
        
        if (file.includes('viega')) {
          manufacturer = 'Viega'
        } else if (file.includes('RIDGID')) {
          manufacturer = 'RIDGID'
        } else if (file.includes('NPC') || file.includes('National_Plumbing_Code')) {
          category = 'code'
        }
        
        console.log(`   📂 Category: ${category}`)
        console.log(`   🏭 Manufacturer: ${manufacturer || 'General'}`)
        
        // Process the PDF
        const pdfContent = await pdfProcessor.processPDF(filePath, category, manufacturer)
        processedPDFs.push(pdfContent)
        
        console.log(`   ✅ Extracted ${pdfContent.sections.length} sections`)
        console.log(`   🖼️  Found ${pdfContent.images.length} images`)
        
      } catch (error) {
        console.log(`   ❌ Failed: ${error.message}`)
      }
      
      console.log('')
    }
    
    if (processedPDFs.length > 0) {
      console.log('🧠 Generating training data...')
      const trainingData = await contentIntegrator.generateTrainingData(processedPDFs)
      console.log(`✅ Generated ${trainingData.length} training items`)
      
      console.log('\n🎉 AI TRAINING COMPLETED!')
      console.log(`📈 Your AI now has ${trainingData.length} new Q&A pairs about plumbing!`)
    }
    
  } catch (error) {
    console.error('❌ Training failed:', error)
  }
}

trainAIDirect()