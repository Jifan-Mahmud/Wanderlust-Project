
const { MongoClient, ServerApiVersion,ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const url = process.env.MONGODB_URL;

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());

const client = new MongoClient(url, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    
    await client.connect();

    
    const db = client.db("wonderlust");
    const destinationsCollection = db.collection("destinations");



    app.get("/destinations", async (req, res) => {
      const cursor = destinationsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get("/destinations/:id", async (req, res) => {
      const {id} = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await destinationsCollection.findOne(query);
      res.send(result);
    })

    app.post("/destinations", async (req, res) => {
      const newDestination = req.body;
      console.log(newDestination);
      const result = await destinationsCollection.insertOne(newDestination);
      res.send(result);
    });
    
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running finelly");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
