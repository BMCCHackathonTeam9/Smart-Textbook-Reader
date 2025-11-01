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
      let errorMessage = error.message;
      let showPdfHint = false;
      
      // Check if it's a PDF processing error
      if (file.type === 'application/pdf') {
        showPdfHint = true;
        if (error.message.includes('corrupted') || error.message.includes('unsupported features')) {
          errorMessage = `This PDF couldn't be processed directly. This can happen with:
• Password-protected PDFs
• Scanned PDFs without text layer
• Complex layouts or special formatting
• Older PDF versions

💡 Try these alternatives:
1. Take screenshots of each page and upload them as images
2. Use a different PDF viewer to export/print as images
3. Try a simpler PDF if available`;
        }
      }
      
      setError(errorMessage);
      
      // For demo purposes, show comprehensive sample data if OCR fails
      const sampleText = `Smart Textbook Reader - Sample Content
${showPdfHint ? '(Original PDF processing failed - showing sample textbook content)' : '(OCR processing failed - showing sample content)'}

Chapter 1: Introduction to Photosynthesis

Photosynthesis is the biological process by which plants, algae, and certain bacteria convert light energy, usually from the sun, into chemical energy stored in glucose molecules. This process is fundamental to life on Earth as it provides energy for most living organisms and produces oxygen as a byproduct.

Key Components of Photosynthesis:

1. Chlorophyll: The green pigment in plants that captures light energy
2. Carbon Dioxide (CO₂): Absorbed from the atmosphere through stomata
3. Water (H₂O): Absorbed through the plant's root system
4. Sunlight: The energy source that drives the reaction

The Chemical Equation:
6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂

This equation shows that six molecules of carbon dioxide plus six molecules of water, in the presence of light energy, produce one molecule of glucose and six molecules of oxygen.

Types of Photosynthesis:

• Light-dependent reactions (Photo reactions): Occur in the thylakoids
• Light-independent reactions (Calvin Cycle): Occur in the stroma

Environmental Factors Affecting Photosynthesis:
- Light intensity and quality
- Temperature
- Carbon dioxide concentration  
- Water availability

Applications:
Understanding photosynthesis is crucial for agriculture, environmental science, and renewable energy research. Scientists study this process to improve crop yields and develop artificial photosynthesis systems.

${showPdfHint ? '\n⚠️ Note: To process your actual PDF, please try the suggested alternatives above.' : ''}

Error details: ${error.message}`;
      
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