import React from 'react';
import Image from 'next/image';
import { getSrcImage } from '@/hooks/image.hook';
import { Gallery, Item } from 'react-photoswipe-gallery';

const PropertyImages = ({ images }) => {

   return (
      <Gallery>
         <section className='bg-blue-50 p-4'>
            <div className="container mx-auto">
               {images.length === 1 ? (
                  <Item
                     original={getSrcImage(images[0])}
                     thumbnail={getSrcImage(images[0])}
                     width={1000}
                     height={600}
                  >
                     {({ ref, open }) => (
                        <Image
                           // src={images[0]}
                           ref={ref}
                           onClick={open}
                           src={getSrcImage(images[0])}
                           alt=''
                           className='object-cover h-[400px] mx-auto rounded-xl'
                           width={1800}
                           height={400}
                           priority={true}
                        />
                     )}
                  </Item>

               ) : (
                  <div className="grid grid-cols-2 gap-4">
                     {images.map((image, index) => (
                        <div key={index}
                           className={`${images.length % 2 !== 0 && index == images.length - 1 ? 'col-span-2' : 'col-span-1'}`}
                        >
                           <Item
                              original={getSrcImage(image)}
                              thumbnail={getSrcImage(image)}
                              width={1000}
                              height={600}
                           >
                              {({ ref, open }) => (
                                 <Image
                                    // src={image}
                                    ref={ref}
                                    onClick={open}
                                    src={getSrcImage(image)}
                                    alt=''
                                    className='object-cover h-[400px] w-full rounded-xl'
                                    width={0}
                                    height={0}
                                    sizes='100vw'
                                    priority={true}
                                 />
                              )}
                           </Item>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </section>
      </Gallery>
   )
}

export default PropertyImages