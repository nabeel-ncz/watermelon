const { response } = require('express');
var express = require('express');
const async = require('hbs/lib/async');
var router = express.Router();
var productHelpers=require('../helpers/product-helpers')
var userHelpers=require('../helpers/user-helpers')

/* GET home page.*/
router.get('/', async (req, res, next)=>{
  let admin=req.session.admin
  let orders=await productHelpers.getAllOrders()
  let TotalOrdersCount=await productHelpers.getAllOrdersCount()
  let totalRevenue=await productHelpers.getTotalRevenue()
  let totalCutomers=await userHelpers.getAllAccountsCount()
  //console.log(totalRevenue);
  if(admin){
    productHelpers.getAllProducts().then((products)=>{
     res.render('admin/dashboard',{products,admin,orders,TotalOrdersCount,totalRevenue,totalCutomers})
    })
  }else{
    res.redirect('/log-in')
  }
});
router.get('/view-options', (req,res)=>{
  admin=req.session.admin
  productHelpers.getAllProducts().then((products)=>{
     res.render('admin/view-options',{products,admin})
  })
 
})
router.get('/view-orders-admin',async(req,res)=>{
  admin=req.session.admin
  let orders=await userHelpers.getAllOrdersForAdmin()
  res.render('admin/view-orders-admin',{admin,orders})
})
router.get('/add-product',async (req,res)=>{
  admin=req.session.admin
  let categories=await productHelpers.findAllCategories()
  res.render('admin/add-product',{admin,categories})
})
router.post('/add-product',(req,res)=>{
  admin=req.session.admin
  productHelpers.addProducts(req.body).then((id)=>{
    let image=req.files.Image
    //var ext=image.name.split('.').pop();
    let ext=req.body.imageExt
    //console.log(ext)
    let uploadPath=id
    image.mv('./public/images/product-images/'+uploadPath+'.'+ext,(err)=>{
      if(err){
        console.log(err)
      }else{
        res.redirect('/admin/add-product')
        //console.log(req.body.imageExt);
      }
    })
  })
})
router.get('/add-new-category',(req,res)=>{
  res.render('admin/add-category',{admin:req.session.admin})
})
router.post('/add-new-category',(req,res)=>{
  productHelpers.addNewCategory(req.body).then(()=>{
    res.redirect('/admin/add-product')
  })
})
router.get('/edit-product',async (req,res)=>{
  admin=req.session.admin
  let productId=req.query.id
  let product=await productHelpers.getProductDetails(productId)
  let categories=await productHelpers.findAllCategories()
  //console.log(product)
  res.render('admin/edit-product',{product,admin,categories})
   
})
router.post('/edit-product',(req,res)=>{
  //let products=req.body
  //let id=req.query.id
  productHelpers.editProduct(req.body,req.query.id).then(()=>{
    res.redirect('/admin/')
    if(req.files.Image){
      let image=req.files.Image
      let ext=req.body.imageExt
      image.mv('./public/images/product-images/'+req.query.id+'.'+ext)
    }else{
      res.redirect('/admin/')
    }
  })
})
/*router.get('/remove-product',async (req,res)=>{
  let productId=req.query.id
  let product=await productHelpers.removeProductDetails(productId)
  res.redirect('/admin/',{product})
})*/
router.get('/remove-product',(req,res)=>{
  let productId=req.query.id
  productHelpers.removeProduct(productId).then((response)=>{
    res.redirect('/admin/')
  })
})
router.get('/add-special-products',(req,res)=>{
  admin=req.session.admin
  res.render('admin/add-special-products',{admin})
})
router.post('/add-special-products',(req,res)=>{
  admin=req.session.admin
  productHelpers.addSpecialProducts(req.body).then((id)=>{
    let image=req.files.Image
    //var ext=image.name.split('.').pop();
    let ext=req.body.imageExt
    //console.log(ext)
    let uploadPath=id
    image.mv('./public/images/special-product-images/'+uploadPath+'.'+ext,(err)=>{
      if(err){
        console.log(err)
      }else{
        res.redirect('/admin/add-special-products')
        //console.log(req.body.imageExt);
      }
    })
  })
})
router.get('/add-banner',(req,res)=>{
  admin=req.session.admin
  res.render('admin/add-banner',{admin})
})
router.get('/admin-messages',async (req,res)=>{
  admin=req.session.admin
  let messages=await userHelpers.findAllMessages()
  let answeredMessages=await userHelpers.findAllAnsweredMessages()
  let faqs=await userHelpers.findAllFaqs()
  res.render('admin/view-messages',{admin,messages,answeredMessages,faqs})
  //console.log(messages);
})

router.get('/show-sending-form/',(req,res)=>{
  userHelpers.getQuestionForSendMessage(req.query.id).then((response)=>{
    res.json(response)
  })
})
router.post('/admin-messages',(req,res)=>{
  userHelpers.storeUserQuesAnswers(req.body).then(()=>{
    res.redirect('/admin/admin-messages')
  })
})

router.get('/remove-from-messages/',(req,res)=>{
  userHelpers.removeFromAdminMessages(req.query.id).then(()=>{
    res.redirect('/admin/admin-messages')
  })
})
router.get('/track-order/',async(req,res)=>{
  let userOrder=await userHelpers.getUserOrderInAdmin(req.query.id)
  //console.log(userOrder._id);
  let trackDetails=await userHelpers.findTrackDetails(userOrder._id)
  res.render('admin/track-orders',{admin:req.session.admin,userOrder,trackDetails})
})
router.post('/track-order',async(req,res)=>{
  userHelpers.addTrackDetails(req.body).then(()=>{
    res.redirect('/admin/')
  })
})
module.exports = router;
