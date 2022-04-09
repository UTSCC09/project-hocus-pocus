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
      const { record, title } = args;

      let result = record.map((note) => regex.test(note.sound.note));
      if (result.includes(false)) {
        throw new Error("The note of record is invalid!");
      }

      result = record.map((note) => ["start", "end"].indexOf(note.action) !== -1);
      if (result.includes(false)) {
        // if (record.any(record => !["start", "end"].includes(record.action))) { // TODO: Consider use this instead & test this
        throw new Error("Action must be either 'start' or 'end'");
      }

      const existingRecord = await Record.findOne({ title, author: req.email });
      if (existingRecord) {
        // Modify existing record
        const result = await Record.findOneAndUpdate({ title, author: req.email }, { record });
        return result;
      } else {
        // Create new
        const musicScore = new Record({
          title,
          author: req.email,
          record,
          published: false,
          upvote: 0,
          date: Date.now()
        });
  
        // write to database
        const writeResult = await musicScore.save();
        return { ...writeResult._doc, _id: writeResult.id };
      }

    } catch (err) {
      throw err;
    }
  },

  publishRecord: async (args, req) => {
    try {
      return { success: publishOrUnpublish(true, args, req) };
    } catch (err) {
      throw err;
    }
  },

  unpublishRecord: async (args, req) => {
    try {
      return { success: publishOrUnpublish(false, args, req) };
    } catch (err) {
      throw err;
    }
  },

  deleteRecord: async (args, req) => {
    try {
      if (!req.isAuth) {
        throw new Error("Unauthenticated!");
      }

      const recordId = args.recordId;
      const record = await Record.findById(recordId);
      if (!record) {
        throw new Error(`Record with ID ${recordId} does not exist!`);
      } else if (record.author !== req.email) {
        throw new Error("Only author can delete it!");
      }

      const result = await Record.deleteOne({ _id: recordId });
      return { success: (result.deletedCount === 1 ? true : false) };
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

  getRecordById: async (args, req) => {
    const record = await Record.findOne({ _id: args.recordId });
    return { ...record._doc, _id: record.id };
  },

  getPublishedRecordsByPage: async (args, req) => {
    try {
      if (args.page < 1) {
        throw new Error("Invalid page number!");
      }

      const records = await Record.find({ published: true }).sort({ _id: 1 });
      let endIndex = Math.min(records.length, 8 * args.page);
      return records.slice(8 * (args.page - 1), endIndex) || [];
    } catch (err) {
      throw err;
    }
  }
}
