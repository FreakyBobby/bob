document.addEventListener('DOMContentLoaded', () => {
    // Initialize variables
    const searchInput = document.querySelector('.search-input input');
    const searchButton = document.querySelector('.search-box button');
    const filtersSidebar = document.querySelector('.filters-sidebar');
    const jobList = document.querySelector('.job-list');
    const resultsCount = document.querySelector('.results-count h2');
    const sortSelect = document.querySelector('.results-sort select');
    const pagination = document.querySelector('.pagination');

    // Mock job data
    const mockJobs = [
        {
            id: 1,
            title: 'Senior Software Engineer',
            company: 'TechCorp',
            location: 'San Francisco, CA',
            type: 'Full-time',
            salary: '$120,000 - $150,000',
            posted: '2024-03-15',
            description: 'We are looking for a Senior Software Engineer to join our team...',
            requirements: ['5+ years of experience', 'Strong JavaScript skills', 'React expertise'],
            applications: 45
        },
        {
            id: 2,
            title: 'Product Manager',
            company: 'InnovateX',
            location: 'New York, NY',
            type: 'Full-time',
            salary: '$100,000 - $130,000',
            posted: '2024-03-14',
            description: 'Join our product team to drive innovation...',
            requirements: ['3+ years of PM experience', 'Agile methodology', 'Strong communication'],
            applications: 32
        },
        {
            id: 3,
            title: 'UX Designer',
            company: 'DesignHub',
            location: 'Remote',
            type: 'Contract',
            salary: '$80,000 - $100,000',
            posted: '2024-03-13',
            description: 'Looking for a creative UX Designer...',
            requirements: ['Portfolio required', 'Figma expertise', 'User research experience'],
            applications: 28
        },
        {
            id: 4,
            title: 'Data Scientist',
            company: 'DataFlow',
            location: 'Boston, MA',
            type: 'Full-time',
            salary: '$110,000 - $140,000',
            posted: '2024-03-12',
            description: 'Join our data science team...',
            requirements: ['Python', 'Machine Learning', 'SQL'],
            applications: 56
        },
        {
            id: 5,
            title: 'Marketing Manager',
            company: 'BrandBoost',
            location: 'Los Angeles, CA',
            type: 'Full-time',
            salary: '$90,000 - $120,000',
            posted: '2024-03-11',
            description: 'Lead our marketing initiatives...',
            requirements: ['5+ years experience', 'Digital marketing', 'Analytics'],
            applications: 39
        }
    ];

    // Generate random jobs
    function generateRandomJobs(count) {
        const jobTitles = [
            'Software Engineer', 'Product Manager', 'UX Designer', 'Data Scientist',
            'Marketing Manager', 'Sales Representative', 'Content Writer', 'Project Manager',
            'DevOps Engineer', 'Business Analyst'
        ];
        const companies = [
            'TechCorp', 'InnovateX', 'DesignHub', 'DataFlow', 'BrandBoost',
            'FutureTech', 'CreativeCo', 'SmartSolutions', 'GlobalTech', 'StartupX'
        ];
        const locations = [
            'San Francisco, CA', 'New York, NY', 'Remote', 'Boston, MA', 'Los Angeles, CA',
            'Chicago, IL', 'Seattle, WA', 'Austin, TX', 'Denver, CO', 'Miami, FL'
        ];
        const types = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'];
        const salaryRanges = [
            '$80,000 - $100,000', '$100,000 - $130,000', '$120,000 - $150,000',
            '$90,000 - $120,000', '$110,000 - $140,000'
        ];

        const randomJobs = [];
        for (let i = 0; i < count; i++) {
            randomJobs.push({
                id: mockJobs.length + i + 1,
                title: jobTitles[Math.floor(Math.random() * jobTitles.length)],
                company: companies[Math.floor(Math.random() * companies.length)],
                location: locations[Math.floor(Math.random() * locations.length)],
                type: types[Math.floor(Math.random() * types.length)],
                salary: salaryRanges[Math.floor(Math.random() * salaryRanges.length)],
                posted: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                description: 'We are looking for a talented professional to join our team...',
                requirements: ['3+ years of experience', 'Strong communication skills', 'Team player'],
                applications: Math.floor(Math.random() * 100)
            });
        }
        return randomJobs;
    }

    // Combine mock and random jobs
    const allJobs = [...mockJobs, ...generateRandomJobs(15)];

    // Filter jobs based on search criteria
    function filterJobs(jobs, searchTerm, filters) {
        return jobs.filter(job => {
            const matchesSearch = searchTerm === '' || 
                job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.location.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesType = !filters.type || job.type === filters.type;
            const matchesExperience = !filters.experience || job.requirements.some(req => req.includes(filters.experience));
            const matchesSalary = !filters.salary || job.salary === filters.salary;
            const matchesDate = !filters.date || isWithinDateRange(job.posted, filters.date);

            return matchesSearch && matchesType && matchesExperience && matchesSalary && matchesDate;
        });
    }

    // Sort jobs based on criteria
    function sortJobs(jobs, criteria) {
        return [...jobs].sort((a, b) => {
            switch (criteria) {
                case 'newest':
                    return new Date(b.posted) - new Date(a.posted);
                case 'oldest':
                    return new Date(a.posted) - new Date(b.posted);
                case 'applications':
                    return b.applications - a.applications;
                default:
                    return 0;
            }
        });
    }

    // Check if a date is within the specified range
    function isWithinDateRange(date, range) {
        const jobDate = new Date(date);
        const today = new Date();
        const diffDays = Math.floor((today - jobDate) / (1000 * 60 * 60 * 24));

        switch (range) {
            case 'today':
                return diffDays === 0;
            case '3days':
                return diffDays <= 3;
            case 'week':
                return diffDays <= 7;
            case 'month':
                return diffDays <= 30;
            default:
                return true;
        }
    }

    // Render job list
    function renderJobs(jobs) {
        jobList.innerHTML = '';
        resultsCount.textContent = `${jobs.length} Jobs Found`;

        jobs.forEach(job => {
            const jobElement = document.createElement('div');
            jobElement.className = 'job-item';
            jobElement.innerHTML = `
                <div class="job-info">
                    <h3 class="job-title">
                        <a href="apply-job.html?id=${job.id}">${job.title}</a>
                    </h3>
                    <div class="job-company">
                        <i class="fas fa-building"></i>
                        <span>${job.company}</span>
                    </div>
                    <div class="job-details">
                        <div class="job-detail">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${job.location}</span>
                        </div>
                        <div class="job-detail">
                            <i class="fas fa-clock"></i>
                            <span>${job.type}</span>
                        </div>
                        <div class="job-detail">
                            <i class="fas fa-dollar-sign"></i>
                            <span>${job.salary}</span>
                        </div>
                        <div class="job-detail">
                            <i class="fas fa-calendar"></i>
                            <span>Posted ${formatDate(job.posted)}</span>
                        </div>
                    </div>
                </div>
                <div class="job-actions">
                    <button class="btn btn-primary" onclick="window.location.href='apply-job.html?id=${job.id}'">
                        Apply Now
                    </button>
                    <button class="btn btn-secondary" onclick="saveJob(${job.id})">
                        Save Job
                    </button>
                </div>
            `;
            jobList.appendChild(jobElement);
        });
    }

    // Format date for display
    function formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const diffDays = Math.floor((today - date) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    }

    // Save job to local storage
    function saveJob(jobId) {
        const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
        if (!savedJobs.includes(jobId)) {
            savedJobs.push(jobId);
            localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
            showNotification('Job saved successfully!');
        } else {
            showNotification('Job already saved!');
        }
    }

    // Show notification
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Initialize page
    let currentFilters = {
        type: '',
        experience: '',
        salary: '',
        date: ''
    };

    // Event listeners
    searchButton.addEventListener('click', () => {
        const searchTerm = searchInput.value.trim();
        const filteredJobs = filterJobs(allJobs, searchTerm, currentFilters);
        const sortedJobs = sortJobs(filteredJobs, sortSelect.value);
        renderJobs(sortedJobs);
    });

    sortSelect.addEventListener('change', () => {
        const searchTerm = searchInput.value.trim();
        const filteredJobs = filterJobs(allJobs, searchTerm, currentFilters);
        const sortedJobs = sortJobs(filteredJobs, sortSelect.value);
        renderJobs(sortedJobs);
    });

    // Filter change handlers
    document.querySelectorAll('.filter-section input').forEach(input => {
        input.addEventListener('change', () => {
            const filterType = input.closest('.filter-section').querySelector('h3').textContent.toLowerCase();
            currentFilters[filterType] = input.value;
            
            const searchTerm = searchInput.value.trim();
            const filteredJobs = filterJobs(allJobs, searchTerm, currentFilters);
            const sortedJobs = sortJobs(filteredJobs, sortSelect.value);
            renderJobs(sortedJobs);
        });
    });

    // Initial render
    renderJobs(sortJobs(allJobs, 'newest'));
}); 