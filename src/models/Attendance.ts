import { Schema, model, models, type Model, type Types } from 'mongoose';

export interface IAttendance {
  _id: Types.ObjectId;
  user_id: Types.ObjectId;
  date_key: string;
  status: 'open' | 'closed';
  clock_in: Date;
  clock_out: Date | null;
  workedMinutes: number | null;
  totalBreakMinutes: number; // 👈 nullではなく必ず数値で管理（合計休憩分）
  breaks: { start: Date; end: Date | null }[];
  created_at: Date;
  updated_at: Date;
  lastModifiedBy: Types.ObjectId;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    user_id: { type: Schema.Types.ObjectId, required: true, index: true },
    date_key: { type: String, required: true, index: true },
    status: { type: String, enum: ['open', 'closed'], required: true },
    clock_in: { type: Date, required: true },
    clock_out: { type: Date, default: null },
    workedMinutes: { type: Number, default: null },
    totalBreakMinutes: { type: Number, default: 0 }, // 👈 初期値 0
    breaks: [
      {
        start: { type: Date, required: true },
        end: { type: Date, default: null },
      },
    ],
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

// 同一ユーザー×同一日付はユニーク
AttendanceSchema.index({ user_id: 1, date_key: 1 }, { unique: true });

export const Attendance: Model<IAttendance> =
  models.Attendance || model<IAttendance>('Attendance', AttendanceSchema);