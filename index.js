import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { MongoClient } from 'mongodb';

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const client = new MongoClient(
  `mongodb://${encodeURIComponent(process.env.DB_USER)}:${encodeURIComponent(process.env.DB_PASSWORD)}@ac-jspayvi-shard-00-00.chuo2lm.mongodb.net:27017,ac-jspayvi-shard-00-01.chuo2lm.mongodb.net:27017,ac-jspayvi-shard-00-02.chuo2lm.mongodb.net:27017/?ssl=true&replicaSet=atlas-a63ca7-shard-0&authSource=admin`
);

async function startServer() {
  try {
    await client.connect();

    console.log("MongoDB Connected Successfully!");

    const database = client.db("hireloopdb");
    const usersCollection = database.collection("user");

    app.get('/', (req, res) => {
      res.send('Hello World!');
    });

    app.get('/user', async (req, res) => {
      try {
        const result = await usersCollection.find({}).toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Failed to load users" });
      }
    });

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

  } catch (error) {
    console.error("Server error:", error);
  }
}

startServer();