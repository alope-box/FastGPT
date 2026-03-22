import React from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { LoginContainer } from '@/pageComponents/login';
import I18nLngSelector from '@/components/Select/I18nLngSelector';
import { useSystem } from '@fastgpt/web/hooks/useSystem';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { getWebReqUrl } from '@fastgpt/web/common/system/utils';

// Animation keyframes
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.3); }
  50% { box-shadow: 0 0 40px rgba(99, 102, 241, 0.6), 0 0 60px rgba(99, 102, 241, 0.3); }
`;

const particleFloat = keyframes`
  0% { transform: translateY(0px) rotate(0deg); opacity: 0.7; }
  33% { transform: translateY(-20px) rotate(120deg); opacity: 1; }
  66% { transform: translateY(-40px) rotate(240deg); opacity: 0.7; }
  100% { transform: translateY(-60px) rotate(360deg); opacity: 0; }
`;

// Alope Logo Component
const AlopeLogo = () => {
  const { feConfigs } = useSystemStore();
  return (
    <Box position="relative" mb={8} textAlign="center">
    {/* Animated background particles */}
    <Box position="absolute" top="-20px" left="50%" transform="translateX(-50%)">
      {[...Array(6)].map((_, i) => (
        <Box
          key={i}
          position="absolute"
          w="4px"
          h="4px"
          bg="blue.400"
          borderRadius="full"
          animation={`${particleFloat} ${3 + i * 0.5}s ease-in-out infinite`}
          style={{
            left: `${Math.cos(i * 60 * Math.PI / 180) * 40}px`,
            top: `${Math.sin(i * 60 * Math.PI / 180) * 40}px`,
            animationDelay: `${i * 0.3}s`
          }}
        />
      ))}
    </Box>

    {/* Main logo container */}
    <Box
      position="relative"
      display="inline-block"
      animation={`${float} 6s ease-in-out infinite`}
    >
      {/* Outer glow ring */}
      <Box
        position="absolute"
        top="-8px"
        left="-8px"
        right="-8px"
        bottom="-8px"
        borderRadius="full"
        bg="linear-gradient(45deg, #6366f1, #8b5cf6, #06b6d4, #6366f1)"
        opacity={0.3}
        animation={`${glow} 4s ease-in-out infinite`}
        filter="blur(8px)"
      />

      {/* Logo circle */}
      <Box
        w="80px"
        h="80px"
        borderRadius="full"
        bg="linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)"
        border="2px solid"
        borderColor="blue.400"
        display="flex"
        alignItems="center"
        justifyContent="center"
        position="relative"
        mx="auto"
        mb={4}
        boxShadow="0 0 30px rgba(99, 102, 241, 0.4)"
      >
        {/* AI brain icon - simplified geometric design */}
        <Box position="relative">
          {/* Central node */}
          <Box
            w="12px"
            h="12px"
            bg="blue.400"
            borderRadius="full"
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            boxShadow="0 0 10px rgba(99, 102, 241, 0.8)"
          />

          {/* Connecting lines */}
          {[...Array(8)].map((_, i) => (
            <Box
              key={i}
              position="absolute"
              w="20px"
              h="1px"
              bg="linear-gradient(90deg, blue.400, transparent)"
              top="50%"
              left="50%"
              transformOrigin="left center"
              transform={`translateY(-50%) rotate(${i * 45}deg)`}
              opacity={0.7}
            />
          ))}

          {/* Outer nodes */}
          {[...Array(4)].map((_, i) => (
            <Box
              key={i}
              position="absolute"
              w="6px"
              h="6px"
              bg="purple.400"
              borderRadius="full"
              top="50%"
              left="50%"
              transform={`translate(-50%, -50%) rotate(${i * 90}deg) translateX(18px)`}
              boxShadow="0 0 6px rgba(139, 92, 246, 0.6)"
              animation={`${float} ${2 + i * 0.5}s ease-in-out infinite`}
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </Box>
      </Box>

      {/* Brand text */}
      <Text
        fontSize="2xl"
        fontWeight="bold"
        bg="linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)"
        bgClip="text"
        textAlign="center"
        letterSpacing="wide"
      >
        {feConfigs?.systemTitle?.toUpperCase() || 'ALOPE'}
      </Text>
      <Text fontSize="sm" color="gray.500" textAlign="center" mt={1} fontWeight="medium">
        {feConfigs?.systemTitle ? `${feConfigs.systemTitle} AI-Powered Intelligence` : 'AI-Powered Intelligence'}
      </Text>
    </Box>
  </Box>
  );
};

type LoginModalProps = {
  onSuccess?: () => void;
};

const LoginModal = ({ onSuccess }: LoginModalProps) => {
  const { isPc } = useSystem();
  const { feConfigs } = useSystemStore();

  return (
    <Flex
      alignItems={'center'}
      justifyContent={'center'}
      bg={['white', 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)']}
      backgroundSize={['cover', 'cover']}
      userSelect={'none'}
      h={'100%'}
      position="relative"
      overflow="hidden"
    >
      {/* Animated background elements */}
      <Box position="absolute" top="0" left="0" right="0" bottom="0" overflow="hidden">
        {/* Floating geometric shapes */}
        {[...Array(8)].map((_, i) => (
          <Box
            key={i}
            position="absolute"
            w={`${20 + i * 10}px`}
            h={`${20 + i * 10}px`}
            bg={`rgba(${99 + i * 10}, ${102 + i * 5}, ${241 - i * 10}, 0.1)`}
            borderRadius={i % 2 === 0 ? 'full' : '8px'}
            animation={`${float} ${8 + i * 2}s ease-in-out infinite`}
            style={{
              left: `${10 + i * 12}%`,
              top: `${20 + i * 8}%`,
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}

        {/* Grid pattern overlay */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          opacity={0.05}
          bgImage="radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)"
          bgSize="20px 20px"
        />
      </Box>

      {/* Language selector - login page */}
      {isPc && (
        <Box position="absolute" top="24px" right="24px" zIndex={10}>
          <I18nLngSelector />
        </Box>
      )}

      <Flex
        flexDirection={'column'}
        w={['100%', '560px']}
        h={['100%', '720px']}
        bg={['linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', 'rgba(15, 23, 42, 0.95)']}
        backgroundSize={'cover'}
        px={['8', '90px']}
        py={['38px', '60px']}
        borderRadius={[0, '20px']}
        boxShadow={[
          '',
          '0px 32px 64px -12px rgba(0, 0, 0, 0.4), 0px 0px 1px 0px rgba(99, 102, 241, 0.2)'
        ]}
        position="relative"
        backdropFilter="blur(20px)"
        border={['none', '1px solid rgba(99, 102, 241, 0.2)']}
      >
        {/* Alope Logo */}
        <AlopeLogo />

        <LoginContainer onSuccess={onSuccess} />
      </Flex>
    </Flex>
  );
};

export default LoginModal;
