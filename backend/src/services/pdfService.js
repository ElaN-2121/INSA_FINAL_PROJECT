const PDFDocument = require('pdfkit');

function truncate(value, length = 32) {
  if (!value) return '';
  return value.length > length ? `${value.slice(0, length)}...` : value;
}

function generateCredentialPdf(credential) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(28).fillColor('#1a365d').text('EthioCred', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(14).fillColor('#4a5568').text('Verified Digital Credential', { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(18).fillColor('#2d3748').text(credential.institution_name, { align: 'center' });
    doc.moveDown(1.5);

    doc.fontSize(26).fillColor('#1a202c').text(credential.holder_name, { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(12).fillColor('#2d3748');
    const details = [
      ['Degree', credential.degree_name],
      ['Major', credential.major || 'N/A'],
      ['Graduation Year', String(credential.graduation_year)],
      ['GPA', String(credential.gpa)],
      ['Issue Date', String(credential.issue_date).split('T')[0]],
    ];

    details.forEach(([label, value]) => {
      doc.text(`${label}: ${value}`);
      doc.moveDown(0.4);
    });

    doc.moveDown(1);
    doc.font('Courier').fontSize(9).fillColor('#718096');
    doc.text(`Serial Number: ${credential.serial_number}`);
    doc.moveDown(0.5);
    doc.text(`Integrity Hash: ${truncate(credential.credential_hash)}`);
    doc.moveDown(0.5);
    doc.text(`Digital Signature: ${truncate(credential.digital_signature)}`);

    doc.moveDown(2);
    doc.font('Helvetica').fontSize(9).fillColor('#a0aec0');
    doc.text(
      'This document is a visual representation of a cryptographically signed credential. Verify authenticity at ethiocred.et',
      { align: 'center' }
    );

    if (credential.status === 'REVOKED') {
      doc.save();
      doc.rotate(-45, { origin: [doc.page.width / 2, doc.page.height / 2] });
      doc.fontSize(72).fillColor('#e53e3e', 0.3).text('REVOKED', 0, doc.page.height / 2 - 40, {
        align: 'center',
        width: doc.page.width,
      });
      doc.restore();
    }

    doc.end();
  });
}

module.exports = { generateCredentialPdf };
