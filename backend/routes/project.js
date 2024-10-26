// routes/project.js
const express = require('express');
const Project = require('../models/Project'); // Import the Project model
const auth = require('../middleware/auth'); // Import the auth middleware
const router = express.Router();

// POST /api/projects - Create a new project
router.post('/', async (req, res) => {
    const { name, createdBy } = req.body;

    try {
        const project = new Project({ name, createdBy });
        await project.save();
        res.status(201).json(project);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating project', error: error.message });
    }
});

// GET /projects/:projectId/assigned-users/:userId
router.get('/:projectId/assigned-users/:userId', auth, async (req, res) => {
    const { projectId, userId } = req.params;

    try {
        // Find the project by ID
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check if the userId is in the assignedUsers array
        const isAssigned = project.assignedUsers.includes(userId);

        res.status(200).json({ isAssigned });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error checking user assignment', error: error.message });
    }
});

module.exports = router;
