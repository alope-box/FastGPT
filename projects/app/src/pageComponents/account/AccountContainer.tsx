import React, { useCallback, useMemo, useRef } from 'react';
import { Box, Flex, useTheme } from '@chakra-ui/react';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { useRouter } from 'next/router';
import { useUserStore } from '@/web/support/user/useUserStore';
import { useConfirm } from '@fastgpt/web/hooks/useConfirm';
import PageContainer from '@/components/PageContainer';
import SideTabs from '@/components/SideTabs';
import LightRowTabs from '@fastgpt/web/components/common/Tabs/LightRowTabs';
import { useTranslation } from 'next-i18next';
import { useSystem } from '@fastgpt/web/hooks/useSystem';

export enum TabEnum {
  'info' = 'info',
  'promotion' = 'promotion',
  'usage' = 'usage',
  'bill' = 'bill',
  'inform' = 'inform',
  'setting' = 'setting',
  'thirdParty' = 'thirdParty',
  'individuation' = 'individuation',
  'apikey' = 'apikey',
  'loginout' = 'loginout',
  'team' = 'team',
  'model' = 'model'
}

const AccountContainer = ({
  children,
  isLoading
}: {
  children: React.ReactNode;
  isLoading?: boolean;
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { userInfo, setUserInfo } = useUserStore();
  const { feConfigs, systemVersion } = useSystemStore();
  const router = useRouter();
  const { isPc } = useSystem();

  const currentTab = useMemo(() => {
    return router.pathname.split('/').pop() as TabEnum;
  }, [router.pathname]);

  const tabList = useRef([
    {
      icon: 'support/user/userLight',
      label: t('account:personal_information'),
      value: TabEnum.info
    },
    ...(feConfigs?.isPlus
      ? [
          {
            icon: 'support/user/usersLight',
            label: t('account:team'),
            value: TabEnum.team
          },
          {
            icon: 'support/usage/usageRecordLight',
            label: t('account:usage_records'),
            value: TabEnum.usage
          }
        ]
      : []),
    ...(feConfigs?.show_pay && userInfo?.team?.permission.hasManagePer
      ? [
          {
            icon: 'support/bill/payRecordLight',
            label: t('account:bills_and_invoices'),
            value: TabEnum.bill
          }
        ]
      : []),
    {
      icon: 'common/thirdParty',
      label: t('account:third_party'),
      value: TabEnum.thirdParty
    },
    {
      icon: 'common/model',
      label: t('account:model_provider'),
      value: TabEnum.model
    },
    ...(feConfigs?.show_promotion && userInfo?.team?.permission.isOwner
      ? [
          {
            icon: 'support/account/promotionLight',
            label: t('account:promotion_records'),
            value: TabEnum.promotion
          }
        ]
      : []),
    ...(userInfo?.team?.permission.hasApikeyCreatePer
      ? [
          {
            icon: 'key',
            label: t('account:api_key'),
            value: TabEnum.apikey
          }
        ]
      : []),

    ...(feConfigs.isPlus
      ? [
          {
            icon: 'support/user/informLight',
            label: t('account:notifications'),
            value: TabEnum.inform
          }
        ]
      : []),
    {
      icon: 'common/settingLight',
      label: t('common:Setting'),
      value: TabEnum.setting
    },
    {
      icon: 'support/account/loginoutLight',
      label: t('account:logout'),
      value: TabEnum.loginout
    }
  ]);

  const { openConfirm, ConfirmModal } = useConfirm({
    content: t('account:confirm_logout')
  });

  const setCurrentTab = useCallback(
    (tab: string) => {
      if (tab === TabEnum.loginout) {
        openConfirm(() => {
          setUserInfo(null);
          router.replace('/login');
        })();
      } else {
        router.replace('/account/' + tab);
      }
    },
    [openConfirm, router, setUserInfo]
  );

  return (
    <PageContainer isLoading={isLoading}>
      {/* 顶部标签页 */}
      <Box mb={4} borderBottom={'1px solid'} borderColor={'myGray.200'}>
        <LightRowTabs<TabEnum>
          m={'auto'}
          w={'100%'}
          size={'md'}
          list={tabList.current.map((item) => ({
            value: item.value,
            label: item.label,
            icon: item.icon
          }))}
          value={currentTab}
          onChange={setCurrentTab}
        />
      </Box>

      {/* 主内容区域 */}
      <Box h={'calc(100% - 60px)'} overflow={'auto'} pb={[4, 0]}>
        {children}
      </Box>

      {/* 版本信息 */}
      {isPc && (
        <Flex
          position={'fixed'}
          bottom={4}
          left={4}
          alignItems={'center'}
          bg={'white'}
          px={3}
          py={2}
          borderRadius={'md'}
          boxShadow={'sm'}
          border={'1px solid'}
          borderColor={'myGray.200'}
        >
          <Box w={'8px'} h={'8px'} borderRadius={'50%'} bg={'#67c13b'} />
          <Box fontSize={'sm'} ml={2}>
            V{systemVersion}
          </Box>
        </Flex>
      )}

      <ConfirmModal />
    </PageContainer>
  );
};

export default AccountContainer;
