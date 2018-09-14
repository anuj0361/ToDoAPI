const {ObjectID}=require('mongodb');
const {Todo}=require('./../../models/todo');
const {Todo}=require('./../../models/user');
const jwt=require('jsonwebtoken');

const userOne=new ObjectID();
const userTwo=new ObjectID();

const users=[{
  _id:userOne,
  email:'abc@m.com',
  password:'qwer',
  tokens:[{
    access:'auth',
    token:jwt.sign({_id:userOne,access:'auth'},'abc123').toString();
  }]
},{
  _id:userTwo,
  email:'asd@m.com',
  password:'asdf',
  tokens:[{
    access:'auth',
    token:jwt.sign({_id:userTwo,access:'auth'},'abc123').toString();
  }]
}];

const todos=[{
  _id: new ObjectID(),
  text:'First test todo',
  _creator:userOne
}, {
  _id: new ObjectID(),
  text:'Second test todo',
  completed:'true',
  completedAt:'12321',
  _creator:userTwo
}];

const populateUsers=(done)=>{
  User.remove({}).then(()=>{
    var user1=new User(users[0].save());
    var user2=new User(users[1].save());

    return Promise.all([user1,user2])
  }).then(()=>done());
};

const populateTodos=(done)=>{
  Todo.remove({}).then(()=>{
    return Todo.insertMany(todos);
  }).then(()=>done());
};

module.exports={todos,populateTodos,users,populateUsers};
