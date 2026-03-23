import type { NextApiResponse } from 'next';
import { MongoChat } from '@fastgpt/service/core/chat/chatSchema';
import { MongoChatItem } from '@fastgpt/service/core/chat/chatItemSchema';
import { type ClearHistoriesProps } from '@/global/core/chat/api';
import { ChatSourceEnum } from '@fastgpt/global/core/chat/constants';
import { NextAPI } from '@/service/middleware/entry';
import { deleteChatFiles } from '@fastgpt/service/core/chat/controller';
import { mongoSessionRun } from '@fastgpt/service/common/mongo/sessionRun';
import { type ApiRequestProps } from '@fastgpt/service/type/next';
import { authChatCrud } from '@/service/support/permission/auth/chat';

/* clear chat history */
async function handler(req: ApiRequestProps<{}, ClearHistoriesProps>, res: NextApiResponse) {
  const { appId, shareId, outLinkUid, teamId, teamToken } = req.query;

  const {
    teamId: chatTeamId,
    tmbId,
    uid,
    authType
  } = await authChatCrud({
    req,
    authToken: true,
    authApiKey: true,
    ...req.query
  });

  const authenticatedAppId = appId || chatTeamId;

  const match = await (async () => {
    if (shareId && outLinkUid && authType === 'outLink') {
      return {
        teamId: chatTeamId,
        appId: authenticatedAppId,
        outLinkUid: uid
      };
    }
    if (teamId && teamToken && authType === 'teamDomain') {
      return {
        teamId: chatTeamId,
        appId: authenticatedAppId,
        outLinkUid: uid
      };
    }
    if (authType === 'token') {
      return {
        teamId: chatTeamId,
        tmbId,
        appId: authenticatedAppId,
        source: ChatSourceEnum.online
      };
    }
    if (authType === 'apikey') {
      return {
        teamId: chatTeamId,
        appId: authenticatedAppId,
        source: ChatSourceEnum.api
      };
    }

    return Promise.reject('Param are error');
  })();

  // find chatIds
  const list = await MongoChat.find(match, 'chatId').lean();
  const idList = list.map((item) => item.chatId);

  await deleteChatFiles({ chatIdList: idList });

  return mongoSessionRun(async (session) => {
    await MongoChatItem.deleteMany(
      {
        appId: authenticatedAppId,
        chatId: { $in: idList }
      },
      { session }
    );
    await MongoChat.deleteMany(
      {
        appId: authenticatedAppId,
        chatId: { $in: idList }
      },
      { session }
    );
  });
}

export default NextAPI(handler);
