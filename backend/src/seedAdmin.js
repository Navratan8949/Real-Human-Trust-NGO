require("dotenv").config();
const { connectDB } = require("./config/db");
const { User, Testimonial, Project, Event, sequelize } = require("./models");
const bcrypt = require("bcryptjs");

const seedAdmin = async () => {
    try {
        await connectDB();
        await sequelize.sync();

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

        // Seed Testimonials if empty
        const testimonialCount = await Testimonial.count();
        if (testimonialCount === 0) {
            await Testimonial.bulkCreate([
                {
                    name: "Sunita Ben Parmar",
                    designation: "Skill Center Graduate",
                    message: "Real Human Trust provided free sewing machines and vocational training to 40 women in our village. Today, I earn an independent monthly income supporting my children's school fees.",
                    rating: 5,
                    status: "active",
                    image: { public_id: "", url: "/women-skill-training-workshop-india.png" }
                },
                {
                    name: "Dr. Rajesh Shah",
                    designation: "Volunteer Doctor & Donor",
                    message: "Working with Real Human Trust during rural healthcare camps in Rajkot district showed me their genuine transparency and deep commitment to helping underprivileged families.",
                    rating: 5,
                    status: "active",
                    image: { public_id: "", url: "/community-health-camp-india.png" }
                },
                {
                    name: "Ramesh Bhai Patel",
                    designation: "Parent & Beneficiary",
                    message: "My daughter received a complete 1-year education scholarship including books and uniforms. The trust truly transforms lives at the ground level.",
                    rating: 5,
                    status: "active",
                    image: { public_id: "", url: "/smiling-school-children-india-education.png" }
                },
                {
                    name: "Pooja Varma",
                    designation: "Youth Volunteer",
                    message: "Being a volunteer in the daily community kitchen initiative opened my eyes to how small daily efforts can feed hundreds of needy elders and children.",
                    rating: 5,
                    status: "active",
                    image: { public_id: "", url: "/community-kitchen-serving-food-india.png" }
                }
            ]);
            console.log("Sample Testimonials seeded successfully!");
        }

        // Seed Projects if empty
        const projectCount = await Project.count();
        if (projectCount === 0) {
            await Project.bulkCreate([
                {
                    title: "Kanya Daan – Girl Child Education",
                    description: "Help 100 girl children from poor families complete their schooling and college education.",
                    goalAmount: 100000,
                    raisedAmount: 9999,
                    status: "active",
                    isFeatured: true,
                    createdById: adminId,
                    image: { public_id: "", url: "/smiling-school-children-india-education.png" }
                },
                {
                    title: "Vedic Gurukul Education Fund",
                    description: "Sponsor a child's education in traditional Vedic gurukul system blended with modern computer science.",
                    goalAmount: 30000,
                    raisedAmount: 15000,
                    status: "active",
                    isFeatured: false,
                    createdById: adminId,
                    image: { public_id: "", url: "/rural-classroom-children-learning-india.png" }
                },
                {
                    title: "Gau Shala Construction – Mathura",
                    description: "Help us build a shelter for 500+ abandoned cows in Mathura's sacred land.",
                    goalAmount: 60000,
                    raisedAmount: 27000,
                    status: "upcoming",
                    isFeatured: false,
                    createdById: adminId,
                    image: { public_id: "", url: "/community-health-camp-india.png" }
                }
            ]);
            console.log("Sample Projects seeded successfully!");
        }

        console.log("Seeding complete.");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding data:", error.message);
        process.exit(1);
    }
};

seedAdmin();
