const expect=require('expect');
const request=require('supertest');
const {ObjectID}=require('mongodb');
const {app}=require('./../server');
const {Todo}=require('./../models/todo');
const {User}=require('./../models/user');
const {todos,populateTodos,users,populateUsers}=require('./seed/seed');


beforeEach(populateTodos);
beforeEach(populateUsers);

describe('POST /todos', ()=>{
    it('should create a new todo', (done)=>{
      var text='testing todo';
      request(app)
        .post('/todos')
        .send({text})
        .expect(200)
        .expect((res)=>{
          expect(res.body.text).toBe(text);
        })
        .end((err,res)=>{
          if(err){
            return done(err);
          }
          Todo.find({text:'testing todo'}).then((todos)=>{
            expect(todos.length).toBe(1);
            expect(todos[0].text).toBe(text);
            done();
          }).catch((e)=>done(e));
        });
    });

    it('should not create a new todo with invalid data', (done)=>{

      request(app)
        .post('/todos')
        .send({})
        .expect(400)
        .end((err,res)=>{
          if(err){
            return done(err);
          }
          Todo.find().then((todos)=>{
            expect(todos.length).toBe(2);
            done();
          }).catch((e)=>done(e));
        });
    });
});


describe('GET /todos', ()=>{
    it('should get all the todos', (done)=>{
      request(app)
        .get('/todos')
        .expect(200)
        .expect((res)=>{
          expect(res.body.todos.length).toBe(2);
        }).end(done);
    });
});

describe('GET /todos/:id', ()=>{
  it('should return todo doc', (done)=>{
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res)=>{
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('should return 400 if todo not found', (done)=>{
    var newId=new ObjectID().toHexString();
    request(app)
      .get(`/todos/${newId}`)
      .expect(400)
      .end(done);
  });

  it('should return 404 for non-object ids', (done)=>{
    request(app)
      .get('/todos/123abc')
      .expect(404)
      .end(done);
  });
});


describe('Delete /todos/:id', ()=>{
  it('should delete todo doc', (done)=>{
    var newId=todos[0]._id.toHexString();
    request(app)
      .delete(`/todos/${newId}`)
      .expect(200)
      .expect((res)=>{
        expect(res.body.todo._id).toBe(hexId);
      })
      .end((err,res)=>{
        if(err){
          return done(err);
        }

        Todo.findById(newId).then((todo)=>{
          expect(todo).toNotExist();
          done();
        });
      });
  });

  it('should return 400 if todo not found', (done)=>{
    var newId=new ObjectID().toHexString();
    request(app)
      .delete(`/todos/${newId}`)
      .expect(400)
      .end(done);
  });

  it('should return 404 for non-object ids', (done)=>{
    request(app)
      .delete('/todos/123abc')
      .expect(404)
      .end(done);
  });
});

describe('Patch /todos/:id', ()=>{
  it('should update todo', (done)=>{
    var newId=todos[0]._id.toHexString();
    var text='this should be new test';
    request(app)
      .patch(`/todos/${newId}`)
      .send({
        completed:true,
        text
      })
      .expect(200)
      .expect((res)=>{
          expect(res.body.todo.text).toBe(text);
          expect(res.body.todo.completed).toBe(true);
          expect(res.body.todo.completedAt).toBeA('number');
        });
      }).end(done);
  });

  it('should clear completedAt when todo is not completed', (done)=>{
    var newId=todos[1]._id.toHexString();
    var text='this should be new test 22222';
    request(app)
      .patch(`/todos/${newId}`)
      .send({
        completed:false,
        text
      })
      .expect(200)
      .expect((res)=>{
          expect(res.body.todo.text).toBe(text);
          expect(res.body.todo.completed).toBe(false);
          expect(res.body.todo.completedAt).toNotExist();
        });
      }).end(done);
  });
});

describe('GET /users/me', ()=>{
  it('should return user if authenticated', (done)=>{
    request(app)
      .get('/users/me')
      .set('x-auth',users[0].tokens[0].token)
      .expect(200)
      .expect((res)=>{
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      }).end(done);
  });

  it('should return 401 if not authenticated', (done)=>{
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res)=>{
        expect(res.body).toEqual({});
      }).end(done);
  });
});

describe('POST /users', ()=>{
  it('should create a user', (done)=>{
    var email='x@mail.com';
    var password='dfg5t5e3';

    request(app)
      .post('/users')
      .send({email,password})
      .expect(200)
      .expect((res)=>{
        expect(res.headers['x-auth']).toExist();
        expect(res.body._id).toExist();
        expect(res.body.email).toBe(email);
      }).end((err)=>{
        if(err){
          return done(err);
        }
        User.findOne({email}).then((user)=>{
          expect(user).toExist;
          expect(user.password).toNotBe(password);
          done();
        }).catch((e)=>done(e));
      });
  });

  it('should return validation errors for invalid data', (done)=>{
    var email='xmail.com';
    var password='dfg5t';

    request(app)
      .post('/users')
      .send({email,password})
      .expect(400)
      .end(done);
  });

  it('should not create user if email in use', (done)=>{
    var email=users[0].email;
    var password='dfg5sadt5e3';

    request(app)
      .post('/users')
      .send({email,password})
      .expect(400)
      .end(done);
  });
});

describe('POST /users/login',()=>{
  it('should login user & return auth token',(done)=>{
    request(app)
      .post('/users/login')
      .send({
        email:users[1].email,
        password:users[1].password
      })
      .expect(200)
      .expect((res)=>{
        expect(res.headers['x-auth']).toExist();
      })
      .end((err,res)=>{
        if(err) {
          return done(err);
        }

        User.findById(user1._id).then((user)=>{
          expect(user.tokens[0]).toInclude({
            access:'x-auth',
            token:res.headers['x-auth']
          });
          done();
        }).catch((e)=>done(e));
      });
  });

  it('should reject for invalid credentials', (done)=>{
    request(app)
      .post('/users/login')
      .send({
        email:'kkk@gm.com',
        passwrod:'nnlk'
      })
      .expect(400)
      .expect((res)=>{
        expect(res.headers['x-auth']).toNotExist;
      })
      .end((err,res)=>{
        if(err){
          return done(err);
        }

        User.findById(users[1]._id).then((user)=>{
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((e)=>done(e));
      });
  });
});
