// ===============================
// ✅ CommonJS-compatible version
// ===============================
const Jimp = require("jimp");
const QRCode = require("qrcode");
const { create } = require("ipfs-http-client");
const fs = require("fs");
const path = require("path");

// 🔗 IPFS client (using Infura or your node)
const ipfs = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
});

// ===============================
// 🏅 Badge Generator Function
// ===============================
async function generateAndUploadBadge({
  name,
  role,
  amount,
  timestamp = new Date().toLocaleString(),
}) {
  try {
    // --- Step 1: Prepare background image ---
    const templatePath = `./templates/${role.toLowerCase()}_template.png`;
    const background = await Jimp.read(
      fs.existsSync(templatePath)
        ? templatePath
        : "./templates/default_template.png"
    );

    // --- Step 2: Load font ---
    const font = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);

    // --- Step 3: Add donor info text ---
    background.print(font, 20, 20, `Name: ${name}`);
    background.print(font, 20, 45, `Role: ${role}`);
    background.print(font, 20, 70, `Donation: ₹${amount}`);
    background.print(font, 20, 95, `Date: ${timestamp}`);

    // --- Step 4: Save temporary badge ---
    const badgeDir = "./badges";
    if (!fs.existsSync(badgeDir)) fs.mkdirSync(badgeDir);

    const badgeFileName = `${role}_${name}_${Date.now()}.png`;
    const badgePath = path.join(badgeDir, badgeFileName);
    await background.writeAsync(badgePath);
    console.log(`✅ Badge generated: ${badgePath}`);

    // --- Step 5: Upload badge to IPFS ---
    const badgeBuffer = fs.readFileSync(badgePath);
    const uploadedBadge = await ipfs.add(badgeBuffer);
    const badgeCID = uploadedBadge.cid.toString();
    const badgeUrl = `https://ipfs.io/ipfs/${badgeCID}`;
    console.log(`🔗 Badge uploaded to IPFS: ${badgeUrl}`);

    // --- Step 6: Generate QR Code of IPFS URL ---
    const qrBuffer = await QRCode.toBuffer(badgeUrl, { width: 100 });
    const qrImage = await Jimp.read(qrBuffer);

    // --- Step 7: Add QR Code on badge ---
    const finalBadge = await Jimp.read(badgePath);
    finalBadge.composite(qrImage, finalBadge.bitmap.width - 120, 10); // top-right corner

    const finalBadgePath = path.join(badgeDir, `final_${badgeFileName}`);
    await finalBadge.writeAsync(finalBadgePath);
    console.log(`🏅 Final badge with QR created: ${finalBadgePath}`);

    // --- Step 8: Upload final badge to IPFS ---
    const finalBadgeBuffer = fs.readFileSync(finalBadgePath);
    const finalUploaded = await ipfs.add(finalBadgeBuffer);
    const finalBadgeCID = finalUploaded.cid.toString();
    const finalBadgeUrl = `https://ipfs.io/ipfs/${finalBadgeCID}`;
    console.log(`🚀 Final badge uploaded to IPFS: ${finalBadgeUrl}`);

    // --- Step 9: Create metadata JSON ---
    const metadata = {
      name: `${name} - ${role} Badge`,
      description: `Blockchain Donation Recognition Badge for ${role}`,
      image: finalBadgeUrl,
      attributes: [
        { trait_type: "Name", value: name },
        { trait_type: "Role", value: role },
        { trait_type: "Donation", value: `₹${amount}` },
        { trait_type: "Date", value: timestamp },
        { trait_type: "Badge CID", value: finalBadgeCID },
      ],
    };

    const metadataFile = `${badgeDir}/${name}_${role}_metadata.json`;
    fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));

    // --- Step 10: Upload metadata JSON to IPFS ---
    const metadataBuffer = fs.readFileSync(metadataFile);
    const metadataUpload = await ipfs.add(metadataBuffer);
    const metadataCID = metadataUpload.cid.toString();
    const metadataUrl = `https://ipfs.io/ipfs/${metadataCID}`;
    console.log(`📜 Metadata uploaded to IPFS: ${metadataUrl}`);

    // --- Step 11: Return all info ---
    return {
      name,
      role,
      amount,
      timestamp,
      badgeImageCID: finalBadgeCID,
      badgeImageUrl: finalBadgeUrl,
      metadataCID,
      metadataUrl,
    };
  } catch (error) {
    console.error("❌ Error generating badge:", error);
  }
}

// ===============================
// 🧪 Example Run
// ===============================
(async () => {
  const badge = await generateAndUploadBadge({
    name: "Akshay Kurhekar",
    role: "Donor",
    amount: 5000,
  });

  console.log("\n🎯 Final Badge Info:", badge);
})();
