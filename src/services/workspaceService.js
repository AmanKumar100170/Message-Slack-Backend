import { StatusCodes } from 'http-status-codes';
import { v4 as uuidv4 } from 'uuid';

import channelRepository from '../repositories/channelRepository.js';
import userRepository from '../repositories/userRepository.js';
import workspaceRepository from '../repositories/workspaceRepository.js';
import ClientError from '../utils/errors/clientError.js';
import ValidationError from '../utils/errors/validationError.js';

const isUserAdminOfWorkspace = (workspace, userId) => {
    return workspace.members.find(
        (member) => (member.memberId.toString() === userId || member.memberId._id.toString() === userId) && member.role === 'admin'
    );
};

export const isUserMemberOfWorkspace = (workspace, userId) => {
    return workspace.members.find(
        (member) => member.memberId.toString() === userId
    );
};

const isChannelAlreadyPartOfWorkspace = (workspace, channelName) => {
    return workspace.channels.find(
        (channel) => channel.name.toLowerCase() === channelName.toLowerCase()
    );
};  

export const createWorkspaceService = async (workspaceData) => {
    try {
        const joinCode = uuidv4().substring(0, 6).toUpperCase();
    
        const response = await workspaceRepository.create({
            name: workspaceData.name,
            description: workspaceData?.description,
            joinCode
        });

        await workspaceRepository.addMemberToWorkspace(response._id, workspaceData.owner, 'admin');

        const updatedWorkspace = await workspaceRepository.addChannelToWorkspace(response._id, 'general');

        return updatedWorkspace;
    } catch (error) {
        console.log('Create workspace service error', error);

        if (error.name === 'ValidationError') {
            throw new ValidationError(
                {
                    error: error.errors
                },
                error.message
            );
        }

        if (error.name === 'MongoServerError' && error.code === 11000) {
            throw new ValidationError(
                {
                    error: ['A workspace with same name already exists']
                },
                'A workspace with same name already exists'
            );
        }
    }
};

export const getWorkspacesUserIsMemberOfService = async (userId) => {
    try {
        const response = await workspaceRepository.fetchAllWorkspaceByMemberId(userId);
        return response;
    } catch (error) {
        console.log('Get workspaces user is member of service error', error);
        throw error;
    }
};

export const deleteWorkspaceService = async (workspaceId, userId) => {
    try {
        const workspace = await workspaceRepository.getById(workspaceId);
        if (!workspace) {
            throw new ClientError({
                explanation: 'Invalid data sent from the client',
                message: 'Workspace not found',
                statusCode: StatusCodes.NOT_FOUND
            });
        }
        
        const isAllowed = isUserAdminOfWorkspace(workspace, userId);

        if (isAllowed) {
            await channelRepository.deleteMany(workspace.channels);
            const response = await workspaceRepository.delete(workspaceId);

            return response;
        }

        throw new ClientError({
            explanation: 'User is either not a member or not an admin of this workspace',
            message: 'User is not allowed to delete this workspace',
            statusCode: StatusCodes.UNAUTHORIZED
        });
    } catch (error) {
        console.log('Delete workspace service error', error);
        throw error;
    }
};

export const getWorkspaceService = async (workspaceId, userId) => {
    try {
        const workspace = await workspaceRepository.getById(workspaceId);
        if (!workspace) {
            throw new ClientError({
                explanation: 'Invalid data sent from the client',
                message: 'Workspace not found',
                statusCode: StatusCodes.NOT_FOUND
            });
        }

        const isMember = isUserMemberOfWorkspace(workspace, userId);
        if (!isMember) {
            throw new ClientError({
                explanation: 'User is not a member of this workspace',
                message: 'Cannot get details of the workspace',
                statusCode: StatusCodes.UNAUTHORIZED
            });
        }

        return workspace;
    } catch (error) {
        console.log('Get workspace service error', error);
        throw error;
    }
};

