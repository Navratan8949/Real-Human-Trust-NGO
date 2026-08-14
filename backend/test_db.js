const { SiteContent } = require('./src/models');
const { connectDB } = require('./src/config/db');
async function test() {
    await connectDB();
    const content = await SiteContent.findOne({ where: { key: 'donate_details' } });
    console.log(content.content);
    process.exit(0);
}
test();
