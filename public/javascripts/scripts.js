//=========================================sidebar

let sidebar = document.querySelector(".sidebar");
let closeBtn = document.querySelector("#btn");
let searchBtn = document.querySelector(".bx-search");


closeBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    menuBtnChange();//calling the function(optional)
});

searchBtn.addEventListener("click", () => { // Sidebar open when you click on the search iocn
    sidebar.classList.toggle("open");
    menuBtnChange(); //calling the function(optional)
});

// following are the code to change sidebar button
function menuBtnChange() {
    if (sidebar.classList.contains("open")) {
        closeBtn.classList.replace("bx-menu", "bx-menu-alt-right");//replacing the iocns class
    } else {
        closeBtn.classList.replace("bx-menu-alt-right", "bx-menu");//replacing the iocns class
    }
}

document.querySelector('#main-search-box'). addEventListener('input', filterList);
function filterList(){
const searchInput =document.querySelector('#main-search-box');
const filter = searchInput.value.toLowerCase()
const listItems = document.querySelectorAll('.header-search-prod-name');

listItems.forEach((item) =>{
let text = item.textContent;

if(text.toLowerCase().includes (filter.toLowerCase())){ 
    item.style.display =''
}else{
item.style.display = 'none';

}
});
}

/*
document.querySelector('.product-category-div-id').addEventListener('click',(id)=>{
    var buttonSpan=document.querySelector('.product-category-div-span')
    const categDiv=document.querySelectorAll('.product-category-div-id')
    console.log(id);
    categDiv.forEach((item)=>{
        console.log(item.textContent);
    })
})*/
//=========================================sidebar

//============add product====
function viewImage(event) {
    document.getElementById('imageView').src = URL.createObjectURL(event.target.files[0])
}
// Example starter JavaScript for disabling form submissions if there are invalid fields
(function () {
    'use strict'
  
    window.addEventListener('load', function () {
      // Fetch all the forms we want to apply custom Bootstrap validation styles to
      var forms = document.getElementsByClassName('needs-validation')
  
      // Loop over them and prevent submission
      Array.prototype.filter.call(forms, function (form) {
        form.addEventListener('submit', function (event) {
          if (form.checkValidity() === false) {
            event.preventDefault()
            event.stopPropagation()
          }
          form.classList.add('was-validated')
        }, false)
      })
    }, false)
  }())

  $("#main-search-box").focus(function(){
    $(".main-search-box-span").css("display", "block")
  });
    $('#btn').click(()=>{
        $('.main-search-box-span').css('display','none')
    })
    $('.bx-search').click(()=>{
        $('.main-search-box-span').css('display','none')
    })


//==========for order page===[
/*
$( function () {
    $('#admin_page_prod_table').DataTable();
} ); 

//const date = new Date();

let day = date.getDate();
let month = date.getMonth() + 1;
let year = date.getFullYear();

// This arrangement can be altered based on how we want the date's format to appear.
let currentDate = `${day}-${month}-${year}`;*/
let today = new Date().toISOString().split('T')[0]
let todayForCurrent =new Date()
//console.log(todayForCurrent);
$("#Desired-date").val(today)
$("#current-date").val(todayForCurrent)


/*
function productCategoryClick(categId){
    var buttonSpan=$('.product-category-div-span')
    var categDiv=$('.product-category-div-'+categId)
    //$('.prodCategIdBurger').css("display","none")
    let text=''
    $.each(categDiv,(key,item)=>{
        text=item.textContent
    })
    console.log(text);
    var className='.prodCategId'+text
    $('.prodCategIdBurger').css("display","none")
}
*/
//==========for order page===]
function productCategoryClick(category,categId){
    $.ajax({
        url:'/get-category-products?categ='+category,
        method:'get',
        success:(response)=>{
        $('.prodCardAll').css("display","none")

           $.each(response,(key,value)=>{
                $('#prodCard'+value._id).css("display","flex")
           })
        }
    })
}

