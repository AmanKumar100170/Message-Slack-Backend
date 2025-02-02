import userRepository from "../repositories/userRepository.js";
import ValidationError from "../utils/errors/validationError.js";

export const signUpService = async (data) => {
    try {
        const newUser = await userRepository.create(data);
        return newUser;
    } catch (error) {
        console.log('User service error', error.cause.name);
        if (error.name === 'ValidationError') {
            throw new ValidationError(
                {
                    error: error.errors
                },
                error.message
            );
        }

        if (error.cause.name === 'MongoServerError' && error.cause.code === 11000) {
            throw new ValidationError(
                {
                    error: ['A user with same email or password already exists']
                },
                'A user with same email or password already exists'
            );
        }
    }
};