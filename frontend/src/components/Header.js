import React from 'react';
import styled from 'styled-components';
import { Container, Heading, Text } from './common';

const HeaderWrapper = styled.header`
  text-align: center;
  color: ${({ theme }) => theme.colors.neutral.white};
  padding: ${({ theme }) => theme.spacing['3xl']} 0;
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
`;

const Subtitle = styled(Text)`
  opacity: 0.9;
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const Header = () => {
  return (
    <HeaderWrapper>
      <Container>
        <Heading level={1} color="white" align="center" noMargin>
          📚 Vision+ 
        </Heading>
        <Subtitle size="xl" color="white" align="center" noMargin>
          Upload textbooks, signs, or other text and let AI read it to you
        </Subtitle>
      </Container>
    </HeaderWrapper>
  );
};

export default Header;