function popupDetails(productId) {
    

    $.ajax({
        url: '/popup-product-details',
        data: {
            product: productId
        },
        method: 'post',
        success: (response) => {
            if (response) {

                
                    //let Tiltle = response.Name
                    $('#modalTitleMain').html("Order Now")
                    $('#modalTitleSub').html("free delivery available now !")
                    let Name=response.Name
                    $('#popup-product-name').html(Name)
                    let Price=response.Price
                    $('#popup-product-price').html(Price)
                    let Description=response.Description
                    $('#popup-product-desc').html(Description)
                    let id=response._id
                    let imageExt="."+response.imageExt
                    let path="/images/product-images/"
                    $("#modal-image").attr("src",path+id+imageExt);
                //alert(response)
                //setTimeout(()=>{
                // location.reload()
                //},5000)

            }
        }
    })
}

function sendReplay(queId){
    $.ajax({
        url: '/admin/show-sending-form?id='+queId,
        method: 'get',
        success: (response) => {
            if (response) {
                $('#staticBackdrop-1-question').html(response.question)
                $('#staticBackdrop-1-email').html(response.email)
                $('#que-id-input').val(response._id)
                $('#question-input').val(response.question)
                $('#userId-input').val(response.userId)
            }
        }
    })
}
function removeFromUserMessages(id){
    $.ajax({
        url: '/remove-from-user-messages?id='+id,
        method: 'get',
        success: (response) => {
            if(response.Status){
                location.reload()
            }
        }
    })
}

function showOrderProduct(product,quantity) {
    
    $.ajax({
        url: '/show-order-product-details',
        data: {
            productId: product
        },
        method: 'post',
        success: (response) => {
            if (response) {
                $('#odr-popup-product-title-2').html(response.Name)
                $('#odr-popup-product-subtitle-2').html("ordered within 2 hours !")
                $('#odr-popup-product-name').html(response.Name)
                $('#odr-popup-product-price').html(response.Price)
                $('#odr-popup-product-desc').html(response.Description)
                $('#odr-popup-product-categ').html(response.Category)
                $('#odr-popup-product-quant').html(quantity+" nos")
                let id=response._id
                let imageExt="."+response.imageExt
                let path="/images/product-images/"
                $("#modal-image").attr("src",path+id+imageExt);
            }
        }
    })
}
/*
function setOrderPageProducts(productId){
    console.log(productId);
    $.ajax({
        url: '/view-orders',
        //dataType: "json",
        data: {
            product: productId
        },
        method: 'post',
        success: (response) => {
            if (response) {
                /*var keys = 0;
                for (var i in response.details) keys++;
                console.log(keys);
                
            }
        }
    })
}
*/
function addToCart(productId){
    $.ajax({
        url:'/add-to-cart',
        data:{
            product:productId
        },
        method:'post',
        success:(response)=>{
            if(response.status){
                let totalCount=$('#cart-quantity-badge').html()
                totalCount=parseInt(totalCount)+1
                $('#cart-quantity-badge').html(totalCount)
            }
        }
    })
}

function changeQuantity(cartId,productId,count,userId){
    var quantityDivId='#'+productId
    var quantity=$(quantityDivId).html()
    var quantityInNum=parseInt(quantity)
    //parseInt(quantity)
    var count=parseInt(count)
    $.ajax({
        url:'/change-cart-item-quantity',
        data:{
            user:userId,
            cartId:cartId,
            productId:productId,
            quantity:quantityInNum,
            count:count
        },
        method:'post',
        success:(response)=>{
            if(response.removeProduct){
                alert('product is removed from your cart')
                location.reload()
            }else{
                $(quantityDivId).html(quantityInNum+count)
                $('#subtotal-amount-of-cart-product').html(response.total)
                //console.log(response.total)
            }
        }
    })
}

function removeCartProduct(cartId,productId){
    $.ajax({
        url:'/remove-cart-product',
        data:{
            cartId:cartId,
            productId:productId
        },
        method:'post',
        success:(response)=>{
            alert('are you want to remove this product')
            location.reload()
        }
    })
}

$('#checkout-form').submit((event)=>{
    event.preventDefault()
    $.ajax({
        url:'/checkout',
        method:'post',
        data:$('#checkout-form').serialize(),
        success:(response)=>{
            if(response.Status){
                location.href='/order-success'
            }
        }
    })
})
/*
$('#add-category-form').submit((event)=>{
    event.preventDefault()
    $.ajax({
        url:'/add-new-category',
        method:'post',
        data:$('#add-category-form').serialize(),
        success:(response)=>{
            if(response.status){
                location.reload()
            }
        }
    })
})*/