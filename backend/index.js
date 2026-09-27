const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");
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

const JWTS = createRemoteJWKSet(
      new URL(`${process.env.CLIENT_URL}/api/auth/jwks`),
    );

const verifyToken = async (req,res,next)=>{
      const authHeader = req?.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const token = authHeader?.split(" ")[1];
      if(!token){
        return res.status(401).json({ error: "Unauthorized" });
      }
      try {
        const { payload } = await jwtVerify(token, JWTS);
        console.log(payload)
        return next(); 
      } catch (error) {
        return res.status(401).json({ error: "Unauthorized" });
      }
         
    }


    
async function run() {
  try {
    // await client.connect();

    const db = client.db("wonderlust");
    const destinationsCollection = db.collection("destinations");
    const bookingsCollection = db.collection("bookings");

    app.get("/destinations", async (req, res) => {
      const cursor = destinationsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/destinations/:id",verifyToken, async (req, res) => {
      try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
          return res
            .status(400)
            .json({ error: "Invalid destination ID format" });
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
          return res
            .status(400)
            .json({ error: "Invalid destination ID format" });
        }
        const updatedDestination = { ...req.body };
        delete updatedDestination._id;

        const query = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: updatedDestination,
        };
        const result = await destinationsCollection.updateOne(query, updateDoc);
        res.json({
          success: true,
          message: "Destination updated successfully",
          result,
        });
      } catch (err) {
        res.status(500).json({ error: "Server error updating destination" });
      }
    });

    app.delete("/destinations/:id", async (req, res) => {
      try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
          return res
            .status(400)
            .json({ error: "Invalid destination ID format" });
        }
        const query = { _id: new ObjectId(id) };
        const result = await destinationsCollection.deleteOne(query);
        res.json({
          success: true,
          message: "Destination deleted successfully",
          result,
        });
      } catch (err) {
        res.status(500).json({ error: "Server error deleting destination" });
      }
    });

    app.post("/destinations",verifyToken, async (req, res) => {
      const newDestination = req.body;
      console.log(newDestination);
      const result = await destinationsCollection.insertOne(newDestination);
      res.send(result);
    });

    app.post("/bookings",verifyToken, async (req, res) => {
      const newBooking = req.body;
      const result = await bookingsCollection.insertOne(newBooking);
      res.send(result);
    });

    app.get("/bookings/:userId", async (req, res) => {
      const { userId } = req.params;
      const query = { userId: userId };
      const result = await bookingsCollection.find(query).toArray();
      res.send(result);
    });

    app.delete("/bookings/:bookingId",verifyToken, async (req, res) => {
      const { bookingId } = req.params;
      const query = { _id: new ObjectId(bookingId) };
      const result = await bookingsCollection.deleteOne(query);
      res.send(result);
    });

    // await client.db("admin").command({ ping: 1 });
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
