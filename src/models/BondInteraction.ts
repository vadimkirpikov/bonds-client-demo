import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBondInteraction extends Document {
    bondId: string;
    userId: string;
    type: 'LIKE' | 'DISLIKE' | 'FAVORITE';
    createdAt: Date;
}

const BondInteractionSchema: Schema = new Schema({
    bondId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    type: { type: String, enum: ['LIKE', 'DISLIKE', 'FAVORITE'], required: true },
}, {
    timestamps: true,
});


const BondInteraction: Model<IBondInteraction> = mongoose.models.BondInteraction || mongoose.model<IBondInteraction>('BondInteraction', BondInteractionSchema);

export default BondInteraction;