export const getWorkspaceByJoinCodeService = async (joinCode, userId) => {
    try {
        const workspace = await workspaceRepository.getWorkspaceByJoinCode(joinCode);
        if (!workspace) {
            throw new ClientError({
                explanation: 'Invalid data sent from the client',
                message: 'Workspace not found',
                statusCode: StatusCodes.NOT_FOUND
            });
        }

        const isMember = isUserMemberOfWorkspace(workspace, userId);
        if (!isMember) {
            throw new ClientError({
                explanation: 'User is not a member of this workspace',
                message: 'Cannot get details of the workspace',
                statusCode: StatusCodes.UNAUTHORIZED
            });
        }

        return workspace;
    } catch (error) {
        console.log('Get workspace by join code service error', error);
        throw error;
    }
};

export const updateWorkspaceService = async (workspaceId, userId, workspaceData) => {
    try {
        const workspace = await workspaceRepository.getById(workspaceId);
        if (!workspace) {
            throw new ClientError({
                explanation: 'Invalid data sent from the client',
                message: 'Workspace not found',
                statusCode: StatusCodes.NOT_FOUND
            });
        }

        const isAdmin = isUserAdminOfWorkspace(workspace, userId);
        if (!isAdmin) {
            throw new ClientError({
                explanation: 'User is not an admin of this workspace',
                message: 'Cannot update the workspace',
                statusCode: StatusCodes.UNAUTHORIZED
            });
        }

        const updatedWorkspace = await workspaceRepository.update(workspaceId, workspaceData);
        return updatedWorkspace;
    } catch (error) {
        console.log('Update workspace service error', error);
        throw error;
    }
};

export const addMemberToWorkspaceService = async (workspaceId, memberId, role, userId) => {
    try {
        const workspace = await workspaceRepository.getById(workspaceId);
        if (!workspace) {
            throw new ClientError({
                explanation: 'Invalid data sent from the client',
                message: 'Workspace not found',
                statusCode: StatusCodes.NOT_FOUND
            });
        }

        const isValidUser = await userRepository.getById(memberId);
        if (!isValidUser) {
            throw new ClientError({
                explanation: 'Invalid data sent from the client',
                message: 'User not found',
                statusCode: StatusCodes.NOT_FOUND
            });
        }

        const isAdmin = isUserAdminOfWorkspace(workspace, userId);
        if (!isAdmin) {
            throw new ClientError({
                explanation: 'User is not an admin of this workspace',
                message: 'Cannot update the workspace',
                statusCode: StatusCodes.UNAUTHORIZED
            });
        }

        const isMember = isUserMemberOfWorkspace(workspace, memberId);
        if (isMember) {
            throw new ClientError({
                explanation: 'User is already a member of this workspace',
                message: 'User is already a member of this workspace',
                statusCode: StatusCodes.UNAUTHORIZED
            });
        }

        const response = await workspaceRepository.addMemberToWorkspace(workspaceId, memberId, role);
        return response;
    } catch (error) {
        console.log('Add member to workspace service rror', error);
        throw error;
    }
};

export const addChannelToWorkspaceService = async (workspaceId, channelName, userId) => {
    try {
        const workspace = await workspaceRepository.getWorkspaceDetailsById(workspaceId);
        if (!workspace) {
            throw new ClientError({
                explanation: 'Invalid data sent from the client',
                message: 'Workspace not found',
                statusCode: StatusCodes.NOT_FOUND
            });
        }

        const isAdmin = isUserAdminOfWorkspace(workspace, userId);
        if (!isAdmin) {
            throw new ClientError({
                explanation: 'User is not an admin of this workspace',
                message: 'Cannot update the workspace',
                statusCode: StatusCodes.UNAUTHORIZED
            });
        }

        const isChannelAlreadyPart = isChannelAlreadyPartOfWorkspace(workspace, channelName);
        if (isChannelAlreadyPart) {
            throw new ClientError({
                explanation: 'Invalid data sent from the client',
                message: 'Channel is already a part of this workspace',
                statusCode: StatusCodes.FORBIDDEN
            });
        }

        const response = await workspaceRepository.addChannelToWorkspace(workspaceId, channelName);
        return response;
    } catch (error) {
        console.log('Add channel to workspace service error', error);
        throw error;
    }
};