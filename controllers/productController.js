import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import orderModel from "../models/orderModel.js";
import fs from 'fs';
import slugify from "slugify";
import braintree from 'braintree';
import dotenv from 'dotenv';
import router from "../routes/ProductRoutes.js";
import { requireSignin } from "../middlewares/authMiddleware.js";

dotenv.config();

//payment gateway
var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY
});



// using express-formidable to upload files

export const createProductController = async(req, res) => {
   try {
      const { name, slug, description, price, category, quantity, shipping } = req.fields;
      const { photo } = req.files;

      // validation
      switch(true){
         case !name:
            return res.status(400).send({error: 'Name is required'});
         case !description:
            return res.status(400).send({error: 'description is required'});
         case !price:
            return res.status(400).send({error: 'price is required'});
         case !category:
            return res.status(400).send({error: 'category is required'});
         case !quantity:
            return res.status(400).send({error: 'quantity is required'});
         case !photo && photo.size > 1000000:
            return res.status(400).send({error: 'photo is required and should be less than 1mb'});
      }

      const products = await new productModel({...req.fields, slug: slugify(name)});

      if(photo){
         products.photo.data = fs.readFileSync(photo.path);
         products.photo.contentType = photo.type;
      }

      await products.save();

      res.status(201).send({
         success : true,
         message: 'Product Created Successfully',
         products
      })

   } catch (error) {
      console.log(error);
      res.status(500).send({
         success: false,
         message: 'Error in creating product',
         error
      });
   }
}


// get all products

export const getProductController = async(req, res) => {
   try {
      const products = await productModel
         .find({})
         .populate('category')
         .select("-photo")
         .limit(12)
         .sort({createdAt: -1});

      res.status(200).send({
         success : true,
         message: 'Products Fetched Successfully',
         products,
         totalCount : products.length
      });

   } catch (error) {
      console.log(error);
      res.status(500).send({
         success: false,
         message: 'Error in getting products',
         error
      });
   }
}


// get single product controller
export const getSingleProductController = async(req, res) => {
   try {
      const product = await productModel
         .findOne({slug: req.params.slug})
         .select("-photo")
         .populate("category");

      if(!product){
         res.status(404).send({
            success: false,
            message: 'Product not Found'
         })
      }

      res.status(200).send({
         success: true,
         message: 'Product Fetched Successfully',
         product
      });
   } catch (error) {
      console.log(error);
      res.status(500).send({
         success: false,
         message: 'Error in getting single product',
         error
      });
   }
}


// get photo controller
export const productPhotoController = async(req, res) => {
   try {
      // const { id } = req.params;
      const product = await productModel.findById(req.params.id).select("photo");

      if(product.photo.data){
         res.set("Content-Type", product.photo.contentType);
         return res.status(200).send(product.photo.data);
      }

   } catch (error) {
      console.log(error)
      res.status(500).send({
         success: false,
         message: 'Error in getting photo',
         error
      });
   }
}


// delete product controller
export const deleteProductController = async(req, res) => {
   try {
        await productModel.findByIdAndDelete(req.params.id).select("-photo");
        res.status(200).send({
         success: true,
         message: 'Product Deleted Successfully'
        })
   } catch (error) {
      console.log(error);
      res.status(500).send({
         success: false,
         message: 'Error in deleting product',
         error
      });
   }
}


