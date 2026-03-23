import { AppTypeEnum } from '@fastgpt/global/core/app/constants';
import { LOGO_ICON } from '@fastgpt/global/common/system/constants';
import { type InitChatResponse } from './api';

export const defaultChatData: InitChatResponse = {
  chatId: '',
  appId: '',
  app: {
    name: 'Loading',
    avatar: LOGO_ICON,
    intro: '',
    canUse: false,
    type: AppTypeEnum.simple,
    pluginInputs: [],
    chatConfig: {
      fileSelectConfig: {
        canSelectFile: true,
        canSelectImg: false,
        maxFiles: 10
      }
    }
  },
  title: '',
  variables: {}
};

export enum GetChatTypeEnum {
  normal = 'normal',
  outLink = 'outLink',
  team = 'team',
  home = 'home'
}
