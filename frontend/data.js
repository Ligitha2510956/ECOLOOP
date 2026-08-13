// Data for SSN EcoLoop Platform

const initialItems = [
  {
    id: "item-1",
    title: "Organic Chemistry Textbook (8th Edition)",
    category: "Textbooks",
    type: "Borrow",
    department: "Chemical Engineering",
    condition: "Like New",
    owner: "Prof. R. Venkatesh",
    location: "Main Library, Ground Floor",
    description: "Standard course text for 3rd semester Chemical Engg. Minimal annotations, includes quick reference chart.",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    tags: ["Chemistry", "Book", "3rd Sem"],
    dateAdded: "2026-08-10",
    status: "Available",
    views: 42
  },
  {
    id: "item-2",
    title: "Digital Binocular Microscope & Glass Slides",
    category: "Lab Equipment",
    type: "Lend",
    department: "BioTechnology",
    condition: "Good",
    owner: "BioTech Central Lab",
    location: "Lab Block B, Room 204",
    description: "Fully calibrated digital microscope with 100x oil immersion lens. Ideal for cellular biology projects.",
    image: "../../../brain/93474d43-39a4-4a96-9fc4-27a940163b03/lab_equipment_1786505930154.jpg",
    tags: ["Microscope", "BioTech", "Lab"],
    dateAdded: "2026-08-11",
    status: "Available",
    views: 89
  },
  {
    id: "item-3",
    title: "Campus Hybrid Green Bicycle (Medium Frame)",
    category: "Bicycles",
    type: "Borrow",
    department: "Student Council",
    condition: "Good",
    owner: "Kavya S. (Final EEE)",
    location: "Hostel Block 3 Cycle Rack",
    description: "Smooth 7-speed hybrid bike. Great for commuting between campus blocks. Includes helmet and lock code.",
    image: "../../../brain/93474d43-39a4-4a96-9fc4-27a940163b03/campus_bicycle_1786505980207.jpg",
    tags: ["Transport", "Bicycle", "Hostel"],
    dateAdded: "2026-08-09",
    status: "Available",
    views: 115
  },
  {
    id: "item-4",
    title: "Engineering Thermodynamics & Heat Transfer Books",
    category: "Textbooks",
    type: "Donate",
    department: "Mechanical Engineering",
    condition: "Fair",
    owner: "Anish Kumar",
    location: "Mech Dept Library Desk",
    description: "Complete 2-volume reference pack for Mechanical/Automobile streams. Donated for free reuse.",
    image: "../../../brain/93474d43-39a4-4a96-9fc4-27a940163b03/textbooks_stack_1786505951485.jpg",
    tags: ["Thermodynamics", "Mechanical", "Free"],
    dateAdded: "2026-08-08",
    status: "Available",
    views: 63
  },
  {
    id: "item-5",
    title: "Ergonomic Mesh Study Chair & Wooden Desk",
    category: "Furniture",
    type: "Lend",
    department: "Campus Facilities",
    condition: "Like New",
    owner: "Hostel Admin Office",
    location: "Hostel Block 1 Annex",
    description: "Adjustable height ergonomic chair in pristine condition. Surplus item from faculty study lounge.",
    image: "https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?auto=format&fit=crop&w=800&q=80",
    tags: ["Furniture", "Study", "Chair"],
    dateAdded: "2026-08-07",
    status: "Available",
    views: 74
  },
  {
    id: "item-6",
    title: "Arduino Mega 2560 & Sensor Suite Kit",
    category: "Electronics",
    type: "Borrow",
    department: "ECE / Robotics Club",
    condition: "Refurbished",
    owner: "Robotics Innovation Hub",
    location: "ECE Innovation Lab, Floor 2",
    description: "Includes Arduino Mega, ultrasonic sensors, relay modules, and breadboard set for mini-projects.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    tags: ["Arduino", "ECE", "Sensors"],
    dateAdded: "2026-08-11",
    status: "Available",
    views: 132
  },
  {
    id: "item-7",
    title: "Analytical Grade Sodium Chloride & Flask Glassware",
    category: "Chemicals",
    type: "Donate",
    department: "Chemistry Dept",
    condition: "Sealed Box",
    owner: "Dr. Lakshmi S.",
    location: "Chemistry Lab 3 Store",
    description: "Unopened 500g analytical reagent jar & 250ml volumetric flasks surplus from semester lab audit.",
    image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80",
    tags: ["Chemicals", "Reagent", "Flasks"],
    dateAdded: "2026-08-05",
    status: "Available",
    views: 45
  },
  {
    id: "item-8",
    title: "Dell 24-inch FHD IPS Monitor (Recycled E-Waste)",
    category: "Electronics",
    type: "Lend",
    department: "Computer Science",
    condition: "Good",
    owner: "CSE Hardware Lab",
    location: "IT Building, Lab 5",
    description: "Tested and refurbished dual display monitor with HDMI cable included. Saves e-waste landfill!",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
    tags: ["Monitor", "CSE", "Refurbished"],
    dateAdded: "2026-08-06",
    status: "Available",
    views: 98
  }
];

