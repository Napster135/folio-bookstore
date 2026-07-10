import TokenRepository from "../repositories/token.repository.js";

const tokenRepository = new TokenRepository();

const serviceFindTokenByUserId = async (email) => {
    let token = await tokenRepository.findTokenByUserId(email);
    return token;
}

const serviceCreateToken = async (newToken) => {
    let addedToken = await tokenRepository.createToken(newToken);
    return addedToken;
}

const serviceDeleteTokenById = async (tokenId) => {
    let deletedToken = await tokenRepository.deleteTokenById(tokenId);
    return deletedToken;
}

export { serviceCreateToken, serviceDeleteTokenById, serviceFindTokenByUserId }