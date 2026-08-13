require("dotenv").config();
const { connectDB } = require("./config/db");
const {
    User,
    Testimonial,
    Project,
    Event,
    Crowdfunding,
    Gallery,
    News,
    Team,
    Award,
    Report,
    Download,
    SiteContent,
    NGOCertificate,
    sequelize,
} = require("./models");
const bcrypt = require("bcryptjs");

const seedAll = async () => {
    try {
        await connectDB();
        await sequelize.sync({ alter: true });

        const existingAdmin = await User.findOne({
            where: { role: "super_admin" },
        });

        let adminId = existingAdmin ? existingAdmin.id : 1;

        if (!existingAdmin) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash("admin123", salt);
            const admin = await User.create({
                fullName: "Super Admin",
                email: "admin@ngo.org",
                mobile: "9999999999",
                password: hashedPassword,
                role: "super_admin",
                isActive: true,
            });
            adminId = admin.id;
            console.log("Super Admin created successfully!");
        } else {
            console.log("Super Admin already exists.");
        }

        // Seed Site Content
        const siteContentKeys = [
            {
                key: "founder_message",
                title: "Founder's Message",
                content: "At Real Human Trust, our vision has always been to build a society where every individual has the opportunity to lead a dignified life. True progress is only possible when we empower the most vulnerable among us with education, healthcare, and skills for a better tomorrow.",
                image: { public_id: "", url: "/about-volunteers-india.png" },
            },
            {
                key: "home_hero",
                title: "Home Hero Slider",
                content: JSON.stringify([
                    {
                        title: "Education for Every Child",
                        highlight: "Real Human Trust",
                        desc: "Empowering underprivileged children with quality education, school supplies, and scholarships across Gujarat.",
                        image: "/children-receiving-school-supplies-india.png",
                    },
                    {
                        title: "Healthcare for All",
                        highlight: "Community Care",
                        desc: "Running free health camps, medical van services, and wellness programs in rural and urban communities.",
                        image: "/community-health-camp-india.png",
                    },
                    {
                        title: "Women Empowerment",
                        highlight: "Skills & Livelihood",
                        desc: "Vocational training, sewing machines, and micro-enterprise support for 500+ women and families.",
                        image: "/women-skill-training-workshop-india.png",
                    },
                ]),
            },
            {
                key: "about_preview",
                title: "About (Home)",
                content: JSON.stringify({
                    description:
                        "Real Human Education & Charitable Trust began with a simple but profound belief: every individual deserves access to quality education, proper healthcare, and the opportunity to live with dignity.",
                    points: [
                        "Registered charitable trust based in Rajkot, Gujarat",
                        "Transparent, on-the-ground welfare programs",
                        "5000+ lives impacted across 50+ villages",
                    ],
                }),
            },
            {
                key: "about_main",
                title: "About Us (Main Page)",
                content: JSON.stringify({
                    image: "/about-volunteers-india.png",
                    stats: ["Gujarat Based", "Public Welfare", "Volunteer Powered"],
                    sections: [
                        ["Our Story", "Real Human Education & Charitable Trust began with a simple but profound belief: every individual, regardless of their background, deserves access to quality education, proper healthcare, and the opportunity to live with dignity. Based in Rajkot, Gujarat, we have grown from a small group of passionate volunteers into a structured, community-driven NGO that actively addresses the most pressing needs of underprivileged families."],
                        ["Our Approach", "We believe in practical, on-the-ground interventions. Whether it is distributing school supplies to children who cannot afford them, setting up mobile health camps in remote villages, or providing vocational training for women, our approach is always direct, transparent, and measurable. We do not just provide temporary relief; we strive to create sustainable ecosystems where communities can eventually thrive independently."],
                        ["Transparency & Trust", "Trust is the foundation of everything we do. As a registered charitable trust, we maintain absolute transparency with our donors and members. Every rupee contributed goes directly into our field programs, and we regularly publish audit reports and field updates. When you support Real Human Trust, you know exactly whose life you are changing."],
                    ],
                }),
                image: { public_id: "", url: "/about-volunteers-india.png" },
            },
            {
                key: "vision_mission",
                title: "Vision & Mission",
                content: JSON.stringify({
                    vision: "To create a self-reliant society where every individual has access to education, healthcare, and livelihood opportunities.",
                    mission: "To empower underprivileged communities through sustainable welfare programs, transparent governance, and volunteer-driven action.",
                    objectives: "<ul><li>Provide free education and scholarships to underprivileged children</li><li>Conduct regular health camps and medical support programs</li><li>Empower women through skill development and vocational training</li><li>Promote environmental sustainability through tree plantation drives</li></ul>",
                }),
            },
            {
                key: "focus_areas",
                title: "Focus Areas",
                content: JSON.stringify([
                    { title: "Education", desc: "Scholarships, school supplies, and digital literacy for children.", image: "/smiling-school-children-india-education.png", icon: "BookOpen" },
                    { title: "Healthcare", desc: "Free medical camps, health checkups, and ambulance services.", image: "/mobile-medical-van-rural-india.png", icon: "HeartPulse" },
                    { title: "Women Empowerment", desc: "Vocational training, self-help groups, and micro-enterprise support.", image: "/women-skill-development-training.png", icon: "Users" },
                    { title: "Environment", desc: "Tree plantation, rainwater harvesting, and clean energy initiatives.", image: "/tree-plantation-volunteers-india.png", icon: "TreePine" },
                ]),
            },
            {
                key: "impact_stats",
                title: "Impact Stats",
                content: JSON.stringify([
                    { value: 25000, label: "Lives Impacted", icon: "Heart" },
                    { value: 8500, label: "Children Educated", icon: "BookOpen" },
                    { value: 1200, label: "Active Volunteers", icon: "Users" },
                    { value: 340, label: "Projects Completed", icon: "CheckCircle" },
                ]),
            },
            {
                key: "contact_info",
                title: "Contact Info",
                content: JSON.stringify({
                    address: "1st Floor, DK Plaza Complex, New Naherunagar Main Road, Near Ahir Chowk, Atika South, Rajkot, Gujarat 360002",
                    phones: [
                        { number: "+91 87358 99909", showInNavbar: true, showInFooter: true, showInContact: true },
                        { number: "+91 85113 31111", showInNavbar: true, showInFooter: true, showInContact: true },
                    ],
                    email: "realhumantrust@gmail.com",
                    facebook: "https://facebook.com",
                    instagram: "https://instagram.com",
                    twitter: "https://twitter.com",
                    youtube: "https://youtube.com",
                    mapsUrl: "https://maps.app.goo.gl/krNGmBPzbFAsZeSj7",
                }),
            },
            {
                key: "donate_details",
                title: "Donate Details",
                content: JSON.stringify({
                    bankName: "State Bank of India",
                    accountName: "Real Human Education & Charitable Trust",
                    accountNumber: "1234567890",
                    ifscCode: "SBIN0001234",
                    upiId: "realhumantrust@sbi",
                    qrImage: "",
                }),
            },
            {
                key: "faqs",
                title: "FAQs",
                content: JSON.stringify([
                    { q: "How can I donate?", a: "<p>You can donate online via our secure payment gateway, or through bank transfer/UPI. All donations are tax-deductible under 80G.</p>" },
                    { q: "Is my donation secure?", a: "<p>Yes, all online donations are processed through Razorpay's secure payment gateway with 256-bit SSL encryption.</p>" },
                    { q: "How can I volunteer?", a: "<p>You can register as a volunteer through our website or visit our office in Rajkot. We have opportunities in education, healthcare, and community outreach.</p>" },
                ]),
            },
            {
                key: "privacy_policy",
                title: "Privacy Policy",
                content: "<p>Real Human Trust is committed to protecting your privacy. We do not sell or share your personal information with third parties without your consent. All donation and registration data is stored securely.</p>",
            },
            {
                key: "terms_conditions",
                title: "Terms & Conditions",
                content: "<p>By using this website, you agree to our terms and conditions. All content is property of Real Human Education & Charitable Trust. Donations are non-refundable once processed.</p>",
            },
            {
                key: "fund_allocation",
                title: "Fund Allocation",
                content: JSON.stringify([
                    { label: "Education Programs", pct: 45, color: "#2563eb" },
                    { label: "Healthcare Camps", pct: 25, color: "#dc2626" },
                    { label: "Women Empowerment", pct: 20, color: "#9333ea" },
                    { label: "Admin & Operations", pct: 10, color: "#6b7280" },
                ]),
            },
            {
                key: "store_info",
                title: "Store / Impact Areas",
                content: "Our store and impact areas showcase the tangible outcomes of your donations. From school kits to medical supplies, every item represents a life changed.",
            },
            {
                key: "site_logo",
                title: "Website Logo",
                content: "",
                image: { public_id: "", url: "/images/rht-logo.png" },
            },
            {
                key: "ngo_certificates",
                title: "NGO Certificates",
                content: JSON.stringify([
                    {
                        title: "80G Registration Certificate",
                        certificateNo: "ITD/80G/2024/001",
                        issuedBy: "Income Tax Department, Government of India",
                        description: "Registration under Section 80G of the Income Tax Act, 1961. Donors are eligible for tax deduction.",
                        image: "",
                        pdf: "",
                    },
                    {
                        title: "12A Registration Certificate",
                        certificateNo: "ITD/12A/2024/002",
                        issuedBy: "Income Tax Department, Government of India",
                        description: "Registration under Section 12A of the Income Tax Act, 1961.",
                        image: "",
                        pdf: "",
                    },
                ]),
            },
            {
                key: "email_config",
                title: "Email Configuration",
                content: JSON.stringify({
                    service: "Gmail",
                    host: "smtp.gmail.com",
                    port: "587",
                    secure: false,
                    user: "realhumantrust@gmail.com",
                    pass: "",
                    fromEmail: "realhumantrust@gmail.com",
                    fromName: "Real Human Trust",
                }),
            },
        ];

        for (const item of siteContentKeys) {
            const existing = await SiteContent.findOne({ where: { key: item.key } });
            if (!existing) {
                await SiteContent.create(item);
                console.log(`Seeded site content: ${item.key}`);
            }
        }

        // Seed Testimonials
        const testimonialCount = await Testimonial.count();
        if (testimonialCount === 0) {
            await Testimonial.bulkCreate([
                { name: "Sunita Ben Parmar", designation: "Skill Center Graduate", message: "Real Human Trust provided free sewing machines and vocational training to 40 women in our village.", rating: 5, status: "active", image: { public_id: "", url: "/women-skill-training-workshop-india.png" } },
                { name: "Dr. Rajesh Shah", designation: "Volunteer Doctor & Donor", message: "Working with Real Human Trust during rural healthcare camps showed me their genuine transparency.", rating: 5, status: "active", image: { public_id: "", url: "/community-health-camp-india.png" } },
                { name: "Ramesh Bhai Patel", designation: "Parent & Beneficiary", message: "My daughter received a complete 1-year education scholarship including books and uniforms.", rating: 5, status: "active", image: { public_id: "", url: "/smiling-school-children-india-education.png" } },
                { name: "Pooja Varma", designation: "Youth Volunteer", message: "Being a volunteer in the daily community kitchen initiative opened my eyes to how small daily efforts can feed hundreds.", rating: 5, status: "active", image: { public_id: "", url: "/community-kitchen-serving-food-india.png" } },
            ]);
            console.log("Seeded Testimonials");
        }

        // Seed Projects
        const projectCount = await Project.count();
        if (projectCount === 0) {
            await Project.bulkCreate([
                { title: "Kanya Daan – Girl Child Education", description: "Help 100 girl children from poor families complete their schooling and college education.", goalAmount: 100000, raisedAmount: 9999, status: "active", isFeatured: true, createdById: adminId, image: { public_id: "", url: "/smiling-school-children-india-education.png" } },
                { title: "Vedic Gurukul Education Fund", description: "Sponsor a child's education in traditional Vedic gurukul system blended with modern computer science.", goalAmount: 30000, raisedAmount: 15000, status: "active", isFeatured: false, createdById: adminId, image: { public_id: "", url: "/rural-classroom-children-learning-india.png" } },
                { title: "Gau Shala Construction – Mathura", description: "Help us build a shelter for 500+ abandoned cows in Mathura's sacred land.", goalAmount: 60000, raisedAmount: 27000, status: "upcoming", isFeatured: false, createdById: adminId, image: { public_id: "", url: "/community-health-camp-india.png" } },
            ]);
            console.log("Seeded Projects");
        }

        // Seed Events
        const eventCount = await Event.count();
        if (eventCount === 0) {
            await Event.bulkCreate([
                { title: "Free Health Camp", description: "Free medical checkup camp at Rajkot community center.", location: "Rajkot, Gujarat", eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), status: "upcoming", createdById: adminId, image: { public_id: "", url: "/community-health-camp-india.png" } },
                { title: "Women Skill Development Workshop", description: "3-day vocational training program for women.", location: "Rajkot, Gujarat", eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), status: "upcoming", createdById: adminId, image: { public_id: "", url: "/women-skill-training-workshop-india.png" } },
            ]);
            console.log("Seeded Events");
        }

        // Seed Crowdfunding
        const crowdfundingCount = await Crowdfunding.count();
        if (crowdfundingCount === 0) {
            const projects = await Project.findAll({ limit: 2 });
            const crowdfundingData = [
                { title: "Education Kit Drive", description: "Provide school kits to 200 underprivileged children.", targetAmount: 50000, raisedAmount: 12000, status: "active", image: { public_id: "", url: "/children-receiving-school-supplies-india.png" } },
                { title: "Medical Van Fund", description: "Support our mobile medical van for rural areas.", targetAmount: 150000, raisedAmount: 45000, status: "active", image: { public_id: "", url: "/mobile-medical-van-rural-india.png" } },
            ];
            for (let i = 0; i < crowdfundingData.length && i < projects.length; i++) {
                crowdfundingData[i].projectId = projects[i].id;
                crowdfundingData[i].createdById = adminId;
            }
            await Crowdfunding.bulkCreate(crowdfundingData);
            console.log("Seeded Crowdfunding");
        }

        // Seed Gallery
        const galleryCount = await Gallery.count();
        if (galleryCount === 0) {
            await Gallery.bulkCreate([
                { title: "Health Camp 2024", category: "Healthcare", type: "photo", image: { public_id: "", url: "/community-health-camp-india.png" }, createdById: adminId },
                { title: "Education Drive", category: "Education", type: "photo", image: { public_id: "", url: "/smiling-school-children-india-education.png" }, createdById: adminId },
                { title: "Women Training", category: "Community", type: "photo", image: { public_id: "", url: "/women-skill-training-workshop-india.png" }, createdById: adminId },
                { title: "Tree Plantation", category: "Environment", type: "photo", image: { public_id: "", url: "/tree-plantation-volunteers-india.png" }, createdById: adminId },
                { title: "Community Kitchen", category: "Food & Nutrition", type: "photo", image: { public_id: "", url: "/community-kitchen-serving-food-india.png" }, createdById: adminId },
            ]);
            console.log("Seeded Gallery");
        }

        // Seed News
        const newsCount = await News.count();
        if (newsCount === 0) {
            await News.bulkCreate([
                { title: "Free Health Camp Held in Rajkot", description: "Over 500 patients received free medical checkups at our recent health camp.", category: "news", status: "published", createdById: adminId, image: { public_id: "", url: "/community-health-camp-india.png" } },
                { title: "Education Kits Distributed to 200 Children", description: "School kits with books, bags, and uniforms were distributed to underprivileged children.", category: "news", status: "published", createdById: adminId, image: { public_id: "", url: "/children-receiving-school-supplies-india.png" } },
                { title: "Women Skill Training Program Launch", description: "New vocational training center launched for women empowerment.", category: "press_release", status: "published", createdById: adminId, image: { public_id: "", url: "/women-skill-training-workshop-india.png" } },
            ]);
            console.log("Seeded News");
        }

        // Seed Team
        const teamCount = await Team.count();
        if (teamCount === 0) {
            await Team.bulkCreate([
                { name: "Rajesh Kumar", designation: "Founder & President", bio: "Visionary leader with 20+ years in social work.", photo: { public_id: "", url: "/about-volunteers-india.png" }, createdById: adminId },
                { name: "Priya Sharma", designation: "Secretary", bio: "Passionate about education and women empowerment.", photo: { public_id: "", url: "/women-skill-training-workshop-india.png" }, createdById: adminId },
                { name: "Amit Patel", designation: "Treasurer", bio: "Chartered accountant managing trust finances with transparency.", photo: { public_id: "", url: "/community-health-camp-india.png" }, createdById: adminId },
            ]);
            console.log("Seeded Team");
        }

        // Seed Awards
        const awardCount = await Award.count();
        if (awardCount === 0) {
            await Award.bulkCreate([
                { title: "Best NGO Award 2024", description: "Recognized for outstanding contribution to education.", year: 2024, awardedBy: "Gujarat Govt", status: "active", image: { public_id: "", url: "/hero-community-education-india.png" } },
                { title: "Excellence in Healthcare", description: "Awarded for free health camps in rural areas.", year: 2023, awardedBy: "Ministry of Health", status: "active", image: { public_id: "", url: "/mobile-medical-van-rural-india.png" } },
            ]);
            console.log("Seeded Awards");
        }

        // Seed Reports
        const reportCount = await Report.count();
        if (reportCount === 0) {
            await Report.bulkCreate([
                { title: "Annual Report 2023-24", description: "Comprehensive report of activities and impact.", type: "annual", year: 2024, status: "active", createdById: adminId },
                { title: "Audit Report 2023-24", description: "CA certified audit report for FY 2023-24.", type: "audit", year: 2024, status: "active", createdById: adminId },
            ]);
            console.log("Seeded Reports");
        }

        // Seed Downloads
        const downloadCount = await Download.count();
        if (downloadCount === 0) {
            await Download.bulkCreate([
                { title: "Membership Form", description: "Download the membership application form.", category: "form", status: "active", createdById: adminId },
                { title: "Donation Receipt", description: "Official donation receipt template.", category: "document", status: "active", createdById: adminId },
            ]);
            console.log("Seeded Downloads");
        }

        // Seed NGO Certificates
        const ngoCertCount = await NGOCertificate.count();
        if (ngoCertCount === 0) {
            const certTemplate = (cert) => `
              <div style="text-align:center; padding: 30px 20px; font-family: 'Georgia', serif;">
                <div style="border: 3px double #1a3c6c; padding: 25px; border-radius: 10px; background: #ffffff;">
                  <div style="text-align: center; margin-bottom: 15px;">
                    <h1 style="color: #1a3c6c; font-size: 26px; margin: 0; font-weight: bold; letter-spacing: 1.5px;">CERTIFICATE</h1>
                    <div style="width: 60px; height: 2px; background: #d4af37; margin: 8px auto;"></div>
                  </div>
                  <p style="font-size: 14px; color: #555; margin-bottom: 18px;">This is to certify that</p>
                  <h2 style="color: #1a3c6c; font-size: 20px; margin-bottom: 15px; font-weight: bold;">Real Human Education & Charitable Trust</h2>
                  <p style="font-size: 14px; color: #444; line-height: 1.7; margin-bottom: 15px;">
                    is a registered organization under the<br/>
                    <strong style="color: #1a3c6c;">${cert.issuedBy}</strong><br/>
                    <strong>Certificate No: ${cert.certificateNo}</strong>
                  </p>
                  ${cert.description ? `<p style="font-size: 13px; color: #666; margin-bottom: 20px; font-style: italic;">"${cert.description}"</p>` : ''}
                  <div style="margin-top: 30px; display: flex; justify-content: space-between; align-items: flex-end;">
                    <div style="text-align: left;">
                      <div style="border-top: 1px solid #1a3c6c; width: 130px; padding-top: 4px; font-size: 11px; color: #666;">Date of Issue</div>
                      <p style="font-weight: bold; color: #1a3c6c; margin-top: 4px;">${cert.issueDate ? new Date(cert.issueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div style="text-align: center;">
                      <div style="width: 70px; height: 70px; border-radius: 50%; border: 2px solid #d4af37; display: flex; align-items: center; justify-content: center; color: #d4af37; font-size: 11px; margin: 0 auto;">OFFICIAL SEAL</div>
                      <p style="font-size: 10px; color: #888; margin-top: 4px;">Authorized Signature</p>
                    </div>
                  </div>
                </div>
              </div>
            `

            await NGOCertificate.bulkCreate([
                {
                    title: "80G Registration Certificate",
                    description: "Registration under Section 80G of the Income Tax Act, 1961. Donors are eligible for tax deduction.",
                    certificateNo: "ITD/80G/2024/001",
                    issuedBy: "Income Tax Department, Government of India",
                    issueDate: new Date("2024-01-15"),
                    template: certTemplate({ title: "80G Registration Certificate", description: "Registration under Section 80G of the Income Tax Act, 1961. Donors are eligible for tax deduction.", certificateNo: "ITD/80G/2024/001", issuedBy: "Income Tax Department, Government of India", issueDate: "2024-01-15" }),
                    sealImage: { public_id: "", url: "" },
                    backgroundImage: { public_id: "", url: "" },
                    pdf: { public_id: "", url: "" },
                    isActive: true,
                },
                {
                    title: "12A Registration Certificate",
                    description: "Registration under Section 12A of the Income Tax Act, 1961.",
                    certificateNo: "ITD/12A/2024/002",
                    issuedBy: "Income Tax Department, Government of India",
                    issueDate: new Date("2024-01-15"),
                    template: certTemplate({ title: "12A Registration Certificate", description: "Registration under Section 12A of the Income Tax Act, 1961.", certificateNo: "ITD/12A/2024/002", issuedBy: "Income Tax Department, Government of India", issueDate: "2024-01-15" }),
                    sealImage: { public_id: "", url: "" },
                    backgroundImage: { public_id: "", url: "" },
                    pdf: { public_id: "", url: "" },
                    isActive: true,
                },
            ]);
            console.log("Seeded NGO Certificates");
        }

        console.log("All seeding complete.");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding data:", error.message);
        process.exit(1);
    }
};

seedAll();
