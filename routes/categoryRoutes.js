import express from 'express';
import { isAdmin, requireSignin } from '../middlewares/authMiddleware.js';
import { 
   categoryController, 
   createCategoryController, 
   deleteCategoryController, 
   singleCategoryController, 
   updateCategoryController 
} from '../controllers/categoryController.js';
const router = express.Router();

//routes
router.post('/create-category', requireSignin, isAdmin, createCategoryController);

// Update Category
router.put('/update-category/:id', requireSignin, isAdmin, updateCategoryController);

// get all category
router.get('/get-category', categoryController);

// single category
router.get('/single-category/:slug', singleCategoryController);

// Delete category
router.delete('/delete-category/:id', requireSignin, isAdmin, deleteCategoryController);

export default router;