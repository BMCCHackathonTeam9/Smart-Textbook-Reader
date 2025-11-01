import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPlay, FiPause, FiSkipBack } from 'react-icons/fi';
import { Card, Button, Text, Flex } from './common';

const AudioPlayerWrapper = styled.div`
  background: ${({ theme }) => theme.colors.neutral.gray50};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-top: ${({ theme }) => theme.spacing.lg};
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