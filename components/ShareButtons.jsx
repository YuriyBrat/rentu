import React from 'react'
// import { FaShare } from 'react-icons/fa'
import {
   FacebookShareButton,
   TelegramShareButton,
   WhatsappShareButton,
   EmailShareButton,
   FacebookIcon,
   TelegramIcon,
   WhatsappIcon,
   EmailIcon
} from "react-share";

const ShareButtons = ({ property }) => {
   const shareUrl = `${process.env.NEXT_PUBLIC_DOMAIN}/properties/${property._id}`;


   return (
      // <button
      //    className={"bg-orange-500 hover:bg-orange-600 text-white font-bold w-full py-2 px-4 rounded-full flex items-center justify-center"}
      // >
      //    {/* <i className="fas fa-share mr-2"></i> */}
      //    {/* <FaShare className='mr-2' />   */}
      //    Share Property
      // </button>
      <>
         <h3 className="text-xl font-bold text-center pt-2">Share This Property:</h3>
         <div className="flex gap-3 justify-center pb-5">
            <FacebookShareButton
               url={shareUrl}
               quote={property.name}
               hashtag={`#${property.type}ForRent`} //.replace(/\s/g, '')
            >
               <FacebookIcon size={40} round={true} />
            </FacebookShareButton>
            <TelegramShareButton
               url={shareUrl}
               title={property.name}
               hashtag={`#${property.type}ForRent`}
            >
               <TelegramIcon size={40} round={true} />
            </TelegramShareButton>
            <WhatsappShareButton
               url={shareUrl}
               title={property.name}
               // hashtag={`#${property.type}ForRent`}
               separator=':: '
            >
               <WhatsappIcon size={40} round={true} />
            </WhatsappShareButton>
            <EmailShareButton
               url={shareUrl}
               subject={property.name}
               body={`Check out this property listing: ${shareUrl}`}
            >
               <EmailIcon size={40} round={true} />
            </EmailShareButton>
         </div>
      </>
   )
}

export default ShareButtons