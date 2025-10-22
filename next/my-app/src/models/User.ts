// src/models/User.ts
import { Schema, model, models, type Types, type Model } from "mongoose";

export type UserRole = "admin" | "employee";

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
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "employee"],
      default: "employee",
      required: true,
    },
    self_correction_date: {
      type: Date,
      default: null,
    },
  },
  {
    collection: "users",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },

    toJSON: {
      virtuals: true,
      versionKey: false,
      transform(_doc, ret) {
        // 型を安全に扱うために分割代入を使う
        const { _id, password, ...rest } = ret as {
          _id?: Types.ObjectId;
          password?: string;
          [key: string]: any;
        };

        return {
          id: _id?.toHexString(),
          ...rest,
        };
      },
    },

    toObject: { virtuals: true },
  }
);

// email にユニークインデックスを作成（重複防止）
UserSchema.index({ email: 1 }, { unique: true });

export const User: Model<IUserDB> =
  (models.User as Model<IUserDB>) || model<IUserDB>("User", UserSchema);