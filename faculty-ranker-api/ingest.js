import mongoose from "mongoose";
import fetch from "node-fetch";
import dotenv from "dotenv";
import Professor from "./models/Professor.js";

dotenv.config();

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

    const res = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
    });

    const json = await res.json();

    if (!json?.data?.length) {
      throw new Error("No data received from API");
    }

    const docs = json.data
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

    await Professor.deleteMany({});
    console.log(`🗑️  Cleared Professor collection`);

    await Professor.insertMany(docs, { ordered: false });
    console.log(`✅ Inserted ${docs.length} professors`);

    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Import failed:", err);
    process.exit(1);
  }
}

run();
