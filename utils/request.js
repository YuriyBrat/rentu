const apiDomain = process.env.NEXT_PUBLIC_API_DOMAIN || null

async function fetchProperties({ showFeatured = false } = {}) {
   try {
      const res = await fetch(`${apiDomain}/properties${showFeatured ? '/featured' : ''}`, { cache: "no-store" });

      if (!apiDomain) {
         return [];
      }


      if (!res.ok) {
         throw new Error('Failed to fetch data')
      }

      return res.json();
   } catch (error) {
      console.log(error);
      return []
   }
};

// fetch single property
async function fetchProperty(id) {
   try {
      const res = await fetch(apiDomain + '/properties/' + id);
      if (!apiDomain) {
         return null;
      }


      if (!res.ok) {
         throw new Error('Failed to fetch data')
      }

      return res.json();
   } catch (error) {
      console.log(error);
      return null
   }
};

export { fetchProperties, fetchProperty }