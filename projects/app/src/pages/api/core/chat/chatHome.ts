import type { NextApiRequest, NextApiResponse } from 'next';
import { sseErrRes } from '@fastgpt/service/common/response';
import {
  DispatchNodeResponseKeyEnum,
  SseResponseEventEnum
} from '@fastgpt/global/core/workflow/runtime/constants';
import { responseWrite } from '@fastgpt/service/common/response';
import { createChatUsage } from '@fastgpt/service/support/wallet/usage/controller';
import { UsageSourceEnum } from '@fastgpt/global/support/wallet/usage/constants';
import type { AIChatItemType, UserChatItemType } from '@fastgpt/global/core/chat/type';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { dispatchWorkFlow } from '@fastgpt/service/core/workflow/dispatch';
import { getUserChatInfoAndAuthTeamPoints } from '@fastgpt/service/support/permission/auth/team';
import { getRunningUserInfoByTmbId } from '@fastgpt/service/support/user/team/utils';
import type { StoreEdgeItemType } from '@fastgpt/global/core/workflow/type/edge';
import {
  concatHistories,
  getChatTitleFromChatMessage,
  removeEmptyUserInput
} from '@fastgpt/global/core/chat/utils';
import { NextAPI } from '@/service/middleware/entry';
import { chatValue2RuntimePrompt, GPTMessages2Chats } from '@fastgpt/global/core/chat/adapt';
import type { ChatCompletionMessageParam } from '@fastgpt/global/core/ai/type';
import type { AppChatConfigType } from '@fastgpt/global/core/app/type';
import {
  getLastInteractiveValue,
  getMaxHistoryLimitFromNodes,
  getWorkflowEntryNodeIds,
  storeEdges2RuntimeEdges,
  rewriteNodeOutputByHistories,
  storeNodes2RuntimeNodes,
  textAdaptGptResponse
} from '@fastgpt/global/core/workflow/runtime/utils';
import type { StoreNodeItemType } from '@fastgpt/global/core/workflow/type/node';
import { getWorkflowResponseWrite } from '@fastgpt/service/core/workflow/dispatch/utils';
import { WORKFLOW_MAX_RUN_TIMES } from '@fastgpt/service/core/workflow/constants';
import { getChatItems } from '@fastgpt/service/core/chat/controller';
import { MongoChat } from '@fastgpt/service/core/chat/chatSchema';
import { getSystemTime } from '@fastgpt/global/common/time/timezone';
import {
  ChatRoleEnum,
  ChatSourceEnum
} from '@fastgpt/global/core/chat/constants';
import { saveChat, updateInteractiveChat } from '@fastgpt/service/core/chat/saveChat';
import { getLocale } from '@fastgpt/service/common/middle/i18n';
import { MongoApp } from '@fastgpt/service/core/app/schema';

