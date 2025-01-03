const mongoose=require("mongoose");

const userdetailschema = new mongoose.Schema({
    
    email:{type: String, unique: true},
    password:String,
    phone:{type: String, unique: true},
    //phone:String,
},{
    collection:"userinfo"
});
mongoose.model("userinfo",userdetailschema);