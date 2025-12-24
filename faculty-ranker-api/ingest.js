import mongoose from "mongoose";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import Professor from "./models/Professor.js";
import ChangeLog from "./models/ChangeLog.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: '/home/deply/Faculty-Ranker/faculty-ranker-api/.env' });

const API_URL =
  "https://cms.vitap.ac.in/api/faculty-profiles?populate=*&sort=Employee_Id:ASC";

const API_TOKEN = process.env.FACULTY_TOKEN;

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'vitap-faculty-ranker',
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("✅ Connected to MongoDB");

    // Fetch existing professors before deletion
    const existingProfessors = await Professor.find({}).lean();
    const totalBefore = existingProfessors.length;
    console.log(`📊 Current database has ${totalBefore} professors`);

    // Fetch new data from API
    const res = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
    });

    const json = await res.json();

    if (!json?.data?.length) {
      throw new Error("No data received from API");
    }

    // Transform new data
    const newDocs = json.data
      .map(({ attributes }) => {
        if (!attributes?.Employee_Id) return null;

        return {
          emp_id: Number(attributes.Employee_Id),
          name: attributes.Name ?? "",
          designation: attributes.Designation ?? "",
          department: attributes.Department ?? "",
          image: attributes.Photo?.data?.attributes?.url ?? null,
          specialization: attributes.Research_area_of_specialization
            ? attributes.Research_area_of_specialization
              .split(",")
              .map(s => s.trim())
              .filter(Boolean)
            : [],
        };
      })
      .filter(Boolean);

    const totalAfter = newDocs.length;

    // Create maps for comparison
    const existingMap = new Map(existingProfessors.map(p => [p.emp_id, p]));
    const newMap = new Map(newDocs.map(p => [p.emp_id, p]));

    // Find deletions (in existing but not in new)
    const deletedFaculties = existingProfessors.filter(p => !newMap.has(p.emp_id));

    // Find additions (in new but not in existing)
    const addedFaculties = newDocs.filter(p => !existingMap.has(p.emp_id));

    // Find updates (in both but with changes)
    const updatedFaculties = newDocs.filter(newProf => {
      const existing = existingMap.get(newProf.emp_id);
      if (!existing) return false;

      // Check if any field changed
      return existing.name !== newProf.name ||
        existing.designation !== newProf.designation ||
        existing.department !== newProf.department ||
        existing.image !== newProf.image ||
        JSON.stringify(existing.specialization) !== JSON.stringify(newProf.specialization);
    });

    const changeLog = {
      timestamp: new Date(),
      deletedCount: deletedFaculties.length,
      deletedFaculties: deletedFaculties.map(p => ({
        emp_id: p.emp_id,
        name: p.name,
        designation: p.designation,
        department: p.department,
        image: p.image,
        specialization: p.specialization
      })),
      addedCount: addedFaculties.length,
      addedFaculties: addedFaculties.map(p => ({
        emp_id: p.emp_id,
        name: p.name,
        designation: p.designation,
        department: p.department
      })),
      updatedCount: updatedFaculties.length,
      totalBefore,
      totalAfter
    };

    // Save change log to JSON file
    const changeLogsDir = join(__dirname, 'change-logs');
    try {
      mkdirSync(changeLogsDir, { recursive: true });
    } catch (err) {
      // Directory might already exist, ignore
    }

    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const jsonFilePath = join(changeLogsDir, `${timestamp}.json`);
    writeFileSync(jsonFilePath, JSON.stringify(changeLog, null, 2));
    console.log(`📝 Change log saved to ${jsonFilePath}`);

    // Save change log to database
    await ChangeLog.create(changeLog);
    console.log(`💾 Change log saved to database`);

    // Log summary
    console.log(`\n📊 Change Summary:`);
    console.log(`   ➖ Deleted: ${deletedFaculties.length}`);
    console.log(`   ➕ Added: ${addedFaculties.length}`);
    console.log(`   ✏️  Updated: ${updatedFaculties.length}`);
    console.log(`   📈 Total: ${totalBefore} → ${totalAfter}\n`);

    // Update database
    await Professor.deleteMany({});
    console.log(`🗑️  Cleared Professor collection`);

    await Professor.insertMany(newDocs, { ordered: false });
    console.log(`✅ Inserted ${newDocs.length} professors`);

    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Import failed:", err);
    process.exit(1);
  }
}

run();
