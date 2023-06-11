import express from 'express';
import { isAdmin, requireSignin } from '../middlewares/authMiddleware.js';
import { 
   brainTreePaymentController,
   braintreeTokenController,
   createProductController, 
   deleteProductController, 
   getProductController, 
   getSingleProductController,
   productCategoryController,
   productCountController,
   productFiltersController,
   productPerPageController,
   productPhotoController,
   relatedProductController,
   searchProductController,
   updateProductController
} from '../controllers/productController.js';
import formidable from 'express-formidable';

const router = express.Router();

// routing
//create product
// express-formidable is used to upload files
router.post('/create-product', requireSignin, isAdmin, formidable(), createProductController);

// Update Product
router.put('/update-product/:pid', requireSignin, isAdmin, formidable(), updateProductController);


// get products
router.get('/get-product', getProductController);

// single product
router.get('/get-product/:slug', getSingleProductController);

// get photo
router.get('/product-photo/:id', productPhotoController);

// delete product
router.delete('/delete-product/:id', requireSignin, isAdmin, deleteProductController);

// Filter Product
router.post('/product-filters', productFiltersController);

// product count
router.get('/product-count', productCountController);

// product per page
router.get('/product-list/:page', productPerPageController);

// search Product
router.get('/search/:keyword', searchProductController);

// similar Product
router.get('/related-products/:pid/:cid', relatedProductController);

// get product category wise
router.get('/product-category/:slug', productCategoryController);

// payment token routes
router.get('/braintree/token', braintreeTokenController);

//payment route
router.post('/braintree/payment', requireSignin, brainTreePaymentController);




export default router;