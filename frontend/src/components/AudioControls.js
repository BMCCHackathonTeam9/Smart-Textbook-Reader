import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPlay, FiPause, FiDownload, FiVolume2, FiSkipBack, FiSkipForward } from 'react-icons/fi';
import { Card, Button, Text, Flex, LoadingSpinner } from './common';

const AudioPlayerWrapper = styled.div`
  background: ${({ theme }) => theme.colors.neutral.gray50};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const ProgressContainer = styled.div`
  margin: ${({ theme }) => theme.spacing.lg} 0;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${({ theme }) => theme.colors.neutral.gray200};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  cursor: pointer;
  position: relative;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${({ theme }) => theme.colors.primary.gradient};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  transition: width 0.1s ease;
  width: ${({ progress }) => progress}%;
`;

const ProgressThumb = styled.div`
  position: absolute;
  top: 50%;
  left: ${({ progress }) => progress}%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  background: ${({ theme }) => theme.colors.neutral.white};
  border: 3px solid ${({ theme }) => theme.colors.primary.main};
  border-radius: 50%;
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  transition: opacity 0.2s ease;
`;

const TimeDisplay = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.neutral.gray500};
`;

const VolumeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const VolumeSlider = styled.input`
  flex: 1;
  max-width: 100px;
  height: 4px;
  background: ${({ theme }) => theme.colors.neutral.gray200};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  outline: none;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    background: ${({ theme }) => theme.colors.primary.main};
    border-radius: 50%;
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: ${({ theme }) => theme.colors.primary.main};
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }
`;

const AudioControls = ({ extractedText, onPlayAudio, onPauseAudio, onResumeAudio, onStopAudio, ttsService }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const checkSpeechStatus = () => {
      if (ttsService) {
        setIsPlaying(ttsService.isPlaying && !ttsService.isPaused);
        setIsPaused(ttsService.isPaused);
      }
    };

    const interval = setInterval(checkSpeechStatus, 100);
    return () => clearInterval(interval);
  }, [ttsService]);

  const handlePlay = async () => {
    if (isPaused) {
      onResumeAudio();
    } else {
      await onPlayAudio();
    }
  };

  const handlePause = () => {
    onPauseAudio();
  };

  const handleStop = () => {
    onStopAudio();
    setIsPlaying(false);
    setIsPaused(false);
  };

  return (
    <Card>
      <Flex justify="space-between" align="center" wrap>
        <Text size="xl" weight="semibold" noMargin>
          🔊 Audio Playback
        </Text>
      </Flex>

      {extractedText ? (
        <AudioPlayerWrapper>
          {/* Main Controls */}
          <Flex justify="center" align="center" gap="1rem">
            <Button
              onClick={handlePlay}
              disabled={!extractedText}
              aria-label={isPaused ? 'Resume' : isPlaying ? 'Playing...' : 'Play'}
            >
              {isPlaying ? <FiPause size={20} /> : <FiPlay size={20} />}
              {isPaused ? 'Resume' : isPlaying ? 'Playing...' : 'Play'}
            </Button>
            
            <Button
              variant="outline"
              size="small"
              onClick={handlePause}
              disabled={!isPlaying || isPaused}
              aria-label="Pause"
            >
              <FiPause size={18} />
              Pause
            </Button>
            
            <Button
              variant="outline"
              size="small"
              onClick={handleStop}
              disabled={!isPlaying && !isPaused}
              aria-label="Stop"
            >
              <FiSkipBack size={18} />
              Stop
            </Button>
          </Flex>

          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <Text size="sm" color="gray">
              Using Web Speech API - No download available
            </Text>
            <Text size="xs" color="gray" style={{ marginTop: '0.5rem' }}>
              Speech will play through your browser's built-in text-to-speech
            </Text>
          </div>
        </AudioPlayerWrapper>
      ) : (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
          🎵 Upload a file to enable audio playback
        </div>
      )}
    </Card>
  );
};

export default AudioControls;