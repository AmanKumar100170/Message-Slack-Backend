import mailQueue from '../queues/mailQueue.js';
import '../processors/mailProcessor.js';

export const addEmailToMailQueue = async (emailData) => {
    try {
        await mailQueue.add(emailData);
        console.log('Email added to mail queue');
    } catch (error) {
        console.log('Add email to mail queue error', error);
    }
};