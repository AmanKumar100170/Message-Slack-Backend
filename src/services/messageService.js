import messageRepository from '../repositories/messageRepository.js';
import channelRepository from '../repositories/channelRepository.js';
import { isUserMemberOfWorkspace } from './workspaceService.js';
import ClientError from '../utils/errors/clientError.js';
import { StatusCodes } from 'http-status-codes';

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