//upate product controller
export const updateProductController = async (req, res) => {
   try {
     const { name, description, price, category, quantity, shipping } =
       req.fields;
     const { photo } = req.files;
     //alidation
     switch (true) {
       case !name:
         return res.status(500).send({ error: "Name is Required" });
       case !description:
         return res.status(500).send({ error: "Description is Required" });
       case !price:
         return res.status(500).send({ error: "Price is Required" });
       case !category:
         return res.status(500).send({ error: "Category is Required" });
       case !quantity:
         return res.status(500).send({ error: "Quantity is Required" });
       case photo && photo.size > 1000000:
         return res
           .status(500)
           .send({ error: "photo is Required and should be less then 1mb" });
     }
 
     const products = await productModel.findByIdAndUpdate(
       req.params.pid,
       { ...req.fields, slug: slugify(name) },
       { new: true }
     );
     if (photo) {
       products.photo.data = fs.readFileSync(photo.path);
       products.photo.contentType = photo.type;
     }
     await products.save();
     res.status(201).send({
       success: true,
       message: "Product Updated Successfully",
       products,
     });
   } catch (error) {
     console.log(error);
     res.status(500).send({
       success: false,
       error,
       message: "Error in Update product",
     });
   }
 };


 // get Filtered Products Controller
 export const productFiltersController = async(req, res) => {
   try{
      const { checked, radio } = req.body;
      let args = {};

      if(checked.length > 0){
         args.category = checked;
      }
      if(radio.length){
         args.price = {$gte : radio[0], $lte : radio[1]};
      }

      const products = await productModel.find(args);
      res.status(200).send({
         success: true,
         message: 'Filtered Products Fetched Successfully',
         products
      });
   }catch(error){
      res.status(500).send({
         success: false,
         message: 'Error in getting filtered products',
         error
      })
   }
 }


 // count controller (use in pagination)
 export const productCountController = async(req, res) => {
   try{
      const total = await productModel.find({}).estimatedDocumentCount();
      res.status(200).send({
         success: true,
         message: 'Product Count Fetched Successfully',
         total
      });
   }catch(error){
      console.log(error);
      res.status(500).send({
         message : 'Error in product count',
         error,
         success: false
      })
   }
 }


 // product per page controller
 export const productPerPageController = async(req, res) => {
   try{
      const perPage = 6;
      const page = req.params.page ? req.params.page : 1;
      const products = await productModel.find({}).select("-photo").skip((page-1) * perPage).limit(perPage).sort({createdAt: -1});

      res.status(200).send({
         success : true,
         message : 'Products per page fetched successfully',
         products,
      })

   }catch(error){
      console.log(error);
      res.status(500).send({
         success : false,
         message : 'Error in product per page',
         error,
      })
   }
 }


 // search product

 export const searchProductController = async(req, res) => {
    try{
       const { keyword } = req.params;
       const results = await productModel.find({
         $or : [
            {name : {$regex: keyword, $options: "i"}},
            {description : {$regex: keyword, $options: "i"}}
         ]
       }).select("-photo");
       res.json(results);
    }catch(error){
       console.log(error);
       res.status(400).send({
         success : false,
         message : 'Error in search product',
         error,
       })
    }
 }


 // Related Product Controller

 export const relatedProductController = async(req, res) => {
   try{
       const { pid, cid } = req.params;
       const products = await productModel.find({
          category : cid,
          _id : {$ne : pid}
       }).select("-photo").limit(3).populate("category");
       
       res.status(200).send({
          success : true,
          message : 'Related Product Fetched Successfully',
          products
       })

   }catch(error){
      console.log(error);
      res.status(500).send({
         success : false,
         message : 'Error in related Product',
         error
      })
   }
 }


 // product category controller
 export const productCategoryController = async(req, res) => {
   try {
        const category = await categoryModel.findOne({slug : req.params.slug});
        const products = await productModel.find({category}).populate("category");

        res.status(200).send({
           success : true,
           category,
           products
        });
   } catch (error) {
      console.log(error);
      res.status(500).send({
         success: false,
         message : 'Error in Showing product Category Wise',
         error
      })
   }
 }
 

//payment gateway api
//token
export const braintreeTokenController = async (req, res) => {
   try {
     gateway.clientToken.generate({}, function (err, response) {
       if (err) {
         res.status(500).send(err);
       } else {
         res.send(response);
       }
     });
   } catch (error) {
     console.log(error);
   }
 };
 
 //payment
 export const brainTreePaymentController = async (req, res) => {
   try {
     const { nonce, cart } = req.body;
     let total = 0;
     cart.map((i) => {
       total += i.price;
     });
     let newTransaction = gateway.transaction.sale(
       {
         amount: total,
         paymentMethodNonce: nonce,
         options: {
           submitForSettlement: true,
         },
       },
       function (error, result) {
         if (result) {
           const order = new orderModel({
             products: cart,
             payment: result,
             buyer: req.user._id,
           }).save();
           res.json({ ok: true });
         } else {
           res.status(500).send(error);
         }
       }
     );
   } catch (error) {
     console.log(error);
   }
 };

