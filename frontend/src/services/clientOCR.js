import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker using URL string (compatible with Create React App)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

console.log('PDF.js worker configured:', pdfjsLib.GlobalWorkerOptions.workerSrc);

class OCRService {
  constructor() {
    // Use OCR.space free API (no account needed for basic usage)
    this.apiKey = 'K87899142388957'; // Free public API key
    this.apiUrl = 'https://api.ocr.space/parse/image';
  }

  async initialize() {
    // No initialization needed for API-based approach
    console.log('OCR service ready (using OCR.space API)');
    return Promise.resolve();
  }

  async extractTextFromImage(imageFile, onProgress) {
    try {
      console.log('Starting OCR via OCR.space API, size:', imageFile.size);
      
      if (onProgress) onProgress(10);

      // Compress image if it's too large for the API (1MB limit on mobile)
      let fileToUpload = imageFile;
      const maxSize = 900 * 1024; // 900KB to be safe
      
      if (imageFile.size > maxSize) {
        console.log('Image too large, compressing...');
        fileToUpload = await this.compressImage(imageFile, maxSize);
        console.log('Compressed from', imageFile.size, 'to', fileToUpload.size);
      }
      
      // Convert blob to file with proper name and type if needed
      if (fileToUpload instanceof Blob && !(fileToUpload instanceof File)) {
        fileToUpload = new File([fileToUpload], 'page.jpg', { type: 'image/jpeg' });
      }

      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('apikey', this.apiKey);
      formData.append('language', 'eng');
      formData.append('isOverlayRequired', 'false');
      formData.append('detectOrientation', 'true');
      formData.append('scale', 'true');
      formData.append('OCREngine', '2');
      formData.append('filetype', 'JPG');

      if (onProgress) onProgress(30);

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        body: formData
      });

      if (onProgress) onProgress(70);

      const result = await response.json();

      if (onProgress) onProgress(100);

      if (result.IsErroredOnProcessing) {
        throw new Error(result.ErrorMessage || 'OCR processing failed');
      }

      const text = result.ParsedResults?.[0]?.ParsedText || '';
      console.log('OCR completed, extracted text length:', text.length);
      
      return text;
    } catch (error) {
      console.error('OCR Error:', error);
      throw new Error('Failed to extract text from image: ' + error.message);
    }
  }

  async compressImage(imageFile, maxSize) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions (reduce by half if too large)
          const maxDimension = 2000;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension;
              width = maxDimension;
            } else {
              width = (width / height) * maxDimension;
              height = maxDimension;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Try different quality levels until file is small enough
          let quality = 0.7;
          const tryCompress = () => {
            canvas.toBlob((blob) => {
              if (blob.size <= maxSize || quality <= 0.3) {
                resolve(blob);
              } else {
                quality -= 0.1;
                tryCompress();
              }
            }, 'image/jpeg', quality);
          };
          
          tryCompress();
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });
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