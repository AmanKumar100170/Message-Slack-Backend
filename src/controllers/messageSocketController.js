import { createMessageService } from "../services/messageService.js";
import { NEW_MESSAGE_EVENT } from "../utils/common/eventConstants.js";

export default function messageHandlers (io, socket) {
    socket.on(NEW_MESSAGE_EVENT, createMessageHandler);
};

async function createMessageHandler (data, cb) {
    const messageResponse = await createMessageService(data);
    cb({
        success: true,
        message: 'Created the message successfully',
        data: messageResponse
    });
};