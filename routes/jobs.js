const express = require('express');
const router = express.Router();
const JobPosting = require('../models/JobPostingFirestore');
const JobApplication = require('../models/JobApplicationFirestore');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

/**
 * PUBLIC ROUTES - For customer frontend
 */

// GET /api/jobs - Get all active job postings
router.get('/', async (req, res) => {
  try {
    const jobs = await JobPosting.find({ status: 'active' })
      .sort({ postedDate: -1 })
      .select('-createdBy');
    
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Failed to fetch job postings', error: error.message });
  }
});

// GET /api/jobs/:id - Get single job posting details
router.get('/:id', async (req, res) => {
  try {
    const job = await JobPosting.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job posting not found' });
    }
    
    res.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ message: 'Failed to fetch job posting', error: error.message });
  }
});

// POST /api/jobs/apply - Submit job application
router.post('/apply', async (req, res) => {
  try {
    const { jobId, name, email, phone, message, resumeUrl } = req.body;

    // Validate required fields
    if (!jobId || !name || !email || !phone || !message) {
      return res.status(400).json({ 
        message: 'Missing required fields: jobId, name, email, phone, message' 
      });
    }

    // Check if job exists and is active
    const job = await JobPosting.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job posting not found' });
    }
    if (job.status !== 'active') {
      return res.status(400).json({ message: 'This job posting is no longer accepting applications' });
    }

    // Create application
    const application = new JobApplication({
      job: jobId,
      name,
      email,
      phone,
      message,
      resumeUrl
    });

    await application.save();

    res.status(201).json({ 
      message: 'Application submitted successfully',
      application: {
        _id: application._id,
        name: application.name,
        email: application.email,
        appliedDate: application.appliedDate
      }
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ message: 'Failed to submit application', error: error.message });
  }
});

/**
 * ADMIN ROUTES - For admin dashboard
 */

// GET /api/jobs/admin/all - Get all job postings (including drafts)
router.get('/admin/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const jobs = await JobPosting.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    // Get application count for each job
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const applicationCount = await JobApplication.countDocuments({ job: job._id });
        return {
          ...job.toObject(),
          applicationCount
        };
      })
    );
    
    res.json(jobsWithCounts);
  } catch (error) {
    console.error('Error fetching all jobs:', error);
    res.status(500).json({ message: 'Failed to fetch job postings', error: error.message });
  }
});

// POST /api/jobs/admin/create - Create new job posting
router.post('/admin/create', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, location, address, jobType, description, requirements, benefits, status, expiryDate } = req.body;

    // Validate required fields
    if (!title || !location || !address || !jobType || !description) {
      return res.status(400).json({ 
        message: 'Missing required fields: title, location, address, jobType, description' 
      });
    }

    const job = new JobPosting({
      title,
      location,
      address,
      jobType,
      description,
      requirements: requirements || [],
      benefits: benefits || [],
      status: status || 'active',
      expiryDate,
      createdBy: req.user.id
    });

    await job.save();

    res.status(201).json({ 
      message: 'Job posting created successfully',
      job 
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ message: 'Failed to create job posting', error: error.message });
  }
});

// PUT /api/jobs/admin/:id - Update job posting
router.put('/admin/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, location, address, jobType, description, requirements, benefits, status, expiryDate } = req.body;

    const job = await JobPosting.findByIdAndUpdate(
      req.params.id,
      {
        title,
        location,
        address,
        jobType,
        description,
        requirements,
        benefits,
        status,
        expiryDate
      },
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({ message: 'Job posting not found' });
    }

    res.json({ 
      message: 'Job posting updated successfully',
      job 
    });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ message: 'Failed to update job posting', error: error.message });
  }
});

// DELETE /api/jobs/admin/:id - Delete job posting
router.delete('/admin/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const job = await JobPosting.findByIdAndDelete(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job posting not found' });
    }

    // Also delete all applications for this job
    await JobApplication.deleteMany({ job: req.params.id });

    res.json({ message: 'Job posting and all applications deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ message: 'Failed to delete job posting', error: error.message });
  }
});

// GET /api/jobs/admin/:id/applications - Get all applications for a job
router.get('/admin/:id/applications', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const applications = await JobApplication.find({ job: req.params.id })
      .populate('job', 'title location')
      .sort({ appliedDate: -1 });
    
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Failed to fetch applications', error: error.message });
  }
});

// PATCH /api/jobs/admin/applications/:id/status - Update application status
router.patch('/admin/applications/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const application = await JobApplication.findByIdAndUpdate(
      req.params.id,
      { status, adminNotes },
      { new: true, runValidators: true }
    ).populate('job', 'title location');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json({ 
      message: 'Application status updated successfully',
      application 
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Failed to update application status', error: error.message });
  }
});

// GET /api/jobs/admin/applications/all - Get all applications across all jobs
router.get('/admin/applications/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    
    const query = status ? { status } : {};
    
    const applications = await JobApplication.find(query)
      .populate('job', 'title location jobType')
      .sort({ appliedDate: -1 });
    
    res.json(applications);
  } catch (error) {
    console.error('Error fetching all applications:', error);
    res.status(500).json({ message: 'Failed to fetch applications', error: error.message });
  }
});

module.exports = router;
