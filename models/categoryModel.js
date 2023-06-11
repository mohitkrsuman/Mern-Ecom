import mongoose from "mongoose";
// slugify is used to remove white space

const categorySchema = new mongoose.Schema({
   name:{
      type : String,
      required : true,
      unique: true,
   },
   slug: {
      type: String,
      lowercase: true
   }

});

export default mongoose.model("Category", categorySchema);