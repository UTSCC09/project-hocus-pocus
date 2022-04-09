const Record = require('../../models/record');
const Upvote = require('../../models/upvote');

module.exports = {
  upvoteRecord: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("Unauthenticated!");
    }

    const record = await Record.findById(args.recordId);
    if (!record) {
      throw new Error(`Record with ID ${recordId} does not exist!`);
    }

    const existingUpvote = await Upvote.findOne({ email: req.email, recordId: args.recordId });
    if (existingUpvote) {
      throw new Error('Already upvoted this record!');
    }

    const upvote = new Upvote({
      email: req.email,
      recordId: args.recordId
    });

    await upvote.save();
    const updateResult = await Record.updateOne({ _id: args.recordId }, { upvote: record.upvote + 1 });
    return { success: updateResult.acknowledged };
  },

  undoUpvoteRecord: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("Unauthenticated!");
    }

    const record = await Record.findById(args.recordId);
    if (!record) {
      throw new Error(`Record with ID ${recordId} does not exist!`);
    }

    const existingUpvote = await Upvote.findOne({ email: req.email, recordId: args.recordId });
    if (!existingUpvote) {
      throw new Error('You did not upvote this record!');
    }

    await Upvote.deleteOne({ email: req.email, recordId: args.recordId });
    const updateResult = await Record.updateOne({ _id: args.recordId }, { upvote: record.upvote - 1 });
    return { success: updateResult.acknowledged };
  },

  getUpvotesByUser: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("Unauthenticated!");
    }

    const upvotes = await Upvote.find({ email: req.email });
    return upvotes;
  }
}