'use client'
import { useRouter, useParams, useSearchParams, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { fetchProperty } from '@/utils/request'
import PropertyHeaderImage from '@/components/PropertyHeaderImage'
import Link from 'next/link'
import BookmarkButton from '@/components/BookmarkButton';
import ShareButtons from '@/components/ShareButtons';
import PropertyContactForm from '@/components/PropertyContactForm';
import PropertyDetails from '@/components/PropertyDetails';
import PropertyImages from '@/components/PropertyImages'
import Spinner from '@/components/Spinner'
import { FaArrowLeft } from 'react-icons/fa'

const PropertyPage = () => {
   // const router = useRouter();
   const { id } = useParams();
   // const searchParams = useSearchParams();
   // const pathname = usePathname();
   // const name = searchParams.get('name')

   const [property, setProperty] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchPropertyData = async () => {
         if (!id) return;
         try {
            const property = await fetchProperty(id);
            setProperty(property);
         } catch (error) {
            console.error('Error fetching property:', error)
         } finally {
            setLoading(false);
         }
      };

      if (property === null) {
         fetchPropertyData();
      }

   }, [id, property])

   if (!property && !loading) {
      return (
         <h1 className="text-center text-2xl font-bold mt-10">Property Not Found</h1>
      )
   }

   return (
      <>
         {loading && <Spinner loading={loading} />}
         {!loading && property && (<>
            <PropertyHeaderImage image={property.images[0]} />

            {/* <!-- Go Back --> */}
            <section>
               <div className="container m-auto py-6 px-6">
                  <Link
                     href="/properties"
                     className={'text-blue-500 hover:text-blue-600 flex items-center'}
                  >
                     {/* <i className="fas fa-arrow-left mr-2"></i>  */}
                     <FaArrowLeft className='mr-2' />
                     Back to Properties
                  </Link>
               </div>
            </section>


            {/* <!-- Property Info --> */}
            <section className="bg-blue-50">
               <div className="container m-auto py-10 px-6">
                  <div className={"grid grid-cols-1 md:grid-cols-70/30 w-full gap-6"}>

                     <PropertyDetails property={property} />
                     {/* <!-- Sidebar --> */}
                     <aside className="space-y-4">
                        <BookmarkButton property={property} />
                        <ShareButtons property={property} />
                        <PropertyContactForm property={property} />
                     </aside>
                  </div>
               </div>
            </section>

            <PropertyImages images={property.images} />

         </>)}
      </>
   )
}

export default PropertyPage