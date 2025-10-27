import { Schema, model, models, type Model } from 'mongoose';

export interface IAttendance {
  _id: any;
  user_id: any; // ObjectId
  date_key: string; // "YYYY-MM-DD"（JST）
  status: 'open' | 'closed';
  clock_in: Date;
  clock_out: Date | null;
  workedMinutes: number | null;
  created_at: Date;
  updated_at: Date;
  lastModifiedBy: any; // ObjectId
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    user_id: { type: Schema.Types.ObjectId, required: true, index: true },
    date_key: { type: String, required: true, index: true }, // 例: 2025-10-22（JST）
    status: {
      type: String,
      enum: ['open', 'closed'],
      required: true,
      index: true,
    },
    clock_in: { type: Date, required: true },
    clock_out: { type: Date, default: null },
    workedMinutes: { type: Number, default: null },
    lastModifiedBy: { type: Schema.Types.ObjectId, required: true },
  },
  {
    collection: 'attendance',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
      versionKey: false,
      transform(_doc, ret: any) {
        ret.id = ret._id?.toString();
        delete ret._id;
      },
    },
  }
);

// 同一ユーザー×日付は1件にしたい（走査高速化）
AttendanceSchema.index({ user_id: 1, date_key: 1 }, { unique: true });

export const Attendance: Model<IAttendance> =
  (models.Attendance as Model<IAttendance>) ||
  model<IAttendance>('Attendance', AttendanceSchema);
