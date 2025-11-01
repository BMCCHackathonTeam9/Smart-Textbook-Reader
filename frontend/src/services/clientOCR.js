import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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
      // Convert PDF to images first
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
      throw new Error('Failed to extract text from PDF: ' + error.message);
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

      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      const images = [];

      console.log(`PDF has ${pdf.numPages} pages`);

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        if (onProgress) {
          onProgress({
            stage: 'converting',
            page: pageNum,
            totalPages: pdf.numPages,
            progress: Math.round(((pageNum - 1) / pdf.numPages) * 100)
          });
        }

        try {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 2 });
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;

          // Convert canvas to blob
          const blob = await new Promise(resolve => {
            canvas.toBlob(resolve, 'image/png');
          });

          images.push(blob);
        } catch (error) {
          console.error(`Error converting page ${pageNum}:`, error);
          // Create a placeholder for failed pages
          const canvas = document.createElement('canvas');
          canvas.width = 100;
          canvas.height = 100;
          const blob = await new Promise(resolve => {
            canvas.toBlob(resolve, 'image/png');
          });
          images.push(blob);
        }
      }

      console.log(`Converted ${images.length} pages to images`);
      return images;
    } catch (error) {
      console.error('PDF to images conversion error:', error);
      throw new Error('Failed to convert PDF to images: ' + error.message);
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