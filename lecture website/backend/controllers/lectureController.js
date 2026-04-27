const asyncHandler = require('express-async-handler');
const Lecture = require('../models/Lecture');

// @desc  Get all lectures
// @route GET /api/lectures
// @access Public
const getAllLectures = asyncHandler(async (req, res) => {
  const { search } = req.query;
  let query = { isPublished: true };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
    ];
  }

  const lectures = await Lecture.find(query)
    .select('title slug order duration tags thumbnail createdAt')
    .sort({ order: 1, createdAt: 1 });

  res.json({ success: true, count: lectures.length, data: lectures });
});

// @desc  Get single lecture by slug
// @route GET /api/lectures/:slug
// @access Public
const getLectureBySlug = asyncHandler(async (req, res) => {
  const lecture = await Lecture.findOne({ slug: req.params.slug, isPublished: true });

  if (!lecture) {
    res.status(404);
    throw new Error('Lecture not found');
  }

  res.json({ success: true, data: lecture });
});

// @desc  Create a lecture
// @route POST /api/lectures
// @access Private (Admin)
const createLecture = asyncHandler(async (req, res) => {
  const { title, content, sections, order, duration, tags, thumbnail } = req.body;

  const lecture = await Lecture.create({
    title,
    content,
    sections: sections || [],
    order: order || 0,
    duration,
    tags: tags || [],
    thumbnail,
  });

  res.status(201).json({ success: true, data: lecture });
});

// @desc  Update a lecture
// @route PUT /api/lectures/:id
// @access Private (Admin)
const updateLecture = asyncHandler(async (req, res) => {
  let lecture = await Lecture.findById(req.params.id);

  if (!lecture) {
    res.status(404);
    throw new Error('Lecture not found');
  }

  lecture = await Lecture.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, data: lecture });
});

// @desc  Delete a lecture
// @route DELETE /api/lectures/:id
// @access Private (Admin)
const deleteLecture = asyncHandler(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);

  if (!lecture) {
    res.status(404);
    throw new Error('Lecture not found');
  }

  await lecture.deleteOne();
  res.json({ success: true, message: 'Lecture deleted successfully' });
});

module.exports = {
  getAllLectures,
  getLectureBySlug,
  createLecture,
  updateLecture,
  deleteLecture,
};
