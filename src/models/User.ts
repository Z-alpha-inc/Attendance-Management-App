// src/models/User.ts
import { Schema, model, models, type Types, type Model } from 'mongoose';

export type UserRole = 'admin' | 'employee';

export interface IUserDB {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
  self_correction_date?: Date | null;
}

const UserSchema = new Schema<IUserDB>(
  {
    name: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 100,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // ← ココだけでユニークインデックスを張る
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'employee'],
      default: 'employee',
      required: true,
    },
    self_correction_date: {
      type: Date,
      default: null,
    },
  },
  {
    collection: 'users',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform(
        _doc,
        ret: Partial<IUserDB> & { _id?: Types.ObjectId; password?: string }
      ) {
        // _id と password を外し、id を string で返す
        const { _id, password, ...rest } = ret;
        return {
          id: _id?.toHexString(),
          ...rest,
        };
      },
    },
    toObject: { virtuals: true },
  }
);

export const User: Model<IUserDB> =
  (models.User as Model<IUserDB>) || model<IUserDB>('User', UserSchema);
