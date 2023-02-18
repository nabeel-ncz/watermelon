var db=require('../config/connection')
var collections=require('../config/collections')
const async = require('hbs/lib/async')
const { promiseCallback } = require('express-fileupload/lib/utilities')
const { reject } = require('bcrypt/promises')
const { resolve } = require('handlebars-helpers/lib/path')
var objectId=require('mongodb').ObjectId

module.exports={
    addProducts:(productDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.PRODUCT_COLLECTION).insertOne(productDetails).then((data)=>{
                resolve(data.insertedId)
            })
        })
    },getAllProducts:()=>{
        return new Promise(async (resolve,reject)=>{
            let products=await db.get().collection(collections.PRODUCT_COLLECTION).find().toArray()
        resolve(products)
        })
        
    },
    getAllProductsForSearch:(key)=>{
        return new Promise(async (resolve,reject)=>{
            let products=await db.get().collection(collections.PRODUCT_COLLECTION).find({
                "$or":[
                    {Name:{$regex:key}},
                    {Category:{$regex:key}}
                ]
            }).toArray()
        resolve(products)
        })
    },
    removeProduct:(productId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.PRODUCT_COLLECTION).deleteOne({_id:objectId(productId)}).then((response)=>{
                resolve(response)
            })
        })
    },
    getProductDetails:(productId)=>{
        return new Promise((resolve,reject)=>{
        db.get().collection(collections.PRODUCT_COLLECTION).findOne({_id:objectId(productId)}).then((product)=>{
            resolve(product)
        })
        })
    },
    addSpecialProducts:(productDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.SPECIAL_PRODUCTS_COLLECTION).insertOne(productDetails).then((data)=>{
                resolve(data.insertedId)
            })
        })
    },
    /*removeProductDetails:(productId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.PRODUCT_COLLECTION).findOne({_id:objectId(productId)}).then((product)=>{
                resolve(product)
            })
            })
    },*/
    editProduct:(productDetails,productId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.PRODUCT_COLLECTION).updateOne({_id:objectId(productId)},
            {$set:{
                Name:productDetails.Name,
                Category:productDetails.Category,
                Price:productDetails.Price,
                Description:productDetails.Description,
                imageExt:productDetails.imageExt
            }}).then((response)=>{
                resolve()
            })
        })
    },
    getAllOrders:()=>{
        return new Promise(async(resolve,reject)=>{
            let orders=await db.get().collection(collections.ORDER_COLLECTION).find({}).toArray()
            resolve(orders)
        })
    },
    getAllOrdersCount:()=>{
        return new Promise(async(resolve,reject)=>{
            let orders=await db.get().collection(collections.ORDER_COLLECTION).countDocuments()
            resolve(orders)
        })
    },
    getTotalRevenue:()=>{
        return new Promise(async(resolve,reject)=>{
            let revenue=await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                {
                   $group:{
                    _id:'',
                    "total":{$sum:'$totalPrice'}
                   }
                },
                {
                    $project:{
                        _id:0,
                        "TotalAmount": '$total'
                    }
                }
            ]).toArray()
            //console.log(revenue);
            resolve(revenue)
        })
    },
    getAllSpecialProducts:()=>{
        return new Promise(async (resolve,reject)=>{
            let specialProducts=await db.get().collection(collections.SPECIAL_PRODUCTS_COLLECTION).find({}).toArray()
            resolve(specialProducts)
        })
    },
    addNewCategory:(data)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.FOODCATEGORY_COLLECTION).insertOne(data).then(()=>{
                resolve()
            })
        })
    },findAllCategories:()=>{
        return new Promise(async (resolve,reject)=>{
            let data= await db.get().collection(collections.FOODCATEGORY_COLLECTION).find({}).toArray()
            resolve(data)
        })
    },getCorrospondCategoryItems:(category)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.PRODUCT_COLLECTION).find({Category:category}).toArray().then((response)=>{
                //console.log(response);
                resolve(response)
            })
        })
    }
}