import TokenDAOMongoDb from "../daos/tokenMongooseDao.js";
import { tokenSchema } from "../models/token.model.js";
const tokenDAO = new TokenDAOMongoDb('tokens', tokenSchema);

class TokenRepository {
    async findTokenByUserId(email){
        return tokenDAO.findTokenByUserId(email);
    }

    async createToken(newToken){
        return tokenDAO.createToken(newToken);
    }

    async deleteTokenById(tokenId) {
        return tokenDAO.deleteTokenById(tokenId);
    }
}

export default TokenRepository;
