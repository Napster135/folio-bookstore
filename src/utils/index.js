import bcrypt from "bcrypt";   

const createHash = password =>{
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}

const isValidPassword = (user, password) => {
    let res = bcrypt.compareSync(password, user.password);
    return res;
} 

export { createHash, isValidPassword }