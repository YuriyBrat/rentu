
function getSrcImage(image) {
   // console.log(image);

   let srcImage = null;
   if (image) {
      if (image.toString().includes('cloudinary')) {
         srcImage = image
      } else {
         srcImage = `/images/properties/${image}`
      }
   }
   // console.log(srcImage);

   return srcImage
}

module.exports = {
   getSrcImage
}