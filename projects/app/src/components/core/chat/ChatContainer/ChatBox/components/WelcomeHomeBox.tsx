import { ChatBoxContext } from '@/components/core/chat/ChatContainer/ChatBox/Provider';
import { getLogoBannerUrl } from '@/pageComponents/chat/constants';
import { Box, Flex, Image } from '@chakra-ui/react';
import { useContextSelector } from 'use-context-selector';
import { useSystemStore } from '@/web/common/system/useSystemStore';

const WelcomeHomeBox = () => {
  const { feConfigs } = useSystemStore();
  const wideLogo = useContextSelector(ChatBoxContext, (v) => v.wideLogo);
  const slogan = useContextSelector(ChatBoxContext, (v) => v.slogan);

  const logoUrl = wideLogo || getLogoBannerUrl(feConfigs?.brand);

  return (
    <Flex flexDir="column" justifyContent="flex-end" alignItems="center" gap={4} h="full">
      <Image alt="fastgpt logo" maxW={['200px', '300px']} src={logoUrl} fallbackSrc={logoUrl} />
      <Box color="myGray.500">{slogan}</Box>
    </Flex>
  );
};

export default WelcomeHomeBox;
