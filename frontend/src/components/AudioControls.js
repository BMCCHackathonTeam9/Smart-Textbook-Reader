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

const AudioControls = ({ audioUrl, isGenerating, onGenerateAudio, extractedText }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isHoveringProgress, setIsHoveringProgress] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
    };

    const setAudioTime = () => setCurrentTime(audio.currentTime);

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const skipForward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(audio.currentTime + 10, duration);
  };

  const skipBackward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(audio.currentTime - 10, 0);
  };

  const downloadAudio = () => {
    if (!audioUrl) return;
    
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = 'textbook-audio.mp3';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  return (
    <Card>
      <Flex justify="space-between" align="center" wrap>
        <Text size="xl" weight="semibold" noMargin>
          🔊 Audio Playback
        </Text>
        
        {!audioUrl && !isGenerating && extractedText && (
          <Button onClick={onGenerateAudio} size="small">
            Generate Audio
          </Button>
        )}
      </Flex>

      {isGenerating && (
        <Flex direction="column" align="center" gap="1rem" style={{ margin: '2rem 0' }}>
          <LoadingSpinner size="32px" />
          <Text weight="medium" align="center">
            Generating audio from text...
          </Text>
          <Text size="sm" color="gray" align="center">
            This may take a moment
          </Text>
        </Flex>
      )}

      {audioUrl && (
        <AudioPlayerWrapper>
          <audio ref={audioRef} src={audioUrl} preload="metadata" />
          
          {/* Main Controls */}
          <Flex justify="center" align="center" gap="1rem">
            <Button
              variant="outline"
              size="small"
              onClick={skipBackward}
              disabled={!duration}
              aria-label="Skip backward 10 seconds"
            >
              <FiSkipBack size={18} />
            </Button>
            
            <Button
              onClick={togglePlayPause}
              disabled={!duration}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <FiPause size={20} /> : <FiPlay size={20} />}
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            
            <Button
              variant="outline"
              size="small"
              onClick={skipForward}
              disabled={!duration}
              aria-label="Skip forward 10 seconds"
            >
              <FiSkipForward size={18} />
            </Button>
            
            <Button
              variant="outline"
              size="small"
              onClick={downloadAudio}
              aria-label="Download audio file"
            >
              <FiDownload size={16} />
              Download
            </Button>
          </Flex>

          {/* Progress Bar */}
          <ProgressContainer>
            <ProgressBar
              onClick={handleProgressClick}
              onMouseEnter={() => setIsHoveringProgress(true)}
              onMouseLeave={() => setIsHoveringProgress(false)}
            >
              <ProgressFill progress={progressPercentage} />
              <ProgressThumb
                progress={progressPercentage}
                visible={isHoveringProgress || isPlaying}
              />
            </ProgressBar>
            
            <TimeDisplay>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </TimeDisplay>
          </ProgressContainer>

          {/* Volume Control */}
          <VolumeContainer>
            <FiVolume2 size={18} color="#667eea" />
            <VolumeSlider
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              aria-label="Volume control"
            />
            <Text size="sm" color="gray" noMargin>
              {Math.round(volume * 100)}%
            </Text>
          </VolumeContainer>
        </AudioPlayerWrapper>
      )}

      {!audioUrl && !isGenerating && !extractedText && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
          🎵 Upload a PDF to generate audio playback
        </div>
      )}
    </Card>
  );
};

export default AudioControls;