export type Props = {
  messages: ChatCompletionMessageParam[];
  responseChatItemId: string;
  nodes: StoreNodeItemType[];
  edges: StoreEdgeItemType[];
  variables: Record<string, any>;
  appId?: string;
  appName: string;
  chatId: string;
  chatConfig: AppChatConfigType;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  let {
    nodes = [],
    edges = [],
    messages = [],
    responseChatItemId,
    variables = {},
    appName,
    appId,
    chatConfig,
    chatId
  } = req.body as Props;
  try {
    if (!Array.isArray(nodes) || nodes.length === 0) {
      throw new Error('Nodes is empty');
    }
    const chatMessages = GPTMessages2Chats(messages);

    /* user auth */
    const { teamId, tmbId } = await authCert({
      req,
      authToken: true
    });

    // If appId is provided, we can fetch real app info, otherwise we use a virtual one
    const app = await (async () => {
      if (appId) {
        const app = await MongoApp.findById(appId).lean();
        if (!app) {
          throw new Error('App not found');
        }
        return app;
      }
      return {
        _id: teamId, // dummy id
        name: appName || 'Home Chat',
        teamId,
        tmbId,
        version: 'v2'
      } as any;
    })();

    const userQuestion: UserChatItemType = (() => {
      const latestHumanChat = chatMessages.pop() as UserChatItemType;
      if (!latestHumanChat) {
        throw new Error('User question is empty');
      }
      return latestHumanChat;
    })();

    const limit = getMaxHistoryLimitFromNodes(nodes);
    const [{ histories }, chatDetail, { timezone, externalProvider }] = await Promise.all([
      getChatItems({
        appId: appId || String(app._id),
        chatId,
        offset: 0,
        limit,
        field: `dataId obj value memories`
      }),
      MongoChat.findOne({ appId: appId || String(app._id), chatId }, 'source variableList variables'),
      getUserChatInfoAndAuthTeamPoints(tmbId)
    ]);

    if (chatDetail?.variables) {
      variables = {
        ...chatDetail.variables,
        ...variables
      };
    }

    const newHistories = concatHistories(histories, chatMessages);
    const interactive = getLastInteractiveValue(newHistories) || undefined;
    
    // Get runtimeNodes
    let runtimeNodes = storeNodes2RuntimeNodes(nodes, getWorkflowEntryNodeIds(nodes, interactive));
    runtimeNodes = rewriteNodeOutputByHistories(runtimeNodes, interactive);

    const workflowResponseWrite = getWorkflowResponseWrite({
      res,
      detail: true,
      streamResponse: true,
      id: chatId,
      showNodeStatus: true
    });

    /* start process */
    const {
      flowResponses,
      assistantResponses,
      system_memories,
      newVariables,
      flowUsages,
      durationSeconds
    } = await dispatchWorkFlow({
      res,
      lang: getLocale(req),
      requestOrigin: req.headers.origin,
      mode: 'chat',
      timezone,
      externalProvider,
      uid: tmbId,

      runningAppInfo: {
        id: appId || String(app._id),
        teamId: String(app.teamId),
        tmbId: String(app.tmbId)
      },
      runningUserInfo: await getRunningUserInfoByTmbId(tmbId),

      chatId,
      responseChatItemId,
      runtimeNodes,
      runtimeEdges: storeEdges2RuntimeEdges(edges, interactive),
      variables,
      query: removeEmptyUserInput(userQuestion.value),
      lastInteractive: interactive,
      chatConfig,
      histories: newHistories,
      stream: true,
      maxRunTimes: WORKFLOW_MAX_RUN_TIMES,
      workflowStreamResponse: workflowResponseWrite,
      version: 'v2',
      responseDetail: true
    });

    workflowResponseWrite({
      event: SseResponseEventEnum.answer,
      data: textAdaptGptResponse({
        text: null,
        finish_reason: 'stop'
      })
    });
    responseWrite({
      res,
      event: SseResponseEventEnum.answer,
      data: '[DONE]'
    });

    // save chat
    const isInteractiveRequest = !!getLastInteractiveValue(histories);
    const { text: userInteractiveVal } = chatValue2RuntimePrompt(userQuestion.value);

    const newTitle = getChatTitleFromChatMessage(userQuestion);

    const aiResponse: AIChatItemType & { dataId?: string } = {
      dataId: responseChatItemId,
      obj: ChatRoleEnum.AI,
      value: assistantResponses,
      memories: system_memories,
      [DispatchNodeResponseKeyEnum.nodeResponse]: flowResponses
    };

    if (isInteractiveRequest) {
      await updateInteractiveChat({
        chatId,
        appId: appId || String(app._id),
        userInteractiveVal,
        aiResponse,
        newVariables,
        durationSeconds
      });
    } else {
      await saveChat({
        chatId,
        appId: appId || String(app._id),
        teamId,
        tmbId: tmbId,
        nodes,
        appChatConfig: chatConfig,
        variables: newVariables,
        isUpdateUseTime: false,
        newTitle,
        source: ChatSourceEnum.online,
        content: [userQuestion, aiResponse],
        durationSeconds
      });
    }

    createChatUsage({
      appName: appName || 'Home Chat',
      appId: appId || String(app._id),
      teamId,
      tmbId,
      source: UsageSourceEnum.fastgpt,
      flowUsages
    });
  } catch (err: any) {
    res.status(500);
    sseErrRes(res, err);
  }
  res.end();
}

export default NextAPI(handler);

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    },
    responseLimit: '20mb'
  }
};
