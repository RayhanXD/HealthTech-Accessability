const express = require('express');
const router = express.Router();
const {
  getAllTrainers,
  getTrainerById,
  createTrainer,
  updateTrainer,
  deleteTrainer,
  addPlayerToTrainer,
  removePlayerFromTrainer,
  getTrainerPlayers,
  getTrainerPlayersWithHealth,
  getTrainerByEmail,
  addPlayerToTrainerByEmail
} = require('../controllers/trainerController');

// @route   GET /api/trainers
// @desc    Get all trainers with optional filtering and pagination
// @access  Public
// Query parameters: page, limit, search
router.get('/', getAllTrainers);

// @route   GET /api/trainers/email/:email
// @desc    Find trainer by email
// @access  Public
router.get('/email/:email', getTrainerByEmail);

// @route   POST /api/trainers/email/:email/players
// @desc    Add player to trainer by email
// @access  Public
// Body: { playerId: "player_id_here" }
router.post('/email/:email/players', addPlayerToTrainerByEmail);

// @route   GET /api/trainers/:id
// @desc    Get single trainer by ID with populated players
// @access  Public
router.get('/:id', getTrainerById);

// @route   POST /api/trainers
// @desc    Create new trainer
// @access  Public
router.post('/', createTrainer);

// @route   PUT /api/trainers/:id
// @desc    Update trainer
// @access  Public
router.put('/:id', updateTrainer);

// @route   DELETE /api/trainers/:id
// @desc    Delete trainer
// @access  Public
router.delete('/:id', deleteTrainer);

// @route   GET /api/trainers/:id/players/health
// @desc    Get all players assigned to a trainer with health data
// @access  Public
router.get('/:id/players/health', getTrainerPlayersWithHealth);

// @route   GET /api/trainers/:id/players
// @desc    Get all players assigned to a trainer
// @access  Public
router.get('/:id/players', getTrainerPlayers);

// @route   POST /api/trainers/:id/players
// @desc    Add player to trainer
// @access  Public
// Body: { playerId: "player_id_here" }
router.post('/:id/players', addPlayerToTrainer);

// @route   DELETE /api/trainers/:id/players/:playerId
// @desc    Remove player from trainer
// @access  Public
router.delete('/:id/players/:playerId', removePlayerFromTrainer);

module.exports = router;
