const Livestream = require('../../models/livestream');

module.exports = {
  startLiveStream: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("Unauthenticated!");
    }

    // End previous in progress livestream(s)
    await Livestream.updateMany({ user: req.email, in_progress: true }, { in_progress: false });

    const livestream = new Livestream({
      user: req.email,
      code: args.code,
      in_progress: true
    });

    const result = await livestream.save();
    return { ...result._doc };
  },

  endLiveStream: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("Unauthenticated!");
    }

    const result = await Livestream.updateMany({ user: req.email, in_progress: true }, { in_progress: false });
    return { success: result.acknowledged };
  },

  getLiveStreams: async (args, req) => {
    const livestreams = await Livestream.find({ in_progress: true });
    return livestreams;
  },

  getLiveByUser: async (args, req) => {
    const livestream = await Livestream.findOne({ user: args.user, in_progress: true });
    return livestream;
  }
}