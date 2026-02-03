import { Box, Flex } from '@chakra-ui/react';
import { useSystem } from '@fastgpt/web/hooks/useSystem';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';
import { AppTemplateTypeEnum, AppTypeEnum } from '@fastgpt/global/core/app/constants';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { useRouter } from 'next/router';
import MyIcon from '@fastgpt/web/components/common/Icon';
import MyBox from '@fastgpt/web/components/common/MyBox';
import { navbarWidth } from '@/components/Layout';
import Avatar from '@fastgpt/web/components/common/Avatar';
import { useRequest2 } from '@fastgpt/web/hooks/useRequest';
import { getTemplateMarketItemList, getTemplateTagList } from '@/web/core/app/api/template';
import {
  type AppTemplateSchemaType,
  type TemplateTypeSchemaType
} from '@fastgpt/global/core/app/type';
import { getPluginGroups } from '@/web/core/app/api/plugin';
import { type PluginGroupSchemaType } from '@fastgpt/service/core/app/plugin/type';

export enum TabEnum {
  apps = 'apps',
  app_templates = 'templateMarket',
  mcp_server = 'mcpServer',
  evaluation = 'evaluation'
}
type TabEnumType = `${keyof typeof TabEnum}` | string;

const DashboardContainer = ({
  children
}: {
  children: (e: {
    templateTags: TemplateTypeSchemaType[];
    templateList: AppTemplateSchemaType[];
    pluginGroups: PluginGroupSchemaType[];
    MenuIcon: JSX.Element;
  }) => React.ReactNode;
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { isPc } = useSystem();
  const { feConfigs } = useSystemStore();

  // First tab
  const currentTab = useMemo(() => {
    const path = router.asPath.split('?')[0]; // 移除查询参数
    const segments = path.split('/').filter(Boolean); // 过滤空字符串

    return (segments.pop() as TabEnumType) || TabEnum.apps;
  }, [router.asPath]);

  // Sub tab
  const { type: currentType, appType } = router.query as {
    type: string;
    appType?: AppTypeEnum | 'all';
  };

  // Template market
  const { data: templateTags = [], loading: isLoadingTemplatesTags } = useRequest2(
    () =>
      currentTab === TabEnum.app_templates
        ? getTemplateTagList().then((res) => [
            {
              typeId: AppTemplateTypeEnum.recommendation,
              typeName: t('app:templateMarket.templateTags.Recommendation'),
              typeOrder: 0
            },
            ...res
          ])
        : Promise.resolve([]),
    {
      manual: false,
      refreshDeps: [currentTab]
    }
  );
  const { data: templateList = [], loading: isLoadingTemplates } = useRequest2(
    () =>
      currentTab === TabEnum.app_templates
        ? getTemplateMarketItemList({ type: appType })
        : Promise.resolve([]),
    {
      manual: false,
      refreshDeps: [currentTab, appType]
    }
  );

  // System tools
  const { data: pluginGroups = [], loading: isLoadingToolGroups } = useRequest2(
    () =>
      getPluginGroups().then((res) =>
        res.map((item) => ({
          ...item,
          groupTypes: [
            {
              typeId: 'all',
              typeName: t('app:type.All')
            },
            ...item.groupTypes
          ]
        }))
      ),
    {
      manual: false
    }
  );

  const groupList = useMemo<
    {
      groupId: string;
      groupAvatar: string;
      groupName: string;
      children: {
        typeId: string;
        typeName: string;
        isActive?: boolean;
        onClick?: () => void;
      }[];
    }[]
  >(() => {
    return [
      {
        groupId: TabEnum.apps,
        groupAvatar: 'common/app',
        groupName: t('common:core.module.template.Team app'),
        children: [
          {
            isActive: !currentType,
            typeId: 'all',
            typeName: t('app:type.All')
          },
          {
            typeId: AppTypeEnum.simple,
            typeName: t('app:type.Simple bot')
          },
          {
            typeId: AppTypeEnum.workflow,
            typeName: t('app:type.Workflow bot')
          },
          {
            typeId: AppTypeEnum.plugin,
            typeName: t('app:type.Plugin')
          }
        ]
      },
      ...pluginGroups.map((group) => ({
        groupId: group.groupId,
        groupAvatar: group.groupAvatar,
        groupName: t(group.groupName as any),
        children: group.groupTypes.map((type, index) => ({
          typeId: type.typeId,
          typeName: t(type.typeName as any),
          isActive: index === 0 && !currentType
        }))
      })),
      {
        groupId: TabEnum.app_templates,
        groupAvatar: 'common/templateMarket',
        groupName: t('common:template_market'),
        children: [
          ...templateTags
            .map((tag) => {
              const templates = templateList.filter((template) =>
                template.tags.includes(tag.typeId)
              );
              return {
                ...tag,
                templates
              };
            })
            .filter((tag) => tag.templates.length > 0)
            .map((tag, index) => ({
              typeId: tag.typeId,
              typeName: t(tag.typeName as any),
              isActive: index === 0 && !currentType
            }))
        ]
      },
      {
        groupId: TabEnum.mcp_server,
        groupAvatar: 'mcp',
        groupName: t('common:mcp_server'),
        children: []
      },
      ...(feConfigs?.isPlus
        ? [
            {
              groupId: TabEnum.evaluation,
              groupAvatar: 'kbTest',
              groupName: t('common:app_evaluation'),
              children: []
            }
          ]
        : [])
    ];
  }, [
    currentType,
    feConfigs.appTemplateCourse,
    feConfigs?.isPlus,
    pluginGroups,
    t,
    templateList,
    templateTags
  ]);

  const MenuIcon = useMemo(
    () => (
      <Flex alignItems={'center'}>
        <MyIcon name="menu" w={'1.25rem'} />
      </Flex>
    ),
    []
  );

  const isLoading = isLoadingTemplatesTags || isLoadingTemplates || isLoadingToolGroups;

  return (
    <Box h={'100%'}>
      {/* Top navigation bar */}
      <Box
        position={'sticky'}
        top={0}
        bg={'white'}
        borderBottom={'1px solid'}
        borderColor={'myGray.200'}
        zIndex={100}
        px={4}
        py={3}
        boxShadow={'sm'}
      >
        <Flex gap={6} alignItems={'flex-start'} overflowX={'auto'} pb={1}>
          {groupList.map((group) => {
            const selected = currentTab === group.groupId;

            return (
              <Box key={group.groupId} minW={'fit-content'}>
                <Flex
                  alignItems={'center'}
                  px={3}
                  py={2}
                  rounded={'md'}
                  cursor={'pointer'}
                  fontSize={'sm'}
                  fontWeight={'medium'}
                  color={selected ? 'primary.600' : 'myGray.700'}
                  bg={selected ? 'primary.50' : 'transparent'}
                  _hover={{
                    bg: selected ? 'primary.50' : 'myGray.50'
                  }}
                  onClick={() => {
                    router.push(`/dashboard/${group.groupId}`);
                  }}
                  minW={'fit-content'}
                  whiteSpace={'nowrap'}
                >
                  <Avatar src={group.groupAvatar} w={'1rem'} mr={2} />
                  <Box>{group.groupName}</Box>
                </Flex>

                {/* Sub items for selected group */}
                {selected && group.children.length > 0 && (
                  <Flex mt={2} gap={3} ml={6} flexWrap={'wrap'}>
                    {group.children.map((child) => {
                      const isActive = child.isActive || child.typeId === currentType;

                      return (
                        <Box
                          key={child.typeId}
                          px={2}
                          py={1}
                          rounded={'md'}
                          cursor={'pointer'}
                          fontSize={'xs'}
                          fontWeight={500}
                          color={isActive ? 'primary.600' : 'myGray.500'}
                          bg={isActive ? 'primary.50' : 'transparent'}
                          _hover={{
                            bg: isActive ? 'primary.50' : 'myGray.50'
                          }}
                          onClick={() => {
                            if (child.onClick) {
                              child.onClick();
                            } else {
                              router.push({
                                query: {
                                  ...router.query,
                                  type: child.typeId
                                }
                              });
                            }
                          }}
                          minW={'fit-content'}
                          whiteSpace={'nowrap'}
                        >
                          {child.typeName}
                        </Box>
                      );
                    })}
                  </Flex>
                )}
              </Box>
            );
          })}
        </Flex>
      </Box>

      {/* Main content area */}
      <Box h={'calc(100% - 80px)'} overflow={'auto'} position={'relative'}>
        {children({
          templateTags,
          templateList,
          pluginGroups,
          MenuIcon
        })}
      </Box>
    </Box>
  );
};

export default DashboardContainer;
