const mongoose = require("mongoose");
const slugify = require("slugify");
const collectionSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a title"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
      trim: true,
    },

    linkCollection: [
      {
        header: {
          type: String,
          required: [true, "Please provide a header"],
          trim: true,
        },
        comtact: {
          type: String,
          trim: true,
        },

        image: {
          type: String,
          trim: true,
        },
        links: [
          {
            title: {
              type: String,
              required: [true, "Please provide a title"],
              trim: true,
            },
            url: {
              type: String,
              required: [true, "Please provide a url"],
              trim: true,
            },
          },
        ],
      },
    ],

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a user"],
    },

    active: {
      type: Boolean,
      default: true,
    },

    slug: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

collectionSchema.pre("save", function (next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

const Collections = mongoose.model("Collection", collectionSchema);

module.exports = Collections;
