import { tokenModel } from "../models/token.model.js";
import { ContenedorMongoDb } from "../persistence/mongoDbPersistence.js";
import TokenDTO from "../DTOs/token.dto.js";

const tokenDtoFromObject = (obj) => {
    const { _id, token, user, expiresAt } = obj;
    return new TokenDTO(_id, token, user, expiresAt);
}

class TokenDAOMongoDb extends ContenedorMongoDb {


    async findAllTokens() {
        try {
            const tokens = await tokenModel.find();
            return tokens.map(tokenDtoFromObject);
        } catch (error) {
            throw new Error(error);
        }
    }
    async findTokenByUserId(email) {
        try {
            const tokenReset = await tokenModel.findOne({ user: email });
            if (!tokenReset) {
                throw new Error('token not found');
            }
            return tokenDtoFromObject(tokenReset);
        } catch (error) {
            throw new Error(error);
        }
    }

    async createToken(newToken) {
        try {
            const token = this.save(newToken);
            return tokenDtoFromObject(token);
        } catch (error) {
            throw new Error(error);
        }
    }

    async updateToken(token) {
        try {
            const updatedToken = await tokenModel.findByIdAndUpdate(
                token._id,
                { token: token.token, expirationDate: token.expirationDate },
                { new: true }
            );
            if (!updatedToken) {
                throw new Error('token not found');
            }
            return tokenDtoFromObject(updatedToken);
        } catch (error) {
            throw new Error(error);
        }
    }
    async deleteTokenById(tokenId) {
        try {
            const deletedToken = await tokenModel.findByIdAndDelete(tokenId);
            if (!deletedToken) {
                throw new Error('token not found');
            }
        } catch (error) {
            throw new Error(error);
        }
    }
}

export default TokenDAOMongoDb;