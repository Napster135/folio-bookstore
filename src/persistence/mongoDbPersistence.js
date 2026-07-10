import mongoose from "mongoose";

class ContenedorMongoDb {
    constructor(collection, schema) {
        this.collection = mongoose.model(collection, schema);
    }

    async save(newElem) {
        try {
            let doc = await this.collection.create(newElem);
            return doc;
        } catch (error) {
            throw new Error(`Error saving new element: ${error}`);
        }
    }

    async delete(id) {
        try {
            const { n, nDeleted } = await this.collection.deleteOne({ "_id": id });
            if (n == 0 || nDeleted == 0) {
                throw new Error("Error deleting: Not Found");
            }
        } catch (error) {
            throw new Error(`Error deleting: ${error}`);
        }
    }
    async deleteAll() {
        try {
            await this.collection.deleteMany({});
        } catch (error) {
            throw new Error(`Error deleting: ${error}`);
        }
    }
}

export { ContenedorMongoDb };