const { body } = require('express-validator');

const allowedSexAtBirth = ['Male', 'Female', 'Other'];

const playerValidation = {
  create: [
    body('Username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters'),
    body('Password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('fName')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('First name is required and must be under 50 characters'),
    body('Lname')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Last name is required and must be under 50 characters'),
    body('Age')
      .isInt({ min: 1, max: 120 })
      .withMessage('Age must be a number between 1 and 120'),
    body('Bodyweight_in_pounds')
      .isFloat({ min: 1, max: 1000 })
      .withMessage('Body weight must be between 1 and 1000 pounds'),
    body('Height_in_inches')
      .isFloat({ min: 1, max: 120 })
      .withMessage('Height must be between 1 and 120 inches'),
    body('SexAtBirth')
      .isIn(allowedSexAtBirth)
      .withMessage(`SexAtBirth must be one of: ${allowedSexAtBirth.join(', ')}`),
    body('Insights')
      .optional()
      .isObject()
      .withMessage('Insights must be an object if provided')
  ],
  update: [
    body('Username')
      .optional()
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters'),
    body('Password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('fName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('First name must be under 50 characters'),
    body('Lname')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Last name must be under 50 characters'),
    body('Age')
      .optional()
      .isInt({ min: 1, max: 120 })
      .withMessage('Age must be a number between 1 and 120'),
    body('Bodyweight_in_pounds')
      .optional()
      .isFloat({ min: 1, max: 1000 })
      .withMessage('Body weight must be between 1 and 1000 pounds'),
    body('Height_in_inches')
      .optional()
      .isFloat({ min: 1, max: 120 })
      .withMessage('Height must be between 1 and 120 inches'),
    body('SexAtBirth')
      .optional()
      .isIn(allowedSexAtBirth)
      .withMessage(`SexAtBirth must be one of: ${allowedSexAtBirth.join(', ')}`),
    body('Insights')
      .optional()
      .isObject()
      .withMessage('Insights must be an object if provided'),
    body('Insights.Trends')
      .optional()
      .isArray()
      .withMessage('Insights.Trends must be an array if provided'),
    body('Insights.Comparisons')
      .optional()
      .isArray()
      .withMessage('Insights.Comparisons must be an array if provided')
  ]
};

const trainerValidation = {
  create: [
    body('User')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('User must be between 3 and 30 characters'),
    body('Password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('fName')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('First name is required and must be under 50 characters'),
    body('lname')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Last name is required and must be under 50 characters'),
    body('Players')
      .optional()
      .isArray()
      .withMessage('Players must be an array of IDs'),
    body('Players.*')
      .optional()
      .isMongoId()
      .withMessage('Each player ID must be a valid Mongo ID')
  ],
  update: [
    body('User')
      .optional()
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('User must be between 3 and 30 characters'),
    body('Password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('fName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('First name must be under 50 characters'),
    body('lname')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Last name must be under 50 characters'),
    body('Players')
      .optional()
      .isArray()
      .withMessage('Players must be an array of IDs'),
    body('Players.*')
      .optional()
      .isMongoId()
      .withMessage('Each player ID must be a valid Mongo ID')
  ]
};

const trendValidation = [
  body('Category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('Name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  body('State')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('isHigherBetter')
    .isBoolean()
    .withMessage('isHigherBetter must be a boolean'),
  body('valueRange')
    .isFloat()
    .withMessage('valueRange must be a number'),
  body('Unit')
    .trim()
    .notEmpty()
    .withMessage('Unit is required'),
  body('trendStartTime')
    .trim()
    .notEmpty()
    .withMessage('trendStartTime is required'),
  body('trendEndTime')
    .trim()
    .notEmpty()
    .withMessage('trendEndTime is required'),
  body('Data')
    .optional()
    .isArray()
    .withMessage('Data must be an array if provided'),
  body('Data.*.StartDateTime')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Each Data item must include StartDateTime'),
  body('Data.*.endDateTime')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Each Data item must include endDateTime'),
  body('Data.*.Value')
    .optional()
    .isFloat()
    .withMessage('Each Data item Value must be a number'),
  body('Data.*.percentChangeFromPrevious')
    .optional()
    .isFloat()
    .withMessage('Each Data item percentChangeFromPrevious must be a number')
];

const comparisonValidation = [
  body('Category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('Name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  body('Value')
    .trim()
    .notEmpty()
    .withMessage('Value is required'),
  body('Unit')
    .trim()
    .notEmpty()
    .withMessage('Unit is required'),
  body('isHigherBetter')
    .isBoolean()
    .withMessage('isHigherBetter must be a boolean'),
  body('startDateTime')
    .trim()
    .notEmpty()
    .withMessage('startDateTime is required'),
  body('endDateTime')
    .trim()
    .notEmpty()
    .withMessage('endDateTime is required'),
  body('Percentile')
    .isFloat()
    .withMessage('Percentile must be a number'),
  body('Difference')
    .trim()
    .notEmpty()
    .withMessage('Difference is required'),
  body('percentageDifference')
    .trim()
    .notEmpty()
    .withMessage('percentageDifference is required'),
  body('State')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('Properties')
    .optional()
    .isObject()
    .withMessage('Properties must be an object if provided'),
  body('Data')
    .optional()
    .isArray()
    .withMessage('Data must be an array if provided'),
  body('Data.*.Type')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Each Data item must include Type'),
  body('Data.*.Value')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Each Data item must include Value')
];

module.exports = {
  playerValidation,
  trainerValidation,
  trendValidation,
  comparisonValidation
};

