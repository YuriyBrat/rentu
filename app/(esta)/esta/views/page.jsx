'use client'
import { useState, useEffect } from 'react';
// import PropertyCard from './PropertyCard';
import Spinner from '@/components/Spinner';
// import Pagination from './Pagination';


const ViewsProp = () => {
   const [leadprops, setLeadprops] = useState([]);
   const [loading, setLoading] = useState(false);
   const [page, setPage] = useState(1);
   const [pageSize, setPageSize] = useState(5);
   const [totalItems, setTotalItems] = useState(0);


   // const handlePageChange = newPage => {
   //    setPage(newPage)
   // }



   useEffect(() => {

      const fetchLeadProps = async () => {
         try {
            // const res = await fetch(`/api/rcs/leadprop?page=${page}&pageSize=${pageSize}`);
            const res = await fetch(`/api/rcs/leadprop`);

            if (!res.ok) {
               throw new Error('Failed to get properties')
            };

            const data = await res.json();
            const { leadprops, total } = data;
            if (leadprops) {
               leadprops.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            }
            setLeadprops(leadprops);
            setTotalItems(total)
         } catch (error) {
            console.log(error);
         } finally {
            setLoading(false)
         }
      };
      fetchLeadProps()

   }, [page, pageSize]);


   return loading ? (<Spinner />) : (
      <>
         <div>Total is {totalItems}</div>
         {
            leadprops.map(prop => (
               <div key={prop._id} >{prop.location.city}</div>
            ))
         }
      </>
      // <section className="px-4 py-6">
      //    <div className="container-xl lg:container m-auto">
      //       {
      //          properties.length === 0
      //             ?
      //             <p>No properties found</p>
      //             : (
      //                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      //                   {
      //                      properties.map(property => (
      //                         <PropertyCard key={property._id} property={property} />
      //                      ))
      //                   }
      //                </div>
      //             )
      //       }

      //       <Pagination page={page} pageSize={pageSize} totalItems={totalItems}
      //          onPageChange={handlePageChange}
      //       />
      //    </div>
      // </section>
   )
}

export default ViewsProp