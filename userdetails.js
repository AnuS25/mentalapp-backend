const mongoose=require("mongoose");

const userdetailschema = new mongoose.Schema({
        userId: { type: mongoose.Schema.Types.ObjectId, auto: true }, // Optional: you can store _id as userId

    
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
//mongoose.model("userinfo",userdetailschema);
const user = mongoose.model("userinfo", userdetailschema); // Use "userinfo" as model name
module.exports = user; // Export the model as 'user'
