import { buildPropertyFormData } from './propertyFormData';

export async function createProperty(payload) {
   const fd = buildPropertyFormData(payload);

   const res = await fetch('/api/crm/properties', {
      method: 'POST',
      body: fd,
   });

   if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Помилка створення обʼєкта');
   }

   return res.json();
}

export async function updateProperty(id, payload) {
   const fd = buildPropertyFormData(payload);

   const res = await fetch(`/api/crm/properties/${id}`, {
      method: 'PATCH',
      body: fd,
   });

   if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Помилка оновлення обʼєкта');
   }

   return res.json();
}