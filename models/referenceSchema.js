const { Schema, model } = require("mongoose");


const ReferenceSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reference: { type: String, required: true, unique: true },
    active: { type: Boolean, default: true }
}, {timestamps: true});

const ReferenceModel = model('Reference', ReferenceSchema);
module.exports = ReferenceModel;