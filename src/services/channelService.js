import { StatusCodes } from 'http-status-codes';

import channelRepository from '../repositories/channelRepository.js';
import ClientError from '../utils/errors/clientError.js';
import { isUserMemberOfWorkspace } from './workspaceService.js';

export const getChannelByIdService = async (channelId, userId) => {
    try {
        const channel = await channelRepository.getChannelWithWorkspaceDetails(channelId);
        if (!channel || !channel.workspaceId) {
            throw new ClientError({
                message: 'Channel not found with the provided ID',
                explanation: 'Invalid data sent from the client',
                statusCode: StatusCodes.NOT_FOUND
            });
        }

        const isUserPartOfWorkspace = isUserMemberOfWorkspace(channel.workspaceId, userId);
        if (!isUserPartOfWorkspace) {
            throw new ClientError({
                message: 'This user cannot access the channel',
                explanation: 'User is not a part of this workspace',
                statusCode: StatusCodes.UNAUTHORIZED
            });
        }

        return channel;
    } catch (error) {
        console.log('Get channel by ID service error', error);
        throw error;
    }
};