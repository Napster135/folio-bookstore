class TokenDTO {
    constructor(_id,token, user, expiresAt) {
        this._id = _id
        this.token = token;
        this.user = user;
        this.expiresAt = expiresAt;
    }
}

export default TokenDTO;