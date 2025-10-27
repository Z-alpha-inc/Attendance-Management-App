import mongoose from 'mongoose';

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');

  // ← ここで dbName を明示（URIにDB名がない場合の保険）
  const dbName = process.env.MONGODB_DB || undefined; // 例: "attendance-app"

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 15000,
    ...(dbName ? { dbName } : {}),
  });
  console.log('✅ MongoDB Connected');
  console.log('   host:', mongoose.connection.host);
  console.log('   db  :', mongoose.connection.name);
}
