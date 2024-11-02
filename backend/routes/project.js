// routes/project.js
const express = require('express');
const Project = require('../models/Project'); // Import the Project model
const User = require('../models/User'); // Import the User model
const auth = require('../middleware/auth'); // Import the auth middleware

const router = express.Router();

// POST /api/projects - Create a new project
router.post('/', auth, async (req, res) => {
    const { name } = req.body;

    try {
        // Create a new project with the creator as the first assigned user
        const project = new Project({
            name,
            createdBy: req.user.id, // Save the creator's ID as the project owner
            assignedUsers: [req.user.id] // Assign the creator as the first user
        });

        await project.save();
        res.status(201).json({ message: 'Project created successfully', project });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating project', error: error.message });
    }
});

// PUT /projects/:projectId/assign - Assign additional users to the project
router.put('/:projectId/assign', auth, async (req, res) => {
    const { userIds } = req.body; // Expecting an array of user IDs or emails
    const { projectId } = req.params;

    if (!userIds || !Array.isArray(userIds)) {
        return res.status(400).json({ message: 'User IDs or emails are required' });
    }

    try {
        // Find the project
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check if the requester is the project creator
        if (String(project.createdBy) !== String(req.user.id)) {
            return res.status(403).json({ message: 'You are not authorized to assign users to this project' });
        }

        // Assign additional users
        for (const userId of userIds) {
            const user = await User.findById(userId) || await User.findOne({ email: userId });
            if (user) {
                if (!project.assignedUsers.includes(user.id)) {
                    project.assignedUsers.push(user.id); // Add user to assignedUsers array
                    console.log(`User assigned: ${user.id}`); // Log the user assignment
                } else {
                    console.log(`User already assigned: ${user.id}`); // Log if user was already assigned
                }
            } else {
                console.log(`User not found for ID or email: ${userId}`); // Log if user not found
            }
        }

        await project.save();
        res.status(200).json({ message: 'Users assigned successfully', project });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error assigning users to project', error: error.message });
    }
});

// GET /projects/:projectId/assigned-users/:userId - Check if a user is assigned to a project
router.get('/:projectId/assigned-users/:userId', auth, async (req, res) => {
    const { projectId, userId } = req.params;

    try {
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const isAssigned = project.assignedUsers.includes(userId);
        res.status(200).json({ isAssigned });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error checking user assignment', error: error.message });
    }
});

module.exports = router;
