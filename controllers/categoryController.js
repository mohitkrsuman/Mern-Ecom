import categoryModel from "../models/categoryModel.js";
import slugify from 'slugify';

export const createCategoryController = async(req, res) => {
   try{
      const { name } = req.body;
      if(!name){
         return res.status(400).send({
            success : false,
            message : 'Name is required'
         })
      }

      const existingCategory = await categoryModel.findOne({name});
      if(existingCategory){
         return res.status(400).send({
            success : false,
            message : 'Category already exists'
         })
      }

      const category = new categoryModel(
         {
            name, 
            slug: slugify(name)
         }).save();

      res.status(201).send({
         success : true,
         message : 'Category created successfully',
         category
      })

   }catch(error){
      console.log(error);
      res.status(500).send({
         success : false,
         error,
         message: 'Error in Category'
      })
   }
}

// Update Category

export const updateCategoryController = async(req, res) => {
   try{
      const { name } = req.body;
      const { id } = req.params;
      const category = await categoryModel.findByIdAndUpdate(id, {name, slug : slugify(name)}, {new : true});

      res.status(200).send({
         success : true,
         message : 'Category updated successfully',
         category
      });

      if(!category){
         return res.status(400).send({
            success : false,
            message : 'Category does not exists'
         });
      }


   }catch(error){
      console.log(error);
      res.status(500).send({
         success : false,
         error,
         message: 'Error in Updation of Category'
      });
   }
}

// get all category controller
export const categoryController = async(req, res) => {
   try{
       const category = await categoryModel.find({}).sort({createdAt : -1});
       res.status(200).send({
          success : true,
          message : 'All Categories List',
          category
       })
   }catch(error){
      console.log(error);
      res.status(500).send({
         success: false,
         message : 'Error in getting all categories',
         error
      });
   }
}


// single category controller
export const singleCategoryController = async(req, res) => {
   try{
       const category = await categoryModel.findOne({ slug : req.params.slug });
       res.status(200).send({
         success : true,
         message : 'Single Category',
         category
       });

   }catch(error){
      console.log(error);
      res.status(500).send({
         success: false,
         message: 'Error in getting single category',
         error
      });
   }
}


// Delete Category Controller
export const deleteCategoryController = async(req, res) => {
   try{
      const { id } = req.params;
      await categoryModel.findByIdAndDelete(id);

      res.status(200).send({
         success: true,
         message: 'Category deleted successfully'
      });
   }catch(error){
      console.log(error);
      res.status(500).send({
         success: false,
         message: 'Error in deleting category',
         error
      });
   }
}