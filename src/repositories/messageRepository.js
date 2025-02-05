import crudRepository from './crudRepository.js';
import Message from '../schema/message.js';

const messageRepository = {
    ...crudRepository(Message),

    getPaginatedMessages: async (messageParams, page, limit) => {
        const messages = await Message.find(messageParams)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('senderId', 'username email avatar');
        
        return messages;
    }
};

export default messageRepository;