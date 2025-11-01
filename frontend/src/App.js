import React, { useState, useEffect } from 'react';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import { GlobalStyles } from './styles/GlobalStyles';
import { Container } from './components/common';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import TextDisplay from './components/TextDisplay';
import AudioControls from './components/AudioControls';
import { textbookAPI } from './services/api';

function App() {
  const [extractedText, setExtractedText] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  // Check backend health on component mount
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        await textbookAPI.healthCheck();
        // Backend is healthy - no action needed
      } catch (error) {
        // Backend health check failed
        setError('Backend service is not available. Please ensure the Python server is running.');
      }
    };

    checkBackendHealth();
  }, []);

  const handleFileUpload = async (file) => {
    setIsProcessing(true);
    setError('');
    setUploadProgress(0);
    setExtractedText('');
    setAudioUrl('');

    try {
      const result = await textbookAPI.processPDF(file, (progress) => {
        setUploadProgress(progress);
      });

      if (result.success) {
        setExtractedText(result.text);
        if (result.audioUrl) {
          setAudioUrl(result.audioUrl);
        }
      } else {
        throw new Error(result.error || 'Failed to process PDF');
      }
    } catch (error) {
      // Error processing PDF - handled by setting error state
      setError(error.message);
      
      // For demo purposes, show sample data if backend is not available
      if (error.message.includes('Backend service') || error.message.includes('Network Error')) {
        const sampleText = `Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to create oxygen and energy in the form of sugar. This process is essential for life on Earth.

During photosynthesis, plants absorb light energy through chlorophyll in their leaves. This energy is used to convert carbon dioxide from the air and water from the soil into glucose and oxygen.

The chemical equation for photosynthesis is:
6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂

This process not only provides energy for the plant but also produces oxygen as a byproduct, which is released into the atmosphere. This oxygen is crucial for the survival of most life forms on Earth, including humans and animals.

Photosynthesis occurs in two main stages:
1. Light-dependent reactions (photo reactions)
2. Light-independent reactions (Calvin cycle)

The efficiency of photosynthesis can be affected by various factors including light intensity, carbon dioxide concentration, temperature, and water availability.`;
        
        setExtractedText(sampleText);
        setError('Using sample data - backend not available');
      }
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  const handleTextChange = (newText) => {
    setExtractedText(newText);
    // Clear audio URL when text changes so user needs to regenerate
    setAudioUrl('');
  };

  const handleGenerateAudio = async () => {
    if (!extractedText.trim()) {
      alert('No text available to convert to audio');
      return;
    }

    setIsGeneratingAudio(true);
    setError('');

    try {
      const result = await textbookAPI.textToSpeech(extractedText);
      
      if (result.success && result.audioUrl) {
        setAudioUrl(result.audioUrl);
      } else {
        throw new Error(result.error || 'Failed to generate audio');
      }
    } catch (error) {
      // Error generating audio - handled by setting error state
      setError(`Failed to generate audio: ${error.message}`);
    } finally {
      setIsGeneratingAudio(false);
    }
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
          />

          <TextDisplay
            extractedText={extractedText}
            onTextChange={handleTextChange}
          />

          <AudioControls
            audioUrl={audioUrl}
            isGenerating={isGeneratingAudio}
            onGenerateAudio={handleGenerateAudio}
            extractedText={extractedText}
          />
        </Container>
      </div>
    </ThemeProvider>
  );
}

export default App;