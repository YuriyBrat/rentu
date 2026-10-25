import Navodka from '@/models/Navodka';
import { navodkaActor, navodkaJson, navodkaFailure, navodkaRequestBody, checkNavodkaAssignment, checkNavodkaOrigin } from '@/utils/crm/navodkaAccess';
import { navodkaPermissions, serializeNavodka, validateNavodkaBody, navodkaError, NAVODKA_EMPLOYEE_FIELDS } from '@/utils/crm/navodky.mjs';

export const dynamic = 'force-dynamic';
function validId(id) { if (!/^[a-f\d]{24}$/i.test(id || '')) throw navodkaError('Некоректний ID наводки.'); }
const populate = query => query.populate('assignedTo', NAVODKA_EMPLOYEE_FIELDS).populate('createdBy', NAVODKA_EMPLOYEE_FIELDS).populate('notes.createdBy', NAVODKA_EMPLOYEE_FIELDS);

export async function GET(_, { params }) {
  try {
    const actor = await navodkaActor();
    validId(params.id);
    const item = await populate(Navodka.findById(params.id)).lean();
    if (!item) return navodkaJson({ error: 'Наводку не знайдено.' }, 404);
    return navodkaJson(serializeNavodka(item, actor.user, actor.scopeIds));
  } catch (error) { return navodkaFailure(error); }
}

export async function PATCH(request, { params }) {
  try {
    const actor = await navodkaActor(true);
    validId(params.id);
    const item = await Navodka.findById(params.id);
    if (!item) return navodkaJson({ error: 'Наводку не знайдено.' }, 404);
    if (!navodkaPermissions(actor.user, actor.scopeIds, item).canEdit) return navodkaJson({ error: 'Редагування доступне вашій команді та адміністратору.' }, 403);
    const payload = validateNavodkaBody(await navodkaRequestBody(request), { partial: true });
    if ('assignedTo' in payload && String(payload.assignedTo || '') !== String(item.assignedTo || '')) await checkNavodkaAssignment(actor, payload.assignedTo);
    const { newNote, ...update } = payload;
    let noteUpdate = {};
    if (newNote) {
      noteUpdate = { $push: { notes: { ...newNote, createdBy: actor.user.employeeId || null, createdAt: new Date() } } };
      if (['call', 'message', 'meeting'].includes(newNote.activityType) && newNote.contactDate) update.lastContactAt = newNote.contactDate;
      if (newNote.nextContactAt) update.nextContactAt = newNote.nextContactAt;
    }
    const updated = await populate(Navodka.findOneAndUpdate(
      { _id: item._id, assignedTo: item.assignedTo || null, createdBy: item.createdBy || null },
      { $set: update, ...noteUpdate }, { new: true, runValidators: true },
    )).lean();
    if (!updated) return navodkaJson({ error: 'Відповідальний змінився. Оновіть список і спробуйте ще раз.' }, 409);
    return navodkaJson(serializeNavodka(updated, actor.user, actor.scopeIds));
  } catch (error) { return navodkaFailure(error); }
}

export async function DELETE(request, { params }) {
  try {
    const actor = await navodkaActor(true);
    validId(params.id);
    checkNavodkaOrigin(request);
    const item = await Navodka.findById(params.id).select('assignedTo createdBy');
    if (!item) return navodkaJson({ error: 'Наводку не знайдено.' }, 404);
    if (!navodkaPermissions(actor.user, actor.scopeIds, item).canDelete) return navodkaJson({ error: 'У вас немає доступу до видалення цієї наводки.' }, 403);
    const result = await Navodka.deleteOne({ _id: item._id, assignedTo: item.assignedTo || null, createdBy: item.createdBy || null });
    if (!result.deletedCount) return navodkaJson({ error: 'Наводка змінилася. Оновіть список і спробуйте ще раз.' }, 409);
    return navodkaJson({ success: true });
  } catch (error) { return navodkaFailure(error); }
}
