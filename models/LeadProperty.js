import { Schema, model, models } from "mongoose";

const LeadPropertySchema = new Schema({
   type_estate: {
      type: String,
      // required: [true, 'Leadname is required']
   },

   // owner: {
   //    type: Schema.Types.ObjectId,
   //    ref: 'User',
   //    required: true,
   // },
   location: {
      city: String,
      street: String,
      number: String
   },
   rooms: Number,
   square_tot: Number,
   square_liv: Number,
   square_kit: Number,
   square_area: Number,
   square_use: Number,

   area_unit: String,

   floor: Number,
   floors: Number,

   type_building: String,
   type_walls: String,
   balconies: Number,

   height_wall: Number,
   height_unit: String,

   type_using: String,
   type_commerce: String,

   type_house: String,
   purpose_area: String,

   cost: Number,
   currency: String,

   description: String,

   // amenities: [
   //    {
   //       type: String,
   //    },
   // ],

},
   {
      timestamps: true,
   })

const LeadProperty = models.LeadProperty || model('LeadProperty', LeadPropertySchema)

export default LeadProperty