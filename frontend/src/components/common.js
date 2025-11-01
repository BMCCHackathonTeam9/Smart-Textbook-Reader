import styled from 'styled-components';

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

export const Card = styled.div`
  background: ${({ theme }) => theme.colors.neutral.white};
  border-radius: ${({ theme }) => theme.borderRadius['2xl']};
  padding: ${({ theme }) => theme.spacing['2xl']};
  box-shadow: ${({ theme }) => theme.shadows['2xl']};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing.lg};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }
`;

export const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.xl}`};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  min-height: 44px;
  min-width: 120px;

  ${({ variant, theme }) => {
    switch (variant) {
      case 'secondary':
        return `
          background: ${theme.colors.neutral.white};
          color: ${theme.colors.primary.main};
          border: 2px solid ${theme.colors.primary.main};

          &:hover:not(:disabled) {
            background: ${theme.colors.primary.main};
            color: ${theme.colors.neutral.white};
            transform: translateY(-2px);
            box-shadow: ${theme.shadows.lg};
          }
        `;
      case 'outline':
        return `
          background: transparent;
          color: ${theme.colors.neutral.gray600};
          border: 2px solid ${theme.colors.neutral.gray300};

          &:hover:not(:disabled) {
            border-color: ${theme.colors.primary.main};
            color: ${theme.colors.primary.main};
          }
        `;
      default: // primary
        return `
          background: ${theme.colors.primary.gradient};
          color: ${theme.colors.neutral.white};
          border: none;

          &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
          }
        `;
    }
  }}

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  ${({ size, theme }) => {
    switch (size) {
      case 'small':
        return `
          padding: ${theme.spacing.sm} ${theme.spacing.lg};
          font-size: ${theme.typography.fontSize.sm};
          min-width: 80px;
          min-height: 36px;
        `;
      case 'large':
        return `
          padding: ${theme.spacing.lg} ${theme.spacing['2xl']};
          font-size: ${theme.typography.fontSize.lg};
          min-width: 160px;
          min-height: 52px;
        `;
      default:
        return '';
    }
  }}

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    width: ${({ fullWidthOnMobile }) => (fullWidthOnMobile ? '100%' : 'auto')};
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.neutral.gray200};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  transition: border-color 0.3s ease;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary.main};
    outline: none;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.neutral.gray400};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.neutral.gray100};
    cursor: not-allowed;
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.neutral.gray200};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  line-height: 1.6;
  resize: vertical;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary.main};
    outline: none;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.neutral.gray400};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.neutral.gray100};
    cursor: not-allowed;
  }
`;

export const Text = styled.p`
  font-size: ${({ size, theme }) => {
    switch (size) {
      case 'xs': return theme.typography.fontSize.xs;
      case 'sm': return theme.typography.fontSize.sm;
      case 'lg': return theme.typography.fontSize.lg;
      case 'xl': return theme.typography.fontSize.xl;
      case '2xl': return theme.typography.fontSize['2xl'];
      case '3xl': return theme.typography.fontSize['3xl'];
      default: return theme.typography.fontSize.base;
    }
  }};
  
  font-weight: ${({ weight, theme }) => {
    switch (weight) {
      case 'light': return theme.typography.fontWeight.light;
      case 'medium': return theme.typography.fontWeight.medium;
      case 'semibold': return theme.typography.fontWeight.semibold;
      case 'bold': return theme.typography.fontWeight.bold;
      default: return theme.typography.fontWeight.normal;
    }
  }};

  color: ${({ color, theme }) => {
    switch (color) {
      case 'primary': return theme.colors.primary.main;
      case 'secondary': return theme.colors.secondary.main;
      case 'gray': return theme.colors.neutral.gray500;
      case 'white': return theme.colors.neutral.white;
      default: return theme.colors.neutral.gray800;
    }
  }};

  text-align: ${({ align }) => align || 'left'};
  margin-bottom: ${({ noMargin }) => (noMargin ? '0' : '1rem')};
  line-height: ${({ tight }) => (tight ? '1.4' : '1.6')};
`;

export const Heading = styled.h1`
  font-size: ${({ level, theme }) => {
    switch (level) {
      case 2: return theme.typography.fontSize['3xl'];
      case 3: return theme.typography.fontSize['2xl'];
      case 4: return theme.typography.fontSize.xl;
      case 5: return theme.typography.fontSize.lg;
      case 6: return theme.typography.fontSize.base;
      default: return theme.typography.fontSize['4xl'];
    }
  }};
  
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ color, theme }) => {
    switch (color) {
      case 'white': return theme.colors.neutral.white;
      case 'primary': return theme.colors.primary.main;
      default: return theme.colors.neutral.gray800;
    }
  }};
  
  text-align: ${({ align }) => align || 'left'};
  margin-bottom: ${({ noMargin }) => (noMargin ? '0' : '1.5rem')};
  line-height: 1.2;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ level, theme }) => {
      switch (level) {
        case 2: return theme.typography.fontSize['2xl'];
        case 3: return theme.typography.fontSize.xl;
        case 4: return theme.typography.fontSize.lg;
        case 5: return theme.typography.fontSize.base;
        case 6: return theme.typography.fontSize.sm;
        default: return theme.typography.fontSize['3xl'];
      }
    }};
  }
`;

export const LoadingSpinner = styled.div`
  width: ${({ size }) => size || '24px'};
  height: ${({ size }) => size || '24px'};
  border: 3px solid ${({ theme }) => theme.colors.neutral.gray200};
  border-top: 3px solid ${({ theme }) => theme.colors.primary.main};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: ${({ centered }) => (centered ? '2rem auto' : '0')};
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: ${({ columns }) => `repeat(${columns || 1}, 1fr)`};
  gap: ${({ gap, theme }) => gap || theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

export const Flex = styled.div`
  display: flex;
  flex-direction: ${({ direction }) => direction || 'row'};
  align-items: ${({ align }) => align || 'stretch'};
  justify-content: ${({ justify }) => justify || 'flex-start'};
  gap: ${({ gap, theme }) => gap || theme.spacing.md};
  flex-wrap: ${({ wrap }) => (wrap ? 'wrap' : 'nowrap')};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: ${({ stackOnMobile }) => (stackOnMobile ? 'column' : 'row')};
  }
`;