import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker using URL string (compatible with Create React App)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

console.log('PDF.js worker configured:', pdfjsLib.GlobalWorkerOptions.workerSrc);

class OCRService {
  constructor() {
    this.worker = null;
    this.isInitialized = false;
    this.initializationAttempts = 0;
    this.maxAttempts = 3;
  }

  async initialize() {
    if (this.isInitialized) return;

    this.initializationAttempts++;
    console.log(`Tesseract initialization attempt ${this.initializationAttempts}/${this.maxAttempts}`);

    try {
      // Create worker with more explicit configuration
      console.log('Creating Tesseract.js worker...');
      
      this.worker = await createWorker('eng', 1, {
        logger: m => {
          console.log('Tesseract init:', m.status, m.progress);
        },
        // Add explicit worker configuration
        workerPath: `https://unpkg.com/tesseract.js@5.0.4/dist/worker.min.js`,
        langPath: `https://tessdata.projectnaptha.com/4.0.0`,
        corePath: `https://unpkg.com/tesseract.js-core@5.0.0/tesseract-core.wasm.js`
      });

      // Set worker parameters for better performance
      await this.worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!?;:()-\'" ',
        tessedit_pageseg_mode: '1', // Automatic page segmentation with OSD
      });

      this.isInitialized = true;
      console.log('Tesseract.js worker initialized successfully');
    } catch (error) {
      console.error(`Tesseract initialization failed (attempt ${this.initializationAttempts}):`, error);
      
      if (this.initializationAttempts < this.maxAttempts) {
        console.log('Retrying initialization...');
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        return this.initialize();
      } else {
        throw new Error(`Failed to initialize Tesseract after ${this.maxAttempts} attempts`);
      }
    }
  }

  async reinitializeWorker() {
    console.log('Reinitializing Tesseract worker...');
    if (this.worker) {
      try {
        await this.worker.terminate();
      } catch (e) {
        console.warn('Error terminating worker:', e);
      }
    }
    this.worker = null;
    this.isInitialized = false;
    this.initializationAttempts = 0;
    await this.initialize();
  }

  async extractTextFromImage(imageFile, onProgress, attempt = 1) {
    const maxAttempts = 2;
    
    if (!this.isInitialized) {
      console.log('Initializing OCR worker...');
      await this.initialize();
    }

    try {
      console.log(`Starting OCR on image (attempt ${attempt}), size:`, imageFile.size);
      
      // Create a more aggressive timeout for individual OCR operations
      const ocrPromise = this.worker.recognize(imageFile, {
        logger: (m) => {
          console.log('Tesseract progress:', m.status, m.progress);
          if (onProgress && m.status === 'recognizing text') {
            onProgress(Math.round(m.progress * 100));
          }
        }
      });

      // Shorter timeout - if it takes more than 15 seconds, something is wrong
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('OCR operation timeout')), 15000)
      );

      const result = await Promise.race([ocrPromise, timeoutPromise]);

      console.log('OCR completed, extracted text length:', result.data.text.length);
      return result.data.text;
      
    } catch (error) {
      console.error(`OCR Error (attempt ${attempt}):`, error);
      
      if (attempt < maxAttempts && (error.message.includes('timeout') || error.message.includes('worker'))) {
        console.log('OCR failed, reinitializing worker and retrying...');
        try {
          await this.reinitializeWorker();
          return await this.extractTextFromImage(imageFile, onProgress, attempt + 1);
        } catch (reinitError) {
          console.error('Worker reinitialize failed:', reinitError);
        }
      }
      
      // If all attempts failed, return a placeholder
      console.warn('All OCR attempts failed, returning placeholder text');
      return `[OCR failed for this image after ${attempt} attempts. Error: ${error.message}]`;
    }
  }

  async extractTextFromPDF(pdfFile, onProgress) {
    try {
      // First try the normal PDF processing
      console.log('Starting PDF OCR process...');
      const images = await this.pdfToImages(pdfFile, onProgress);
      let fullText = '';
      
      console.log(`Processing ${images.length} images with OCR...`);
      
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
          console.log(`Starting OCR on page ${i + 1}/${images.length}`);
          
          // Shorter timeout and better error handling
          const pageText = await this.extractTextFromImage(images[i]);
          
          console.log(`Page ${i + 1} OCR completed, text length:`, pageText.length);
          fullText += `\n\n--- Page ${i + 1} ---\n${pageText}`;
          
        } catch (error) {
          console.error(`Error processing page ${i + 1}:`, error);
          fullText += `\n\n--- Page ${i + 1} ---\n[Error extracting text from this page: ${error.message}]`;
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

      console.log('PDF OCR completed, total text length:', fullText.length);
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
      
      // Simple PDF.js configuration
      const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer
      }).promise;

      const images = [];
      console.log(`PDF has ${pdf.numPages} pages`);
      
      // Process all pages
      const maxPages = pdf.numPages;

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
          
          // Use reasonable scale
          const viewport = page.getViewport({ scale: 1.5 });
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          // Render page
          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;

          // Convert to JPEG for efficiency
          const blob = await new Promise(resolve => {
            canvas.toBlob(resolve, 'image/jpeg', 0.8);
          });

          if (blob) {
            images.push(blob);
            console.log(`Page ${pageNum} converted successfully`);
          }
          
        } catch (error) {
          console.error(`Error converting page ${pageNum}:`, error);
          // Continue with other pages
          continue;
        }
      }

      if (images.length === 0) {
        throw new Error('No pages could be converted to images');
      }

      console.log(`Successfully converted ${images.length} pages to images`);
      return images;
      
    } catch (error) {
      console.error('PDF to images conversion error:', error);
      throw new Error('PDF processing failed: ' + error.message);
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