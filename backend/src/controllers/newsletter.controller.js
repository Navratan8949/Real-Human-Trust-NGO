const { Newsletter } = require("../models");
const { SendMassEmail } = require("../utils/sendMail");

exports.subscribe = async (req, res) => {
    try {
        const { email, name } = req.body;
        if (!email) return res.status(400).json({ success: false, message: "Email is required" });

        const existing = await Newsletter.findOne({ where: { email } });
        if (existing) {
            return res.status(400).json({ success: false, message: "You are already subscribed!" });
        }

        await Newsletter.create({ email, name: name || "" });
        res.status(201).json({ success: true, message: "Subscribed successfully! Thank you." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllSubscribers = async (req, res) => {
    try {
        const subscribers = await Newsletter.findAll({
            where: { isActive: true },
            order: [["createdAt", "DESC"]],
        });
        res.status(200).json({ success: true, count: subscribers.length, subscribers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteSubscriber = async (req, res) => {
    try {
        const subscriber = await Newsletter.findByPk(req.params.id);
        if (subscriber) {
            await subscriber.destroy();
        }
        res.status(200).json({ success: true, message: "Subscriber removed" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.sendMassNewsletter = async (req, res) => {
    try {
        const { subject, html } = req.body;
        
        if (!subject || !html) {
            return res.status(400).json({ success: false, message: "Subject and HTML content are required." });
        }

        const subscribers = await Newsletter.findAll({ where: { isActive: true } });
        
        if (!subscribers || subscribers.length === 0) {
            return res.status(404).json({ success: false, message: "No active subscribers found." });
        }

        const emails = subscribers.map(sub => sub.email);

        await SendMassEmail(emails, subject, html);

        res.status(200).json({ success: true, message: `Newsletter sent successfully to ${emails.length} subscribers!` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
