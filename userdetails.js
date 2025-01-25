const mongoose=require("mongoose");

const userdetailschema = new mongoose.Schema({
    
    email:{type: String,required:true, unique: true},
    password:String,
    phone:{type: String,required:true, unique: true},
    //phone:String,
    //insights: Array,
    name: String,  // Add name field
    bio: String,     // Add bio field (optional, defaults to empty string)
    profession: String // Add profession field (optional, defaults to empty string)

},{
    collection:"userinfo"
});
mongoose.model("userinfo",userdetailschema);
