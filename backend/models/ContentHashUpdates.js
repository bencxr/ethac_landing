import mongoose from 'mongoose';

const ContentHashUpdatesSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true, index: true },
    resolverID: { type: String, required: true },
    domain: { type: String, required: true },
    blockNumber: { type: Number, required: true, index: true },
    transactionID: { type: String, required: true },
    hashHex: { type: String, required: true },
    hashString: { type: String, required: true },
    blockTimestamp: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now }
});

ContentHashUpdatesSchema.set('toJSON', {
    transform: function (doc, ret) {
        return {
            id: ret.id,
            resolverID: ret.resolverID,
            domain: ret.domain,
            blockNumber: ret.blockNumber,
            transactionID: ret.transactionID,
            hashHex: ret.hashHex,
            hashString: ret.hashString,
            blockTimestamp: ret.blockTimestamp,
            createdAt: ret.createdAt
        };
    }
});

export default mongoose.model('ContentHashUpdate', ContentHashUpdatesSchema);