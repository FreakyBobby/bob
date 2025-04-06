require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// Import models
const Job = require('./models/Job');
const Application = require('./models/Application');
const User = require('./models/User');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/joblyft')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Job posting routes
app.get('/api/jobs', async (req, res) => {
    try {
        const jobs = await Job.find({ status: 'approved' });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/jobs', async (req, res) => {
    try {
        const job = new Job(req.body);
        await job.save();
        res.status(201).json(job);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Application routes
app.post('/api/applications', async (req, res) => {
    try {
        const application = new Application(req.body);
        await application.save();
        res.status(201).json(application);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.get('/api/applications', async (req, res) => {
    try {
        const applications = await Application.find();
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// User routes
app.post('/api/users/register', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.post('/api/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        res.json({ message: 'Login successful', user: { id: user._id, name: user.name, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Advanced job search with filters
app.get('/api/jobs/search', async (req, res) => {
    try {
        const { 
            keyword, 
            location, 
            jobType, 
            industry, 
            salaryRange,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            page = 1,
            limit = 10
        } = req.query;

        const query = { status: 'approved' };
        
        if (keyword) {
            query.$or = [
                { title: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } }
            ];
        }
        if (location) query.location = { $regex: location, $options: 'i' };
        if (jobType) query.jobType = jobType;
        if (industry) query.industry = industry;
        if (salaryRange) query.salaryRange = salaryRange;

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const jobs = await Job.find(query)
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('postedBy', 'name company');

        const total = await Job.countDocuments(query);

        res.json({
            jobs,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Job bookmarking
app.post('/api/jobs/:jobId/bookmark', async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.bookmarkedJobs) {
            user.bookmarkedJobs = [];
        }

        const jobIndex = user.bookmarkedJobs.indexOf(req.params.jobId);
        if (jobIndex === -1) {
            user.bookmarkedJobs.push(req.params.jobId);
            await user.save();
            res.json({ message: 'Job bookmarked successfully' });
        } else {
            user.bookmarkedJobs.splice(jobIndex, 1);
            await user.save();
            res.json({ message: 'Job unbookmarked successfully' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user's bookmarked jobs
app.get('/api/users/:userId/bookmarks', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate('bookmarkedJobs');
        res.json(user.bookmarkedJobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Application status tracking
app.patch('/api/applications/:applicationId/status', async (req, res) => {
    try {
        const { status } = req.body;
        const application = await Application.findByIdAndUpdate(
            req.params.applicationId,
            { status },
            { new: true }
        );
        res.json(application);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get application statistics
app.get('/api/applications/stats', async (req, res) => {
    try {
        const stats = await Application.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// User profile management
app.put('/api/users/:userId/profile', async (req, res) => {
    try {
        const { name, email, phone, skills, education, experience } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { name, email, phone, skills, education, experience },
            { new: true }
        );
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user profile
app.get('/api/users/:userId/profile', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .select('-password')
            .populate('bookmarkedJobs');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 