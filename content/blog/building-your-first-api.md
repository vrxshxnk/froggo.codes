---
title: "Building Your First REST API with Node.js and Express"
excerpt: "Step-by-step guide to creating a robust REST API using Node.js, Express, and MongoDB. Perfect for beginners!"
date: "2025-05-25"
author: "Froggo"
tags: ["nodejs", "express", "api", "backend", "mongodb"]
featured: true
---

# Building Your First REST API with Node.js and Express

Creating a REST API is a fundamental skill for any full-stack developer. In this comprehensive guide, we'll build a complete API for managing a task list, covering all the essential concepts you need to know.

## What is a REST API?

REST (Representational State Transfer) is an architectural style for designing networked applications. A RESTful API uses HTTP requests to perform CRUD (Create, Read, Update, Delete) operations on resources.

### Key Principles of REST:

- **Stateless**: Each request must contain all information needed to understand it
- **Resource-based**: Everything is treated as a resource with unique URLs
- **HTTP Methods**: Use standard HTTP methods (GET, POST, PUT, DELETE)
- **JSON Format**: Data is typically exchanged in JSON format

## Setting Up the Project

First, let's initialize our project and install the necessary dependencies:

```bash
mkdir task-api
cd task-api
npm init -y
npm install express mongoose dotenv cors helmet
npm install -D nodemon
```

### Project Structure

```filestructure
task-api/
├── models/
│   └── Task.js
├── routes/
│   └── tasks.js
├── middleware/
│   └── auth.js
├── .env
├── server.js
└── package.json
```

## Creating the Server

Let's start by setting up our Express server:

```javascript
// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Cross-origin resource sharing
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Database connection
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/taskapi",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

// Routes
app.use("/api/tasks", require("./routes/tasks"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

## Creating the Task Model

Define the data structure using Mongoose:

```javascript
// models/Task.js
const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    dueDate: {
      type: Date,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Indexes for better query performance
taskSchema.index({ title: "text", description: "text" });
taskSchema.index({ completed: 1 });
taskSchema.index({ priority: 1 });

module.exports = mongoose.model("Task", taskSchema);
```

## Creating the Routes

Now let's implement all the CRUD operations:

```javascript
// routes/tasks.js
const express = require("express");
const Task = require("../models/Task");
const router = express.Router();

// GET /api/tasks - Get all tasks with optional filtering
router.get("/", async (req, res) => {
  try {
    const {
      completed,
      priority,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    // Build filter object
    const filter = {};

    if (completed !== undefined) {
      filter.completed = completed === "true";
    }

    if (priority) {
      filter.priority = priority;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    // Calculate pagination
    const skip = (page - 1) * parseInt(limit);

    // Execute query
    const tasks = await Task.find(filter)
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Task.countDocuments(filter);

    res.json({
      tasks,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tasks/:id - Get a single task
router.get("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid task ID" });
    }
    res.status(500).json({ error: error.message });
  }
});

// POST /api/tasks - Create a new task
router.post("/", async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ error: errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/tasks/:id - Update a task
router.put("/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid task ID" });
    }
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ error: errors });
    }
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/tasks/:id/toggle - Toggle task completion
router.patch("/:id/toggle", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    task.completed = !task.completed;
    await task.save();

    res.json(task);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid task ID" });
    }
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/tasks/:id - Delete a task
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task deleted successfully", task });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid task ID" });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

## Environment Configuration

Create a `.env` file for environment variables:

```bash
# .env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/taskapi
NODE_ENV=development
```

## Testing the API

You can test your API using tools like Postman, curl, or create a simple test script:

```bash
# Create a task
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Learn Node.js",
    "description": "Complete the Node.js tutorial",
    "priority": "high",
    "dueDate": "2024-02-01"
  }'

# Get all tasks
curl http://localhost:3000/api/tasks

# Get tasks with filtering
curl "http://localhost:3000/api/tasks?completed=false&priority=high"

# Update a task
curl -X PUT http://localhost:3000/api/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# Delete a task
curl -X DELETE http://localhost:3000/api/tasks/TASK_ID
```

## Adding Validation and Security

### Input Validation

Consider using libraries like `joi` or `express-validator` for more robust validation:

```bash
npm install joi
```

```javascript
const Joi = require("joi");

const taskValidationSchema = Joi.object({
  title: Joi.string().required().trim().max(100),
  description: Joi.string().trim().max(500),
  priority: Joi.string().valid("low", "medium", "high"),
  dueDate: Joi.date(),
  tags: Joi.array().items(Joi.string().trim()),
});

// Use in route
router.post("/", async (req, res) => {
  try {
    const { error, value } = taskValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const task = new Task(value);
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Package.json Scripts

Update your package.json with useful scripts:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

## Next Steps

1. **Authentication**: Add JWT-based authentication
2. **Rate Limiting**: Implement rate limiting to prevent abuse
3. **Documentation**: Use tools like Swagger for API documentation
4. **Testing**: Write unit and integration tests
5. **Deployment**: Deploy to platforms like Heroku, Vercel, or AWS

## Best Practices

1. **Use proper HTTP status codes**
2. **Implement comprehensive error handling**
3. **Validate all input data**
4. **Use environment variables for configuration**
5. **Implement logging for debugging**
6. **Add proper security headers**
7. **Use database indexes for better performance**

Congratulations! You've built your first REST API. This foundation will serve you well as you build more complex applications.

---

_Ready to build full-stack applications? Our comprehensive course covers everything from API development to frontend integration with real-world projects._
