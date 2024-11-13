import { Schema, model, models } from "mongoose";

const LeadSchema = new Schema({
   leadname: {
      type: String,
      required: [true, 'Leadname is required']
   },
   phone: {
      type: String,
      unique: [true, 'Phone already exist'],
      required: [true, 'Phone is required']
   },
   email: {
      type: String,
      unique: [true, 'Email already exist'],
      required: [true, 'Email is required']
   },
   ip: {
      type: String,
      // unique: [true, 'Email already exist'],
      // required: [true, 'Email is required']
   },

   // bookmarks: [
   //    {
   //       type: Schema.Types.ObjectId,
   //       ref: 'Property'
   //    }
   // ]
}, {
   timestamps: true
})

const Lead = models.Lead || model('Lead', LeadSchema)

export default Lead