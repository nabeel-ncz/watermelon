var db = require('../config/connection')
var collections = require('../config/collections')
const async = require('hbs/lib/async')
const { promiseCallback } = require('express-fileupload/lib/utilities')
var objectId = require('mongodb').ObjectId
const bcrypt = require('bcrypt')
const { reject } = require('bcrypt/promises')
const { ObjectId } = require('mongodb')
const { response } = require('express')
const { resolve } = require('handlebars-helpers/lib/path')


module.exports = {
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            let response = {}

            if (userData.Name != null && userData.Email != null && userData.Password.length == 8) {

                response.Status = true
                //response.passStatus = true
                var salt = await bcrypt.genSalt(10)
                userData.Password = await bcrypt.hash(userData.Password, salt)
                db.get().collection(collections.USER_COLLECTIONS).insertOne(userData).then((data) => {
                    response.user = userData
                    resolve(response)
                })
            } else {
                response.Status = false
                resolve(response)
            }
            //}else{
            //   response.nameStatus = false
            //    response.passStatus = false
            //    resolve(response)
            //console.log(response)

            //var salt=await bcrypt.genSalt(10)
            //userData.Password = await bcrypt.hash(userData.Password,salt)
            //db.get().collection(collections.USER_COLLECTIONS).insertOne(userData).then((data)=>{
            //    response.user=userData
            //    resolve(response)
            //})
            //}

        })
    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let adminStatus = false
            let response = {}
            //admin--check
            let admin = await db.get().collection(collections.ADMIN_COLLECTION).findOne({ email: userData.Email })
            if(admin){
                bcrypt.compare(userData.Password, admin.password).then((status) => {
                    if (status) {
                        response.admin = admin
                        response.adminStatus = true
                        //console.log(response);
                        resolve(response)

                    } else {
                        resolve({adminStatus:false})
                    }
                })
            }else{
                //user--check
            let user = await db.get().collection(collections.USER_COLLECTIONS).findOne({ Email: userData.Email })
            if (user) {
                bcrypt.compare(userData.Password, user.Password).then((status) => {
                    if (status) {
                        response.user = user
                        response.Status = true
                        //console.log('successfull');
                        resolve(response)

                    } else {
                        resolve({ Status: false })
                        // console.log('password incorrect');
                    }
                })
            } else {
                resolve({ Status: false })
                // console.log('email Incorrect');
            }
            }
            //user--check
            /*let user = await db.get().collection(collections.USER_COLLECTIONS).findOne({ Email: userData.Email })
            if (user) {
                bcrypt.compare(userData.Password, user.Password).then((status) => {
                    if (status) {
                        response.user = user
                        response.Status = true
                        //console.log('successfull');
                        resolve(response)

                    } else {
                        resolve({ Status: false })
                        // console.log('password incorrect');
                    }
                })
            } else {
                resolve({ Status: false })
                // console.log('email Incorrect');
            }*/
        })
    },
    getDetailsForPopup: (productId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCT_COLLECTION).findOne({ _id: ObjectId(productId) }).then((response) => {
                resolve(response)
            })
        })
    },
    addItemToCart: (userId, productId) => {
        return new Promise(async (resolve, reject) => {
        
            var newProduct=await db.get().collection(collections.PRODUCT_COLLECTION).findOne({_id:objectId(productId)})
            let productObj = {
                itemId: ObjectId(productId),
                name:newProduct.Name,
                price:newProduct.Price,
                imgExt:newProduct.imageExt,
                quantity: 1
            }

            let userCartExist = await db.get().collection(collections.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (userCartExist) {
                let productExist = await userCartExist.product.findIndex(product => product.itemId == productId)
                if (productExist != -1) {
                    /*    db.get().collection(collections.CART_COLLECTION).updateOne({user:objectId(userId),'product.itemId':objectId(productId)},
                        {
                          $inc:{'product.$.quantity':1}
                        }).then(()=>{
                            resolve()
                        })*/

                } else {
                    db.get().collection(collections.CART_COLLECTION).updateOne({ user: objectId(userId) }, {
                        $push: {
                            product: productObj
                        }
                    }).then(() => {
                        resolve()
                    })
                }
            } else {
                let cart = {
                    user: objectId(userId),
                    product: [productObj]
                }
                db.get().collection(collections.CART_COLLECTION).insertOne(cart).then((response) => {
                    resolve(response)
                })
            }
        })
    },
    getCartBadgeCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (cart) {
                count = cart.product.length
            }
            resolve(count)

        })
    },
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collections.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$product'
                },
                {
                    $project: {
                        item: '$product.itemId',
                        quantity: '$product.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collections.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as: 'cartProduct'
                    }
                },
                {
                    $project: {
                       item: 1, quantity: 1, product: { $arrayElemAt: ['$cartProduct', 0] }
                    }
                }
            ]).toArray()
            console.log(cartItems);
          resolve(cartItems)
        })
    },
    changeCartItemQuantity:(details)=>{
        let count=parseInt(details.count)
        let quantity=parseInt(details.quantity)
        return new Promise((resolve,reject)=>{
            if(count==-1 && quantity==1){
                db.get().collection(collections.CART_COLLECTION).updateOne({_id:ObjectId(details.cartId)},{
                    $pull:{product:{itemId:ObjectId(details.productId)}}
                }).then((response)=>{
                    resolve({removeProduct:true})
                })
            }else{
                db.get().collection(collections.CART_COLLECTION).updateOne({_id:ObjectId(details.cartId),'product.itemId':ObjectId(details.productId)},{
                    $inc:{'product.$.quantity':count}
                }).then((response)=>{
                    resolve({Status:true})
                })
            }
        })
    },
    removeCartProduct:(details)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.CART_COLLECTION).updateOne({_id:objectId(details.cartId)},{
                $pull:{product:{itemId:objectId(details.productId)}}
            }).then((response)=>{
                resolve(response)
            })
        })
    },
    getTotalAmount:(userId)=>{
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collections.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$product'
                },
                {
                    $project: {
                        item: '$product.itemId',
                        quantity: '$product.quantity',
                        //price:{$toInt:'$product.Price'}
                    }
                },
                {
                    $lookup: {
                        from: collections.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as: 'cartProduct'
                    }
                },
                {
                    $project: {
                       item: 1, quantity: 1, product: { $arrayElemAt: ['$cartProduct', 0] }
                    }
                },
                {
                    $group:{
                        _id:null,
                        total:{$sum:{$multiply:['$quantity',{$toInt:'$product.Price'}]}}
                    }
                }
            ]).toArray()
            //console.log(total);
          resolve(total[0].total)
        })
    },
    getCartProductsForOrder:(userId)=>{
        return new Promise(async (resolve,reject)=>{
            let cartProducts =await db.get().collection(collections.CART_COLLECTION).findOne({user:objectId(userId)})
            resolve(cartProducts)
            console.log(cartProducts.product);
        })
    },
    placeOrder:(order,products,total)=>{
        return new Promise((resolve,reject)=>{
            //console.log(order,products,total);
            let status=order.paymentMethod==='COD'?'placed':'pending'
            let orderObj={
                
                user:objectId(order.userId),
                paymentMethod:order.paymentMethod,
                deliveryDetails:{
                    name:order.Name,
                    email:order.Email,
                    phone:order.Mobile,
                    pincode:order.Pincode,
                    address:order.Address,
                    landmark:order.Landmark,
                    expected_date:order.ExceptedDate,
                    expected_time:order.ExceptedTime,
                    current_date:order.currentDate
                },
                selectedBranch:{
                    state:order.State,
                    branch:order.Branch
                },
                products:products,
                totalPrice:total,
                status:status
            }

            db.get().collection(collections.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
                console.log(orderObj);
                db.get().collection(collections.CART_COLLECTION).deleteOne({user:objectId(order.userId)})
                resolve()
            })
        })
    },
   // getProductDetailsForOrderPage:async (productId)=>{
   //     let details =await  db.get().collection(collections.PRODUCT_COLLECTION).findOne({ _id: ObjectId(productId) })
   //     resolve(details)
   // },

    getUserOrders:(userId)=>{
        return new Promise(async (resolve,reject)=>{
            let userOrders=await db.get().collection(collections.ORDER_COLLECTION).find({user:ObjectId(userId)}).toArray()
            resolve(userOrders)
            //console.log(userOrders);
        })
    },
    getOrderedProducts:(productId)=>{//no use
        //console.log(orderId)
        return new Promise(async(resolve,reject)=>{
            let orderItems = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                {
                    $match: { 'products.itemId': ObjectId(productId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.itemId',
                        quantity: '$products.quantity',
                    }
                },
                {
                    $lookup: {
                        from: collections.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as: 'orderProduct'
                    }
                },
                {
                    $project: {
                       item: 1, quantity: 1, product: { $arrayElemAt: ['$orderProduct', 0] }
                    }
                }
            ]).toArray()
            //console.log(orderItems);
            resolve(orderItems)
        })
    },
    getOrderBadgeCount:(userId)=>{
        return new Promise(async (resolve, reject) => { 
            let count=null
            let order = await db.get().collection(collections.ORDER_COLLECTION).find({ user: objectId(userId) }).toArray()
            if(order){
                count = order.length
            }
            resolve(count)
            console.log(count);
        })
    },
    getOrderedProductForPopup:(productId)=>{
    return new Promise(async (resolve, reject) => {
       db.get().collection(collections.PRODUCT_COLLECTION).findOne({ _id: ObjectId(productId) }).then((response)=>{
        resolve(response)
       })
       
    })
   },getAllAccountsCount:()=>{
    return new Promise(async(resolve,reject)=>{
        let userCount=await db.get().collection(collections.USER_COLLECTIONS).countDocuments()
        resolve(userCount)
    })
   },
   sendMessage:(data)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collections.MESSAGE_COLLECTION).insertOne(data).then(()=>{
            resolve()
        })
    })
   },
   findAllMessages:()=>{
    return new Promise(async(resolve,reject)=>{
        let messages=await db.get().collection(collections.MESSAGE_COLLECTION).find({}).toArray()
        //console.log(messages);
        resolve(messages)
    })
   },
   getQuestionForSendMessage:(queId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collections.MESSAGE_COLLECTION).findOne({_id:ObjectId(queId)}).then((response)=>{
            resolve(response)
        })
        
    })
   },
   storeUserQuesAnswers:(data)=>{
    return new Promise(async (resolve,reject)=>{
        db.get().collection(collections.ADMIN_ANSWERS_COLLECTION).insertOne(data).then(()=>{
            db.get().collection(collections.MESSAGE_COLLECTION).deleteOne({_id:ObjectId(data.questionId)})
            if(data.faqsStatus == "faqsTrue"){
                db.get().collection(collections.FAQS_COLLECTION).insertOne(data)
            }
            resolve()
        })
    })
   },
   removeFromAdminMessages:(messageId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collections.MESSAGE_COLLECTION).deleteOne({_id:ObjectId(messageId)}).then(()=>{
            resolve()
        })
    })
   },
   getAllOrdersForAdmin:()=>{
    return new Promise(async (resolve,reject)=>{
        let orders=await db.get().collection(collections.ORDER_COLLECTION).find({}).toArray()
        resolve(orders)
    })
   },
   findAllAnsweredMessages:()=>{
    return new Promise(async (resolve,reject)=>{
        let message=await db.get().collection(collections.ADMIN_ANSWERS_COLLECTION).find({}).toArray()
        resolve(message)
    })
   },
   findAllFaqs:()=>{
    return new Promise( async (resolve,reject)=>{
        let faqs=await db.get().collection(collections.FAQS_COLLECTION).find({}).toArray()
        resolve(faqs)
    })
   },
   findUserMessages:(userId)=>{
    return new Promise(async (resolve,reject)=>{
        let messages=await db.get().collection(collections.ADMIN_ANSWERS_COLLECTION).find({userId:userId}).toArray()
        resolve(messages)
    })
   },
   findUserMessageCount:(userId)=>{
    return new Promise(async (resolve,reject)=>{
        let count=await db.get().collection(collections.ADMIN_ANSWERS_COLLECTION).find({userId:userId}).toArray()
        resolve(count.length)
    })
   },
   removeFromUserMessages:(messageId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collections.ADMIN_ANSWERS_COLLECTION).deleteOne({_id:ObjectId(messageId)}).then(()=>{
            resolve()
        })
    })
   }
}