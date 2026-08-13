const { format } = require("date-fns");

const DEFAULT_TEMPLATE = (cert) => `
  <div style="text-align:center; padding: 40px 30px; font-family: 'Georgia', serif;">
    <div style="border: 4px double #1a3c6c; padding: 30px; border-radius: 12px; background: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #1a3c6c; font-size: 32px; margin: 0; font-weight: bold; letter-spacing: 2px;">CERTIFICATE</h1>
        <div style="width: 80px; height: 3px; background: #d4af37; margin: 10px auto;"></div>
      </div>
      <p style="font-size: 16px; color: #555; margin-bottom: 25px;">This is to certify that</p>
      <h2 style="color: #1a3c6c; font-size: 24px; margin-bottom: 20px; font-weight: bold;">Real Human Education & Charitable Trust</h2>
      <p style="font-size: 15px; color: #444; line-height: 1.8; margin-bottom: 20px;">
        is a registered organization under the<br/>
        <strong style="color: #1a3c6c;">${cert.issuedBy || "Government Authority"}</strong><br/>
        <strong>Certificate No: ${cert.certificateNo}</strong>
      </p>
      ${cert.description ? `<p style="font-size: 14px; color: #666; margin-bottom: 25px; font-style: italic;">"${cert.description}"</p>` : ''}
      <div style="margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div style="text-align: left;">
          <div style="border-top: 1px solid #1a3c6c; width: 150px; padding-top: 5px; font-size: 12px; color: #666;">Date of Issue</div>
          <p style="font-weight: bold; color: #1a3c6c; margin-top: 5px;">${cert.issueDate ? new Date(cert.issueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div style="text-align: center;">
          ${cert.sealImage?.url ? `<img src="${cert.sealImage.url}" alt="Official Seal" style="width: 80px; height: 80px; object-fit: contain; border-radius: 50%; border: 2px solid #d4af37;" />` : '<div style="width: 80px; height: 80px; border-radius: 50%; border: 2px solid #d4af37; display: flex; align-items: center; justify-content: center; color: #d4af37; font-size: 12px; margin: 0 auto;">OFFICIAL SEAL</div>'}
          <p style="font-size: 11px; color: #888; margin-top: 5px;">Authorized Signature</p>
        </div>
      </div>
    </div>
  </div>
`;

const populateTemplate = (template, data) => {
  if (!template) return DEFAULT_TEMPLATE(data);

  let populated = template;
  const map = {
    "{{title}}": data.title || "",
    "{{certificateNo}}": data.certificateNo || "",
    "{{issuedBy}}": data.issuedBy || "",
    "{{issueDate}}": data.issueDate ? new Date(data.issueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : "",
    "{{description}}": data.description || "",
    "{{sealImage}}": data.sealImage?.url || "",
    "{{backgroundImage}}": data.backgroundImage?.url || "",
  };

  for (const [key, value] of Object.entries(map)) {
    const regex = new RegExp(key.replace(/[{}]/g, '\\$&'), 'g');
    populated = populated.replace(regex, value);
  }

  return populated;
};

module.exports = {
  populateTemplate,
  DEFAULT_TEMPLATE,
};
