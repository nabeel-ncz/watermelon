const { response } = require('express');
var express = require('express');
const async = require('hbs/lib/async');
const { getAllProductsForSearch } = require('../helpers/product-helpers');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
var userHelpers=require('../helpers/user-helpers')


/* GET users listing. */
const verifyLogin=(req,res,next)=>{
  if(req.session.userloggedIn){
    next()
  }else{
    res.redirect('/log-in')
  }
}

router.get('/',async function(req, res, next) {
  let user=req.session.user
  let cartCount=null
  let orderCount=null
  let messageCount=null
  if(user){
    cartCount= await userHelpers.getCartBadgeCount(req.session.user._id)
    orderCount=await userHelpers.getOrderBadgeCount(req.session.user._id)
    messageCount=await userHelpers.findUserMessageCount(req.session.user._id)
  }
  let specialProducts=await productHelpers.getAllSpecialProducts()
  productHelpers.getAllProducts().then((products)=>{
    //let productsCategory=Object.values(products)
    //console.log(productsCategory)
    res.render('user/user-home',{user,products,cartCount,orderCount,specialProducts,messageCount});
    //console.log(user)
  })
  
});
/*
router.post('/products',async(req,res)=>{
  let payload=req.body.payload.trim()
  let search=await products.find({Name:{$regex: new RegExp('^'+payload+'.*','i')}}).exec()
  //limit searches 10
  search=search.slice(0,10)
  res.send({payload:search})
})
router.get("/products-search",async (req,res)=>{
  let data = getAllProductsForSearch(req.body.key)
  res.json(data);

})*/

router.post('/popup-product-details', (req,res)=>{
  //let product=await productHelpers.getProductDetails(req.body)
  //console.log(req.body.product)
  userHelpers.getDetailsForPopup(req.body.product).then((response)=>{
    //console.log(response)
  res.json(response)
  })
})
router.get('/sign-up',(req,res)=>{
  if(req.session.userloggedIn){
    res.redirect('/')
  }else{
    res.render('user/sign-up',{'SignUpErr':req.session.SignUpErr})
    req.session.SignUpErr=null
  }
})
router.post('/sign-up',(req,res)=>{
  userHelpers.doSignup(req.body).then((response)=>{
    if(response.Status){
      req.session.userloggedIn=true
      req.session.user=response.user
      res.redirect('/')
    }else{
      req.session.SignUpErr='Name is null or Email is null or Password Contain 8 charecters'
      res.redirect('/sign-up')
    }
    
    //console.log(req.session.user)
    
  })
})
router.get('/log-in',(req,res)=>{
  if(req.session.userloggedIn){
    res.redirect('/')
  }else{
    res.render('user/log-in',{'loginErr':req.session.loginErr})
    req.session.loginErr=null
  }
})
router.post('/log-in',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    //console.log(response);
    if(response.Status){
      req.session.userloggedIn=true
      req.session.user=response.user
      res.redirect('/')
    }else if(response.adminStatus){
      req.session.adminloggedIn=true
      req.session.admin=response.admin
      res.redirect('/admin')
    }
    else{
      //console.log("invalid Username or Password");
      req.session.loginErr="invalid Username or Password"
      res.redirect('/log-in')
    }
  })
})
router.get('/sign-out',(req,res)=>{
  req.session.destroy()
  res.redirect('/log-in')
})
router.get('/cart',verifyLogin,async (req,res)=>{
  let products= await userHelpers.getCartProducts(req.session.user._id)
  if(req.session.user){
    cartCount= await userHelpers.getCartBadgeCount(req.session.user._id)
    orderCount=await userHelpers.getOrderBadgeCount(req.session.user._id)
  }
  
  //console.log(total)
  if(cartCount==0){
    res.render('user/empty-cart',{user:req.session.user,cartCount,orderCount})
  }else{
    let total= await userHelpers.getTotalAmount(req.session.user._id)
    res.render('user/cart',{products,user:req.session.user,cartCount,total,orderCount})
  }
  
})
router.post('/add-to-cart',(req,res)=>{
  let productId=req.body.product
  let userId=req.session.user._id
  if(req.session.userloggedIn){
   userHelpers.addItemToCart(userId,productId).then(()=>{
   res.json({status:true})
  }) 
  }else{
  res.redirect('/log-in')
  }
  
})
router.post('/change-cart-item-quantity',(req,res)=>{
  //console.log(req.body)
  userHelpers.changeCartItemQuantity(req.body).then(async (response)=>{
    response.total=await userHelpers.getTotalAmount(req.body.user)
    res.json(response)
  })
})
router.post('/remove-cart-product',(req,res)=>{
  userHelpers.removeCartProduct(req.body).then((response)=>{
    res.json(response)
  })
})
router.get('/checkout',verifyLogin,async(req,res)=>{
  cartCount= await userHelpers.getCartBadgeCount(req.session.user._id)

  let products= await userHelpers.getCartProducts(req.session.user._id)
  let total= await userHelpers.getTotalAmount(req.session.user._id)
  
  res.render('user/order',{total,user:req.session.user,products,cartCount})
})
router.get('/order-success',(req,res)=>{
  res.render('user/order-success',{user:req.session.user})
})
router.post('/checkout',verifyLogin,async (req,res)=>{
  let products= await userHelpers.getCartProductsForOrder(req.session.user._id)
  let total=await userHelpers.getTotalAmount(req.session.user._id)
  
  userHelpers.placeOrder(req.body,products,total).then((response)=>{
    res.json({Status:true})
  })
  
})
router.get('/view-orders',verifyLogin,async(req,res)=>{
  let orderDetails=await userHelpers.getUserOrders(req.session.user._id)
  cartCount= await userHelpers.getCartBadgeCount(req.session.user._id)
  orderCount=await userHelpers.getOrderBadgeCount(req.session.user._id)
  
  res.render('user/view-orders',{user:req.session.user,orderDetails,cartCount,orderCount})
})
router.post('/show-order-product-details', (req,res)=>{
  userHelpers.getOrderedProductForPopup(req.body.productId).then((response)=>{
    
    res.json(response)
  })
})
router.get('/ask-questions',verifyLogin,(req,res)=>{
  res.render('user/ask-questions',{user:req.session.user})
})
router.post('/ask-question',(req,res)=>{
  userHelpers.sendMessage(req.body).then(()=>{
    res.redirect('/')
  })
})
router.get('/user-messages/',verifyLogin,async (req,res)=>{
  cartCount= await userHelpers.getCartBadgeCount(req.session.user._id)
  orderCount=await userHelpers.getOrderBadgeCount(req.session.user._id)
  messageCount=await userHelpers.findUserMessageCount(req.session.user._id)

  let messages= await userHelpers.findUserMessages(req.query.id)
  res.render('user/view-messages',{user:req.session.user,messages,cartCount,orderCount,messageCount})
})
router.get('/remove-from-user-messages/',(req,res)=>{
  userHelpers.removeFromUserMessages(req.query.id).then(()=>{
    res.json({Status:true})
  })
})
router.get('/about',async (req,res)=>{
  let faqs=await userHelpers.findAllFaqs()
  res.render('user/about',{user:req.session.user,faqs})
})
module.exports = router;
