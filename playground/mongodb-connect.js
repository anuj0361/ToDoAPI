const MongoClient=requrie('mongodb').MongoClient;

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err,db)=>{
  if(err) {
    return console.log('Unable to connect');
  }
  console.log('Connected to Mongo Server');

  db.collection('Todos').insertOne({
    text:'xyz',
    completed:false
  }, (err,result)=>{
      if(err){
        return console.log('Unable to insert');
      }
      console.log(JSON.stringify(result.ops,undefined,2));
    });

  db.collection('Todos').find().toArray().then((docs)=>{
    console.log(JSON.stringify(docs,undefined,2));
  },(err)=>{
    console.log('Error occured');
  });

  db.collection('User').insertOne({
    name:'Anuj',
    age:'24',
    location:'India'
  }, (err, result)=>{
    if(err){
      return console.log('Unable to insert');
    }
    console.log(JSON.stringify(result.ops,undefined,2));
  });
  db.close();

});
