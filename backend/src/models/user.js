import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
    },
    password: {
      type: String, required: true, select: false,
    },
    username: {
      type: String, required: true, lowercase: true, unique: true,
    },
    name: {
      type: String, required: true,
    },
    /* NOTE: If you are using admin panel and controllers specific to admin panel,
        you can control the authority of users with the help of this field. */
    type: {
      type: String,
      enum: ['admin', 'user', 'kid', 'teacher'],
      default: 'user',
    },
    language: {
      type: String,
      enum: ['tr', 'en'],
      default: 'en',
    },
    isPremium: {
      type: Boolean, default: false,
    },
    // NOTE: You can change the gender options acc. to your needs in the app.
    gender: {
      type: String,
      enum: ['male', 'female', 'other', ''],
      default: '',
    },
    countryCode: {
      type: String,
    },
    timezone: {
      type: Number,
    },
    birthDate: {
      type: Date,
    },
    photo: {
      type: Schema.Types.ObjectId,
      ref: 'Attachment',
    },
    // NOTE: To check whether the account is active or not.
    // When user deletes the account, you can store the information anonymously.
    isActivated: {
      type: Boolean,
      default: true,
    },
    // NOTE: To check whether the user skipped the email-verification step or not.
    // You can delete the unverified accounts day by day.
    isVerified: {
      type: Boolean,
      required: true,
    },
    deviceId: {
      type: String,
    },
    // NOTE: You can add more options acc. to your need.
    platform: {
      type: String,
      enum: ['Android', 'IOS', 'Web'],
      required: true,
    },
    // NOTE: In case the user delete its account,
    // you can store its non-personalized information anonymously.
    deletedAt: {
      type: Date,
    },
    memoryDate: {
      type: Date,
    },
    roles: [{ type: Schema.Types.ObjectId, ref: 'Role' }],
    permissions: [{ type: Schema.Types.ObjectId, ref: 'Permission' }],
    classes: [{ type: Schema.Types.ObjectId, ref: 'Class' }],
  },
  {
    timestamps: true,
  },
);
userSchema.virtual('photoSrc').get(function () {
  // If photo is populated and has a src field, return it directly
  if (this.photo && typeof this.photo === 'object' && this.photo.src) {
    return this.photo.src;
  }
  // If photo is just an ObjectId or not populated, return null
  return null;
});

const User = model('User', userSchema);
export default User;
