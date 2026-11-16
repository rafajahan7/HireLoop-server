
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { MongoClient, ObjectId } from 'mongodb';

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

    // Collections
    const usersCollection = database.collection("user");
    const jobsCollection = database.collection("jobs");

    // Home Route
    app.get('/', (req, res) => {
      res.send('Hello World!');
    });

    // Get All Users
    app.get('/user', async (req, res) => {
      try {
        const result = await usersCollection.find({}).toArray();
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({
          message: "Failed to load users"
        });
      }
    });

    // Get All Jobs
    // Get All Jobs

// Get Jobs with MongoDB Filters
app.get('/jobs', async (req, res) => {
  try {
    const query = {};

    console.log("Received filters:", req.query);

    // Filter by one or multiple job types
    if (req.query.jobType) {
      const types = String(req.query.jobType)
        .split(",")
        .filter(Boolean);

      query.jobType = { $in: types };
    }

    // Filter by remote status
    if (req.query.isRemote !== undefined) {
      query.isRemote = req.query.isRemote === "true";
    }

    console.log("MongoDB query:", query);

    const result = await jobsCollection
      .find(query)
      .toArray();

    res.status(200).json(result);

  } catch (error) {
    console.error("Error fetching jobs:", error);

    res.status(500).json({
      message: "Failed to load jobs"
    });
  }
});


    // Delete Job
    app.delete('/jobs/:id', async (req, res) => {
      try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
          return res.status(400).send({
            message: "Invalid job ID"
          });
        }

        const result = await jobsCollection.deleteOne({
          _id: new ObjectId(id)
        });

        if (result.deletedCount === 0) {
          return res.status(404).send({
            message: "Job not found"
          });
        }

        res.status(200).send({
          message: "Job deleted successfully"
        });

      } catch (error) {
        console.error("Error deleting job:", error);

        res.status(500).send({
          message: "Failed to delete job"
        });
      }
    });

    // Start Server
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

  } catch (error) {
    console.error("Server error:", error);
  }
}

startServer();
