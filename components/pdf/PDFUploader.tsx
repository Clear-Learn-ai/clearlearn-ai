'use client'

import { useState, useCallback } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle2, X, Info } from 'lucide-react'

interface PDFFile {
  file: File
  status: 'pending' | 'uploading' | 'success' | 'error'
  message?: string
  id?: string
}

interface UploadResult {
  filename: string
  status: 'success' | 'error'
  message: string
  data?: {
    pdfId: string
    sourceId: string
    sections: number
    trainingData: number
    complianceIssues: number
    pages: number
    images: number
  }
}

interface ComplianceReport {
  totalSources: number
  totalUsages: number
  complianceRate: number
  riskySources: string[]
  recommendations: string[]
}

export function PDFUploader({ onUploadComplete }: { onUploadComplete?: (results: UploadResult[]) => void }) {
  const [files, setFiles] = useState<PDFFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [category, setCategory] = useState<string>('manufacturer')
  const [manufacturer, setManufacturer] = useState<string>('')
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([])
  const [complianceReport, setComplianceReport] = useState<ComplianceReport | null>(null)
  const [showCompliance, setShowCompliance] = useState(false)

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    const pdfFiles = selectedFiles.filter(file => file.type === 'application/pdf')
    
    if (pdfFiles.length !== selectedFiles.length) {
      alert('Only PDF files are allowed')
    }

    const newFiles: PDFFile[] = pdfFiles.map(file => ({
      file,
      status: 'pending',
    }))

    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files)
    const pdfFiles = droppedFiles.filter(file => file.type === 'application/pdf')
    
    if (pdfFiles.length !== droppedFiles.length) {
      alert('Only PDF files are allowed')
    }

    const newFiles: PDFFile[] = pdfFiles.map(file => ({
      file,
      status: 'pending',
    }))

    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async () => {
    if (files.length === 0) return

    setIsUploading(true)
    setUploadResults([])
    setComplianceReport(null)

    try {
      // Update all files to uploading status
      setFiles(prev => prev.map(f => ({ ...f, status: 'uploading' as const })))

      const formData = new FormData()
      files.forEach(({ file }) => formData.append('files', file))
      formData.append('category', category)
      if (manufacturer) formData.append('manufacturer', manufacturer)

      const response = await fetch('/api/pdf/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      // Update file statuses based on results
      const updatedFiles: PDFFile[] = files.map(f => {
        const uploadResult = result.results.find((r: UploadResult) => r.filename === f.file.name)
        return {
          ...f,
          status: uploadResult?.status === 'success' ? 'success' as const : 'error' as const,
          message: uploadResult?.message,
          id: uploadResult?.data?.pdfId,
        }
      })

      setFiles(updatedFiles)
      setUploadResults(result.results)
      setComplianceReport(result.compliance)
      onUploadComplete?.(result.results)

    } catch (error) {
      console.error('Upload error:', error)
      
      // Mark all files as error
      setFiles(prev => prev.map(f => ({
        ...f,
        status: 'error',
        message: error instanceof Error ? error.message : 'Upload failed',
      })))
    }

    setIsUploading(false)
  }

  const getStatusIcon = (status: PDFFile['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'uploading':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      default:
        return <FileText className="w-4 h-4 text-gray-400" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          PDF Processing & Training Data Generation
        </h2>
        <p className="text-gray-600">
          Upload plumbing manuals, codes, and technical documentation to generate AI training data
        </p>
      </div>

      {/* Upload Configuration */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="manufacturer">Manufacturer Guides</option>
              <option value="code">Building Codes & Standards</option>
              <option value="procedure">Installation Procedures</option>
              <option value="troubleshooting">Troubleshooting Guides</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Manufacturer (Optional)
            </label>
            <input
              type="text"
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
              placeholder="e.g., Viega, NIBCO, Kohler"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6 hover:border-blue-400 transition-colors"
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Drop PDF files here or click to browse
        </h3>
        <p className="text-gray-500 mb-4">
          Maximum file size: 50MB per file
        </p>
        <input
          type="file"
          accept=".pdf"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="pdf-upload"
        />
        <label
          htmlFor="pdf-upload"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
        >
          Select PDF Files
        </label>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Selected Files ({files.length})
          </h3>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(file.status)}
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {file.file.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatFileSize(file.file.size)}
                      {file.message && (
                        <span className={`ml-2 ${
                          file.status === 'error' ? 'text-red-500' : 'text-green-500'
                        }`}>
                          - {file.message}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {file.status === 'pending' && (
                  <button
                    onClick={() => removeFile(index)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && (
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={uploadFiles}
            disabled={isUploading || files.length === 0}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Processing PDFs...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Process PDFs
              </>
            )}
          </button>

          <button
            onClick={() => setFiles([])}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Upload Results */}
      {uploadResults.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Processing Results
          </h3>
          <div className="space-y-3">
            {uploadResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  result.status === 'success'
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {result.filename}
                    </h4>
                    <p className={`text-sm ${
                      result.status === 'success' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {result.message}
                    </p>
                    {result.data && (
                      <div className="mt-2 text-xs text-gray-600">
                        <span className="inline-block mr-4">
                          📄 {result.data.pages} pages
                        </span>
                        <span className="inline-block mr-4">
                          📝 {result.data.sections} sections
                        </span>
                        <span className="inline-block mr-4">
                          🤖 {result.data.trainingData} training items
                        </span>
                        <span className="inline-block mr-4">
                          🖼️ {result.data.images} images
                        </span>
                        {result.data.complianceIssues > 0 && (
                          <span className="inline-block text-yellow-600">
                            ⚠️ {result.data.complianceIssues} compliance issues
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compliance Report */}
      {complianceReport && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium text-blue-900 flex items-center">
              <Info className="w-5 h-5 mr-2" />
              Legal Compliance Report
            </h3>
            <button
              onClick={() => setShowCompliance(!showCompliance)}
              className="text-blue-600 text-sm hover:text-blue-800"
            >
              {showCompliance ? 'Hide Details' : 'Show Details'}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900">
                {complianceReport.totalSources}
              </div>
              <div className="text-sm text-blue-700">Sources</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900">
                {complianceReport.totalUsages}
              </div>
              <div className="text-sm text-blue-700">Content Uses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">
                {complianceReport.complianceRate}%
              </div>
              <div className="text-sm text-blue-700">Compliant</div>
            </div>
          </div>

          {showCompliance && (
            <div className="space-y-3">
              {complianceReport.riskySources.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-800 mb-2">
                    Sources Requiring Review:
                  </h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {complianceReport.riskySources.map((source, index) => (
                      <li key={index}>• {source}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h4 className="font-medium text-blue-800 mb-2">
                  Recommendations:
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  {complianceReport.recommendations.map((rec, index) => (
                    <li key={index}>• {rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Legal Notice */}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
        <h4 className="font-medium text-gray-800 mb-2">Legal Notice</h4>
        <p>
          All uploaded content is processed for educational purposes under fair use guidelines.
          Proper attribution will be maintained for all sources. Users are encouraged to
          reference original manufacturer documentation for complete instructions and warranty information.
        </p>
      </div>
    </div>
  )
}