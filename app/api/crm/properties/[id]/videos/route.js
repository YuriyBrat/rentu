import connectDB from '@/config/database';
import Property from '@/models/Property';
import { canManageProperty } from '@/utils/crm/accessControl';
import { buildActivityDiff, logActivity } from '@/utils/crm/activityLog';
import { getSessionUser } from '@/utils/getSessionUser';

const VALID_PLATFORMS = ['youtube', 'tiktok', 'instagram', 'facebook', 'telegram', 'drive', 'other'];
const VALID_TYPES = ['main', 'short_review', 'storytelling', 'full_review', 'other'];
const VIDEO_FIELDS = ['platform', 'type', 'title', 'url', 'note', 'isMain', 'createdAt'];

function parseDate(value) {
   if (!value) return null;
   const date = new Date(value);
   return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeVideo(video) {
   if (!video) return null;
   const source = video.toObject ? video.toObject() : video;
   return {
      _id: source._id?.toString?.() || String(source._id || ''),
      platform: source.platform || 'other',
      type: source.type || 'main',
      title: source.title || '',
      url: source.url || '',
      note: source.note || '',
      isMain: !!source.isMain,
      createdAt: source.createdAt ? new Date(source.createdAt).toISOString() : null,
   };
}

function propertyTitle(property) {
   return property.title || property.location_text || 'Об’єкт';
}

async function requireEditableProperty(sessionUser, property) {
   const allowed = await canManageProperty(sessionUser, property);
   if (!allowed) {
      return new Response('Недостатньо прав для зміни відео цього об’єкта', { status: 403 });
   }
   return null;
}

function setMainVideo(property, videoId) {
   property.propertyVideos.forEach((video) => {
      video.isMain = String(video._id) === String(videoId);
   });
}

export const POST = async (req, { params }) => {
   try {
      await connectDB();

      const body = await req.json();
      const sessionUser = await getSessionUser();
      const property = await Property.findById(params.id);
      if (!property) return new Response('Property Not Found', { status: 404 });

      const deniedResponse = await requireEditableProperty(sessionUser, property);
      if (deniedResponse) return deniedResponse;

      const createdAt = parseDate(body.createdAt) || new Date();
      const shouldBeMain = !!body.isMain || !property.propertyVideos?.length;

      property.propertyVideos.unshift({
         platform: VALID_PLATFORMS.includes(body.platform) ? body.platform : 'other',
         type: VALID_TYPES.includes(body.type) ? body.type : 'main',
         title: body.title || '',
         url: body.url || '',
         note: body.note || '',
         isMain: false,
         createdByEmployee: sessionUser?.employeeId || null,
         createdAt,
      });

      if (shouldBeMain) setMainVideo(property, property.propertyVideos[0]._id);

      await property.save();
      const video = normalizeVideo(property.propertyVideos[0]);

      await logActivity({
         entityType: 'property',
         entityId: property._id,
         action: 'created',
         source: 'manual',
         title: propertyTitle(property),
         message: 'Додано відео об’єкта',
         after: video,
         meta: {
            pageName: 'Об’єкти',
            pagePath: '/crm/objects3',
            targetEntityType: 'property',
            propertyVideoId: video?._id || '',
         },
         sessionUser,
      });

      return Response.json({ ok: true, item: video });
   } catch (error) {
      console.log(error);
      return new Response('Smth wrong', { status: 500 });
   }
};

export const PATCH = async (req, { params }) => {
   try {
      await connectDB();

      const body = await req.json();
      const sessionUser = await getSessionUser();
      const videoId = String(body.videoId || body._id || '').trim();
      const property = await Property.findById(params.id);
      if (!property) return new Response('Property Not Found', { status: 404 });

      const deniedResponse = await requireEditableProperty(sessionUser, property);
      if (deniedResponse) return deniedResponse;

      const video = property.propertyVideos.id(videoId);
      if (!video) return new Response('Video not found', { status: 404 });

      const before = normalizeVideo(video);
      const createdAt = parseDate(body.createdAt);

      video.platform = VALID_PLATFORMS.includes(body.platform) ? body.platform : video.platform || 'other';
      video.type = VALID_TYPES.includes(body.type) ? body.type : video.type || 'main';
      video.title = body.title || '';
      video.url = body.url || '';
      video.note = body.note || '';
      if (createdAt) video.createdAt = createdAt;
      video.isMain = !!body.isMain;

      if (video.isMain) setMainVideo(property, video._id);
      if (!property.propertyVideos.some((item) => item.isMain) && property.propertyVideos.length) {
         property.propertyVideos[0].isMain = true;
      }

      await property.save();

      const after = normalizeVideo(video);
      const diff = buildActivityDiff(before, after, VIDEO_FIELDS);

      await logActivity({
         entityType: 'property',
         entityId: property._id,
         action: 'updated',
         source: 'manual',
         title: propertyTitle(property),
         message: 'Оновлено відео об’єкта',
         before,
         after,
         diff,
         meta: {
            pageName: 'Об’єкти',
            pagePath: '/crm/objects3',
            targetEntityType: 'property',
            propertyVideoId: videoId,
         },
         sessionUser,
      });

      return Response.json({ ok: true, item: after });
   } catch (error) {
      console.log(error);
      return new Response('Smth wrong', { status: 500 });
   }
};

export const DELETE = async (req, { params }) => {
   try {
      await connectDB();

      const body = await req.json().catch(() => ({}));
      const sessionUser = await getSessionUser();
      const videoId = String(body.videoId || body._id || '').trim();
      const property = await Property.findById(params.id);
      if (!property) return new Response('Property Not Found', { status: 404 });

      const deniedResponse = await requireEditableProperty(sessionUser, property);
      if (deniedResponse) return deniedResponse;

      const video = property.propertyVideos.id(videoId);
      if (!video) return new Response('Video not found', { status: 404 });

      const before = normalizeVideo(video);
      const wasMain = !!video.isMain;
      video.deleteOne();

      if (wasMain && property.propertyVideos.length) {
         property.propertyVideos[0].isMain = true;
      }

      await property.save();

      await logActivity({
         entityType: 'property',
         entityId: property._id,
         action: 'deleted',
         source: 'manual',
         title: propertyTitle(property),
         message: 'Видалено відео об’єкта',
         before,
         meta: {
            pageName: 'Об’єкти',
            pagePath: '/crm/objects3',
            targetEntityType: 'property',
            propertyVideoId: videoId,
         },
         sessionUser,
      });

      return Response.json({ ok: true });
   } catch (error) {
      console.log(error);
      return new Response('Smth wrong', { status: 500 });
   }
};
