const { sequelize } = require("../config/db");
const User = require("./User");
const Member = require("./Member");
const Certificate = require("./Certificate");
const AppointmentLetter = require("./AppointmentLetter");
const Donation = require("./Donation");
const Event = require("./Event");
const EventRegistration = require("./EventRegistration");
const Project = require("./Project");
const Crowdfunding = require("./Crowdfunding");
const Gallery = require("./Gallery");
const News = require("./News");
const Newsletter = require("./Newsletter");
const Report = require("./Report");
const SiteContent = require("./SiteContent");
const Team = require("./Team");
const Testimonial = require("./Testimonial");
const Volunteer = require("./Volunteer");
const Complaint = require("./Complaint");
const Contact = require("./Contact");
const Download = require("./Download");
const Award = require("./Award");
const NGOCertificate = require("./NGOCertificate");

// --- Associations ---

// User <-> Member
User.hasOne(Member, { foreignKey: "userId", as: "member", onDelete: "CASCADE" });
Member.belongsTo(User, { foreignKey: "userId", as: "user" });

Member.belongsTo(User, { foreignKey: "referredById", as: "referredBy" });
Member.belongsTo(User, { foreignKey: "createdById", as: "createdBy" });

// Member <-> Certificate
Member.hasMany(Certificate, { foreignKey: "memberId", as: "certificates", onDelete: "CASCADE" });
Certificate.belongsTo(Member, { foreignKey: "memberId", as: "member" });

// Volunteer <-> Certificate
Volunteer.hasMany(Certificate, { foreignKey: "volunteerId", as: "certificates", onDelete: "CASCADE" });
Certificate.belongsTo(Volunteer, { foreignKey: "volunteerId", as: "volunteer" });

// Member <-> AppointmentLetter
Member.hasMany(AppointmentLetter, { foreignKey: "memberId", as: "appointmentLetters", onDelete: "CASCADE" });
AppointmentLetter.belongsTo(Member, { foreignKey: "memberId", as: "member" });

// Donation relationships
Donation.belongsTo(User, { foreignKey: "userId", as: "user" });
Donation.belongsTo(Member, { foreignKey: "memberId", as: "member" });
Donation.belongsTo(Project, { foreignKey: "projectId", as: "project" });
Donation.belongsTo(Crowdfunding, { foreignKey: "campaignId", as: "campaign" });

// Event relationships
Event.belongsTo(User, { foreignKey: "createdById", as: "createdBy" });
Event.hasMany(EventRegistration, { foreignKey: "eventId", as: "registrations", onDelete: "CASCADE" });
EventRegistration.belongsTo(Event, { foreignKey: "eventId", as: "event" });
EventRegistration.belongsTo(Member, { foreignKey: "memberId", as: "member" });

// Project <-> Crowdfunding
Project.hasMany(Crowdfunding, { foreignKey: "projectId", as: "crowdfundings", onDelete: "CASCADE" });
Crowdfunding.belongsTo(Project, { foreignKey: "projectId", as: "project" });
Project.belongsTo(User, { foreignKey: "createdById", as: "createdBy" });

// CreatedBy / UpdatedBy User relationships
Gallery.belongsTo(User, { foreignKey: "createdById", as: "createdBy" });
News.belongsTo(User, { foreignKey: "createdById", as: "createdBy" });
Report.belongsTo(User, { foreignKey: "createdById", as: "createdBy" });
SiteContent.belongsTo(User, { foreignKey: "updatedById", as: "updatedBy" });
Team.belongsTo(User, { foreignKey: "createdById", as: "createdBy" });
Download.belongsTo(User, { foreignKey: "createdById", as: "createdBy" });
Award.belongsTo(User, { foreignKey: "createdById", as: "createdBy" });

// Complaint relationships
Complaint.belongsTo(Member, { foreignKey: "memberId", as: "member" });
Complaint.belongsTo(User, { foreignKey: "resolvedById", as: "resolvedBy" });

module.exports = {
    sequelize,
    User,
    Member,
    Certificate,
    AppointmentLetter,
    Donation,
    Event,
    EventRegistration,
    Project,
    Crowdfunding,
    Gallery,
    News,
    Newsletter,
    Report,
    SiteContent,
    Team,
    Testimonial,
    Volunteer,
    Complaint,
    Contact,
    Download,
    Award,
    NGOCertificate,
};
