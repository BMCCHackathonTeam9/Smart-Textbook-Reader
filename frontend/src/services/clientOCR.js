import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker for Create React App and Vercel
// Use a simpler, more reliable approach
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Alternative: try to use local worker if available
try {
  // This might work in development
  const workerPath = `/static/js/pdf.worker.min.js`;
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerPath;
} catch (e) {
  // Fall back to CDN
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

console.log('PDF.js worker configured:', pdfjsLib.GlobalWorkerOptions.workerSrc);

class OCRService {
  constructor() {
    this.worker = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      this.worker = await createWorker('eng');
      this.isInitialized = true;
      console.log('Tesseract.js worker initialized');
    } catch (error) {
      console.error('Failed to initialize Tesseract.js:', error);
      throw error;
    }
  }

  async extractTextFromImage(imageFile, onProgress) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const result = await this.worker.recognize(imageFile, {
        logger: (m) => {
          if (onProgress && m.status === 'recognizing text') {
            onProgress(Math.round(m.progress * 100));
          }
        }
      });

      return result.data.text;
    } catch (error) {
      console.error('OCR Error:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  async extractTextFromPDF(pdfFile, onProgress) {
    try {
      // First try the normal PDF processing
      const images = await this.pdfToImages(pdfFile, onProgress);
      let fullText = '';
      
      for (let i = 0; i < images.length; i++) {
        if (onProgress) {
          onProgress({
            stage: 'ocr',
            page: i + 1,
            totalPages: images.length,
            progress: Math.round(((i) / images.length) * 100)
          });
        }

        try {
          const pageText = await this.extractTextFromImage(images[i]);
          fullText += `\n\n--- Page ${i + 1} ---\n${pageText}`;
        } catch (error) {
          console.error(`Error processing page ${i + 1}:`, error);
          fullText += `\n\n--- Page ${i + 1} ---\n[Error extracting text from this page]`;
        }
      }

      if (onProgress) {
        onProgress({
          stage: 'complete',
          page: images.length,
          totalPages: images.length,
          progress: 100
        });
      }

      return fullText.trim();
      
    } catch (error) {
      console.error('PDF OCR Error:', error);
      
      // If PDF processing fails completely, provide helpful error message
      if (error.message.includes('worker failed') || error.message.includes('Failed to fetch')) {
        throw new Error('PDF processing failed due to browser compatibility issues. Please try uploading the PDF as individual page images (screenshots) instead, or use a different browser.');
      } else {
        throw new Error('Failed to extract text from PDF: ' + error.message);
      }
    }
  }

  async pdfToImages(pdfFile, onProgress) {
    try {
      if (onProgress) {
        onProgress({
          stage: 'converting',
          page: 0,
          totalPages: 0,
          progress: 0
        });
      }

      console.log('Converting PDF to images...');
      const arrayBuffer = await pdfFile.arrayBuffer();
      
      // Simplified PDF.js configuration that's more likely to work
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        verbosity: 0,
        // Disable problematic features
        isEvalSupported: false,
        disableFontFace: true,
        useWorkerFetch: false,
        disableAutoFetch: true,
        disableStream: true,
        disableRange: true,
        // Add these for better compatibility
        standardFontDataUrl: null,
        cMapPacked: true
      });

      // Shorter timeout to fail faster
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('PDF loading timeout - try converting to images first')), 10000)
      );

      const pdf = await Promise.race([loadingTask.promise, timeoutPromise]);
      const images = [];

      console.log(`PDF has ${pdf.numPages} pages`);
      
      // Limit to first 2 pages to minimize issues
      const maxPages = Math.min(pdf.numPages, 2);

      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        if (onProgress) {
          onProgress({
            stage: 'converting',
            page: pageNum,
            totalPages: maxPages,
            progress: Math.round(((pageNum - 1) / maxPages) * 100)
          });
        }

        try {
          console.log(`Processing page ${pageNum}/${maxPages}...`);
          const page = await pdf.getPage(pageNum);
          
          // Use smaller scale to reduce memory usage and processing time
          const viewport = page.getViewport({ scale: 1.0 });
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          // Shorter timeout for page rendering
          const renderPromise = page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;

          const pageTimeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`Page ${pageNum} timeout`)), 5000)
          );

          await Promise.race([renderPromise, pageTimeoutPromise]);

          // Convert to JPEG with lower quality for faster processing
          const blob = await new Promise(resolve => {
            canvas.toBlob(resolve, 'image/jpeg', 0.6);
          });

          if (blob) {
            images.push(blob);
            console.log(`Page ${pageNum} converted successfully`);
          }
          
        } catch (error) {
          console.error(`Error converting page ${pageNum}:`, error);
          // Skip failed pages
          continue;
        }
      }

      if (images.length === 0) {
        throw new Error('No pages could be converted. Try uploading page screenshots as images instead.');
      }

      console.log(`Successfully converted ${images.length} pages to images`);
      return images;
      
    } catch (error) {
      console.error('PDF to images conversion error:', error);
      
      // Provide more specific error messages
      if (error.message.includes('timeout')) {
        throw new Error('PDF processing timed out. Please try uploading individual page screenshots as images instead.');
      } else if (error.message.includes('worker')) {
        throw new Error('PDF worker failed to load. Please try uploading page screenshots as images instead.');
      } else {
        throw new Error('PDF processing failed. Please try uploading page screenshots as images instead.');
      }
    }
  }

  async cleanup() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
    }
  }
}

// Text-to-Speech using Web Speech API
class TTSService {
  constructor() {
    this.synthesis = window.speechSynthesis;
    this.voices = [];
    this.currentUtterance = null;
    this.loadVoices();
  }

  loadVoices() {
    this.voices = this.synthesis.getVoices();
    
    // If voices aren't loaded yet, wait for the event
    if (this.voices.length === 0) {
      this.synthesis.addEventListener('voiceschanged', () => {
        this.voices = this.synthesis.getVoices();
      });
    }
  }

  async textToSpeech(text, options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Stop any current speech
      this.synthesis.cancel();

      // Split long text into chunks to avoid browser limits
      const maxLength = 200; // Most browsers have character limits
      const chunks = this.splitTextIntoChunks(text, maxLength);
      
      this.speakChunks(chunks, options, resolve, reject);
    });
  }

  splitTextIntoChunks(text, maxLength) {
    const sentences = text.split(/[.!?]+/);
    const chunks = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > maxLength) {
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = sentence;
      } else {
        currentChunk += sentence + '.';
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  speakChunks(chunks, options, resolve, reject, index = 0) {
    if (index >= chunks.length) {
      resolve();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(chunks[index]);
    this.currentUtterance = utterance;
    
    // Set voice options
    const voice = this.voices.find(v => v.lang.startsWith('en')) || this.voices[0];
    if (voice) utterance.voice = voice;
    
    utterance.rate = options.rate || 0.9;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;

    utterance.onend = () => {
      // Speak next chunk
      setTimeout(() => {
        this.speakChunks(chunks, options, resolve, reject, index + 1);
      }, 100);
    };

    utterance.onerror = (error) => {
      console.error('Speech error:', error);
      reject(error);
    };

    this.synthesis.speak(utterance);
  }

  stop() {
    this.synthesis.cancel();
    this.currentUtterance = null;
  }

  pause() {
    this.synthesis.pause();
  }

  resume() {
    this.synthesis.resume();
  }

  get isPlaying() {
    return this.synthesis.speaking && !this.synthesis.paused;
  }

  get isPaused() {
    return this.synthesis.paused;
  }
}

export const ocrService = new OCRService();
export const ttsService = new TTSService();