const reviewStatsData = {
  totalReviews: 17,
  studentCount: 15,
  facultyCount: 2,
  averageRating: 4.2,
  breakdown: {
    positive: { percent: 76.5, count: 13 },
    neutral: { percent: 17.6, count: 3 },
    negative: { percent: 5.9, count: 1 }
  },
  table: [
    { reviewerType: "Students", count: 15, positive: 11, neutral: 3, negative: 1, avgRating: 4.1 },
    { reviewerType: "Faculty", count: 2, positive: 2, neutral: 0, negative: 0, avgRating: 4.5 },
    { reviewerType: "Total / Average", count: 17, positive: 13, neutral: 3, negative: 1, avgRating: 4.2 }
  ],
  keyFeedback: {
    liked: [
      "Useful for daily college life beyond just lab equipment",
      "Promotes resource reuse and reduces landfill waste",
      "Real-time visual tracking of impact is super motivating",
      "Supports SDG 12 goals & campus sustainability metrics",
      "Easy to understand with 3-click request rule"
    ],
    improvements: [
      "Include clear awareness sessions for incoming batches",
      "Add automated notifications for item expiry or loan return dates",
      "Expand categories to include non-lab stationery & everyday gear",
      "Ensure full mobile responsiveness and PWA support"
    ],
    concernsAddressed: [
      {
        question: "IS THERE ANY COST?",
        answer: "No! Purely digital web application, 100% free for students, faculty, and labs. Saves department funds."
      },
      {
        question: "How will you keep students engaged?",
        answer: "Campus gamification leaderboard with Eco-Points, badges, and department rewards."
      },
      {
        question: "Will college admin support this workflow?",
        answer: "Yes, because it reduces double-buying expenses and tracks verifiable waste savings metrics."
      }
    ]
  }
};

const departmentLeaderboard = [
  { rank: 1, department: "Chemical Engineering", points: 1450, wasteSavedKg: 124, itemsShared: 48, badge: "🏆 Champion", trend: "+12%" },
  { rank: 2, department: "BioTechnology", points: 1280, wasteSavedKg: 98, itemsShared: 41, badge: "🥈 Eco Pioneer", trend: "+8%" },
  { rank: 3, department: "Computer Science (CSE)", points: 1150, wasteSavedKg: 85, itemsShared: 36, badge: "🥉 Circular Hero", trend: "+15%" },
  { rank: 4, department: "Electrical & Electronics (EEE)", points: 940, wasteSavedKg: 64, itemsShared: 29, badge: "⭐ Resource Saver", trend: "+5%" },
  { rank: 5, department: "Mechanical Engineering", points: 870, wasteSavedKg: 58, itemsShared: 25, badge: "🌱 Green Builder", trend: "+10%" },
  { rank: 6, department: "Central Library & Admin", points: 790, wasteSavedKg: 46, itemsShared: 22, badge: "📚 Book Loop", trend: "+4%" }
];

const swotAnalysisData = {
  strengths: [
    "User-centric design with 3-click transaction rule and zero special hardware requirements",
    "Campus gamification with Eco-Points, badges, and recognition",
    "Versatile scope covering textbooks, lab equipment, furniture, and e-waste",
    "Department leaderboard encouraging healthy green competition",
    "Real-time tracking of individual and campus-wide ecological impact"
  ],
  weaknesses: [
    "Depends on consistent student participation and peer awareness",
    "Verification of genuine eco-actions and item quality needs initial peer check",
    "Initial setup requires onboarding lab assistants and campus facilities",
    "Requires simple ongoing platform maintenance and periodic updates"
  ],
  opportunities: [
    "Strong support from college admin due to immediate cost savings & zero waste targets",
    "Seamless single sign-on integration with existing SSN student portals",
    "Partnerships with campus cafes and bookshops for eco-point reward vouchers",
    "Scalable blueprint adaptable to other universities, schools, and institutions",
    "Direct alignment with UN Sustainable Development Goal 12 (Responsible Consumption)"
  ],
  threats: [
    "Potential app fatigue if new inventory is not refreshed regularly",
    "Resistance from legacy vendors or traditional purchasing habits",
    "Possibility of incomplete requests without timely peer handover",
    "Gamification novelty fading without refreshed seasonal challenges"
  ]
};

const flowSteps = [
  { step: 1, title: "Register", desc: "Students, faculty, and lab in-charges sign up with official SSN credentials.", icon: "fa-user-plus" },
  { step: 2, title: "List Items", desc: "Users list items they want to give away or resources they need.", icon: "fa-box-open" },
  { step: 3, title: "Categorize & Tag", desc: "Items tagged as E-waste, Chemicals, Textbooks, or General Supplies with condition details.", icon: "fa-tags" },
  { step: 4, title: "Search & Discover", desc: "Browse or filter items by category, department, availability, and location.", icon: "fa-magnifying-glass" },
  { step: 5, title: "Request / Claim", desc: "Interested users send a request to claim or borrow items with 1 click.", icon: "fa-handshake" },
  { step: 6, title: "Review & Approval", desc: "The owner or lab in-charge reviews the request and approves exchange.", icon: "fa-clipboard-check" },
  { step: 7, title: "Handover / Pickup", desc: "Item picked up from designated campus location with instant verification.", icon: "fa-dolly" },
  { step: 8, title: "Update Inventory", desc: "Real-time inventory update reflecting successful resource transfer.", icon: "fa-arrows-rotate" },
  { step: 9, title: "Impact Tracking", desc: "System updates metrics: waste diverted (kg), cost saved (₹), carbon offset.", icon: "fa-chart-line" },
  { step: 10, title: "Continuous Loop", desc: "Resource stays active in circulation, building a sustainable SSN community.", icon: "fa-infinity" }
];
