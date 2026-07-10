import UsersDAOMongoDb from "../daos/usersMongooseDao.js";
import { userSchema } from "../models/users.model.js";
const userDAO = new UsersDAOMongoDb("users", userSchema)

class UserRepository {
    async getAllUsers () {
        return userDAO.getAllUsers();
    }

    async getUserByEmail (email){ 
       return userDAO.getUserByEmail(email);
    }
    async saveUser (newUser, cid){
        return userDAO.saveUser(newUser, cid);
    }

    async findUser (user) {
        return userDAO.findUser(user);
    }

    async updateUserRole (uid, newRole) {
        return userDAO.updateUserRole(uid, newRole);
    }

    async deleteUsers () {
        return userDAO.deleteUsers();
    }

    async deleteUserById (uid) {
        return userDAO.deleteUserById(uid);
    }

    async findInactiveUsers(cutoffDate) {
        return userDAO.findInactiveUsers(cutoffDate);
    }

    async deleteInactiveUsersByDate(cutoffDate) {
        return userDAO.deleteInactiveUsersByDate(cutoffDate);
    }

    async restorePassword (email, newPassword) {
        return userDAO.restorePassword(email, newPassword);
    }
}

export default UserRepository