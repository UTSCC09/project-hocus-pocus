const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../../models/user');

module.exports = {
  createUser: async (args) => {
    try {
      const existingUser = await User.findOne({ email: args.userInput.email });
      if (existingUser) {
        throw new Error('User exists already.');
      }

      const hashedPassword = await bcrypt.hash(args.userInput.password, 10);
      const user = new User({
        email: args.userInput.email,
        password: hashedPassword
      });

      // write to database
      const result = await user.save();
      return { ...result._doc, _id: result.id, password: null };
    } catch (err) {
      throw err;
    }
  },

  login: async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User does not exist!');
    }
    
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      throw new Error('Invalid credential!');
    }

    const token = jwt.sign({userId: user.id, email: user.email}, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });
    return { userId: user.id, token, tokenExpiration: 1 };
  },
}