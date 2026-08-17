const { Member, Donation, Project, Event, Complaint, Crowdfunding, Volunteer, User, sequelize } = require("../models");
const { Op } = require("sequelize");

exports.fixLiveDb = async (req, res) => {
    try {
        const [tables] = await sequelize.query("SHOW TABLES;");
        let droppedCount = 0;
        let logs = [];
        for (let t of tables) {
            const tableName = Object.values(t)[0];
            const [indexes] = await sequelize.query(`SHOW INDEXES FROM ${tableName};`);
            const indexNames = [...new Set(indexes.map(i => i.Key_name))];
            for (let idx of indexNames) {
                if (idx !== 'PRIMARY' && /\_\d+$/.test(idx)) {
                    logs.push(`Dropping ${idx} from ${tableName}`);
                    await sequelize.query(`ALTER TABLE ${tableName} DROP INDEX ${idx};`).catch(e => logs.push(`Error: ${e.message}`));
                    droppedCount++;
                }
            }
        }
        res.status(200).json({ success: true, message: `Dropped ${droppedCount} duplicate indexes.`, logs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        // --- 1. Basic Counts ---
        const totalMembers = await Member.count();
        const approvedMembers = await Member.count({ where: { membershipStatus: "approved" } });

        const totalProjects = await Project.count();
        const activeProjects = await Project.count({ where: { status: "active" } });
        const completedProjects = await Project.count({ where: { status: "completed" } });

        const totalEvents = await Event.count();
        const upcomingEvents = await Event.count({ where: { status: "upcoming" } });

        const donations = await Donation.findAll({
            where: { paymentStatus: { [Op.in]: ["success", "verified"] } }
        });
        const totalDonationAmount = donations.reduce((sum, d) => sum + Number(d.amount), 0);
        const totalDonationCount = donations.length;

        // --- 2. Actionable Alerts ---
        const pendingMembersList = await Member.findAll({
            where: { membershipStatus: "pending" },
            include: [{ model: User, as: "user", attributes: ["fullName", "email"] }],
            order: [["createdAt", "DESC"]],
            limit: 5,
        });
        const pendingMembersCount = await Member.count({ where: { membershipStatus: "pending" } });

        const pendingDonationsList = await Donation.findAll({
            where: { paymentStatus: "pending", paymentId: "manual" },
            include: [{
                model: Member,
                as: "member",
                include: [{ model: User, as: "user", attributes: ["fullName"] }]
            }],
            order: [["createdAt", "DESC"]],
            limit: 5,
        });
        const pendingDonationsCount = await Donation.count({
            where: { paymentStatus: "pending", paymentId: "manual" }
        });

        const openComplaintsList = await Complaint.findAll({
            where: { status: "pending" },
            include: [{
                model: Member,
                as: "member",
                include: [{ model: User, as: "user", attributes: ["fullName"] }]
            }],
            order: [["createdAt", "DESC"]],
            limit: 5,
        });
        const openComplaintsCount = await Complaint.count({ where: { status: "pending" } });

        const pendingVolunteersList = await Volunteer.findAll({
            where: { status: "pending" },
            order: [["createdAt", "DESC"]],
            limit: 5,
        });
        const pendingVolunteersCount = await Volunteer.count({ where: { status: "pending" } });

        // --- 3. Crowdfunding Progress ---
        const activeCrowdfundings = await Crowdfunding.findAll({
            where: { status: "active" },
            attributes: ["id", "_id", "title", "targetAmount", "raisedAmount", "endDate"],
        });
        
        // --- 4. Guaranteed 6-Month Donation Trends ---
        const monthlyTrends = [];
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
            
            const monthSum = donations.filter(don => {
                const donDate = new Date(don.createdAt);
                return donDate.getMonth() === d.getMonth() && donDate.getFullYear() === d.getFullYear();
            }).reduce((sum, don) => sum + Number(don.amount), 0);

            monthlyTrends.push({ month: label, amount: monthSum });
        }

        // --- 5. Donations by Purpose ---
        const donationsByPurposeMap = {};
        donations.forEach(d => {
            const purpose = d.purpose || "General";
            if (!donationsByPurposeMap[purpose]) {
                donationsByPurposeMap[purpose] = 0;
            }
            donationsByPurposeMap[purpose] += Number(d.amount);
        });
        const donationsByPurpose = Object.keys(donationsByPurposeMap).map(key => ({
            name: key,
            value: donationsByPurposeMap[key]
        }));

        // --- 6. Status Breakdown Analytics ---
        const memberDistribution = [
            { name: "Approved", value: approvedMembers },
            { name: "Pending", value: pendingMembersCount }
        ].filter(m => m.value > 0);

        const projectDistribution = [
            { name: "Active", value: activeProjects },
            { name: "Completed", value: completedProjects },
            { name: "Upcoming/Other", value: Math.max(0, totalProjects - activeProjects - completedProjects) }
        ].filter(p => p.value > 0);

        // --- 7. Recent Activity Timeline ---
        const recentMembers = await Member.findAll({
            include: [{ model: User, as: "user", attributes: ["fullName"] }],
            order: [["createdAt", "DESC"]],
            limit: 3,
        });
        const recentDonationsFeed = await Donation.findAll({
            order: [["createdAt", "DESC"]],
            limit: 3,
        });
        const recentComplaints = await Complaint.findAll({
            order: [["createdAt", "DESC"]],
            limit: 3,
        });

        const activityFeed = [];

        recentMembers.forEach(m => {
            activityFeed.push({
                type: "member",
                title: `New member registered: ${m.user?.fullName || "Member"}`,
                time: m.createdAt,
                status: m.membershipStatus
            });
        });

        recentDonationsFeed.forEach(d => {
            activityFeed.push({
                type: "donation",
                title: `Donation of ₹${Number(d.amount || 0).toLocaleString("en-IN")} received`,
                time: d.createdAt,
                status: d.paymentStatus
            });
        });

        recentComplaints.forEach(c => {
            activityFeed.push({
                type: "complaint",
                title: `Complaint submitted: ${c.subject || "Issue"}`,
                time: c.createdAt,
                status: c.status
            });
        });

        activityFeed.sort((a, b) => new Date(b.time) - new Date(a.time));

        res.status(200).json({
            success: true,
            stats: {
                overview: {
                    members: { total: totalMembers, approved: approvedMembers },
                    projects: { total: totalProjects, active: activeProjects },
                    events: { total: totalEvents, upcoming: upcomingEvents },
                    donations: { totalAmount: totalDonationAmount, count: totalDonationCount }
                },
                actionableAlerts: {
                    pendingMembers: { count: pendingMembersCount, list: pendingMembersList },
                    pendingDonations: { count: pendingDonationsCount, list: pendingDonationsList },
                    openComplaints: { count: openComplaintsCount, list: openComplaintsList },
                    pendingVolunteers: { count: pendingVolunteersCount, list: pendingVolunteersList }
                },
                crowdfunding: activeCrowdfundings,
                monthlyTrends: monthlyTrends,
                activityFeed: activityFeed.slice(0, 5),
                analytics: {
                    donationsByPurpose,
                    memberDistribution,
                    projectDistribution
                }
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
