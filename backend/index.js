
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
      try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ error: "Invalid destination ID format" });
        }
        const query = { _id: new ObjectId(id) };
        const result = await destinationsCollection.findOne(query);
        if (!result) {
          return res.status(404).json({ error: "Destination not found" });
        }
        res.json(result);
      } catch (err) {
        res.status(500).json({ error: "Server error fetching destination" });
      }
    });

    app.patch("/destinations/:id", async (req, res) => {
      try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ error: "Invalid destination ID format" });
        }
        const updatedDestination = { ...req.body };
        delete updatedDestination._id;
        
        const query = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: updatedDestination,
        };
        const result = await destinationsCollection.updateOne(query, updateDoc);
        res.json({ success: true, message: "Destination updated successfully", result });
      } catch (err) {
        res.status(500).json({ error: "Server error updating destination" });
      }
    });

    app.delete("/destinations/:id", async (req, res) => {
      try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ error: "Invalid destination ID format" });
        }
        const query = { _id: new ObjectId(id) };
        const result = await destinationsCollection.deleteOne(query);
        res.json({ success: true, message: "Destination deleted successfully", result });
      } catch (err) {
        res.status(500).json({ error: "Server error deleting destination" });
      }
    });

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
