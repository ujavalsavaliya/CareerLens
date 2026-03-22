import mongoose from 'mongoose';

const companyHolidaySchema = new mongoose.Schema({
  date: {
    type: String, // YYYY-MM-DD format
    required: true
    // NOTE: removed unique:true — uniqueness is now enforced per-tenant (careerLensUserId + date)
  },
  description: {
    type: String,
    required: true
  },
  careerLensUserId: {
    type: String,
    default: null  // null = system-level holiday (backward compat); set to tenant ID for scoped holidays
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  createdByName: {
    type: String,
    required: false
  },
  createdByRole: {
    type: String,
    enum: ['Admin', 'HR', 'Employee'],
    required: false
  }
}, {
  timestamps: true
});

// Compound unique index: same date is allowed for different tenants
companyHolidaySchema.index({ date: 1, careerLensUserId: 1 }, { unique: true });

const CompanyHoliday = mongoose.model('CompanyHoliday', companyHolidaySchema);

// Drop the old single-field unique index on `date` if it still exists in MongoDB.
// We need the compound index instead.
CompanyHoliday.collection.getIndexes().then(indexes => {
  if (indexes['date_1']) {
    CompanyHoliday.collection.dropIndex('date_1')
      .then(() => console.log('✅ Dropped legacy unique index: date_1'))
      .catch(() => {}); // Silently ignore if already dropped
  }
}).catch(() => {});

export default CompanyHoliday;




