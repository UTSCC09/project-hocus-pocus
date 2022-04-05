const Record = require('../../models/record');

const publishOrUnpublish = async (publish, args, req) => {
  try {
    if (!req.isAuth) {
      throw new Error("Unauthenticated!");
    }

    const recordId = args.recordId;
    const record = await Record.findById(recordId);
    if (!record) {
      throw new Error(`Record with ID ${recordId} does not exist!`);
    } else if (record.author !== req.email) {
      throw new Error(`Only author can ${publish ? 'publish' : 'unpublish'} it!`);
    }

    const result = await Record.updateOne({ _id: recordId }, { published: publish });
    return result.acknowledged;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  createRecord: async (args, req) => {
    try {
      if (!req.isAuth) {
        throw new Error("Unauthenticated!");
      }

      const regex = /^[A-G][b]?[0-9]$/;
      const record = args.record;

      let result = record.map((note) => regex.test(note.sound.note));
      if (result.includes(false)) {
        throw new Error("The note of record is invalid!");
      }

      result = record.map((note) => ["start", "end"].indexOf(note.action) !== -1);
      if (result.includes(false)) {
        throw new Error("Action must be either 'start' or 'end'");
      }

      const musicScore = new Record({
        author: req.email,
        record,
        published: false
      });

      // write to database
      const writeResult = await musicScore.save();
      return { ...writeResult._doc, _id: writeResult.id };

    } catch (err) {
      throw err;
    }
  },

  publishRecord: async (args, req) => {
    try {
      return publishOrUnpublish(true, args, req);
    } catch (err) {
      throw err;
    }
  },

  unpublishRecord: async (args, req) => {
    try {
      return publishOrUnpublish(false, args, req);
    } catch (err) {
      throw err;
    }
  },

  getRecordsByAuthor: async (args, req) => {
    try {
      if (!req.isAuth) {
        throw new Error("Unauthenticated!");
      }

      const records = await Record.find({ author: req.email });
      return records;
    } catch (err) {
      throw err;
    }
  },

  getPublishedRecordsByPage: async (args, req) => {
    try {
      if (!req.isAuth) {
        throw new Error("Unauthenticated!");
      }

      if (args.page < 1) {
        throw new Error("Invalid page number!");
      }

      const records = await Record.find({ published: true }).sort({ _id: 1 });
      let endIndex = Math.min(records.length, 10 * args.page);
      return records.slice(10 * (args.page - 1), endIndex) || [];
    } catch (err) {
      throw err;
    }
  }
}