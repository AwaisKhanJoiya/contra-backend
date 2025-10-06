const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const contractReviewSchema = mongoose.Schema(
  {
    // Association
    contract_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contract",
      required: true,
    },
    contract_version: {
      type: Number,
      required: true,
      default: 1,
    },
    review_version: {
      type: Number,
      required: true,
      default: 1,
    },

    // Review status and metadata
    review_status: {
      type: String,
      default: "pending",
      enum: ["pending", "completed", "failed", "cached"],
    },
    overall_score: {
      type: Number,
      min: 0,
      max: 100,
    },
    review_summary: {
      type: String,
    },

    // Categorized review results
    completeness_issues: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    structure_issues: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    language_issues: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    compliance_issues: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    // Recommendations and improvements
    priority_recommendations: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    optional_improvements: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    missing_required_fields: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    // Contract readiness assessment
    contract_readiness: {
      type: String,
      default: "pending",
      enum: [
        "ready",
        "needs_minor_fixes",
        "needs_major_fixes",
        "not_ready",
        "pending",
      ],
    },
    estimated_fix_time: {
      type: String,
    },

    // Quality metrics (0-100 scores)
    completeness_score: {
      type: Number,
      min: 0,
      max: 100,
    },
    structure_score: {
      type: Number,
      min: 0,
      max: 100,
    },
    language_score: {
      type: Number,
      min: 0,
      max: 100,
    },
    compliance_score: {
      type: Number,
      min: 0,
      max: 100,
    },

    // Technical metadata
    llm_model_used: {
      type: String,
    },
    review_time_ms: {
      type: Number,
    },
    contract_content_hash: {
      type: String,
      maxlength: 64,
    },
    form_data_hash: {
      type: String,
      maxlength: 64,
    },

    // Additional timestamps
    completed_at: {
      type: Date,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// Add compound index for unique contract review versions
contractReviewSchema.index(
  { contract_id: 1, contract_version: 1, review_version: 1 },
  { unique: true }
);

// Add other indexes for performance
contractReviewSchema.index({ contract_id: 1 });
contractReviewSchema.index({ review_status: 1 });
contractReviewSchema.index({ contract_readiness: 1 });
contractReviewSchema.index({ overall_score: 1 });
contractReviewSchema.index({ contract_content_hash: 1 });
contractReviewSchema.index({ created_at: 1 });

// Create compound index for finding latest review
contractReviewSchema.index({
  contract_id: 1,
  contract_version: 1,
  review_version: -1,
});

// Add plugins
contractReviewSchema.plugin(toJSON);
contractReviewSchema.plugin(paginate);

// Pre-save middleware to set completed_at when review is completed
contractReviewSchema.pre("save", function (next) {
  if (
    this.isModified("review_status") &&
    this.review_status === "completed" &&
    !this.completed_at
  ) {
    this.completed_at = new Date();
  }
  next();
});

/**
 * @typedef ContractReview
 */
const ContractReview = mongoose.model("ContractReview", contractReviewSchema);

module.exports = ContractReview;
