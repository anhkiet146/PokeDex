import mongoose from 'mongoose';

const BuildSchema = new mongoose.Schema({
  pokemonId: {
    type: Number,
    required: true,
    index: true,
  },
  trainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainer',
    required: true,
  },
  trainerName: {
    type: String,
    required: true,
  },
  buildTitle: {
    type: String,
    required: [true, 'Vui lòng cung cấp tên hướng build'],
    trim: true,
  },
  moves: {
    type: [String],
    default: [],
  },
  item: {
    type: String,
    trim: true,
  },
  nature: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả hoặc hướng dẫn sử dụng'],
  },
  teamComps: {
    type: [Number], // Array of Pokémon IDs (e.g. [2, 3] for synergy team partners)
    default: [],
  }
}, {
  timestamps: true,
});

export default mongoose.models.Build || mongoose.model('Build', BuildSchema);
