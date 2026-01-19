// Team Building Matcher Configuration
// Replace this data with your actual 24 team members

const teamConfig = {
    // Company/Team Information
    companyName: "Your Company Name",
    eventTitle: "Team Building Matcher",
    
    // Team Members - Replace with your actual team data
    members: [
        {
            id: 1,
            name: "Sarah Johnson",
            role: "Frontend Developer",
            department: "Engineering",
            image: "images/sarah-johnson.jpg" // Replace with actual image path
        },
        {
            id: 2,
            name: "Mike Chen",
            role: "Backend Developer", 
            department: "Engineering",
            image: "images/mike-chen.jpg"
        },
        {
            id: 3,
            name: "Emily Rodriguez",
            role: "UX Designer",
            department: "Design",
            image: "images/emily-rodriguez.jpg"
        },
        {
            id: 4,
            name: "David Kim",
            role: "Product Manager",
            department: "Product",
            image: "images/david-kim.jpg"
        },
        {
            id: 5,
            name: "Lisa Thompson",
            role: "QA Engineer",
            department: "Engineering",
            image: "images/lisa-thompson.jpg"
        },
        {
            id: 6,
            name: "Alex Wong",
            role: "DevOps Engineer",
            department: "Engineering",
            image: "images/alex-wong.jpg"
        },
        {
            id: 7,
            name: "Maria Garcia",
            role: "Data Scientist",
            department: "Data",
            image: "images/maria-garcia.jpg"
        },
        {
            id: 8,
            name: "James Wilson",
            role: "Mobile Developer",
            department: "Engineering",
            image: "images/james-wilson.jpg"
        },
        {
            id: 9,
            name: "Anna Lee",
            role: "UI Designer",
            department: "Design",
            image: "images/anna-lee.jpg"
        },
        {
            id: 10,
            name: "Tom Anderson",
            role: "Full Stack Developer",
            department: "Engineering",
            image: "images/tom-anderson.jpg"
        },
        {
            id: 11,
            name: "Sophie Brown",
            role: "Scrum Master",
            department: "Agile",
            image: "images/sophie-brown.jpg"
        },
        {
            id: 12,
            name: "Ryan Davis",
            role: "System Architect",
            department: "Engineering",
            image: "images/ryan-davis.jpg"
        },
        {
            id: 13,
            name: "Nina Patel",
            role: "Business Analyst",
            department: "Product",
            image: "images/nina-patel.jpg"
        },
        {
            id: 14,
            name: "Carlos Mendez",
            role: "Security Engineer",
            department: "Security",
            image: "images/carlos-mendez.jpg"
        },
        {
            id: 15,
            name: "Rachel Green",
            role: "Content Strategist",
            department: "Marketing",
            image: "images/rachel-green.jpg"
        },
        {
            id: 16,
            name: "Kevin Zhang",
            role: "Machine Learning Engineer",
            department: "Data",
            image: "images/kevin-zhang.jpg"
        },
        {
            id: 17,
            name: "Amanda Foster",
            role: "Technical Writer",
            department: "Documentation",
            image: "images/amanda-foster.jpg"
        },
        {
            id: 18,
            name: "Marcus Johnson",
            role: "Network Engineer",
            department: "IT",
            image: "images/marcus-johnson.jpg"
        },
        {
            id: 19,
            name: "Jessica Taylor",
            role: "UX Researcher",
            department: "Design",
            image: "images/jessica-taylor.jpg"
        },
        {
            id: 20,
            name: "Daniel Park",
            role: "Cloud Engineer",
            department: "Engineering",
            image: "images/daniel-park.jpg"
        },
        {
            id: 21,
            name: "Olivia White",
            role: "Product Designer",
            department: "Design",
            image: "images/olivia-white.jpg"
        },
        {
            id: 22,
            name: "Robert Martinez",
            role: "Database Administrator",
            department: "Engineering",
            image: "images/robert-martinez.jpg"
        },
        {
            id: 23,
            name: "Hannah Clark",
            role: "Marketing Developer",
            department: "Marketing",
            image: "images/hannah-clark.jpg"
        },
        {
            id: 24,
            name: "Chris Lewis",
            role: "Site Reliability Engineer",
            department: "Engineering",
            image: "images/chris-lewis.jpg"
        }
    ],
    
    // Custom match messages
    matchMessages: [
        "These two will make an amazing team!",
        "What a perfect match!",
        "Team goals achieved!",
        "Dynamic duo alert!",
        "Power couple of the office!",
        "Unstoppable team!",
        "Dream team material!",
        "Office legends in the making!",
        "Innovation powerhouse!",
        "Problem-solving dream team!",
        "Creative collaboration at its finest!",
        "The dynamic duo we've been waiting for!"
    ],
    
    // Game settings
    settings: {
        autoShuffle: true,
        showDepartments: true,
        enableConfetti: true,
        matchDelay: 2000, // milliseconds
        confettiCount: 50
    }
};

// Instructions for customization:
// 1. Replace all the member data with your actual team members
// 2. Add your team member photos to the images/ folder
// 3. Update the image paths to match your actual file names
// 4. Customize the match messages to fit your company culture
// 5. Adjust game settings as needed

// To use this configuration, copy the members array to your script.js file
// and replace the existing teamMembers array. 