import React, { useState, useEffect } from 'react';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import { GlobalStyles } from './styles/GlobalStyles';
import { Container } from './components/common';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import TextDisplay from './components/TextDisplay';
import AudioControls from './components/AudioControls';
import { ocrService, ttsService } from './services/clientOCR';

function App() {
  const [extractedText, setExtractedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [ocrProgress, setOcrProgress] = useState(null);

  // Initialize OCR service on component mount
  useEffect(() => {
    const initializeOCR = async () => {
      try {
        await ocrService.initialize();
        // OCR service initialized successfully
      } catch (error) {
        setError('Failed to initialize OCR service. Please refresh the page.');
      }
    };

    initializeOCR();

    // Cleanup on unmount
    return () => {
      ocrService.cleanup();
    };
  }, []);

  const handleFileUpload = async (file) => {
    setIsProcessing(true);
    setError('');
    setUploadProgress(0);
    setExtractedText('');
    setOcrProgress(null);

    try {
      console.log('Processing file:', file.name, file.type);
      
      if (file.type === 'application/pdf') {
        // Handle PDF files
        console.log('Starting PDF processing...');
        const text = await ocrService.extractTextFromPDF(file, (progress) => {
          console.log('Progress update:', progress);
          setOcrProgress(progress);
          if (progress.stage === 'ocr') {
            setUploadProgress(progress.progress);
          } else if (progress.stage === 'converting') {
            setUploadProgress(Math.round(progress.progress * 0.3)); // PDF conversion is 30% of total
          } else if (progress.stage === 'complete') {
            setUploadProgress(100);
          }
        });
        
        if (!text || text.trim().length === 0) {
          throw new Error('No text could be extracted from this PDF');
        }
        
        setExtractedText(text);
        console.log('PDF processing completed successfully');
        
      } else if (file.type.startsWith('image/')) {
        // Handle image files
        console.log('Starting image processing...');
        const text = await ocrService.extractTextFromImage(file, (progress) => {
          setUploadProgress(progress);
        });
        
        if (!text || text.trim().length === 0) {
          throw new Error('No text could be extracted from this image');
        }
        
        setExtractedText(text);
        console.log('Image processing completed successfully');
        
      } else {
        throw new Error('Please upload a PDF or image file (PNG, JPG, etc.)');
      }
    } catch (error) {
      console.error('File processing error:', error);
      setError(error.message);
      
      // For demo purposes, show sample data if OCR fails
      const sampleText = `Sample Text (OCR Failed)

Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to create oxygen and energy in the form of sugar. This process is essential for life on Earth.

During photosynthesis, plants absorb light energy through chlorophyll in their leaves. This energy is used to convert carbon dioxide from the air and water from the soil into glucose and oxygen.

The chemical equation for photosynthesis is:
6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂

This process not only provides energy for the plant but also produces oxygen as a byproduct, which is released into the atmosphere.

Note: This is sample text shown because OCR processing failed. Error: ${error.message}`;
      
      setExtractedText(sampleText);
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
      setOcrProgress(null);
    }
  };

  const handleTextChange = (newText) => {
    setExtractedText(newText);
  };

  const handlePlayAudio = async () => {
    if (!extractedText.trim()) {
      alert('No text available to convert to speech');
      return;
    }

    try {
      await ttsService.textToSpeech(extractedText);
    } catch (error) {
      // Error generating speech
      setError(`Failed to generate speech: ${error.message}`);
    }
  };

  const handlePauseAudio = () => {
    ttsService.pause();
  };

  const handleResumeAudio = () => {
    ttsService.resume();
  };

  const handleStopAudio = () => {
    ttsService.stop();
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <div className="App">
        <Header />
        
        <Container>
          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1rem',
              color: '#dc2626'
            }}>
              <strong>Notice:</strong> {error}
            </div>
          )}

          <FileUpload
            onFileUpload={handleFileUpload}
            isProcessing={isProcessing}
            uploadProgress={uploadProgress}
            ocrProgress={ocrProgress}
          />

          <TextDisplay
            extractedText={extractedText}
            onTextChange={handleTextChange}
          />

          <AudioControls
            extractedText={extractedText}
            onPlayAudio={handlePlayAudio}
            onPauseAudio={handlePauseAudio}
            onResumeAudio={handleResumeAudio}
            onStopAudio={handleStopAudio}
            ttsService={ttsService}
          />
        </Container>
      </div>
    </ThemeProvider>
  );
}

export default App;