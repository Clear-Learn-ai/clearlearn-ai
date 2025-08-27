// Type declarations for modules without TypeScript support

declare module 'pdf-parse' {
  interface PDFInfo {
    Title?: string
    Author?: string
    Subject?: string
    Creator?: string
    Producer?: string
    CreationDate?: Date
    ModificationDate?: Date
  }

  interface PDFMetadata {
    info: PDFInfo
  }

  interface PDFData {
    numpages: number
    numrender: number
    info: PDFInfo
    metadata: PDFMetadata
    version: string
    text: string
  }

  function pdfParse(buffer: Buffer, options?: any): Promise<PDFData>
  export = pdfParse
}

declare module 'youtube-transcript-api' {
  interface TranscriptItem {
    text: string
    offset: number
    duration: number
    confidence?: number
  }

  class YoutubeTranscript {
    static fetchTranscript(videoId: string): Promise<TranscriptItem[]>
  }

  export { YoutubeTranscript }
}

declare module '@ffmpeg/util' {
  export function toBlobURL(url: string, mimeType: string): Promise<string>
}

declare module 'pdf2pic' {
  interface ConvertOptions {
    density?: number
    saveFilename?: string
    savePath?: string
    format?: string
    width?: number
    height?: number
  }

  interface ConvertResult {
    name: string
    size: number
    path: string
  }

  function pdf2pic(options: ConvertOptions): {
    convertPDF: (input: string | Buffer) => Promise<ConvertResult[]>
  }

  export = pdf2pic
}