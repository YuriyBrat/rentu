import { getServerSession } from 'next-auth';
import connectDB from '@/config/database';
import cloudinary from '@/config/cloudinary';
import Employee from '@/models/Employee';
import { authOptions } from '@/utils/authOptions';

const MAX_FILES = 8;
const MAX_FILE_SIZE = 15 * 1024 * 1024;

function canManageEmployees(user) {
   return !!user && (user.isFallbackAdmin || user.role === 'owner');
}

function cleanObjectId(value) {
   const v = String(value || '').trim();
   return /^[a-f\d]{24}$/i.test(v) ? v : null;
}

async function uploadFile(file, employeeId, kind) {
   const bytes = Buffer.from(await file.arrayBuffer());
   const mime = file.type || 'image/jpeg';
   const base64 = bytes.toString('base64');

   const result = await cloudinary.uploader.upload(`data:${mime};base64,${base64}`, {
      folder: `crm/personnel/${employeeId}/photos`,
      resource_type: 'image',
   });

   return {
      url: result.secure_url,
      publicId: result.public_id,
      kind,
      caption: '',
      showInPortfolio: true,
      isPrimary: false,
      isHidden: false,
      uploadedAt: new Date(),
   };
}

function cleanPhoto(photo) {
   const url = String(photo?.url || '').trim();
   if (!url) return null;

   return {
      url,
      publicId: String(photo?.publicId || photo?.public_id || '').trim(),
      kind: photo?.kind === 'live' ? 'live' : 'photo',
      caption: String(photo?.caption || '').trim(),
      showInPortfolio: photo?.showInPortfolio !== false,
      isPrimary: !!photo?.isPrimary,
      isHidden: !!photo?.isHidden,
      uploadedAt: photo?.uploadedAt ? new Date(photo.uploadedAt) : new Date(),
   };
}

function normalizePhotos(photos) {
   const cleaned = Array.isArray(photos) ? photos.map(cleanPhoto).filter(Boolean) : [];
   const primaryIndex = cleaned.findIndex((photo) => photo.isPrimary && !photo.isHidden);
   const fallbackIndex = cleaned.findIndex((photo) => !photo.isHidden);
   const finalPrimaryIndex = primaryIndex >= 0 ? primaryIndex : fallbackIndex;

   return cleaned.map((photo, idx) => ({
      ...photo,
      isPrimary: idx === finalPrimaryIndex,
   }));
}

export const POST = async (request) => {
   try {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
         return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }

      if (!canManageEmployees(session.user)) {
         return Response.json({ error: 'Only owner can manage personnel photos' }, { status: 403 });
      }

      await connectDB();

      const formData = await request.formData();
      const employeeId = cleanObjectId(formData.get('employeeId'));
      const kind = formData.get('kind') === 'live' ? 'live' : 'photo';

      if (!employeeId) {
         return Response.json({ error: 'employeeId required' }, { status: 400 });
      }

      const employee = await Employee.findById(employeeId).select('photos livePhoto avatarUrl avatarPublicId').lean();
      if (!employee) {
         return Response.json({ error: 'employee not found' }, { status: 404 });
      }

      const files = formData
         .getAll('files')
         .filter((file) => file && file.name && file.size > 0)
         .slice(0, MAX_FILES);

      if (!files.length) {
         return Response.json({ error: 'files required' }, { status: 400 });
      }

      for (const file of files) {
         if (!String(file.type || '').startsWith('image/')) {
            return Response.json({ error: 'Only image files are allowed' }, { status: 400 });
         }

         if (file.size > MAX_FILE_SIZE) {
            return Response.json({ error: 'File is too large' }, { status: 400 });
         }
      }

      const uploaded = [];
      for (const file of files) {
         uploaded.push(await uploadFile(file, employeeId, kind));
      }

      if (kind === 'live') {
         const updated = await Employee.findByIdAndUpdate(
            employeeId,
            {
               $set: {
                  livePhoto: uploaded[0],
                  avatarUrl: employee.avatarUrl || uploaded[0]?.url || '',
                  avatarPublicId: employee.avatarPublicId || uploaded[0]?.publicId || '',
               },
            },
            { new: true, runValidators: false }
         ).select('-passwordHash').lean();

         return Response.json({ photos: uploaded, item: updated }, { status: 201 });
      } else {
         const existingPhotos = Array.isArray(employee.photos) ? employee.photos : [];
         if (!existingPhotos.some((photo) => photo.isPrimary)) {
            uploaded[0].isPrimary = true;
         }

         const photos = normalizePhotos([...existingPhotos, ...uploaded]);

         const primaryPhoto = photos.find((photo) => photo.isPrimary) || uploaded[0];
         const update = { photos };
         if (primaryPhoto?.url) {
            update.avatarUrl = primaryPhoto.url;
            update.avatarPublicId = primaryPhoto.publicId;
         }

         const updated = await Employee.findByIdAndUpdate(
            employeeId,
            { $set: update },
            { new: true, runValidators: false }
         ).select('-passwordHash').lean();

         return Response.json({ photos: uploaded, item: updated }, { status: 201 });
      }
   } catch (error) {
      console.error(error);
      return new Response('Error uploading employee photos', { status: 500 });
   }
};

export const PUT = async (request) => {
   try {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
         return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }

      if (!canManageEmployees(session.user)) {
         return Response.json({ error: 'Only owner can manage personnel photos' }, { status: 403 });
      }

      await connectDB();

      const body = await request.json();
      const employeeId = cleanObjectId(body?.employeeId);

      if (!employeeId) {
         return Response.json({ error: 'employeeId required' }, { status: 400 });
      }

      const employee = await Employee.findById(employeeId).select('photos livePhoto avatarUrl avatarPublicId').lean();
      if (!employee) {
         return Response.json({ error: 'employee not found' }, { status: 404 });
      }

      const deletePublicIds = Array.isArray(body?.deletePublicIds)
         ? body.deletePublicIds.map((x) => String(x || '').trim()).filter(Boolean)
         : [];

      const update = {
         photos: normalizePhotos(body?.photos || []),
      };

      if (body?.livePhoto) {
         update.livePhoto = cleanPhoto({ ...body.livePhoto, kind: 'live' });
      } else if (body?.livePhoto === null) {
         update.$unsetLivePhoto = true;
      }

      const primaryPhoto = update.photos.find((photo) => photo.isPrimary && !photo.isHidden);
      if (primaryPhoto?.url) {
         update.avatarUrl = primaryPhoto.url;
         update.avatarPublicId = primaryPhoto.publicId;
      } else {
         const nextLivePhoto = update.$unsetLivePhoto ? null : (update.livePhoto || employee.livePhoto);
         update.avatarUrl = nextLivePhoto?.url || '';
         update.avatarPublicId = nextLivePhoto?.publicId || '';
      }

      const mongoUpdate = {
         $set: Object.fromEntries(Object.entries(update).filter(([key]) => key !== '$unsetLivePhoto')),
      };

      if (update.$unsetLivePhoto) {
         mongoUpdate.$unset = { livePhoto: '' };
      }

      const updated = await Employee.findByIdAndUpdate(
         employeeId,
         mongoUpdate,
         { new: true, runValidators: false }
      ).select('-passwordHash').lean();

      for (const publicId of deletePublicIds) {
         await cloudinary.uploader.destroy(publicId);
      }

      return Response.json({ item: updated }, { status: 200 });
   } catch (error) {
      console.error(error);
      return new Response('Error updating employee photos', { status: 500 });
   }
};
