import React from 'react';
import styled from 'styled-components';
import { Card, Text, TextArea, Button, Flex } from './common';
import { FiCopy, FiDownload } from 'react-icons/fi';

const TextContainer = styled.div`
  max-height: 400px;
  overflow-y: auto;
  background: ${({ theme }) => theme.colors.neutral.gray50};
  border: 2px solid ${({ theme }) => theme.colors.neutral.gray200};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  line-height: 1.8;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const PlaceholderText = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.neutral.gray400};
  font-style: italic;
  padding: ${({ theme }) => theme.spacing['2xl']};
`;

const TextDisplay = ({ extractedText, onTextChange }) => {
  const copyToClipboard = async () => {
    if (!extractedText) return;
    
    try {
      await navigator.clipboard.writeText(extractedText);
      // You could add a toast notification here
      alert('Text copied to clipboard!');
    } catch (err) {
      // Failed to copy text - show user-friendly error
      alert('Failed to copy text');
    }
  };

  const downloadText = () => {
    if (!extractedText) return;
    
    const blob = new Blob([extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'extracted-text.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <Flex justify="space-between" align="center" wrap>
        <Text size="xl" weight="semibold" noMargin>
          Extracted Text
        </Text>
        
        {extractedText && (
          <Flex gap="0.5rem" wrap>
            <Button
              variant="outline"
              size="small"
              onClick={copyToClipboard}
              aria-label="Copy text to clipboard"
            >
              <FiCopy size={16} />
              Copy
            </Button>
            <Button
              variant="outline"
              size="small"
              onClick={downloadText}
              aria-label="Download text file"
            >
              <FiDownload size={16} />
              Download
            </Button>
          </Flex>
        )}
      </Flex>

      {extractedText ? (
        <div style={{ marginTop: '1rem' }}>
          <TextContainer>
            {extractedText}
          </TextContainer>
          
          {onTextChange && (
            <div style={{ marginTop: '1rem' }}>
              <Text size="sm" weight="medium" color="gray">
                Edit text before converting to audio:
              </Text>
              <TextArea
                value={extractedText}
                onChange={(e) => onTextChange(e.target.value)}
                placeholder="Edit the extracted text here..."
                style={{ marginTop: '0.5rem', fontFamily: 'inherit' }}
              />
            </div>
          )}
        </div>
      ) : (
        <PlaceholderText>
          📄 Extracted text will appear here after you upload a PDF...
        </PlaceholderText>
      )}
    </Card>
  );
};

export default TextDisplay;