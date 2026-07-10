export const generateProductErrorInfo = (product) => {
    return `One or more properties were incomplete or not valid.
    List of required Properties:
    * title : needs to be a String, received ${product.title}
    * price : needs to be a Number, received ${product.price}
    * description : needs to be a String, received ${product.description}
    * thumbnail : needs to be a String, received ${product.thumbnail}
    * code : needs to be a String, received ${product.code}
    * stock : needs to be a Number, received ${product.stock}
    * category : needs to be a String, received ${product.category} `
}