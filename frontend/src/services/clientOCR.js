import { createWorker } from 'tesseract.js';

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
      const images = await this.pdfToImages(pdfFile);
      let fullText = '';
      
      for (let i = 0; i < images.length; i++) {
        if (onProgress) {
          onProgress({
            stage: 'ocr',
            page: i + 1,
            totalPages: images.length,
            progress: Math.round(((i + 1) / images.length) * 100)
          });
        }

        const pageText = await this.extractTextFromImage(images[i]);
        fullText += `\n\n--- Page ${i + 1} ---\n${pageText}`;
      }

      return fullText.trim();
    } catch (error) {
      console.error('PDF OCR Error:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }

  async pdfToImages(pdfFile) {
    // We'll use PDF.js for this
    const pdfjsLib = await import('pdfjs-dist/webpack');
    
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    const images = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
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
    }

    return images;
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

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice options
      const voice = this.voices.find(v => v.lang.startsWith('en')) || this.voices[0];
      if (voice) utterance.voice = voice;
      
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;

      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);

      this.synthesis.speak(utterance);
    });
  }

  stop() {
    this.synthesis.cancel();
  }

  pause() {
    this.synthesis.pause();
  }

  resume() {
    this.synthesis.resume();
  }

  get isPlaying() {
    return this.synthesis.speaking;
  }

  get isPaused() {
    return this.synthesis.paused;
  }
}

export const ocrService = new OCRService();
export const ttsService = new TTSService();