import connectDB from '@/config/database';
import Property from '@/models/Property';
import { getSessionUser } from '@/utils/getSessionUser';
import { buildActivityDiff, logActivity } from '@/utils/crm/activityLog';
// POST /api/crm/properties/:id/add-note

const VALID_TYPES = ['note', 'call', 'message', 'meeting'];
const VALID_TONES = ['positive', 'negative', 'info', 'important'];
const WORK_HISTORY_FIELDS = ['type', 'tone', 'text', 'createdAt'];

function parseDate(value) {
   if (!value) return null;
   const d = new Date(value);
   return Number.isNaN(d.getTime()) ? null : d;
}

function normalizeNote(note) {
   if (!note) return null;
   const source = note.toObject ? note.toObject() : note;
   return {
      _id: source._id?.toString?.() || String(source._id || ''),
      type: source.type || 'note',
      tone: source.tone || 'info',
      text: source.text || '',
      createdAt: source.createdAt ? new Date(source.createdAt).toISOString() : null,
   };
}

export const POST = async (req, { params }) => {
   try {
      await connectDB();

      const body = await req.json();
      const sessionUser = await getSessionUser();

      const property = await Property.findById(params.id);
      if (!property) return new Response('Not found', { status: 404 });

      // property.workHistory.unshift({
      //    type: body.type || 'note',
      //    text: body.text || '',
      // });

      const createdAt = parseDate(body.createdAt) || new Date();

      property.workHistory.unshift({
         type: VALID_TYPES.includes(body.type)
            ? body.type
            : 'note',
         tone: VALID_TONES.includes(body.tone)
            ? body.tone
            : 'info',
         text: body.text || '',
         createdAt,
      });

      await property.save();
      const note = normalizeNote(property.workHistory[0]);

      await logActivity({
         entityType: 'property',
         entityId: property._id,
         action: 'created',
         source: 'manual',
         title: property.title || property.location_text || 'Обʼєкт',
         message: 'Додано запис в історію роботи',
         after: note,
         meta: {
            pageName: 'Обʼєкти',
            pagePath: '/crm/objects3',
            targetEntityType: 'property',
            workHistoryNoteId: note?._id || '',
         },
         sessionUser,
      });

      return Response.json({ ok: true, item: note });
   } catch (e) {
      console.log(e);
      return new Response('Error', { status: 500 });
   }
};

export const PATCH = async (req, { params }) => {
   try {
      await connectDB();

      const body = await req.json();
      const sessionUser = await getSessionUser();
      const noteId = String(body.noteId || body._id || '').trim();

      const property = await Property.findById(params.id);
      if (!property) return new Response('Not found', { status: 404 });

      const note = property.workHistory.id(noteId);
      if (!note) return new Response('Note not found', { status: 404 });

      const before = normalizeNote(note);
      const nextCreatedAt = parseDate(body.createdAt);

      note.type = VALID_TYPES.includes(body.type) ? body.type : note.type || 'note';
      note.tone = VALID_TONES.includes(body.tone) ? body.tone : note.tone || 'info';
      note.text = body.text || '';
      if (nextCreatedAt) note.createdAt = nextCreatedAt;

      await property.save();

      const after = normalizeNote(note);
      const diff = buildActivityDiff(before, after, WORK_HISTORY_FIELDS);

      await logActivity({
         entityType: 'property',
         entityId: property._id,
         action: 'updated',
         source: 'manual',
         title: property.title || property.location_text || 'Обʼєкт',
         message: 'Оновлено запис в історії роботи',
         before,
         after,
         diff,
         meta: {
            pageName: 'Обʼєкти',
            pagePath: '/crm/objects3',
            targetEntityType: 'property',
            workHistoryNoteId: noteId,
         },
         sessionUser,
      });

      return Response.json({ ok: true, item: after });
   } catch (e) {
      console.log(e);
      return new Response('Error', { status: 500 });
   }
};

export const DELETE = async (req, { params }) => {
   try {
      await connectDB();

      const body = await req.json().catch(() => ({}));
      const sessionUser = await getSessionUser();
      const noteId = String(body.noteId || body._id || '').trim();

      const property = await Property.findById(params.id);
      if (!property) return new Response('Not found', { status: 404 });

      const note = property.workHistory.id(noteId);
      if (!note) return new Response('Note not found', { status: 404 });

      const before = normalizeNote(note);
      note.deleteOne();
      await property.save();

      await logActivity({
         entityType: 'property',
         entityId: property._id,
         action: 'deleted',
         source: 'manual',
         title: property.title || property.location_text || 'Обʼєкт',
         message: 'Видалено запис з історії роботи',
         before,
         meta: {
            pageName: 'Обʼєкти',
            pagePath: '/crm/objects3',
            targetEntityType: 'property',
            workHistoryNoteId: noteId,
         },
         sessionUser,
      });

      return Response.json({ ok: true });
   } catch (e) {
      console.log(e);
      return new Response('Error', { status: 500 });
   }
};
