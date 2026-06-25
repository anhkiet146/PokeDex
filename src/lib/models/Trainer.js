import mongoose from 'mongoose';

const TrainerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Vui lòng cung cấp tên đăng nhập'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Vui lòng cung cấp mật khẩu'],
  },
  displayName: {
    type: String,
    default: function() {
      return this.username;
    }
  },
  avatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60', // Modern abstract gradient avatar
  },
  dob: {
    type: Date,
  },
  ownedPokemon: {
    type: [Number], // Array of PokéAPI Pokemon IDs
    default: [],
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  }
}, {
  timestamps: true,
});

export default mongoose.models.Trainer || mongoose.model('Trainer', TrainerSchema);
