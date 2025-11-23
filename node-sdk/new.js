// ===============================
// ✅ Image Generator (Centered Text)
// ===============================
let Jimp = require("jimp");
if (Jimp.Jimp) Jimp = Jimp.Jimp; // handles all Jimp versions

const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");

// ===============================
// 🏅 Badge Generator Function
// ===============================
async function generateBadge({
  name,
  role,
  amount,
  qrData = "Donation-Transaction-XYZ123",
  timestamp = new Date().toLocaleString(),
}) {
  try {
    // --- Step 1: Prepare template ---
    const templatePath = `./templates/${role.toLowerCase()}_template.png`;
    const background = await Jimp.read(
      fs.existsSync(templatePath)
        ? templatePath
        : "./templates/default_template.png"
    );

    // --- Step 2: Load font ---
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

    // --- Step 3: Prepare text block ---
    const lines = [
      `Name: ${name}`,
      `Role: ${role}`,
      `Donation: ₹${amount}`,
      `Date: ${timestamp}`,
    ];

    const lineHeight = 38; // vertical space between lines
    const textBlockHeight = lines.length * lineHeight;

    // --- Step 4: Calculate vertical center ---
    const startY = background.bitmap.height / 2 - textBlockHeight / 2;

    // --- Step 5: Draw text lines centered horizontally ---
    lines.forEach((line, i) => {
      const textWidth = Jimp.measureText(font, line);
      const x = background.bitmap.width / 2 - textWidth / 2;
      const y = startY + i * lineHeight;
      background.print(font, x, y, line);
    });

    // --- Step 6: Generate QR Code (bottom-right corner) ---
    const qrBuffer = await QRCode.toBuffer(qrData, { width: 100 });
    const qrImage = await Jimp.read(qrBuffer);
    background.composite(
      qrImage,
      background.bitmap.width - 120,
      background.bitmap.height - 120
    );

    // --- Step 7: Save final badge ---
    const outputDir = "./badges";
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    const badgeFileName = `centered_${role}_${name}_${Date.now()}.png`;
    const outputPath = path.join(outputDir, badgeFileName);
    await background.writeAsync(outputPath);

    console.log(`🏅 Centered badge created: ${outputPath}`);

    return {
      name,
      role,
      amount,
      qrData,
      timestamp,
      filePath: outputPath,
    };
  } catch (error) {
    console.error("❌ Error generating badge:", error);
  }
}

// ===============================
// 🧪 Example Usage
// ===============================
(async () => {
  const badge = await generateBadge({
    name: "Akshay Kurhekar",
    role: "Donor",
    amount: 5000,
    qrData: "DonationID#12345",
  });

  console.log("\n🎯 Badge Info:", badge);
})();
