const express = require('express')
const { MongoClient } = require('mongodb');
const cors = require('cors')
require('dotenv').config()
const ObjectId = require('mongodb').ObjectId ;

const app = express()
const port = 5000

// middleware 
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mm4zp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  async function run(){
    try{
        await client.connect()
        // console.log('database connected') 
        const database = client.db('sunGlass') 
        const productsCollection = database.collection('products') 
        const bookingsCollection = database.collection('bookings') 
        const usersCollection = database.collection('users') 
        // explore
        const exploresCollection = database.collection('explores') 
        // GET API 
        app.get('/products',async(req,res)=>{
            const cursor = productsCollection.find({}) 
            const products = await cursor.toArray() 
            res.send(products)
        })
        // POST API 
        app.post('/products',async(req,res)=>{
            const product = req.body ;
            console.log('hit the post api',product) 
      const result = await productsCollection.insertOne(product)
      console.log(result)
          res.json(result)
            
        })
        // Get Single Product 
        app.get('/singleProduct/:id',async(req,res)=>{
          const result = await productsCollection.find({_id: ObjectId(req.params.id)}).toArray()
          res.send(result[0])
        })
        // confirm order 
        app.post("/confirmOrder",async(req,res)=>{
          const result = await bookingsCollection.insertOne(req.body) 
          res.send(result)
        })
        // My Confirm order 
        app.get('/myOrders/:email', async(req,res)=>{
          const result = await bookingsCollection.find({email: req.params.email}).toArray()
          res.send(result)

        })
        // Delete Order
        app.delete('/deleteOrder/:id',async(req,res)=>{
          const result = await bookingsCollection.deleteOne({_id: ObjectId(req.params.id)
            
          })
          res.send(result);
        })
        app.get('/users/:email',async(req,res)=>{
          const email = req.params.email 
          const query = {email : email} 
          const user = await usersCollection.findOne(query) 
          let isAdmin = false 
          if(user?.role === 'admin'){
            isAdmin = true 
          }
          res.json({admin : isAdmin})
        })

        app.post('/users',async(req,res)=>{
          const user = req.body 
          const result = await usersCollection.insertOne(user)
          console.log(result)
          res.json(result)
        })

        app.put('/users/admin',async(req,res)=>{
          const user = req.body ;
          console.log('put', user)
          const filter = {email : user.email} 
          const updateDoc = {$set : {role : 'admin'}}
          const result = await usersCollection.updateOne(filter,updateDoc)
          res.json(result)
        })

        // All Order 
        app.get('/allOrders',async(req,res)=>{
          const result = await bookingsCollection.find({}).toArray()
          res.send(result)
        })

        app.post('/addProduct',(req,res)=>{
          exploresCollection.insertOne(req.body).then(result=>{
            res.send(result.insertedId)
          })
        })

        app.get('/exploreProduct',async(req,res)=>{
          const result = await exploresCollection.find({}).toArray()
          res.send(result)
        })

    }
    finally{
        // await client.close()
    }
  }
  run().catch(console.dir)

app.get('/', (req, res) => {
  res.send('Hello Node Js')
})

app.listen(port, () => {
  console.log(`Listening Port : ${port}`)
})