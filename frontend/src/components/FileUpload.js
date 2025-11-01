import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import styled from 'styled-components';
import { FiUpload, FiFile } from 'react-icons/fi';
import { Card, Button, Text, LoadingSpinner, Flex } from './common';

const DropzoneWrapper = styled.div`
  border: 3px dashed ${({ theme, isDragActive }) => 
    isDragActive ? theme.colors.primary.dark : theme.colors.primary.main};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing['3xl']};
  text-align: center;
  transition: all 0.3s ease;
  background: ${({ theme, isDragActive }) => 
    isDragActive ? theme.colors.primary.light + '10' : theme.colors.neutral.gray50};
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.dark};
    background: ${({ theme }) => theme.colors.primary.light + '10'};
  }
`;

const UploadIcon = styled.div`
  font-size: 3rem;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.primary.main};
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.neutral.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.neutral.gray200};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${({ theme }) => theme.colors.neutral.gray200};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  margin-top: ${({ theme }) => theme.spacing.lg};
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${({ theme }) => theme.colors.primary.gradient};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  transition: width 0.3s ease;
  width: ${({ progress }) => progress}%;
`;

const FileUpload = ({ onFileUpload, isProcessing, uploadProgress }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      onFileUpload(file);
    } else {
      alert('Please upload a PDF file');
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    disabled: isProcessing
  });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <Text size="xl" weight="semibold" align="center">
        Upload Your Textbook
      </Text>
      
      <DropzoneWrapper {...getRootProps()} isDragActive={isDragActive}>
        <input {...getInputProps()} />
        
        {isProcessing ? (
          <Flex direction="column" align="center" gap="1rem">
            <LoadingSpinner size="48px" />
            <Text weight="medium">Processing your PDF...</Text>
            <Text size="sm" color="gray">
              This may take a few minutes for large files
            </Text>
          </Flex>
        ) : (
          <>
            <UploadIcon>
              <FiUpload />
            </UploadIcon>
            
            <Text size="lg" weight="medium" noMargin>
              {isDragActive
                ? 'Drop your PDF here'
                : 'Drop your PDF here or click to browse'
              }
            </Text>
            
            <Text size="sm" color="gray" style={{ marginTop: '0.5rem' }}>
              Supports PDF files up to 50MB
            </Text>
          </>
        )}
      </DropzoneWrapper>

      {selectedFile && !isProcessing && (
        <FileInfo>
          <FiFile size={20} color="#667eea" />
          <div>
            <Text size="sm" weight="medium" noMargin>
              {selectedFile.name}
            </Text>
            <Text size="xs" color="gray" noMargin>
              {formatFileSize(selectedFile.size)}
            </Text>
          </div>
        </FileInfo>
      )}

      {isProcessing && uploadProgress > 0 && (
        <div>
          <Flex justify="space-between" align="center" style={{ marginTop: '1rem' }}>
            <Text size="sm" weight="medium" noMargin>
              Upload Progress
            </Text>
            <Text size="sm" color="primary" noMargin>
              {uploadProgress}%
            </Text>
          </Flex>
          <ProgressBar>
            <ProgressFill progress={uploadProgress} />
          </ProgressBar>
        </div>
      )}
    </Card>
  );
};

export default FileUpload;