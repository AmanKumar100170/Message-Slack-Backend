import { StatusCodes } from 'http-status-codes';

import channelRepository from '../repositories/channelRepository.js';
import messageRepository from '../repositories/messageRepository.js';
import ClientError from '../utils/errors/clientError.js';
import { isUserMemberOfWorkspace } from './workspaceService.js';

export const getMessageService = async (messageParams, page, limit, user) => {
    try {
        const channelDetails = await channelRepository.getChannelWithWorkspaceDetails(messageParams.channelId);

        const workspace = channelDetails.workspaceId;

        const isMember = isUserMemberOfWorkspace(workspace, user);
        if (!isMember) {
            throw new ClientError({
                explanation: 'User is not a member of the workspace',
                message: 'Messages can not be accessed',
                statusCode: StatusCodes.UNAUTHORIZED
            });
        }

        const messages = await messageRepository.getPaginatedMessages(messageParams, page, limit);
        return messages;        
    } catch (error) {
        console.log('Get messages service error', error);
        throw error;
    }
};

export const createMessageService = async (message) => {
    try {
        await messageRepository.create(message);
        const newMessage = await messageRepository.getRecentMessage();
        return newMessage;
    } catch (error) {
        console.log('Create message service error', error);
        throw error;
    }
};