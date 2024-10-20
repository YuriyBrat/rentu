import React from 'react'
import Image from 'next/image';
import { getSrcImage } from '@/hooks/image.hook';

const PropertyHeaderImage = ({ image, classText }) => {
   if(!classText) {
      classText = 'w-full object-cover h-[400px] '
   }
   return (
      // < !--Property Header Image-- >
      <section>
         <div className="container-xl m-auto">
            <div className="grid grid-cols-1">
               <Image
                  // src={`/images/properties/${image}`}
                  src={getSrcImage(image)}
                  alt=""
                  // className="object-cover h-[400px] w-full"
                  // className="w-full h-auto  rounded-t-xl"
                  className={classText}
                  width={0}
                  height={0}
                  sizes='100vw'
                  priority={true}
               />
            </div>
         </div>
      </section>
   )
}

export default PropertyHeaderImage