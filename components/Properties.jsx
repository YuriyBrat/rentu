'use client'
import React, { useState, useEffect } from 'react';
import PropertyCard from './PropertyCard';
import Spinner from './Spinner';
import Pagination from './Pagination';


const Properties = () => {
   const [properties, setProperties] = useState([]);
   const [loading, setLoading] = useState(true);
   const [page, setPage] = useState(1);
   const [pageSize, setPageSize] = useState(5);
   const [totalItems, setTotalItems] = useState(0);

   // const properties = await fetchProperties();

   const handlePageChange = newPage => {
      setPage(newPage)
   }



   useEffect(() => {

      const fetchProperties = async () => {
         try {
            const res = await fetch(`/api/properties?page=${page}&pageSize=${pageSize}`);

            if (!res.ok) {
               throw new Error('Failed to get properties')
            };

            const data = await res.json();
            const { properties } = data;
            // if (properties) {
            //    properties.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            // }
            setProperties(properties);
            setTotalItems(data.total)
         } catch (error) {
            console.log(error);
         } finally {
            setLoading(false)
         }
      };
      fetchProperties()
   }, [page, pageSize]);

   return loading ? (<Spinner />) : (
      <section className="px-4 py-6">
         <div className="container-xl lg:container m-auto">
            {
               properties.length === 0
                  ?
                  <p>No properties found</p>
                  : (
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {
                           properties.map(property => (
                              <PropertyCard key={property._id} property={property} />
                           ))
                        }
                     </div>
                  )
            }

            <Pagination page={page} pageSize={pageSize} totalItems={totalItems}
               onPageChange={handlePageChange}
            />
         </div>
      </section>
   )
}

export default Properties