const mongoose = require('mongoose');
const slugify = require('slugify');

const sectionSchema = new mongoose.Schema({
  heading: { type: String, required: true },
  content: { type: String, required: true },
  order: { type: Number, default: 0 },
});

const lectureSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Lecture title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    content: {
      type: String,
      default: '',
    },
    sections: [sectionSchema],
    order: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    thumbnail: {
      type: String,
      default: '',
    },
    duration: {
      type: String,
      default: '~10 min read',
    },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

// Auto-generate slug from title before saving
lectureSchema.pre('save', function () {
  if (this.isModified('title') || !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
});

module.exports = mongoose.model('Lecture', lectureSchema);
