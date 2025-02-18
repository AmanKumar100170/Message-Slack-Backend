import { StatusCodes } from 'http-status-codes';

import { s3 } from '../config/awsConfig.js';
import { AWS_BUCKET_NAME } from '../config/serverConfig.js';
import { getMessageService } from '../services/messageService.js';
import { customErrorResponse, internalErrorResponse, successResponse } from '../utils/common/responseObjects.js';

export const getMessageController = async (req, res) => {
    try {
        const messages = await getMessageService({
            channelId: req.params.channelId
        },
            req.query.page || 1,
            req.query.limit || 20,
            req.user
        );
        
        return res.status(StatusCodes.OK).json(successResponse(messages, 'Messages fetched successfully'));
    } catch (error) {
        console.log('Get message controller error', error);
        
        if (error.statusCode) {
            return res.status(error.statusCode).json(customErrorResponse(error));
        }

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(internalErrorResponse(error));
    }
};

export const getPresignedUrlFromAWS = async (req, res) => {
    try {
        const url = await s3.getSignedUrlPromise('putObject', {
            Bucket: AWS_BUCKET_NAME,
            Key: `${Date.now()}`,
            Expires: 60
        });

        return res.status(StatusCodes.OK).json(successResponse(url, 'Presigned URL fetched successfully'));
    } catch (error) {
        console.log('Get presigned url from aws controller error', error);
        
        if (error.statusCode) {
            return res.status(error.statusCode).json(customErrorResponse(error));
        }

        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(internalErrorResponse(error));
    }
};