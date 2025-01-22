const mongoose=require("mongoose");

const userdetailschema = new mongoose.Schema({
    
    email:{type: String, unique: true},
    password:String,
    phone:{type: String, unique: true},
    //phone:String,
    insights: Array,
     name: { type: String, required: true },  // Add name field
    bio: { type: String, default: "" },     // Add bio field (optional, defaults to empty string)
    profession: { type: String, default: "" } // Add profession field (optional, defaults to empty string)

},{
    collection:"userinfo"
});
mongoose.model("userinfo",userdetailschema);
