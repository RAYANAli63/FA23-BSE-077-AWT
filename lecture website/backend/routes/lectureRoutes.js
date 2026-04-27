const express = require('express');
const router = express.Router();
const {
  getAllLectures,
  getLectureBySlug,
  createLecture,
  updateLecture,
  deleteLecture,
} = require('../controllers/lectureController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/').get(getAllLectures).post(protect, adminOnly, createLecture);
router.route('/:slug').get(getLectureBySlug);
router.route('/id/:id').put(protect, adminOnly, updateLecture).delete(protect, adminOnly, deleteLecture);

module.exports = router;
