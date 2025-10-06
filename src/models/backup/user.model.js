const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const { toJSON, paginate } = require("./plugins");
const { roles } = require("../config/roles");

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email");
        }
      },
    },

    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error(
            "Password must contain at least one letter and one number"
          );
        }
      },
      private: true,
    },

    full_name: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    id_number: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    company_name: {
      type: String,
      trim: true,
    },

    onboarding_completed: {
      type: Boolean,
      default: false,
    },

    onboarding_completed_at: {
      type: Date,
    },

    user_type: {
      type: String,
      enum: [
        "individual",
        "business",
        "business_owner",
        "freelancer",
        "legal_professional",
        "other",
      ],
      default: "individual",
    },

    business_type: {
      type: String,
      trim: true,
    },

    industry: {
      type: String,
      trim: true,
    },

    company_size: {
      type: String,
      trim: true,
    },

    primary_use_case: {
      type: String,
      trim: true,
    },

    preferred_language: {
      type: String,
      trim: true,
      default: "en",
    },

    marketing_consent: {
      type: Boolean,
      default: false,
    },

    profile_completion_percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    contract_frequency: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

userSchema.plugin(toJSON);
userSchema.plugin(paginate);

userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

userSchema.methods.isPasswordMatch = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  if (this.isModified("cpassword")) {
    this.cpassword = await bcrypt.hash(this.cpassword, 8);
  }
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
