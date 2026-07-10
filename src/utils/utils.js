import { faker } from "@faker-js/faker";

faker.locale = "es";

export const generateUser = () => {
    let numOfProducts = parseInt(faker.random.numeric(1, { bannedDigits: ["0"] }));
    let products = [];
    for (let i = 0; i < numOfProducts; i++) {
        products.push(generateProducts());
    }
    return {
        first_name: faker.name.firstName(),
        last_name: faker.name.lastName(),
        email: faker.internet.email(),
        age: faker.date.birthdate(),
        id: faker.database.mongodbObjectId(),
        products
    }
}

export const generateProducts = () => {
    return {
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: faker.commerce.price(),
        thumbnail: faker.image.image(),
        id: faker.database.mongodbObjectId(),
        stock: faker.random.numeric(), 
        category: faker.commerce.department(),
    }
}