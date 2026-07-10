class UserDTO {
    constructor(_id, user, email, age, password, role, cartId) {
        this._id = _id,
        this.user = user,
        this.email = email,
        this.role = role,
        this.age = age,
        this.password = password,
        this.cartId = cartId
    }
}
export default UserDTO