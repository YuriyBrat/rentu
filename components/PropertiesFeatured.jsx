import React from 'react'
import { fetchProperties } from '@/utils/request'
import PropertyCardFeatured from './PropertyCardFeatured';

const PropertiesFeatured = async () => {
   let { properties } = await fetchProperties({ showFeatured: true });

   if (!properties) {
      properties = [];
   }

   return properties.length > 0 && (
      <section className="bg-blue-50 px-4 pt-6 pb-10">
         <div className="container-xl lg:container m-auto">
            <h2 className="text-3xl font-bold text-blue-500 mb-6 text-center">
               Featured Properties
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {properties.map(pr => (
                  <PropertyCardFeatured key={pr._id} property={pr} />
               ))}

            </div>
         </div>
      </section>
   )
}

export default PropertiesFeatured