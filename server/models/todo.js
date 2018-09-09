var mongoose=require('mongoose');

var Todo=mongoose.model('Todo',{
  text:{
    type:String,
    required:true,
    minlength:1,
    trim:true
  },
  completed:{
    type:Boolean,
    required:true,
    default:false
  },
  completedAt:{
    type:Number,
    required:true,
    default:null
  }
});


module.exports={Todo};