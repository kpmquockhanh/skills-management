import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const roomSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    thumbnail: {
      type: Schema.Types.ObjectId,
      ref: 'Attachment',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    class: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      immutable: true, // cannot be changed once set
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Room = model('Room', roomSchema);
export default Room;
