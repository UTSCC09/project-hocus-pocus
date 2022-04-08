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

    const existingLivestream = await Livestream.findOne({ code: args.code });
    if (!existingLivestream) {
      throw new Error("Livestream does not exists!");
    }

    if (existingLivestream.user !== req.email) {
      throw new Error("Only the user started the livestream can end it!");
    }

    const result = await Livestream.updateOne({ code: args.code }, { in_progress: false });
    return { success: result.acknowledged };
  },

  getLiveStreams: async (args, req) => {
    const livestreams = await Livestream.find({ in_progress: true });
    return livestreams;
  }
}